import { useState, useEffect, useCallback } from 'react';
import { 
  AlertTriangle,
  TrendingUp,
  Building2,
  User,
  Globe,
  ChevronRight,
  Zap,
  Network,
  Link2,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Eye,
  Search,
  Shield,
  Brain,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { usePlatform } from '@/contexts/PlatformContext';
import { useLocale, type TranslationKey } from '@/lib/i18n';
import { useAuditLog } from '@/hooks/useAuditLog';
import { RoleGate } from '@/components/platform/RoleGate';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// --- Types ---

interface SocialProfile {
  id: string;
  platform: 'instagram' | 'twitter' | 'linkedin' | 'facebook' | 'telegram';
  handle: string;
  followers: number;
  following: number;
  verified: boolean;
  lastActive: string;
  riskIndicators: string[];
}

interface SocialConnection {
  id: string;
  name: string;
  entityId?: string; // maps to PlatformContext entity
  relationship: string;
  riskScore: number;
  sharedConnections: number;
  flagged: boolean;
}

interface OsintFinding {
  id: string;
  source: string;
  category: string;
  detail: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
}

interface EntityProfile {
  id: string;
  entityId?: string; // maps to PlatformContext entity
  name: string;
  type: 'applicant' | 'agency' | 'agency_owner' | 'associate';
  riskScore: number;
  socialProfiles: SocialProfile[];
  connections: SocialConnection[];
  riskNarrative: string;
  osintFindings: OsintFinding[];
}

// --- Demo Data ---

const DEMO_ENTITIES: EntityProfile[] = [
  {
    id: 'ent-002',
    entityId: 'app-rezaee',
    name: 'Ahmad Rezaee',
    type: 'applicant',
    riskScore: 87,
    riskNarrative: 'Applicant submitted through Global Finance Consultants. Document hash matches previous rejected application under different name. Social media footprint minimal but Instagram account follows known visa mill operators. LinkedIn employment differs from visa application declaration.',
    socialProfiles: [
      {
        id: 'sp-004',
        platform: 'instagram',
        handle: '@ahmad_rezaee_travel',
        followers: 234,
        following: 1247,
        verified: false,
        lastActive: '2026-01-20T08:00:00Z',
        riskIndicators: ['Following 8 flagged agency accounts', 'Account created 45 days ago'],
      },
      {
        id: 'sp-005',
        platform: 'linkedin',
        handle: 'ahmad-rezaee-tehran',
        followers: 142,
        following: 310,
        verified: false,
        lastActive: '2026-01-18T12:00:00Z',
        riskIndicators: ['Employment listed differs from visa application', 'Profile created 60 days before submission'],
      },
      {
        id: 'sp-006',
        platform: 'telegram',
        handle: '@a_rezaee_visa',
        followers: 0,
        following: 47,
        verified: false,
        lastActive: '2026-01-25T09:00:00Z',
        riskIndicators: ['Member of 3 visa coaching channels', 'Follows 2 known facilitator accounts'],
      },
    ],
    connections: [
      { id: 'conn-005', name: 'Mehmet Yilmaz', entityId: 'agent-yilmaz', relationship: 'Agency Owner', riskScore: 78, sharedConnections: 4, flagged: true },
      { id: 'conn-006', name: 'Dmitri Volkov', entityId: 'app-volkov', relationship: 'Shared Address', riskScore: 72, sharedConnections: 3, flagged: true },
      { id: 'conn-010', name: 'Elena Sokolova', entityId: 'app-sokolova', relationship: 'Same Agency', riskScore: 45, sharedConnections: 1, flagged: false },
    ],
    osintFindings: [
      { id: 'osint-001', source: 'Instagram', category: 'Social Graph', detail: 'Follows 8 accounts flagged as visa mill operators across 3 countries', severity: 'high', timestamp: '2026-01-20T10:30:00Z' },
      { id: 'osint-002', source: 'LinkedIn', category: 'Employment Verification', detail: 'Lists "Pars Engineering Ltd" as employer — visa application states "Tehran Import Co"', severity: 'critical', timestamp: '2026-01-19T14:00:00Z' },
      { id: 'osint-003', source: 'Telegram', category: 'Group Membership', detail: 'Active in "Visa Tips Turkey 2026" (1,247 members) — known coaching channel', severity: 'high', timestamp: '2026-01-25T09:15:00Z' },
      { id: 'osint-004', source: 'Telegram', category: 'Group Membership', detail: 'Member of "Document Services TR" — flagged for document forgery coordination', severity: 'critical', timestamp: '2026-01-24T16:00:00Z' },
    ],
  },
  {
    id: 'ent-001',
    entityId: 'agent-yilmaz',
    name: 'Mehmet Yilmaz',
    type: 'agency_owner',
    riskScore: 78,
    riskNarrative: 'Owner of Global Finance Consultants Ltd. 47 applicants processed through agency in last 90 days. 12 flagged for document anomalies. Social media analysis reveals connections to 3 sanctioned individuals through Instagram following patterns.',
    socialProfiles: [
      {
        id: 'sp-001',
        platform: 'instagram',
        handle: '@mehmet_yilmaz_official',
        followers: 12847,
        following: 892,
        verified: false,
        lastActive: '2026-01-28T10:00:00Z',
        riskIndicators: ['Follows 3 sanctioned accounts', 'Unusual follower surge +400% in 30 days'],
      },
      {
        id: 'sp-002',
        platform: 'linkedin',
        handle: 'mehmet-yilmaz-gfc',
        followers: 2341,
        following: 445,
        verified: true,
        lastActive: '2026-01-27T15:00:00Z',
        riskIndicators: [],
      },
      {
        id: 'sp-003',
        platform: 'telegram',
        handle: '@m_yilmaz_visa',
        followers: 847,
        following: 123,
        verified: false,
        lastActive: '2026-01-28T14:00:00Z',
        riskIndicators: ['Member of 2 flagged groups', 'High message volume pattern'],
      },
    ],
    connections: [
      { id: 'conn-001', name: 'Ahmad Rezaee', entityId: 'app-rezaee', relationship: 'Client', riskScore: 87, sharedConnections: 4, flagged: true },
      { id: 'conn-002', name: 'Dmitri Volkov', entityId: 'app-volkov', relationship: 'Client', riskScore: 72, sharedConnections: 2, flagged: true },
      { id: 'conn-003', name: 'Sergei Antonov', relationship: 'Social Connection', riskScore: 91, sharedConnections: 12, flagged: true },
      { id: 'conn-004', name: 'Elena Sokolova', entityId: 'app-sokolova', relationship: 'Client', riskScore: 45, sharedConnections: 1, flagged: false },
    ],
    osintFindings: [
      { id: 'osint-005', source: 'Instagram', category: 'Sanctioned Connections', detail: 'Follows 3 individuals on OFAC SDN list through personal account', severity: 'critical', timestamp: '2026-01-28T11:00:00Z' },
      { id: 'osint-006', source: 'Instagram', category: 'Anomaly', detail: 'Follower count surged from 3,200 to 12,847 in 30 days — potential bot network', severity: 'medium', timestamp: '2026-01-15T08:00:00Z' },
      { id: 'osint-007', source: 'Telegram', category: 'Group Membership', detail: 'Admin of "GFC Visa Services" group — coordinates applicant submissions', severity: 'high', timestamp: '2026-01-28T14:30:00Z' },
    ],
  },
  {
    id: 'ent-003',
    entityId: 'app-volkov',
    name: 'Dmitri Volkov',
    type: 'associate',
    riskScore: 72,
    riskNarrative: 'Shared residential address with Ahmad Rezaee on visa application. Facebook account shows travel photos inconsistent with declared financial status. Twitter/X activity links to known facilitation networks.',
    socialProfiles: [
      {
        id: 'sp-007',
        platform: 'facebook',
        handle: 'dmitri.volkov.travel',
        followers: 567,
        following: 312,
        verified: false,
        lastActive: '2026-01-26T18:00:00Z',
        riskIndicators: ['Travel photos inconsistent with declared income', 'Tagged at luxury hotels in 4 countries'],
      },
      {
        id: 'sp-008',
        platform: 'twitter',
        handle: '@d_volkov_',
        followers: 89,
        following: 1456,
        verified: false,
        lastActive: '2026-01-22T20:00:00Z',
        riskIndicators: ['Retweets from known facilitator accounts'],
      },
    ],
    connections: [
      { id: 'conn-007', name: 'Ahmad Rezaee', entityId: 'app-rezaee', relationship: 'Shared Address', riskScore: 87, sharedConnections: 3, flagged: true },
      { id: 'conn-008', name: 'Mehmet Yilmaz', entityId: 'agent-yilmaz', relationship: 'Agency Owner', riskScore: 78, sharedConnections: 2, flagged: true },
    ],
    osintFindings: [
      { id: 'osint-008', source: 'Facebook', category: 'Lifestyle Mismatch', detail: 'Tagged at 4-star hotels in Dubai, Istanbul, and Bangkok — declared annual income $12,000', severity: 'high', timestamp: '2026-01-26T18:30:00Z' },
      { id: 'osint-009', source: 'Twitter/X', category: 'Network Links', detail: 'Retweets content from 2 accounts linked to visa facilitation services', severity: 'medium', timestamp: '2026-01-22T20:15:00Z' },
    ],
  },
];

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸',
  twitter: '𝕏',
  linkedin: '💼',
  facebook: '📘',
  telegram: '✈️',
};

const SCAN_STEPS = [
  'scanningInstagram',
  'scanningLinkedin',
  'scanningTelegram',
  'searchingWeb',
  'generatingAssessment',
] as const;

// --- Component ---

export function SocialIntelligencePanel() {
  const { selectedEntityId, navigateToEntity, setNauticaView } = usePlatform();
  const { t } = useLocale();
  const { log } = useAuditLog();

  const [selectedEntity, setSelectedEntity] = useState<EntityProfile>(DEMO_ENTITIES[0]);
  const [scanRunning, setScanRunning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    riskAssessment?: string;
    newFindings?: OsintFinding[];
    recommendedActions?: string[];
    confidence?: number;
  } | null>(null);
  const [webIntel, setWebIntel] = useState<{
    results: Array<{ query: string; content: string; citations: string[] }>;
    searchedAt?: string;
  } | null>(null);

  // Sync with PlatformContext selectedEntityId
  useEffect(() => {
    if (selectedEntityId) {
      const match = DEMO_ENTITIES.find(e => e.entityId === selectedEntityId);
      if (match) setSelectedEntity(match);
    }
  }, [selectedEntityId]);

  const getRiskColor = (score: number) => {
    if (score > 70) return 'text-destructive';
    if (score > 40) return 'text-yellow-500';
    return 'text-accent';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const runOsintScan = useCallback(async () => {
    setScanRunning(true);
    setScanComplete(false);
    setScanStep(0);
    setAiAnalysis(null);
    setWebIntel(null);

    log({
      action: 'entity_flagged',
      source: 'system',
      targetId: selectedEntity.entityId || selectedEntity.id,
      targetType: 'entity',
      context: { scanType: 'osint', entityName: selectedEntity.name },
    });

    // Animate through scan steps while API calls run
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < SCAN_STEPS.length - 1) {
        setScanStep(step);
      }
    }, 1200);

    // Run xAI and Perplexity in parallel
    const [xaiResult, perplexityResult] = await Promise.allSettled([
      supabase.functions.invoke('xai-osint', {
        body: {
          entityName: selectedEntity.name,
          entityType: selectedEntity.type,
          socialProfiles: selectedEntity.socialProfiles,
          connections: selectedEntity.connections,
          existingFindings: selectedEntity.osintFindings,
        },
      }),
      supabase.functions.invoke('perplexity-osint', {
        body: {
          entityName: selectedEntity.name,
          entityType: selectedEntity.type,
          socialHandles: selectedEntity.socialProfiles.map(p => p.handle),
        },
      }),
    ]);

    clearInterval(interval);

    // Process xAI results
    if (xaiResult.status === 'fulfilled') {
      const { data, error } = xaiResult.value;
      if (error || data?.error) {
        console.error('xAI OSINT error:', error || data?.error);
      } else {
        const aiFindings = (data.newFindings || []).map((f: any, idx: number) => ({
          id: `ai-${Date.now()}-${idx}`,
          source: f.source || 'xAI Grok',
          category: f.category || 'AI Analysis',
          detail: f.detail,
          severity: f.severity || 'medium',
          timestamp: new Date().toISOString(),
        }));
        setAiAnalysis({
          riskAssessment: data.riskAssessment,
          newFindings: aiFindings,
          recommendedActions: data.recommendedActions || [],
          confidence: data.confidence || 0.5,
        });
      }
    }

    // Process Perplexity results
    if (perplexityResult.status === 'fulfilled') {
      const { data, error } = perplexityResult.value;
      if (error || data?.error) {
        console.error('Perplexity OSINT error:', error || data?.error);
      } else {
        setWebIntel({
          results: data.results || [],
          searchedAt: data.searchedAt,
        });
      }
    }

    setScanStep(SCAN_STEPS.length);
    setScanRunning(false);
    setScanComplete(true);
  }, [selectedEntity, log]);

  const handleConnectionClick = (conn: SocialConnection) => {
    if (conn.entityId) {
      navigateToEntity(conn.entityId);
      setNauticaView('graph');
    }
  };

  const handleViewInGraph = () => {
    if (selectedEntity.entityId) {
      navigateToEntity(selectedEntity.entityId);
      setNauticaView('graph');
    }
  };

  const totalIndicators = selectedEntity.socialProfiles.reduce(
    (sum, p) => sum + p.riskIndicators.length, 0
  );
  const flaggedConns = selectedEntity.connections.filter(c => c.flagged).length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" data-tour="social-panel">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded">
            <Globe className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold">{t('socialIntelligence')}</h3>
            <p className="text-xs text-muted-foreground">{t('osintAnalysis')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedEntity.entityId && (
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={handleViewInGraph}>
              <ExternalLink className="w-3 h-3" />
              {t('viewInGraph')}
            </Button>
          )}
          <RoleGate minimumRole="analyst">
            <Button
              onClick={runOsintScan}
              disabled={scanRunning}
              className="gap-2"
              variant="outline"
              size="sm"
            >
              {scanRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('scanning')}
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  {t('runOsintScan')}
                </>
              )}
            </Button>
          </RoleGate>
        </div>
      </div>

      {/* OSINT Scan Progress */}
      {(scanRunning || scanComplete) && (
        <div className="px-4 py-3 border-b border-border bg-secondary/20 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">
              {scanComplete ? t('scanComplete') : t(SCAN_STEPS[scanStep] as TranslationKey)}
            </span>
            <span className="text-muted-foreground">{Math.min(scanStep + 1, SCAN_STEPS.length)}/{SCAN_STEPS.length}</span>
          </div>
          <Progress value={((scanStep + (scanComplete ? 1 : 0)) / SCAN_STEPS.length) * 100} className="h-1.5" />
          {scanComplete && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-accent" />
                {selectedEntity.socialProfiles.length} {t('accountsAnalyzed')}
              </span>
              <span>{totalIndicators} {t('indicatorsFound')}</span>
              <span>{flaggedConns} {t('flaggedConnections')}</span>
            </div>
          )}
        </div>
      )}

      {/* xAI Grok Analysis Results */}
      {aiAnalysis && scanComplete && (
        <div className="px-4 py-3 border-b border-border bg-accent/5 space-y-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-accent" />
            <span className="text-xs font-medium">Grok AI Assessment</span>
            {aiAnalysis.confidence != null && (
              <span className="text-[10px] font-mono text-muted-foreground ml-auto">
                confidence: {Math.round(aiAnalysis.confidence * 100)}%
              </span>
            )}
          </div>
          {aiAnalysis.riskAssessment && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {aiAnalysis.riskAssessment}
            </p>
          )}
          {aiAnalysis.recommendedActions && aiAnalysis.recommendedActions.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {aiAnalysis.recommendedActions.map((action, idx) => (
                <span key={idx} className="text-[10px] px-2 py-0.5 bg-accent/10 text-accent border border-accent/20 rounded">
                  {action}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Perplexity Web Intelligence Results */}
      {webIntel && scanComplete && webIntel.results.length > 0 && (
        <div className="px-4 py-3 border-b border-border bg-secondary/10 space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-accent" />
            <span className="text-xs font-medium">Web Intelligence (Perplexity)</span>
            {webIntel.searchedAt && (
              <span className="text-[10px] font-mono text-muted-foreground ml-auto">
                {new Date(webIntel.searchedAt).toLocaleTimeString()}
              </span>
            )}
          </div>
          {webIntel.results.map((result, idx) => (
            <div key={idx} className="space-y-1.5">
              <p className="text-[10px] font-mono text-muted-foreground truncate">🔍 {result.query}</p>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {result.content}
              </p>
              {result.citations.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {result.citations.slice(0, 3).map((url, cidx) => (
                    <a
                      key={cidx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] text-accent hover:underline truncate max-w-[200px] inline-flex items-center gap-0.5"
                    >
                      <ExternalLink className="w-2 h-2 shrink-0" />
                      {new URL(url).hostname}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Entity List */}
        <div className="w-64 border-r border-border overflow-auto shrink-0">
          <div className="p-3 border-b border-border">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t('entitiesUnderAnalysis')}</p>
          </div>
          {DEMO_ENTITIES.map((entity) => (
            <div
              key={entity.id}
              className={`p-3 border-b border-border cursor-pointer transition-colors ${
                selectedEntity.id === entity.id ? 'bg-accent/10' : 'hover:bg-secondary/30'
              }`}
              onClick={() => setSelectedEntity(entity)}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded ${
                  entity.type === 'agency_owner' ? 'bg-purple-500/20' :
                  entity.type === 'associate' ? 'bg-blue-500/20' :
                  'bg-secondary'
                }`}>
                  {entity.type === 'agency_owner' ? (
                    <Building2 className="w-3.5 h-3.5 text-purple-400" />
                  ) : entity.type === 'associate' ? (
                    <Network className="w-3.5 h-3.5 text-blue-400" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{entity.name}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{entity.type.replace('_', ' ')}</p>
                </div>
                <p className={`text-sm font-mono ${getRiskColor(entity.riskScore)}`}>
                  {entity.riskScore}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content - Tabbed */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="profile" className="flex flex-col flex-1 overflow-hidden">
            <TabsList className="w-full rounded-none border-b border-border bg-transparent px-2 py-0 h-10 shrink-0">
              <TabsTrigger value="profile" className="flex-1 data-[state=active]:bg-secondary rounded-sm text-xs">
                {t('profile')}
              </TabsTrigger>
              <TabsTrigger value="network" className="flex-1 data-[state=active]:bg-secondary rounded-sm text-xs">
                {t('networkConnections')}
              </TabsTrigger>
              <TabsTrigger value="osint" className="flex-1 data-[state=active]:bg-secondary rounded-sm text-xs">
                {t('osintFindings')}
              </TabsTrigger>
              <TabsTrigger value="riskflow" className="flex-1 data-[state=active]:bg-secondary rounded-sm text-xs">
                {t('riskFlow')}
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="flex-1 overflow-auto p-5 space-y-5 m-0">
              {/* Risk Narrative */}
              <div className="p-4 bg-secondary/30 border border-border rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-5 h-5 mt-0.5 shrink-0 ${getRiskColor(selectedEntity.riskScore)}`} />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold">{selectedEntity.name}</p>
                      <span className={`px-2 py-0.5 rounded text-xs font-mono ${getRiskColor(selectedEntity.riskScore)}`}>
                        {t('riskScore')}: {selectedEntity.riskScore}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedEntity.riskNarrative}
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Profiles */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4 text-accent" />
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t('socialProfiles')}</p>
                </div>
                <div className="grid gap-3">
                  {selectedEntity.socialProfiles.map((profile) => (
                    <div key={profile.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{PLATFORM_ICONS[profile.platform]}</span>
                          <div>
                            <RoleGate minimumRole="analyst" fallback={
                              <p className="font-medium text-muted-foreground">
                                <Shield className="w-3 h-3 inline mr-1" />
                                [Restricted]
                              </p>
                            }>
                              <p className="font-medium">{profile.handle}</p>
                            </RoleGate>
                            <p className="text-xs text-muted-foreground capitalize">{profile.platform}</p>
                          </div>
                        </div>
                        <RoleGate minimumRole="analyst">
                          <div className="flex items-center gap-4 text-xs">
                            <div className="text-center">
                              <p className="font-mono text-foreground">{profile.followers.toLocaleString()}</p>
                              <p className="text-muted-foreground">followers</p>
                            </div>
                            <div className="text-center">
                              <p className="font-mono text-foreground">{profile.following.toLocaleString()}</p>
                              <p className="text-muted-foreground">following</p>
                            </div>
                          </div>
                        </RoleGate>
                      </div>
                      {profile.riskIndicators.length > 0 && (
                        <div className="space-y-1.5">
                          {profile.riskIndicators.map((indicator, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-destructive">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              {indicator}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Network Tab */}
            <TabsContent value="network" className="flex-1 overflow-auto p-5 space-y-4 m-0">
              <div className="flex items-center gap-2 mb-1">
                <Link2 className="w-4 h-4 text-accent" />
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t('networkConnections')}</p>
              </div>
              <div className="space-y-2">
                {selectedEntity.connections.map((conn) => (
                  <div
                    key={conn.id}
                    className={`p-3 border rounded-lg flex items-center justify-between cursor-pointer transition-colors hover:bg-secondary/30 ${
                      conn.flagged ? 'border-destructive/30 bg-destructive/5' : 'border-border'
                    }`}
                    onClick={() => handleConnectionClick(conn)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${conn.flagged ? 'bg-destructive' : 'bg-accent'}`} />
                      <div>
                        <p className="text-sm font-medium">{conn.name}</p>
                        <p className="text-[10px] text-muted-foreground">{conn.relationship}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`text-sm font-mono ${getRiskColor(conn.riskScore)}`}>
                          {conn.riskScore}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {conn.sharedConnections} shared
                        </p>
                      </div>
                      {conn.entityId && (
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Card */}
              <div className="mt-4 p-4 bg-secondary/20 border border-border rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-mono text-foreground">{selectedEntity.connections.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('connections')}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-mono text-destructive">{flaggedConns}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('flagged')}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-mono text-foreground">
                      {selectedEntity.connections.reduce((s, c) => s + c.sharedConnections, 0)}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Shared</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* OSINT Findings Tab */}
            <TabsContent value="osint" className="flex-1 overflow-auto p-5 space-y-3 m-0">
              <div className="flex items-center gap-2 mb-1">
                <Search className="w-4 h-4 text-accent" />
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t('osintFindings')}</p>
              </div>
              {[...selectedEntity.osintFindings, ...(aiAnalysis?.newFindings || [])].map((finding) => (
                <div key={finding.id} className="p-3 border border-border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getSeverityColor(finding.severity)}`}>
                        {finding.severity.toUpperCase()}
                      </span>
                      <span className="text-xs font-medium text-foreground">{finding.source}</span>
                      <span className="text-[10px] text-muted-foreground">• {finding.category}</span>
                      {finding.id.startsWith('ai-') && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-accent/10 text-accent rounded flex items-center gap-1">
                          <Brain className="w-2.5 h-2.5" /> AI
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {new Date(finding.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{finding.detail}</p>
                </div>
              ))}
            </TabsContent>

            {/* Risk Flow Tab */}
            <TabsContent value="riskflow" className="flex-1 overflow-auto p-5 space-y-5 m-0">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-accent" />
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t('riskPropagation')}</p>
              </div>

              {/* Risk Heatmap */}
              <div className="p-5 border border-border rounded-lg bg-secondary/20">
                <div className="flex items-center justify-center gap-4">
                  {/* Applicant */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-full bg-destructive/20 border-2 border-destructive flex items-center justify-center relative">
                      <User className="w-6 h-6 text-destructive" />
                      <span className="absolute -top-1 -right-1 text-[9px] font-mono bg-destructive text-destructive-foreground px-1 rounded">
                        {selectedEntity.riskScore}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Applicant</span>
                  </div>
                  {/* Flow line */}
                  <div className="flex-1 h-px bg-gradient-to-r from-destructive via-yellow-500 to-purple-500 relative">
                    <div className="absolute inset-0 h-px bg-gradient-to-r from-destructive via-yellow-500 to-purple-500 animate-pulse" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] bg-background px-1.5 py-0.5 rounded border border-border whitespace-nowrap">
                      Risk flows
                    </div>
                  </div>
                  {/* Agency */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-yellow-500" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">Agency</span>
                  </div>
                  {/* Flow line */}
                  <div className="flex-1 h-px bg-gradient-to-r from-yellow-500 to-purple-500 relative">
                    <div className="absolute inset-0 h-px bg-gradient-to-r from-yellow-500 to-purple-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] bg-background px-1.5 py-0.5 rounded border border-border whitespace-nowrap">
                      Ownership
                    </div>
                  </div>
                  {/* Owner */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-full bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center">
                      <User className="w-6 h-6 text-purple-500" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">Owner</span>
                  </div>
                  {/* Flow line */}
                  <div className="flex-1 h-px bg-gradient-to-r from-purple-500 to-accent relative">
                    <div className="absolute inset-0 h-px bg-gradient-to-r from-purple-500 to-accent animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] bg-background px-1.5 py-0.5 rounded border border-border whitespace-nowrap">
                      Social links
                    </div>
                  </div>
                  {/* Social */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center">
                      <Globe className="w-6 h-6 text-accent" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">Network</span>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 border border-border rounded-lg text-center bg-secondary/10">
                  <p className="text-2xl font-mono text-foreground">{selectedEntity.socialProfiles.length}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{t('accountsAnalyzed')}</p>
                </div>
                <div className="p-4 border border-border rounded-lg text-center bg-secondary/10">
                  <p className="text-2xl font-mono text-destructive">{totalIndicators}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{t('indicatorsFound')}</p>
                </div>
                <div className="p-4 border border-border rounded-lg text-center bg-secondary/10">
                  <p className="text-2xl font-mono text-destructive">{flaggedConns}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{t('flaggedConnections')}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
