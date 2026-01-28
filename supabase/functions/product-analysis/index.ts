import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analysisType, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (analysisType === "product-validation") {
      systemPrompt = `You are a strategic product consultant specializing in GovTech and enterprise software. You analyze product portfolios for coherence, market fit, and differentiation. Be direct and actionable.`;
      
      userPrompt = `Analyze this product suite for a visa integrity/fraud detection platform targeting government consular operations:

CURRENT PRODUCT DEFINITIONS:
${context.productDefinitions}

BUSINESS CONTEXT:
- Target: Turkish Ministry of Foreign Affairs, consular operations
- Market: 250+ consulates, 4.5M+ visa applications annually
- Competitors: VFS Global (logistics), iDATA (booking) - neither does verification
- Subsidiary: Vizesepetim.com (visa marketplace generating real fraud pattern data)

PALANTIR PARALLEL (inspiration):
- Foundry = Data integration platform
- Gotham = Intelligence/analysis platform  
- Apollo = Operations/deployment platform

ANALYZE:
1. Do the three products (Maris, Nautica, Meridian) form a coherent, non-overlapping system?
2. Are the product boundaries correctly drawn for the visa fraud detection use case?
3. Are there gaps in the product suite that should be addressed?
4. Are there overlaps that create confusion?
5. Do the product names and taglines clearly communicate value?
6. Suggest specific improvements to product definitions, capabilities, or positioning.

Provide structured output with clear recommendations.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in product-analysis:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
