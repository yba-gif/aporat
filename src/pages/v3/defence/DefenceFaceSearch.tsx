import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Search, ExternalLink, AlertTriangle, CheckCircle2, Loader2, X, Image as ImageIcon, Globe, Link2, User, UserCircle, Save, Shield, Briefcase, MapPin, Eye, Network, Clock, Target, Brain, ChevronRight } from 'lucide-react';
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

  for (const r of highConf) {
    const url = r.url;

    // LinkedIn: /in/firstname-lastname
    const li = url.match(/linkedin\.com\/in\/([a-z]+-[a-z0-9-]+)/i);
    if (li) {
      const name = li[1].split('-').filter(p => p.length > 1).slice(0, 3)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      if (name.length > 3) nameCandidates.set(name, (nameCandidates.get(name) || 0) + r.score);
    }

    // Crunchbase: /person/firstname-lastname
    const cb = url.match(/crunchbase\.com\/person\/([a-z]+-[a-z0-9-]+)/i);
    if (cb) {
      const name = cb[1].split('-').filter(p => p.length > 1).slice(0, 3)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      if (name.length > 3) nameCandidates.set(name, (nameCandidates.get(name) || 0) + r.score);
    }

    // Forbes councils / profiles
    const fb = url.match(/forbes\.com\/(?:councils\/|profile\/)([a-z]+-[a-z0-9-]+)/i);
    if (fb) {
      const name = fb[1].split('-').filter(p => p.length > 1).slice(0, 3)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      if (name.length > 3) nameCandidates.set(name, (nameCandidates.get(name) || 0) + r.score);
    }

    // Wiki pages: /wiki/Firstname_Lastname
    const wiki = url.match(/(?:wikitia|wikipedia)\.(?:com|org)\/wiki\/([A-Z][a-z]+_[A-Z][a-z_]+)/);
    if (wiki) {
      const name = wiki[1].replace(/_/g, ' ');
      nameCandidates.set(name, (nameCandidates.get(name) || 0) + r.score);
    }

    // Generic path-based: site.com/firstname-lastname or site.com/yusuf-berk...
    const generic = url.match(/\.com\/([a-z]+-[a-z]+-?[a-z]*)\/?/i);
    if (generic && !url.match(/instagram|twitter|x\.com|facebook|youtube|tiktok|reddit|github|pinterest|quora|medium/i)) {
      const parts = generic[1].split('-').filter(p => p.length > 1);
      if (parts.length >= 2 && parts.length <= 4) {
        const name = parts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        if (name.length > 3) nameCandidates.set(name, (nameCandidates.get(name) || 0) + r.score * 0.5);
      }
    }
  }

  if (nameCandidates.size === 0) return null;

  // Return the name with the highest cumulative score
  return Array.from(nameCandidates.entries())
    .sort((a, b) => b[1] - a[1])[0][0];
}

export default function DefenceFaceSearch() {
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB');
      return;
    }
    setSelectedFile(file);
    setResults([]);
    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setResults([]);
      setErrorMsg('');
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const clearImage = () => {
    stopPolling();
    setSelectedFile(null);
    setImagePreview(null);
    setResults([]);
    setSearchState('idle');
    setErrorMsg('');
    setPotentialName(null);
    setSavedId(null);
    setDossier(null);
    setActiveTab('results');
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
      });

      toast.success('Intelligence report exported');
    } catch (err: any) {
      toast.error('Report export failed: ' + (err.message || 'Unknown error'));
    } finally {
      setExporting(false);
    }
  }, [results, potentialName, testingMode]);

  const startSearch = async () => {
    if (!selectedFile) return;

    try {
      stopPolling();

      // Step 1: Upload
      setSearchState('uploading');
      setProgress(0);

      const formData = new FormData();
      formData.append('image', selectedFile);

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const baseUrl = `https://${projectId}.supabase.co/functions/v1`;

      const uploadRes = await fetch(`${baseUrl}/facecheck-search?action=upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${anonKey}` },
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.id_search) {
        throw new Error(uploadData.error || 'Upload failed');
      }

      const idSearch = uploadData.id_search;

      // Step 2: Start search
      setSearchState('searching');
      setProgress(10);

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
        throw new Error(searchData?.error || 'Search failed');
      }

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
      // Non-critical, don't block UI
    }
      };

      // If we got output immediately
      if (searchData?.output) {
        const parsed = parseResults(searchData.output);
        setResults(parsed);
        setSearchState('complete');
        setProgress(100);
        saveSearch(parsed);
        return;
      }

      // Step 3: Poll for results
      let attempts = 0;
      const maxAttempts = 60;

      pollRef.current = setInterval(async () => {
        attempts++;
        if (attempts > maxAttempts) {
          stopPolling();
          setSearchState('error');
          setErrorMsg('Search timed out after 5 minutes');
          return;
        }

        setProgress(Math.min(10 + (attempts / maxAttempts) * 85, 95));

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
            stopPolling();
            const parsed = parseResults(statusData.output);
            setResults(parsed);
            setSearchState('complete');
            setProgress(100);
            saveSearch(parsed);
          } else if (!statusRes.ok || statusData.error) {
            stopPolling();
            setSearchState('error');
            setErrorMsg(statusData.error || 'Unable to fetch search status');
          }
        } catch {
          // Continue polling on network errors
        }
      }, 5000);

    } catch (err: any) {
      stopPolling();
      setSearchState('error');
      setErrorMsg(err.message || 'Search failed');
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
              Upload Image
            </h2>

            {!imagePreview ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors hover:border-[var(--v3-accent)]"
                style={{ borderColor: 'var(--v3-border)' }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--v3-accent-muted)' }}>
                  <Upload size={20} style={{ color: 'var(--v3-accent)' }} />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-medium" style={{ color: 'var(--v3-text-secondary)' }}>
                    Drop image or click to upload
                  </p>
                  <p className="text-[11px] mt-1" style={{ color: 'var(--v3-text-muted)' }}>
                    JPG, PNG up to 10MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full rounded-xl object-cover max-h-[240px]"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
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
              disabled={!selectedFile || searchState === 'uploading' || searchState === 'searching'}
              className="w-full mt-4 py-2.5 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: selectedFile ? 'var(--v3-accent)' : 'var(--v3-surface-hover)',
                color: selectedFile ? 'white' : 'var(--v3-text-muted)',
              }}
            >
              {searchState === 'uploading' && <Loader2 size={14} className="animate-spin" />}
              {searchState === 'searching' && <Loader2 size={14} className="animate-spin" />}
              {searchState === 'idle' && <Search size={14} />}
              {searchState === 'complete' && <CheckCircle2 size={14} />}
              {searchState === 'uploading' ? 'Uploading...' :
               searchState === 'searching' ? 'Searching...' :
               searchState === 'complete' ? 'Search Again' : 'Search Face'}
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
                  {searchState === 'uploading' ? 'Uploading image...' : `Scanning faces — ${Math.round(progress)}%`}
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
                <p className="text-[11px] text-amber-400/70 mt-0.5">Each search costs 3 credits (0.30 USD)</p>
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
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--v3-border)' }}>
              <h2 className="text-[13px] font-semibold" style={{ color: 'var(--v3-text)' }}>
                Results {results.length > 0 && <span className="font-normal" style={{ color: 'var(--v3-text-muted)' }}>({results.length})</span>}
              </h2>
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

            {results.length > 0 && (
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
                            {potentialName || 'Unknown Subject'}
                          </h3>
                          {potentialName && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-400">
                              INFERRED
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--v3-text-muted)' }}>
                          {results.length} matches across {correlatePlatforms(results).length} platforms
                          {results.length > 0 && ` · Best match ${Math.max(...results.map(r => r.score))}%`}
                        </p>
                      </div>
                    </div>
                    {savedId && (
                      <div className="flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-lg" style={{ background: 'var(--v3-surface)', color: 'var(--v3-accent)' }}>
                        <Save size={10} />
                        Saved
                      </div>
                    )}
                  </div>

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
          </div>
        </div>
      </div>
    </div>
  );
}
