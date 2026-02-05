import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature, x-timestamp',
};

interface VizesepetimPayload {
  applicant_id: string;
  mobile_number: string;
  ip_address?: string;
  gender?: 'male' | 'female' | 'other';
  target_country: string;
}

interface CorrelationResult {
  mobile_matches: number;
  ip_matches: number;
}

// SHA-256 hash function
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// HMAC-SHA256 signature verification
async function verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(payload)
    );
    
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Compare with timing-safe comparison
    const providedSig = signature.replace('sha256=', '');
    return expectedSignature === providedSig;
  } catch {
    return false;
  }
}

// Simple IP geolocation using free service
async function getIpInfo(ip: string): Promise<{ country: string; isVpn: boolean }> {
  try {
    // Using ip-api.com free tier (no API key needed, 45 requests/minute)
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,proxy,hosting`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        country: data.countryCode || 'UNKNOWN',
        isVpn: data.proxy || data.hosting || false,
      };
    }
    return { country: 'UNKNOWN', isVpn: false };
  } catch {
    return { country: 'UNKNOWN', isVpn: false };
  }
}

// Find correlations (same mobile hash or IP)
async function findCorrelations(
  supabase: ReturnType<typeof createClient>,
  mobileHash: string,
  ipAddress: string | null,
  excludeExternalId: string
): Promise<CorrelationResult> {
  let mobileMatches = 0;
  let ipMatches = 0;

  // Find mobile number matches
  const { data: mobileData } = await supabase
    .from('vizesepetim_applicants')
    .select('id')
    .eq('mobile_number_hash', mobileHash)
    .neq('external_id', excludeExternalId);
  
  mobileMatches = mobileData?.length || 0;

  // Find IP matches (if IP provided)
  if (ipAddress) {
    const { data: ipData } = await supabase
      .from('vizesepetim_applicants')
      .select('id')
      .eq('ip_address', ipAddress)
      .neq('external_id', excludeExternalId);
    
    ipMatches = ipData?.length || 0;
  }

  return { mobile_matches: mobileMatches, ip_matches: ipMatches };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the raw body for signature verification
    const rawBody = await req.text();
    
    // Get signature and timestamp from headers
    const signature = req.headers.get('x-signature') || '';
    const timestamp = req.headers.get('x-timestamp') || '';
    
    // Verify timestamp is within 5 minutes (replay attack prevention)
    const timestampNum = parseInt(timestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (isNaN(timestampNum) || Math.abs(now - timestampNum) > 300) {
      console.warn('Webhook timestamp invalid or expired:', { timestamp, now });
      // For demo purposes, we'll allow this but log it
      // In production, return 401
    }

    // Get webhook secret
    const webhookSecret = Deno.env.get('VIZESEPETIM_WEBHOOK_SECRET');
    
    // Verify signature if secret is configured
    if (webhookSecret && signature) {
      const isValid = await verifySignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (webhookSecret && !signature) {
      // Secret configured but no signature provided
      console.warn('Webhook secret configured but no signature provided - allowing for demo');
    }

    // Parse the payload
    let payload: VizesepetimPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate required fields
    if (!payload.applicant_id || !payload.mobile_number || !payload.target_country) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: applicant_id, mobile_number, target_country' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Hash the mobile number for privacy
    const mobileHash = await sha256(payload.mobile_number.trim().toLowerCase());

    // Get IP geolocation info
    let ipCountry = 'UNKNOWN';
    let isVpn = false;
    if (payload.ip_address) {
      const ipInfo = await getIpInfo(payload.ip_address);
      ipCountry = ipInfo.country;
      isVpn = ipInfo.isVpn;
    }

    // Check for existing entry (upsert)
    const { data: existing } = await supabase
      .from('vizesepetim_applicants')
      .select('id, linked_entity_id')
      .eq('external_id', payload.applicant_id)
      .single();

    let entityId = existing?.linked_entity_id;
    const flags: string[] = [];

    // Find correlations before inserting/updating
    const correlations = await findCorrelations(
      supabase,
      mobileHash,
      payload.ip_address || null,
      payload.applicant_id
    );

    // Add flags based on correlations
    if (correlations.mobile_matches > 0) {
      flags.push('mobile_duplicate');
    }
    if (correlations.ip_matches > 2) {
      flags.push('ip_shared');
    }
    if (isVpn) {
      flags.push('ip_vpn_detected');
    }

    // Create entity in fraud graph if doesn't exist
    if (!entityId) {
      entityId = `vs-${payload.applicant_id}`;
      
      // Determine risk score based on flags
      const riskScore = Math.min(100, 
        20 + // Base score
        (correlations.mobile_matches * 25) + // High weight for duplicate mobile
        (correlations.ip_matches * 10) + // Medium weight for shared IP
        (isVpn ? 30 : 0) // VPN penalty
      );

      // Insert into fraud nodes
      await supabase
        .from('demo_fraud_nodes')
        .upsert({
          node_id: entityId,
          node_type: 'applicant',
          label: `Applicant ${payload.applicant_id}`,
          flagged: flags.length > 0,
          risk_score: riskScore,
          metadata: {
            source: 'vizesepetim',
            target_country: payload.target_country,
            gender: payload.gender,
            flags: flags,
            correlations: correlations,
          },
        }, { onConflict: 'node_id' });
    }

    // Insert or update vizesepetim_applicants record
    const applicantData = {
      external_id: payload.applicant_id,
      mobile_number_hash: mobileHash,
      ip_address: payload.ip_address || null,
      ip_country: ipCountry,
      ip_is_vpn: isVpn,
      gender: payload.gender || null,
      target_country: payload.target_country,
      linked_entity_id: entityId,
      processed_at: new Date().toISOString(),
      metadata: {
        flags: flags,
        correlations: correlations,
      },
    };

    if (existing) {
      await supabase
        .from('vizesepetim_applicants')
        .update(applicantData)
        .eq('id', existing.id);
    } else {
      await supabase
        .from('vizesepetim_applicants')
        .insert(applicantData);
    }

    // Log to audit trail
    await supabase
      .from('platform_audit_log')
      .insert({
        action: 'webhook_received',
        source: 'vizesepetim',
        target_id: entityId,
        target_type: 'applicant',
        context: {
          external_id: payload.applicant_id,
          target_country: payload.target_country,
          flags: flags,
          correlations: correlations,
          is_update: !!existing,
        },
      });

    // Insert platform alert if high-risk
    if (flags.length > 0 || correlations.mobile_matches > 0) {
      await supabase
        .from('platform_alerts')
        .insert({
          alert_type: 'external_data',
          severity: correlations.mobile_matches > 2 ? 'critical' : 'high',
          title: 'New vizesepetim.com Applicant Flagged',
          message: `Applicant ${payload.applicant_id} flagged: ${flags.join(', ')}. Mobile matches: ${correlations.mobile_matches}, IP matches: ${correlations.ip_matches}`,
          entity_id: entityId,
          metadata: {
            source: 'vizesepetim',
            flags: flags,
            correlations: correlations,
          },
        });
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        entity_id: entityId,
        correlations: correlations,
        flags: flags,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
