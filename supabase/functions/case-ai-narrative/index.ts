import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { case_id, action } = await req.json();
    if (!case_id) {
      return new Response(JSON.stringify({ error: "case_id is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    // Fetch all case data
    const [caseRes, findingsRes, docsRes, eventsRes] = await Promise.all([
      sb.from("v3_cases").select("*").eq("id", case_id).single(),
      sb.from("v3_osint_findings").select("*").eq("case_id", case_id),
      sb.from("v3_case_documents").select("*").eq("case_id", case_id),
      sb.from("v3_case_events").select("*").eq("case_id", case_id).order("timestamp", { ascending: true }),
    ]);

    if (caseRes.error) throw new Error(caseRes.error.message);
    const caseData = caseRes.data;
    const findings = findingsRes.data || [];
    const docs = docsRes.data || [];
    const events = eventsRes.data || [];

    if (action === "narrative") {
      // AI Risk Narrative Generation
      const prompt = `You are a senior intelligence analyst. Generate a decision-grade risk narrative for this visa applicant case.

CASE: ${caseData.case_id}
APPLICANT: ${JSON.stringify(caseData.applicant)}
RISK SCORE: ${caseData.risk_score}/100 (${caseData.risk_level})
CONSULATE: ${caseData.consulate_location}
DESTINATION: ${caseData.travel_destination}

OSINT FINDINGS (${findings.length} total):
${findings.map(f => `- [${f.risk_impact?.toUpperCase()}] ${f.title}: ${f.detail} (source: ${f.source}, confidence: ${f.confidence}%)`).join("\n")}

DOCUMENTS (${docs.length}):
${docs.map(d => `- ${d.name} (OCR: ${d.ocr_status}) Fields: ${JSON.stringify(d.extracted_fields)}`).join("\n")}

TIMELINE (${events.length} events):
${events.slice(-10).map(e => `- ${e.type}: ${e.description}`).join("\n")}

Produce a structured intelligence brief with:
1. EXECUTIVE SUMMARY (2-3 sentences, decision-ready)
2. KEY FINDINGS (top 3-5 actionable findings ranked by severity)
3. RISK ASSESSMENT (narrative explaining the risk score with evidence)
4. DOCUMENT INTEGRITY (any discrepancies between OCR data and OSINT)
5. RECOMMENDATION (approve/reject/escalate with reasoning)

Be specific with evidence. Reference exact findings. Do not hedge unnecessarily.`;

      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "You are a senior consular intelligence analyst producing classified-grade risk assessments. Be direct, specific, and evidence-based." },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!aiRes.ok) {
        const errText = await aiRes.text();
        console.error("AI gateway error:", aiRes.status, errText);
        if (aiRes.status === 429) return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (aiRes.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error("AI gateway error");
      }

      const aiData = await aiRes.json();
      const narrative = aiData.choices?.[0]?.message?.content || "Failed to generate narrative.";

      // Log this as a case event
      await sb.from("v3_case_events").insert({
        case_id,
        type: "risk_scored",
        description: "AI risk narrative generated",
        user_name: "COMPASS AI",
      });

      return new Response(JSON.stringify({ narrative }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "correlate") {
      // Cross-case correlation
      const applicant = caseData.applicant as any;
      const passport = applicant.passportNumber;
      const nationality = applicant.nationality;
      const firstName = applicant.firstName;
      const lastName = applicant.lastName;

      // Find other cases with shared attributes
      const { data: allCases } = await sb.from("v3_cases").select("*").neq("id", case_id);
      const correlations: Array<{
        case_id: string;
        match_type: string;
        detail: string;
        risk_level: string;
        shared_attribute: string;
      }> = [];

      for (const other of (allCases || [])) {
        const otherApplicant = other.applicant as any;
        const matches: string[] = [];

        // Same nationality + same consulate
        if (otherApplicant.nationality === nationality && other.consulate_location === caseData.consulate_location) {
          matches.push("same_origin_consulate");
        }

        // Similar names (potential alias)
        if (otherApplicant.lastName?.toLowerCase() === lastName?.toLowerCase() && otherApplicant.firstName?.toLowerCase() !== firstName?.toLowerCase()) {
          matches.push("shared_surname");
        }

        // Same destination
        if (other.travel_destination === caseData.travel_destination && otherApplicant.nationality === nationality) {
          matches.push("same_travel_pattern");
        }

        // Check OSINT findings for shared entities
        if (matches.length > 0 || otherApplicant.nationality === nationality) {
          const { data: otherFindings } = await sb.from("v3_osint_findings").select("title, detail, source").eq("case_id", other.id).limit(20);
          
          // Check for shared employers, addresses, phone numbers in findings
          for (const of2 of (otherFindings || [])) {
            for (const f of findings) {
              if (f.source === of2.source && f.category === "financial" && f.detail && of2.detail) {
                // Check for shared financial institutions or amounts
                const sharedBanks = ["Ziraat", "Garanti", "Halkbank", "Vakifbank", "Isbank"];
                for (const bank of sharedBanks) {
                  if (f.detail.includes(bank) && of2.detail.includes(bank)) {
                    matches.push("shared_financial_institution");
                    break;
                  }
                }
              }
            }
          }
        }

        if (matches.length > 0) {
          correlations.push({
            case_id: other.case_id,
            match_type: matches[0],
            detail: `${otherApplicant.firstName} ${otherApplicant.lastName} - ${matches.join(", ")}`,
            risk_level: other.risk_level,
            shared_attribute: matches.join(", "),
          });
        }
      }

      return new Response(JSON.stringify({ correlations, total: correlations.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
