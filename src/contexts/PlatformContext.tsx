import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Types for cross-module entities
export interface PlatformEntity {
  id: string;
  type: 'applicant' | 'agent' | 'company' | 'address' | 'document' | 'case';
  label: string;
  flagged?: boolean;
  riskScore?: number;
  caseId?: string;
  metadata?: Record<string, unknown>;
}

export interface PlatformCase {
  id: string;
  caseNumber: string;
  applicant: string;
  type: string;
  status: 'open' | 'under_review' | 'pending_approval' | 'escalated' | 'closed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  riskScore: number;
}

export interface PlatformDocument {
  id: string;
  filename: string;
  hash: string;
  status: 'verified' | 'pending' | 'flagged';
  caseId?: string;
  entityId?: string;
}

type ActiveModule = 'maris' | 'nautica' | 'meridian';
export type NauticaView = 'graph' | 'social' | 'geopolitical';

interface PlatformContextValue {
  // Active module
  activeModule: ActiveModule;
  setActiveModule: (module: ActiveModule) => void;
  
  // Nautica sub-view
  nauticaView: NauticaView;
  setNauticaView: (view: NauticaView) => void;
  
  // Selection state
  selectedEntityId: string | null;
  selectedCaseId: string | null;
  selectedDocumentId: string | null;
  
  // Selection actions
  selectEntity: (entityId: string | null, navigateToModule?: boolean) => void;
  selectCase: (caseId: string | null, navigateToModule?: boolean) => void;
  selectDocument: (documentId: string | null, navigateToModule?: boolean) => void;
  
  // Cross-module navigation
  navigateToEntity: (entityId: string) => void;
  navigateToCase: (caseId: string) => void;
  navigateToDocument: (documentId: string) => void;
  
  // Unified search data
  entities: PlatformEntity[];
  documents: PlatformDocument[];
  cases: PlatformCase[];
  isLoading: boolean;
  
  // Refresh data
  refreshData: () => Promise<void>;
  
  // Path analysis
  pathSourceNode: string | null;
  pathTargetNode: string | null;
  setPathSourceNode: (nodeId: string | null) => void;
  setPathTargetNode: (nodeId: string | null) => void;
  clearPathAnalysis: () => void;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

export function usePlatform() {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
}

// Demo cases (will later be pulled from DB)
const DEMO_CASES: PlatformCase[] = [
  {
    id: 'case-001',
    caseNumber: 'CASE-2026-4829',
    applicant: 'Ahmad Rezaee',
    type: 'Visa Fraud Investigation',
    status: 'under_review',
    priority: 'critical',
    riskScore: 94,
  },
  {
    id: 'case-002',
    caseNumber: 'CASE-2026-4827',
    applicant: 'Elena Sokolova',
    type: 'Document Verification',
    status: 'escalated',
    priority: 'high',
    riskScore: 72,
  },
  {
    id: 'case-003',
    caseNumber: 'CASE-2026-4830',
    applicant: 'Viktor Petrov',
    type: 'Network Analysis',
    status: 'open',
    priority: 'high',
    riskScore: 65,
  },
];

interface PlatformProviderProps {
  children: ReactNode;
  defaultModule?: ActiveModule;
}

export function PlatformProvider({ children, defaultModule = 'nautica' }: PlatformProviderProps) {
  const [activeModule, setActiveModule] = useState<ActiveModule>(defaultModule);
  const [nauticaView, setNauticaView] = useState<NauticaView>('graph');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  
  const [entities, setEntities] = useState<PlatformEntity[]>([]);
  const [documents, setDocuments] = useState<PlatformDocument[]>([]);
  const [cases, setCases] = useState<PlatformCase[]>(DEMO_CASES);
  const [isLoading, setIsLoading] = useState(true);
  
  // Path analysis state
  const [pathSourceNode, setPathSourceNode] = useState<string | null>(null);
  const [pathTargetNode, setPathTargetNode] = useState<string | null>(null);

  const clearPathAnalysis = useCallback(() => {
    setPathSourceNode(null);
    setPathTargetNode(null);
  }, []);

  // Fetch all platform data
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Fetch entities from fraud nodes
      const { data: nodesData } = await supabase
        .from('demo_fraud_nodes')
        .select('*');
      
      if (nodesData) {
        const platformEntities: PlatformEntity[] = nodesData.map((n) => ({
          id: n.node_id,
          type: n.node_type as PlatformEntity['type'],
          label: n.label,
          flagged: n.flagged || false,
          riskScore: n.risk_score || 0,
          caseId: n.case_id || undefined,
          metadata: (n.metadata as Record<string, unknown>) || {},
        }));
        setEntities(platformEntities);
      }
      
      // Fetch documents from vault
      const { data: docsData } = await supabase
        .from('vault_documents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (docsData) {
        const platformDocs: PlatformDocument[] = docsData.map((d) => ({
          id: d.id,
          filename: d.filename,
          hash: d.sha256_hash,
          status: d.flagged ? 'flagged' : d.ocr_status === 'completed' ? 'verified' : 'pending',
          caseId: d.case_id || undefined,
          entityId: d.entity_id || undefined,
        }));
        setDocuments(platformDocs);
      }
      
    } catch (err) {
      console.error('Failed to fetch platform data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Selection with optional module navigation
  const selectEntity = useCallback((entityId: string | null, navigateToModule = false) => {
    setSelectedEntityId(entityId);
    if (navigateToModule && entityId) {
      setActiveModule('nautica');
    }
  }, []);

  const selectCase = useCallback((caseId: string | null, navigateToModule = false) => {
    setSelectedCaseId(caseId);
    if (navigateToModule && caseId) {
      setActiveModule('meridian');
    }
  }, []);

  const selectDocument = useCallback((documentId: string | null, navigateToModule = false) => {
    setSelectedDocumentId(documentId);
    if (navigateToModule && documentId) {
      setActiveModule('maris');
    }
  }, []);

  // Cross-module navigation helpers
  const navigateToEntity = useCallback((entityId: string) => {
    setSelectedEntityId(entityId);
    setActiveModule('nautica');
  }, []);

  const navigateToCase = useCallback((caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveModule('meridian');
  }, []);

  const navigateToDocument = useCallback((documentId: string) => {
    setSelectedDocumentId(documentId);
    setActiveModule('maris');
  }, []);

  const value: PlatformContextValue = {
    activeModule,
    setActiveModule,
    nauticaView,
    setNauticaView,
    selectedEntityId,
    selectedCaseId,
    selectedDocumentId,
    selectEntity,
    selectCase,
    selectDocument,
    navigateToEntity,
    navigateToCase,
    navigateToDocument,
    entities,
    documents,
    cases,
    isLoading,
    refreshData,
    pathSourceNode,
    pathTargetNode,
    setPathSourceNode,
    setPathTargetNode,
    clearPathAnalysis,
  };

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  );
}
