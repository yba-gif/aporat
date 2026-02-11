const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const baseUrl = Deno.env.get('SOCIAL_ANALYZER_URL');
    const apiKey = Deno.env.get('SOCIAL_ANALYZER_API_KEY');

    if (!baseUrl || !apiKey) {
      return new Response(
        JSON.stringify({ error: 'Social Analyzer not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { username } = await req.json();

    if (!username) {
      return new Response(
        JSON.stringify({ error: 'username is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanUsername = username.replace(/^@/, '').trim();
    console.log('Social Analyzer lookup for:', cleanUsername);

    // If baseUrl already ends with /analyze, don't append it again
    const normalizedUrl = baseUrl.replace(/\/$/, '');
    const url = normalizedUrl.endsWith('/analyze')
      ? `${normalizedUrl}?username=${encodeURIComponent(cleanUsername)}`
      : `${normalizedUrl}/analyze?username=${encodeURIComponent(cleanUsername)}`;

    const response = await fetch(url, {
      headers: { 'x-api-key': apiKey },
      signal: AbortSignal.timeout(180000), // 3 min timeout
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Social Analyzer API error:', response.status, errText);
      return new Response(
        JSON.stringify({ error: `Social Analyzer error: ${response.status}`, details: errText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();

    // Parse and structure the results
    const detected = data.detected || [];
    const totalFound = detected.length;

    const platforms = detected.map((d: any) => ({
      platform: d.link ? new URL(d.link).hostname.replace('www.', '') : 'unknown',
      link: d.link || '',
      title: d.title || '',
      username: d.username || cleanUsername,
      country: d.country || 'unavailable',
      language: d.language || 'unavailable',
      type: d.type || 'unavailable',
      text: (d.text || '').substring(0, 500),
    }));

    // Extract risk indicators from detected profiles
    const riskIndicators: string[] = [];

    const adultPlatforms = platforms.filter((p: any) => 
      p.type?.toLowerCase().includes('adult')
    );
    if (adultPlatforms.length > 0) {
      riskIndicators.push(`Found on ${adultPlatforms.length} adult platform(s): ${adultPlatforms.map((p: any) => p.platform).join(', ')}`);
    }

    const countries = [...new Set(platforms.map((p: any) => p.country).filter((c: string) => c !== 'unavailable'))];
    if (countries.length > 3) {
      riskIndicators.push(`Digital footprint spans ${countries.length} countries: ${countries.join(', ')}`);
    }

    if (totalFound > 50) {
      riskIndicators.push(`Extensive online presence: ${totalFound} platforms detected`);
    } else if (totalFound < 3) {
      riskIndicators.push(`Minimal online presence: only ${totalFound} platform(s) detected — possible fake identity`);
    }

    return new Response(
      JSON.stringify({
        username: cleanUsername,
        totalPlatforms: totalFound,
        platforms,
        riskIndicators,
        countries,
        scannedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('social-analyzer error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
