import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) {
      throw new Error("PERPLEXITY_API_KEY is not configured");
    }

    const { entityName, entityType, socialHandles } = await req.json();

    // Build targeted search queries for OSINT
    const queries = [
      `"${entityName}" visa fraud OR immigration fraud OR document fraud`,
      `"${entityName}" ${entityType === 'agency_owner' ? 'visa agency' : 'visa application'} suspicious OR flagged OR investigation`,
    ];

    // Add social handle searches
    if (socialHandles && socialHandles.length > 0) {
      const handles = socialHandles.slice(0, 2).join(" OR ");
      queries.push(`${handles} fraud OR scam OR fake`);
    }

    const results = [];

    for (const query of queries) {
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [
            {
              role: "system",
              content:
                "You are an OSINT analyst. Search for any publicly available information about this entity related to visa fraud, immigration fraud, document forgery, or suspicious activities. Be factual and cite sources. If no relevant information is found, say so clearly.",
            },
            { role: "user", content: query },
          ],
          search_recency_filter: "year",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Perplexity API error:", response.status, errorText);
        if (response.status === 429) {
          results.push({
            query,
            content: "Rate limited — try again later",
            citations: [],
          });
          continue;
        }
        continue;
      }

      const data = await response.json();
      results.push({
        query,
        content: data.choices?.[0]?.message?.content || "No results",
        citations: data.citations || [],
      });
    }

    return new Response(
      JSON.stringify({
        entity: entityName,
        results,
        searchedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("perplexity-osint error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
