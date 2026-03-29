import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ProfileUrl {
  platform: string;
  username: string;
  profileUrl: string;
  bestScore: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profiles } = await req.json() as { profiles: ProfileUrl[] };

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ error: "No profiles provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      return new Response(JSON.stringify({ error: "Firecrawl not configured" }), {
        status: 500,
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

    // Take top 5 highest-scoring profiles from different platforms
    const seen = new Set<string>();
    const topProfiles = profiles
      .sort((a, b) => b.bestScore - a.bestScore)
      .filter(p => {
        // Prefer one per platform, skip duplicates
        const key = `${p.platform}:${p.username}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 5);

    console.log(`Scraping ${topProfiles.length} profiles:`, topProfiles.map(p => p.profileUrl));

    // Scrape profiles in parallel
    const scrapeResults = await Promise.allSettled(
      topProfiles.map(async (profile) => {
        try {
          const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url: profile.profileUrl,
              formats: ["markdown"],
              onlyMainContent: true,
              waitFor: 2000,
            }),
          });

          const data = await res.json();
          if (!res.ok || !data.success) {
            console.error(`Scrape failed for ${profile.profileUrl}:`, data.error);
            return { ...profile, scraped: false, error: data.error || "Scrape failed" };
          }

          const markdown = data.data?.markdown || data.markdown || "";
          const metadata = data.data?.metadata || data.metadata || {};

          return {
            ...profile,
            scraped: true,
            markdown: markdown.slice(0, 3000), // Limit to avoid token overflow
            title: metadata.title || null,
            description: metadata.description || null,
          };
        } catch (err) {
          console.error(`Error scraping ${profile.profileUrl}:`, err);
          return { ...profile, scraped: false, error: String(err) };
        }
      })
    );

    const scrapedProfiles = scrapeResults
      .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
      .map(r => r.value)
      .filter(r => r.scraped);

    if (scrapedProfiles.length === 0) {
      return new Response(JSON.stringify({
        enriched: false,
        reason: "Could not scrape any profiles (pages may require login)",
        extractedName: null,
        profiles: [],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use AI to extract structured identity data from scraped content
    const profileSummaries = scrapedProfiles.map((p: any) => 
      `=== ${p.platform} (@${p.username}, ${p.bestScore}% match) ===\nTitle: ${p.title || 'N/A'}\nDescription: ${p.description || 'N/A'}\nContent:\n${p.markdown}`
    ).join("\n\n");

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{
          role: "user",
          content: `You are an OSINT analyst. Extract identity information from these scraped social media profiles. These profiles were found via facial recognition and may belong to the same person.

${profileSummaries}

Return JSON with these keys:
- "fullName": string | null — the most likely real full name (look for display names, profile names, "About" sections, page titles)
- "nameConfidence": "HIGH" | "MEDIUM" | "LOW" — how confident you are this is the real name
- "bio": string | null — combined bio/description
- "location": string | null — location if found
- "occupation": string | null — job title or profession if found
- "organization": string | null — company/school/org if found  
- "website": string | null — personal website if found
- "profileDetails": array of objects with "platform", "username", "displayName", "bio", "followers" (string or null for each)
- "crossReferenceNotes": string — 1-2 sentences about whether these profiles appear to be the same person

Focus on extracting the REAL NAME. Look at page titles, meta descriptions, profile display names, and bio content. Only return JSON, no markdown.`,
        }],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI error:", aiRes.status, errText);
      return new Response(JSON.stringify({
        enriched: false,
        reason: `AI analysis failed: ${aiRes.status}`,
        extractedName: null,
        profiles: scrapedProfiles.map((p: any) => ({
          platform: p.platform,
          username: p.username,
          title: p.title,
          description: p.description,
        })),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiRes.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";

    let extracted;
    try {
      extracted = JSON.parse(content);
    } catch {
      extracted = { fullName: null, nameConfidence: "LOW" };
    }

    return new Response(JSON.stringify({
      enriched: true,
      extractedName: extracted.fullName,
      nameConfidence: extracted.nameConfidence || "LOW",
      bio: extracted.bio,
      location: extracted.location,
      occupation: extracted.occupation,
      organization: extracted.organization,
      website: extracted.website,
      profileDetails: extracted.profileDetails || [],
      crossReferenceNotes: extracted.crossReferenceNotes,
      scrapedCount: scrapedProfiles.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Profile scrape error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
