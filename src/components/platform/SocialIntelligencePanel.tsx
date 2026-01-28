import { useState } from 'react';
import { 
  Users, 
  Link2, 
  AlertTriangle,
  TrendingUp,
  Building2,
  User,
  Globe,
  Eye,
  ChevronRight,
  Zap,
  Network
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  relationship: string;
  riskScore: number;
  sharedConnections: number;
  flagged: boolean;
}

interface EntityProfile {
  id: string;
  name: string;
  type: 'applicant' | 'agency' | 'agency_owner' | 'associate';
  riskScore: number;
  socialProfiles: SocialProfile[];
  connections: SocialConnection[];
  riskNarrative: string;
}

const DEMO_ENTITIES: EntityProfile[] = [
  {
    id: 'ent-001',
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
        riskIndicators: ['Follows 3 sanctioned accounts', 'Unusual follower surge +400% in 30 days']
      },
      {
        id: 'sp-002',
        platform: 'linkedin',
        handle: 'mehmet-yilmaz-gfc',
        followers: 2341,
        following: 445,
        verified: true,
        lastActive: '2026-01-27T15:00:00Z',
        riskIndicators: []
      },
      {
        id: 'sp-003',
        platform: 'telegram',
        handle: '@m_yilmaz_visa',
        followers: 847,
        following: 123,
        verified: false,
        lastActive: '2026-01-28T14:00:00Z',
        riskIndicators: ['Member of 2 flagged groups', 'High message volume pattern']
      }
    ],
    connections: [
      { id: 'conn-001', name: 'Ahmad Rezaee', relationship: 'Client', riskScore: 87, sharedConnections: 4, flagged: true },
      { id: 'conn-002', name: 'Dmitri Volkov', relationship: 'Client', riskScore: 72, sharedConnections: 2, flagged: true },
      { id: 'conn-003', name: 'Sergei Antonov', relationship: 'Social Connection', riskScore: 91, sharedConnections: 12, flagged: true },
      { id: 'conn-004', name: 'Elena Sokolova', relationship: 'Client', riskScore: 45, sharedConnections: 1, flagged: false }
    ]
  },
  {
    id: 'ent-002',
    name: 'Ahmad Rezaee',
    type: 'applicant',
    riskScore: 87,
    riskNarrative: 'Applicant submitted through Global Finance Consultants. Document hash matches previous rejected application under different name. Social media footprint minimal but Instagram account follows known visa mill operators.',
    socialProfiles: [
      {
        id: 'sp-004',
        platform: 'instagram',
        handle: '@ahmad_rezaee_travel',
        followers: 234,
        following: 1247,
        verified: false,
        lastActive: '2026-01-20T08:00:00Z',
        riskIndicators: ['Following 8 flagged agency accounts', 'Account created 45 days ago']
      }
    ],
    connections: [
      { id: 'conn-005', name: 'Mehmet Yilmaz', relationship: 'Agency Owner', riskScore: 78, sharedConnections: 4, flagged: true },
      { id: 'conn-006', name: 'Dmitri Volkov', relationship: 'Shared Address', riskScore: 72, sharedConnections: 3, flagged: true }
    ]
  }
];

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸',
  twitter: '𝕏',
  linkedin: '💼',
  facebook: '📘',
  telegram: '✈️'
};

export function SocialIntelligencePanel() {
  const [selectedEntity, setSelectedEntity] = useState<EntityProfile | null>(DEMO_ENTITIES[0]);
  const [analysisRunning, setAnalysisRunning] = useState(false);

  const runAnalysis = () => {
    setAnalysisRunning(true);
    setTimeout(() => setAnalysisRunning(false), 3000);
  };

  const getRiskColor = (score: number) => {
    if (score > 70) return 'text-destructive';
    if (score > 40) return 'text-yellow-500';
    return 'text-accent';
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded">
            <Globe className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold">Social Intelligence</h3>
            <p className="text-xs text-muted-foreground">OSINT & network analysis</p>
          </div>
        </div>
        <Button 
          onClick={runAnalysis}
          disabled={analysisRunning}
          className="gap-2"
          variant="outline"
        >
          {analysisRunning ? (
            <>
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Run OSINT Scan
            </>
          )}
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Entity List */}
        <div className="w-72 border-r border-border overflow-auto">
          <div className="p-3 border-b border-border">
            <p className="text-label">Entities Under Analysis</p>
          </div>
          {DEMO_ENTITIES.map((entity) => (
            <div
              key={entity.id}
              className={`p-3 border-b border-border cursor-pointer transition-colors ${
                selectedEntity?.id === entity.id ? 'bg-accent/10' : 'hover:bg-secondary/30'
              }`}
              onClick={() => setSelectedEntity(entity)}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded ${
                  entity.type === 'agency_owner' ? 'bg-purple-500/20' :
                  entity.type === 'agency' ? 'bg-blue-500/20' :
                  'bg-secondary'
                }`}>
                  {entity.type === 'agency_owner' ? (
                    <Building2 className="w-4 h-4 text-purple-400" />
                  ) : entity.type === 'agency' ? (
                    <Network className="w-4 h-4 text-blue-400" />
                  ) : (
                    <User className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{entity.name}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{entity.type.replace('_', ' ')}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-mono ${getRiskColor(entity.riskScore)}`}>
                    {entity.riskScore}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        {selectedEntity && (
          <div className="flex-1 overflow-auto p-6 space-y-6">
            {/* Risk Narrative */}
            <div className="p-4 bg-secondary/30 border border-border rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className={`w-5 h-5 mt-0.5 ${getRiskColor(selectedEntity.riskScore)}`} />
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold">{selectedEntity.name}</p>
                    <span className={`px-2 py-0.5 rounded text-xs font-mono ${getRiskColor(selectedEntity.riskScore)} bg-current/10`}>
                      Risk: {selectedEntity.riskScore}
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
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-accent" />
                <p className="text-label">Social Media Profiles</p>
              </div>
              <div className="grid gap-3">
                {selectedEntity.socialProfiles.map((profile) => (
                  <div key={profile.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{PLATFORM_ICONS[profile.platform]}</span>
                        <div>
                          <p className="font-medium">{profile.handle}</p>
                          <p className="text-xs text-muted-foreground capitalize">{profile.platform}</p>
                        </div>
                      </div>
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
                    </div>
                    {profile.riskIndicators.length > 0 && (
                      <div className="space-y-1.5">
                        {profile.riskIndicators.map((indicator, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-destructive">
                            <AlertTriangle className="w-3 h-3" />
                            {indicator}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Network Connections */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Link2 className="w-4 h-4 text-accent" />
                <p className="text-label">Network Connections</p>
              </div>
              <div className="space-y-2">
                {selectedEntity.connections.map((conn) => (
                  <div 
                    key={conn.id} 
                    className={`p-3 border rounded-lg flex items-center justify-between cursor-pointer transition-colors hover:bg-secondary/30 ${
                      conn.flagged ? 'border-destructive/30 bg-destructive/5' : 'border-border'
                    }`}
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
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Propagation Diagram */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-accent" />
                <p className="text-label">Risk Propagation Path</p>
              </div>
              <div className="p-6 border border-border rounded-lg bg-secondary/20">
                <div className="flex items-center justify-center gap-4 text-sm">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-destructive/20 border-2 border-destructive flex items-center justify-center">
                      <User className="w-5 h-5 text-destructive" />
                    </div>
                    <span className="text-xs">Flagged Applicant</span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-destructive via-yellow-500 to-purple-500 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] bg-background px-2 py-1 rounded border border-border">
                      Risk flows
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-yellow-500" />
                    </div>
                    <span className="text-xs">Agency</span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-yellow-500 to-purple-500 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] bg-background px-2 py-1 rounded border border-border">
                      Ownership
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-500" />
                    </div>
                    <span className="text-xs">Agency Owner</span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-purple-500 to-accent relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] bg-background px-2 py-1 rounded border border-border">
                      Social links
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center">
                      <Globe className="w-5 h-5 text-accent" />
                    </div>
                    <span className="text-xs">Social Network</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
