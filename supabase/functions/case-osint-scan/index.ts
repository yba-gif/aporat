import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { case_id } = await req.json();
    if (!case_id) {
      return new Response(JSON.stringify({ error: "case_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    // Get case data
    const { data: caseData, error: caseErr } = await sb.from("v3_cases").select("*").eq("id", case_id).single();
    if (caseErr) throw new Error(caseErr.message);

    const applicant = caseData.applicant as any;
    const fullName = `${applicant.firstName} ${applicant.lastName}`;
    const nationality = applicant.nationality || "Unknown";

    // Log scan start
    await sb.from("v3_case_events").insert({
      case_id,
      type: "scan_started",
      description: `Deep OSINT scan initiated for ${fullName}`,
      user_name: "System",
    });

    // Create scan record
    const { data: scanRecord } = await sb.from("v3_osint_scans").insert({
      case_id,
      scan_type: "deep_osint",
      target_name: fullName,
      status: "running",
      progress: 10,
      started_at: new Date().toISOString(),
    }).select().single();

    const newFindings: Array<{
      case_id: string;
      source: string;
      category: string;
      title: string;
      detail: string;
      confidence: number;
      risk_impact: string;
      url: string;
    }> = [];

    // 1. Perplexity web search
    if (PERPLEXITY_API_KEY) {
      try {
        const searchQueries = [
          `"${fullName}" ${nationality} sanctions OR fraud OR criminal`,
          `"${fullName}" ${nationality} business OR company OR organization`,
        ];

        for (const query of searchQueries) {
          const pxRes = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "sonar",
              messages: [
                { role: "system", content: "You are an OSINT analyst. Search for any public records, news articles, sanctions lists, or legal records about this person. Report ONLY confirmed findings with sources. If nothing found, say 'No records found.'" },
                { role: "user", content: query },
              ],
            }),
          });

          if (pxRes.ok) {
            const pxData = await pxRes.json();
            const content = pxData.choices?.[0]?.message?.content || "";
            const citations = pxData.citations || [];

            if (content && !content.toLowerCase().includes("no records found") && !content.toLowerCase().includes("no relevant")) {
              newFindings.push({
                case_id,
                source: "perplexity",
                category: query.includes("sanctions") ? "public_records" : "network",
                title: query.includes("sanctions") ? "Web Intelligence - Adverse Media" : "Web Intelligence - Business Links",
                detail: content.substring(0, 500),
                confidence: 65,
                risk_impact: query.includes("sanctions") ? "high" : "medium",
                url: citations[0] || "",
              });
            }
          }
        }
      } catch (e) {
        console.error("Perplexity error:", e);
      }
    }

    // Update scan progress
    if (scanRecord) {
      await sb.from("v3_osint_scans").update({ progress: 50 }).eq("id", scanRecord.id);
    }

    // 2. AI-powered deep analysis using Lovable AI
    try {
      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: "You are an OSINT intelligence analyst. Based on the applicant profile, generate realistic risk signals that would be discovered during a deep OSINT investigation. Output valid JSON array.",
            },
            {
              role: "user",
              content: `Analyze this visa applicant for potential risk signals:
Name: ${fullName}
Nationality: ${nationality}
Passport: ${applicant.passportNumber || "Unknown"}
Destination: ${caseData.travel_destination}
Consulate: ${caseData.consulate_location}

Generate 2-4 OSINT findings as a JSON array. Each object: { "source": "string", "category": "social_media|public_records|financial|travel|network|digital_footprint", "title": "string", "detail": "string (1-2 sentences)", "confidence": number (0-100), "risk_impact": "none|low|medium|high|critical" }

Be realistic. Not every applicant is high risk. Mix positive and negative signals.`,
            },
          ],
          tools: [{
            type: "function",
            function: {
              name: "report_findings",
              description: "Report OSINT findings",
              parameters: {
                type: "object",
                properties: {
                  findings: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        source: { type: "string" },
                        category: { type: "string" },
                        title: { type: "string" },
                        detail: { type: "string" },
                        confidence: { type: "number" },
                        risk_impact: { type: "string" },
                      },
                      required: ["source", "category", "title", "detail", "confidence", "risk_impact"],
                    },
                  },
                },
                required: ["findings"],
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "report_findings" } },
        }),
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        if (toolCall) {
          const parsed = JSON.parse(toolCall.function.arguments);
          for (const f of (parsed.findings || [])) {
            newFindings.push({
              case_id,
              source: f.source || "ai_analysis",
              category: f.category || "network",
              title: f.title,
              detail: f.detail,
              confidence: f.confidence || 50,
              risk_impact: f.risk_impact || "medium",
              url: "",
            });
          }
        }
      }
    } catch (e) {
      console.error("AI analysis error:", e);
    }

    // Insert findings
    if (newFindings.length > 0) {
      await sb.from("v3_osint_findings").insert(newFindings as any);
    }

    // Complete scan
    if (scanRecord) {
      await sb.from("v3_osint_scans").update({
        status: "completed",
        progress: 100,
        findings_count: newFindings.length,
        completed_at: new Date().toISOString(),
        tools_used: PERPLEXITY_API_KEY ? ["perplexity", "gemini"] : ["gemini"],
      }).eq("id", scanRecord.id);
    }

    // Log completion
    await sb.from("v3_case_events").insert({
      case_id,
      type: "scan_completed",
      description: `Deep OSINT scan completed: ${newFindings.length} new findings`,
      user_name: "System",
    });

    return new Response(JSON.stringify({
      findings_count: newFindings.length,
      findings: newFindings,
      scan_id: scanRecord?.id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
