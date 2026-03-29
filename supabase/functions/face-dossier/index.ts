import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subjectName, platforms, accounts, totalMatches, bestScore } = await req.json();

    if (!subjectName && (!accounts || accounts.length === 0)) {
      return new Response(JSON.stringify({ error: "No subject data provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build high-confidence accounts summary
    const highConfAccounts = (accounts || [])
      .filter((a: any) => a.bestScore >= 75)
      .slice(0, 30);

    const accountList = highConfAccounts
      .map((a: any) => `- @${a.username} on ${a.platform} (${a.bestScore}% match) → ${a.profileUrl}`)
      .join("\n");

    const platformList = (platforms || [])
      .map((p: any) => `${p.platform}: ${p.count} matches, avg ${p.avgScore}% confidence`)
      .join("\n");

    const prompt = `You are a senior OSINT intelligence analyst. Based on facial recognition results, compile a comprehensive intelligence dossier on the identified subject. Cross-reference the discovered social media accounts and online presence to build a detailed profile.

SUBJECT: ${subjectName || "Unknown"}
TOTAL MATCHES: ${totalMatches || 0}
BEST CONFIDENCE: ${bestScore || 0}%

CONFIRMED PLATFORMS:
${platformList || "None"}

HIGH-CONFIDENCE ACCOUNTS:
${accountList || "None found"}

Generate a comprehensive intelligence dossier as JSON with these exact keys. Be analytical and specific — infer what you can from the platforms and usernames, but clearly mark inferences vs confirmed data:

1. "identity" - object with:
   - "fullName": string (confirmed or best guess)
   - "aliases": array of strings (all usernames/handles found)
   - "nameConfidence": "CONFIRMED" | "HIGH" | "MEDIUM" | "LOW"
   - "possibleAge": string or null (infer from context if possible)
   - "possibleLocation": string or null (infer from platform patterns, usernames, language clues)
   - "possibleNationality": string or null
   - "possibleOccupation": string or null (infer from LinkedIn, Crunchbase, etc.)

2. "digitalPresence" - object with:
   - "footprintSize": "MINIMAL" | "MODERATE" | "SIGNIFICANT" | "EXTENSIVE"
   - "primaryPlatforms": array of strings (top 3-5 most important platforms)
   - "professionalProfiles": array of objects with "platform", "url", "significance"
   - "socialProfiles": array of objects with "platform", "url", "significance"
   - "contentCreation": array of objects with "platform", "url", "type" (blog, video, etc.)

3. "professionalIntel" - object with:
   - "summary": string (2-3 sentences about professional background)
   - "organizations": array of strings (companies/orgs associated with)
   - "roles": array of strings (job titles if detectable)
   - "industry": string or null
   - "publicProfile": "LOW" | "MEDIUM" | "HIGH" | "PUBLIC_FIGURE"

4. "riskProfile" - object with:
   - "opsecLevel": "POOR" | "BASIC" | "MODERATE" | "STRONG"
   - "exposureLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
   - "vulnerabilities": array of strings (3-5 specific OPSEC weaknesses)
   - "dataLeakRisk": string (1-2 sentences)

5. "connections" - object with:
   - "inferredNetwork": array of strings (people/orgs they may be connected to based on platforms)
   - "geographicTies": array of strings (locations linked to this person)
   - "languageIndicators": array of strings (languages detected from platform usage)

6. "timeline" - array of objects with "date" (approximate or "Unknown"), "event", "source" — key moments in digital history

7. "actionableIntel" - object with:
   - "keyInsights": array of 3-5 strings (most important takeaways)
   - "investigationLeads": array of 3-5 strings (specific next steps an analyst should take)
   - "monitoringRecommendations": array of 2-3 strings

8. "confidenceAssessment" - object with:
   - "overallConfidence": "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH"
   - "limitations": array of strings (what we couldn't determine and why)
   - "dataQuality": string (1-2 sentences assessing reliability)

Return ONLY valid JSON, no markdown.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
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
      console.error("AI error:", aiRes.status, errText);
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Add funds in Settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${aiRes.status}`);
    }

    const aiData = await aiRes.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";

    let dossier;
    try {
      dossier = JSON.parse(content);
    } catch {
      dossier = { error: "Failed to parse AI response", raw: content.slice(0, 500) };
    }

    return new Response(JSON.stringify(dossier), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Dossier error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});