import { useCallback, useEffect, useRef, useState } from 'react';
import ForceGraph2D, { ForceGraphMethods, NodeObject, LinkObject } from 'react-force-graph-2d';
import { ZoomIn, ZoomOut, Maximize2, Filter, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface GraphNode extends NodeObject {
  id: string;
  label: string;
  nodeType: 'applicant' | 'agent' | 'document' | 'address';
  flagged: boolean;
  riskScore: number;
  metadata: Record<string, unknown>;
}

interface GraphLink extends LinkObject {
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

export function NauticaGraph({ onNodeSelect, selectedNode }: NauticaGraphProps) {
  const graphRef = useRef<ForceGraphMethods<GraphNode, GraphLink>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Fetch data from database
  useEffect(() => {
    async function fetchGraphData() {
      setLoading(true);
      
      const [nodesRes, edgesRes] = await Promise.all([
        supabase.from('demo_fraud_nodes').select('*'),
        supabase.from('demo_fraud_edges').select('*'),
      ]);

      if (nodesRes.data && edgesRes.data) {
        const nodes: GraphNode[] = nodesRes.data.map((n) => ({
          id: n.node_id,
          label: n.label,
          nodeType: n.node_type as GraphNode['nodeType'],
          flagged: n.flagged || false,
          riskScore: n.risk_score || 0,
          metadata: (n.metadata as Record<string, unknown>) || {},
        }));

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

  const getNodeColor = useCallback((node: GraphNode) => {
    if (node.flagged) return FLAGGED_COLOR;
    return NODE_COLORS[node.nodeType] || '#6b7280';
  }, []);

  const getNodeSize = useCallback((node: GraphNode) => {
    switch (node.nodeType) {
      case 'agent': return 16;
      case 'document': return 14;
      case 'address': return 10;
      default: return 8;
    }
  }, []);

  const handleNodeClick = useCallback((node: GraphNode) => {
    onNodeSelect(selectedNode === node.id ? null : node.id);
    
    // Center view on clicked node
    if (graphRef.current && node.x !== undefined && node.y !== undefined) {
      graphRef.current.centerAt(node.x, node.y, 500);
      graphRef.current.zoom(2, 500);
    }
  }, [onNodeSelect, selectedNode]);

  const handleZoomIn = () => graphRef.current?.zoom(graphRef.current.zoom() * 1.3, 300);
  const handleZoomOut = () => graphRef.current?.zoom(graphRef.current.zoom() / 1.3, 300);
  const handleReset = () => {
    graphRef.current?.zoomToFit(400, 50);
  };

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
      ctx.arc(x, y, size + 4, 0, 2 * Math.PI);
      ctx.fillStyle = `${FLAGGED_COLOR}33`;
      ctx.fill();
    }

    // Selection ring
    if (isSelected) {
      ctx.beginPath();
      ctx.arc(x, y, size + 3, 0, 2 * Math.PI);
      ctx.strokeStyle = '#0d9488';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Hover ring
    if (isHovered && !isSelected) {
      ctx.beginPath();
      ctx.arc(x, y, size + 2, 0, 2 * Math.PI);
      ctx.strokeStyle = '#ffffff44';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Main node circle
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    // Node label (only when zoomed in enough)
    if (globalScale > 0.8 || isSelected || isHovered) {
      const label = node.label;
      const fontSize = Math.max(10 / globalScale, 3);
      ctx.font = `${fontSize}px JetBrains Mono, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#9ca3af';
      ctx.fillText(label, x, y + size + 3);
    }

    // Type badge for non-applicants
    if (node.nodeType !== 'applicant' && globalScale > 0.6) {
      const badgeSize = Math.max(8 / globalScale, 3);
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
    nodes: graphData.nodes.length,
    edges: graphData.links.length,
    flagged: graphData.nodes.filter(n => n.flagged).length,
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

      {/* Filter badge */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-surface-elevated border border-border rounded px-3 py-2">
        <Filter className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs font-mono text-muted-foreground">
          Visa Mill Network
        </span>
      </div>

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
      <div className="absolute bottom-4 right-4 z-10 bg-surface-elevated border border-border rounded p-3">
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

      {/* Force Graph */}
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
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
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleSpeed={0.004}
        linkDirectionalParticleColor={() => '#0d948866'}
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
      />
    </div>
  );
}
