import { Route, X, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraphNode } from '../NauticaGraph';

interface PathResult {
  path: string[];
  distance: number;
  nodes: GraphNode[];
  links: { source: string; target: string; edgeType: string }[];
}

interface PathAnalysisPanelProps {
  sourceNode: string | null;
  targetNode: string | null;
  pathResult: PathResult | null;
  isAnalyzing: boolean;
  nodes: GraphNode[];
  onAnalyze: () => void;
  onClear: () => void;
  onNodeClick: (nodeId: string) => void;
}

export function PathAnalysisPanel({
  sourceNode,
  targetNode,
  pathResult,
  isAnalyzing,
  nodes,
  onAnalyze,
  onClear,
  onNodeClick,
}: PathAnalysisPanelProps) {
  const sourceNodeData = nodes.find(n => n.id === sourceNode);
  const targetNodeData = nodes.find(n => n.id === targetNode);

  if (!sourceNode && !targetNode && !pathResult) {
    return null;
  }

  return (
    <div className="absolute top-16 right-4 z-10 w-72 bg-surface-elevated border border-border rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-secondary/30 border-b border-border">
        <div className="flex items-center gap-2">
          <Route className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">Path Analysis</span>
        </div>
        <button 
          onClick={onClear}
          className="p-1 hover:bg-secondary rounded transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Source/Target Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${sourceNode ? 'bg-accent' : 'bg-muted'}`} />
            <span className="text-xs text-muted-foreground">Source:</span>
            {sourceNodeData ? (
              <button 
                onClick={() => onNodeClick(sourceNode!)}
                className="text-xs font-medium text-accent hover:underline truncate"
              >
                {sourceNodeData.label}
              </button>
            ) : (
              <span className="text-xs text-muted-foreground italic">Click a node</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${targetNode ? 'bg-primary' : 'bg-muted'}`} />
            <span className="text-xs text-muted-foreground">Target:</span>
            {targetNodeData ? (
              <button 
                onClick={() => onNodeClick(targetNode!)}
                className="text-xs font-medium text-primary hover:underline truncate"
              >
                {targetNodeData.label}
              </button>
            ) : (
              <span className="text-xs text-muted-foreground italic">Shift+click a node</span>
            )}
          </div>
        </div>

        {/* Analyze Button */}
        {sourceNode && targetNode && !pathResult && (
          <Button 
            onClick={onAnalyze}
            disabled={isAnalyzing}
            size="sm"
            className="w-full"
          >
            {isAnalyzing ? 'Analyzing...' : 'Find Shortest Path'}
          </Button>
        )}

        {/* Path Result */}
        {pathResult && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Path Found</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {pathResult.distance} hop{pathResult.distance !== 1 ? 's' : ''}
              </Badge>
            </div>

            {/* Path Visualization */}
            <div className="p-2 bg-secondary/20 rounded space-y-1 max-h-48 overflow-y-auto">
              {pathResult.nodes.map((node, idx) => (
                <div key={node.id}>
                  <button
                    onClick={() => onNodeClick(node.id)}
                    className={`flex items-center gap-2 w-full p-1.5 rounded text-left hover:bg-secondary/50 transition-colors ${
                      node.flagged ? 'bg-destructive/10' : ''
                    }`}
                  >
                    <div 
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ 
                        backgroundColor: 
                          node.nodeType === 'applicant' ? '#8b5cf6' :
                          node.nodeType === 'agent' ? '#0d9488' :
                          node.nodeType === 'company' ? '#3b82f6' : '#f59e0b'
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{node.label}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{node.nodeType}</p>
                    </div>
                    {node.flagged && (
                      <AlertTriangle className="w-3 h-3 text-destructive shrink-0" />
                    )}
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {node.riskScore}
                    </span>
                  </button>
                  
                  {/* Edge indicator */}
                  {idx < pathResult.nodes.length - 1 && pathResult.links[idx] && (
                    <div className="flex items-center gap-1 pl-4 py-0.5">
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground capitalize">
                        {pathResult.links[idx].edgeType}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Risk Summary */}
            {pathResult.nodes.some(n => n.flagged) && (
              <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded text-xs text-destructive">
                <AlertTriangle className="w-4 h-4" />
                <span>{pathResult.nodes.filter(n => n.flagged).length} flagged entities in path</span>
              </div>
            )}
          </div>
        )}

        {/* No Path Found */}
        {pathResult === null && sourceNode && targetNode && !isAnalyzing && (
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
            <X className="w-4 h-4" />
            <span>No connection found between these entities</span>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground">
          Tip: Shift+click to select target node
        </p>
      </div>
    </div>
  );
}
