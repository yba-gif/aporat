const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface InstagramIntel {
  profile: {
    handle: string;
    fullName: string | null;
    bio: string | null;
    followers: number | null;
    following: number | null;
    posts: number | null;
    isVerified: boolean;
    isPrivate: boolean;
    externalUrl: string | null;
  };
  riskIndicators: string[];
  webMentions: Array<{ title: string; url: string; snippet: string }>;
  scrapedAt: string;
}

function analyzeSearchResults(results: any[], handle: string): InstagramIntel {
  const riskIndicators: string[] = [];
  const webMentions: Array<{ title: string; url: string; snippet: string }> = [];

  let followers: number | null = null;
  let following: number | null = null;
  let posts: number | null = null;
  let bio: string | null = null;
  let fullName: string | null = null;
  let isVerified = false;
  let isPrivate = false;
  let externalUrl: string | null = null;

  const allText = results.map(r => `${r.title || ''} ${r.description || ''} ${r.markdown || ''}`).join(' ');
  const lowerText = allText.toLowerCase();

  // Extract metrics from search results
  const followersMatch = allText.match(/(\d[\d,.]*[KkMm]?)\s*(?:followers|takipçi)/i);
  const followingMatch = allText.match(/(\d[\d,.]*[KkMm]?)\s*(?:following|takip\s+edilen)/i);
  const postsMatch = allText.match(/(\d[\d,.]*[KkMm]?)\s*(?:posts|gönderi)/i);

  const parseCount = (str: string): number | null => {
    if (!str) return null;
    let num = str.replace(/,/g, '');
    if (/[Kk]$/.test(num)) return Math.round(parseFloat(num) * 1000);
    if (/[Mm]$/.test(num)) return Math.round(parseFloat(num) * 1000000);
    return parseInt(num) || null;
  };

  followers = followersMatch ? parseCount(followersMatch[1]) : null;
  following = followingMatch ? parseCount(followingMatch[1]) : null;
  posts = postsMatch ? parseCount(postsMatch[1]) : null;

  // Check for verification
  isVerified = /verified|✓|doğrulanmış/i.test(allText);
  isPrivate = /private account|gizli hesap|this account is private/i.test(allText);

  // Risk analysis
  if (followers !== null && following !== null && following > 0 && followers / following < 0.1) {
    riskIndicators.push(`Low follower-to-following ratio (${followers}:${following}) — potential fake or bot account`);
  }
  if (followers !== null && followers > 10000 && posts !== null && posts < 5) {
    riskIndicators.push(`High followers (${followers}) but very few posts (${posts}) — suspicious growth pattern`);
  }
  if (isPrivate) {
    riskIndicators.push('Account is private — limiting OSINT visibility');
  }

  // Check for suspicious keywords
  const suspiciousKeywords = ['visa', 'immigration', 'consultancy', 'guarantee', 'vize', 'danışmanlık', 'agent', 'facilitator', 'fake', 'scam', 'fraud'];
  const foundKeywords = suspiciousKeywords.filter(kw => lowerText.includes(kw));
  if (foundKeywords.length > 0) {
    riskIndicators.push(`Web mentions contain keywords: ${foundKeywords.join(', ')}`);
  }

  // Check for negative mentions
  const negativePatterns = ['scam', 'fraud', 'fake', 'dolandırıcı', 'sahte', 'complaint', 'şikayet', 'warning', 'uyarı'];
  const negativeHits = negativePatterns.filter(p => lowerText.includes(p));
  if (negativeHits.length > 0) {
    riskIndicators.push(`Negative web mentions detected: ${negativeHits.join(', ')}`);
  }

  // Collect web mentions
  results.forEach(r => {
    if (r.title || r.url) {
      webMentions.push({
        title: r.title || 'Untitled',
        url: r.url || '',
        snippet: (r.description || '').substring(0, 300),
      });
    }
  });

  // Extract bio/name from first result that looks like an Instagram listing
  const igResult = results.find(r => (r.url || '').includes('instagram.com'));
  if (igResult) {
    fullName = igResult.title?.replace(/ \(@.*?\).*$/i, '').replace(/ • Instagram.*$/i, '').trim() || null;
    bio = igResult.description?.substring(0, 500) || null;
  }

  return {
    profile: {
      handle: handle.replace('@', ''),
      fullName,
      bio,
      followers,
      following,
      posts,
      isVerified,
      isPrivate,
      externalUrl,
    },
    riskIndicators,
    webMentions,
    scrapedAt: new Date().toISOString(),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { handle } = await req.json();

    if (!handle) {
      return new Response(
        JSON.stringify({ error: 'Instagram handle is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanHandle = handle.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '');

    console.log('Searching Instagram intel for:', cleanHandle);

    // Use Firecrawl search to find Instagram profile information from the web
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `"${cleanHandle}" instagram site:instagram.com OR site:socialblade.com OR site:instastatistics.com`,
        limit: 10,
        scrapeOptions: { formats: ['markdown'] },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl search error:', data);
      return new Response(
        JSON.stringify({ error: data.error || `Search failed with status ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = data.data || data.results || [];

    // Also search for negative mentions / risk signals
    const riskResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `"${cleanHandle}" (scam OR fraud OR fake OR complaint OR warning OR visa OR immigration)`,
        limit: 5,
      }),
    });

    let riskResults: any[] = [];
    if (riskResponse.ok) {
      const riskData = await riskResponse.json();
      riskResults = riskData.data || riskData.results || [];
    }

    const allResults = [...results, ...riskResults];

    if (allResults.length === 0) {
      return new Response(
        JSON.stringify({
          profile: { handle: cleanHandle, isPrivate: false },
          riskIndicators: ['No web footprint found for this Instagram handle — may be new, deleted, or misspelled'],
          webMentions: [],
          scrapedAt: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${allResults.length} results for @${cleanHandle}`);
    const intel = analyzeSearchResults(allResults, cleanHandle);

    return new Response(
      JSON.stringify(intel),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Instagram OSINT error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
