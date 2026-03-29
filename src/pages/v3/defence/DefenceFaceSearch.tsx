import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Search, ExternalLink, AlertTriangle, CheckCircle2, Loader2, X, Image as ImageIcon, Globe, Link2, User, UserCircle, Save, Shield, Briefcase, MapPin, Eye, Network, Clock, Target, Brain, ChevronRight, Sparkles, ScanSearch } from 'lucide-react';
import { toast } from 'sonner';
import { FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { generateFaceSearchReport } from '@/lib/faceSearchReport';

interface FaceResult {
  url: string;
  score: number;
  base64?: string;
  image_url?: string;
  group?: number;
}

type SearchState = 'idle' | 'uploading' | 'searching' | 'complete' | 'error';
type ResultTab = 'results' | 'dossier';

interface Dossier {
  identity?: {
    fullName?: string;
    aliases?: string[];
    nameConfidence?: string;
    possibleAge?: string | null;
    possibleLocation?: string | null;
    possibleNationality?: string | null;
    possibleOccupation?: string | null;
  };
  digitalPresence?: {
    footprintSize?: string;
    primaryPlatforms?: string[];
    professionalProfiles?: { platform: string; url: string; significance: string }[];
    socialProfiles?: { platform: string; url: string; significance: string }[];
    contentCreation?: { platform: string; url: string; type: string }[];
  };
  professionalIntel?: {
    summary?: string;
    organizations?: string[];
    roles?: string[];
    industry?: string | null;
    publicProfile?: string;
  };
  riskProfile?: {
    opsecLevel?: string;
    exposureLevel?: string;
    vulnerabilities?: string[];
    dataLeakRisk?: string;
  };
  connections?: {
    inferredNetwork?: string[];
    geographicTies?: string[];
    languageIndicators?: string[];
  };
  timeline?: { date: string; event: string; source: string }[];
  actionableIntel?: {
    keyInsights?: string[];
    investigationLeads?: string[];
    monitoringRecommendations?: string[];
  };
  confidenceAssessment?: {
    overallConfidence?: string;
    limitations?: string[];
    dataQuality?: string;
  };
}

interface PlatformMatch {
  platform: string;
  icon: string;
  color: string;
  results: FaceResult[];
  avgScore: number;
  accounts: { username: string; profileUrl: string; postCount: number; bestScore: number }[];
}

interface PlatformRule {
  pattern: RegExp;
  platform: string;
  icon: string;
  color: string;
  extractUsername: (url: string) => string | null;
  buildProfileUrl: (username: string) => string;
}

const extractPath = (url: string, index: number): string | null => {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    return parts[index] || null;
  } catch { return null; }
};

const PLATFORM_RULES: PlatformRule[] = [
  {
    pattern: /instagram\.com|instagr\.am/i, platform: 'Instagram', icon: '📸', color: '#E1306C',
    extractUsername: (url) => {
      const m = url.match(/instagram\.com\/(?!p\/|reel\/|stories\/|explore\/)([A-Za-z0-9._]+)/i);
      if (m) return m[1];
      // from post URLs like /p/xxx/ — can't extract user
      const post = url.match(/instagram\.com\/p\/([A-Za-z0-9_-]+)/i);
      if (post) return null; // will be grouped as unknown account
      return null;
    },
    buildProfileUrl: (u) => `https://instagram.com/${u}`,
  },
  {
    pattern: /twitter\.com|x\.com/i, platform: 'X / Twitter', icon: '𝕏', color: '#1DA1F2',
    extractUsername: (url) => {
      const m = url.match(/(?:twitter\.com|x\.com)\/(?!search|i\/|hashtag|explore|settings)([A-Za-z0-9_]+)/i);
      return m?.[1] || null;
    },
    buildProfileUrl: (u) => `https://x.com/${u}`,
  },
  {
    pattern: /linkedin\.com/i, platform: 'LinkedIn', icon: '💼', color: '#0A66C2',
    extractUsername: (url) => {
      const m = url.match(/linkedin\.com\/in\/([A-Za-z0-9_-]+)/i);
      return m?.[1] || null;
    },
    buildProfileUrl: (u) => `https://linkedin.com/in/${u}`,
  },
  {
    pattern: /facebook\.com|fb\.com/i, platform: 'Facebook', icon: '📘', color: '#1877F2',
    extractUsername: (url) => {
      const m = url.match(/facebook\.com\/(?!photo|groups|watch|events|marketplace)([A-Za-z0-9.]+)/i);
      return m?.[1] || null;
    },
    buildProfileUrl: (u) => `https://facebook.com/${u}`,
  },
  {
    pattern: /youtube\.com|youtu\.be/i, platform: 'YouTube', icon: '▶️', color: '#FF0000',
    extractUsername: (url) => {
      const m = url.match(/youtube\.com\/(?:@|c\/|channel\/|user\/)([A-Za-z0-9_-]+)/i);
      return m?.[1] || null;
    },
    buildProfileUrl: (u) => `https://youtube.com/@${u}`,
  },
  {
    pattern: /tiktok\.com/i, platform: 'TikTok', icon: '🎵', color: '#00F2EA',
    extractUsername: (url) => {
      const m = url.match(/tiktok\.com\/@([A-Za-z0-9._]+)/i);
      return m?.[1] || null;
    },
    buildProfileUrl: (u) => `https://tiktok.com/@${u}`,
  },
  {
    pattern: /reddit\.com/i, platform: 'Reddit', icon: '🟠', color: '#FF4500',
    extractUsername: (url) => {
      const m = url.match(/reddit\.com\/u(?:ser)?\/([A-Za-z0-9_-]+)/i);
      return m?.[1] || null;
    },
    buildProfileUrl: (u) => `https://reddit.com/u/${u}`,
  },
  {
    pattern: /medium\.com/i, platform: 'Medium', icon: '✍️', color: '#00AB6C',
    extractUsername: (url) => {
      const m = url.match(/medium\.com\/@([A-Za-z0-9._]+)/i);
      return m?.[1] || null;
    },
    buildProfileUrl: (u) => `https://medium.com/@${u}`,
  },
  {
    pattern: /github\.com/i, platform: 'GitHub', icon: '🐙', color: '#8B5CF6',
    extractUsername: (url) => extractPath(url, 0),
    buildProfileUrl: (u) => `https://github.com/${u}`,
  },
  {
    pattern: /forbes\.com/i, platform: 'Forbes', icon: '📰', color: '#B5985A',
    extractUsername: () => null,
    buildProfileUrl: (u) => `https://forbes.com/${u}`,
  },
  {
    pattern: /crunchbase\.com/i, platform: 'Crunchbase', icon: '🏢', color: '#0288D1',
    extractUsername: (url) => {
      const m = url.match(/crunchbase\.com\/person\/([A-Za-z0-9_-]+)/i);
      return m?.[1] || null;
    },
    buildProfileUrl: (u) => `https://crunchbase.com/person/${u}`,
  },
  {
    pattern: /quora\.com/i, platform: 'Quora', icon: '❓', color: '#B92B27',
    extractUsername: (url) => {
      const m = url.match(/quora\.com\/profile\/([A-Za-z0-9_-]+)/i);
      return m?.[1] || null;
    },
    buildProfileUrl: (u) => `https://quora.com/profile/${u}`,
  },
  {
    pattern: /pinterest\.com/i, platform: 'Pinterest', icon: '📌', color: '#E60023',
    extractUsername: (url) => extractPath(url, 0),
    buildProfileUrl: (u) => `https://pinterest.com/${u}`,
  },
  {
    pattern: /vk\.com/i, platform: 'VKontakte', icon: '🔵', color: '#4680C2',
    extractUsername: (url) => extractPath(url, 0),
    buildProfileUrl: (u) => `https://vk.com/${u}`,
  },
  {
    pattern: /strava\.com/i, platform: 'Strava', icon: '🏃', color: '#FC4C02',
    extractUsername: (url) => {
      const m = url.match(/strava\.com\/athletes\/([A-Za-z0-9_-]+)/i);
      return m?.[1] || null;
    },
    buildProfileUrl: (u) => `https://strava.com/athletes/${u}`,
  },
  {
    pattern: /tumblr\.com/i, platform: 'Tumblr', icon: '📝', color: '#36465D',
    extractUsername: (url) => {
      const m = url.match(/([A-Za-z0-9_-]+)\.tumblr\.com/i);
      return m?.[1] || null;
    },
    buildProfileUrl: (u) => `https://${u}.tumblr.com`,
  },
  {
    pattern: /xing\.com/i, platform: 'Xing', icon: '💚', color: '#006567',
    extractUsername: (url) => {
      const m = url.match(/xing\.com\/profile\/([A-Za-z0-9_-]+)/i);
      return m?.[1] || null;
    },
    buildProfileUrl: (u) => `https://xing.com/profile/${u}`,
  },
  {
    pattern: /telegram\.me|t\.me/i, platform: 'Telegram', icon: '✈️', color: '#0088CC',
    extractUsername: (url) => {
      const m = url.match(/(?:telegram\.me|t\.me)\/([A-Za-z0-9_]+)/i);
      return m?.[1] || null;
    },
    buildProfileUrl: (u) => `https://t.me/${u}`,
  },
  {
    pattern: /flickr\.com/i, platform: 'Flickr', icon: '📷', color: '#0063DC',
    extractUsername: (url) => {
      const m = url.match(/flickr\.com\/(?:people|photos)\/([A-Za-z0-9@_-]+)/i);
      return m?.[1] || null;
    },
    buildProfileUrl: (u) => `https://flickr.com/people/${u}`,
  },
  {
    pattern: /dribbble\.com/i, platform: 'Dribbble', icon: '🏀', color: '#EA4C89',
    extractUsername: (url) => extractPath(url, 0),
    buildProfileUrl: (u) => `https://dribbble.com/${u}`,
  },
  {
    pattern: /behance\.net/i, platform: 'Behance', icon: '🎨', color: '#1769FF',
    extractUsername: (url) => extractPath(url, 0),
    buildProfileUrl: (u) => `https://behance.net/${u}`,
  },
  {
    pattern: /soundcloud\.com/i, platform: 'SoundCloud', icon: '🔊', color: '#FF5500',
    extractUsername: (url) => extractPath(url, 0),
    buildProfileUrl: (u) => `https://soundcloud.com/${u}`,
  },
  {
    pattern: /spotify\.com/i, platform: 'Spotify', icon: '🎧', color: '#1DB954',
    extractUsername: (url) => {
      const m = url.match(/spotify\.com\/user\/([A-Za-z0-9_-]+)/i);
      return m?.[1] || null;
    },
    buildProfileUrl: (u) => `https://open.spotify.com/user/${u}`,
  },
  {
    pattern: /wikitia\.com|wikipedia\.org/i, platform: 'Wiki', icon: '📖', color: '#636978',
    extractUsername: () => null,
    buildProfileUrl: (u) => u,
  },
];

function correlatePlatforms(results: FaceResult[]): PlatformMatch[] {
  const map = new Map<string, { platform: string; icon: string; color: string; rule: PlatformRule | null; results: FaceResult[] }>();

  for (const r of results) {
    const rule = PLATFORM_RULES.find(p => p.pattern.test(r.url));
    const key = rule?.platform || 'Other';
    if (!map.has(key)) {
      map.set(key, {
        platform: key,
        icon: rule?.icon || '🌐',
        color: rule?.color || '#71717A',
        rule: rule || null,
        results: [],
      });
    }
    map.get(key)!.results.push(r);
  }

  return Array.from(map.values())
    .map(g => {
      const avgScore = Math.round(g.results.reduce((s, r) => s + r.score, 0) / g.results.length);

      // Extract unique accounts
      const accountMap = new Map<string, { postCount: number; bestScore: number; profileUrl: string }>();

      for (const r of g.results) {
        const username = g.rule?.extractUsername(r.url) || null;
        if (username) {
          const key = username.toLowerCase();
          const existing = accountMap.get(key);
          if (existing) {
            existing.postCount++;
            existing.bestScore = Math.max(existing.bestScore, r.score);
          } else {
            accountMap.set(key, {
              postCount: 1,
              bestScore: r.score,
              profileUrl: g.rule!.buildProfileUrl(username),
            });
          }
        }
      }

      const accounts = Array.from(accountMap.entries())
        .map(([username, data]) => ({ username, ...data }))
        .sort((a, b) => b.bestScore - a.bestScore);

      return { ...g, avgScore, accounts };
    })
    .sort((a, b) => b.avgScore - a.avgScore);
}

/** Infer potential real name from URLs and usernames across all results */
function inferPotentialName(results: FaceResult[]): string | null {
  const nameCandidates = new Map<string, number>();

  // Only consider high-confidence matches to avoid wrong names from lookalikes
  const highConf = results.filter(r => r.score >= 75);
  if (highConf.length === 0) return null;

  // Common non-name words to filter out from slug-based extraction
  const stopWords = new Set([
    'bir', 'the', 'and', 'for', 'com', 'net', 'org', 'www', 'new', 'old',
    'best', 'top', 'how', 'what', 'why', 'who', 'all', 'get', 'buy', 'free',
    'blog', 'news', 'home', 'page', 'site', 'web', 'app', 'pro', 'dev',
    'turizm', 'travel', 'hotel', 'shop', 'store', 'online', 'digital',
    'media', 'group', 'team', 'service', 'services', 'agency', 'studio',
    'design', 'tech', 'data', 'info', 'guide', 'review', 'reviews',
    'product', 'products', 'urunu', 'urun', 'haber', 'video', 'photo',
    'article', 'post', 'about', 'contact', 'help', 'support',
  ]);

  const looksLikePersonName = (parts: string[]): boolean => {
    if (parts.length < 2 || parts.length > 4) return false;
    // Every part should be 2+ chars and not a stop word
    return parts.every(p => p.length >= 2 && !stopWords.has(p.toLowerCase()));
  };

  for (const r of highConf) {
    const url = r.url;

    // LinkedIn: /in/firstname-lastname (most reliable)
    const li = url.match(/linkedin\.com\/in\/([a-z]+-[a-z0-9-]+)/i);
    if (li) {
      const parts = li[1].split('-').filter(p => p.length > 1).slice(0, 3);
      if (looksLikePersonName(parts)) {
        const name = parts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        nameCandidates.set(name, (nameCandidates.get(name) || 0) + r.score * 2);
      }
    }

    // Crunchbase: /person/firstname-lastname
    const cb = url.match(/crunchbase\.com\/person\/([a-z]+-[a-z0-9-]+)/i);
    if (cb) {
      const parts = cb[1].split('-').filter(p => p.length > 1).slice(0, 3);
      if (looksLikePersonName(parts)) {
        const name = parts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        nameCandidates.set(name, (nameCandidates.get(name) || 0) + r.score * 1.5);
      }
    }

    // Forbes councils / profiles
    const fb = url.match(/forbes\.com\/(?:councils\/|profile\/)([a-z]+-[a-z0-9-]+)/i);
    if (fb) {
      const parts = fb[1].split('-').filter(p => p.length > 1).slice(0, 3);
      if (looksLikePersonName(parts)) {
        const name = parts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        nameCandidates.set(name, (nameCandidates.get(name) || 0) + r.score * 1.5);
      }
    }

    // Wiki pages: /wiki/Firstname_Lastname
    const wiki = url.match(/(?:wikitia|wikipedia)\.(?:com|org)\/wiki\/([A-Z][a-z]+_[A-Z][a-z_]+)/);
    if (wiki) {
      const name = wiki[1].replace(/_/g, ' ');
      nameCandidates.set(name, (nameCandidates.get(name) || 0) + r.score * 2);
    }
  }

  // If no structured name sources found, try to extract from the highest-scoring username
  if (nameCandidates.size === 0) {
    // Don't fall back to generic URL slugs — they're unreliable
    // Instead, show the top username as the subject identifier
    return null;
  }

  // Return the name with the highest cumulative score
  return Array.from(nameCandidates.entries())
    .sort((a, b) => b[1] - a[1])[0][0];
}

export default function DefenceFaceSearch() {
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [results, setResults] = useState<FaceResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [testingMode, setTestingMode] = useState(true);
  const [potentialName, setPotentialName] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<ResultTab>('results');
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [dossierLoading, setDossierLoading] = useState(false);
  const [searchProgress, setSearchProgress] = useState('');
  const [enrichment, setEnrichment] = useState<any>(null);
  const [enriching, setEnriching] = useState(false);
  const [usernameEnum, setUsernameEnum] = useState<any>(null);
  const [enumerating, setEnumerating] = useState(false);
  const [telegramOsint, setTelegramOsint] = useState<any>(null);
  const [telegramLoading, setTelegramLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const addFiles = useCallback((files: File[]) => {
    const valid = files.filter(f => {
      if (!f.type.startsWith('image/')) { toast.error(`${f.name} is not an image`); return false; }
      if (f.size > 10 * 1024 * 1024) { toast.error(`${f.name} exceeds 10MB`); return false; }
      return true;
    });
    if (valid.length === 0) return;
    const total = selectedFiles.length + valid.length;
    if (total > 5) { toast.error('Maximum 5 images allowed'); return; }
    setSelectedFiles(prev => [...prev, ...valid]);
    setResults([]);
    setErrorMsg('');
    valid.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreviews(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  }, [selectedFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    addFiles(files);
  }, [addFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) addFiles(files);
  }, [addFiles]);

  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const clearImage = () => {
    stopPolling();
    setSelectedFiles([]);
    setImagePreviews([]);
    setResults([]);
    setSearchState('idle');
    setErrorMsg('');
    setPotentialName(null);
    setSavedId(null);
    setDossier(null);
    setActiveTab('results');
    setSearchProgress('');
    setEnrichment(null);
    setUsernameEnum(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const generateDossier = useCallback(async () => {
    if (results.length === 0) return;
    setDossierLoading(true);
    setActiveTab('dossier');
    try {
      const platforms = correlatePlatforms(results);
      const allAccounts = platforms.flatMap(p =>
        p.accounts.map(a => ({ platform: p.platform, ...a }))
      );
      const platformsSummary = platforms.map(p => ({
        platform: p.platform, icon: p.icon, count: p.results.length, avgScore: p.avgScore,
      }));

      const { data, error } = await supabase.functions.invoke('face-dossier', {
        body: {
          subjectName: potentialName,
          totalMatches: results.length,
          bestScore: results.length > 0 ? Math.max(...results.map(r => r.score)) : 0,
          platforms: platformsSummary,
          accounts: allAccounts,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setDossier(data);
      toast.success('Intelligence dossier generated');
    } catch (err: any) {
      toast.error('Dossier generation failed: ' + (err.message || 'Unknown error'));
    } finally {
      setDossierLoading(false);
    }
  }, [results, potentialName]);

  const enrichProfiles = useCallback(async () => {
    if (results.length === 0) return;
    setEnriching(true);
    try {
      const platforms = correlatePlatforms(results);
      const allAccounts = platforms.flatMap(p =>
        p.accounts.map(a => ({ platform: p.platform, ...a }))
      );

      // Only send profiles with actual profile URLs (not post URLs)
      const profileUrls = allAccounts
        .filter(a => a.bestScore >= 70)
        .map(a => ({
          platform: a.platform,
          username: a.username,
          profileUrl: a.profileUrl,
          bestScore: a.bestScore,
        }));

      if (profileUrls.length === 0) {
        toast.error('No high-confidence profiles to enrich');
        return;
      }

      const { data, error } = await supabase.functions.invoke('scrape-profiles', {
        body: { profiles: profileUrls },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setEnrichment(data);

      // Update name if AI found a better one
      if (data?.extractedName && data.nameConfidence !== 'LOW') {
        setPotentialName(data.extractedName);
        toast.success(`Identity confirmed: ${data.extractedName}`);
      } else if (data?.enriched) {
        toast.success(`Scraped ${data.scrapedCount} profiles — no strong name match`);
      } else {
        toast.info(data?.reason || 'Could not enrich profiles');
      }
    } catch (err: any) {
      toast.error('Profile enrichment failed: ' + (err.message || 'Unknown error'));
    } finally {
      setEnriching(false);
    }
  }, [results]);

  // Auto-trigger profile enrichment when search completes
  useEffect(() => {
    if (searchState === 'complete' && results.length > 0 && !enrichment && !enriching) {
      enrichProfiles();
    }
  }, [searchState, results, enrichment, enriching, enrichProfiles]);

  // Username enumeration across 300+ platforms
  const enumerateUsernames = useCallback(async () => {
    if (results.length === 0) return;
    setEnumerating(true);
    try {
      const platforms = correlatePlatforms(results);
      const allAccounts = platforms.flatMap(p => p.accounts);
      // Get unique usernames from top-scoring accounts
      const usernames = [...new Set(
        allAccounts
          .sort((a, b) => b.bestScore - a.bestScore)
          .slice(0, 3)
          .map(a => a.username)
      )];

      if (usernames.length === 0) {
        toast.error('No usernames to enumerate');
        return;
      }

      toast.info(`Checking ${usernames.join(', ')} across 300+ platforms...`);

      const { data, error } = await supabase.functions.invoke('username-enum', {
        body: { usernames },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setUsernameEnum(data);
      const totalFound = data?.results?.reduce((sum: number, r: any) => sum + r.totalFound, 0) || 0;
      toast.success(`Found ${totalFound} accounts across ${data?.totalPlatformsChecked || 0} platforms`);
    } catch (err: any) {
      toast.error('Username enumeration failed: ' + (err.message || 'Unknown error'));
    } finally {
      setEnumerating(false);
    }
  }, [results]);

  // Auto-trigger username enumeration after enrichment completes
  useEffect(() => {
    if (enrichment?.enriched && !usernameEnum && !enumerating) {
      enumerateUsernames();
    }
  }, [enrichment, usernameEnum, enumerating, enumerateUsernames]);

  const exportReport = useCallback(async () => {
    if (results.length === 0) return;
    setExporting(true);
    try {
      const platforms = correlatePlatforms(results);
      const allAccounts = platforms.flatMap(p =>
        p.accounts.map(a => ({ platform: p.platform, ...a }))
      );
      const platformsSummary = platforms.map(p => ({
        platform: p.platform, icon: p.icon, count: p.results.length, avgScore: p.avgScore,
      }));

      // Get AI narrative
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const baseUrl = `https://${projectId}.supabase.co/functions/v1`;

      let narrative;
      try {
        const aiRes = await fetch(`${baseUrl}/face-report-ai`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subjectName: potentialName,
            totalMatches: results.length,
            bestScore: results.length > 0 ? Math.max(...results.map(r => r.score)) : 0,
            platforms: platformsSummary,
            accounts: allAccounts,
            testingMode,
          }),
        });
        narrative = await aiRes.json();
        if (narrative.error) throw new Error(narrative.error);
      } catch {
        narrative = {
          executiveSummary: `Facial recognition search identified ${results.length} matches across ${platforms.length} platforms. The highest confidence match scored ${results.length > 0 ? Math.max(...results.map(r => r.score)) : 0}%. ${allAccounts.length} unique accounts were correlated from the results.`,
          keyFindings: [
            `${results.length} total facial matches detected across public internet sources.`,
            `${allAccounts.length} unique social media accounts identified.`,
            `Highest confidence: ${results.length > 0 ? Math.max(...results.map(r => r.score)) : 0}%.`,
          ],
          riskAssessment: 'AI analysis unavailable. Manual review of identified accounts recommended.',
          platformAnalysis: `Matches distributed across ${platforms.length} platforms.`,
          accountCorrelation: `${allAccounts.length} accounts extracted from matched URLs.`,
          recommendations: ['Review all high-confidence matches manually.', 'Cross-reference identified accounts with existing intelligence.'],
          confidenceNote: 'AI narrative unavailable. Confidence scores are algorithmically generated by FaceCheck.id.',
        };
      }

      await generateFaceSearchReport({
        subjectName: potentialName,
        totalMatches: results.length,
        bestScore: results.length > 0 ? Math.max(...results.map(r => r.score)) : 0,
        testingMode,
        searchDate: new Date().toISOString(),
        platforms: platformsSummary,
        accounts: allAccounts,
        results: results.map(r => ({ url: r.url, score: r.score })),
        narrative,
        enrichment: enrichment || null,
      });

      toast.success('Intelligence report exported');
    } catch (err: any) {
      toast.error('Report export failed: ' + (err.message || 'Unknown error'));
    } finally {
      setExporting(false);
    }
  }, [results, potentialName, testingMode, enrichment]);

  const saveSearch = async (parsedResults: FaceResult[]) => {
    try {
      const platforms = correlatePlatforms(parsedResults);
      const name = inferPotentialName(parsedResults);
      setPotentialName(name);

      const allAccounts = platforms.flatMap(p =>
        p.accounts.map(a => ({ platform: p.platform, ...a }))
      );

      const { data, error } = await supabase.from('face_search_results' as any).insert({
        potential_name: name,
        total_matches: parsedResults.length,
        best_score: parsedResults.length > 0 ? Math.max(...parsedResults.map(r => r.score)) : 0,
        platforms: platforms.map(p => ({ platform: p.platform, icon: p.icon, count: p.results.length, avgScore: p.avgScore })),
        accounts: allAccounts,
        raw_results: parsedResults.slice(0, 50),
        testing_mode: testingMode,
      } as any).select('id').single();

      if (!error && data) {
        setSavedId((data as any).id);
        toast.success('Search saved to intelligence database');
      }
    } catch {
      // Non-critical
    }
  };

  const pollForResults = (baseUrl: string, anonKey: string, idSearch: string): Promise<FaceResult[]> => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 60;

      const interval = setInterval(async () => {
        attempts++;
        if (attempts > maxAttempts) {
          clearInterval(interval);
          reject(new Error('Search timed out after 5 minutes'));
          return;
        }

        try {
          const url = new URL(`${baseUrl}/facecheck-search`);
          url.searchParams.set('action', 'status');

          const statusRes = await fetch(url.toString(), {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${anonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id_search: idSearch, testing: testingMode }),
          });

          const statusData = await statusRes.json();

          if (statusData.output) {
            clearInterval(interval);
            resolve(parseResults(statusData.output));
          } else if (!statusRes.ok || statusData.error) {
            clearInterval(interval);
            reject(new Error(statusData.error || 'Search failed'));
          }
        } catch {
          // Continue polling
        }
      }, 5000);

      pollRef.current = interval;
    });
  };

  const startSearch = async () => {
    if (selectedFiles.length === 0) return;

    try {
      stopPolling();
      setSearchState('uploading');
      setProgress(0);
      setResults([]);

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const baseUrl = `https://${projectId}.supabase.co/functions/v1`;

      const allResults: FaceResult[] = [];
      const totalFiles = selectedFiles.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = selectedFiles[i];
        const fileLabel = totalFiles > 1 ? `[${i + 1}/${totalFiles}] ` : '';

        // Upload
        setSearchProgress(`${fileLabel}Uploading ${file.name}...`);
        setSearchState('uploading');
        setProgress(((i * 2) / (totalFiles * 2)) * 100);

        const formData = new FormData();
        formData.append('image', file);

        const uploadRes = await fetch(`${baseUrl}/facecheck-search?action=upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${anonKey}` },
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.id_search) {
          throw new Error(uploadData.error || `Upload failed for image ${i + 1}`);
        }

        const idSearch = uploadData.id_search;

        // Start search
        setSearchState('searching');
        setSearchProgress(`${fileLabel}Scanning faces...`);
        setProgress(((i * 2 + 1) / (totalFiles * 2)) * 100);

        const searchRes = await fetch(`${baseUrl}/facecheck-search?action=search`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id_search: idSearch, testing: testingMode }),
        });

        const searchData = await searchRes.json();
        if (!searchRes.ok || searchData?.error) {
          throw new Error(searchData?.error || `Search failed for image ${i + 1}`);
        }

        // Get results
        let imageResults: FaceResult[];
        if (searchData?.output) {
          imageResults = parseResults(searchData.output);
        } else {
          setSearchProgress(`${fileLabel}Waiting for results...`);
          imageResults = await pollForResults(baseUrl, anonKey, idSearch);
        }

        allResults.push(...imageResults);
      }

      // Deduplicate by URL, keeping highest score
      const urlMap = new Map<string, FaceResult>();
      for (const r of allResults) {
        const existing = urlMap.get(r.url);
        if (!existing || r.score > existing.score) {
          urlMap.set(r.url, r);
        }
      }
      const dedupedResults = Array.from(urlMap.values()).sort((a, b) => b.score - a.score);

      setResults(dedupedResults);
      setSearchState('complete');
      setProgress(100);
      setSearchProgress('');
      saveSearch(dedupedResults);

      if (totalFiles > 1) {
        toast.success(`Cross-referenced ${totalFiles} images — ${dedupedResults.length} unique matches found`);
      }

    } catch (err: any) {
      stopPolling();
      setSearchState('error');
      setErrorMsg(err.message || 'Search failed');
      setSearchProgress('');
    }
  };

  const parseResults = (output: any): FaceResult[] => {
    if (!output?.items) return [];
    return output.items
      .filter((item: any) => item.score > 0)
      .sort((a: any, b: any) => b.score - a.score);
  };

  const getResultImage = (result: FaceResult & Record<string, any>): string | null => {
    const b64 = result.base64 || (result as any).image_base64 || (result as any).thumbnail;
    if (b64) return b64.startsWith('data:') ? b64 : `data:image/jpeg;base64,${b64}`;
    if (result.image_url) return result.image_url;
    return null;
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold" style={{ color: 'var(--v3-text)' }}>Face Search</h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--v3-text-muted)' }}>
          Upload a face image to search across the internet using FaceCheck.id reverse image search
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div
            className="rounded-xl border p-6"
            style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
          >
            <h2 className="text-[13px] font-semibold mb-4" style={{ color: 'var(--v3-text)' }}>
              Upload Images <span className="font-normal text-[11px]" style={{ color: 'var(--v3-text-muted)' }}>(up to 5)</span>
            </h2>

            {/* Drop zone - always show if under 5 images */}
            {imagePreviews.length < 5 && (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-colors hover:border-[var(--v3-accent)]"
                style={{ borderColor: 'var(--v3-border)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--v3-accent-muted)' }}>
                  <Upload size={18} style={{ color: 'var(--v3-accent)' }} />
                </div>
                <div className="text-center">
                  <p className="text-[12px] font-medium" style={{ color: 'var(--v3-text-secondary)' }}>
                    {imagePreviews.length === 0 ? 'Drop images or click to upload' : 'Add more images'}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--v3-text-muted)' }}>
                    JPG, PNG up to 10MB each
                  </p>
                </div>
              </div>
            )}

            {/* Image previews grid */}
            {imagePreviews.length > 0 && (
              <div className={`grid gap-2 mt-3 ${imagePreviews.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${idx + 1}`}
                      className="w-full rounded-lg object-cover"
                      style={{ maxHeight: imagePreviews.length === 1 ? '200px' : '120px' }}
                    />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md flex items-center justify-center bg-black/60 text-white hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X size={12} />
                    </button>
                    <span className="absolute bottom-1.5 left-1.5 text-[9px] px-1.5 py-0.5 rounded-md bg-black/60 text-white font-medium">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {imagePreviews.length > 0 && (
              <button
                onClick={clearImage}
                className="w-full mt-2 text-[11px] py-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--v3-text-muted)' }}
              >
                Clear all
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Testing mode toggle */}
            <div className="flex items-center justify-between mt-4 py-3 px-3 rounded-lg" style={{ background: 'var(--v3-bg)' }}>
              <div>
                <p className="text-[12px] font-medium" style={{ color: 'var(--v3-text-secondary)' }}>Testing Mode</p>
                <p className="text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>No credits consumed</p>
              </div>
              <button
                onClick={() => setTestingMode(!testingMode)}
                className={`w-9 h-5 rounded-full transition-colors relative ${testingMode ? 'bg-[var(--v3-accent)]' : 'bg-zinc-600'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${testingMode ? 'left-[18px]' : 'left-0.5'}`} />
              </button>
            </div>

            {/* Search button */}
            <button
              onClick={startSearch}
              disabled={selectedFiles.length === 0 || searchState === 'uploading' || searchState === 'searching'}
              className="w-full mt-4 py-2.5 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: selectedFiles.length > 0 ? 'var(--v3-accent)' : 'var(--v3-surface-hover)',
                color: selectedFiles.length > 0 ? 'white' : 'var(--v3-text-muted)',
              }}
            >
              {searchState === 'uploading' && <Loader2 size={14} className="animate-spin" />}
              {searchState === 'searching' && <Loader2 size={14} className="animate-spin" />}
              {searchState === 'idle' && <Search size={14} />}
              {searchState === 'complete' && <CheckCircle2 size={14} />}
              {searchState === 'uploading' ? 'Uploading...' :
               searchState === 'searching' ? 'Searching...' :
               searchState === 'complete' ? 'Search Again' :
               selectedFiles.length > 1 ? `Search ${selectedFiles.length} Faces` : 'Search Face'}
            </button>

            {/* Progress bar */}
            {(searchState === 'uploading' || searchState === 'searching') && (
              <div className="mt-3">
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--v3-bg)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'var(--v3-accent)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-[10px] mt-1.5 text-center" style={{ color: 'var(--v3-text-muted)' }}>
                  {searchProgress || (searchState === 'uploading' ? 'Uploading image...' : `Scanning faces — ${Math.round(progress)}%`)}
                </p>
              </div>
            )}
          </div>

          {/* Warning */}
          {!testingMode && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border p-4 flex items-start gap-3"
              style={{ background: 'rgba(251, 191, 36, 0.08)', borderColor: 'rgba(251, 191, 36, 0.2)' }}
            >
              <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-medium text-amber-300">Production Mode Active</p>
                <p className="text-[11px] text-amber-400/70 mt-0.5">Each image search costs 3 credits (0.30 USD) — {selectedFiles.length} image{selectedFiles.length !== 1 ? 's' : ''} = {selectedFiles.length * 3} credits</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          <div
            className="rounded-xl border min-h-[400px]"
            style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
          >
            <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--v3-border)' }}>
              <div className="flex items-center gap-1">
                {results.length > 0 && (
                  <>
                    <button
                      onClick={() => setActiveTab('results')}
                      className="text-[12px] font-medium px-3 py-1.5 rounded-lg transition-all"
                      style={{
                        background: activeTab === 'results' ? 'var(--v3-accent-muted)' : 'transparent',
                        color: activeTab === 'results' ? 'var(--v3-accent)' : 'var(--v3-text-muted)',
                      }}
                    >
                      Matches ({results.length})
                    </button>
                    <button
                      onClick={() => dossier ? setActiveTab('dossier') : generateDossier()}
                      disabled={dossierLoading}
                      className="text-[12px] font-medium px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                      style={{
                        background: activeTab === 'dossier' ? 'var(--v3-accent-muted)' : 'transparent',
                        color: activeTab === 'dossier' ? 'var(--v3-accent)' : 'var(--v3-text-muted)',
                      }}
                    >
                      {dossierLoading ? <Loader2 size={11} className="animate-spin" /> : <Brain size={11} />}
                      Intelligence Dossier
                    </button>
                  </>
                )}
                {results.length === 0 && (
                  <span className="text-[13px] font-semibold" style={{ color: 'var(--v3-text)' }}>Results</span>
                )}
              </div>
              {results.length > 0 && (
                <div className="flex items-center gap-2">
                  {testingMode && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-400">
                      TEST MODE
                    </span>
                  )}
                  <button
                    onClick={exportReport}
                    disabled={exporting}
                    className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
                    style={{ background: 'var(--v3-accent-muted)', color: 'var(--v3-accent)' }}
                  >
                    {exporting ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
                    {exporting ? 'Generating...' : 'Export Report'}
                  </button>
                </div>
              )}
            </div>

            {searchState === 'error' && (
              <div className="p-8 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-500/10">
                  <AlertTriangle size={20} className="text-red-400" />
                </div>
                <p className="text-[13px] font-medium text-red-400">{errorMsg}</p>
              </div>
            )}

            {searchState === 'idle' && results.length === 0 && (
              <div className="p-12 flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'var(--v3-accent-muted)' }}>
                  <ImageIcon size={24} style={{ color: 'var(--v3-accent)' }} />
                </div>
                <p className="text-[13px] font-medium" style={{ color: 'var(--v3-text-secondary)' }}>
                  Upload an image to begin
                </p>
                <p className="text-[11px]" style={{ color: 'var(--v3-text-muted)' }}>
                  Face search will find matching faces across the internet
                </p>
              </div>
            )}

            {(searchState === 'uploading' || searchState === 'searching') && results.length === 0 && (
              <div className="p-12 flex flex-col items-center gap-3">
                <Loader2 size={28} className="animate-spin" style={{ color: 'var(--v3-accent)' }} />
                <p className="text-[13px] font-medium" style={{ color: 'var(--v3-text-secondary)' }}>
                  {searchState === 'uploading' ? 'Processing image...' : 'Scanning facial databases...'}
                </p>
              </div>
            )}

            {results.length > 0 && activeTab === 'results' && (
              <div className="p-4 space-y-4">
                {/* Correlated Intelligence */}
                <div className="rounded-xl border p-4 space-y-4" style={{ borderColor: 'var(--v3-border)', background: 'var(--v3-bg)' }}>
                  {/* Subject Identity Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--v3-accent-muted)' }}>
                        <UserCircle size={20} style={{ color: 'var(--v3-accent)' }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-[14px] font-bold" style={{ color: 'var(--v3-text)' }}>
                            {potentialName || (() => {
                              // Show top username if no real name inferred
                              const platforms = correlatePlatforms(results);
                              const topAccount = platforms.flatMap(p => p.accounts).sort((a, b) => b.bestScore - a.bestScore)[0];
                              return topAccount ? `@${topAccount.username}` : 'Unknown Subject';
                            })()}
                          </h3>
                          {potentialName ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-400">
                              INFERRED
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-zinc-500/10 text-zinc-400">
                              USERNAME
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--v3-text-muted)' }}>
                          {results.length} matches across {correlatePlatforms(results).length} platforms
                          {results.length > 0 && ` · Best match ${Math.max(...results.map(r => r.score))}%`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {savedId && (
                        <div className="flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-lg" style={{ background: 'var(--v3-surface)', color: 'var(--v3-accent)' }}>
                          <Save size={10} />
                          Saved
                        </div>
                      )}
                      <button
                        onClick={enrichProfiles}
                        disabled={enriching || enrichment?.enriched}
                        className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-lg transition-all disabled:opacity-40"
                        style={{ background: enrichment?.enriched ? 'rgba(34,197,94,0.1)' : 'var(--v3-accent-muted)', color: enrichment?.enriched ? '#22c55e' : 'var(--v3-accent)' }}
                      >
                        {enriching ? <Loader2 size={10} className="animate-spin" /> : enrichment?.enriched ? <CheckCircle2 size={10} /> : <ScanSearch size={10} />}
                        {enriching ? 'Scraping...' : enrichment?.enriched ? 'Enriched' : 'Enrich Profiles'}
                      </button>
                    </div>
                  </div>

                  {/* Enrichment results */}
                  {enrichment?.enriched && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border p-3 space-y-2"
                      style={{ borderColor: 'rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.05)' }}
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles size={12} className="text-emerald-400" />
                        <span className="text-[10px] font-semibold tracking-wider uppercase text-emerald-400">
                          Profile Intelligence
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{
                          background: enrichment.nameConfidence === 'HIGH' ? 'rgba(34,197,94,0.15)' : enrichment.nameConfidence === 'MEDIUM' ? 'rgba(251,191,36,0.15)' : 'rgba(161,161,170,0.15)',
                          color: enrichment.nameConfidence === 'HIGH' ? '#22c55e' : enrichment.nameConfidence === 'MEDIUM' ? '#fbbf24' : '#a1a1aa',
                        }}>
                          {enrichment.nameConfidence} CONFIDENCE
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                        {enrichment.extractedName && (
                          <div>
                            <p className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--v3-text-muted)' }}>Full Name</p>
                            <p className="text-[12px] font-semibold" style={{ color: 'var(--v3-text)' }}>{enrichment.extractedName}</p>
                          </div>
                        )}
                        {enrichment.occupation && (
                          <div>
                            <p className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--v3-text-muted)' }}>Occupation</p>
                            <p className="text-[12px]" style={{ color: 'var(--v3-text-secondary)' }}>{enrichment.occupation}</p>
                          </div>
                        )}
                        {enrichment.location && (
                          <div>
                            <p className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--v3-text-muted)' }}>Location</p>
                            <p className="text-[12px]" style={{ color: 'var(--v3-text-secondary)' }}>{enrichment.location}</p>
                          </div>
                        )}
                        {enrichment.organization && (
                          <div>
                            <p className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--v3-text-muted)' }}>Organization</p>
                            <p className="text-[12px]" style={{ color: 'var(--v3-text-secondary)' }}>{enrichment.organization}</p>
                          </div>
                        )}
                      </div>
                      {enrichment.bio && (
                        <div>
                          <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--v3-text-muted)' }}>Bio</p>
                          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--v3-text-secondary)' }}>{enrichment.bio}</p>
                        </div>
                      )}
                      {enrichment.crossReferenceNotes && (
                        <p className="text-[10px] italic" style={{ color: 'var(--v3-text-muted)' }}>
                          {enrichment.crossReferenceNotes}
                        </p>
                      )}
                    </motion.div>
                  )}

                  {/* Username Enumeration Results */}
                  {(enumerating || usernameEnum?.success) && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border p-3 space-y-3"
                      style={{ borderColor: 'rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.05)' }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Network size={12} className="text-indigo-400" />
                          <span className="text-[10px] font-semibold tracking-wider uppercase text-indigo-400">
                            Username Enumeration
                          </span>
                          {usernameEnum?.totalPlatformsChecked && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                              {usernameEnum.totalPlatformsChecked} PLATFORMS CHECKED
                            </span>
                          )}
                        </div>
                        {enumerating && <Loader2 size={12} className="animate-spin text-indigo-400" />}
                      </div>

                      {enumerating && !usernameEnum && (
                        <div className="flex items-center gap-2">
                          <div className="h-1 flex-1 rounded-full overflow-hidden" style={{ background: 'var(--v3-border)' }}>
                            <motion.div
                              className="h-full rounded-full bg-indigo-500"
                              initial={{ width: '0%' }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 30, ease: 'linear' }}
                            />
                          </div>
                          <span className="text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>Scanning...</span>
                        </div>
                      )}

                      {usernameEnum?.results?.map((userResult: any) => (
                        <div key={userResult.username} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold" style={{ color: 'var(--v3-text)' }}>
                              @{userResult.username}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{
                              background: userResult.totalFound > 20 ? 'rgba(239,68,68,0.1)' : userResult.totalFound > 10 ? 'rgba(251,191,36,0.1)' : 'rgba(99,102,241,0.1)',
                              color: userResult.totalFound > 20 ? '#ef4444' : userResult.totalFound > 10 ? '#fbbf24' : '#818cf8',
                            }}>
                              {userResult.totalFound} accounts found
                            </span>
                          </div>

                          {/* Category breakdown */}
                          {userResult.categories && Object.entries(userResult.categories).map(([category, platformList]: [string, any]) => (
                            <div key={category}>
                              <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: 'var(--v3-text-muted)' }}>
                                {category} ({platformList.length})
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {platformList.map((platform: string) => {
                                  const matchData = userResult.platforms.find((p: any) => p.platform === platform);
                                  return (
                                    <a
                                      key={platform}
                                      href={matchData?.url || '#'}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] px-2 py-0.5 rounded-md border transition-all hover:scale-105"
                                      style={{ borderColor: 'var(--v3-border)', color: 'var(--v3-text-secondary)', background: 'var(--v3-surface)' }}
                                    >
                                      {platform}
                                    </a>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* Platform Breakdown */}
                  <div className="flex items-center gap-2">
                    <Link2 size={12} style={{ color: 'var(--v3-text-muted)' }} />
                    <span className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: 'var(--v3-text-muted)' }}>
                      Platform Breakdown
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {correlatePlatforms(results).map((pm) => (
                      <motion.div
                        key={pm.platform}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-lg border p-3 space-y-1.5 cursor-default"
                        style={{ borderColor: 'var(--v3-border)' }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base leading-none">{pm.icon}</span>
                          <span className="text-[12px] font-semibold" style={{ color: 'var(--v3-text)' }}>{pm.platform}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>
                            {pm.results.length} match{pm.results.length !== 1 ? 'es' : ''}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              pm.avgScore > 90 ? 'bg-red-500/10 text-red-400' :
                              pm.avgScore > 70 ? 'bg-amber-500/10 text-amber-400' :
                              'bg-zinc-500/10 text-zinc-400'
                            }`}
                          >
                            {pm.avgScore}%
                          </span>
                        </div>
                        <div className="space-y-1 pt-1 border-t" style={{ borderColor: 'var(--v3-border)' }}>
                          {pm.accounts.length > 0 ? (
                            pm.accounts.slice(0, 4).map((acc) => (
                              <a
                                key={acc.username}
                                href={acc.profileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between gap-1 group/acc"
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <User size={10} style={{ color: pm.color }} className="shrink-0" />
                                  <span className="text-[11px] font-medium truncate group-hover/acc:underline" style={{ color: pm.color }}>
                                    @{acc.username}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {acc.postCount > 1 && (
                                    <span className="text-[9px]" style={{ color: 'var(--v3-text-muted)' }}>
                                      {acc.postCount} hits
                                    </span>
                                  )}
                                  <span className={`text-[9px] font-bold px-1 py-px rounded ${
                                    acc.bestScore > 90 ? 'bg-red-500/10 text-red-400' :
                                    acc.bestScore > 70 ? 'bg-amber-500/10 text-amber-400' :
                                    'bg-zinc-500/10 text-zinc-400'
                                  }`}>
                                    {acc.bestScore}%
                                  </span>
                                </div>
                              </a>
                            ))
                          ) : (
                            pm.results.slice(0, 2).map((r, i) => (
                              <a
                                key={i}
                                href={r.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] truncate block hover:underline"
                                style={{ color: pm.color }}
                              >
                                {r.url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 40)}…
                              </a>
                            ))
                          )}
                          {pm.accounts.length > 4 && (
                            <span className="text-[9px]" style={{ color: 'var(--v3-text-muted)' }}>
                              +{pm.accounts.length - 4} more accounts
                            </span>
                          )}
                          {pm.accounts.length > 0 && pm.results.length - pm.accounts.reduce((s, a) => s + a.postCount, 0) > 0 && (
                            <span className="text-[9px]" style={{ color: 'var(--v3-text-muted)' }}>
                              +{pm.results.length - pm.accounts.reduce((s, a) => s + a.postCount, 0)} unattributed
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* All Results Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AnimatePresence>
                  {results.map((result, i) => (
                    <motion.a
                      key={`${result.url}-${i}`}
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-xl border p-3 flex items-start gap-3 transition-colors group cursor-pointer"
                      style={{ borderColor: 'var(--v3-border)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--v3-surface-hover)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      {getResultImage(result) ? (
                        <img
                          src={getResultImage(result)!}
                          alt="Match"
                          className="w-14 h-14 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg shrink-0 flex items-center justify-center" style={{ background: 'var(--v3-bg)' }}>
                          <ImageIcon size={18} style={{ color: 'var(--v3-text-muted)' }} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              result.score > 90 ? 'bg-red-500/10 text-red-400' :
                              result.score > 70 ? 'bg-amber-500/10 text-amber-400' :
                              'bg-zinc-500/10 text-zinc-400'
                            }`}
                          >
                            {result.score}%
                          </span>
                          <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--v3-text-muted)' }} />
                        </div>
                        <p className="text-[11px] truncate mt-1" style={{ color: 'var(--v3-text-muted)' }}>
                          {result.url}
                        </p>
                      </div>
                    </motion.a>
                  ))}
                </AnimatePresence>
              </div>
              </div>
            )}

            {/* Dossier Tab */}
            {activeTab === 'dossier' && (
              <div className="p-4 space-y-4">
                {dossierLoading && (
                  <div className="py-16 flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--v3-accent-muted)' }}>
                        <Brain size={28} style={{ color: 'var(--v3-accent)' }} />
                      </div>
                      <Loader2 size={16} className="animate-spin absolute -top-1 -right-1" style={{ color: 'var(--v3-accent)' }} />
                    </div>
                    <div className="text-center">
                      <p className="text-[13px] font-semibold" style={{ color: 'var(--v3-text)' }}>Generating Intelligence Dossier</p>
                      <p className="text-[11px] mt-1" style={{ color: 'var(--v3-text-muted)' }}>
                        Cross-referencing accounts and building subject profile...
                      </p>
                    </div>
                  </div>
                )}

                {dossier && !dossierLoading && (
                  <div className="space-y-4">
                    {/* Identity Card */}
                    {dossier.identity && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border p-5 space-y-4"
                        style={{ borderColor: 'var(--v3-border)', background: 'var(--v3-bg)' }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <UserCircle size={14} style={{ color: 'var(--v3-accent)' }} />
                          <span className="text-[11px] font-bold tracking-wider uppercase" style={{ color: 'var(--v3-accent)' }}>Subject Identity</span>
                          {dossier.identity.nameConfidence && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                              dossier.identity.nameConfidence === 'CONFIRMED' || dossier.identity.nameConfidence === 'HIGH'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : dossier.identity.nameConfidence === 'MEDIUM'
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-zinc-500/10 text-zinc-400'
                            }`}>
                              {dossier.identity.nameConfidence}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[10px] font-medium" style={{ color: 'var(--v3-text-muted)' }}>Full Name</p>
                            <p className="text-[14px] font-bold mt-0.5" style={{ color: 'var(--v3-text)' }}>
                              {dossier.identity.fullName || potentialName || 'Unknown'}
                            </p>
                          </div>
                          {dossier.identity.possibleOccupation && (
                            <div>
                              <p className="text-[10px] font-medium" style={{ color: 'var(--v3-text-muted)' }}>Occupation</p>
                              <p className="text-[13px] font-semibold mt-0.5" style={{ color: 'var(--v3-text)' }}>
                                {dossier.identity.possibleOccupation}
                              </p>
                            </div>
                          )}
                          {dossier.identity.possibleLocation && (
                            <div className="flex items-start gap-1.5">
                              <MapPin size={11} className="mt-0.5 shrink-0" style={{ color: 'var(--v3-text-muted)' }} />
                              <div>
                                <p className="text-[10px] font-medium" style={{ color: 'var(--v3-text-muted)' }}>Location</p>
                                <p className="text-[12px] font-medium" style={{ color: 'var(--v3-text)' }}>{dossier.identity.possibleLocation}</p>
                              </div>
                            </div>
                          )}
                          {dossier.identity.possibleNationality && (
                            <div>
                              <p className="text-[10px] font-medium" style={{ color: 'var(--v3-text-muted)' }}>Nationality</p>
                              <p className="text-[12px] font-medium" style={{ color: 'var(--v3-text)' }}>{dossier.identity.possibleNationality}</p>
                            </div>
                          )}
                          {dossier.identity.possibleAge && (
                            <div>
                              <p className="text-[10px] font-medium" style={{ color: 'var(--v3-text-muted)' }}>Est. Age</p>
                              <p className="text-[12px] font-medium" style={{ color: 'var(--v3-text)' }}>{dossier.identity.possibleAge}</p>
                            </div>
                          )}
                        </div>

                        {dossier.identity.aliases && dossier.identity.aliases.length > 0 && (
                          <div>
                            <p className="text-[10px] font-medium mb-1.5" style={{ color: 'var(--v3-text-muted)' }}>Known Aliases</p>
                            <div className="flex flex-wrap gap-1.5">
                              {dossier.identity.aliases.map((alias, i) => (
                                <span key={i} className="text-[10px] px-2 py-0.5 rounded-md font-mono" style={{ background: 'var(--v3-surface)', color: 'var(--v3-text-secondary)' }}>
                                  @{alias}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Professional Intel */}
                    {dossier.professionalIntel && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="rounded-xl border p-5 space-y-3"
                        style={{ borderColor: 'var(--v3-border)', background: 'var(--v3-bg)' }}
                      >
                        <div className="flex items-center gap-2">
                          <Briefcase size={14} style={{ color: 'var(--v3-accent)' }} />
                          <span className="text-[11px] font-bold tracking-wider uppercase" style={{ color: 'var(--v3-accent)' }}>Professional Intelligence</span>
                          {dossier.professionalIntel.publicProfile && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                              dossier.professionalIntel.publicProfile === 'PUBLIC_FIGURE' ? 'bg-red-500/10 text-red-400' :
                              dossier.professionalIntel.publicProfile === 'HIGH' ? 'bg-amber-500/10 text-amber-400' :
                              'bg-zinc-500/10 text-zinc-400'
                            }`}>
                              {dossier.professionalIntel.publicProfile}
                            </span>
                          )}
                        </div>
                        {dossier.professionalIntel.summary && (
                          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--v3-text-secondary)' }}>
                            {dossier.professionalIntel.summary}
                          </p>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          {dossier.professionalIntel.organizations && dossier.professionalIntel.organizations.length > 0 && (
                            <div>
                              <p className="text-[10px] font-medium mb-1" style={{ color: 'var(--v3-text-muted)' }}>Organizations</p>
                              {dossier.professionalIntel.organizations.map((org, i) => (
                                <p key={i} className="text-[11px] font-medium" style={{ color: 'var(--v3-text)' }}>• {org}</p>
                              ))}
                            </div>
                          )}
                          {dossier.professionalIntel.roles && dossier.professionalIntel.roles.length > 0 && (
                            <div>
                              <p className="text-[10px] font-medium mb-1" style={{ color: 'var(--v3-text-muted)' }}>Roles</p>
                              {dossier.professionalIntel.roles.map((role, i) => (
                                <p key={i} className="text-[11px] font-medium" style={{ color: 'var(--v3-text)' }}>• {role}</p>
                              ))}
                            </div>
                          )}
                        </div>
                        {dossier.professionalIntel.industry && (
                          <p className="text-[11px]" style={{ color: 'var(--v3-text-muted)' }}>
                            <span className="font-medium">Industry:</span> {dossier.professionalIntel.industry}
                          </p>
                        )}
                      </motion.div>
                    )}

                    {/* Digital Presence */}
                    {dossier.digitalPresence && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-xl border p-5 space-y-3"
                        style={{ borderColor: 'var(--v3-border)', background: 'var(--v3-bg)' }}
                      >
                        <div className="flex items-center gap-2">
                          <Globe size={14} style={{ color: 'var(--v3-accent)' }} />
                          <span className="text-[11px] font-bold tracking-wider uppercase" style={{ color: 'var(--v3-accent)' }}>Digital Footprint</span>
                          {dossier.digitalPresence.footprintSize && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                              dossier.digitalPresence.footprintSize === 'EXTENSIVE' ? 'bg-red-500/10 text-red-400' :
                              dossier.digitalPresence.footprintSize === 'SIGNIFICANT' ? 'bg-amber-500/10 text-amber-400' :
                              'bg-zinc-500/10 text-zinc-400'
                            }`}>
                              {dossier.digitalPresence.footprintSize}
                            </span>
                          )}
                        </div>

                        {dossier.digitalPresence.professionalProfiles && dossier.digitalPresence.professionalProfiles.length > 0 && (
                          <div>
                            <p className="text-[10px] font-medium mb-1.5" style={{ color: 'var(--v3-text-muted)' }}>Professional Profiles</p>
                            <div className="space-y-1.5">
                              {dossier.digitalPresence.professionalProfiles.map((p, i) => (
                                <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--v3-surface-hover)] transition-colors group">
                                  <div className="flex items-center gap-2">
                                    <Briefcase size={11} style={{ color: 'var(--v3-accent)' }} />
                                    <span className="text-[11px] font-medium group-hover:underline" style={{ color: 'var(--v3-text)' }}>{p.platform}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>{p.significance}</span>
                                    <ExternalLink size={10} style={{ color: 'var(--v3-text-muted)' }} />
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {dossier.digitalPresence.socialProfiles && dossier.digitalPresence.socialProfiles.length > 0 && (
                          <div>
                            <p className="text-[10px] font-medium mb-1.5" style={{ color: 'var(--v3-text-muted)' }}>Social Profiles</p>
                            <div className="space-y-1.5">
                              {dossier.digitalPresence.socialProfiles.map((p, i) => (
                                <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--v3-surface-hover)] transition-colors group">
                                  <div className="flex items-center gap-2">
                                    <User size={11} style={{ color: 'var(--v3-text-secondary)' }} />
                                    <span className="text-[11px] font-medium group-hover:underline" style={{ color: 'var(--v3-text)' }}>{p.platform}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>{p.significance}</span>
                                    <ExternalLink size={10} style={{ color: 'var(--v3-text-muted)' }} />
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Risk Profile */}
                    {dossier.riskProfile && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="rounded-xl border p-5 space-y-3"
                        style={{ borderColor: 'var(--v3-border)', background: 'var(--v3-bg)' }}
                      >
                        <div className="flex items-center gap-2">
                          <Shield size={14} style={{ color: 'var(--v3-accent)' }} />
                          <span className="text-[11px] font-bold tracking-wider uppercase" style={{ color: 'var(--v3-accent)' }}>OPSEC & Risk Profile</span>
                          <div className="flex items-center gap-1.5">
                            {dossier.riskProfile.opsecLevel && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                                dossier.riskProfile.opsecLevel === 'POOR' ? 'bg-red-500/10 text-red-400' :
                                dossier.riskProfile.opsecLevel === 'BASIC' ? 'bg-amber-500/10 text-amber-400' :
                                'bg-emerald-500/10 text-emerald-400'
                              }`}>
                                OPSEC: {dossier.riskProfile.opsecLevel}
                              </span>
                            )}
                            {dossier.riskProfile.exposureLevel && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                                dossier.riskProfile.exposureLevel === 'CRITICAL' || dossier.riskProfile.exposureLevel === 'HIGH' ? 'bg-red-500/10 text-red-400' :
                                dossier.riskProfile.exposureLevel === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400' :
                                'bg-emerald-500/10 text-emerald-400'
                              }`}>
                                EXPOSURE: {dossier.riskProfile.exposureLevel}
                              </span>
                            )}
                          </div>
                        </div>
                        {dossier.riskProfile.dataLeakRisk && (
                          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--v3-text-secondary)' }}>
                            {dossier.riskProfile.dataLeakRisk}
                          </p>
                        )}
                        {dossier.riskProfile.vulnerabilities && dossier.riskProfile.vulnerabilities.length > 0 && (
                          <div>
                            <p className="text-[10px] font-medium mb-1.5" style={{ color: 'var(--v3-text-muted)' }}>Vulnerabilities</p>
                            <div className="space-y-1">
                              {dossier.riskProfile.vulnerabilities.map((v, i) => (
                                <div key={i} className="flex items-start gap-2 p-1.5">
                                  <AlertTriangle size={10} className="shrink-0 mt-0.5 text-amber-400" />
                                  <span className="text-[11px]" style={{ color: 'var(--v3-text-secondary)' }}>{v}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Connections & Geographic */}
                    {dossier.connections && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-xl border p-5 space-y-3"
                        style={{ borderColor: 'var(--v3-border)', background: 'var(--v3-bg)' }}
                      >
                        <div className="flex items-center gap-2">
                          <Network size={14} style={{ color: 'var(--v3-accent)' }} />
                          <span className="text-[11px] font-bold tracking-wider uppercase" style={{ color: 'var(--v3-accent)' }}>Connections & Geolocation</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {dossier.connections.geographicTies && dossier.connections.geographicTies.length > 0 && (
                            <div>
                              <p className="text-[10px] font-medium mb-1.5" style={{ color: 'var(--v3-text-muted)' }}>Geographic Ties</p>
                              {dossier.connections.geographicTies.map((g, i) => (
                                <div key={i} className="flex items-center gap-1.5 mb-1">
                                  <MapPin size={10} style={{ color: 'var(--v3-text-muted)' }} />
                                  <span className="text-[11px]" style={{ color: 'var(--v3-text)' }}>{g}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {dossier.connections.languageIndicators && dossier.connections.languageIndicators.length > 0 && (
                            <div>
                              <p className="text-[10px] font-medium mb-1.5" style={{ color: 'var(--v3-text-muted)' }}>Languages</p>
                              <div className="flex flex-wrap gap-1">
                                {dossier.connections.languageIndicators.map((l, i) => (
                                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-md" style={{ background: 'var(--v3-surface)', color: 'var(--v3-text-secondary)' }}>{l}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {dossier.connections.inferredNetwork && dossier.connections.inferredNetwork.length > 0 && (
                            <div>
                              <p className="text-[10px] font-medium mb-1.5" style={{ color: 'var(--v3-text-muted)' }}>Inferred Network</p>
                              {dossier.connections.inferredNetwork.slice(0, 5).map((n, i) => (
                                <p key={i} className="text-[11px] mb-0.5" style={{ color: 'var(--v3-text)' }}>• {n}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Timeline */}
                    {dossier.timeline && dossier.timeline.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="rounded-xl border p-5 space-y-3"
                        style={{ borderColor: 'var(--v3-border)', background: 'var(--v3-bg)' }}
                      >
                        <div className="flex items-center gap-2">
                          <Clock size={14} style={{ color: 'var(--v3-accent)' }} />
                          <span className="text-[11px] font-bold tracking-wider uppercase" style={{ color: 'var(--v3-accent)' }}>Activity Timeline</span>
                        </div>
                        <div className="space-y-2">
                          {dossier.timeline.map((t, i) => (
                            <div key={i} className="flex items-start gap-3 pl-2 border-l-2" style={{ borderColor: 'var(--v3-accent)' }}>
                              <div className="flex-1 pb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-medium" style={{ color: 'var(--v3-text-muted)' }}>{t.date}</span>
                                  <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'var(--v3-surface)', color: 'var(--v3-text-muted)' }}>{t.source}</span>
                                </div>
                                <p className="text-[11px] mt-0.5" style={{ color: 'var(--v3-text)' }}>{t.event}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Actionable Intel */}
                    {dossier.actionableIntel && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="rounded-xl border p-5 space-y-3"
                        style={{ borderColor: 'var(--v3-border)', background: 'var(--v3-bg)' }}
                      >
                        <div className="flex items-center gap-2">
                          <Target size={14} style={{ color: 'var(--v3-accent)' }} />
                          <span className="text-[11px] font-bold tracking-wider uppercase" style={{ color: 'var(--v3-accent)' }}>Actionable Intelligence</span>
                        </div>
                        {dossier.actionableIntel.keyInsights && dossier.actionableIntel.keyInsights.length > 0 && (
                          <div>
                            <p className="text-[10px] font-medium mb-1.5" style={{ color: 'var(--v3-text-muted)' }}>Key Insights</p>
                            <div className="space-y-1.5">
                              {dossier.actionableIntel.keyInsights.map((insight, i) => (
                                <div key={i} className="flex items-start gap-2 p-2 rounded-lg" style={{ background: 'var(--v3-surface)' }}>
                                  <ChevronRight size={10} className="shrink-0 mt-0.5" style={{ color: 'var(--v3-accent)' }} />
                                  <span className="text-[11px]" style={{ color: 'var(--v3-text)' }}>{insight}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {dossier.actionableIntel.investigationLeads && dossier.actionableIntel.investigationLeads.length > 0 && (
                          <div>
                            <p className="text-[10px] font-medium mb-1.5" style={{ color: 'var(--v3-text-muted)' }}>Investigation Leads</p>
                            <div className="space-y-1">
                              {dossier.actionableIntel.investigationLeads.map((lead, i) => (
                                <div key={i} className="flex items-start gap-2 p-1.5">
                                  <Eye size={10} className="shrink-0 mt-0.5" style={{ color: 'var(--v3-text-muted)' }} />
                                  <span className="text-[11px]" style={{ color: 'var(--v3-text-secondary)' }}>{lead}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Confidence Assessment */}
                    {dossier.confidenceAssessment && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="rounded-xl border p-4"
                        style={{ borderColor: 'var(--v3-border)', background: 'rgba(251, 191, 36, 0.04)' }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle size={12} className="text-amber-400" />
                          <span className="text-[10px] font-bold tracking-wider uppercase text-amber-400">
                            Confidence: {dossier.confidenceAssessment.overallConfidence}
                          </span>
                        </div>
                        {dossier.confidenceAssessment.dataQuality && (
                          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--v3-text-muted)' }}>
                            {dossier.confidenceAssessment.dataQuality}
                          </p>
                        )}
                        {dossier.confidenceAssessment.limitations && dossier.confidenceAssessment.limitations.length > 0 && (
                          <div className="mt-2 space-y-0.5">
                            {dossier.confidenceAssessment.limitations.map((l, i) => (
                              <p key={i} className="text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>• {l}</p>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
