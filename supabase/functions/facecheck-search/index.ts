import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const FACECHECK_API_TOKEN = Deno.env.get('FACECHECK_API_TOKEN');
  if (!FACECHECK_API_TOKEN) {
    return new Response(JSON.stringify({ error: 'FACECHECK_API_TOKEN not configured' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const FACECHECK_API = 'https://facecheck.id/api';

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // Step 1: Upload image
    if (action === 'upload') {
      const formData = await req.formData();
      const imageFile = formData.get('image') as File;
      if (!imageFile) {
        return new Response(JSON.stringify({ error: 'No image file provided' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const uploadForm = new FormData();
      uploadForm.append('images', imageFile, imageFile.name);
      uploadForm.append('id_search', '');

      const uploadRes = await fetch(`${FACECHECK_API}/upload_pic`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': FACECHECK_API_TOKEN,
        },
        body: uploadForm,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || uploadData.error) {
        return new Response(JSON.stringify({ error: uploadData.error || 'Upload failed' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ id_search: uploadData.id_search }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 2: Run search
    if (action === 'search') {
      const body = await req.json();
      const { id_search, testing = true } = body;

      if (!id_search) {
        return new Response(JSON.stringify({ error: 'id_search required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const searchRes = await fetch(`${FACECHECK_API}/search`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'Authorization': FACECHECK_API_TOKEN,
        },
        body: JSON.stringify({
          id_search,
          testing,
          wait_for_results: false,
        }),
      });

      const searchData = await searchRes.text();
      return new Response(searchData, {
        status: searchRes.status,
        headers: {
          ...corsHeaders,
          'Content-Type': searchRes.headers.get('content-type') ?? 'application/json',
        },
      });
    }

    // Step 3: Check status / get results (same endpoint, status_only)
    if (action === 'status') {
      const body = await req.json();
      const { id_search, testing = true } = body;

      if (!id_search) {
        return new Response(JSON.stringify({ error: 'id_search required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const statusRes = await fetch(`${FACECHECK_API}/search`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'Authorization': FACECHECK_API_TOKEN,
        },
        body: JSON.stringify({
          id_search,
          with_progress: true,
          id_captcha: '',
          status_only: true,
          testing,
        }),
      });

      const statusData = await statusRes.text();
      return new Response(statusData, {
        status: statusRes.status,
        headers: {
          ...corsHeaders,
          'Content-Type': statusRes.headers.get('content-type') ?? 'application/json',
        },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action. Use: upload, search, status' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('FaceCheck error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
