import { useEffect, useState, useCallback } from 'react';
import { 
  User, 
  Building2, 
  FileText, 
  MapPin,
  AlertTriangle,
  Link2,
  Globe,
  Activity,
  ExternalLink,
  Fingerprint,
  Loader2,
  ChevronRight,
  FileCheck,
  FileWarning,
  Clock,
  Users,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { usePlatform } from '@/contexts/PlatformContext';
import { DossierTabs, NotesTabContent } from './DossierTabs';
import { DossierSkeleton } from '../skeletons/DossierSkeleton';
import { ExplainableFlagsList, RiskExplanationPanel } from '../analytics/ExplainableFlags';

interface EntityDetails {
  id: string;
  nodeId: string;
  label: string;
  nodeType: 'applicant' | 'agent' | 'company' | 'address';
  flagged: boolean;
  riskScore: number;
  caseId: string | null;
  metadata: Record<string, unknown>;
}

interface LinkedDocument {
  id: string;
  filename: string;
  sha256_hash: string;
  flagged: boolean;
  riskScore: number;
  ocrConfidence: number | null;
  documentType: string;
}

interface ConnectedEntity {
  nodeId: string;
  label: string;
  nodeType: string;
  flagged: boolean;
  riskScore: number;
  edgeType: string;
  direction: 'incoming' | 'outgoing';
}

interface TimelineEvent {
  date: string;
  event: string;
  type: 'submission' | 'flag' | 'connection' | 'document' | 'review';
  details?: string;
}

interface RiskFactor {
  factor: string;
  weight: number;
  source: string;
}

export function EntityDossier() {
  const { selectedEntityId, navigateToDocument, navigateToEntity, navigateToCase } = usePlatform();
  const [entity, setEntity] = useState<EntityDetails | null>(null);
  const [documents, setDocuments] = useState<LinkedDocument[]>([]);
  const [connections, setConnections] = useState<ConnectedEntity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEntityData = useCallback(async () => {
    if (!selectedEntityId) {
      setEntity(null);
      setDocuments([]);
      setConnections([]);
      return;
    }

    setLoading(true);

    try {
      // Fetch entity details
      const { data: nodeData } = await supabase
        .from('demo_fraud_nodes')
        .select('*')
        .eq('node_id', selectedEntityId)
        .maybeSingle();

      if (!nodeData) {
        setEntity(null);
        setLoading(false);
        return;
      }

      setEntity({
        id: nodeData.id,
        nodeId: nodeData.node_id,
        label: nodeData.label,
        nodeType: nodeData.node_type as EntityDetails['nodeType'],
        flagged: nodeData.flagged || false,
        riskScore: nodeData.risk_score || 0,
        caseId: nodeData.case_id,
        metadata: (nodeData.metadata as Record<string, unknown>) || {},
      });

      // Fetch linked documents
      const { data: docsData } = await supabase
        .from('vault_documents')
        .select('*')
        .eq('entity_id', selectedEntityId);

      if (docsData) {
        setDocuments(docsData.map(d => ({
          id: d.id,
          filename: d.filename,
          sha256_hash: d.sha256_hash,
          flagged: d.flagged || false,
          riskScore: d.risk_score || 0,
          ocrConfidence: d.ocr_confidence,
          documentType: (d.metadata as Record<string, unknown>)?.documentType as string || 'Unknown',
        })));
      }

      // Fetch connections (outgoing edges)
      const { data: outgoing } = await supabase
        .from('demo_fraud_edges')
        .select('target_node_id, edge_type')
        .eq('source_node_id', selectedEntityId);

      // Fetch connections (incoming edges)
      const { data: incoming } = await supabase
        .from('demo_fraud_edges')
        .select('source_node_id, edge_type')
        .eq('target_node_id', selectedEntityId);

      // Get connected node details
      const connectedIds = [
        ...(outgoing || []).map(e => e.target_node_id),
        ...(incoming || []).map(e => e.source_node_id),
      ];

      if (connectedIds.length > 0) {
        const { data: connectedNodes } = await supabase
          .from('demo_fraud_nodes')
          .select('node_id, label, node_type, flagged, risk_score')
          .in('node_id', connectedIds);

        const connectedEntities: ConnectedEntity[] = [];
        
        outgoing?.forEach(edge => {
          const node = connectedNodes?.find(n => n.node_id === edge.target_node_id);
          if (node) {
            connectedEntities.push({
              nodeId: node.node_id,
              label: node.label,
              nodeType: node.node_type,
              flagged: node.flagged || false,
              riskScore: node.risk_score || 0,
              edgeType: edge.edge_type,
              direction: 'outgoing',
            });
          }
        });

        incoming?.forEach(edge => {
          const node = connectedNodes?.find(n => n.node_id === edge.source_node_id);
          if (node) {
            connectedEntities.push({
              nodeId: node.node_id,
              label: node.label,
              nodeType: node.node_type,
              flagged: node.flagged || false,
              riskScore: node.risk_score || 0,
              edgeType: edge.edge_type,
              direction: 'incoming',
            });
          }
        });

        setConnections(connectedEntities);
      } else {
        setConnections([]);
      }

    } catch (err) {
      console.error('Failed to fetch entity data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedEntityId]);

  useEffect(() => {
    fetchEntityData();
  }, [fetchEntityData]);

  if (!selectedEntityId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <User className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <p className="text-sm text-muted-foreground">Select a node to view details</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Click on any entity in the graph</p>
      </div>
    );
  }

  if (loading) {
    return <DossierSkeleton />;
  }

  if (!entity) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <AlertTriangle className="w-12 h-12 text-destructive/50 mb-4" />
        <p className="text-sm text-muted-foreground">Entity not found</p>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'agent': return <Briefcase className="w-4 h-4" />;
      case 'company': return <Building2 className="w-4 h-4" />;
      case 'address': return <MapPin className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-destructive';
    if (score >= 50) return 'text-yellow-500';
    return 'text-accent';
  };

  // Generate timeline from entity metadata and documents
  const generateTimeline = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    const metadata = entity.metadata;

    if (metadata.submissionDate) {
      events.push({
        date: String(metadata.submissionDate),
        event: 'Application submitted',
        type: 'submission',
        details: `Via ${metadata.consulate || 'consulate'}`,
      });
    }

    documents.forEach(doc => {
      events.push({
        date: new Date().toISOString().split('T')[0],
        event: `Document uploaded: ${doc.documentType}`,
        type: 'document',
        details: doc.flagged ? 'Flagged for review' : undefined,
      });
    });

    if (entity.flagged) {
      events.push({
        date: new Date().toISOString().split('T')[0],
        event: `Risk elevated to ${entity.riskScore}`,
        type: 'flag',
        details: 'Automated risk assessment',
      });
    }

    connections.filter(c => c.flagged).forEach(conn => {
      events.push({
        date: new Date().toISOString().split('T')[0],
        event: `Linked to flagged ${conn.nodeType}`,
        type: 'connection',
        details: conn.label,
      });
    });

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Generate risk factors
  const generateRiskFactors = (): RiskFactor[] => {
    const factors: RiskFactor[] = [];
    
    if (entity.flagged) {
      factors.push({ factor: 'Entity flagged', weight: 25, source: 'System' });
    }
    
    if (entity.riskScore >= 80) {
      factors.push({ factor: 'Critical risk level', weight: 30, source: 'Risk Engine' });
    }

    const flaggedConnections = connections.filter(c => c.flagged).length;
    if (flaggedConnections > 0) {
      factors.push({ factor: `${flaggedConnections} flagged connections`, weight: flaggedConnections * 10, source: 'Network Analysis' });
    }

    const flaggedDocs = documents.filter(d => d.flagged).length;
    if (flaggedDocs > 0) {
      factors.push({ factor: `${flaggedDocs} flagged documents`, weight: flaggedDocs * 15, source: 'Document Analysis' });
    }

    const metadata = entity.metadata;
    if (Array.isArray(metadata.suspiciousIndicators)) {
      metadata.suspiciousIndicators.forEach((indicator: string) => {
        factors.push({ factor: indicator, weight: 20, source: 'Pattern Detection' });
      });
    }

    return factors;
  };

  const timeline = generateTimeline();
  const riskFactors = generateRiskFactors();

  // Overview Tab Content
  const OverviewContent = () => (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 bg-secondary/30 rounded text-center">
            <p className="text-lg font-bold">{connections.length}</p>
            <p className="text-[10px] text-muted-foreground">Connections</p>
          </div>
          <div className="p-3 bg-secondary/30 rounded text-center">
            <p className="text-lg font-bold">{documents.length}</p>
            <p className="text-[10px] text-muted-foreground">Documents</p>
          </div>
          <div className="p-3 bg-secondary/30 rounded text-center">
            <p className="text-lg font-bold">{riskFactors.length}</p>
            <p className="text-[10px] text-muted-foreground">Risk Factors</p>
          </div>
        </div>

        <Separator />

        {/* Metadata Section */}
        {Object.keys(entity.metadata).length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Entity Data</span>
            </div>
            <div className="space-y-2 p-3 bg-secondary/20 rounded-lg">
              {Object.entries(entity.metadata)
                .filter(([key]) => key !== 'suspiciousIndicators')
                .map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="font-mono text-foreground">
                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Explainable Flags Section */}
        {entity.metadata?.flags && Array.isArray(entity.metadata.flags) && (entity.metadata.flags as string[]).length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium">Detection Flags</span>
            </div>
            <ExplainableFlagsList flags={entity.metadata.flags as string[]} maxVisible={5} />
          </div>
        )}

        {/* Risk Explanation Panel */}
        {entity.flagged && (
          <RiskExplanationPanel 
            riskScore={entity.riskScore}
            flags={(entity.metadata?.flags as string[]) || []}
            metadata={entity.metadata}
          />
        )}

        {/* Risk Factors Section (fallback for entities without flags) */}
        {riskFactors.length > 0 && !entity.metadata?.flags && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium">Risk Factors</span>
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

        {/* Connected Entities Preview */}
        {connections.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Connected Entities</span>
              <Badge variant="secondary" className="text-[10px]">{connections.length}</Badge>
            </div>
            <div className="space-y-2">
              {connections.slice(0, 3).map((conn, idx) => (
                <div 
                  key={`${conn.nodeId}-${idx}`}
                  onClick={() => navigateToEntity(conn.nodeId)}
                  className="flex items-center justify-between p-2 bg-secondary/30 rounded hover:bg-secondary/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      conn.flagged ? 'bg-destructive' : 'bg-accent'
                    }`} />
                    <div className="min-w-0">
                      <p className="text-xs truncate">{conn.label}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{conn.nodeType}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                </div>
              ))}
              {connections.length > 3 && (
                <p className="text-[10px] text-muted-foreground text-center">
                  +{connections.length - 3} more connections
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );

  // Documents Tab Content
  const DocumentsContent = () => (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-2">
        {documents.length > 0 ? (
          documents.map(doc => (
            <div 
              key={doc.id}
              onClick={() => navigateToDocument(doc.id)}
              className="flex items-center justify-between p-3 bg-secondary/30 rounded hover:bg-secondary/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                {doc.flagged ? (
                  <FileWarning className="w-5 h-5 text-destructive shrink-0" />
                ) : (
                  <FileCheck className="w-5 h-5 text-accent shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm truncate">{doc.filename}</p>
                  <p className="text-xs text-muted-foreground">{doc.documentType}</p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-1 truncate">
                    {doc.sha256_hash.substring(0, 16)}...
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {doc.flagged && (
                  <Badge variant="destructive" className="text-[9px]">FLAGGED</Badge>
                )}
                {doc.ocrConfidence && (
                  <span className={`text-xs font-mono ${
                    doc.ocrConfidence > 90 ? 'text-accent' :
                    doc.ocrConfidence > 80 ? 'text-yellow-500' : 'text-destructive'
                  }`}>
                    {doc.ocrConfidence.toFixed(0)}%
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <FileText className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">No linked documents</p>
            <p className="text-xs mt-1">Documents will appear here when linked</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );

  // Timeline Tab Content
  const TimelineContent = () => (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-0 relative">
        {timeline.length > 0 ? (
          <>
            <div className="absolute left-[23px] top-6 bottom-6 w-px bg-border" />
            {timeline.map((event, idx) => (
              <div key={idx} className="flex items-start gap-3 py-3 relative">
                <div className={`w-4 h-4 rounded-full border-2 bg-background z-10 shrink-0 ${
                  event.type === 'flag' ? 'border-destructive' :
                  event.type === 'connection' ? 'border-yellow-500' :
                  event.type === 'document' ? 'border-blue-500' :
                  'border-accent'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{event.event}</p>
                  {event.details && (
                    <p className="text-xs text-muted-foreground">{event.details}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {event.date}
                  </p>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Activity className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">No activity recorded</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start gap-3">
          <div className={`p-3 rounded-lg ${entity.flagged ? 'bg-destructive/20' : 'bg-accent/10'}`}>
            {getTypeIcon(entity.nodeType)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{entity.label}</h3>
              {entity.flagged && <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-[10px] capitalize">
                {entity.nodeType}
              </Badge>
              {entity.caseId && (
                <Badge 
                  variant="secondary" 
                  className="text-[10px] cursor-pointer hover:bg-secondary/80"
                  onClick={() => navigateToCase(entity.caseId!)}
                >
                  {entity.caseId}
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${getRiskColor(entity.riskScore)}`}>
              {entity.riskScore}
            </p>
            <p className="text-[10px] text-muted-foreground">Risk Score</p>
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <DossierTabs
        documentCount={documents.length}
        connectionCount={connections.length}
      >
        {{
          overview: <OverviewContent />,
          documents: <DocumentsContent />,
          timeline: <TimelineContent />,
          notes: <NotesTabContent />,
        }}
      </DossierTabs>

      {/* Actions */}
      <div className="p-4 border-t border-border space-y-2">
        {entity.caseId && (
          <Button 
            className="w-full gap-2" 
            size="sm"
            onClick={() => navigateToCase(entity.caseId!)}
          >
            <ExternalLink className="w-4 h-4" />
            Open Case File
          </Button>
        )}
        <Button variant="outline" className="w-full gap-2" size="sm">
          <Globe className="w-4 h-4" />
          Run OSINT Scan
        </Button>
      </div>
    </div>
  );
}
