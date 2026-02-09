import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TWITTER_API = "https://api.x.com/2";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TWITTER_BEARER_TOKEN = Deno.env.get("TWITTER_BEARER_TOKEN");
    if (!TWITTER_BEARER_TOKEN) {
      throw new Error("TWITTER_BEARER_TOKEN is not configured");
    }

    const { username } = await req.json();
    if (!username) {
      throw new Error("username is required");
    }

    // Clean handle (remove @ if present)
    const cleanUsername = username.replace(/^@/, "");

    const headers = {
      Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
    };

    // 1. Look up user by username
    const userFields = "id,name,username,description,public_metrics,profile_image_url,verified,created_at,location";
    const userRes = await fetch(
      `${TWITTER_API}/users/by/username/${encodeURIComponent(cleanUsername)}?user.fields=${userFields}`,
      { headers }
    );

    if (!userRes.ok) {
      const errText = await userRes.text();
      console.error("Twitter user lookup error:", userRes.status, errText);
      if (userRes.status === 429) {
        return new Response(
          JSON.stringify({ error: "Twitter API rate limited, try again later" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: `Twitter API error: ${userRes.status}`, details: errText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userData = await userRes.json();
    if (userData.errors || !userData.data) {
      return new Response(
        JSON.stringify({ error: "User not found", details: userData.errors }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = userData.data;

    // 2. Get recent tweets
    const tweetFields = "id,text,created_at,public_metrics,entities";
    const tweetsRes = await fetch(
      `${TWITTER_API}/users/${user.id}/tweets?max_results=10&tweet.fields=${tweetFields}`,
      { headers }
    );

    let tweets: any[] = [];
    if (tweetsRes.ok) {
      const tweetsData = await tweetsRes.json();
      tweets = tweetsData.data || [];
    } else {
      const errText = await tweetsRes.text();
      console.error("Twitter tweets error:", tweetsRes.status, errText);
    }

    // 3. Compute basic risk indicators
    const riskIndicators: string[] = [];
    const metrics = user.public_metrics || {};

    if (metrics.followers_count < 50 && metrics.following_count > 500) {
      riskIndicators.push("Low followers but high following — potential bot/sock puppet pattern");
    }

    const accountAge = (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (accountAge < 90) {
      riskIndicators.push(`Account created ${Math.round(accountAge)} days ago — recently created`);
    }

    if (!user.description || user.description.length < 10) {
      riskIndicators.push("Minimal or no bio — low-effort profile");
    }

    if (metrics.tweet_count < 5 && accountAge > 30) {
      riskIndicators.push("Very low tweet activity relative to account age");
    }

    // Check tweets for fraud-adjacent keywords
    const flaggedKeywords = ["visa", "guarantee", "100%", "approval", "fast track", "no rejection"];
    const flaggedTweets = tweets.filter((t: any) =>
      flaggedKeywords.some((kw) => t.text.toLowerCase().includes(kw))
    );
    if (flaggedTweets.length > 0) {
      riskIndicators.push(`${flaggedTweets.length} tweet(s) contain visa/fraud-adjacent keywords`);
    }

    return new Response(
      JSON.stringify({
        profile: {
          id: user.id,
          name: user.name,
          username: user.username,
          description: user.description,
          profileImageUrl: user.profile_image_url,
          verified: user.verified || false,
          createdAt: user.created_at,
          location: user.location,
          metrics: {
            followers: metrics.followers_count || 0,
            following: metrics.following_count || 0,
            tweets: metrics.tweet_count || 0,
            listed: metrics.listed_count || 0,
          },
        },
        recentTweets: tweets.slice(0, 5).map((t: any) => ({
          id: t.id,
          text: t.text,
          createdAt: t.created_at,
          metrics: t.public_metrics,
        })),
        riskIndicators,
        fetchedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("twitter-osint error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
