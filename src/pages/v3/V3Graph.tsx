import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ForceGraph3D, { ForceGraphMethods } from 'react-force-graph-3d';
import * as THREE from 'three';
import {
  AlertTriangle, Building2, User, Globe, MapPin, MessageCircle,
  ZoomIn, ZoomOut, RotateCcw, X,
  Shield, ExternalLink, ChevronRight, Crosshair,
  Network, Filter, Activity, Link2, FileWarning, Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ── Types ──
type NodeType = 'applicant' | 'person' | 'flagged_person' | 'organization' | 'social' | 'location';
type EdgeType = 'KNOWS' | 'CONNECTED_TO' | 'FOLLOWS' | 'EMPLOYED_BY' | 'LOCATED_AT' | 'SHARED_DOC' | 'SAME_MOBILE';

interface GNode {
  id: string;
  label: string;
  type: NodeType;
  riskScore: number;
  detail: string;
  flagged?: boolean;
  caseId?: string;
  x?: number; y?: number; z?: number;
  fx?: number; fy?: number; fz?: number;
}

interface GLink {
  source: string | GNode;
  target: string | GNode;
  edgeType: EdgeType;
  weight: number;
  label?: string;
}

// ── V3 Color config ──
const NODE_HEX: Record<NodeType, number> = {
  applicant:      0xA78BFA, // violet — primary subject
  person:         0x71717A, // zinc-500
  flagged_person: 0xF87171, // red
  organization:   0x818CF8, // indigo
  social:         0xA78BFA, // violet
  location:       0x4ADE80, // green
};

const NODE_SIZE: Record<NodeType, number> = {
  applicant: 10, person: 5, flagged_person: 7,
  organization: 7, social: 5, location: 5,
};

const EDGE_COLORS: Record<EdgeType, string> = {
  KNOWS:        'rgba(113,113,122,0.35)',
  CONNECTED_TO: 'rgba(167,139,250,0.45)',
  FOLLOWS:      'rgba(167,139,250,0.35)',
  EMPLOYED_BY:  'rgba(251,191,36,0.45)',
  LOCATED_AT:   'rgba(74,222,128,0.3)',
  SHARED_DOC:   'rgba(248,113,113,0.6)',
  SAME_MOBILE:  'rgba(248,113,113,0.7)',
};

const TYPE_ICONS: Record<NodeType, { label: string; icon: typeof User }> = {
  applicant:      { label: 'Applicant',    icon: Shield },
  person:         { label: 'Person',       icon: User },
  flagged_person: { label: 'Flagged',      icon: AlertTriangle },
  organization:   { label: 'Organization', icon: Building2 },
  social:         { label: 'Social',       icon: MessageCircle },
  location:       { label: 'Location',     icon: MapPin },
};

// ── Ahmad Rezaee fraud network data ──
const NODES: GNode[] = [
  { id: 'ahmad', label: 'Ahmad Rezaee', type: 'applicant', riskScore: 94, detail: 'Primary subject — Iranian national, Visa Mill network member. Score: 94/100.', flagged: true, caseId: 'PL-2026-00101' },
  { id: 'reza', label: 'Reza Mohammadi', type: 'flagged_person', riskScore: 82, detail: 'EU Sanctions familial match. Shared document hashes with Ahmad.', flagged: true },
  { id: 'fatima', label: 'Fatima Al-Rashid', type: 'flagged_person', riskScore: 74, detail: 'Connected to 2 previously denied cases. Duplicate mobile hash.', flagged: true },
  { id: 'mehdi', label: 'Mehdi Hosseini', type: 'person', riskScore: 35, detail: 'Previously cleared applicant. Low-risk connection.' },
  { id: 'sara', label: 'Sara Nazari', type: 'person', riskScore: 22, detail: 'Reference contact. No adverse records.' },
  { id: 'ali', label: 'Ali Karimi', type: 'person', riskScore: 45, detail: 'Travel companion — VIS-2026-0987. Medium risk.' },
  { id: 'yusuf', label: 'Yusuf Demir', type: 'person', riskScore: 18, detail: 'Turkish national — legitimate business contact.' },
  { id: 'dmitri', label: 'Dmitri Volkov', type: 'flagged_person', riskScore: 68, detail: 'Visa coaching channel operator. OSINT flagged.', flagged: true },
  { id: 'elena', label: 'Elena Sokolova', type: 'person', riskScore: 72, detail: 'Employment history inconsistencies. IP mismatch.' },
  { id: 'parham', label: 'Parham Trading Co.', type: 'organization', riskScore: 65, detail: 'Import/export — Tehran. Shell company indicators.' },
  { id: 'silk', label: 'Silk Road Logistics', type: 'organization', riskScore: 58, detail: 'Shipping & logistics — Istanbul. Under review.' },
  { id: 'crescent', label: 'Crescent Finance Ltd.', type: 'organization', riskScore: 71, detail: 'Financial services — Beirut. Linked to sanctioned entities.' },
  { id: 'visa_mill', label: 'Visa Mill Network', type: 'organization', riskScore: 92, detail: 'Organized visa fraud ring. 14 linked applicants across 3 consulates.', flagged: true },
  { id: 'ig_ahmad', label: '@ahmad_r_88', type: 'social', riskScore: 40, detail: 'Instagram — 1,240 followers. Coaching content detected.' },
  { id: 'tg_reza', label: '@rezam_official', type: 'social', riskScore: 55, detail: 'Telegram — active in 3 flagged groups.' },
  { id: 'tg_trade', label: 'TG: Iran-Turkey Trade', type: 'social', riskScore: 48, detail: 'Telegram group — 450 members. Visa discussion flagged.' },
  { id: 'tg_coaching', label: 'TG: Visa Coaching Hub', type: 'social', riskScore: 78, detail: 'Visa coaching Telegram channel — run by Dmitri.', flagged: true },
  { id: 'tehran', label: 'Tehran, Iran', type: 'location', riskScore: 30, detail: 'Primary residence of Ahmad. High-risk origin.' },
  { id: 'istanbul', label: 'Istanbul, Turkey', type: 'location', riskScore: 20, detail: 'Frequent travel destination. 4 visits in 2025.' },
  { id: 'beirut', label: 'Beirut, Lebanon', type: 'location', riskScore: 35, detail: 'Crescent Finance HQ. Transit point.' },
  { id: 'dubai', label: 'Dubai, UAE', type: 'location', riskScore: 15, detail: 'Transit hub — 3 visits in 2024.' },
  { id: 'doc_passport', label: 'DOC: Passport IR-4892', type: 'organization', riskScore: 80, detail: 'Document hash match — Maris flagged. Shared across 2 applicants.' },
  { id: 'mobile_hash', label: 'Mobile: +98***1247', type: 'social', riskScore: 85, detail: 'Duplicate mobile number hash. vizesepetim.com correlation.' },
];

const LINKS: GLink[] = [
  { source: 'ahmad', target: 'reza', edgeType: 'KNOWS', weight: 0.9, label: 'Known associate' },
  { source: 'ahmad', target: 'fatima', edgeType: 'KNOWS', weight: 0.7 },
  { source: 'ahmad', target: 'mehdi', edgeType: 'KNOWS', weight: 0.5 },
  { source: 'ahmad', target: 'sara', edgeType: 'KNOWS', weight: 0.3 },
  { source: 'ahmad', target: 'ali', edgeType: 'KNOWS', weight: 0.7 },
  { source: 'ahmad', target: 'parham', edgeType: 'EMPLOYED_BY', weight: 0.8 },
  { source: 'ahmad', target: 'visa_mill', edgeType: 'CONNECTED_TO', weight: 0.95, label: 'Member' },
  { source: 'ahmad', target: 'ig_ahmad', edgeType: 'CONNECTED_TO', weight: 0.5 },
  { source: 'ahmad', target: 'tehran', edgeType: 'LOCATED_AT', weight: 1.0 },
  { source: 'ahmad', target: 'istanbul', edgeType: 'LOCATED_AT', weight: 0.6 },
  { source: 'ahmad', target: 'dubai', edgeType: 'LOCATED_AT', weight: 0.4 },
  { source: 'ahmad', target: 'doc_passport', edgeType: 'SHARED_DOC', weight: 0.95, label: 'Hash match' },
  { source: 'ahmad', target: 'mobile_hash', edgeType: 'SAME_MOBILE', weight: 0.9, label: 'Duplicate mobile' },
  { source: 'reza', target: 'fatima', edgeType: 'KNOWS', weight: 0.8 },
  { source: 'reza', target: 'parham', edgeType: 'EMPLOYED_BY', weight: 0.7 },
  { source: 'reza', target: 'crescent', edgeType: 'CONNECTED_TO', weight: 0.5 },
  { source: 'reza', target: 'tg_reza', edgeType: 'CONNECTED_TO', weight: 0.6 },
  { source: 'reza', target: 'visa_mill', edgeType: 'CONNECTED_TO', weight: 0.85, label: 'Member' },
  { source: 'reza', target: 'doc_passport', edgeType: 'SHARED_DOC', weight: 0.9, label: 'Hash match' },
  { source: 'reza', target: 'mobile_hash', edgeType: 'SAME_MOBILE', weight: 0.85 },
  { source: 'fatima', target: 'silk', edgeType: 'EMPLOYED_BY', weight: 0.9 },
  { source: 'fatima', target: 'beirut', edgeType: 'LOCATED_AT', weight: 0.8 },
  { source: 'fatima', target: 'visa_mill', edgeType: 'CONNECTED_TO', weight: 0.75, label: 'Suspected member' },
  { source: 'dmitri', target: 'tg_coaching', edgeType: 'CONNECTED_TO', weight: 0.95, label: 'Operator' },
  { source: 'dmitri', target: 'visa_mill', edgeType: 'CONNECTED_TO', weight: 0.7 },
  { source: 'dmitri', target: 'elena', edgeType: 'KNOWS', weight: 0.6 },
  { source: 'elena', target: 'istanbul', edgeType: 'LOCATED_AT', weight: 0.7 },
  { source: 'elena', target: 'silk', edgeType: 'EMPLOYED_BY', weight: 0.5 },
  { source: 'ali', target: 'silk', edgeType: 'EMPLOYED_BY', weight: 0.6 },
  { source: 'ali', target: 'istanbul', edgeType: 'LOCATED_AT', weight: 0.5 },
  { source: 'yusuf', target: 'silk', edgeType: 'EMPLOYED_BY', weight: 0.8 },
  { source: 'yusuf', target: 'istanbul', edgeType: 'LOCATED_AT', weight: 1.0 },
  { source: 'mehdi', target: 'istanbul', edgeType: 'LOCATED_AT', weight: 0.7 },
  { source: 'parham', target: 'tehran', edgeType: 'LOCATED_AT', weight: 1.0 },
  { source: 'silk', target: 'istanbul', edgeType: 'LOCATED_AT', weight: 1.0 },
  { source: 'crescent', target: 'beirut', edgeType: 'LOCATED_AT', weight: 1.0 },
  { source: 'crescent', target: 'dubai', edgeType: 'LOCATED_AT', weight: 0.5 },
  { source: 'ig_ahmad', target: 'tg_trade', edgeType: 'FOLLOWS', weight: 0.4 },
  { source: 'tg_reza', target: 'tg_trade', edgeType: 'FOLLOWS', weight: 0.6 },
  { source: 'tg_reza', target: 'tg_coaching', edgeType: 'FOLLOWS', weight: 0.5 },
  { source: 'ahmad', target: 'yusuf', edgeType: 'CONNECTED_TO', weight: 0.3 },
  { source: 'ahmad', target: 'elena', edgeType: 'CONNECTED_TO', weight: 0.4, label: 'IP overlap' },
];

// ── Geometry builders ──
function buildNodeGeometry(type: NodeType, size: number): THREE.BufferGeometry {
  switch (type) {
    case 'applicant':
      return new THREE.OctahedronGeometry(size * 1.3, 1);
    case 'flagged_person':
      return new THREE.OctahedronGeometry(size, 0);
    case 'organization':
      return new THREE.BoxGeometry(size * 1.6, size * 1.6, size * 1.6);
    case 'social':
      return new THREE.CylinderGeometry(size * 0.8, size * 0.8, size * 0.6, 6);
    case 'location':
      return new THREE.ConeGeometry(size * 0.9, size * 1.6, 4);
    default:
      return new THREE.SphereGeometry(size, 16, 16);
  }
}

// ── Component ──
export default function V3Graph() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const graphRef = useRef<ForceGraphMethods<GNode, GLink>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 800, height: 600 });
  const [selectedNode, setSelectedNode] = useState<GNode | null>(null);
  const [dossierNode, setDossierNode] = useState<GNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showParticles, setShowParticles] = useState(true);
  const [showRiskPaths, setShowRiskPaths] = useState(true);
  const [highlightRisk, setHighlightRisk] = useState(true);
  const [visibleTypes, setVisibleTypes] = useState<Set<NodeType>>(
    new Set(['applicant', 'person', 'flagged_person', 'organization', 'social', 'location'])
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDims({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const graphData = useMemo(() => {
    let filteredNodes = NODES.filter(n => visibleTypes.has(n.type));
    if (search) {
      const q = search.toLowerCase();
      filteredNodes = filteredNodes.filter(n =>
        n.label.toLowerCase().includes(q) || n.detail.toLowerCase().includes(q)
      );
    }
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = LINKS.filter(l => {
      const s = typeof l.source === 'string' ? l.source : l.source.id;
      const t = typeof l.target === 'string' ? l.target : l.target.id;
      return nodeIds.has(s) && nodeIds.has(t);
    });
    return { nodes: filteredNodes, links: filteredLinks };
  }, [visibleTypes, search]);

  const riskNodeIds = useMemo(() => {
    if (!showRiskPaths) return new Set<string>();
    const flaggedIds = NODES.filter(n => n.flagged).map(n => n.id);
    const all = new Set<string>(flaggedIds);
    for (const l of LINKS) {
      const s = typeof l.source === 'string' ? l.source : l.source.id;
      const t = typeof l.target === 'string' ? l.target : l.target.id;
      if (flaggedIds.includes(s)) all.add(t);
      if (flaggedIds.includes(t)) all.add(s);
    }
    return all;
  }, [showRiskPaths]);

  const hoveredConnections = useMemo(() => {
    if (!hoveredNode) return new Set<string>();
    const s = new Set<string>([hoveredNode]);
    for (const l of LINKS) {
      const src = typeof l.source === 'string' ? l.source : l.source.id;
      const tgt = typeof l.target === 'string' ? l.target : l.target.id;
      if (src === hoveredNode) s.add(tgt);
      if (tgt === hoveredNode) s.add(src);
    }
    return s;
  }, [hoveredNode]);

  const nodeThreeObject = useCallback((node: GNode) => {
    const isSelected = selectedNode?.id === node.id;
    const isHovered = hoveredNode === node.id;
    const isRiskPath = highlightRisk && riskNodeIds.has(node.id);
    const isDimmed = hoveredNode && !hoveredConnections.has(node.id);
    const size = NODE_SIZE[node.type];
    const color = NODE_HEX[node.type];

    const group = new THREE.Group();

    const geo = buildNodeGeometry(node.type, size);
    const mat = new THREE.MeshPhongMaterial({
      color,
      transparent: true,
      opacity: isDimmed ? 0.15 : 0.92,
      emissive: node.flagged ? 0xf87171 : (isRiskPath ? 0xfbbf24 : 0x000000),
      emissiveIntensity: node.flagged ? 0.35 : (isRiskPath ? 0.15 : 0),
      shininess: 80,
    });
    const mesh = new THREE.Mesh(geo, mat);
    group.add(mesh);

    if (node.flagged) {
      const ringGeo = new THREE.RingGeometry(size * 1.6, size * 2.0, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35 + Math.sin(Date.now() * 0.003) * 0.15,
      });
      group.add(new THREE.Mesh(ringGeo, ringMat));
      const glow = new THREE.RingGeometry(size * 2.0, size * 2.6, 32);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.12,
      });
      group.add(new THREE.Mesh(glow, glowMat));
    }

    if (isSelected || isHovered) {
      const ringGeo = new THREE.RingGeometry(size * 1.4, size * 1.7, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0x06B6D4 : 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      group.add(new THREE.Mesh(ringGeo, ringMat));
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 256;
    canvas.height = 64;
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = isDimmed ? 'rgba(226,232,240,0.2)' : 'rgba(226,232,240,0.9)';
    ctx.fillText(node.label.length > 18 ? node.label.slice(0, 16) + '…' : node.label, 128, 28);
    if (node.riskScore >= 70) {
      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = '#ef4444';
      ctx.fillText(`⚠ ${node.riskScore}`, 128, 52);
    }
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.set(0, size * 2.2, 0);
    sprite.scale.set(28, 7, 1);
    group.add(sprite);

    return group;
  }, [selectedNode, hoveredNode, hoveredConnections, highlightRisk, riskNodeIds]);

  const linkColor = useCallback((link: GLink) => {
    if (link.edgeType === 'SHARED_DOC' || link.edgeType === 'SAME_MOBILE') return 'rgba(239,68,68,0.7)';
    return EDGE_COLORS[link.edgeType] || 'rgba(226,232,240,0.1)';
  }, []);

  const linkWidth = useCallback((link: GLink) => {
    if (link.edgeType === 'SHARED_DOC' || link.edgeType === 'SAME_MOBILE') return 2.5;
    return link.weight * 2;
  }, []);

  const handleNodeClick = useCallback((node: GNode) => {
    setSelectedNode(prev => prev?.id === node.id ? null : node);
    if (graphRef.current && node.x != null && node.y != null && node.z != null) {
      const dist = 120;
      const ratio = 1 + dist / Math.hypot(node.x, node.y, node.z || 1);
      graphRef.current.cameraPosition(
        { x: node.x * ratio, y: node.y * ratio, z: node.z * ratio },
        { x: node.x, y: node.y, z: node.z },
        800
      );
    }
  }, []);

  const handleNodeRightClick = useCallback((node: GNode, event: MouseEvent) => {
    event.preventDefault();
    setDossierNode(node);
  }, []);

  const toggleType = (t: NodeType) => {
    setVisibleTypes(prev => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  };

  const resetView = () => {
    graphRef.current?.cameraPosition({ x: 0, y: 0, z: 300 }, { x: 0, y: 0, z: 0 }, 800);
    setSelectedNode(null);
    setDossierNode(null);
  };

  const zoomIn = () => graphRef.current?.cameraPosition({ x: 0, y: 0, z: 150 }, undefined, 600);
  const zoomOut = () => graphRef.current?.cameraPosition({ x: 0, y: 0, z: 500 }, undefined, 600);

  const dossierConnections = useMemo(() => {
    if (!dossierNode) return [];
    return LINKS
      .filter(l => {
        const s = typeof l.source === 'string' ? l.source : l.source.id;
        const t = typeof l.target === 'string' ? l.target : l.target.id;
        return s === dossierNode.id || t === dossierNode.id;
      })
      .map(l => {
        const s = typeof l.source === 'string' ? l.source : l.source.id;
        const t = typeof l.target === 'string' ? l.target : l.target.id;
        const otherId = s === dossierNode!.id ? t : s;
        const other = NODES.find(n => n.id === otherId);
        return { ...l, other };
      });
  }, [dossierNode]);

  const riskColor = (score: number) =>
    score >= 80 ? 'text-red-400' : score >= 60 ? 'text-orange-400' : score >= 40 ? 'text-amber-400' : 'text-green-400';

  const riskBg = (score: number) =>
    score >= 80 ? 'bg-red-500/20 text-red-400 border-red-500/30' : score >= 60 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : score >= 40 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30';

  const panelBg = 'rgba(24,24,27,0.92)';

  return (
    <div className="relative w-full h-full overflow-hidden" ref={containerRef} style={{ background: '#09090b' }}>
      <ForceGraph3D
        ref={graphRef}
        graphData={graphData}
        width={dims.width}
        height={dims.height}
        backgroundColor="#09090b"
        nodeThreeObject={nodeThreeObject}
        nodeThreeObjectExtend={false}
        onNodeClick={handleNodeClick}
        onNodeRightClick={handleNodeRightClick}
        onNodeHover={(node: GNode | null) => setHoveredNode(node?.id ?? null)}
        linkColor={linkColor}
        linkWidth={linkWidth}
        linkOpacity={0.6}
        linkDirectionalParticles={showParticles ? 3 : 0}
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleSpeed={0.004}
        linkDirectionalParticleColor={() => '#a78bfa'}
        linkCurvature={0.1}
        enableNodeDrag={true}
        enableNavigationControls={true}
        showNavInfo={false}
        warmupTicks={80}
        cooldownTime={3000}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />

      {/* Top bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="backdrop-blur-md border rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: panelBg, borderColor: 'var(--v3-border)' }}>
            <Network size={16} style={{ color: 'var(--v3-accent)' }} />
            <div>
              <h2 className="text-xs font-bold" style={{ color: 'var(--v3-text)' }}>Ahmad Rezaee — Fraud Network</h2>
              <p className="text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>{graphData.nodes.length} entities · {graphData.links.length} connections</p>
            </div>
          </div>
        </div>

        <div className="pointer-events-auto">
          <div className="backdrop-blur-md border rounded-xl px-3" style={{ background: panelBg, borderColor: 'var(--v3-border)' }}>
            <div className="relative">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: 'var(--v3-text-muted)' }} />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search entities..."
                className="bg-transparent border-none text-xs pl-7 h-9 w-48 focus-visible:ring-0"
                style={{ color: 'var(--v3-text)' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Left filter panel */}
      <div className="absolute left-3 top-16 pointer-events-auto z-10">
        <div className="backdrop-blur-md border rounded-xl p-4 space-y-3 w-48" style={{ background: panelBg, borderColor: 'var(--v3-border)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] flex items-center gap-1.5" style={{ color: 'var(--v3-text-muted)' }}>
            <Filter size={10} /> Entity Types
          </p>
          {(Object.keys(TYPE_ICONS) as NodeType[]).map(t => {
            const { label, icon: Icon } = TYPE_ICONS[t];
            const active = visibleTypes.has(t);
            const count = NODES.filter(n => n.type === t).length;
            return (
              <button key={t} onClick={() => toggleType(t)}
                className={cn('flex items-center gap-2 w-full text-left text-xs rounded-lg px-2.5 py-2 transition-all',
                  active ? 'bg-white/5' : 'hover:bg-white/5'
                )}
                style={{ color: active ? 'var(--v3-text-secondary)' : 'var(--v3-text-muted)' }}>
                <Icon size={12} />
                <span className="flex-1">{label}</span>
                <span className="text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>{count}</span>
                <div className={cn('w-1.5 h-1.5 rounded-full')} style={{ background: active ? 'var(--v3-accent)' : 'var(--v3-border)' }} />
              </button>
            );
          })}

          <div className="border-t pt-2 space-y-2" style={{ borderColor: 'var(--v3-border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>Particles</span>
              <Switch checked={showParticles} onCheckedChange={setShowParticles} className="scale-75" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>Risk paths</span>
              <Switch checked={showRiskPaths} onCheckedChange={setShowRiskPaths} className="scale-75" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>Risk glow</span>
              <Switch checked={highlightRisk} onCheckedChange={setHighlightRisk} className="scale-75" />
            </div>
          </div>
        </div>
      </div>

      {/* Right controls */}
      <div className="absolute right-3 top-16 pointer-events-auto z-10 flex flex-col gap-1.5">
        {[
          { icon: ZoomIn, action: zoomIn, tip: 'Zoom in' },
          { icon: ZoomOut, action: zoomOut, tip: 'Zoom out' },
          { icon: RotateCcw, action: resetView, tip: 'Reset view' },
          { icon: Crosshair, action: () => {
            const ahmad = NODES.find(n => n.id === 'ahmad');
            if (ahmad && graphRef.current) handleNodeClick(ahmad);
          }, tip: 'Focus subject' },
        ].map(({ icon: Icon, action, tip }) => (
          <Button key={tip} size="icon" variant="ghost" onClick={action} title={tip}
            className="w-9 h-9 backdrop-blur-md border rounded-xl"
            style={{ background: panelBg, borderColor: 'var(--v3-border)', color: 'var(--v3-text-secondary)' }}>
            <Icon size={15} />
          </Button>
        ))}
      </div>

      {/* Bottom legend */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto z-10 hidden md:block">
        <div className="backdrop-blur-md border rounded-xl px-5 py-2.5 flex items-center gap-5" style={{ background: panelBg, borderColor: 'var(--v3-border)' }}>
          {[
            { label: 'KNOWS', color: '#94A3B8' },
            { label: 'EMPLOYED_BY', color: '#F59E0B' },
            { label: 'SHARED_DOC', color: '#EF4444' },
            { label: 'SAME_MOBILE', color: '#EF4444' },
            { label: 'FOLLOWS', color: '#8B5CF6' },
            { label: 'LOCATED_AT', color: '#10B981' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 rounded-full" style={{ background: color }} />
              <span className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--v3-text-muted)' }}>{label.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats overlay */}
      <div className="absolute bottom-3 right-3 pointer-events-auto z-10">
        <div className="backdrop-blur-md border rounded-xl px-4 py-3 flex items-center gap-4" style={{ background: panelBg, borderColor: 'var(--v3-border)' }}>
          <div className="text-center">
            <div className="text-sm font-bold text-red-400">{NODES.filter(n => n.flagged).length}</div>
            <div className="text-[9px]" style={{ color: 'var(--v3-text-muted)' }}>Flagged</div>
          </div>
          <div className="w-px h-6" style={{ background: 'var(--v3-border)' }} />
          <div className="text-center">
            <div className="text-sm font-bold text-orange-400">{NODES.filter(n => n.riskScore >= 60).length}</div>
            <div className="text-[9px]" style={{ color: 'var(--v3-text-muted)' }}>High Risk</div>
          </div>
          <div className="w-px h-6" style={{ background: 'var(--v3-border)' }} />
          <div className="text-center">
            <div className="text-sm font-bold" style={{ color: 'var(--v3-accent)' }}>{LINKS.length}</div>
            <div className="text-[9px]" style={{ color: 'var(--v3-text-muted)' }}>Links</div>
          </div>
        </div>
      </div>

      {/* Dossier panel (right-click) */}
      <AnimatePresence>
        {dossierNode && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute top-0 right-0 w-80 h-full border-l z-20 overflow-y-auto v3-scrollbar"
            style={{ background: 'rgba(9,9,11,0.96)', borderColor: 'var(--v3-border)' }}
          >
            <div className="p-5 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {(() => { const Icon = TYPE_ICONS[dossierNode.type].icon; return <Icon size={14} style={{ color: 'var(--v3-text-muted)' }} />; })()}
                    <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--v3-text-muted)' }}>{TYPE_ICONS[dossierNode.type].label}</span>
                  </div>
                  <h3 className="text-base font-bold" style={{ color: 'var(--v3-text)' }}>{dossierNode.label}</h3>
                </div>
                <Button size="icon" variant="ghost" onClick={() => setDossierNode(null)}
                  className="w-7 h-7" style={{ color: 'var(--v3-text-muted)' }}>
                  <X size={14} />
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <div className={cn('text-2xl font-bold font-mono', riskColor(dossierNode.riskScore))}>
                  {dossierNode.riskScore}
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--v3-text-muted)' }}>Risk Score</div>
                  <div className="w-32 h-1.5 rounded-full mt-1 overflow-hidden" style={{ background: 'var(--v3-border)' }}>
                    <div className={cn('h-full rounded-full transition-all',
                      dossierNode.riskScore >= 80 ? 'bg-red-500' : dossierNode.riskScore >= 60 ? 'bg-orange-500' : dossierNode.riskScore >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                    )} style={{ width: `${dossierNode.riskScore}%` }} />
                  </div>
                </div>
                {dossierNode.flagged && (
                  <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] px-2 rounded-full">
                    <AlertTriangle size={10} className="mr-1" /> FLAGGED
                  </Badge>
                )}
              </div>

              <p className="text-xs leading-relaxed" style={{ color: 'var(--v3-text-secondary)' }}>{dossierNode.detail}</p>

              {(dossierNode.riskScore >= 60 || dossierNode.flagged) && (
                <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                    <FileWarning size={10} /> Risk Indicators
                  </p>
                  {dossierNode.id === 'ahmad' && (
                    <>
                      <p className="text-[11px]" style={{ color: 'var(--v3-text-secondary)' }}>• Visa Mill network membership confirmed</p>
                      <p className="text-[11px]" style={{ color: 'var(--v3-text-secondary)' }}>• Document hash match (Maris: DOC-IR-4892)</p>
                      <p className="text-[11px]" style={{ color: 'var(--v3-text-secondary)' }}>• Duplicate mobile correlation (vizesepetim.com)</p>
                      <p className="text-[11px]" style={{ color: 'var(--v3-text-secondary)' }}>• 3+ flagged associates in network</p>
                    </>
                  )}
                  {dossierNode.id === 'reza' && (
                    <>
                      <p className="text-[11px]" style={{ color: 'var(--v3-text-secondary)' }}>• EU Sanctions familial match</p>
                      <p className="text-[11px]" style={{ color: 'var(--v3-text-secondary)' }}>• Shared document hash with Ahmad</p>
                      <p className="text-[11px]" style={{ color: 'var(--v3-text-secondary)' }}>• Active in flagged Telegram groups</p>
                    </>
                  )}
                  {dossierNode.id !== 'ahmad' && dossierNode.id !== 'reza' && (
                    <p className="text-[11px]" style={{ color: 'var(--v3-text-secondary)' }}>• Elevated risk score based on network analysis</p>
                  )}
                </div>
              )}

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: 'var(--v3-text-muted)' }}>
                  <Link2 size={10} /> Connections ({dossierConnections.length})
                </p>
                <div className="space-y-1">
                  {dossierConnections.map((c, i) => (
                    <button key={i}
                      onClick={() => { if (c.other) { setDossierNode(c.other); handleNodeClick(c.other); } }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/5 text-left transition-colors"
                    >
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: EDGE_COLORS[c.edgeType] }} />
                      <span className="text-[11px] flex-1 truncate" style={{ color: 'var(--v3-text-secondary)' }}>{c.other?.label ?? '?'}</span>
                      <span className={cn('text-[9px] px-2 py-0.5 rounded-full border font-mono', riskBg(c.other?.riskScore ?? 0))}>
                        {c.other?.riskScore ?? 0}
                      </span>
                      <ChevronRight size={10} style={{ color: 'var(--v3-text-muted)' }} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--v3-border)' }}>
                {dossierNode.caseId && (
                  <Button variant="outline" size="sm" onClick={() => navigate(`/v3/cases/${dossierNode.caseId}`)}
                    className="w-full border rounded-xl text-xs justify-start gap-2"
                    style={{ background: 'var(--v3-accent-muted)', borderColor: 'var(--v3-border)', color: 'var(--v3-accent)' }}>
                    <ExternalLink size={12} /> Open in Case Detail
                  </Button>
                )}
                <Button variant="outline" size="sm"
                  className="w-full border rounded-xl text-xs justify-start gap-2"
                  style={{ borderColor: 'var(--v3-border)', color: 'var(--v3-text-secondary)' }}>
                  <Activity size={12} /> View Full Dossier
                </Button>
                <Button variant="outline" size="sm"
                  className="w-full bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-xl text-xs justify-start gap-2">
                  <AlertTriangle size={12} /> Flag Entity
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected node info (bottom-left) */}
      <AnimatePresence>
        {selectedNode && !dossierNode && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="absolute bottom-14 left-3 pointer-events-auto z-10"
          >
            <div className="backdrop-blur-md border rounded-xl p-4 w-64" style={{ background: panelBg, borderColor: 'var(--v3-border)' }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold" style={{ color: 'var(--v3-text)' }}>{selectedNode.label}</span>
                <span className={cn('text-xs font-bold font-mono', riskColor(selectedNode.riskScore))}>{selectedNode.riskScore}</span>
              </div>
              <p className="text-[10px] mb-2" style={{ color: 'var(--v3-text-muted)' }}>{selectedNode.detail}</p>
              <Button size="sm" variant="ghost" onClick={() => setDossierNode(selectedNode)}
                className="w-full text-[10px] h-7 hover:bg-white/5" style={{ color: 'var(--v3-accent)' }}>
                Open Dossier <ChevronRight size={10} className="ml-1" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
