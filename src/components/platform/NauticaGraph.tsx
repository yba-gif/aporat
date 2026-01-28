import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import ForceGraph2D, { ForceGraphMethods, NodeObject, LinkObject } from 'react-force-graph-2d';
import { ZoomIn, ZoomOut, Maximize2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CommandBar } from './CommandBar';
import { FilterPanel, FilterState } from './FilterPanel';
import { GraphMinimap } from './GraphMinimap';
import { ViewToggle } from './ViewToggle';
import { NauticaGraph3D } from './NauticaGraph3D';

export interface GraphNode extends NodeObject {
  id: string;
  label: string;
  nodeType: 'applicant' | 'agent' | 'document' | 'address';
  flagged: boolean;
  riskScore: number;
  metadata: Record<string, unknown>;
  cluster?: string;
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

const NODE_COLORS: Record<string, string> = {
  applicant: '#6b7280',
  agent: '#0d9488',
  document: '#3b82f6',
  address: '#eab308',
};

const FLAGGED_COLOR = '#ef4444';

const NETWORK_PATTERNS: Record<string, string[]> = {
  'Visa Mill': ['agent-1', 'app-1', 'app-2', 'app-3', 'app-4', 'app-5', 'app-6', 'app-7', 'app-8', 'doc-1', 'addr-1'],
  'Document Forgery': ['forger-1', 'doc-forged-1', 'doc-forged-2', 'doc-forged-3', 'app-forge-1', 'app-forge-2', 'app-forge-3', 'app-forge-4'],
  'Identity Swap': ['swap-hub', 'doc-id-1', 'doc-id-2', 'doc-id-3', 'addr-swap-1', 'addr-swap-2', 'app-swap-1', 'app-swap-2', 'app-swap-3'],
  'Money Laundering': ['launder-agent', 'doc-bank-1', 'doc-bank-2', 'addr-launder-1', 'app-launder-1', 'app-launder-2', 'app-launder-3'],
};

export function NauticaGraph({ onNodeSelect, selectedNode }: NauticaGraphProps) {
  const graphRef = useRef<ForceGraphMethods<GraphNode, GraphLink>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [viewportBounds, setViewportBounds] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    nodeTypes: ['applicant', 'agent', 'document', 'address'],
    riskRange: [0, 100],
    flaggedOnly: false,
    networkFilter: null,
  });

  // Fetch data from database
  useEffect(() => {
    async function fetchGraphData() {
      setLoading(true);
      
      const [nodesRes, edgesRes] = await Promise.all([
        supabase.from('demo_fraud_nodes').select('*'),
        supabase.from('demo_fraud_edges').select('*'),
      ]);

      if (nodesRes.data && edgesRes.data) {
        const nodes: GraphNode[] = nodesRes.data.map((n) => {
          // Detect cluster based on node_id patterns
          let cluster: string | undefined;
          for (const [network, ids] of Object.entries(NETWORK_PATTERNS)) {
            if (ids.some(id => n.node_id.startsWith(id.split('-')[0]))) {
              cluster = network;
              break;
            }
          }
          
          return {
            id: n.node_id,
            label: n.label,
            nodeType: n.node_type as GraphNode['nodeType'],
            flagged: n.flagged || false,
            riskScore: n.risk_score || 0,
            metadata: (n.metadata as Record<string, unknown>) || {},
            cluster,
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

  const getNodeColor = useCallback((node: GraphNode) => {
    if (node.flagged) return FLAGGED_COLOR;
    return NODE_COLORS[node.nodeType] || '#6b7280';
  }, []);

  const getNodeSize = useCallback((node: GraphNode) => {
    switch (node.nodeType) {
      case 'agent': return 8;
      case 'document': return 6;
      case 'address': return 5;
      default: return 4;
    }
  }, []);

  const handleNodeClick = useCallback((node: GraphNode) => {
    onNodeSelect(selectedNode === node.id ? null : node.id);
    
    if (graphRef.current && node.x !== undefined && node.y !== undefined) {
      graphRef.current.centerAt(node.x, node.y, 500);
      graphRef.current.zoom(2, 500);
    }
  }, [onNodeSelect, selectedNode]);

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

  const handleZoomIn = () => graphRef.current?.zoom(graphRef.current.zoom() * 1.3, 300);
  const handleZoomOut = () => graphRef.current?.zoom(graphRef.current.zoom() / 1.3, 300);
  const handleReset = () => graphRef.current?.zoomToFit(400, 50);

  // Custom node rendering
  const paintNode = useCallback((node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const size = getNodeSize(node);
    const color = getNodeColor(node);
    const isSelected = selectedNode === node.id;
    const isHovered = hoveredNode === node.id;
    const x = node.x || 0;
    const y = node.y || 0;

    // Glow effect for flagged nodes
    if (node.flagged) {
      ctx.beginPath();
      ctx.arc(x, y, size + 2, 0, 2 * Math.PI);
      ctx.fillStyle = `${FLAGGED_COLOR}22`;
      ctx.fill();
    }

    // Selection ring
    if (isSelected) {
      ctx.beginPath();
      ctx.arc(x, y, size + 2, 0, 2 * Math.PI);
      ctx.strokeStyle = '#0d9488';
      ctx.lineWidth = 2;
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
  }, [getNodeColor, getNodeSize, selectedNode, hoveredNode]);

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

    ctx.beginPath();
    ctx.moveTo(source.x, source.y);
    ctx.lineTo(target.x, target.y);
    ctx.strokeStyle = isHighlighted ? '#0d9488' : '#ffffff22';
    ctx.lineWidth = isHighlighted ? 1.5 : 0.5;
    ctx.stroke();
  }, [selectedNode, hoveredNode]);

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
      {/* Top toolbar */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <CommandBar nodes={graphData.nodes} onSelect={handleCommandSelect} />
        <ViewToggle view={viewMode} onChange={setViewMode} />
      </div>

      {/* Graph controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 bg-surface-elevated border border-border rounded p-1">
        <button 
          onClick={handleZoomIn}
          className="p-2 hover:bg-secondary rounded transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button 
          onClick={handleZoomOut}
          className="p-2 hover:bg-secondary rounded transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-full h-px bg-border" />
        <button 
          onClick={handleReset}
          className="p-2 hover:bg-secondary rounded transition-colors"
          title="Fit to view"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Filter panel */}
      <FilterPanel
        filters={filters}
        onChange={setFilters}
        networks={Object.keys(NETWORK_PATTERNS)}
      />

      {/* Stats overlay */}
      <div className="absolute bottom-4 left-4 z-10 flex gap-4">
        <div className="bg-surface-elevated border border-border rounded px-3 py-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Nodes</p>
          <p className="text-lg font-mono font-semibold">{stats.nodes}</p>
        </div>
        <div className="bg-surface-elevated border border-border rounded px-3 py-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Edges</p>
          <p className="text-lg font-mono font-semibold">{stats.edges}</p>
        </div>
        <div className="bg-surface-elevated border border-destructive/50 rounded px-3 py-2">
          <p className="text-[10px] text-destructive uppercase tracking-wider">Flagged</p>
          <p className="text-lg font-mono font-semibold text-destructive">{stats.flagged}</p>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-32 z-10 bg-surface-elevated border border-border rounded p-3">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Legend</p>
        <div className="flex flex-col gap-1.5">
          {Object.entries(NODE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span className="text-[10px] font-mono text-muted-foreground capitalize">
                {type}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: FLAGGED_COLOR }}
            />
            <span className="text-[10px] font-mono text-destructive">
              flagged
            </span>
          </div>
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
          onNodeHover={(node) => setHoveredNode(node ? (node as GraphNode).id : null)}
          nodePointerAreaPaint={(node, color, ctx) => {
            const size = getNodeSize(node as GraphNode) + 4;
            ctx.beginPath();
            ctx.arc(node.x || 0, node.y || 0, size, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
          }}
          cooldownTicks={200}
          d3AlphaDecay={0.015}
          d3VelocityDecay={0.4}
          linkDirectionalParticles={1}
          linkDirectionalParticleWidth={1}
          linkDirectionalParticleSpeed={0.003}
          linkDirectionalParticleColor={() => '#0d948844'}
          enableNodeDrag={true}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          onEngineStop={() => graphRef.current?.zoomToFit(400, 80)}
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
