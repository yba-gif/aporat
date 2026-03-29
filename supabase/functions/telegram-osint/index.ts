import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface TelegramResult {
  username: string;
  exists: boolean;
  profileType: string | null; // 'user' | 'bot' | 'channel' | 'group' | null
  displayName: string | null;
  bio: string | null;
  memberCount: string | null;
  profilePhoto: boolean;
  scrapedData: any | null;
  error: string | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { usernames } = await req.json() as { usernames: string[] };

    if (!usernames || usernames.length === 0) {
      return new Response(JSON.stringify({ error: "No usernames provided" }), {
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

    // Deduplicate and limit to 5 usernames
    const targets = [...new Set(usernames.map(u => u.replace(/^@/, '').toLowerCase()))].slice(0, 5);

    console.log(`Telegram OSINT lookup for: ${targets.join(', ')}`);

    const results: TelegramResult[] = [];

    for (const username of targets) {
      try {
        // Step 1: Check if t.me/{username} exists via HEAD request
        const checkRes = await fetch(`https://t.me/${username}`, {
          method: "GET",
          redirect: "follow",
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });

        if (!checkRes.ok || checkRes.status === 404) {
          results.push({
            username,
            exists: false,
            profileType: null,
            displayName: null,
            bio: null,
            memberCount: null,
            profilePhoto: false,
            scrapedData: null,
            error: null,
          });
          await checkRes.text(); // consume body
          continue;
        }

        // Quick check from HTML - t.me renders a preview page with meta tags
        const html = await checkRes.text();
        
        // Check for "If you have Telegram, you can contact" (user exists)
        // or "you can view and join" (channel/group exists)
        const notFound = html.includes("If you have <strong>Telegram</strong>, you can") === false
          && html.includes("you can view and join") === false
          && html.includes("tgme_page_title") === false;

        if (notFound) {
          results.push({
            username,
            exists: false,
            profileType: null,
            displayName: null,
            bio: null,
            memberCount: null,
            profilePhoto: false,
            scrapedData: null,
            error: null,
          });
          continue;
        }

        // Extract basic info from HTML meta tags
        const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
        const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/);
        const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
        
        // Determine profile type from page content
        let profileType: string = 'user';
        if (html.includes('tgme_channel_info') || html.includes('you can view and join')) {
          if (html.includes('subscribers') || html.includes('channel')) {
            profileType = 'channel';
          } else if (html.includes('members')) {
            profileType = 'group';
          }
        }
        if (username.toLowerCase().endsWith('bot')) {
          profileType = 'bot';
        }

        // Extract member/subscriber count
        const memberMatch = html.match(/([\d\s]+)\s*(members?|subscribers?)/i);
        const memberCount = memberMatch ? memberMatch[1].trim() : null;

        const displayName = titleMatch?.[1] || null;
        const description = descMatch?.[1] || null;
        const hasPhoto = !!imageMatch?.[1] && !imageMatch[1].includes('telegram_placeholder');

        // Step 2: Use Firecrawl for deeper scrape if it's a channel/group
        let scrapedData = null;
        if (profileType === 'channel' || profileType === 'group') {
          try {
            // Try to scrape the preview page for more data
            const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                url: `https://t.me/s/${username}`,
                formats: ["markdown"],
                onlyMainContent: true,
                waitFor: 2000,
              }),
            });

            const scrapeData = await scrapeRes.json();
            if (scrapeRes.ok && scrapeData.success) {
              const markdown = scrapeData.data?.markdown || scrapeData.markdown || "";
              scrapedData = {
                previewContent: markdown.slice(0, 3000),
                title: scrapeData.data?.metadata?.title || null,
                description: scrapeData.data?.metadata?.description || null,
              };
            }
          } catch (scrapeErr) {
            console.error(`Firecrawl scrape failed for t.me/s/${username}:`, scrapeErr);
          }
        }

        results.push({
          username,
          exists: true,
          profileType,
          displayName,
          bio: description,
          memberCount,
          profilePhoto: hasPhoto,
          scrapedData,
          error: null,
        });
      } catch (err) {
        console.error(`Error checking @${username}:`, err);
        results.push({
          username,
          exists: false,
          profileType: null,
          displayName: null,
          bio: null,
          memberCount: null,
          profilePhoto: false,
          scrapedData: null,
          error: String(err),
        });
      }
    }

    // Use AI to analyze findings if we have any existing profiles
    const existingProfiles = results.filter(r => r.exists);
    let aiAnalysis: any = null;

    if (existingProfiles.length > 0 && LOVABLE_API_KEY) {
      try {
        const profileSummaries = existingProfiles.map(p =>
          `@${p.username} (${p.profileType}): Display Name: "${p.displayName || 'N/A'}", Bio: "${p.bio || 'N/A'}", Members: ${p.memberCount || 'N/A'}, Has Photo: ${p.profilePhoto}${p.scrapedData?.previewContent ? `\nRecent content preview:\n${p.scrapedData.previewContent.slice(0, 1500)}` : ''}`
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
              content: `You are an OSINT analyst examining Telegram profiles found during a facial recognition investigation. Analyze these Telegram profiles and assess their intelligence value.

${profileSummaries}

Return JSON with:
- "relevance": "HIGH" | "MEDIUM" | "LOW" — how relevant these Telegram profiles are for intelligence gathering
- "riskIndicators": string[] — any OPSEC concerns, suspicious activity patterns, or risk indicators
- "associatedGroups": string[] — any public groups or channels the user appears connected to
- "languageIndicators": string[] — languages detected in profile/content
- "activityPattern": string — brief description of activity patterns if content was available
- "intelligenceNotes": string — 2-3 sentences summarizing the OSINT value of these Telegram findings
- "recommendations": string[] — suggested follow-up investigation steps

Only return JSON, no markdown.`,
            }],
            response_format: { type: "json_object" },
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const content = aiData.choices?.[0]?.message?.content || "{}";
          try {
            aiAnalysis = JSON.parse(content);
          } catch {
            aiAnalysis = null;
          }
        }
      } catch (aiErr) {
        console.error("AI analysis failed:", aiErr);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      totalChecked: targets.length,
      totalFound: existingProfiles.length,
      results,
      aiAnalysis,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Telegram OSINT error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
