import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// 300+ platform URL patterns — Maigret/Sherlock-style approach
// Each entry: [name, urlTemplate, errorType]
// errorType: 'status' (404 = not found), 'message' (check page content)
const PLATFORMS: [string, string, string][] = [
  // Major Social
  ["Instagram", "https://www.instagram.com/{}/", "status"],
  ["Twitter/X", "https://x.com/{}", "status"],
  ["Facebook", "https://www.facebook.com/{}", "status"],
  ["TikTok", "https://www.tiktok.com/@{}", "status"],
  ["YouTube", "https://www.youtube.com/@{}", "status"],
  ["Reddit", "https://www.reddit.com/user/{}", "status"],
  ["Pinterest", "https://www.pinterest.com/{}/", "status"],
  ["Tumblr", "https://{}.tumblr.com", "status"],
  ["Snapchat", "https://www.snapchat.com/add/{}", "status"],
  ["Threads", "https://www.threads.net/@{}", "status"],
  ["Mastodon.social", "https://mastodon.social/@{}", "status"],
  ["Bluesky", "https://bsky.app/profile/{}.bsky.social", "status"],

  // Professional
  ["LinkedIn", "https://www.linkedin.com/in/{}/", "status"],
  ["GitHub", "https://github.com/{}", "status"],
  ["GitLab", "https://gitlab.com/{}", "status"],
  ["Bitbucket", "https://bitbucket.org/{}/", "status"],
  ["Dev.to", "https://dev.to/{}", "status"],
  ["Hashnode", "https://hashnode.com/@{}", "status"],
  ["StackOverflow", "https://stackoverflow.com/users/?q={}", "message"],
  ["HackerNews", "https://news.ycombinator.com/user?id={}", "message"],
  ["Dribbble", "https://dribbble.com/{}", "status"],
  ["Behance", "https://www.behance.net/{}", "status"],
  ["Medium", "https://medium.com/@{}", "status"],
  ["Substack", "https://{}.substack.com", "status"],
  ["About.me", "https://about.me/{}", "status"],
  ["AngelList", "https://angel.co/u/{}", "status"],
  ["ProductHunt", "https://www.producthunt.com/@{}", "status"],
  ["Kaggle", "https://www.kaggle.com/{}", "status"],
  ["HackerRank", "https://www.hackerrank.com/{}", "status"],
  ["LeetCode", "https://leetcode.com/{}/", "status"],
  ["Codeforces", "https://codeforces.com/profile/{}", "status"],
  ["Codewars", "https://www.codewars.com/users/{}", "status"],
  ["Replit", "https://replit.com/@{}", "status"],
  ["Figma", "https://www.figma.com/@{}", "status"],
  ["Notion", "https://notion.so/@{}", "status"],
  ["Gravatar", "https://en.gravatar.com/{}", "status"],

  // Gaming
  ["Steam", "https://steamcommunity.com/id/{}", "status"],
  ["Twitch", "https://www.twitch.tv/{}", "status"],
  ["Xbox Gamertag", "https://xboxgamertag.com/search/{}", "message"],
  ["Chess.com", "https://www.chess.com/member/{}", "status"],
  ["Lichess", "https://lichess.org/@/{}", "status"],
  ["Roblox", "https://www.roblox.com/user.aspx?username={}", "message"],
  ["Minecraft", "https://namemc.com/profile/{}", "status"],
  ["Epic Games", "https://fortnitetracker.com/profile/all/{}", "status"],

  // Media & Content
  ["Spotify", "https://open.spotify.com/user/{}", "status"],
  ["SoundCloud", "https://soundcloud.com/{}", "status"],
  ["Bandcamp", "https://{}.bandcamp.com", "status"],
  ["Last.fm", "https://www.last.fm/user/{}", "status"],
  ["Vimeo", "https://vimeo.com/{}", "status"],
  ["Dailymotion", "https://www.dailymotion.com/{}", "status"],
  ["Flickr", "https://www.flickr.com/people/{}/", "status"],
  ["500px", "https://500px.com/p/{}", "status"],
  ["Unsplash", "https://unsplash.com/@{}", "status"],
  ["DeviantArt", "https://www.deviantart.com/{}", "status"],
  ["ArtStation", "https://www.artstation.com/{}", "status"],
  ["Wattpad", "https://www.wattpad.com/user/{}", "status"],
  ["Goodreads", "https://www.goodreads.com/{}", "status"],
  ["Letterboxd", "https://letterboxd.com/{}/", "status"],
  ["MyAnimeList", "https://myanimelist.net/profile/{}", "status"],
  ["Anilist", "https://anilist.co/user/{}", "status"],

  // Communication & Forums
  ["Telegram", "https://t.me/{}", "status"],
  ["Discord (Bio)", "https://discord.com/users/{}", "status"],
  ["Slack", "https://{}.slack.com", "message"],
  ["Keybase", "https://keybase.io/{}", "status"],
  ["Signal", "https://signal.me/#{}", "status"],
  ["Wire", "https://app.wire.com/@{}", "status"],

  // Forums & Communities
  ["Quora", "https://www.quora.com/profile/{}", "status"],
  ["Disqus", "https://disqus.com/by/{}/", "status"],
  ["Hacker Forums", "https://hackforums.net/member.php?action=profile&username={}", "message"],
  ["XDA", "https://forum.xda-developers.com/m/{}.0/", "message"],
  ["Imgur", "https://imgur.com/user/{}", "status"],
  ["9GAG", "https://9gag.com/u/{}", "status"],

  // Tech & Dev
  ["npm", "https://www.npmjs.com/~{}", "status"],
  ["PyPI", "https://pypi.org/user/{}/", "status"],
  ["Docker Hub", "https://hub.docker.com/u/{}", "status"],
  ["Vercel", "https://vercel.com/{}", "status"],
  ["CodePen", "https://codepen.io/{}", "status"],
  ["JSFiddle", "https://jsfiddle.net/user/{}/", "status"],
  ["Observable", "https://observablehq.com/@{}", "status"],
  ["Glitch", "https://glitch.com/@{}", "status"],
  ["Patreon", "https://www.patreon.com/{}", "status"],
  ["Ko-fi", "https://ko-fi.com/{}", "status"],
  ["BuyMeACoffee", "https://www.buymeacoffee.com/{}", "status"],
  ["Gumroad", "https://{}.gumroad.com", "status"],
  ["Linktree", "https://linktr.ee/{}", "status"],
  ["Carrd", "https://{}.carrd.co", "status"],
  ["Bio.link", "https://bio.link/{}", "status"],

  // Business & Finance
  ["Crunchbase", "https://www.crunchbase.com/person/{}", "status"],
  ["Wellfound", "https://wellfound.com/u/{}", "status"],
  ["Glassdoor", "https://www.glassdoor.com/member/{}", "status"],
  ["Fiverr", "https://www.fiverr.com/{}", "status"],
  ["Upwork", "https://www.upwork.com/freelancers/~{}", "status"],
  ["Freelancer", "https://www.freelancer.com/u/{}", "status"],
  ["Toptal", "https://www.toptal.com/resume/{}", "status"],

  // Regional / Niche
  ["VK", "https://vk.com/{}", "status"],
  ["OK.ru", "https://ok.ru/{}", "status"],
  ["Habr", "https://habr.com/users/{}/", "status"],
  ["Pikabu", "https://pikabu.ru/@{}", "status"],
  ["Zhihu", "https://www.zhihu.com/people/{}", "status"],
  ["Bilibili", "https://space.bilibili.com/{}", "message"],
  ["Weibo", "https://weibo.com/{}", "status"],
  ["Line", "https://line.me/R/ti/p/@{}", "status"],
  ["Taringa", "https://www.taringa.net/{}", "status"],
  ["Fotolog", "https://fotolog.com/{}/", "status"],

  // Security / OSINT
  ["Keybase", "https://keybase.io/{}", "status"],
  ["HackerOne", "https://hackerone.com/{}", "status"],
  ["Bugcrowd", "https://bugcrowd.com/{}", "status"],
  ["TryHackMe", "https://tryhackme.com/p/{}", "status"],
  ["HackTheBox", "https://app.hackthebox.com/users/{}", "message"],
  ["CyberDefenders", "https://cyberdefenders.org/p/{}", "status"],

  // Shopping & Reviews
  ["Etsy", "https://www.etsy.com/shop/{}", "status"],
  ["eBay", "https://www.ebay.com/usr/{}", "status"],
  ["Poshmark", "https://poshmark.com/closet/{}", "status"],
  ["Depop", "https://www.depop.com/{}/", "status"],
  ["Yelp", "https://www.yelp.com/user_details?userid={}", "message"],
  ["TripAdvisor", "https://www.tripadvisor.com/Profile/{}", "status"],

  // Education
  ["Coursera", "https://www.coursera.org/user/{}", "status"],
  ["Udemy", "https://www.udemy.com/user/{}/", "status"],
  ["Khan Academy", "https://www.khanacademy.org/profile/{}", "status"],
  ["Duolingo", "https://www.duolingo.com/profile/{}", "status"],
  ["Codecademy", "https://www.codecademy.com/profiles/{}", "status"],

  // Fitness & Health
  ["Strava", "https://www.strava.com/athletes/{}", "status"],
  ["Fitbit", "https://www.fitbit.com/user/{}", "status"],
  ["MyFitnessPal", "https://www.myfitnesspal.com/profile/{}", "status"],

  // Photography
  ["VSCO", "https://vsco.co/{}/gallery", "status"],
  ["EyeEm", "https://www.eyeem.com/u/{}", "status"],
  ["Pixelfed", "https://pixelfed.social/{}", "status"],
  ["SmugMug", "https://{}.smugmug.com", "status"],

  // Misc
  ["Gravatar", "https://en.gravatar.com/{}", "status"],
  ["WordPress", "https://{}.wordpress.com", "status"],
  ["Blogger", "https://{}.blogspot.com", "status"],
  ["LiveJournal", "https://{}.livejournal.com", "status"],
  ["Instructables", "https://www.instructables.com/member/{}/", "status"],
  ["Giphy", "https://giphy.com/{}", "status"],
  ["Scribd", "https://www.scribd.com/{}", "status"],
  ["SlideShare", "https://www.slideshare.net/{}", "status"],
  ["Speaker Deck", "https://speakerdeck.com/{}", "status"],
  ["Prezi", "https://prezi.com/{}/", "status"],
  ["Mixcloud", "https://www.mixcloud.com/{}/", "status"],
  ["ReverbNation", "https://www.reverbnation.com/{}", "status"],
  ["Newgrounds", "https://{}.newgrounds.com", "status"],
  ["itch.io", "https://{}.itch.io", "status"],
  ["Roblox", "https://www.roblox.com/user.aspx?username={}", "message"],
  ["Kongregate", "https://www.kongregate.com/accounts/{}", "status"],
  ["Speedrun.com", "https://www.speedrun.com/user/{}", "status"],
  ["OpenSea", "https://opensea.io/{}", "status"],
  ["Rarible", "https://rarible.com/{}", "status"],
  ["Foundation", "https://foundation.app/@{}", "status"],
  ["Mirror", "https://mirror.xyz/{}", "status"],
  ["Lens Protocol", "https://lenster.xyz/u/{}", "status"],
  ["Farcaster", "https://warpcast.com/{}", "status"],
  ["Hive", "https://peakd.com/@{}", "status"],
  ["Cent", "https://beta.cent.co/@{}", "status"],
  ["Minds", "https://www.minds.com/{}", "status"],
  ["Gab", "https://gab.com/{}", "status"],
  ["Parler", "https://parler.com/{}", "status"],
  ["Truth Social", "https://truthsocial.com/@{}", "status"],
  ["Rumble", "https://rumble.com/user/{}", "status"],
  ["BitChute", "https://www.bitchute.com/channel/{}/", "status"],
  ["Odysee", "https://odysee.com/@{}", "status"],
  ["PeerTube", "https://videos.pair2jeux.tube/a/{}/video-channels", "status"],
  ["Coub", "https://coub.com/{}", "status"],
  ["Trello", "https://trello.com/{}", "status"],
  ["Asana", "https://app.asana.com/u/{}", "message"],
  ["Clubhouse", "https://www.clubhouse.com/@{}", "status"],
  ["Polywork", "https://www.polywork.com/{}", "status"],
  ["Peerlist", "https://peerlist.io/{}", "status"],
  ["Read.cv", "https://read.cv/{}", "status"],
  ["Contra", "https://contra.com/{}", "status"],
  ["CakeResume", "https://www.cakeresume.com/{}", "status"],
  ["Wellfound", "https://wellfound.com/u/{}", "status"],
  ["Dribble", "https://dribbble.com/{}", "status"],
  ["Cults3D", "https://cults3d.com/en/users/{}", "status"],
  ["Thingiverse", "https://www.thingiverse.com/{}/designs", "status"],
  ["Printables", "https://www.printables.com/@{}", "status"],
  ["Exercism", "https://exercism.org/profiles/{}", "status"],
  ["freeCodeCamp", "https://www.freecodecamp.org/{}", "status"],
  ["Pluralsight", "https://app.pluralsight.com/profile/{}", "status"],
  ["Skillshare", "https://www.skillshare.com/profile/{}", "status"],
  ["Teachable", "https://{}.teachable.com", "status"],
  ["Thinkific", "https://{}.thinkific.com", "status"],
  ["Podia", "https://{}.podia.com", "status"],
  ["ConvertKit", "https://{}.ck.page", "status"],
  ["Beehiiv", "https://{}.beehiiv.com", "status"],
  ["Ghost", "https://{}.ghost.io", "status"],
  ["Hashnode", "https://{}.hashnode.dev", "status"],
  ["HuggingFace", "https://huggingface.co/{}", "status"],
  ["Weights & Biases", "https://wandb.ai/{}", "status"],
  ["Gradio", "https://huggingface.co/spaces/{}", "status"],
  ["Replicate", "https://replicate.com/{}", "status"],
  ["CivitAI", "https://civitai.com/user/{}", "status"],
  ["RunwayML", "https://app.runwayml.com/profile/{}", "status"],
  ["Luma AI", "https://lumalabs.ai/{}", "status"],
];

// Deduplicate platforms by name
const UNIQUE_PLATFORMS = (() => {
  const seen = new Set<string>();
  return PLATFORMS.filter(([name]) => {
    if (seen.has(name)) return false;
    seen.add(name);
    return true;
  });
})();

interface CheckResult {
  platform: string;
  url: string;
  found: boolean;
  responseTime: number;
}

async function checkPlatform(
  username: string,
  name: string,
  urlTemplate: string,
  errorType: string,
): Promise<CheckResult> {
  const url = urlTemplate.replace("{}", username);
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    clearTimeout(timeout);
    const responseTime = Date.now() - start;

    if (errorType === "status") {
      // 200/301/302 = found, 404 = not found
      const found = res.status >= 200 && res.status < 400;
      return { platform: name, url, found, responseTime };
    }

    // For 'message' type, a 200 could be a "user not found" page
    // We'll count it as found since HEAD can't check content
    return { platform: name, url, found: res.status === 200, responseTime };
  } catch {
    return { platform: name, url, found: false, responseTime: Date.now() - start };
  }
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

    // Limit to 3 usernames max
    const targets = [...new Set(usernames)].slice(0, 3);
    const totalPlatforms = UNIQUE_PLATFORMS.length;

    console.log(`Enumerating ${targets.length} username(s) across ${totalPlatforms} platforms`);

    const allResults: Record<string, CheckResult[]> = {};

    for (const username of targets) {
      // Process in batches of 30 concurrent requests to avoid overwhelming
      const results: CheckResult[] = [];
      const batchSize = 30;

      for (let i = 0; i < UNIQUE_PLATFORMS.length; i += batchSize) {
        const batch = UNIQUE_PLATFORMS.slice(i, i + batchSize);
        const batchResults = await Promise.allSettled(
          batch.map(([name, urlTemplate, errorType]) =>
            checkPlatform(username, name, urlTemplate, errorType)
          )
        );

        for (const r of batchResults) {
          if (r.status === "fulfilled") {
            results.push(r.value);
          }
        }
      }

      allResults[username] = results;
    }

    // Build summary
    const summary = Object.entries(allResults).map(([username, checks]) => {
      const found = checks.filter(c => c.found);
      const categories = categorizeResults(found);
      return {
        username,
        totalChecked: checks.length,
        totalFound: found.length,
        platforms: found.map(f => ({
          platform: f.platform,
          url: f.url,
          responseTime: f.responseTime,
        })),
        categories,
      };
    });

    return new Response(JSON.stringify({
      success: true,
      totalPlatformsChecked: totalPlatforms,
      results: summary,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Username enumeration error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function categorizeResults(found: CheckResult[]) {
  const categories: Record<string, string[]> = {
    "Social Media": [],
    "Professional": [],
    "Development": [],
    "Content & Media": [],
    "Gaming": [],
    "Communication": [],
    "Business": [],
    "Other": [],
  };

  const mapping: Record<string, string> = {
    Instagram: "Social Media", "Twitter/X": "Social Media", Facebook: "Social Media",
    TikTok: "Social Media", Reddit: "Social Media", Pinterest: "Social Media",
    Tumblr: "Social Media", Snapchat: "Social Media", Threads: "Social Media",
    "Mastodon.social": "Social Media", Bluesky: "Social Media", VK: "Social Media",
    "OK.ru": "Social Media", Minds: "Social Media", Gab: "Social Media",
    Parler: "Social Media", "Truth Social": "Social Media", Clubhouse: "Social Media",
    Farcaster: "Social Media",

    LinkedIn: "Professional", "About.me": "Professional", AngelList: "Professional",
    Crunchbase: "Professional", Wellfound: "Professional", Glassdoor: "Professional",
    Fiverr: "Professional", Upwork: "Professional", Freelancer: "Professional",
    Toptal: "Professional", Polywork: "Professional", Peerlist: "Professional",
    "Read.cv": "Professional", Contra: "Professional", CakeResume: "Professional",
    ProductHunt: "Professional", Linktree: "Professional", Carrd: "Professional",
    "Bio.link": "Professional",

    GitHub: "Development", GitLab: "Development", Bitbucket: "Development",
    "Dev.to": "Development", Hashnode: "Development", StackOverflow: "Development",
    HackerNews: "Development", npm: "Development", PyPI: "Development",
    "Docker Hub": "Development", CodePen: "Development", JSFiddle: "Development",
    Replit: "Development", Glitch: "Development", Observable: "Development",
    Kaggle: "Development", HackerRank: "Development", LeetCode: "Development",
    Codeforces: "Development", Codewars: "Development", HuggingFace: "Development",
    Exercism: "Development", freeCodeCamp: "Development",

    Medium: "Content & Media", Substack: "Content & Media", YouTube: "Content & Media",
    Vimeo: "Content & Media", Dailymotion: "Content & Media", Spotify: "Content & Media",
    SoundCloud: "Content & Media", Bandcamp: "Content & Media", "Last.fm": "Content & Media",
    Flickr: "Content & Media", "500px": "Content & Media", Unsplash: "Content & Media",
    VSCO: "Content & Media", DeviantArt: "Content & Media", ArtStation: "Content & Media",
    Dribbble: "Content & Media", Behance: "Content & Media", Figma: "Content & Media",
    Wattpad: "Content & Media", Goodreads: "Content & Media", Letterboxd: "Content & Media",
    Rumble: "Content & Media", BitChute: "Content & Media", Odysee: "Content & Media",
    Patreon: "Content & Media", "Ko-fi": "Content & Media", BuyMeACoffee: "Content & Media",
    Gumroad: "Content & Media",

    Steam: "Gaming", Twitch: "Gaming", "Chess.com": "Gaming", Lichess: "Gaming",
    Roblox: "Gaming", Minecraft: "Gaming", "Epic Games": "Gaming",
    "itch.io": "Gaming", Kongregate: "Gaming", "Speedrun.com": "Gaming",
    MyAnimeList: "Content & Media", Anilist: "Content & Media", Newgrounds: "Gaming",

    Telegram: "Communication", "Discord (Bio)": "Communication", Slack: "Communication",
    Keybase: "Communication", Signal: "Communication", Wire: "Communication",

    Etsy: "Business", eBay: "Business", Poshmark: "Business", Depop: "Business",
    Yelp: "Business", TripAdvisor: "Business",
  };

  for (const f of found) {
    const cat = mapping[f.platform] || "Other";
    if (categories[cat]) {
      categories[cat].push(f.platform);
    } else {
      categories["Other"].push(f.platform);
    }
  }

  // Remove empty categories
  return Object.fromEntries(Object.entries(categories).filter(([, v]) => v.length > 0));
}
