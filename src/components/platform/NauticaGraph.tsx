import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import ForceGraph2D, { ForceGraphMethods, NodeObject, LinkObject } from 'react-force-graph-2d';
import { ZoomIn, ZoomOut, Maximize2, Loader2, RotateCcw, Target, Route } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { FilterPanel, FilterState } from './FilterPanel';
import { GraphMinimap } from './GraphMinimap';
import { ViewToggle } from './ViewToggle';
import { NauticaGraph3D } from './NauticaGraph3D';
import { GraphContextMenu } from './nautica/GraphContextMenu';
import { Slider } from '@/components/ui/slider';
import { PathAnalysisPanel } from './analytics/PathAnalysisPanel';
import { usePathAnalysis } from '@/hooks/usePathAnalysis';
import { usePlatform } from '@/contexts/PlatformContext';

export interface GraphNode extends NodeObject {
  id: string;
  label: string;
  nodeType: 'applicant' | 'agent' | 'company' | 'address';
  flagged: boolean;
  riskScore: number;
  caseId?: string | null;
  metadata: Record<string, unknown>;
  cluster?: string;
  geoRisk?: number; // instability score from geopolitical data
}

export interface GraphLink extends LinkObject {
  source: string;
  target: string;
  edgeType: 'submitted' | 'uses' | 'linked' | 'located';
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

interface NauticaGraphProps {
  onNodeSelect: (nodeId: string | null) => void;
  selectedNode: string | null;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  node: GraphNode | null;
}

// More vibrant, distinct colors for each node type
const NODE_COLORS: Record<string, string> = {
  applicant: '#8b5cf6',  // Purple for people
  agent: '#0d9488',      // Teal for agencies
  company: '#3b82f6',    // Blue for companies
  address: '#f59e0b',    // Amber for locations
};

const FLAGGED_RING_COLOR = '#ef4444';
const SELECTED_COLOR = '#22d3ee';
const GEO_RISK_COLOR = '#f97316'; // Orange for geopolitical risk
const GEO_RISK_THRESHOLD = 60;

// ISO 2-letter to country name for matching geopolitical data
const ISO_TO_COUNTRY: Record<string, string> = {
  IR: 'Iran', RU: 'Russia', UA: 'Ukraine', CN: 'China', KR: 'South Korea',
  EG: 'Egypt', CZ: 'Czech Republic', SY: 'Syria', AF: 'Afghanistan',
  IQ: 'Iraq', PK: 'Pakistan', NG: 'Nigeria', SO: 'Somalia', YE: 'Yemen',
  LY: 'Libya', SD: 'Sudan', MM: 'Myanmar', VE: 'Venezuela', CD: 'Congo',
  ET: 'Ethiopia', ML: 'Mali', BF: 'Burkina Faso', MZ: 'Mozambique',
  CM: 'Cameroon', TD: 'Chad', NE: 'Niger', CF: 'Central African Republic',
};

const NETWORK_PATTERNS: Record<string, string[]> = {
  'Visa Mill': ['agent-1', 'app-1', 'app-2', 'app-3', 'app-4', 'app-5', 'app-6', 'app-7', 'app-8', 'doc-1', 'addr-1'],
  'Document Forgery': ['forger-1', 'doc-forged-1', 'doc-forged-2', 'doc-forged-3', 'app-forge-1', 'app-forge-2', 'app-forge-3', 'app-forge-4'],
  'Identity Swap': ['swap-hub', 'doc-id-1', 'doc-id-2', 'doc-id-3', 'addr-swap-1', 'addr-swap-2', 'app-swap-1', 'app-swap-2', 'app-swap-3'],
  'Money Laundering': ['launder-agent', 'doc-bank-1', 'doc-bank-2', 'addr-launder-1', 'app-launder-1', 'app-launder-2', 'app-launder-3'],
};

export function NauticaGraph({ onNodeSelect, selectedNode }: NauticaGraphProps) {
  const { pathSourceNode, pathTargetNode, setPathSourceNode, setPathTargetNode, clearPathAnalysis } = usePlatform();
  const graphRef = useRef<ForceGraphMethods<GraphNode, GraphLink>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [viewportBounds, setViewportBounds] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isEngineRunning, setIsEngineRunning] = useState(true);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    node: null
  });
  
  const [filters, setFilters] = useState<FilterState>({
    nodeTypes: ['applicant', 'agent', 'company', 'address'],
    riskRange: [0, 100],
    flaggedOnly: false,
    networkFilter: null,
    dateRange: null,
  });

  const [pathAnalysisMode, setPathAnalysisMode] = useState(false);

  // Fetch data from database
  useEffect(() => {
    async function fetchGraphData() {
      setLoading(true);
      
      const [nodesRes, edgesRes, geoRes] = await Promise.all([
        supabase.from('demo_fraud_nodes').select('*'),
        supabase.from('demo_fraud_edges').select('*'),
        supabase.functions.invoke('geopolitical-data', {
          body: { sources: ['acled', 'gdelt'] },
        }).catch(() => ({ data: null, error: null })),
      ]);

      // Build country risk lookup
      const countryRiskMap = new Map<string, number>();
      if (geoRes?.data?.countryRisks) {
        for (const cr of geoRes.data.countryRisks) {
          countryRiskMap.set(cr.country.toLowerCase(), cr.instabilityScore);
        }
      }

      if (nodesRes.data && edgesRes.data) {
        const nodes: GraphNode[] = nodesRes.data.map((n) => {
          let cluster: string | undefined;
          for (const [network, ids] of Object.entries(NETWORK_PATTERNS)) {
            if (ids.some(id => n.node_id.startsWith(id.split('-')[0]))) {
              cluster = network;
              break;
            }
          }

          // Resolve geo-risk from nationality
          let geoRisk: number | undefined;
          const meta = (n.metadata as Record<string, unknown>) || {};
          const nationality = meta.nationality as string | undefined;
          if (nationality) {
            const countryName = ISO_TO_COUNTRY[nationality.toUpperCase()] || nationality;
            geoRisk = countryRiskMap.get(countryName.toLowerCase());
          }
          
          return {
            id: n.node_id,
            label: n.label,
            nodeType: n.node_type as GraphNode['nodeType'],
            flagged: n.flagged || false,
            riskScore: n.risk_score || 0,
            caseId: n.case_id || null,
            metadata: meta,
            cluster,
            geoRisk,
          };
        });

        const links: GraphLink[] = edgesRes.data.map((e) => ({
          source: e.source_node_id,
          target: e.target_node_id,
          edgeType: e.edge_type as GraphLink['edgeType'],
        }));

        setGraphData({ nodes, links });
      }
      
      setLoading(false);
    }

    fetchGraphData();
  }, []);

  // Handle container resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Apply filters
  const filteredData = useMemo(() => {
    let nodes = graphData.nodes.filter((node) => {
      if (!filters.nodeTypes.includes(node.nodeType)) return false;
      if (node.riskScore < filters.riskRange[0] || node.riskScore > filters.riskRange[1]) return false;
      if (filters.flaggedOnly && !node.flagged) return false;
      if (filters.networkFilter) {
        const networkIds = NETWORK_PATTERNS[filters.networkFilter] || [];
        if (!networkIds.some(id => node.id.startsWith(id.split('-')[0]) || node.id === id)) return false;
      }
      return true;
    });

    const nodeIds = new Set(nodes.map((n) => n.id));
    const links = graphData.links.filter(
      (link) => nodeIds.has(link.source as string) && nodeIds.has(link.target as string)
    );

    return { nodes, links };
  }, [graphData, filters]);

  // Path analysis hook - connected to PlatformContext for shared state
  const pathAnalysis = usePathAnalysis(filteredData.nodes, filteredData.links, {
    externalSourceNode: pathSourceNode,
    externalTargetNode: pathTargetNode,
    onSourceChange: setPathSourceNode,
    onTargetChange: setPathTargetNode,
  });

  // Always use node type color - flagged status shown via ring
  const getNodeColor = useCallback((node: GraphNode) => {
    return NODE_COLORS[node.nodeType] || '#6b7280';
  }, []);

  const getNodeSize = useCallback((node: GraphNode) => {
    switch (node.nodeType) {
      case 'agent': return 8;
      case 'company': return 6;
      case 'address': return 5;
      default: return 4;
    }
  }, []);

  const handleNodeClick = useCallback((node: GraphNode, event: MouseEvent) => {
    // Close context menu on any click
    setContextMenu(prev => ({ ...prev, visible: false }));
    
    // Path analysis mode - Shift+click for target selection
    if (pathAnalysisMode || event.shiftKey) {
      pathAnalysis.selectNodeForPath(node.id, event.shiftKey);
      return;
    }
    
    // Toggle selection
    const newSelection = selectedNode === node.id ? null : node.id;
    onNodeSelect(newSelection);
    
    // Center and zoom on node
    if (graphRef.current && node.x !== undefined && node.y !== undefined) {
      graphRef.current.centerAt(node.x, node.y, 500);
      graphRef.current.zoom(2, 500);
      setZoomLevel(2);
    }
  }, [onNodeSelect, selectedNode, pathAnalysisMode, pathAnalysis]);

  const handleNodeRightClick = useCallback((node: GraphNode, event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Select the node when right-clicking
    onNodeSelect(node.id);
    
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      node: node
    });
  }, [onNodeSelect]);

  const handleBackgroundClick = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  const handleBackgroundRightClick = useCallback((event: MouseEvent) => {
    event.preventDefault();
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  const handleCommandSelect = useCallback((nodeId: string) => {
    onNodeSelect(nodeId);
    const node = graphData.nodes.find((n) => n.id === nodeId);
    if (graphRef.current && node?.x !== undefined && node?.y !== undefined) {
      graphRef.current.centerAt(node.x, node.y, 500);
      graphRef.current.zoom(2, 500);
    }
  }, [onNodeSelect, graphData.nodes]);

  const handleMinimapNavigate = useCallback((x: number, y: number) => {
    graphRef.current?.centerAt(x, y, 500);
  }, []);

  // Improved zoom handlers with smoother transitions
  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(zoomLevel * 1.5, 10);
    graphRef.current?.zoom(newZoom, 400);
    setZoomLevel(newZoom);
  }, [zoomLevel]);
  
  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(zoomLevel / 1.5, 0.1);
    graphRef.current?.zoom(newZoom, 400);
    setZoomLevel(newZoom);
  }, [zoomLevel]);
  
  const handleZoomSlider = useCallback((value: number[]) => {
    const newZoom = value[0];
    graphRef.current?.zoom(newZoom, 200);
    setZoomLevel(newZoom);
  }, []);
  
  const handleReset = useCallback(() => {
    graphRef.current?.zoomToFit(400, 80);
    setZoomLevel(1);
  }, []);

  const handleCenterSelected = useCallback(() => {
    if (selectedNode) {
      const node = graphData.nodes.find(n => n.id === selectedNode);
      if (node?.x !== undefined && node?.y !== undefined) {
        graphRef.current?.centerAt(node.x, node.y, 500);
        graphRef.current?.zoom(2.5, 500);
        setZoomLevel(2.5);
      }
    }
  }, [selectedNode, graphData.nodes]);

  const handleRefreshLayout = useCallback(() => {
    setIsEngineRunning(true);
    graphRef.current?.d3ReheatSimulation();
  }, []);

  // Custom node rendering
  const paintNode = useCallback((node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const size = getNodeSize(node);
    const color = getNodeColor(node);
    const isSelected = selectedNode === node.id;
    const isHovered = hoveredNode === node.id;
    const isInPath = pathAnalysis.isNodeInPath(node.id);
    const isPathEndpoint = pathAnalysis.sourceNode === node.id || pathAnalysis.targetNode === node.id;
    const hasGeoRisk = (node.geoRisk ?? 0) >= GEO_RISK_THRESHOLD;
    const x = node.x || 0;
    const y = node.y || 0;

    // Geo-risk indicator — outer orange ring (drawn first, behind everything)
    if (hasGeoRisk) {
      ctx.beginPath();
      ctx.arc(x, y, size + 6, 0, 2 * Math.PI);
      ctx.strokeStyle = GEO_RISK_COLOR;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // Small globe marker at top-right of node
      const markerX = x + size * 0.7;
      const markerY = y - size * 0.7;
      const markerSize = Math.max(3.5, 5 / globalScale);
      ctx.beginPath();
      ctx.arc(markerX, markerY, markerSize, 0, 2 * Math.PI);
      ctx.fillStyle = GEO_RISK_COLOR;
      ctx.fill();
      ctx.strokeStyle = '#00000066';
      ctx.lineWidth = 0.5;
      ctx.stroke();
      
      // Globe lines inside marker
      ctx.beginPath();
      ctx.ellipse(markerX, markerY, markerSize * 0.6, markerSize, 0, 0, 2 * Math.PI);
      ctx.strokeStyle = '#ffffff88';
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(markerX - markerSize, markerY);
      ctx.lineTo(markerX + markerSize, markerY);
      ctx.strokeStyle = '#ffffff88';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Flagged indicator - pulsing outer ring
    if (node.flagged) {
      ctx.beginPath();
      ctx.arc(x, y, size + 4, 0, 2 * Math.PI);
      ctx.strokeStyle = FLAGGED_RING_COLOR;
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 2]);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Inner glow
      ctx.beginPath();
      ctx.arc(x, y, size + 2, 0, 2 * Math.PI);
      ctx.fillStyle = `${FLAGGED_RING_COLOR}33`;
      ctx.fill();
    }

    // Path analysis highlight
    if (isInPath || isPathEndpoint) {
      ctx.beginPath();
      ctx.arc(x, y, size + 5, 0, 2 * Math.PI);
      ctx.strokeStyle = isPathEndpoint ? '#f59e0b' : '#22d3ee';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // Selection ring - cyan for visibility
    if (isSelected && !isPathEndpoint) {
      ctx.beginPath();
      ctx.arc(x, y, size + 3, 0, 2 * Math.PI);
      ctx.strokeStyle = SELECTED_COLOR;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // Hover ring
    if (isHovered && !isSelected) {
      ctx.beginPath();
      ctx.arc(x, y, size + 1.5, 0, 2 * Math.PI);
      ctx.strokeStyle = '#ffffff44';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Main node circle
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    // Node label - only show on hover/select or when very zoomed in
    if (isSelected || isHovered || globalScale > 2) {
      const label = node.label;
      const fontSize = Math.max(9 / globalScale, 2.5);
      ctx.font = `${fontSize}px JetBrains Mono, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      // Background for label
      const metrics = ctx.measureText(label);
      const padding = 2 / globalScale;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(
        x - metrics.width / 2 - padding,
        y + size + 2,
        metrics.width + padding * 2,
        fontSize + padding
      );
      
      ctx.fillStyle = '#e5e7eb';
      ctx.fillText(label, x, y + size + 3);
    }

    // Type badge only on hover/select
    if ((isSelected || isHovered) && node.nodeType !== 'applicant') {
      const badgeSize = Math.max(7 / globalScale, 2);
      ctx.font = `${badgeSize}px JetBrains Mono, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = color;
      ctx.fillText(node.nodeType.toUpperCase(), x, y - size - 2);
    }
  }, [getNodeColor, getNodeSize, selectedNode, hoveredNode, pathAnalysis]);

  // Custom link rendering
  const paintLink = useCallback((link: LinkObject, ctx: CanvasRenderingContext2D) => {
    const source = link.source as GraphNode;
    const target = link.target as GraphNode;
    
    if (!source.x || !source.y || !target.x || !target.y) return;

    const isHighlighted = 
      selectedNode === source.id || 
      selectedNode === target.id ||
      hoveredNode === source.id ||
      hoveredNode === target.id;
    
    const isInPath = pathAnalysis.isLinkInPath(source.id, target.id);

    ctx.beginPath();
    ctx.moveTo(source.x, source.y);
    ctx.lineTo(target.x, target.y);
    
    if (isInPath) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
    } else if (isHighlighted) {
      ctx.strokeStyle = '#0d9488';
      ctx.lineWidth = 1.5;
    } else {
      ctx.strokeStyle = '#ffffff22';
      ctx.lineWidth = 0.5;
    }
    ctx.stroke();
  }, [selectedNode, hoveredNode, pathAnalysis]);

  const stats = {
    nodes: filteredData.nodes.length,
    edges: filteredData.links.length,
    flagged: filteredData.nodes.filter(n => n.flagged).length,
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-mono">Loading graph data...</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative bg-background">
      {/* Top toolbar - ViewToggle only, CommandBar moved to unified palette in header */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <ViewToggle view={viewMode} onChange={setViewMode} />
      </div>

      {/* Enhanced Graph controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="flex flex-col gap-1 bg-surface-elevated border border-border rounded p-1.5">
          <button 
            onClick={handleZoomIn}
            className="p-2 hover:bg-secondary rounded transition-colors"
            title="Zoom in (scroll up)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          {/* Zoom slider */}
          <div className="px-2 py-3">
            <Slider
              orientation="vertical"
              value={[zoomLevel]}
              onValueChange={handleZoomSlider}
              min={0.1}
              max={5}
              step={0.1}
              className="h-24"
            />
          </div>
          
          <button 
            onClick={handleZoomOut}
            className="p-2 hover:bg-secondary rounded transition-colors"
            title="Zoom out (scroll down)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <div className="w-full h-px bg-border my-1" />
          
          <button 
            onClick={handleReset}
            className="p-2 hover:bg-secondary rounded transition-colors"
            title="Fit all nodes"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          
          <button 
            onClick={handleCenterSelected}
            disabled={!selectedNode}
            className={`p-2 rounded transition-colors ${
              selectedNode ? 'hover:bg-secondary' : 'opacity-30 cursor-not-allowed'
            }`}
            title="Center on selected"
          >
            <Target className="w-4 h-4" />
          </button>
          
          <button 
            onClick={handleRefreshLayout}
            className="p-2 hover:bg-secondary rounded transition-colors"
            title="Refresh layout"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <div className="w-full h-px bg-border my-1" />
          
          <button 
            onClick={() => setPathAnalysisMode(!pathAnalysisMode)}
            className={`p-2 rounded transition-colors ${
              pathAnalysisMode ? 'bg-accent text-accent-foreground' : 'hover:bg-secondary'
            }`}
            title="Path Analysis Mode (Shift+click)"
          >
            <Route className="w-4 h-4" />
          </button>
        </div>
        
        {/* Zoom percentage */}
        <div className="bg-surface-elevated border border-border rounded px-2 py-1 text-center">
          <span className="text-[10px] font-mono text-muted-foreground">
            {Math.round(zoomLevel * 100)}%
          </span>
        </div>
      </div>

      {/* Path Analysis Panel */}
      {(pathAnalysis.sourceNode || pathAnalysis.targetNode || pathAnalysis.pathResult) && (
        <PathAnalysisPanel
          sourceNode={pathAnalysis.sourceNode}
          targetNode={pathAnalysis.targetNode}
          pathResult={pathAnalysis.pathResult}
          isAnalyzing={pathAnalysis.isAnalyzing}
          nodes={filteredData.nodes}
          onAnalyze={pathAnalysis.analyzePath}
          onClear={clearPathAnalysis}
          onNodeClick={(nodeId) => {
            onNodeSelect(nodeId);
            const node = filteredData.nodes.find(n => n.id === nodeId);
            if (graphRef.current && node?.x !== undefined && node?.y !== undefined) {
              graphRef.current.centerAt(node.x, node.y, 500);
              graphRef.current.zoom(2.5, 500);
            }
          }}
        />
      )}

      {/* Filter panel */}
      <FilterPanel
        filters={filters}
        onChange={setFilters}
        networks={Object.keys(NETWORK_PATTERNS)}
      />

      {/* Stats overlay */}
      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 flex gap-2 sm:gap-4">
        <div className="bg-surface-elevated border border-border rounded px-2 sm:px-3 py-1.5 sm:py-2">
          <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">Nodes</p>
          <p className="text-sm sm:text-lg font-mono font-semibold">{stats.nodes}</p>
        </div>
        <div className="bg-surface-elevated border border-border rounded px-2 sm:px-3 py-1.5 sm:py-2">
          <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">Edges</p>
          <p className="text-sm sm:text-lg font-mono font-semibold">{stats.edges}</p>
        </div>
        <div className="bg-surface-elevated border border-destructive/50 rounded px-2 sm:px-3 py-1.5 sm:py-2">
          <p className="text-[9px] sm:text-[10px] text-destructive uppercase tracking-wider">Flagged</p>
          <p className="text-sm sm:text-lg font-mono font-semibold text-destructive">{stats.flagged}</p>
        </div>
      </div>

      {/* Legend — hidden on small mobile */}
      <div className="absolute bottom-4 right-32 z-10 bg-surface-elevated border border-border rounded p-3 hidden sm:block">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Entity Types</p>
        <div className="flex flex-col gap-1.5">
          {Object.entries(NODE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span className="text-[10px] font-mono text-muted-foreground capitalize">
                {type === 'agent' ? 'agency' : type}
              </span>
            </div>
          ))}
        </div>
        <div className="w-full h-px bg-border my-2" />
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Status</p>
        <div className="flex items-center gap-2">
          <span 
            className="w-3 h-3 rounded-full border-2 border-dashed" 
            style={{ borderColor: FLAGGED_RING_COLOR }}
          />
          <span className="text-[10px] font-mono text-destructive">
            flagged
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span 
            className="w-3 h-3 rounded-full border-2" 
            style={{ borderColor: SELECTED_COLOR }}
          />
          <span className="text-[10px] font-mono text-cyan-400">
            selected
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span 
            className="w-3 h-3 rounded-full border-2" 
            style={{ borderColor: GEO_RISK_COLOR }}
          />
          <span className="text-[10px] font-mono" style={{ color: GEO_RISK_COLOR }}>
            geo-risk
          </span>
        </div>
      </div>

      {/* Minimap */}
      {viewMode === '2d' && (
        <GraphMinimap
          nodes={filteredData.nodes}
          viewportBounds={viewportBounds}
          onNavigate={handleMinimapNavigate}
        />
      )}

      {/* Context Menu */}
      {contextMenu.visible && contextMenu.node && (
        <GraphContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          nodeId={contextMenu.node.id}
          nodeLabel={contextMenu.node.label}
          nodeType={contextMenu.node.nodeType}
          flagged={contextMenu.node.flagged}
          caseId={contextMenu.node.caseId || null}
          onClose={closeContextMenu}
        />
      )}

      {/* Graph Visualization */}
      {viewMode === '2d' ? (
        <ForceGraph2D
          ref={graphRef}
          graphData={filteredData}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="transparent"
          nodeCanvasObject={paintNode}
          linkCanvasObject={paintLink}
          onNodeClick={handleNodeClick}
          onNodeRightClick={handleNodeRightClick}
          onNodeHover={(node) => setHoveredNode(node ? (node as GraphNode).id : null)}
          onBackgroundClick={handleBackgroundClick}
          onBackgroundRightClick={handleBackgroundRightClick}
          nodePointerAreaPaint={(node, color, ctx) => {
            const size = getNodeSize(node as GraphNode) + 4;
            ctx.beginPath();
            ctx.arc(node.x || 0, node.y || 0, size, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
          }}
          cooldownTicks={200}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          enableNodeDrag={true}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          minZoom={0.1}
          maxZoom={10}
          onEngineStop={() => {
            setIsEngineRunning(false);
            graphRef.current?.zoomToFit(400, 80);
          }}
        />
      ) : (
        <NauticaGraph3D
          graphData={filteredData}
          onNodeSelect={onNodeSelect}
          selectedNode={selectedNode}
          dimensions={dimensions}
        />
      )}
    </div>
  );
}
