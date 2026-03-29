import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { subjectName, totalMatches, bestScore, platforms, accounts, testingMode } = await req.json();

    const platformSummary = (platforms || [])
      .map((p: any) => `${p.platform}: ${p.count} matches (avg ${p.avgScore}% confidence)`)
      .join("\n");

    const accountSummary = (accounts || [])
      .slice(0, 20)
      .map((a: any) => `@${a.username} on ${a.platform} (${a.bestScore}% match, ${a.postCount} images)`)
      .join("\n");

    const highConfidence = (accounts || []).filter((a: any) => a.bestScore >= 80);
    const mediumConfidence = (accounts || []).filter((a: any) => a.bestScore >= 60 && a.bestScore < 80);

    const prompt = `You are a senior intelligence analyst writing a classified facial recognition intelligence report. The tone must be formal, precise, and decision-grade. No speculation beyond the data. Use short, authoritative sentences.

Subject: ${subjectName || "Unknown Subject"}
Total Matches: ${totalMatches}
Best Confidence Score: ${bestScore}%
Testing Mode: ${testingMode ? "Yes (demo data)" : "No (live data)"}

Platform Distribution:
${platformSummary || "No platform data available"}

Identified Accounts:
${accountSummary || "No accounts identified"}

High-confidence matches (>=80%): ${highConfidence.length}
Medium-confidence matches (60-79%): ${mediumConfidence.length}

Generate the following sections as JSON with these exact keys:
1. "executiveSummary" (3-4 sentences summarizing findings, threat level, and confidence)
2. "keyFindings" (array of 3-5 string items, each one sentence)
3. "riskAssessment" (2-3 sentences on OPSEC exposure risk level: LOW/MEDIUM/HIGH/CRITICAL)
4. "platformAnalysis" (2-3 sentences on what the platform distribution reveals about the subject)
5. "accountCorrelation" (2-3 sentences on patterns across identified accounts)
6. "recommendations" (array of 3-4 string items, each one actionable recommendation)
7. "confidenceNote" (1-2 sentences on data reliability and confidence levels)

Return ONLY valid JSON, no markdown.`;

    const aiRes = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      throw new Error(`AI API error: ${aiRes.status} - ${errText}`);
    }

    const aiData = await aiRes.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    
    let narrative;
    try {
      narrative = JSON.parse(content);
    } catch {
      narrative = {
        executiveSummary: "Unable to generate AI analysis. Raw data available in appendix.",
        keyFindings: ["Automated analysis unavailable"],
        riskAssessment: "Manual review required",
        platformAnalysis: "See platform breakdown in appendix",
        accountCorrelation: "See account listing in appendix",
        recommendations: ["Conduct manual review of all identified accounts"],
        confidenceNote: "AI analysis failed. Rely on raw confidence scores.",
      };
    }

    return new Response(JSON.stringify(narrative), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});