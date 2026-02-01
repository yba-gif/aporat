import { useEffect, useState } from 'react';
import { User, FileText, Calendar, MapPin, AlertTriangle, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface NodeData {
  id: string;
  nodeId: string;
  label: string;
  nodeType: 'applicant' | 'agent' | 'company' | 'address';
  flagged: boolean;
  riskScore: number;
  metadata: Record<string, unknown>;
  connections: { type: string; count: number }[];
}

interface ApplicantPanelProps {
  selectedNode: string | null;
}

export function ApplicantPanel({ selectedNode }: ApplicantPanelProps) {
  const [data, setData] = useState<NodeData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchNodeData() {
      if (!selectedNode) {
        setData(null);
        return;
      }

      setLoading(true);

      // Fetch node data
      const { data: nodeData } = await supabase
        .from('demo_fraud_nodes')
        .select('*')
        .eq('node_id', selectedNode)
        .maybeSingle();

      if (!nodeData) {
        setData(null);
        setLoading(false);
        return;
      }

      // Fetch connection counts
      const { data: outgoingEdges } = await supabase
        .from('demo_fraud_edges')
        .select('edge_type')
        .eq('source_node_id', selectedNode);

      const { data: incomingEdges } = await supabase
        .from('demo_fraud_edges')
        .select('edge_type')
        .eq('target_node_id', selectedNode);

      // Count connections by type
      const allEdges = [...(outgoingEdges || []), ...(incomingEdges || [])];
      const connectionCounts: Record<string, number> = {};
      allEdges.forEach((e) => {
        const type = e.edge_type;
        connectionCounts[type] = (connectionCounts[type] || 0) + 1;
      });

      const connections = Object.entries(connectionCounts).map(([type, count]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count,
      }));

      setData({
        id: nodeData.id,
        nodeId: nodeData.node_id,
        label: nodeData.label,
        nodeType: nodeData.node_type as NodeData['nodeType'],
        flagged: nodeData.flagged || false,
        riskScore: nodeData.risk_score || 0,
        metadata: (nodeData.metadata as Record<string, unknown>) || {},
        connections,
      });

      setLoading(false);
    }

    fetchNodeData();
  }, [selectedNode]);

  if (!selectedNode) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div>
          <User className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Select a node to view details
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div>
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Node data not found
          </p>
        </div>
      </div>
    );
  }

  const metadata = data.metadata;
  const flags = data.flagged
    ? getFlags(data.nodeType, data.riskScore)
    : [];

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs font-mono text-muted-foreground uppercase">
              {data.nodeType}
            </p>
            <h3 className="font-semibold">{data.label}</h3>
          </div>
          <div className={`px-2 py-1 rounded text-xs font-mono ${
            data.riskScore >= 90 
              ? 'bg-destructive/10 text-destructive' 
              : data.riskScore >= 70 
                ? 'bg-yellow-500/10 text-yellow-500' 
                : 'bg-accent/10 text-accent'
          }`}>
            RISK {data.riskScore}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          {metadata.nationality && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{String(metadata.nationality)}</span>
            </div>
          )}
          {metadata.visaType && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <FileText className="w-3 h-3" />
              <span>{String(metadata.visaType)}</span>
            </div>
          )}
          {metadata.submissionDate && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{String(metadata.submissionDate)}</span>
            </div>
          )}
          {metadata.consulate && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ExternalLink className="w-3 h-3" />
              <span>{String(metadata.consulate)}</span>
            </div>
          )}
          {metadata.hash && (
            <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
              <FileText className="w-3 h-3" />
              <span className="font-mono">{String(metadata.hash)}</span>
            </div>
          )}
          {metadata.bank && (
            <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
              <span>{String(metadata.bank)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Flags */}
      {flags.length > 0 && (
        <div className="p-4 border-b border-border">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Integrity Flags
          </p>
          <div className="space-y-2">
            {flags.map((flag, i) => (
              <div 
                key={i}
                className="flex items-start gap-2 text-xs p-2 bg-destructive/5 border border-destructive/20 rounded"
              >
                <AlertTriangle className="w-3 h-3 text-destructive shrink-0 mt-0.5" />
                <span className="text-destructive">{flag}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata Details */}
      {Object.keys(metadata).length > 0 && (
        <div className="p-4 border-b border-border">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Metadata
          </p>
          <div className="space-y-1">
            {Object.entries(metadata).map(([key, value]) => (
              <div 
                key={key}
                className="flex items-center justify-between text-xs p-2 bg-secondary/50 rounded"
              >
                <span className="text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="font-mono text-foreground">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connections */}
      {data.connections.length > 0 && (
        <div className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Graph Connections
          </p>
          <div className="grid grid-cols-2 gap-2">
            {data.connections.map((conn, i) => (
              <div key={i} className="p-2 bg-secondary/50 rounded text-center">
                <p className="text-lg font-mono font-semibold">{conn.count}</p>
                <p className="text-[10px] text-muted-foreground">{conn.type}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getFlags(nodeType: string, riskScore: number): string[] {
  const flags: string[] = [];
  
  if (riskScore >= 90) {
    flags.push('Critical risk level detected');
  }
  
  if (nodeType === 'applicant') {
    flags.push('Linked to flagged agent');
    flags.push('Duplicate document hash detected');
    if (riskScore >= 85) {
      flags.push('Pattern match: visa mill network');
    }
  } else if (nodeType === 'agent') {
    flags.push('Multiple linked applicants with identical documents');
    flags.push('Submission pattern anomaly');
    flags.push('Under investigation');
  } else if (nodeType === 'company') {
    flags.push('Shell company indicators detected');
    flags.push('Linked to multiple flagged agencies');
    flags.push('Financial irregularities flagged');
  } else if (nodeType === 'address') {
    flags.push('Address used across multiple unrelated applications');
    flags.push('Known fraud hotspot location');
  }
  
  return flags;
}
