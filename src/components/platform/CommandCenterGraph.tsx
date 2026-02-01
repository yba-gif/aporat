import { useEffect, useRef, useMemo, useCallback, useState } from 'react';

export interface GraphNode {
  id: string;
  label: string;
  nodeType: 'applicant' | 'agent' | 'company' | 'address';
  flagged: boolean;
  riskScore: number;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string;
  target: string;
  edgeType: string;
}

interface CommandCenterGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
  onNodeClick?: (node: GraphNode | null) => void;
  selectedNodeId?: string | null;
}

const NODE_COLORS: Record<string, string> = {
  applicant: '#8b5cf6',
  agent: '#0d9488',
  company: '#3b82f6',
  address: '#f59e0b',
};

const FLAGGED_COLOR = '#ef4444';
const SELECTED_COLOR = '#22d3ee';
const HOVER_COLOR = '#ffffff';

export function CommandCenterGraph({ nodes, links, onNodeClick, selectedNodeId }: CommandCenterGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Pre-calculate node positions in a force-directed-like layout
  const positionedNodes = useMemo(() => {
    if (nodes.length === 0) return [];
    
    // Simple radial layout with some randomization
    const centerX = 400;
    const centerY = 200;
    
    // Group nodes by type for clustering
    const byType: Record<string, GraphNode[]> = {
      agent: [],
      company: [],
      applicant: [],
      address: [],
    };
    
    nodes.forEach(node => {
      if (byType[node.nodeType]) {
        byType[node.nodeType].push(node);
      }
    });
    
    const positioned: (GraphNode & { x: number; y: number })[] = [];
    
    // Place agents/companies in inner ring
    const innerRing = [...byType.agent, ...byType.company];
    innerRing.forEach((node, i) => {
      const angle = (i / innerRing.length) * Math.PI * 2;
      const radius = 80 + Math.random() * 40;
      positioned.push({
        ...node,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      });
    });
    
    // Place applicants in outer ring
    byType.applicant.forEach((node, i) => {
      const angle = (i / byType.applicant.length) * Math.PI * 2 + 0.1;
      const radius = 150 + Math.random() * 50;
      positioned.push({
        ...node,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      });
    });
    
    // Place addresses scattered
    byType.address.forEach((node, i) => {
      const angle = (i / byType.address.length) * Math.PI * 2 + 0.2;
      const radius = 100 + Math.random() * 80;
      positioned.push({
        ...node,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      });
    });
    
    return positioned;
  }, [nodes]);

  // Create node lookup for links
  const nodeMap = useMemo(() => {
    const map = new Map<string, typeof positionedNodes[0]>();
    positionedNodes.forEach(node => map.set(node.id, node));
    return map;
  }, [positionedNodes]);

  // Get node size based on type
  const getNodeSize = useCallback((nodeType: string) => {
    return nodeType === 'agent' ? 8 : nodeType === 'company' ? 6 : 4;
  }, []);

  // Find node at position
  const findNodeAtPosition = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / 800;
    const scaleY = rect.height / 400;
    const canvasX = x / scaleX;
    const canvasY = y / scaleY;

    for (const node of positionedNodes) {
      const size = getNodeSize(node.nodeType);
      const dx = canvasX - node.x;
      const dy = canvasY - node.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= size + 4) { // Add some padding for easier clicking
        return node;
      }
    }
    return null;
  }, [positionedNodes, getNodeSize]);

  // Handle mouse move for hover
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const node = findNodeAtPosition(x, y);
    setHoveredNodeId(node?.id || null);
    canvas.style.cursor = node ? 'pointer' : 'default';
  }, [findNodeAtPosition]);

  // Handle click
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const node = findNodeAtPosition(x, y);
    onNodeClick?.(node);
  }, [findNodeAtPosition, onNodeClick]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const scaleX = rect.width / 800;
    const scaleY = rect.height / 400;

    const draw = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);

      ctx.save();
      ctx.scale(scaleX, scaleY);

      // Draw links
      links.forEach(link => {
        const source = nodeMap.get(link.source);
        const target = nodeMap.get(link.target);
        if (source && target) {
          const isHighlighted = 
            selectedNodeId === source.id || 
            selectedNodeId === target.id ||
            hoveredNodeId === source.id ||
            hoveredNodeId === target.id;

          ctx.beginPath();
          ctx.moveTo(source.x, source.y);
          ctx.lineTo(target.x, target.y);
          ctx.strokeStyle = isHighlighted ? 'rgba(13, 148, 136, 0.6)' : 'rgba(13, 148, 136, 0.15)';
          ctx.lineWidth = isHighlighted ? 1.5 : 0.5;
          ctx.stroke();
        }
      });

      // Draw nodes
      positionedNodes.forEach(node => {
        const color = NODE_COLORS[node.nodeType] || '#6b7280';
        const size = getNodeSize(node.nodeType);
        const isSelected = selectedNodeId === node.id;
        const isHovered = hoveredNodeId === node.id;

        // Selected ring
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, size + 6, 0, Math.PI * 2);
          ctx.strokeStyle = SELECTED_COLOR;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Hover ring
        if (isHovered && !isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, size + 4, 0, Math.PI * 2);
          ctx.strokeStyle = `${HOVER_COLOR}66`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Flagged ring
        if (node.flagged) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, size + 4, 0, Math.PI * 2);
          ctx.strokeStyle = FLAGGED_COLOR;
          ctx.lineWidth = 2;
          ctx.setLineDash([3, 2]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Main node
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Subtle glow for agents
        if (node.nodeType === 'agent') {
          ctx.beginPath();
          ctx.arc(node.x, node.y, size + 2, 0, Math.PI * 2);
          ctx.strokeStyle = `${color}44`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Label on hover/select
        if (isSelected || isHovered) {
          ctx.font = '10px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          
          const label = node.label;
          const metrics = ctx.measureText(label);
          const padding = 3;
          
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.fillRect(
            node.x - metrics.width / 2 - padding,
            node.y + size + 4,
            metrics.width + padding * 2,
            14
          );
          
          ctx.fillStyle = '#e5e7eb';
          ctx.fillText(label, node.x, node.y + size + 6);
        }
      });

      ctx.restore();
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [positionedNodes, links, nodeMap, selectedNodeId, hoveredNodeId, getNodeSize]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ width: '100%', height: '100%' }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onMouseLeave={() => setHoveredNodeId(null)}
    />
  );
}
