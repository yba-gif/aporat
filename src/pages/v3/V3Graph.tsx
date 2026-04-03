import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import {
  AlertTriangle, Building2, User, Globe, MapPin, MessageCircle,
  ZoomIn, ZoomOut, RotateCcw, X,
  Shield, ExternalLink, ChevronRight, Crosshair,
  Network, Filter, Activity, Link2, FileWarning, Search,
  Route, MousePointer2, Clock, Map, Undo2, Redo2, Square,
  Download, EyeOff, Flag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

// ── Types ──
type NodeType = 'applicant' | 'person' | 'flagged_person' | 'organization' | 'social' | 'location';
type EdgeType = 'KNOWS' | 'CONNECTED_TO' | 'FOLLOWS' | 'EMPLOYED_BY' | 'LOCATED_AT' | 'SHARED_DOC' | 'SAME_MOBILE';

type InteractionMode = 'navigate' | 'pathfinder' | 'lasso';

interface GNode {
  id: string;
  label: string;
  type: NodeType;
  riskScore: number;
  detail: string;
  flagged?: boolean;
  caseId?: string;
  timestamp?: string; // ISO date for timeline filtering
  x?: number; y?: number; z?: number;
  fx?: number; fy?: number; fz?: number;
  __threeObj?: THREE.Group;
  _expanded?: boolean;
  _hidden?: boolean;
}

interface GLink {
  source: string | GNode;
  target: string | GNode;
  edgeType: EdgeType;
  weight: number;
  label?: string;
  timestamp?: string;
}

// ── Undo/Redo action ──
interface UndoAction {
  type: 'pin' | 'expand' | 'hide' | 'flag';
  nodeId: string;
  prev: any;
}

// ── V3 Color config ──
const NODE_HEX: Record<NodeType, number> = {
  applicant:      0xA78BFA,
  person:         0x71717A,
  flagged_person: 0xF87171,
  organization:   0x818CF8,
  social:         0xA78BFA,
  location:       0x4ADE80,
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

// ── Network data ──
const NODES: GNode[] = [
  { id: 'ahmad', label: 'Ahmad Rezaee', type: 'applicant', riskScore: 94, detail: 'Primary subject — Iranian national, Visa Mill network member. Score: 94/100.', flagged: true, caseId: 'PL-2026-00101', timestamp: '2025-11-15' },
  { id: 'reza', label: 'Reza Mohammadi', type: 'flagged_person', riskScore: 82, detail: 'EU Sanctions familial match. Shared document hashes with Ahmad.', flagged: true, timestamp: '2025-10-02' },
  { id: 'fatima', label: 'Fatima Al-Rashid', type: 'flagged_person', riskScore: 74, detail: 'Connected to 2 previously denied cases. Duplicate mobile hash.', flagged: true, timestamp: '2025-12-18' },
  { id: 'mehdi', label: 'Mehdi Hosseini', type: 'person', riskScore: 35, detail: 'Previously cleared applicant. Low-risk connection.', timestamp: '2025-06-10' },
  { id: 'sara', label: 'Sara Nazari', type: 'person', riskScore: 22, detail: 'Reference contact. No adverse records.', timestamp: '2025-05-20' },
  { id: 'ali', label: 'Ali Karimi', type: 'person', riskScore: 45, detail: 'Travel companion — VIS-2026-0987. Medium risk.', timestamp: '2025-09-05' },
  { id: 'yusuf', label: 'Yusuf Demir', type: 'person', riskScore: 18, detail: 'Turkish national — legitimate business contact.', timestamp: '2025-03-15' },
  { id: 'dmitri', label: 'Dmitri Volkov', type: 'flagged_person', riskScore: 68, detail: 'Visa coaching channel operator. OSINT flagged.', flagged: true, timestamp: '2025-08-22' },
  { id: 'elena', label: 'Elena Sokolova', type: 'person', riskScore: 72, detail: 'Employment history inconsistencies. IP mismatch.', timestamp: '2025-07-14' },
  { id: 'parham', label: 'Parham Trading Co.', type: 'organization', riskScore: 65, detail: 'Import/export — Tehran. Shell company indicators.', timestamp: '2025-04-01' },
  { id: 'silk', label: 'Silk Road Logistics', type: 'organization', riskScore: 58, detail: 'Shipping & logistics — Istanbul. Under review.', timestamp: '2025-02-10' },
  { id: 'crescent', label: 'Crescent Finance Ltd.', type: 'organization', riskScore: 71, detail: 'Financial services — Beirut. Linked to sanctioned entities.', timestamp: '2025-06-28' },
  { id: 'visa_mill', label: 'Visa Mill Network', type: 'organization', riskScore: 92, detail: 'Organized visa fraud ring. 14 linked applicants across 3 consulates.', flagged: true, timestamp: '2025-01-15' },
  { id: 'ig_ahmad', label: '@ahmad_r_88', type: 'social', riskScore: 40, detail: 'Instagram — 1,240 followers. Coaching content detected.', timestamp: '2025-10-30' },
  { id: 'tg_reza', label: '@rezam_official', type: 'social', riskScore: 55, detail: 'Telegram — active in 3 flagged groups.', timestamp: '2025-09-15' },
  { id: 'tg_trade', label: 'TG: Iran-Turkey Trade', type: 'social', riskScore: 48, detail: 'Telegram group — 450 members. Visa discussion flagged.', timestamp: '2025-07-01' },
  { id: 'tg_coaching', label: 'TG: Visa Coaching Hub', type: 'social', riskScore: 78, detail: 'Visa coaching Telegram channel — run by Dmitri.', flagged: true, timestamp: '2025-08-10' },
  { id: 'tehran', label: 'Tehran, Iran', type: 'location', riskScore: 30, detail: 'Primary residence of Ahmad. High-risk origin.', timestamp: '2025-01-01' },
  { id: 'istanbul', label: 'Istanbul, Turkey', type: 'location', riskScore: 20, detail: 'Frequent travel destination. 4 visits in 2025.', timestamp: '2025-01-01' },
  { id: 'beirut', label: 'Beirut, Lebanon', type: 'location', riskScore: 35, detail: 'Crescent Finance HQ. Transit point.', timestamp: '2025-01-01' },
  { id: 'dubai', label: 'Dubai, UAE', type: 'location', riskScore: 15, detail: 'Transit hub — 3 visits in 2024.', timestamp: '2025-01-01' },
  { id: 'doc_passport', label: 'DOC: Passport IR-4892', type: 'organization', riskScore: 80, detail: 'Document hash match — Maris flagged. Shared across 2 applicants.', timestamp: '2025-11-01' },
  { id: 'mobile_hash', label: 'Mobile: +98***1247', type: 'social', riskScore: 85, detail: 'Duplicate mobile number hash. vizesepetim.com correlation.', timestamp: '2025-11-10' },
];

// 2nd-degree expansion data
const EXPANSION_NODES: Record<string, GNode[]> = {
  dmitri: [
    { id: 'nikolai', label: 'Nikolai Petrov', type: 'person', riskScore: 52, detail: '2nd-degree — known associate of Dmitri via Telegram.', timestamp: '2025-09-01' },
    { id: 'anna', label: 'Anna Kuznetsova', type: 'person', riskScore: 38, detail: '2nd-degree — Dmitri\'s business partner in Istanbul.', timestamp: '2025-10-15' },
  ],
  fatima: [
    { id: 'omar', label: 'Omar Hassan', type: 'flagged_person', riskScore: 66, detail: '2nd-degree — previously denied applicant, shared address.', flagged: true, timestamp: '2025-12-01' },
  ],
  reza: [
    { id: 'hassan', label: 'Hassan Ghorbani', type: 'person', riskScore: 44, detail: '2nd-degree — co-worker at Parham Trading.', timestamp: '2025-08-05' },
  ],
};

const EXPANSION_LINKS: Record<string, GLink[]> = {
  dmitri: [
    { source: 'dmitri', target: 'nikolai', edgeType: 'KNOWS', weight: 0.6, timestamp: '2025-09-01' },
    { source: 'dmitri', target: 'anna', edgeType: 'KNOWS', weight: 0.5, timestamp: '2025-10-15' },
    { source: 'nikolai', target: 'anna', edgeType: 'CONNECTED_TO', weight: 0.3, timestamp: '2025-10-20' },
  ],
  fatima: [
    { source: 'fatima', target: 'omar', edgeType: 'KNOWS', weight: 0.7, timestamp: '2025-12-01' },
    { source: 'omar', target: 'visa_mill', edgeType: 'CONNECTED_TO', weight: 0.6, label: 'Suspected', timestamp: '2025-12-05' },
  ],
  reza: [
    { source: 'reza', target: 'hassan', edgeType: 'KNOWS', weight: 0.5, timestamp: '2025-08-05' },
    { source: 'hassan', target: 'parham', edgeType: 'EMPLOYED_BY', weight: 0.8, timestamp: '2025-08-06' },
  ],
};

const BASE_LINKS: GLink[] = [
  { source: 'ahmad', target: 'reza', edgeType: 'KNOWS', weight: 0.9, label: 'Known associate', timestamp: '2025-10-02' },
  { source: 'ahmad', target: 'fatima', edgeType: 'KNOWS', weight: 0.7, timestamp: '2025-12-18' },
  { source: 'ahmad', target: 'mehdi', edgeType: 'KNOWS', weight: 0.5, timestamp: '2025-06-10' },
  { source: 'ahmad', target: 'sara', edgeType: 'KNOWS', weight: 0.3, timestamp: '2025-05-20' },
  { source: 'ahmad', target: 'ali', edgeType: 'KNOWS', weight: 0.7, timestamp: '2025-09-05' },
  { source: 'ahmad', target: 'parham', edgeType: 'EMPLOYED_BY', weight: 0.8, timestamp: '2025-04-01' },
  { source: 'ahmad', target: 'visa_mill', edgeType: 'CONNECTED_TO', weight: 0.95, label: 'Member', timestamp: '2025-01-15' },
  { source: 'ahmad', target: 'ig_ahmad', edgeType: 'CONNECTED_TO', weight: 0.5, timestamp: '2025-10-30' },
  { source: 'ahmad', target: 'tehran', edgeType: 'LOCATED_AT', weight: 1.0, timestamp: '2025-01-01' },
  { source: 'ahmad', target: 'istanbul', edgeType: 'LOCATED_AT', weight: 0.6, timestamp: '2025-03-01' },
  { source: 'ahmad', target: 'dubai', edgeType: 'LOCATED_AT', weight: 0.4, timestamp: '2025-05-01' },
  { source: 'ahmad', target: 'doc_passport', edgeType: 'SHARED_DOC', weight: 0.95, label: 'Hash match', timestamp: '2025-11-01' },
  { source: 'ahmad', target: 'mobile_hash', edgeType: 'SAME_MOBILE', weight: 0.9, label: 'Duplicate mobile', timestamp: '2025-11-10' },
  { source: 'reza', target: 'fatima', edgeType: 'KNOWS', weight: 0.8, timestamp: '2025-10-15' },
  { source: 'reza', target: 'parham', edgeType: 'EMPLOYED_BY', weight: 0.7, timestamp: '2025-04-01' },
  { source: 'reza', target: 'crescent', edgeType: 'CONNECTED_TO', weight: 0.5, timestamp: '2025-06-28' },
  { source: 'reza', target: 'tg_reza', edgeType: 'CONNECTED_TO', weight: 0.6, timestamp: '2025-09-15' },
  { source: 'reza', target: 'visa_mill', edgeType: 'CONNECTED_TO', weight: 0.85, label: 'Member', timestamp: '2025-02-01' },
  { source: 'reza', target: 'doc_passport', edgeType: 'SHARED_DOC', weight: 0.9, label: 'Hash match', timestamp: '2025-11-01' },
  { source: 'reza', target: 'mobile_hash', edgeType: 'SAME_MOBILE', weight: 0.85, timestamp: '2025-11-10' },
  { source: 'fatima', target: 'silk', edgeType: 'EMPLOYED_BY', weight: 0.9, timestamp: '2025-02-10' },
  { source: 'fatima', target: 'beirut', edgeType: 'LOCATED_AT', weight: 0.8, timestamp: '2025-01-01' },
  { source: 'fatima', target: 'visa_mill', edgeType: 'CONNECTED_TO', weight: 0.75, label: 'Suspected member', timestamp: '2025-03-01' },
  { source: 'dmitri', target: 'tg_coaching', edgeType: 'CONNECTED_TO', weight: 0.95, label: 'Operator', timestamp: '2025-08-10' },
  { source: 'dmitri', target: 'visa_mill', edgeType: 'CONNECTED_TO', weight: 0.7, timestamp: '2025-04-15' },
  { source: 'dmitri', target: 'elena', edgeType: 'KNOWS', weight: 0.6, timestamp: '2025-07-14' },
  { source: 'elena', target: 'istanbul', edgeType: 'LOCATED_AT', weight: 0.7, timestamp: '2025-01-01' },
  { source: 'elena', target: 'silk', edgeType: 'EMPLOYED_BY', weight: 0.5, timestamp: '2025-07-14' },
  { source: 'ali', target: 'silk', edgeType: 'EMPLOYED_BY', weight: 0.6, timestamp: '2025-09-05' },
  { source: 'ali', target: 'istanbul', edgeType: 'LOCATED_AT', weight: 0.5, timestamp: '2025-01-01' },
  { source: 'yusuf', target: 'silk', edgeType: 'EMPLOYED_BY', weight: 0.8, timestamp: '2025-02-10' },
  { source: 'yusuf', target: 'istanbul', edgeType: 'LOCATED_AT', weight: 1.0, timestamp: '2025-01-01' },
  { source: 'mehdi', target: 'istanbul', edgeType: 'LOCATED_AT', weight: 0.7, timestamp: '2025-01-01' },
  { source: 'parham', target: 'tehran', edgeType: 'LOCATED_AT', weight: 1.0, timestamp: '2025-01-01' },
  { source: 'silk', target: 'istanbul', edgeType: 'LOCATED_AT', weight: 1.0, timestamp: '2025-01-01' },
  { source: 'crescent', target: 'beirut', edgeType: 'LOCATED_AT', weight: 1.0, timestamp: '2025-01-01' },
  { source: 'crescent', target: 'dubai', edgeType: 'LOCATED_AT', weight: 0.5, timestamp: '2025-05-01' },
  { source: 'ig_ahmad', target: 'tg_trade', edgeType: 'FOLLOWS', weight: 0.4, timestamp: '2025-07-01' },
  { source: 'tg_reza', target: 'tg_trade', edgeType: 'FOLLOWS', weight: 0.6, timestamp: '2025-07-15' },
  { source: 'tg_reza', target: 'tg_coaching', edgeType: 'FOLLOWS', weight: 0.5, timestamp: '2025-08-20' },
  { source: 'ahmad', target: 'yusuf', edgeType: 'CONNECTED_TO', weight: 0.3, timestamp: '2025-03-15' },
  { source: 'ahmad', target: 'elena', edgeType: 'CONNECTED_TO', weight: 0.4, label: 'IP overlap', timestamp: '2025-07-14' },
];

// ── BFS shortest path ──
function bfsAllShortestPaths(
  nodes: GNode[],
  links: GLink[],
  sourceId: string,
  targetId: string
): string[][] {
  const adj: Record<string, { neighbor: string; }[]> = {};
  for (const n of nodes) adj[n.id] = [];
  for (const l of links) {
    const s = typeof l.source === 'string' ? l.source : l.source.id;
    const t = typeof l.target === 'string' ? l.target : l.target.id;
    adj[s]?.push({ neighbor: t });
    adj[t]?.push({ neighbor: s });
  }

  const dist: Record<string, number> = {};
  const parents: Record<string, string[]> = {};
  dist[sourceId] = 0;
  parents[sourceId] = [];
  const queue = [sourceId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const d = dist[current];
    if (current === targetId) break;
    for (const { neighbor } of adj[current] || []) {
      const nd = dist[neighbor];
      if (nd === undefined) {
        dist[neighbor] = d + 1;
        parents[neighbor] = [current];
        queue.push(neighbor);
      } else if (nd === d + 1) {
        parents[neighbor].push(current);
      }
    }
  }

  if (dist[targetId] === undefined) return [];

  // Reconstruct all shortest paths
  const paths: string[][] = [];
  const buildPath = (node: string, path: string[]) => {
    path.unshift(node);
    if (node === sourceId) {
      paths.push([...path]);
    } else {
      for (const p of parents.get(node) || []) {
        buildPath(p, path);
      }
    }
    path.shift();
  };
  buildPath(targetId, []);
  return paths.slice(0, 5); // max 5 paths
}

// ── Geometry cache ──
const geoCache = new Map<string, THREE.BufferGeometry>();
function getGeometry(type: NodeType, size: number): THREE.BufferGeometry {
  const key = `${type}-${size}`;
  if (geoCache.has(key)) return geoCache.get(key)!;
  let geo: THREE.BufferGeometry;
  switch (type) {
    case 'applicant':      geo = new THREE.OctahedronGeometry(size * 1.3, 1); break;
    case 'flagged_person': geo = new THREE.OctahedronGeometry(size, 0); break;
    case 'organization':   geo = new THREE.BoxGeometry(size * 1.6, size * 1.6, size * 1.6); break;
    case 'social':         geo = new THREE.CylinderGeometry(size * 0.8, size * 0.8, size * 0.6, 6); break;
    case 'location':       geo = new THREE.ConeGeometry(size * 0.9, size * 1.6, 4); break;
    default:               geo = new THREE.SphereGeometry(size, 16, 16); break;
  }
  geoCache.set(key, geo);
  return geo;
}

// ── Label texture cache ──
const labelCache = new Map<string, THREE.Texture>();
function getLabelTexture(label: string, riskScore: number): THREE.Texture {
  const key = `${label}-${riskScore}`;
  if (labelCache.has(key)) return labelCache.get(key)!;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = 256;
  canvas.height = 64;
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(226,232,240,0.9)';
  ctx.fillText(label.length > 18 ? label.slice(0, 16) + '…' : label, 128, 28);
  if (riskScore >= 70) {
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#f87171';
    ctx.fillText(`⚠ ${riskScore}`, 128, 52);
  }
  const texture = new THREE.CanvasTexture(canvas);
  labelCache.set(key, texture);
  return texture;
}

// Timeline bounds
const TIMELINE_MIN = new Date('2025-01-01').getTime();
const TIMELINE_MAX = new Date('2026-01-01').getTime();

// ── Component ──
export default function V3Graph() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 800, height: 600 });
  const [selectedNode, setSelectedNode] = useState<GNode | null>(null);
  const [dossierNode, setDossierNode] = useState<GNode | null>(null);
  const [search, setSearch] = useState('');
  const [showParticles, setShowParticles] = useState(true);
  const [showRiskPaths, setShowRiskPaths] = useState(true);
  const [highlightRisk, setHighlightRisk] = useState(true);
  const [visibleTypes, setVisibleTypes] = useState<Set<NodeType>>(
    new Set(['applicant', 'person', 'flagged_person', 'organization', 'social', 'location'])
  );

  // ── Feature states ──
  const [mode, setMode] = useState<InteractionMode>('navigate');
  
  // Path finder
  const [pathSource, setPathSource] = useState<string | null>(null);
  const [pathTarget, setPathTarget] = useState<string | null>(null);
  const [foundPaths, setFoundPaths] = useState<string[][]>([]);
  const [activePathIdx, setActivePathIdx] = useState(0);
  const pathNodeIds = useMemo(() => {
    if (foundPaths.length === 0) return new Set<string>();
    return new Set(foundPaths[activePathIdx] || []);
  }, [foundPaths, activePathIdx]);
  const pathEdgeKeys = useMemo(() => {
    if (foundPaths.length === 0) return new Set<string>();
    const path = foundPaths[activePathIdx] || [];
    const keys = new Set<string>();
    for (let i = 0; i < path.length - 1; i++) {
      keys.add(`${path[i]}-${path[i + 1]}`);
      keys.add(`${path[i + 1]}-${path[i]}`);
    }
    return keys;
  }, [foundPaths, activePathIdx]);

  // Timeline
  const [timelineValue, setTimelineValue] = useState([TIMELINE_MAX]);
  const [showTimeline, setShowTimeline] = useState(false);

  // Lasso selection
  const [lassoStart, setLassoStart] = useState<{ x: number; y: number } | null>(null);
  const [lassoEnd, setLassoEnd] = useState<{ x: number; y: number } | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [hiddenNodes, setHiddenNodes] = useState<Set<string>>(new Set());

  // Double-click expand
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [extraNodes, setExtraNodes] = useState<GNode[]>([]);
  const [extraLinks, setExtraLinks] = useState<GLink[]>([]);

  // Undo/redo
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  const [redoStack, setRedoStack] = useState<UndoAction[]>([]);

  // Minimap
  const [showMinimap, setShowMinimap] = useState(true);
  const minimapCanvasRef = useRef<HTMLCanvasElement>(null);

  // Resize observer
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

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        performUndo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        performRedo();
      }
      if (e.key === 'Escape') {
        setMode('navigate');
        setPathSource(null);
        setPathTarget(null);
        setFoundPaths([]);
        setSelectedNodes(new Set());
        setLassoStart(null);
        setLassoEnd(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undoStack, redoStack]);

  const pushUndo = useCallback((action: UndoAction) => {
    setUndoStack(prev => [...prev.slice(-29), action]);
    setRedoStack([]);
  }, []);

  const performUndo = useCallback(() => {
    setUndoStack(prev => {
      if (prev.length === 0) return prev;
      const action = prev[prev.length - 1];
      setRedoStack(r => [...r, action]);
      // Reverse action
      if (action.type === 'pin') {
        const node = [...NODES, ...extraNodes].find(n => n.id === action.nodeId);
        if (node) { node.fx = action.prev.fx; node.fy = action.prev.fy; node.fz = action.prev.fz; }
      }
      if (action.type === 'hide') {
        setHiddenNodes(h => { const next = new Set(h); action.prev ? next.add(action.nodeId) : next.delete(action.nodeId); return next; });
      }
      if (action.type === 'expand') {
        setExpandedNodes(e => { const next = new Set(e); next.delete(action.nodeId); return next; });
        setExtraNodes(n => n.filter(x => !EXPANSION_NODES[action.nodeId]?.some(en => en.id === x.id)));
        setExtraLinks(l => l.filter(x => !EXPANSION_LINKS[action.nodeId]?.some(el => {
          const es = typeof el.source === 'string' ? el.source : el.source.id;
          const et = typeof el.target === 'string' ? el.target : el.target.id;
          const xs = typeof x.source === 'string' ? x.source : x.source.id;
          const xt = typeof x.target === 'string' ? x.target : x.target.id;
          return es === xs && et === xt;
        })));
      }
      return prev.slice(0, -1);
    });
  }, [extraNodes]);

  const performRedo = useCallback(() => {
    setRedoStack(prev => {
      if (prev.length === 0) return prev;
      const action = prev[prev.length - 1];
      setUndoStack(u => [...u, action]);
      if (action.type === 'hide') {
        setHiddenNodes(h => { const next = new Set(h); action.prev ? next.delete(action.nodeId) : next.add(action.nodeId); return next; });
      }
      if (action.type === 'expand') {
        expandNode(action.nodeId, true);
      }
      return prev.slice(0, -1);
    });
  }, []);

  // ── All nodes/links combined ──
  const allNodes = useMemo(() => [...NODES, ...extraNodes], [extraNodes]);
  const allLinks = useMemo(() => [...BASE_LINKS, ...extraLinks], [extraLinks]);

  // Filter graph data
  const graphData = useMemo(() => {
    let filteredNodes = allNodes.filter(n => visibleTypes.has(n.type) && !hiddenNodes.has(n.id));
    if (search) {
      const q = search.toLowerCase();
      filteredNodes = filteredNodes.filter(n =>
        n.label.toLowerCase().includes(q) || n.detail.toLowerCase().includes(q)
      );
    }
    // Timeline filter
    if (showTimeline) {
      const cutoff = timelineValue[0];
      filteredNodes = filteredNodes.filter(n => {
        if (!n.timestamp) return true;
        return new Date(n.timestamp).getTime() <= cutoff;
      });
    }
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = allLinks.filter(l => {
      const s = typeof l.source === 'string' ? l.source : l.source.id;
      const t = typeof l.target === 'string' ? l.target : l.target.id;
      if (!nodeIds.has(s) || !nodeIds.has(t)) return false;
      if (showTimeline && l.timestamp) {
        return new Date(l.timestamp).getTime() <= timelineValue[0];
      }
      return true;
    });
    return { nodes: filteredNodes, links: filteredLinks };
  }, [visibleTypes, search, hiddenNodes, allNodes, allLinks, showTimeline, timelineValue]);

  const riskNodeIds = useMemo(() => {
    if (!showRiskPaths) return new Set<string>();
    const flaggedIds = allNodes.filter(n => n.flagged).map(n => n.id);
    const all = new Set<string>(flaggedIds);
    for (const l of allLinks) {
      const s = typeof l.source === 'string' ? l.source : l.source.id;
      const t = typeof l.target === 'string' ? l.target : l.target.id;
      if (flaggedIds.includes(s)) all.add(t);
      if (flaggedIds.includes(t)) all.add(s);
    }
    return all;
  }, [showRiskPaths, allNodes, allLinks]);

  // Expandable nodes (have expansion data)
  const expandableNodes = useMemo(() => new Set(Object.keys(EXPANSION_NODES)), []);

  const nodeThreeObject = useCallback((node: GNode) => {
    const size = NODE_SIZE[node.type];
    const color = NODE_HEX[node.type];
    const isRiskPath = highlightRisk && riskNodeIds.has(node.id);
    const isPathNode = pathNodeIds.has(node.id);
    const isSelected = selectedNodes.has(node.id);
    const isExpandable = expandableNodes.has(node.id) && !expandedNodes.has(node.id);
    const isPathEndpoint = node.id === pathSource || node.id === pathTarget;

    const group = new THREE.Group();

    const geo = getGeometry(node.type, size);
    const mat = new THREE.MeshPhongMaterial({
      color: isPathNode ? 0xfbbf24 : color,
      transparent: true,
      opacity: (mode === 'pathfinder' && foundPaths.length > 0 && !isPathNode) ? 0.15 : 0.92,
      emissive: isPathEndpoint ? 0x22d3ee : node.flagged ? 0xf87171 : (isRiskPath ? 0xfbbf24 : 0x000000),
      emissiveIntensity: isPathEndpoint ? 0.5 : node.flagged ? 0.35 : (isRiskPath ? 0.15 : 0),
      shininess: 80,
    });
    const mesh = new THREE.Mesh(geo, mat);
    group.add(mesh);

    // Flagged ring
    if (node.flagged) {
      const ringGeo = new THREE.RingGeometry(size * 1.6, size * 2.0, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf87171, side: THREE.DoubleSide, transparent: true, opacity: 0.35,
      });
      group.add(new THREE.Mesh(ringGeo, ringMat));
    }

    // Path endpoint marker
    if (isPathEndpoint) {
      const ringGeo = new THREE.RingGeometry(size * 2.0, size * 2.5, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee, side: THREE.DoubleSide, transparent: true, opacity: 0.6,
      });
      group.add(new THREE.Mesh(ringGeo, ringMat));
    }

    // Lasso selection indicator
    if (isSelected) {
      const ringGeo = new THREE.RingGeometry(size * 1.8, size * 2.2, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xa78bfa, side: THREE.DoubleSide, transparent: true, opacity: 0.7,
      });
      group.add(new THREE.Mesh(ringGeo, ringMat));
    }

    // Expandable indicator (pulsing dot)
    if (isExpandable) {
      const dotGeo = new THREE.SphereGeometry(2, 8, 8);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.8 });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(size * 1.5, size * 1.5, 0);
      group.add(dot);
    }

    // Label sprite
    const texture = getLabelTexture(node.label, node.riskScore);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.set(0, size * 2.2, 0);
    sprite.scale.set(28, 7, 1);
    group.add(sprite);

    return group;
  }, [highlightRisk, riskNodeIds, pathNodeIds, pathSource, pathTarget, mode, foundPaths, selectedNodes, expandableNodes, expandedNodes]);

  const linkColor = useCallback((link: GLink) => {
    // Path highlighting
    if (foundPaths.length > 0) {
      const s = typeof link.source === 'string' ? link.source : link.source.id;
      const t = typeof link.target === 'string' ? link.target : link.target.id;
      if (pathEdgeKeys.has(`${s}-${t}`)) return 'rgba(251,191,36,0.9)';
      return 'rgba(113,113,122,0.08)';
    }
    if (link.edgeType === 'SHARED_DOC' || link.edgeType === 'SAME_MOBILE') return 'rgba(239,68,68,0.7)';
    return EDGE_COLORS[link.edgeType] || 'rgba(226,232,240,0.1)';
  }, [foundPaths, pathEdgeKeys]);

  const linkWidth = useCallback((link: GLink) => {
    if (foundPaths.length > 0) {
      const s = typeof link.source === 'string' ? link.source : link.source.id;
      const t = typeof link.target === 'string' ? link.target : link.target.id;
      if (pathEdgeKeys.has(`${s}-${t}`)) return 4;
      return 0.3;
    }
    if (link.edgeType === 'SHARED_DOC' || link.edgeType === 'SAME_MOBILE') return 2.5;
    return link.weight * 2;
  }, [foundPaths, pathEdgeKeys]);

  // ── Expand node ──
  const expandNode = useCallback((nodeId: string, skipUndo = false) => {
    if (expandedNodes.has(nodeId)) return;
    const newNodes = EXPANSION_NODES[nodeId];
    const newLinks = EXPANSION_LINKS[nodeId];
    if (!newNodes) return;
    
    setExpandedNodes(prev => new Set([...prev, nodeId]));
    setExtraNodes(prev => [...prev, ...newNodes.filter(n => !prev.some(p => p.id === n.id))]);
    setExtraLinks(prev => [...prev, ...newLinks]);
    
    if (!skipUndo) {
      pushUndo({ type: 'expand', nodeId, prev: null });
    }
  }, [expandedNodes, pushUndo]);

  // ── Click handler ──
  const handleNodeClick = useCallback((node: GNode) => {
    if (mode === 'pathfinder') {
      if (!pathSource) {
        setPathSource(node.id);
        setFoundPaths([]);
      } else if (!pathTarget && node.id !== pathSource) {
        setPathTarget(node.id);
        // Compute paths
        const paths = bfsAllShortestPaths(graphData.nodes, graphData.links, pathSource, node.id);
        setFoundPaths(paths);
        setActivePathIdx(0);
      } else {
        // Reset
        setPathSource(node.id);
        setPathTarget(null);
        setFoundPaths([]);
      }
      return;
    }

    setSelectedNode(prev => prev?.id === node.id ? null : node);
    const fg = graphRef.current;
    if (fg && node.x != null && node.y != null && node.z != null) {
      const dist = 120;
      const ratio = 1 + dist / Math.hypot(node.x, node.y, node.z || 1);
      fg.cameraPosition(
        { x: node.x * ratio, y: node.y * ratio, z: node.z * ratio },
        { x: node.x, y: node.y, z: node.z },
        800
      );
    }
  }, [mode, pathSource, pathTarget, graphData]);

  const handleNodeRightClick = useCallback((node: GNode, event: MouseEvent) => {
    event.preventDefault();
    setDossierNode(node);
  }, []);

  // ── Double-click expand ──
  const handleNodeDoubleClick = useCallback((node: GNode) => {
    if (mode !== 'navigate') return;
    expandNode(node.id);
  }, [mode, expandNode]);

  const handleNodeDragEnd = useCallback((node: GNode) => {
    pushUndo({ type: 'pin', nodeId: node.id, prev: { fx: node.fx, fy: node.fy, fz: node.fz } });
    node.fx = node.x;
    node.fy = node.y;
    node.fz = node.z;
  }, [pushUndo]);

  // ── Lasso logic ──
  const handleContainerMouseDown = useCallback((e: React.MouseEvent) => {
    if (mode !== 'lasso') return;
    setLassoStart({ x: e.clientX, y: e.clientY });
    setLassoEnd(null);
  }, [mode]);

  const handleContainerMouseMove = useCallback((e: React.MouseEvent) => {
    if (mode !== 'lasso' || !lassoStart) return;
    setLassoEnd({ x: e.clientX, y: e.clientY });
  }, [mode, lassoStart]);

  const handleContainerMouseUp = useCallback(() => {
    if (mode !== 'lasso' || !lassoStart || !lassoEnd) {
      setLassoStart(null);
      return;
    }

    // Convert screen coords to select nodes
    const fg = graphRef.current;
    if (!fg) { setLassoStart(null); return; }

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) { setLassoStart(null); return; }

    const minX = Math.min(lassoStart.x, lassoEnd.x) - rect.left;
    const maxX = Math.max(lassoStart.x, lassoEnd.x) - rect.left;
    const minY = Math.min(lassoStart.y, lassoEnd.y) - rect.top;
    const maxY = Math.max(lassoStart.y, lassoEnd.y) - rect.top;

    const selected = new Set<string>();
    for (const node of graphData.nodes) {
      if (node.x == null || node.y == null || node.z == null) continue;
      const screenPos = fg.graph2ScreenCoords(node.x, node.y, node.z);
      if (screenPos.x >= minX && screenPos.x <= maxX && screenPos.y >= minY && screenPos.y <= maxY) {
        selected.add(node.id);
      }
    }
    setSelectedNodes(selected);
    setLassoStart(null);
    setLassoEnd(null);
  }, [mode, lassoStart, lassoEnd, graphData]);

  // Bulk actions
  const bulkHide = useCallback(() => {
    selectedNodes.forEach(id => pushUndo({ type: 'hide', nodeId: id, prev: false }));
    setHiddenNodes(prev => new Set([...prev, ...selectedNodes]));
    setSelectedNodes(new Set());
  }, [selectedNodes, pushUndo]);

  const bulkFlag = useCallback(() => {
    selectedNodes.forEach(id => {
      const node = allNodes.find(n => n.id === id);
      if (node) node.flagged = true;
    });
    setSelectedNodes(new Set());
  }, [selectedNodes, allNodes]);

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
    setMode('navigate');
    setPathSource(null);
    setPathTarget(null);
    setFoundPaths([]);
    setSelectedNodes(new Set());
    setHiddenNodes(new Set());
    allNodes.forEach(n => { n.fx = undefined; n.fy = undefined; n.fz = undefined; });
  };

  const zoomIn = () => graphRef.current?.cameraPosition({ x: 0, y: 0, z: 150 }, undefined, 600);
  const zoomOut = () => graphRef.current?.cameraPosition({ x: 0, y: 0, z: 500 }, undefined, 600);

  const dossierConnections = useMemo(() => {
    if (!dossierNode) return [];
    return allLinks
      .filter(l => {
        const s = typeof l.source === 'string' ? l.source : l.source.id;
        const t = typeof l.target === 'string' ? l.target : l.target.id;
        return s === dossierNode.id || t === dossierNode.id;
      })
      .map(l => {
        const s = typeof l.source === 'string' ? l.source : l.source.id;
        const t = typeof l.target === 'string' ? l.target : l.target.id;
        const otherId = s === dossierNode!.id ? t : s;
        const other = allNodes.find(n => n.id === otherId);
        return { ...l, other };
      });
  }, [dossierNode, allLinks, allNodes]);

  // ── Minimap rendering ──
  useEffect(() => {
    if (!showMinimap || !minimapCanvasRef.current) return;
    const canvas = minimapCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, 160, 120);
      ctx.fillStyle = 'rgba(9,9,11,0.85)';
      ctx.fillRect(0, 0, 160, 120);

      const nodes = graphData.nodes.filter(n => n.x != null && n.y != null);
      if (nodes.length === 0) return;

      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const n of nodes) {
        if (n.x! < minX) minX = n.x!;
        if (n.x! > maxX) maxX = n.x!;
        if (n.y! < minY) minY = n.y!;
        if (n.y! > maxY) maxY = n.y!;
      }
      const pad = 20;
      const rangeX = (maxX - minX) || 1;
      const rangeY = (maxY - minY) || 1;

      // Draw edges
      ctx.strokeStyle = 'rgba(113,113,122,0.15)';
      ctx.lineWidth = 0.5;
      for (const l of graphData.links) {
        const s = typeof l.source === 'object' ? l.source : nodes.find(n => n.id === l.source);
        const t = typeof l.target === 'object' ? l.target : nodes.find(n => n.id === l.target);
        if (!s?.x || !t?.x) continue;
        const sx = pad + ((s.x! - minX) / rangeX) * (160 - 2 * pad);
        const sy = pad + ((s.y! - minY) / rangeY) * (120 - 2 * pad);
        const tx = pad + ((t.x! - minX) / rangeX) * (160 - 2 * pad);
        const ty = pad + ((t.y! - minY) / rangeY) * (120 - 2 * pad);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.stroke();
      }

      // Draw nodes
      for (const n of nodes) {
        const x = pad + ((n.x! - minX) / rangeX) * (160 - 2 * pad);
        const y = pad + ((n.y! - minY) / rangeY) * (120 - 2 * pad);
        ctx.beginPath();
        ctx.arc(x, y, n.flagged ? 3 : 2, 0, Math.PI * 2);
        const hexColor = NODE_HEX[n.type];
        ctx.fillStyle = `#${hexColor.toString(16).padStart(6, '0')}`;
        ctx.fill();
      }
    };

    const interval = setInterval(render, 500);
    render();
    return () => clearInterval(interval);
  }, [showMinimap, graphData]);

  // Timeline event density histogram
  const timelineHistogram = useMemo(() => {
    if (!showTimeline) return [];
    const bins = 24;
    const binSize = (TIMELINE_MAX - TIMELINE_MIN) / bins;
    const counts = new Array(bins).fill(0);
    for (const n of allNodes) {
      if (!n.timestamp) continue;
      const t = new Date(n.timestamp).getTime();
      const bin = Math.min(Math.floor((t - TIMELINE_MIN) / binSize), bins - 1);
      counts[bin]++;
    }
    for (const l of allLinks) {
      if (!l.timestamp) continue;
      const t = new Date(l.timestamp).getTime();
      const bin = Math.min(Math.floor((t - TIMELINE_MIN) / binSize), bins - 1);
      counts[bin]++;
    }
    const max = Math.max(...counts, 1);
    return counts.map(c => c / max);
  }, [showTimeline, allNodes, allLinks]);

  const riskColor = (score: number) =>
    score >= 80 ? 'text-red-400' : score >= 60 ? 'text-orange-400' : score >= 40 ? 'text-amber-400' : 'text-green-400';

  const riskBg = (score: number) =>
    score >= 80 ? 'bg-red-500/20 text-red-400 border-red-500/30' : score >= 60 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : score >= 40 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30';

  const panelBg = 'rgba(24,24,27,0.92)';

  const timelineDate = new Date(timelineValue[0]);
  const timelineLabel = `${timelineDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      ref={containerRef}
      style={{ background: '#09090b', cursor: mode === 'lasso' ? 'crosshair' : mode === 'pathfinder' ? 'pointer' : 'default' }}
      onMouseDown={handleContainerMouseDown}
      onMouseMove={handleContainerMouseMove}
      onMouseUp={handleContainerMouseUp}
    >
      <ForceGraph3D
        ref={graphRef as any}
        graphData={graphData}
        width={dims.width}
        height={dims.height}
        backgroundColor="#09090b"
        nodeThreeObject={nodeThreeObject}
        nodeThreeObjectExtend={false}
        onNodeClick={handleNodeClick}
        onNodeRightClick={handleNodeRightClick}
        onNodeDragEnd={handleNodeDragEnd}
        linkColor={linkColor}
        linkWidth={linkWidth}
        linkOpacity={0.6}
        linkDirectionalParticles={showParticles ? 3 : 0}
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleSpeed={0.004}
        linkDirectionalParticleColor={() => '#a78bfa'}
        linkCurvature={0.1}
        enableNodeDrag={mode === 'navigate'}
        enableNavigationControls={mode !== 'lasso'}
        showNavInfo={false}
        warmupTicks={80}
        cooldownTime={3000}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />

      {/* Lasso overlay */}
      {lassoStart && lassoEnd && (
        <div
          className="absolute border-2 border-dashed pointer-events-none z-30"
          style={{
            borderColor: 'var(--v3-accent)',
            backgroundColor: 'rgba(167,139,250,0.08)',
            left: Math.min(lassoStart.x, lassoEnd.x) - (containerRef.current?.getBoundingClientRect().left || 0),
            top: Math.min(lassoStart.y, lassoEnd.y) - (containerRef.current?.getBoundingClientRect().top || 0),
            width: Math.abs(lassoEnd.x - lassoStart.x),
            height: Math.abs(lassoEnd.y - lassoStart.y),
          }}
        />
      )}

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

          {/* Mode selector */}
          <div className="backdrop-blur-md border rounded-xl flex overflow-hidden" style={{ background: panelBg, borderColor: 'var(--v3-border)' }}>
            {([
              { key: 'navigate' as InteractionMode, icon: MousePointer2, tip: 'Navigate' },
              { key: 'pathfinder' as InteractionMode, icon: Route, tip: 'Path Finder' },
              { key: 'lasso' as InteractionMode, icon: Square, tip: 'Lasso Select' },
            ]).map(({ key, icon: Icon, tip }) => (
              <button key={key} onClick={() => {
                setMode(key);
                if (key !== 'pathfinder') { setPathSource(null); setPathTarget(null); setFoundPaths([]); }
                if (key !== 'lasso') { setSelectedNodes(new Set()); }
              }}
                className={cn('px-3 py-2.5 transition-all', mode === key ? 'bg-white/10' : 'hover:bg-white/5')}
                style={{ color: mode === key ? 'var(--v3-accent)' : 'var(--v3-text-muted)' }}
                title={tip}>
                <Icon size={14} />
              </button>
            ))}
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
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

      {/* Path finder status bar */}
      <AnimatePresence>
        {mode === 'pathfinder' && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-auto z-20"
          >
            <div className="backdrop-blur-md border rounded-xl px-5 py-3 flex items-center gap-4" style={{ background: panelBg, borderColor: 'rgba(34,211,238,0.3)' }}>
              <Route size={14} style={{ color: '#22d3ee' }} />
              {!pathSource && (
                <span className="text-xs" style={{ color: 'var(--v3-text-secondary)' }}>Click <strong>source</strong> node</span>
              )}
              {pathSource && !pathTarget && (
                <span className="text-xs" style={{ color: 'var(--v3-text-secondary)' }}>
                  <span className="text-cyan-400 font-bold">{allNodes.find(n => n.id === pathSource)?.label}</span>
                  {' → Click '}
                  <strong>target</strong> node
                </span>
              )}
              {pathSource && pathTarget && foundPaths.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-xs" style={{ color: 'var(--v3-text-secondary)' }}>
                    <span className="text-cyan-400 font-bold">{allNodes.find(n => n.id === pathSource)?.label}</span>
                    {' → '}
                    <span className="text-cyan-400 font-bold">{allNodes.find(n => n.id === pathTarget)?.label}</span>
                  </span>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px]">
                    {foundPaths.length} path{foundPaths.length > 1 ? 's' : ''} · {(foundPaths[activePathIdx]?.length || 0) - 1} hops
                  </Badge>
                  {foundPaths.length > 1 && (
                    <div className="flex gap-1">
                      {foundPaths.map((_, i) => (
                        <button key={i} onClick={() => setActivePathIdx(i)}
                          className={cn('w-5 h-5 rounded text-[9px] font-mono transition-all',
                            i === activePathIdx ? 'bg-cyan-500/30 text-cyan-300' : 'bg-white/5 text-zinc-500 hover:bg-white/10'
                          )}>
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {pathSource && pathTarget && foundPaths.length === 0 && (
                <span className="text-xs text-red-400">No path found between these entities</span>
              )}
              <Button size="sm" variant="ghost" onClick={() => { setPathSource(null); setPathTarget(null); setFoundPaths([]); }}
                className="h-6 px-2 text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>
                Reset
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lasso bulk action toolbar */}
      <AnimatePresence>
        {selectedNodes.size > 0 && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-auto z-20"
          >
            <div className="backdrop-blur-md border rounded-xl px-5 py-2.5 flex items-center gap-3" style={{ background: panelBg, borderColor: 'rgba(167,139,250,0.3)' }}>
              <Badge className="bg-violet-500/20 text-violet-300 border border-violet-500/30 text-[10px]">
                {selectedNodes.size} selected
              </Badge>
              <div className="w-px h-5" style={{ background: 'var(--v3-border)' }} />
              <Button size="sm" variant="ghost" onClick={bulkFlag}
                className="h-7 px-3 text-[10px] gap-1.5 hover:bg-red-500/10" style={{ color: 'var(--v3-text-secondary)' }}>
                <Flag size={10} /> Flag All
              </Button>
              <Button size="sm" variant="ghost" onClick={bulkHide}
                className="h-7 px-3 text-[10px] gap-1.5 hover:bg-white/5" style={{ color: 'var(--v3-text-secondary)' }}>
                <EyeOff size={10} /> Hide
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedNodes(new Set())}
                className="h-7 px-3 text-[10px] gap-1.5 hover:bg-white/5" style={{ color: 'var(--v3-text-muted)' }}>
                <X size={10} /> Clear
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left filter panel */}
      <div className="absolute left-3 top-16 pointer-events-auto z-10">
        <div className="backdrop-blur-md border rounded-xl p-4 space-y-3 w-48" style={{ background: panelBg, borderColor: 'var(--v3-border)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] flex items-center gap-1.5" style={{ color: 'var(--v3-text-muted)' }}>
            <Filter size={10} /> Entity Types
          </p>
          {(Object.keys(TYPE_ICONS) as NodeType[]).map(t => {
            const { label, icon: Icon } = TYPE_ICONS[t];
            const active = visibleTypes.has(t);
            const count = allNodes.filter(n => n.type === t).length;
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
            <div className="flex items-center justify-between">
              <span className="text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>Timeline</span>
              <Switch checked={showTimeline} onCheckedChange={setShowTimeline} className="scale-75" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>Minimap</span>
              <Switch checked={showMinimap} onCheckedChange={setShowMinimap} className="scale-75" />
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
            const ahmad = allNodes.find(n => n.id === 'ahmad');
            if (ahmad && graphRef.current) handleNodeClick(ahmad);
          }, tip: 'Focus subject' },
          { icon: Undo2, action: performUndo, tip: 'Undo (Ctrl+Z)', disabled: undoStack.length === 0 },
          { icon: Redo2, action: performRedo, tip: 'Redo (Ctrl+Shift+Z)', disabled: redoStack.length === 0 },
        ].map(({ icon: Icon, action, tip, disabled }) => (
          <Button key={tip} size="icon" variant="ghost" onClick={action} title={tip} disabled={disabled}
            className="w-9 h-9 backdrop-blur-md border rounded-xl"
            style={{ background: panelBg, borderColor: 'var(--v3-border)', color: disabled ? 'var(--v3-text-muted)' : 'var(--v3-text-secondary)', opacity: disabled ? 0.4 : 1 }}>
            <Icon size={15} />
          </Button>
        ))}
      </div>

      {/* Timeline scrubber */}
      <AnimatePresence>
        {showTimeline && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="absolute bottom-20 left-56 right-56 pointer-events-auto z-10"
          >
            <div className="backdrop-blur-md border rounded-xl px-5 py-3" style={{ background: panelBg, borderColor: 'var(--v3-border)' }}>
              <div className="flex items-center gap-3 mb-2">
                <Clock size={12} style={{ color: 'var(--v3-accent)' }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--v3-text-muted)' }}>
                  Timeline
                </span>
                <span className="text-xs font-mono" style={{ color: 'var(--v3-accent)' }}>{timelineLabel}</span>
              </div>
              {/* Histogram */}
              <div className="flex items-end gap-[2px] h-6 mb-1">
                {timelineHistogram.map((v, i) => {
                  const binEnd = TIMELINE_MIN + ((i + 1) / 24) * (TIMELINE_MAX - TIMELINE_MIN);
                  const active = binEnd <= timelineValue[0];
                  return (
                    <div key={i} className="flex-1 rounded-t-sm transition-all" style={{
                      height: `${Math.max(v * 100, 4)}%`,
                      background: active ? 'var(--v3-accent)' : 'var(--v3-border)',
                      opacity: active ? 0.7 : 0.3,
                    }} />
                  );
                })}
              </div>
              <Slider
                value={timelineValue}
                onValueChange={setTimelineValue}
                min={TIMELINE_MIN}
                max={TIMELINE_MAX}
                step={(TIMELINE_MAX - TIMELINE_MIN) / 48}
                className="w-full"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[9px]" style={{ color: 'var(--v3-text-muted)' }}>Jan 2025</span>
                <span className="text-[9px]" style={{ color: 'var(--v3-text-muted)' }}>Jan 2026</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <div className="text-sm font-bold text-red-400">{allNodes.filter(n => n.flagged).length}</div>
            <div className="text-[9px]" style={{ color: 'var(--v3-text-muted)' }}>Flagged</div>
          </div>
          <div className="w-px h-6" style={{ background: 'var(--v3-border)' }} />
          <div className="text-center">
            <div className="text-sm font-bold text-orange-400">{allNodes.filter(n => n.riskScore >= 60).length}</div>
            <div className="text-[9px]" style={{ color: 'var(--v3-text-muted)' }}>High Risk</div>
          </div>
          <div className="w-px h-6" style={{ background: 'var(--v3-border)' }} />
          <div className="text-center">
            <div className="text-sm font-bold" style={{ color: 'var(--v3-accent)' }}>{allLinks.length}</div>
            <div className="text-[9px]" style={{ color: 'var(--v3-text-muted)' }}>Links</div>
          </div>
        </div>
      </div>

      {/* Minimap */}
      <AnimatePresence>
        {showMinimap && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-14 left-3 pointer-events-auto z-10"
          >
            <div className="backdrop-blur-md border rounded-xl overflow-hidden" style={{ borderColor: 'var(--v3-border)' }}>
              <div className="px-2.5 py-1 flex items-center gap-1.5" style={{ background: panelBg }}>
                <Map size={9} style={{ color: 'var(--v3-text-muted)' }} />
                <span className="text-[8px] uppercase tracking-wider font-semibold" style={{ color: 'var(--v3-text-muted)' }}>Minimap</span>
              </div>
              <canvas ref={minimapCanvasRef} width={160} height={120} className="block" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

              {/* Expandable indicator */}
              {expandableNodes.has(dossierNode.id) && !expandedNodes.has(dossierNode.id) && (
                <Button variant="outline" size="sm" onClick={() => expandNode(dossierNode.id)}
                  className="w-full border rounded-xl text-xs justify-start gap-2"
                  style={{ background: 'rgba(34,211,238,0.05)', borderColor: 'rgba(34,211,238,0.2)', color: '#22d3ee' }}>
                  <Network size={12} /> Expand 2nd-degree connections
                </Button>
              )}
              {expandedNodes.has(dossierNode.id) && (
                <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px]">
                  ✓ Expanded — {EXPANSION_NODES[dossierNode.id]?.length || 0} entities revealed
                </Badge>
              )}

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
                {/* Path finder shortcut */}
                <Button variant="outline" size="sm" onClick={() => {
                  setMode('pathfinder');
                  setPathSource(dossierNode.id);
                  setPathTarget(null);
                  setFoundPaths([]);
                  setDossierNode(null);
                }}
                  className="w-full border rounded-xl text-xs justify-start gap-2"
                  style={{ borderColor: 'rgba(34,211,238,0.2)', color: '#22d3ee' }}>
                  <Route size={12} /> Find Paths From Here
                </Button>
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

      {/* Path detail panel */}
      <AnimatePresence>
        {foundPaths.length > 0 && pathSource && pathTarget && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="absolute bottom-14 left-3 pointer-events-auto z-10"
          >
            <div className="backdrop-blur-md border rounded-xl p-4 w-72" style={{ background: panelBg, borderColor: 'rgba(34,211,238,0.2)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: '#22d3ee' }}>
                <Route size={10} /> Path {activePathIdx + 1} of {foundPaths.length}
              </p>
              <div className="space-y-1">
                {(foundPaths[activePathIdx] || []).map((nodeId, i, arr) => {
                  const node = allNodes.find(n => n.id === nodeId);
                  if (!node) return null;
                  return (
                    <div key={nodeId} className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full',
                        i === 0 || i === arr.length - 1 ? 'bg-cyan-400' : 'bg-amber-400'
                      )} />
                      <span className="text-[11px] flex-1" style={{ color: 'var(--v3-text-secondary)' }}>{node.label}</span>
                      <span className={cn('text-[9px] font-mono', riskColor(node.riskScore))}>{node.riskScore}</span>
                      {i < arr.length - 1 && (
                        <ChevronRight size={8} style={{ color: 'var(--v3-text-muted)' }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected node info (bottom-left, only when no path/minimap) */}
      <AnimatePresence>
        {selectedNode && !dossierNode && foundPaths.length === 0 && !showMinimap && (
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
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => setDossierNode(selectedNode)}
                  className="flex-1 text-[10px] h-7 hover:bg-white/5" style={{ color: 'var(--v3-accent)' }}>
                  Dossier <ChevronRight size={10} className="ml-1" />
                </Button>
                {expandableNodes.has(selectedNode.id) && !expandedNodes.has(selectedNode.id) && (
                  <Button size="sm" variant="ghost" onClick={() => expandNode(selectedNode.id)}
                    className="text-[10px] h-7 hover:bg-white/5" style={{ color: '#22d3ee' }}>
                    Expand
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
