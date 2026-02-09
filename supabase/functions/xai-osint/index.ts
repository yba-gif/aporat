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
    const XAI_API_KEY = Deno.env.get("XAI_API_KEY");
    if (!XAI_API_KEY) {
      throw new Error("XAI_API_KEY is not configured");
    }

    const { entityName, entityType, socialProfiles, connections, existingFindings } = await req.json();

    const profileSummary = (socialProfiles || [])
      .map((p: any) => `${p.platform}: ${p.handle} (${p.followers} followers, ${p.following} following, indicators: ${(p.riskIndicators || []).join("; ")})`)
      .join("\n");

    const connectionSummary = (connections || [])
      .map((c: any) => `${c.name} — ${c.relationship}, risk: ${c.riskScore}, flagged: ${c.flagged}`)
      .join("\n");

    const existingSummary = (existingFindings || [])
      .map((f: any) => `[${f.severity}] ${f.source} — ${f.detail}`)
      .join("\n");

    const systemPrompt = `You are a government OSINT analyst AI assistant working for a consular fraud detection unit. 
Your task is to analyze social media intelligence about visa applicants and their networks.
You produce structured intelligence assessments. Be specific, cite patterns, and flag anomalies.
Output valid JSON only. No markdown, no code fences.`;

    const userPrompt = `Analyze this entity for visa fraud risk indicators:

Entity: ${entityName} (${entityType})

Social Media Profiles:
${profileSummary || "No profiles available"}

Known Connections:
${connectionSummary || "No connections available"}

Existing OSINT Findings:
${existingSummary || "None"}

Return a JSON object with:
{
  "riskAssessment": "2-3 sentence overall risk assessment",
  "newFindings": [
    {
      "source": "platform name",
      "category": "category of finding",
      "detail": "specific detail about the finding",
      "severity": "critical|high|medium|low"
    }
  ],
  "recommendedActions": ["action1", "action2"],
  "confidence": 0.0-1.0
}`;

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${XAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-3-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("xAI API error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: `xAI API error: ${response.status}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse the JSON from the response
    let analysis;
    try {
      // Try to extract JSON if wrapped in code fences
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      analysis = JSON.parse(jsonMatch[1].trim());
    } catch {
      analysis = {
        riskAssessment: content,
        newFindings: [],
        recommendedActions: [],
        confidence: 0.5,
      };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("xai-osint error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
