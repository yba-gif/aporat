import { useMemo } from 'react';

interface GraphNode {
  id: string;
  x?: number;
  y?: number;
  nodeType: string;
  flagged: boolean;
}

interface MinimapProps {
  nodes: GraphNode[];
  viewportBounds: { x: number; y: number; width: number; height: number } | null;
  onNavigate: (x: number, y: number) => void;
}

const NODE_COLORS: Record<string, string> = {
  applicant: '#6b7280',
  agent: '#0d9488',
  document: '#3b82f6',
  address: '#eab308',
};

export function GraphMinimap({ nodes, viewportBounds, onNavigate }: MinimapProps) {
  const { bounds, scale, nodesWithCoords } = useMemo(() => {
    const validNodes = nodes.filter((n) => n.x !== undefined && n.y !== undefined);
    if (validNodes.length === 0) {
      return { bounds: null, scale: 1, nodesWithCoords: [] };
    }

    const xs = validNodes.map((n) => n.x!);
    const ys = validNodes.map((n) => n.y!);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    const width = maxX - minX || 100;
    const height = maxY - minY || 100;
    const padding = 20;
    
    const mapWidth = 120;
    const mapHeight = 80;
    const scaleX = (mapWidth - padding * 2) / width;
    const scaleY = (mapHeight - padding * 2) / height;
    const scale = Math.min(scaleX, scaleY);

    return {
      bounds: { minX, maxX, minY, maxY, width, height },
      scale,
      nodesWithCoords: validNodes,
    };
  }, [nodes]);

  if (!bounds || nodesWithCoords.length === 0) return null;

  const mapWidth = 120;
  const mapHeight = 80;
  const padding = 10;

  const transformX = (x: number) => ((x - bounds.minX) / bounds.width) * (mapWidth - padding * 2) + padding;
  const transformY = (y: number) => ((y - bounds.minY) / bounds.height) * (mapHeight - padding * 2) + padding;

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const graphX = ((clickX - padding) / (mapWidth - padding * 2)) * bounds.width + bounds.minX;
    const graphY = ((clickY - padding) / (mapHeight - padding * 2)) * bounds.height + bounds.minY;
    
    onNavigate(graphX, graphY);
  };

  return (
    <div className="absolute bottom-20 right-4 z-10 bg-surface-elevated border border-border rounded overflow-hidden">
      <p className="text-[9px] uppercase tracking-wider text-muted-foreground px-2 py-1 border-b border-border">
        Navigator
      </p>
      <svg
        width={mapWidth}
        height={mapHeight}
        className="cursor-crosshair"
        onClick={handleClick}
      >
        <rect width={mapWidth} height={mapHeight} fill="hsl(var(--background))" />
        
        {/* Nodes */}
        {nodesWithCoords.map((node) => (
          <circle
            key={node.id}
            cx={transformX(node.x!)}
            cy={transformY(node.y!)}
            r={node.flagged ? 2.5 : 1.5}
            fill={node.flagged ? '#ef4444' : (NODE_COLORS[node.nodeType] || '#6b7280')}
            opacity={0.8}
          />
        ))}

        {/* Viewport indicator */}
        {viewportBounds && (
          <rect
            x={transformX(viewportBounds.x)}
            y={transformY(viewportBounds.y)}
            width={Math.max(10, (viewportBounds.width / bounds.width) * (mapWidth - padding * 2))}
            height={Math.max(8, (viewportBounds.height / bounds.height) * (mapHeight - padding * 2))}
            fill="none"
            stroke="hsl(var(--accent))"
            strokeWidth={1}
            rx={1}
          />
        )}
      </svg>
    </div>
  );
}
