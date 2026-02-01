import { 
  X, 
  User, 
  Building, 
  MapPin, 
  AlertTriangle, 
  Network, 
  FileText, 
  ExternalLink,
  Shield,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface GraphNode {
  id: string;
  label: string;
  nodeType: 'applicant' | 'agent' | 'company' | 'address';
  flagged: boolean;
  riskScore: number;
}

interface GraphLink {
  source: string;
  target: string;
  edgeType: string;
}

interface EntityQuickViewProps {
  node: GraphNode;
  links: GraphLink[];
  allNodes: GraphNode[];
  onClose: () => void;
  onNavigateToNautica: () => void;
}

const TYPE_CONFIG = {
  applicant: { icon: User, label: 'Applicant', color: 'text-[#8b5cf6]', bgColor: 'bg-[#8b5cf6]/10' },
  agent: { icon: Building, label: 'Agency', color: 'text-[#0d9488]', bgColor: 'bg-[#0d9488]/10' },
  company: { icon: Building, label: 'Company', color: 'text-[#3b82f6]', bgColor: 'bg-[#3b82f6]/10' },
  address: { icon: MapPin, label: 'Address', color: 'text-[#f59e0b]', bgColor: 'bg-[#f59e0b]/10' },
};

export function EntityQuickView({ node, links, allNodes, onClose, onNavigateToNautica }: EntityQuickViewProps) {
  const config = TYPE_CONFIG[node.nodeType];
  const Icon = config.icon;

  // Find connected nodes
  const connectedNodeIds = new Set<string>();
  links.forEach(link => {
    if (link.source === node.id) connectedNodeIds.add(link.target);
    if (link.target === node.id) connectedNodeIds.add(link.source);
  });
  
  const connectedNodes = allNodes.filter(n => connectedNodeIds.has(n.id));
  const flaggedConnections = connectedNodes.filter(n => n.flagged);

  // Risk level
  const getRiskLevel = (score: number) => {
    if (score >= 70) return { label: 'High', color: 'text-destructive', bgColor: 'bg-destructive/10' };
    if (score >= 40) return { label: 'Medium', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' };
    return { label: 'Low', color: 'text-accent', bgColor: 'bg-accent/10' };
  };

  const riskLevel = getRiskLevel(node.riskScore);

  return (
    <div className="absolute top-4 right-4 z-20 w-80 bg-surface-elevated border border-border rounded-lg shadow-xl animate-fade-in">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.bgColor}`}>
              <Icon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{node.label}</h3>
              <p className="text-xs text-muted-foreground">{config.label}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Flagged badge */}
        {node.flagged && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-destructive/10 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-xs text-destructive font-medium">Flagged for Review</span>
          </div>
        )}
      </div>

      {/* Risk Score */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Risk Score</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${riskLevel.bgColor} ${riskLevel.color}`}>
            {riskLevel.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Progress 
            value={node.riskScore} 
            className="flex-1 h-2"
          />
          <span className={`text-lg font-mono font-semibold ${riskLevel.color}`}>
            {node.riskScore}
          </span>
        </div>
      </div>

      {/* Connections */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Connections</span>
          </div>
          <span className="text-sm font-mono">{connectedNodes.length}</span>
        </div>

        {connectedNodes.length > 0 && (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {connectedNodes.slice(0, 5).map(conn => {
              const connConfig = TYPE_CONFIG[conn.nodeType];
              const ConnIcon = connConfig.icon;
              return (
                <div 
                  key={conn.id}
                  className="flex items-center justify-between px-2 py-1.5 bg-secondary/50 rounded text-xs"
                >
                  <div className="flex items-center gap-2">
                    <ConnIcon className={`w-3 h-3 ${connConfig.color}`} />
                    <span className="truncate max-w-[140px]">{conn.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {conn.flagged && (
                      <AlertTriangle className="w-3 h-3 text-destructive" />
                    )}
                    <span className={`font-mono ${
                      conn.riskScore >= 70 ? 'text-destructive' :
                      conn.riskScore >= 40 ? 'text-yellow-500' :
                      'text-muted-foreground'
                    }`}>
                      {conn.riskScore}
                    </span>
                  </div>
                </div>
              );
            })}
            {connectedNodes.length > 5 && (
              <p className="text-xs text-muted-foreground text-center">
                +{connectedNodes.length - 5} more
              </p>
            )}
          </div>
        )}

        {flaggedConnections.length > 0 && (
          <div className="mt-2 flex items-center gap-2 text-xs text-destructive">
            <AlertTriangle className="w-3 h-3" />
            <span>{flaggedConnections.length} flagged connection{flaggedConnections.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-b border-border">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-secondary/30 rounded">
            <FileText className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Documents</p>
            <p className="font-mono text-sm">{Math.floor(Math.random() * 8) + 1}</p>
          </div>
          <div className="text-center p-2 bg-secondary/30 rounded">
            <Clock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Last Activity</p>
            <p className="font-mono text-sm">2h ago</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 space-y-2">
        <Button 
          className="w-full gap-2" 
          size="sm"
          onClick={onNavigateToNautica}
        >
          <Network className="w-4 h-4" />
          View Full Network
          <ExternalLink className="w-3 h-3 ml-auto" />
        </Button>
        <Button 
          variant="outline" 
          className="w-full gap-2" 
          size="sm"
        >
          <Shield className="w-4 h-4" />
          Open Case File
        </Button>
      </div>
    </div>
  );
}
