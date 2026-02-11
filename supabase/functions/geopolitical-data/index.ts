const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ConflictEvent {
  country: string;
  region: string;
  eventType: string;
  fatalities: number;
  date: string;
  source: string;
}

interface CountryRisk {
  country: string;
  conflictEvents: number;
  fatalities: number;
  instabilityScore: number;
  trend: 'rising' | 'stable' | 'declining';
  lastUpdated: string;
}

// Fetch ACLED conflict data (free public API)
async function fetchACLED(country?: string): Promise<ConflictEvent[]> {
  try {
    const params = new URLSearchParams({
      limit: '100',
      order: 'desc',
      sort: 'event_date',
    });
    if (country) {
      params.set('country', country);
    }
    // ACLED public read-only export endpoint (no key required for basic access)
    const url = `https://api.acleddata.com/acled/read?${params.toString()}&terms=accept`;
    console.log('Fetching ACLED data:', url);

    const response = await fetch(url);
    if (!response.ok) {
      console.error('ACLED API error:', response.status);
      return [];
    }

    const data = await response.json();
    const events = data.data || [];

    return events.map((e: any) => ({
      country: e.country || 'Unknown',
      region: e.admin1 || e.region || 'Unknown',
      eventType: e.event_type || e.sub_event_type || 'Unknown',
      fatalities: parseInt(e.fatalities) || 0,
      date: e.event_date || '',
      source: 'ACLED',
    }));
  } catch (err) {
    console.error('ACLED fetch error:', err);
    return [];
  }
}

// Fetch GDELT event data (fully public API)
async function fetchGDELT(country?: string): Promise<ConflictEvent[]> {
  try {
    // GDELT GKG/Events API — use the DOC API for conflict-related articles
    const query = country
      ? `${country} (conflict OR violence OR protest OR military)`
      : 'conflict violence protest military';
    
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=ArtList&maxrecords=50&format=json&sort=DateDesc`;
    console.log('Fetching GDELT data');

    const response = await fetch(url);
    if (!response.ok) {
      console.error('GDELT API error:', response.status);
      return [];
    }

    const data = await response.json();
    const articles = data.articles || [];

    return articles.slice(0, 30).map((a: any) => ({
      country: a.sourcecountry || extractCountryFromDomain(a.domain) || 'Global',
      region: a.sourcelanguage || '',
      eventType: categorizeGDELTArticle(a.title || ''),
      fatalities: 0, // GDELT articles don't have fatality counts
      date: a.seendate ? formatGDELTDate(a.seendate) : '',
      source: 'GDELT',
    }));
  } catch (err) {
    console.error('GDELT fetch error:', err);
    return [];
  }
}

function extractCountryFromDomain(domain: string): string {
  if (!domain) return '';
  const tld = domain.split('.').pop()?.toLowerCase();
  const tldMap: Record<string, string> = {
    tr: 'Turkey', ir: 'Iran', iq: 'Iraq', sy: 'Syria', ua: 'Ukraine',
    ru: 'Russia', cn: 'China', pk: 'Pakistan', af: 'Afghanistan',
    eg: 'Egypt', ly: 'Libya', ye: 'Yemen', sd: 'Sudan', so: 'Somalia',
  };
  return tldMap[tld || ''] || '';
}

function categorizeGDELTArticle(title: string): string {
  const lower = title.toLowerCase();
  if (/explos|bomb|attack|strike|shell/i.test(lower)) return 'Armed Conflict';
  if (/protest|demonstrat|rally|unrest/i.test(lower)) return 'Protest';
  if (/military|troops|army|deploy/i.test(lower)) return 'Military Activity';
  if (/sanction|embargo|restrict/i.test(lower)) return 'Sanctions';
  if (/refugee|migra|displac/i.test(lower)) return 'Displacement';
  if (/terror|extremis|insurg/i.test(lower)) return 'Terrorism';
  return 'Geopolitical Event';
}

function formatGDELTDate(dateStr: string): string {
  // GDELT dates are like "20260210T120000Z"
  if (dateStr.length >= 8) {
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  }
  return dateStr;
}

// Compute country risk scores from conflict events
function computeCountryRisks(events: ConflictEvent[]): CountryRisk[] {
  const countryMap: Record<string, { events: number; fatalities: number }> = {};

  for (const e of events) {
    if (!e.country || e.country === 'Unknown' || e.country === 'Global') continue;
    if (!countryMap[e.country]) {
      countryMap[e.country] = { events: 0, fatalities: 0 };
    }
    countryMap[e.country].events++;
    countryMap[e.country].fatalities += e.fatalities;
  }

  const risks: CountryRisk[] = Object.entries(countryMap)
    .map(([country, stats]) => {
      // Simple instability score: weighted combination of event count and fatalities
      const eventScore = Math.min(stats.events * 2, 60);
      const fatalityScore = Math.min(stats.fatalities * 0.5, 40);
      const instabilityScore = Math.round(Math.min(eventScore + fatalityScore, 100));

      return {
        country,
        conflictEvents: stats.events,
        fatalities: stats.fatalities,
        instabilityScore,
        trend: instabilityScore > 70 ? 'rising' as const : instabilityScore > 40 ? 'stable' as const : 'declining' as const,
        lastUpdated: new Date().toISOString(),
      };
    })
    .sort((a, b) => b.instabilityScore - a.instabilityScore)
    .slice(0, 20);

  return risks;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { country, sources } = await req.json();
    const requestedSources = sources || ['acled', 'gdelt'];

    console.log('Geopolitical data request:', { country, sources: requestedSources });

    // Fetch from multiple sources in parallel
    const fetchPromises: Promise<ConflictEvent[]>[] = [];

    if (requestedSources.includes('acled')) {
      fetchPromises.push(fetchACLED(country));
    }
    if (requestedSources.includes('gdelt')) {
      fetchPromises.push(fetchGDELT(country));
    }

    const results = await Promise.all(fetchPromises);
    const allConflicts = results.flat();

    console.log(`Fetched ${allConflicts.length} total events`);

    // Compute country-level risk scores
    const countryRisks = computeCountryRisks(allConflicts);

    return new Response(
      JSON.stringify({
        conflicts: allConflicts,
        countryRisks,
        meta: {
          totalEvents: allConflicts.length,
          sources: requestedSources,
          fetchedAt: new Date().toISOString(),
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Geopolitical data error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
