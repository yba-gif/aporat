import { 
  User, 
  Building2, 
  FileText, 
  MapPin,
  Calendar,
  AlertTriangle,
  Link2,
  Globe,
  Activity,
  ChevronRight,
  ExternalLink,
  Fingerprint,
  CreditCard,
  Plane
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EntityData {
  id: string;
  name: string;
  type: 'applicant' | 'agent' | 'document' | 'address';
  riskScore: number;
  flagged: boolean;
  metadata: Record<string, unknown>;
  connections: number;
  documents: number;
  lastActivity: string;
  timeline: Array<{
    date: string;
    event: string;
    type: 'submission' | 'flag' | 'connection' | 'document';
  }>;
  riskFactors: Array<{
    factor: string;
    weight: number;
    source: string;
  }>;
}

interface EntityDossierProps {
  entityId: string | null;
  graphData: { nodes: any[]; links: any[] };
}

export function EntityDossier({ entityId, graphData }: EntityDossierProps) {
  if (!entityId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <User className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <p className="text-sm text-muted-foreground">Select a node to view details</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Click on any entity in the graph</p>
      </div>
    );
  }

  const node = graphData.nodes.find(n => n.id === entityId);
  if (!node) return null;

  const connections = graphData.links.filter(
    l => (l.source === entityId || l.target === entityId) ||
         (typeof l.source === 'object' && l.source?.id === entityId) ||
         (typeof l.target === 'object' && l.target?.id === entityId)
  );

  const getRiskColor = (score: number) => {
    if (score > 70) return 'text-destructive';
    if (score > 40) return 'text-yellow-500';
    return 'text-accent';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'agent': return <Building2 className="w-4 h-4" />;
      case 'company': return <Building2 className="w-4 h-4" />;
      case 'address': return <MapPin className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  // Generate mock timeline based on entity type
  const generateTimeline = () => {
    const baseDate = new Date('2026-01-28');
    if (node.nodeType === 'applicant') {
      return [
        { date: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), event: 'Application submitted', type: 'submission' as const },
        { date: new Date(baseDate.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(), event: 'Document uploaded: Passport', type: 'document' as const },
        { date: new Date(baseDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), event: 'Linked to flagged agency', type: 'connection' as const },
        { date: new Date(baseDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), event: 'Risk score elevated to ' + node.riskScore, type: 'flag' as const },
      ];
    }
    return [
      { date: new Date(baseDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(), event: 'Entity registered', type: 'submission' as const },
      { date: new Date(baseDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), event: 'Multiple applicant connections', type: 'connection' as const },
    ];
  };

  const timeline = generateTimeline();

  // Generate risk factors
  const riskFactors = [
    node.flagged && { factor: 'Flagged entity', weight: 40, source: 'System' },
    node.riskScore > 80 && { factor: 'High risk score', weight: 30, source: 'Risk Engine' },
    connections.length > 5 && { factor: 'High connection count', weight: 15, source: 'Network Analysis' },
    node.nodeType === 'agent' && { factor: 'Agency entity type', weight: 10, source: 'Classification' },
  ].filter(Boolean) as Array<{ factor: string; weight: number; source: string }>;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start gap-3">
          <div className={`p-3 rounded-lg ${
            node.flagged ? 'bg-destructive/20' : 'bg-accent/10'
          }`}>
            {getTypeIcon(node.nodeType)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{node.label}</h3>
              {node.flagged && <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />}
            </div>
            <p className="text-xs text-muted-foreground capitalize">{node.nodeType}</p>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${getRiskColor(node.riskScore)}`}>
              {node.riskScore}
            </p>
            <p className="text-[10px] text-muted-foreground">Risk Score</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-secondary/30 rounded text-center">
            <p className="text-lg font-bold">{connections.length}</p>
            <p className="text-[10px] text-muted-foreground">Connections</p>
          </div>
          <div className="p-3 bg-secondary/30 rounded text-center">
            <p className="text-lg font-bold">{node.nodeType === 'agent' ? '47' : '3'}</p>
            <p className="text-[10px] text-muted-foreground">Applicants</p>
          </div>
          <div className="p-3 bg-secondary/30 rounded text-center">
            <p className="text-lg font-bold">{riskFactors.length}</p>
            <p className="text-[10px] text-muted-foreground">Risk Factors</p>
          </div>
        </div>

        {/* Metadata */}
        {node.metadata && Object.keys(node.metadata).length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-accent" />
              <p className="text-label">Entity Data</p>
            </div>
            <div className="space-y-2 p-3 bg-secondary/20 rounded-lg">
              {Object.entries(node.metadata as Record<string, unknown>).map(([key, value]) => (
                <div key={key} className="grid grid-cols-[100px_1fr] gap-2 text-xs">
                  <span className="text-muted-foreground capitalize shrink-0">{key.replace(/_/g, ' ')}</span>
                  <span className="font-mono text-foreground break-words text-right">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Factors */}
        {riskFactors.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <p className="text-label">Risk Factors</p>
            </div>
            <div className="space-y-2">
              {riskFactors.map((factor, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-destructive/10 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-destructive" />
                    <span className="text-xs">{factor.factor}</span>
                  </div>
                  <span className="text-xs font-mono text-destructive">+{factor.weight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" />
            <p className="text-label">Activity Timeline</p>
          </div>
          <div className="space-y-0 relative">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
            {timeline.map((event, idx) => (
              <div key={idx} className="flex items-start gap-3 py-2 relative">
                <div className={`w-4 h-4 rounded-full border-2 bg-background z-10 ${
                  event.type === 'flag' ? 'border-destructive' :
                  event.type === 'connection' ? 'border-yellow-500' :
                  'border-accent'
                }`} />
                <div className="flex-1">
                  <p className="text-xs">{event.event}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Connections Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-accent" />
              <p className="text-label">Connections</p>
            </div>
            <span className="text-xs text-muted-foreground">{connections.length} total</span>
          </div>
          <div className="space-y-1">
            {connections.slice(0, 5).map((link, idx) => {
              const otherId = link.source === entityId || link.source?.id === entityId 
                ? (typeof link.target === 'string' ? link.target : link.target?.id)
                : (typeof link.source === 'string' ? link.source : link.source?.id);
              const otherNode = graphData.nodes.find(n => n.id === otherId);
              if (!otherNode) return null;
              
              return (
                <div key={idx} className="flex items-center justify-between p-2 hover:bg-secondary/30 rounded cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      otherNode.flagged ? 'bg-destructive' : 'bg-accent'
                    }`} />
                    <span className="text-xs truncate">{otherNode.label}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground capitalize">
                    {link.edgeType || 'linked'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-border space-y-2">
        <Button className="w-full gap-2" size="sm">
          <ExternalLink className="w-4 h-4" />
          Open Full Dossier
        </Button>
        <Button variant="outline" className="w-full gap-2" size="sm">
          <Globe className="w-4 h-4" />
          Run OSINT Scan
        </Button>
      </div>
    </div>
  );
}
