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

    const { usernames, emails, subjectName } = await req.json();

    if ((!usernames || usernames.length === 0) && (!emails || emails.length === 0)) {
      return new Response(
        JSON.stringify({ success: false, error: "No usernames or emails provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build search identifiers
    const identifiers: string[] = [];
    if (emails?.length) identifiers.push(...emails.slice(0, 3));
    if (usernames?.length) identifiers.push(...usernames.slice(0, 5));
    if (subjectName) identifiers.push(subjectName);

    const searchTerms = identifiers.map(id => `"${id}"`).join(" OR ");

    // Query 1: Data breach search
    const breachQuery = `${searchTerms} data breach OR leaked OR exposed OR hack OR pwned OR databreach OR credential leak`;
    
    // Query 2: Paste / dark web exposure
    const pasteQuery = `${searchTerms} pastebin OR paste OR dump OR dark web OR credential dump OR combolist`;

    const results: any[] = [];

    for (const query of [breachQuery, pasteQuery]) {
      try {
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
                content: `You are a cybersecurity breach analyst. Search for any known data breaches, credential leaks, paste dumps, or dark web exposures associated with the provided identifiers (usernames, emails, or names). 

For each breach found, provide:
- Breach name/source
- Date (if known)
- Type of data exposed (emails, passwords, personal info, etc.)
- Severity (critical/high/medium/low)

Be factual. Only report confirmed or widely reported breaches. If no breaches are found, say "No known breaches found" clearly. Do NOT fabricate breaches.`,
              },
              { role: "user", content: query },
            ],
            search_recency_filter: "year",
          }),
        });

        if (!response.ok) {
          console.error("Perplexity breach search error:", response.status);
          if (response.status === 429) {
            results.push({ query: query.slice(0, 50), content: "Rate limited", citations: [] });
            continue;
          }
          continue;
        }

        const data = await response.json();
        results.push({
          query: query.slice(0, 50) + "...",
          content: data.choices?.[0]?.message?.content || "No results",
          citations: data.citations || [],
        });
      } catch (err) {
        console.error("Breach query failed:", err);
      }
    }

    // Use AI to synthesize findings into structured output
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let structured: any = null;

    if (LOVABLE_API_KEY && results.length > 0) {
      try {
        const combinedFindings = results.map(r => r.content).join("\n\n---\n\n");

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: `You analyze breach search results and produce structured intelligence. Extract confirmed breaches only. Do not fabricate.`,
              },
              {
                role: "user",
                content: `Analyze these breach search results for identifiers: ${identifiers.join(", ")}\n\n${combinedFindings}`,
              },
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "report_breaches",
                  description: "Report structured breach findings",
                  parameters: {
                    type: "object",
                    properties: {
                      breachesFound: { type: "boolean", description: "Were any breaches found?" },
                      totalBreaches: { type: "number" },
                      breaches: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string", description: "Breach name (e.g. LinkedIn 2021)" },
                            date: { type: "string", description: "Breach date or year" },
                            dataExposed: {
                              type: "array",
                              items: { type: "string" },
                              description: "Types of data exposed",
                            },
                            severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
                            description: { type: "string", description: "Brief description" },
                            affectedIdentifier: { type: "string", description: "Which username/email was affected" },
                          },
                          required: ["name", "severity", "description"],
                        },
                      },
                      riskSummary: { type: "string", description: "Overall risk assessment" },
                      recommendations: {
                        type: "array",
                        items: { type: "string" },
                        description: "Security recommendations",
                      },
                    },
                    required: ["breachesFound", "totalBreaches", "breaches", "riskSummary"],
                  },
                },
              },
            ],
            tool_choice: { type: "function", function: { name: "report_breaches" } },
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
          if (toolCall?.function?.arguments) {
            structured = JSON.parse(toolCall.function.arguments);
          }
        }
      } catch (err) {
        console.error("AI synthesis failed:", err);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        identifiersChecked: identifiers,
        rawResults: results,
        ...(structured || { breachesFound: false, totalBreaches: 0, breaches: [], riskSummary: "Analysis unavailable" }),
        searchedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("breach-osint error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
