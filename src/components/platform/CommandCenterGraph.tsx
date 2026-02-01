import { useEffect, useRef, useMemo } from 'react';

interface GraphNode {
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
}

const NODE_COLORS: Record<string, string> = {
  applicant: '#8b5cf6',
  agent: '#0d9488',
  company: '#3b82f6',
  address: '#f59e0b',
};

const FLAGGED_COLOR = '#ef4444';

export function CommandCenterGraph({ nodes, links }: CommandCenterGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

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

    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Draw links
      ctx.strokeStyle = 'rgba(13, 148, 136, 0.15)';
      ctx.lineWidth = 0.5;
      
      links.forEach(link => {
        const source = nodeMap.get(link.source);
        const target = nodeMap.get(link.target);
        if (source && target) {
          ctx.beginPath();
          ctx.moveTo(source.x, source.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
        }
      });

      // Draw nodes
      positionedNodes.forEach(node => {
        const color = NODE_COLORS[node.nodeType] || '#6b7280';
        const size = node.nodeType === 'agent' ? 8 : node.nodeType === 'company' ? 6 : 4;

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
      });

      time += 0.01;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [positionedNodes, links, nodeMap]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
