import { useCallback, useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Filter } from 'lucide-react';

interface Node {
  id: string;
  label: string;
  type: 'applicant' | 'document' | 'agent' | 'address';
  x: number;
  y: number;
  flagged?: boolean;
}

interface Edge {
  source: string;
  target: string;
  type: 'submitted' | 'uses' | 'linked' | 'located';
}

// Demo data: Visa mill fraud network
const nodes: Node[] = [
  // Central fraudulent agent
  { id: 'agent-1', label: 'Apex Travel Agency', type: 'agent', x: 400, y: 300, flagged: true },
  
  // Fraudulent document source
  { id: 'doc-1', label: 'Template Bank Statement', type: 'document', x: 400, y: 150, flagged: true },
  
  // Shared address
  { id: 'addr-1', label: '47 Commerce St, Istanbul', type: 'address', x: 550, y: 350 },
  
  // Applicants connected to the fraud ring
  { id: 'app-1', label: 'Applicant #1847', type: 'applicant', x: 200, y: 200, flagged: true },
  { id: 'app-2', label: 'Applicant #1923', type: 'applicant', x: 150, y: 350, flagged: true },
  { id: 'app-3', label: 'Applicant #2104', type: 'applicant', x: 200, y: 480, flagged: true },
  { id: 'app-4', label: 'Applicant #2156', type: 'applicant', x: 350, y: 500, flagged: true },
  { id: 'app-5', label: 'Applicant #2201', type: 'applicant', x: 500, y: 480, flagged: true },
  { id: 'app-6', label: 'Applicant #2289', type: 'applicant', x: 600, y: 400, flagged: true },
  { id: 'app-7', label: 'Applicant #2334', type: 'applicant', x: 650, y: 280, flagged: true },
  { id: 'app-8', label: 'Applicant #2401', type: 'applicant', x: 600, y: 180, flagged: true },
  
  // Legitimate applicants (not flagged)
  { id: 'app-9', label: 'Applicant #2450', type: 'applicant', x: 100, y: 100 },
  { id: 'app-10', label: 'Applicant #2512', type: 'applicant', x: 700, y: 100 },
];

const edges: Edge[] = [
  // Agent connections
  { source: 'app-1', target: 'agent-1', type: 'uses' },
  { source: 'app-2', target: 'agent-1', type: 'uses' },
  { source: 'app-3', target: 'agent-1', type: 'uses' },
  { source: 'app-4', target: 'agent-1', type: 'uses' },
  { source: 'app-5', target: 'agent-1', type: 'uses' },
  { source: 'app-6', target: 'agent-1', type: 'uses' },
  { source: 'app-7', target: 'agent-1', type: 'uses' },
  { source: 'app-8', target: 'agent-1', type: 'uses' },
  
  // Document connections (same template)
  { source: 'app-1', target: 'doc-1', type: 'submitted' },
  { source: 'app-2', target: 'doc-1', type: 'submitted' },
  { source: 'app-3', target: 'doc-1', type: 'submitted' },
  { source: 'app-4', target: 'doc-1', type: 'submitted' },
  { source: 'app-5', target: 'doc-1', type: 'submitted' },
  { source: 'app-6', target: 'doc-1', type: 'submitted' },
  { source: 'app-7', target: 'doc-1', type: 'submitted' },
  { source: 'app-8', target: 'doc-1', type: 'submitted' },
  
  // Address connections
  { source: 'agent-1', target: 'addr-1', type: 'located' },
  { source: 'app-6', target: 'addr-1', type: 'linked' },
  { source: 'app-7', target: 'addr-1', type: 'linked' },
];

interface NauticaGraphProps {
  onNodeSelect: (nodeId: string | null) => void;
  selectedNode: string | null;
}

export function NauticaGraph({ onNodeSelect, selectedNode }: NauticaGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const getNodeColor = (node: Node) => {
    if (node.flagged) return 'hsl(0, 84%, 60%)'; // Destructive
    switch (node.type) {
      case 'agent': return 'hsl(174, 62%, 32%)';
      case 'document': return 'hsl(200, 60%, 50%)';
      case 'address': return 'hsl(45, 80%, 50%)';
      default: return 'hsl(0, 0%, 50%)';
    }
  };

  const getNodeSize = (node: Node) => {
    switch (node.type) {
      case 'agent': return 24;
      case 'document': return 20;
      case 'address': return 16;
      default: return 12;
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === svgRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleNodeClick = (nodeId: string) => {
    onNodeSelect(selectedNode === nodeId ? null : nodeId);
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="w-full h-full relative bg-background">
      {/* Graph controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 bg-surface-elevated border border-border rounded p-1">
        <button 
          onClick={handleZoomIn}
          className="p-2 hover:bg-secondary rounded transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button 
          onClick={handleZoomOut}
          className="p-2 hover:bg-secondary rounded transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-full h-px bg-border" />
        <button 
          onClick={handleReset}
          className="p-2 hover:bg-secondary rounded transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Filter badge */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-surface-elevated border border-border rounded px-3 py-2">
        <Filter className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs font-mono text-muted-foreground">
          Showing: Visa Mill Network
        </span>
      </div>

      {/* Stats overlay */}
      <div className="absolute bottom-4 left-4 z-10 flex gap-4">
        <div className="bg-surface-elevated border border-border rounded px-3 py-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Nodes</p>
          <p className="text-lg font-mono font-semibold">{nodes.length}</p>
        </div>
        <div className="bg-surface-elevated border border-border rounded px-3 py-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Edges</p>
          <p className="text-lg font-mono font-semibold">{edges.length}</p>
        </div>
        <div className="bg-surface-elevated border border-destructive/50 rounded px-3 py-2">
          <p className="text-[10px] text-destructive uppercase tracking-wider">Flagged</p>
          <p className="text-lg font-mono font-semibold text-destructive">
            {nodes.filter(n => n.flagged).length}
          </p>
        </div>
      </div>

      {/* SVG Graph */}
      <svg 
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          {/* Glow filter for flagged nodes */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Arrow marker */}
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon 
              points="0 0, 10 3.5, 0 7" 
              fill="hsl(var(--muted-foreground))"
              opacity="0.5"
            />
          </marker>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Edges */}
          {edges.map((edge, i) => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            const isHighlighted = 
              selectedNode === edge.source || 
              selectedNode === edge.target ||
              hoveredNode === edge.source ||
              hoveredNode === edge.target;

            return (
              <line
                key={`edge-${i}`}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={isHighlighted ? 'hsl(174, 62%, 45%)' : 'hsl(var(--muted-foreground))'}
                strokeWidth={isHighlighted ? 2 : 1}
                strokeOpacity={isHighlighted ? 0.8 : 0.3}
                className="transition-all duration-200"
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const size = getNodeSize(node);
            const color = getNodeColor(node);
            const isSelected = selectedNode === node.id;
            const isHovered = hoveredNode === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => handleNodeClick(node.id)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
              >
                {/* Pulse animation for flagged nodes */}
                {node.flagged && (
                  <circle
                    r={size + 8}
                    fill="none"
                    stroke={color}
                    strokeWidth="1"
                    opacity="0.3"
                    className="animate-pulse-soft"
                  />
                )}
                
                {/* Selection ring */}
                {isSelected && (
                  <circle
                    r={size + 6}
                    fill="none"
                    stroke="hsl(174, 62%, 45%)"
                    strokeWidth="2"
                  />
                )}

                {/* Main node */}
                <circle
                  r={size}
                  fill={color}
                  filter={node.flagged ? 'url(#glow)' : undefined}
                  className="transition-all duration-200"
                  style={{
                    transform: isHovered || isSelected ? 'scale(1.2)' : 'scale(1)',
                    transformOrigin: 'center',
                  }}
                />

                {/* Label */}
                <text
                  y={size + 14}
                  textAnchor="middle"
                  fill="hsl(var(--muted-foreground))"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                  className={`transition-opacity ${isHovered || isSelected ? 'opacity-100' : 'opacity-60'}`}
                >
                  {node.label}
                </text>

                {/* Type indicator */}
                {node.type !== 'applicant' && (
                  <text
                    y={-size - 6}
                    textAnchor="middle"
                    fill={color}
                    fontSize="8"
                    fontFamily="var(--font-mono)"
                    className="uppercase tracking-wider"
                  >
                    {node.type}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
