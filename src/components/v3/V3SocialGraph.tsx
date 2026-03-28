import { useCallback, useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import type { V3Case } from '@/data/v3/mockData';

interface GraphNode {
  id: string;
  label: string;
  type: 'applicant' | 'social_account' | 'associate' | 'organization' | 'phone' | 'address';
  risk: 'low' | 'medium' | 'high' | 'critical' | 'none';
  val: number;
}

interface GraphLink {
  source: string;
  target: string;
  label: string;
}

const NODE_COLORS: Record<string, string> = {
  none: '#94A3B8',
  low: '#10B981',
  medium: '#F59E0B',
  high: '#F97316',
  critical: '#EF4444',
};

const TYPE_SHAPES: Record<string, string> = {
  applicant: '●',
  social_account: '◆',
  associate: '●',
  organization: '■',
  phone: '▲',
  address: '◆',
};

export function generateSocialGraph(caseData: V3Case) {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const applicantId = 'applicant-center';

  nodes.push({
    id: applicantId,
    label: `${caseData.applicant.firstName} ${caseData.applicant.lastName}`,
    type: 'applicant',
    risk: caseData.riskLevel,
    val: 12,
  });

  // Generate social account nodes from findings
  const socialFindings = caseData.osintFindings.filter(f => f.category === 'social_media');
  const platforms = new Set<string>();
  socialFindings.forEach((f, i) => {
    if (platforms.has(f.source)) return;
    platforms.add(f.source);
    const nodeId = `social-${f.source}`;
    nodes.push({ id: nodeId, label: `@${f.source}_user`, type: 'social_account', risk: f.riskImpact as any, val: 6 });
    links.push({ source: applicantId, target: nodeId, label: f.source });
  });

  // Generate associate nodes
  const associateNames = ['Mehmet K.', 'Ali R.', 'Fatma Ö.', 'Hassan M.', 'Sergei V.', 'Natalia B.'];
  const networkFindings = caseData.osintFindings.filter(f => f.category === 'network');
  const assocCount = Math.min(associateNames.length, Math.max(2, networkFindings.length + 1));
  for (let i = 0; i < assocCount; i++) {
    const assocId = `assoc-${i}`;
    const risk = i === 0 ? 'high' : i < 2 ? 'medium' : 'low';
    nodes.push({ id: assocId, label: associateNames[i], type: 'associate', risk, val: 5 });
    links.push({ source: applicantId, target: assocId, label: 'connected' });
    // Cross-link some associates to social accounts
    if (i < 2 && nodes.length > 3) {
      const targetNode = nodes[Math.min(2, nodes.length - 1)];
      links.push({ source: assocId, target: targetNode.id, label: 'mutual' });
    }
  }

  // Organization node
  if (caseData.osintFindings.some(f => f.category === 'financial' || f.source === 'linkedin')) {
    const orgId = 'org-1';
    nodes.push({ id: orgId, label: 'Caspian Trading LLC', type: 'organization', risk: 'high', val: 7 });
    links.push({ source: applicantId, target: orgId, label: 'employed' });
    if (assocCount > 1) links.push({ source: 'assoc-0', target: orgId, label: 'director' });
  }

  // Phone node
  nodes.push({ id: 'phone-1', label: '+90 5XX XXX XX', type: 'phone', risk: 'none', val: 4 });
  links.push({ source: applicantId, target: 'phone-1', label: 'phone' });

  return { nodes, links };
}

interface V3SocialGraphProps {
  caseData: V3Case;
}

export function V3SocialGraph({ caseData }: V3SocialGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const graphData = generateSocialGraph(caseData);

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({ width: rect.width, height: Math.max(380, rect.height) });
    }
  }, []);

  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const gNode = node as GraphNode & { x: number; y: number };
    const size = gNode.type === 'applicant' ? 10 : 6;
    const color = NODE_COLORS[gNode.risk] || NODE_COLORS.none;

    ctx.beginPath();
    if (gNode.type === 'organization') {
      ctx.rect(gNode.x - size, gNode.y - size, size * 2, size * 2);
    } else if (gNode.type === 'phone' || gNode.type === 'address') {
      ctx.moveTo(gNode.x, gNode.y - size);
      ctx.lineTo(gNode.x + size, gNode.y + size);
      ctx.lineTo(gNode.x - size, gNode.y + size);
      ctx.closePath();
    } else {
      ctx.arc(gNode.x, gNode.y, size, 0, 2 * Math.PI);
    }

    ctx.fillStyle = color;
    ctx.fill();

    if (gNode.type === 'applicant') {
      ctx.strokeStyle = '#06B6D4';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Label
    const fontSize = gNode.type === 'applicant' ? 11 / globalScale : 9 / globalScale;
    ctx.font = `${fontSize}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#E2E8F0';
    ctx.fillText(gNode.label, gNode.x, gNode.y + size + 3);
  }, []);

  const linkCanvasObject = useCallback((link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const s = link.source as any;
    const t = link.target as any;
    if (!s.x || !t.x) return;

    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(t.x, t.y);
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Edge label
    if (globalScale > 1.2) {
      const mx = (s.x + t.x) / 2;
      const my = (s.y + t.y) / 2;
      const fontSize = 7 / globalScale;
      ctx.font = `${fontSize}px Inter, sans-serif`;
      ctx.fillStyle = '#64748B';
      ctx.textAlign = 'center';
      ctx.fillText(link.label, mx, my - 4);
    }
  }, []);

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: 400 }}>
      <ForceGraph2D
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        backgroundColor="#0B1120"
        nodeCanvasObject={nodeCanvasObject}
        linkCanvasObject={linkCanvasObject}
        nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
          const size = (node as GraphNode).type === 'applicant' ? 12 : 8;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }}
        onNodeClick={(node: any) => setSelectedNode(node as GraphNode)}
        cooldownTicks={80}
        d3AlphaDecay={0.03}
        d3VelocityDecay={0.3}
      />

      {/* Legend */}
      <div className="absolute bottom-3 left-3 border rounded-md p-2 flex gap-3" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
        {[
          { label: 'Applicant', color: '#06B6D4', shape: '●' },
          { label: 'Social', color: '#94A3B8', shape: '◆' },
          { label: 'Associate', color: '#F59E0B', shape: '●' },
          { label: 'Organization', color: '#F97316', shape: '■' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1 text-[9px]" style={{ color: 'var(--v3-text-muted)' }}>
            <span style={{ color: l.color }}>{l.shape}</span> {l.label}
          </div>
        ))}
      </div>

      {/* Selected node detail */}
      {selectedNode && (
        <div className="absolute top-3 right-3 border rounded-md p-3 w-48" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
          <div className="text-xs font-semibold mb-1" style={{ color: 'var(--v3-text)' }}>{selectedNode.label}</div>
          <div className="text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>Type: {selectedNode.type}</div>
          <div className="text-[10px]" style={{ color: NODE_COLORS[selectedNode.risk] }}>Risk: {selectedNode.risk}</div>
          <button onClick={() => setSelectedNode(null)} className="text-[9px] mt-2" style={{ color: 'var(--v3-accent)' }}>Close</button>
        </div>
      )}
    </div>
  );
}
