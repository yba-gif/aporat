import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ZoomIn, ZoomOut, Maximize2, Download, Eye, EyeOff,
  AlertTriangle, Building2, User, Globe, MapPin, Network, Filter,
  Users, Link2, ChevronRight, Shield, ExternalLink,
} from 'lucide-react';
import {
  forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide,
  type SimulationNodeDatum, type SimulationLinkDatum,
} from 'd3-force';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

// ── Types ──
type NodeType = 'applicant' | 'person' | 'flagged_person' | 'organization' | 'social' | 'location';
type EdgeType = 'KNOWS' | 'CONNECTED_TO' | 'FOLLOWS' | 'EMPLOYED_BY' | 'LOCATED_AT';
type LayoutMode = 'force' | 'hierarchical' | 'circular';

interface GraphNode extends SimulationNodeDatum {
  id: string;
  label: string;
  type: NodeType;
  riskScore?: number;
  detail?: string;
  connections?: number;
}

interface GraphEdge extends SimulationLinkDatum<GraphNode> {
  id: string;
  edgeType: EdgeType;
  weight: number;
  source: string | GraphNode;
  target: string | GraphNode;
}

// ── Config ──
const NODE_COLORS: Record<NodeType, string> = {
  applicant: 'var(--p2-navy)',
  person: '#6B7280',
  flagged_person: 'var(--p2-red)',
  organization: 'var(--p2-blue)',
  social: '#8B5CF6',
  location: 'var(--p2-green)',
};

const NODE_RADIUS: Record<NodeType, number> = {
  applicant: 28,
  person: 18,
  flagged_person: 20,
  organization: 20,
  social: 16,
  location: 16,
};

const EDGE_STYLES: Record<EdgeType, { color: string; dash: string; label: string }> = {
  KNOWS:        { color: '#9CA3AF', dash: '',       label: 'Knows' },
  CONNECTED_TO: { color: 'var(--p2-blue)', dash: '6 3', label: 'Connected' },
  FOLLOWS:      { color: '#8B5CF6', dash: '3 3', label: 'Follows' },
  EMPLOYED_BY:  { color: 'var(--p2-orange)', dash: '',   label: 'Employed by' },
  LOCATED_AT:   { color: 'var(--p2-green)', dash: '',   label: 'Located at' },
};

// ── Mock data ──
const MOCK_NODES: GraphNode[] = [
  { id: 'n1', label: 'Ahmad Rezaei', type: 'applicant', riskScore: 87, detail: 'Primary applicant — Iranian national' },
  { id: 'n2', label: 'Reza Mohammadi', type: 'flagged_person', riskScore: 82, detail: 'Flagged: EU Sanctions familial match' },
  { id: 'n3', label: 'Fatima Al-Rashid', type: 'flagged_person', riskScore: 74, detail: 'Flagged: connected to 2 denied cases' },
  { id: 'n4', label: 'Mehdi Hosseini', type: 'person', riskScore: 35, detail: 'Previously cleared applicant' },
  { id: 'n5', label: 'Sara Nazari', type: 'person', riskScore: 22, detail: 'Reference contact' },
  { id: 'n6', label: 'Ali Karimi', type: 'person', riskScore: 45, detail: 'Travel companion — VIS-2026-0987' },
  { id: 'n7', label: 'Yusuf Demir', type: 'person', riskScore: 18, detail: 'Turkish national — business contact' },
  { id: 'n8', label: 'Parham Trading Co.', type: 'organization', detail: 'Import/export — Tehran' },
  { id: 'n9', label: 'Silk Road Logistics', type: 'organization', detail: 'Shipping & logistics — Istanbul — under review' },
  { id: 'n10', label: 'Crescent Finance Ltd.', type: 'organization', detail: 'Financial services — Beirut' },
  { id: 'n11', label: '@ahmad_r_88', type: 'social', detail: 'Instagram — 1,240 followers' },
  { id: 'n12', label: '@rezam_official', type: 'social', detail: 'Telegram — active in 3 flagged groups' },
  { id: 'n13', label: 'TG: Iran-Turkey Trade', type: 'social', detail: 'Telegram group — 450 members' },
  { id: 'n14', label: '@fatima.ar', type: 'social', detail: 'Instagram — private account' },
  { id: 'n15', label: 'Tehran, Iran', type: 'location', detail: 'Primary residence of applicant' },
  { id: 'n16', label: 'Istanbul, Turkey', type: 'location', detail: 'Frequent travel destination' },
  { id: 'n17', label: 'Beirut, Lebanon', type: 'location', detail: 'Last travel: Nov 2024' },
  { id: 'n18', label: 'Dubai, UAE', type: 'location', detail: 'Transit point — 3 visits in 2024' },
];

const MOCK_EDGES: GraphEdge[] = [
  { id: 'e1', source: 'n1', target: 'n2', edgeType: 'KNOWS', weight: 0.9 },
  { id: 'e2', source: 'n1', target: 'n4', edgeType: 'KNOWS', weight: 0.6 },
  { id: 'e3', source: 'n1', target: 'n5', edgeType: 'KNOWS', weight: 0.4 },
  { id: 'e4', source: 'n1', target: 'n6', edgeType: 'KNOWS', weight: 0.7 },
  { id: 'e5', source: 'n1', target: 'n8', edgeType: 'EMPLOYED_BY', weight: 0.8 },
  { id: 'e6', source: 'n1', target: 'n11', edgeType: 'CONNECTED_TO', weight: 0.5 },
  { id: 'e7', source: 'n1', target: 'n15', edgeType: 'LOCATED_AT', weight: 1.0 },
  { id: 'e8', source: 'n1', target: 'n16', edgeType: 'LOCATED_AT', weight: 0.6 },
  { id: 'e9', source: 'n2', target: 'n3', edgeType: 'KNOWS', weight: 0.8 },
  { id: 'e10', source: 'n2', target: 'n8', edgeType: 'EMPLOYED_BY', weight: 0.7 },
  { id: 'e11', source: 'n2', target: 'n12', edgeType: 'CONNECTED_TO', weight: 0.6 },
  { id: 'e12', source: 'n2', target: 'n10', edgeType: 'CONNECTED_TO', weight: 0.5 },
  { id: 'e13', source: 'n3', target: 'n9', edgeType: 'EMPLOYED_BY', weight: 0.9 },
  { id: 'e14', source: 'n3', target: 'n14', edgeType: 'CONNECTED_TO', weight: 0.4 },
  { id: 'e15', source: 'n3', target: 'n17', edgeType: 'LOCATED_AT', weight: 0.8 },
  { id: 'e16', source: 'n4', target: 'n6', edgeType: 'KNOWS', weight: 0.5 },
  { id: 'e17', source: 'n4', target: 'n16', edgeType: 'LOCATED_AT', weight: 0.7 },
  { id: 'e18', source: 'n5', target: 'n1', edgeType: 'FOLLOWS', weight: 0.3 },
  { id: 'e19', source: 'n6', target: 'n9', edgeType: 'EMPLOYED_BY', weight: 0.6 },
  { id: 'e20', source: 'n6', target: 'n16', edgeType: 'LOCATED_AT', weight: 0.5 },
  { id: 'e21', source: 'n7', target: 'n9', edgeType: 'EMPLOYED_BY', weight: 0.8 },
  { id: 'e22', source: 'n7', target: 'n16', edgeType: 'LOCATED_AT', weight: 1.0 },
  { id: 'e23', source: 'n8', target: 'n15', edgeType: 'LOCATED_AT', weight: 1.0 },
  { id: 'e24', source: 'n9', target: 'n16', edgeType: 'LOCATED_AT', weight: 1.0 },
  { id: 'e25', source: 'n10', target: 'n17', edgeType: 'LOCATED_AT', weight: 1.0 },
  { id: 'e26', source: 'n11', target: 'n13', edgeType: 'FOLLOWS', weight: 0.4 },
  { id: 'e27', source: 'n12', target: 'n13', edgeType: 'FOLLOWS', weight: 0.6 },
  { id: 'e28', source: 'n1', target: 'n7', edgeType: 'CONNECTED_TO', weight: 0.3 },
  { id: 'e29', source: 'n10', target: 'n18', edgeType: 'LOCATED_AT', weight: 0.7 },
  { id: 'e30', source: 'n1', target: 'n18', edgeType: 'LOCATED_AT', weight: 0.4 },
];

// ── BFS for risk path ──
function findRiskPaths(nodes: GraphNode[], edges: GraphEdge[]): Set<string> {
  const applicant = nodes.find(n => n.type === 'applicant');
  const flagged = nodes.filter(n => n.type === 'flagged_person');
  if (!applicant || flagged.length === 0) return new Set();

  const adj = new Map<string, { node: string; edgeId: string }[]>();
  for (const e of edges) {
    const s = typeof e.source === 'string' ? e.source : e.source.id;
    const t = typeof e.target === 'string' ? e.target : e.target.id;
    if (!adj.has(s)) adj.set(s, []);
    if (!adj.has(t)) adj.set(t, []);
    adj.get(s)!.push({ node: t, edgeId: e.id });
    adj.get(t)!.push({ node: s, edgeId: e.id });
  }

  const highlighted = new Set<string>();
  for (const target of flagged) {
    const queue: { node: string; path: string[]; edges: string[] }[] = [{ node: applicant.id, path: [applicant.id], edges: [] }];
    const visited = new Set<string>([applicant.id]);
    let found = false;
    while (queue.length > 0 && !found) {
      const curr = queue.shift()!;
      for (const neighbor of adj.get(curr.node) || []) {
        if (visited.has(neighbor.node)) continue;
        const newPath = [...curr.path, neighbor.node];
        const newEdges = [...curr.edges, neighbor.edgeId];
        if (neighbor.node === target.id) {
          newPath.forEach(n => highlighted.add(n));
          newEdges.forEach(e => highlighted.add(e));
          found = true;
          break;
        }
        visited.add(neighbor.node);
        queue.push({ node: neighbor.node, path: newPath, edges: newEdges });
      }
    }
  }
  return highlighted;
}

// ── Node shape renderer ──
function NodeShape({ node, selected, hovered, dimmed, onMouseEnter, onMouseLeave, onClick, onMouseDown }: {
  node: GraphNode; selected: boolean; hovered: boolean; dimmed: boolean;
  onMouseEnter: () => void; onMouseLeave: () => void; onClick: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
}) {
  const r = NODE_RADIUS[node.type];
  const color = NODE_COLORS[node.type];
  const x = node.x || 0;
  const y = node.y || 0;

  const opacity = dimmed ? 0.15 : 1;

  const iconMap: Record<NodeType, typeof User> = {
    applicant: User,
    person: User,
    flagged_person: AlertTriangle,
    organization: Building2,
    social: Globe,
    location: MapPin,
  };

  const Icon = iconMap[node.type];

  return (
    <g
      transform={`translate(${x},${y})`}
      style={{ cursor: 'grab', opacity, transition: 'opacity 0.2s' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      onMouseDown={onMouseDown}
    >
      {/* Selection ring */}
      {selected && (
        <circle r={r + 6} fill="none" stroke={color} strokeWidth={2} strokeDasharray="4 2" opacity={0.6}>
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="8s" repeatCount="indefinite" />
        </circle>
      )}
      {/* Hover ring */}
      {hovered && !selected && (
        <circle r={r + 4} fill="none" stroke={color} strokeWidth={1.5} opacity={0.4} />
      )}
      {/* Flagged pulse */}
      {node.type === 'flagged_person' && (
        <circle r={r + 3} fill="none" stroke="var(--p2-red)" strokeWidth={1.5} opacity={0.5}>
          <animate attributeName="r" values={`${r + 3};${r + 10};${r + 3}`} dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Shape */}
      {node.type === 'organization' ? (
        <rect x={-r} y={-r} width={r * 2} height={r * 2} rx={4} fill={color} />
      ) : node.type === 'location' ? (
        <polygon points={`0,${-r} ${r},0 0,${r} ${-r},0`} fill={color} />
      ) : (
        <circle r={r} fill={color} />
      )}

      {/* Icon */}
      <foreignObject x={-8} y={-8} width={16} height={16} style={{ pointerEvents: 'none' }}>
        <Icon size={14} color="white" style={{ display: 'block', margin: 'auto' }} />
      </foreignObject>

      {/* Label */}
      <text y={r + 14} textAnchor="middle" fill="var(--p2-navy)" fontSize={10} fontWeight={500} style={{ pointerEvents: 'none' }}>
        {node.label.length > 18 ? node.label.slice(0, 16) + '…' : node.label}
      </text>
    </g>
  );
}

// ── Main component ──
export default function P2CaseGraph() {
  const { id } = useParams();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges] = useState<GraphEdge[]>(MOCK_EDGES);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [layout, setLayout] = useState<LayoutMode>('force');
  const [showRiskPaths, setShowRiskPaths] = useState(false);
  const [visibleTypes, setVisibleTypes] = useState<Set<NodeType>>(new Set(['applicant', 'person', 'flagged_person', 'organization', 'social', 'location']));

  const dragRef = useRef<{ nodeId: string | null; startX: number; startY: number; isPanning: boolean; panStartX: number; panStartY: number }>({
    nodeId: null, startX: 0, startY: 0, isPanning: false, panStartX: 0, panStartY: 0,
  });

  const simRef = useRef<ReturnType<typeof forceSimulation<GraphNode>> | null>(null);

  // Filter nodes and edges
  const filteredNodes = useMemo(() => nodes.filter(n => visibleTypes.has(n.type)), [nodes, visibleTypes]);
  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);
  const filteredEdges = useMemo(() => edges.filter(e => {
    const s = typeof e.source === 'string' ? e.source : e.source.id;
    const t = typeof e.target === 'string' ? e.target : e.target.id;
    return filteredNodeIds.has(s) && filteredNodeIds.has(t);
  }), [edges, filteredNodeIds]);

  // Risk paths
  const riskHighlight = useMemo(() => {
    if (!showRiskPaths) return new Set<string>();
    return findRiskPaths(filteredNodes, filteredEdges);
  }, [showRiskPaths, filteredNodes, filteredEdges]);

  // Hovered connections
  const hoveredConnections = useMemo(() => {
    if (!hoveredNode) return new Set<string>();
    const s = new Set<string>([hoveredNode]);
    for (const e of filteredEdges) {
      const src = typeof e.source === 'string' ? e.source : e.source.id;
      const tgt = typeof e.target === 'string' ? e.target : e.target.id;
      if (src === hoveredNode) { s.add(tgt); s.add(e.id); }
      if (tgt === hoveredNode) { s.add(src); s.add(e.id); }
    }
    return s;
  }, [hoveredNode, filteredEdges]);

  // Selected node connections list
  const selectedConnections = useMemo(() => {
    if (!selectedNode) return [];
    return filteredEdges
      .filter(e => {
        const s = typeof e.source === 'string' ? e.source : e.source.id;
        const t = typeof e.target === 'string' ? e.target : e.target.id;
        return s === selectedNode.id || t === selectedNode.id;
      })
      .map(e => {
        const s = typeof e.source === 'string' ? e.source : e.source.id;
        const t = typeof e.target === 'string' ? e.target : e.target.id;
        const otherId = s === selectedNode.id ? t : s;
        const otherNode = filteredNodes.find(n => n.id === otherId);
        return { edge: e, other: otherNode };
      })
      .filter(c => c.other);
  }, [selectedNode, filteredEdges, filteredNodes]);

  // Initialize simulation
  useEffect(() => {
    const width = 800;
    const height = 600;
    const clonedNodes: GraphNode[] = MOCK_NODES.map(n => ({ ...n }));

    if (layout === 'circular') {
      clonedNodes.forEach((n, i) => {
        const angle = (2 * Math.PI * i) / clonedNodes.length;
        const r = 220;
        n.x = width / 2 + r * Math.cos(angle);
        n.y = height / 2 + r * Math.sin(angle);
        n.fx = n.x;
        n.fy = n.y;
      });
      setNodes(clonedNodes);
      return;
    }

    if (layout === 'hierarchical') {
      const levels: Record<NodeType, number> = {
        applicant: 0, flagged_person: 1, person: 1, organization: 2, social: 3, location: 3,
      };
      const groups: Record<number, GraphNode[]> = {};
      clonedNodes.forEach(n => {
        const lv = levels[n.type];
        if (!groups[lv]) groups[lv] = [];
        groups[lv].push(n);
      });
      Object.entries(groups).forEach(([lvStr, grp]) => {
        const lv = Number(lvStr);
        grp.forEach((n, i) => {
          n.x = width / 2 + (i - (grp.length - 1) / 2) * 100;
          n.y = 80 + lv * 150;
          n.fx = n.x;
          n.fy = n.y;
        });
      });
      setNodes(clonedNodes);
      return;
    }

    // Force layout
    clonedNodes.forEach(n => { n.fx = undefined; n.fy = undefined; });
    const applicant = clonedNodes.find(n => n.type === 'applicant');
    if (applicant) { applicant.fx = width / 2; applicant.fy = height / 2; }

    const linkData = MOCK_EDGES.map(e => ({ ...e, source: e.source as string, target: e.target as string }));

    const sim = forceSimulation<GraphNode>(clonedNodes)
      .force('link', forceLink<GraphNode, SimulationLinkDatum<GraphNode>>(linkData).id(d => d.id).distance(120).strength(0.4))
      .force('charge', forceManyBody().strength(-400))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collide', forceCollide<GraphNode>().radius(d => NODE_RADIUS[d.type] + 20))
      .on('tick', () => {
        setNodes([...clonedNodes]);
      });

    simRef.current = sim;

    // Release applicant after initial settle
    setTimeout(() => {
      if (applicant) { applicant.fx = undefined; applicant.fy = undefined; }
      sim.alpha(0.1).restart();
    }, 1500);

    return () => { sim.stop(); };
  }, [layout]);

  // Drag
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    dragRef.current = { nodeId, startX: e.clientX, startY: e.clientY, isPanning: false, panStartX: 0, panStartY: 0 };

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current.nodeId) return;
      setNodes(prev => prev.map(n => {
        if (n.id !== dragRef.current.nodeId) return n;
        return { ...n, x: (n.x || 0) + (ev.clientX - dragRef.current.startX) / zoom, y: (n.y || 0) + (ev.clientY - dragRef.current.startY) / zoom };
      }));
      dragRef.current.startX = ev.clientX;
      dragRef.current.startY = ev.clientY;
    };

    const onUp = () => {
      dragRef.current.nodeId = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [zoom]);

  // Pan
  const handleSvgMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as Element).closest('g')) return;
    dragRef.current = { nodeId: null, startX: 0, startY: 0, isPanning: true, panStartX: e.clientX, panStartY: e.clientY };

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current.isPanning) return;
      setPan(prev => ({
        x: prev.x + (ev.clientX - dragRef.current.panStartX),
        y: prev.y + (ev.clientY - dragRef.current.panStartY),
      }));
      dragRef.current.panStartX = ev.clientX;
      dragRef.current.panStartY = ev.clientY;
    };

    const onUp = () => {
      dragRef.current.isPanning = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, []);

  // Zoom via wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(prev => Math.max(0.3, Math.min(3, prev - e.deltaY * 0.001)));
  }, []);

  const toggleType = (t: NodeType) => {
    setVisibleTypes(prev => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  // Stats
  const stats = useMemo(() => ({
    nodes: filteredNodes.length,
    edges: filteredEdges.length,
    riskConnections: filteredNodes.filter(n => n.type === 'flagged_person').length,
    clusters: 3,
  }), [filteredNodes, filteredEdges]);

  const caseId = id || 'VIS-2026-1002';
  const applicantName = MOCK_NODES.find(n => n.type === 'applicant')?.label || 'Unknown';

  const typeFilters: { type: NodeType; label: string; icon: typeof User }[] = [
    { type: 'person', label: 'Persons', icon: Users },
    { type: 'flagged_person', label: 'Flagged', icon: AlertTriangle },
    { type: 'organization', label: 'Orgs', icon: Building2 },
    { type: 'social', label: 'Social', icon: Globe },
    { type: 'location', label: 'Locations', icon: MapPin },
  ];

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="p2-card p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to={`/p2/dashboard/cases/${caseId}`} className="flex items-center gap-1.5 text-xs text-[--p2-gray-400] hover:text-[--p2-blue] transition-colors">
              <ArrowLeft size={14} /> Back to Case
            </Link>
            <div className="w-px h-5 bg-[--p2-gray-200]" />
            <Network size={16} style={{ color: 'var(--p2-blue)' }} />
            <h1 className="text-sm font-bold text-[--p2-navy]">Network Analysis: {applicantName}</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Layout toggle */}
            <div className="flex bg-[--p2-gray-100] rounded-md p-0.5">
              {(['force', 'hierarchical', 'circular'] as LayoutMode[]).map(m => (
                <button key={m} onClick={() => setLayout(m)}
                  className={cn('px-2.5 py-1 rounded text-[10px] font-medium capitalize transition-all',
                    layout === m ? 'bg-white text-[--p2-navy] shadow-sm' : 'text-[--p2-gray-500] hover:text-[--p2-navy]')}>
                  {m}
                </button>
              ))}
            </div>
            <div className="w-px h-5 bg-[--p2-gray-200]" />
            {/* Zoom controls */}
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.min(3, z + 0.2))}>
              <ZoomIn size={13} />
            </Button>
            <span className="text-[10px] text-[--p2-gray-400] w-10 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.max(0.3, z - 0.2))}>
              <ZoomOut size={13} />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>
              <Maximize2 size={13} />
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1">
              <Download size={11} /> PNG
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4" style={{ minHeight: 600 }}>
        {/* Graph */}
        <div ref={containerRef} className="lg:col-span-3 p2-card overflow-hidden relative" style={{ minHeight: 550 }}>
          {/* Filter bar */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-medium text-[--p2-gray-400] flex items-center gap-1"><Filter size={10} /> Show:</span>
            {typeFilters.map(f => {
              const active = visibleTypes.has(f.type);
              const Icon = f.icon;
              return (
                <button key={f.type} onClick={() => toggleType(f.type)}
                  className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-all border',
                    active ? 'border-[--p2-gray-300] bg-white text-[--p2-navy]' : 'border-transparent bg-[--p2-gray-100] text-[--p2-gray-400]')}>
                  {active ? <Eye size={10} /> : <EyeOff size={10} />}
                  <Icon size={10} />
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Risk path toggle */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-2 p2-card px-3 py-1.5">
            <Shield size={12} style={{ color: showRiskPaths ? 'var(--p2-red)' : 'var(--p2-gray-400)' }} />
            <span className="text-[10px] font-medium text-[--p2-navy]">Risk Paths</span>
            <Switch checked={showRiskPaths} onCheckedChange={setShowRiskPaths} className="scale-75" />
          </div>

          {/* Edge hover tooltip */}
          {hoveredEdge && (() => {
            const edge = filteredEdges.find(e => e.id === hoveredEdge);
            if (!edge) return null;
            const style = EDGE_STYLES[edge.edgeType];
            const sx = typeof edge.source === 'string' ? 0 : (edge.source.x || 0);
            const sy = typeof edge.source === 'string' ? 0 : (edge.source.y || 0);
            const tx = typeof edge.target === 'string' ? 0 : (edge.target.x || 0);
            const ty = typeof edge.target === 'string' ? 0 : (edge.target.y || 0);
            const mx = (sx + tx) / 2;
            const my = (sy + ty) / 2;
            return (
              <div className="absolute z-20 p2-card px-2 py-1 text-[10px] pointer-events-none shadow-lg" style={{
                left: mx * zoom + pan.x + (containerRef.current?.clientWidth || 0) / 2 - 400 * (zoom - 1) / 2,
                top: my * zoom + pan.y - 30,
              }}>
                <span style={{ color: style.color }} className="font-semibold">{style.label}</span>
                <span className="text-[--p2-gray-400] ml-1.5">weight: {edge.weight.toFixed(1)}</span>
              </div>
            );
          })()}

          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            style={{ minHeight: 550, cursor: 'grab' }}
            onMouseDown={handleSvgMouseDown}
            onWheel={handleWheel}
          >
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Edges */}
              {filteredEdges.map(e => {
                const s = typeof e.source === 'string' ? nodes.find(n => n.id === e.source) : e.source;
                const t = typeof e.target === 'string' ? nodes.find(n => n.id === e.target) : e.target;
                if (!s || !t) return null;
                const sx = s.x || 0;
                const sy = s.y || 0;
                const tx = t.x || 0;
                const ty = t.y || 0;
                const style = EDGE_STYLES[e.edgeType];
                const isRiskPath = riskHighlight.has(e.id);
                const isDimmed = hoveredNode && !hoveredConnections.has(e.id);
                return (
                  <line key={e.id}
                    x1={sx} y1={sy} x2={tx} y2={ty}
                    stroke={isRiskPath ? 'var(--p2-red)' : style.color}
                    strokeWidth={isRiskPath ? 3 : 1 + e.weight * 2}
                    strokeDasharray={style.dash}
                    opacity={isDimmed ? 0.08 : isRiskPath ? 0.9 : 0.5}
                    style={{ transition: 'opacity 0.2s, stroke 0.2s' }}
                    onMouseEnter={() => setHoveredEdge(e.id)}
                    onMouseLeave={() => setHoveredEdge(null)}
                    cursor="pointer"
                  />
                );
              })}
              {/* Nodes */}
              {filteredNodes.map(node => (
                <NodeShape
                  key={node.id}
                  node={node}
                  selected={selectedNode?.id === node.id}
                  hovered={hoveredNode === node.id}
                  dimmed={!!hoveredNode && !hoveredConnections.has(node.id)}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                />
              ))}
            </g>
          </svg>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 p2-card px-3 py-2 flex flex-wrap gap-x-4 gap-y-1.5">
            {Object.entries(EDGE_STYLES).map(([key, s]) => (
              <div key={key} className="flex items-center gap-1.5">
                <svg width={20} height={8}><line x1={0} y1={4} x2={20} y2={4} stroke={s.color} strokeWidth={2} strokeDasharray={s.dash} /></svg>
                <span className="text-[9px] text-[--p2-gray-500]">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="lg:col-span-1 space-y-4">
          <AnimatePresence mode="wait">
            {selectedNode ? (
              <motion.div key="detail" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="p2-card p-5 space-y-4">
                {/* Node header */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: NODE_COLORS[selectedNode.type] }}>
                    {selectedNode.type === 'organization' ? <Building2 size={18} className="text-white" /> :
                     selectedNode.type === 'social' ? <Globe size={18} className="text-white" /> :
                     selectedNode.type === 'location' ? <MapPin size={18} className="text-white" /> :
                     selectedNode.type === 'flagged_person' ? <AlertTriangle size={18} className="text-white" /> :
                     <User size={18} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-[--p2-navy] truncate">{selectedNode.label}</h3>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full capitalize"
                      style={{ background: `color-mix(in srgb, ${NODE_COLORS[selectedNode.type]} 12%, transparent)`, color: NODE_COLORS[selectedNode.type] }}>
                      {selectedNode.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Risk score */}
                {selectedNode.riskScore !== undefined && (
                  <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: selectedNode.riskScore > 70 ? 'rgba(239,68,68,0.05)' : 'var(--p2-gray-50)' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ background: selectedNode.riskScore > 70 ? 'var(--p2-red)' : selectedNode.riskScore > 40 ? 'var(--p2-orange)' : 'var(--p2-green)' }}>
                      {selectedNode.riskScore}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-[--p2-navy]">Risk Score</p>
                      <p className="text-[10px] text-[--p2-gray-400]">
                        {selectedNode.riskScore > 70 ? 'High Risk' : selectedNode.riskScore > 40 ? 'Medium Risk' : 'Low Risk'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Detail */}
                {selectedNode.detail && (
                  <p className="text-[11px] text-[--p2-gray-600] leading-relaxed">{selectedNode.detail}</p>
                )}

                {/* View profile link */}
                {(selectedNode.type === 'applicant' || selectedNode.type === 'person' || selectedNode.type === 'flagged_person') && (
                  <Link to={`/p2/dashboard/cases/${caseId}`}
                    className="flex items-center gap-1 text-[11px] text-[--p2-blue] hover:underline font-medium">
                    View Full Profile <ExternalLink size={10} />
                  </Link>
                )}

                {/* Connections */}
                <div>
                  <h4 className="text-[11px] font-semibold text-[--p2-navy] mb-2 flex items-center gap-1"><Link2 size={12} /> Connections ({selectedConnections.length})</h4>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {selectedConnections.map(c => {
                      const style = EDGE_STYLES[c.edge.edgeType];
                      return (
                        <button key={c.edge.id}
                          onClick={() => setSelectedNode(c.other!)}
                          className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-[--p2-gray-50] transition-colors text-left">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: NODE_COLORS[c.other!.type] }}>
                            <User size={10} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium text-[--p2-navy] truncate">{c.other!.label}</p>
                            <p className="text-[9px]" style={{ color: style.color }}>{style.label}</p>
                          </div>
                          <ChevronRight size={12} className="text-[--p2-gray-300]" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="summary" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="p2-card p-5 space-y-4">
                <h3 className="text-xs font-semibold text-[--p2-navy] flex items-center gap-1.5"><Network size={14} /> Graph Summary</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Total Nodes', value: stats.nodes, color: 'var(--p2-blue)' },
                    { label: 'Total Edges', value: stats.edges, color: 'var(--p2-navy)' },
                    { label: 'Clusters', value: stats.clusters, color: '#8B5CF6' },
                    { label: 'Risk Nodes', value: stats.riskConnections, color: 'var(--p2-red)' },
                  ].map(s => (
                    <div key={s.label} className="p-3 rounded-lg bg-[--p2-gray-50] text-center">
                      <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-[10px] text-[--p2-gray-400]">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Communities */}
                <div>
                  <h4 className="text-[11px] font-semibold text-[--p2-navy] mb-2">Detected Communities</h4>
                  <div className="space-y-2">
                    {[
                      { name: 'Tehran Business Network', count: 5, risk: 'High', color: 'var(--p2-red)' },
                      { name: 'Istanbul Transit Cluster', count: 4, risk: 'Medium', color: 'var(--p2-orange)' },
                      { name: 'Social Media Group', count: 4, risk: 'Low', color: 'var(--p2-green)' },
                    ].map(c => (
                      <div key={c.name} className="flex items-center gap-2 p-2 rounded-md bg-[--p2-gray-50]">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-[--p2-navy] truncate">{c.name}</p>
                          <p className="text-[9px] text-[--p2-gray-400]">{c.count} nodes · {c.risk} risk</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] text-[--p2-gray-400] italic pt-2 border-t border-[--p2-gray-100]">Click a node to view details. Hover to highlight connections.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
