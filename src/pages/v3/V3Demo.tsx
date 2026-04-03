import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Clock, AlertTriangle, Loader2, CheckCircle, XCircle,
  Search, AlertCircle, Shield, TrendingUp, ArrowUpRight, ArrowDownRight,
  Activity, Eye, Zap, BarChart3, Users, Globe, ChevronRight, Crosshair,
  Radio, Target, Layers, Gauge, FileWarning, ArrowRight, Filter,
  Terminal, Wifi, Database, Cpu, Lock, Unlock, CircleDot, Radar,
  ScanLine, Fingerprint, Network, MapPin
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, RadarChart,
  PolarGrid, PolarAngleAxis, Radar as RechartsRadar
} from 'recharts';
import { useV3Dashboard, useV3Cases } from '@/api/v3-hooks';

/* ═══════════════════════════════════════════════════
   SHARED
   ═══════════════════════════════════════════════════ */

const TABS = [
  { id: 'gotham', label: 'GOTHAM', sub: 'Palantir × Terminal' },
  { id: 'lattice', label: 'LATTICE', sub: 'Anduril × Military' },
  { id: 'mercury', label: 'MERCURY', sub: 'Stripe × Linear' },
] as const;

type TabId = typeof TABS[number]['id'];

interface DashboardProps {
  stats: any;
  cases: any[];
  navigate: (path: string) => void;
}

/* ═══════════════════════════════════════════════════
   VARIANT A — "GOTHAM"
   Palantir Gotham × Bloomberg Terminal × Hacker aesthetic
   Green phosphor on black, monospace everything, 
   no border-radius, scan lines, grid overlay,
   horizontal data strips, terminal-style feeds
   ═══════════════════════════════════════════════════ */

const GOTHAM = {
  bg: '#020a02',
  surface: '#071207',
  border: '#0f2a0f',
  accent: '#00ff41',
  accentDim: '#00cc33',
  accentMuted: 'rgba(0,255,65,0.08)',
  amber: '#ffb000',
  red: '#ff3333',
  text: '#00ff41',
  textDim: '#33aa55',
  textMuted: '#1a5a2a',
};

function GothamDashboard({ stats, cases, navigate }: DashboardProps) {
  const [tick, setTick] = useState(0);
  const [glitchLine, setGlitchLine] = useState(-1);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const g = setInterval(() => {
      setGlitchLine(Math.floor(Math.random() * 10));
      setTimeout(() => setGlitchLine(-1), 100);
    }, 5000);
    return () => clearInterval(g);
  }, []);

  const timeStr = new Date().toLocaleTimeString('en-GB', { hour12: false });
  const dateStr = new Date().toISOString().slice(0, 10);

  const riskDist = useMemo(() => {
    if (!stats) return { low: 0, medium: 0, high: 0, critical: 0 };
    return stats.risk_distribution;
  }, [stats]);

  // Terminal-style sparkline using block chars
  const sparkBlocks = useMemo(() => {
    return Array.from({ length: 30 }, () => {
      const v = Math.random();
      if (v > 0.8) return '█';
      if (v > 0.6) return '▓';
      if (v > 0.4) return '▒';
      if (v > 0.2) return '░';
      return ' ';
    }).join('');
  }, [tick]);

  return (
    <div
      className="h-full overflow-hidden relative"
      style={{
        background: GOTHAM.bg,
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
        color: GOTHAM.text,
      }}
    >
      {/* Scan line overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.015) 2px, rgba(0,255,65,0.015) 4px)`,
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[5]"
        style={{
          backgroundImage: `linear-gradient(${GOTHAM.border}44 1px, transparent 1px), linear-gradient(90deg, ${GOTHAM.border}44 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative z-20 h-full flex flex-col">
        {/* ── STATUS BAR ── */}
        <div
          className="flex items-center justify-between px-4 py-1.5 border-b shrink-0"
          style={{ borderColor: GOTHAM.border, background: GOTHAM.surface }}
        >
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold tracking-[0.3em]" style={{ color: GOTHAM.accentDim }}>
              ALPAGU//GOTHAM
            </span>
            <span className="text-[10px]" style={{ color: GOTHAM.textMuted }}>│</span>
            <span className="text-[10px]" style={{ color: GOTHAM.textDim }}>
              SYS.ONLINE
            </span>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: GOTHAM.accent }} />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px]" style={{ color: GOTHAM.textDim }}>{dateStr}</span>
            <span className="text-[11px] font-bold tabular-nums" style={{ color: GOTHAM.accent }}>{timeStr}</span>
          </div>
        </div>

        {/* ── THREAT STRIP ── */}
        <div
          className="flex items-center gap-3 px-4 py-1 border-b shrink-0"
          style={{ borderColor: GOTHAM.border, background: (stats?.high_risk ?? 0) > 0 ? 'rgba(255,51,51,0.06)' : GOTHAM.surface }}
        >
          <Terminal size={10} style={{ color: GOTHAM.textDim }} />
          <span className="text-[9px] tracking-[0.2em]" style={{ color: GOTHAM.textMuted }}>
            SIGINT.FEED &gt;
          </span>
          <span className="text-[10px]" style={{ color: (stats?.high_risk ?? 0) > 0 ? GOTHAM.red : GOTHAM.textDim }}>
            {(stats?.high_risk ?? 0) > 0
              ? `⚠ ${stats.high_risk} HIGH-RISK ENTITIES FLAGGED — IMMEDIATE REVIEW REQUIRED`
              : 'ALL SYSTEMS NOMINAL — NO CRITICAL ALERTS'}
          </span>
          <span className="ml-auto text-[9px]" style={{ color: GOTHAM.textMuted }}>
            {sparkBlocks}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: `${GOTHAM.border} transparent` }}>
          {/* ── KPI GRID — Terminal blocks ── */}
          <div className="grid grid-cols-6 gap-2">
            {[
              { key: 'CASES.TOTAL', val: stats?.total_cases ?? 0, icon: Database },
              { key: 'QUEUE.PENDING', val: stats?.pending_review ?? 0, icon: Clock, warn: true },
              { key: 'RISK.HIGH', val: stats?.high_risk ?? 0, icon: AlertTriangle, crit: true },
              { key: 'CASES.CLEARED', val: stats?.approved_today ?? 0, icon: Unlock },
              { key: 'RISK.LOW', val: riskDist.low ?? 0, icon: Shield },
              { key: 'RISK.CRIT', val: riskDist.critical ?? 0, icon: Zap, crit: true },
            ].map(kpi => (
              <div
                key={kpi.key}
                className="border p-3 relative overflow-hidden"
                style={{
                  borderColor: kpi.crit && kpi.val > 0 ? `${GOTHAM.red}66` : GOTHAM.border,
                  background: GOTHAM.surface,
                }}
              >
                {/* Corner bracket decoration */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l" style={{ borderColor: GOTHAM.accent + '44' }} />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r" style={{ borderColor: GOTHAM.accent + '44' }} />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l" style={{ borderColor: GOTHAM.accent + '44' }} />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r" style={{ borderColor: GOTHAM.accent + '44' }} />

                <div className="flex items-center gap-1.5 mb-2">
                  <kpi.icon size={10} style={{ color: kpi.crit && kpi.val > 0 ? GOTHAM.red : GOTHAM.textDim }} />
                  <span className="text-[8px] tracking-[0.2em]" style={{ color: GOTHAM.textMuted }}>{kpi.key}</span>
                </div>
                <div
                  className="text-2xl font-bold leading-none"
                  style={{
                    color: kpi.crit && kpi.val > 0 ? GOTHAM.red : kpi.warn && kpi.val > 5 ? GOTHAM.amber : GOTHAM.accent,
                    textShadow: `0 0 20px ${kpi.crit && kpi.val > 0 ? GOTHAM.red : GOTHAM.accent}44`,
                  }}
                >
                  {String(kpi.val).padStart(3, '0')}
                </div>
              </div>
            ))}
          </div>

          {/* ── MAIN GRID ── */}
          <div className="grid grid-cols-12 gap-2">
            {/* Entity Table — 8 cols */}
            <div className="col-span-8 border" style={{ borderColor: GOTHAM.border, background: GOTHAM.surface }}>
              <div className="px-3 py-2 border-b flex items-center gap-2" style={{ borderColor: GOTHAM.border }}>
                <ScanLine size={10} style={{ color: GOTHAM.accentDim }} />
                <span className="text-[8px] tracking-[0.25em]" style={{ color: GOTHAM.textDim }}>
                  ENTITY.WATCHLIST
                </span>
                <span className="ml-auto text-[9px] px-1.5 py-0.5" style={{ background: GOTHAM.accentMuted, color: GOTHAM.accentDim }}>
                  {cases.length} RECORDS
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${GOTHAM.border}` }}>
                      {['REF', 'ENTITY', 'NAT', 'THREAT', 'SCORE', 'STATE', 'TS'].map(h => (
                        <th
                          key={h}
                          className="px-3 py-1.5 text-left"
                          style={{ color: GOTHAM.textMuted, fontSize: '8px', letterSpacing: '0.2em' }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cases.slice(0, 10).map((c: any, i: number) => {
                      const riskColor = c.risk_level === 'critical' ? GOTHAM.red
                        : c.risk_level === 'high' ? GOTHAM.amber
                        : c.risk_level === 'medium' ? GOTHAM.amber + 'aa'
                        : GOTHAM.accentDim;
                      return (
                        <tr
                          key={c.id}
                          onClick={() => navigate(`/v3/cases/${c.id}`)}
                          className="cursor-pointer transition-colors"
                          style={{
                            borderBottom: `1px solid ${GOTHAM.border}`,
                            background: glitchLine === i ? GOTHAM.accentMuted : 'transparent',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = GOTHAM.accentMuted)}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <td className="px-3 py-1.5 font-bold" style={{ color: GOTHAM.accent }}>{c.case_id}</td>
                          <td className="px-3 py-1.5" style={{ color: GOTHAM.text }}>
                            {c.applicant.lastName?.toUpperCase()}, {c.applicant.firstName?.[0]}.
                          </td>
                          <td className="px-3 py-1.5" style={{ color: GOTHAM.textDim }}>{c.applicant.nationality}</td>
                          <td className="px-3 py-1.5">
                            <span
                              className="px-1.5 py-0.5 text-[9px] font-bold uppercase"
                              style={{ background: riskColor + '22', color: riskColor, border: `1px solid ${riskColor}44` }}
                            >
                              {c.risk_level}
                            </span>
                          </td>
                          <td className="px-3 py-1.5">
                            <div className="flex items-center gap-1.5">
                              <div className="w-16 h-1" style={{ background: GOTHAM.border }}>
                                <div className="h-full" style={{ width: `${c.risk_score}%`, background: riskColor }} />
                              </div>
                              <span style={{ color: riskColor, fontSize: '9px' }}>{c.risk_score}</span>
                            </div>
                          </td>
                          <td className="px-3 py-1.5">
                            <span className="text-[9px]" style={{ color: c.status === 'approved' ? GOTHAM.accentDim : c.status === 'escalated' ? GOTHAM.red : GOTHAM.textDim }}>
                              {c.status?.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-3 py-1.5 text-[9px]" style={{ color: GOTHAM.textMuted }}>
                            {c.application_date?.slice(5, 10)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column — 4 cols */}
            <div className="col-span-4 space-y-2">
              {/* Risk Matrix */}
              <div className="border p-3" style={{ borderColor: GOTHAM.border, background: GOTHAM.surface }}>
                <div className="flex items-center gap-2 mb-3">
                  <Radar size={10} style={{ color: GOTHAM.accentDim }} />
                  <span className="text-[8px] tracking-[0.25em]" style={{ color: GOTHAM.textMuted }}>THREAT.MATRIX</span>
                </div>
                {/* ASCII-style risk bars */}
                {[
                  { label: 'CRIT', val: riskDist.critical ?? 0, color: GOTHAM.red },
                  { label: 'HIGH', val: riskDist.high ?? 0, color: GOTHAM.amber },
                  { label: 'MED ', val: riskDist.medium ?? 0, color: GOTHAM.amber + 'aa' },
                  { label: 'LOW ', val: riskDist.low ?? 0, color: GOTHAM.accentDim },
                ].map(r => {
                  const total = (stats?.total_cases ?? 1);
                  const width = Math.max(2, (r.val / total) * 100);
                  return (
                    <div key={r.label} className="flex items-center gap-2 mb-1.5">
                      <span className="text-[8px] w-8 shrink-0" style={{ color: r.color }}>{r.label}</span>
                      <div className="flex-1 h-3 relative" style={{ background: GOTHAM.border }}>
                        <div className="h-full relative overflow-hidden" style={{ width: `${width}%`, background: r.color + '33' }}>
                          <div className="absolute inset-0" style={{ background: `repeating-linear-gradient(90deg, ${r.color}66 0px, ${r.color}66 2px, transparent 2px, transparent 4px)` }} />
                        </div>
                      </div>
                      <span className="text-[9px] w-6 text-right font-bold" style={{ color: r.color }}>{r.val}</span>
                    </div>
                  );
                })}
              </div>

              {/* Activity Feed — Terminal style */}
              <div className="border" style={{ borderColor: GOTHAM.border, background: GOTHAM.surface }}>
                <div className="px-3 py-2 border-b flex items-center gap-2" style={{ borderColor: GOTHAM.border }}>
                  <Terminal size={10} style={{ color: GOTHAM.accentDim }} />
                  <span className="text-[8px] tracking-[0.25em]" style={{ color: GOTHAM.textMuted }}>SYS.LOG</span>
                </div>
                <div className="max-h-52 overflow-y-auto p-2 space-y-0.5" style={{ scrollbarWidth: 'thin', scrollbarColor: `${GOTHAM.border} transparent` }}>
                  {(stats?.recent_activity || []).slice(0, 10).map((entry: any, i: number) => (
                    <div key={entry.id} className="flex gap-2 py-0.5 text-[9px] leading-relaxed">
                      <span style={{ color: GOTHAM.textMuted }}>
                        {new Date(entry.timestamp).toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5)}
                      </span>
                      <span style={{ color: GOTHAM.accentDim }}>│</span>
                      <span className="flex-1" style={{ color: GOTHAM.textDim }}>{entry.description}</span>
                    </div>
                  ))}
                  <div className="flex gap-2 py-0.5 text-[9px] animate-pulse">
                    <span style={{ color: GOTHAM.accent }}>█</span>
                    <span style={{ color: GOTHAM.textMuted }}>AWAITING INPUT_</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   VARIANT B — "LATTICE"
   Anduril Lattice × Military C2
   Sand/khaki tones on deep navy, thick section dividers,
   prominent threat level indicator, geographic emphasis,
   stencil-style typography, status light system
   ═══════════════════════════════════════════════════ */

const LATTICE = {
  bg: '#0a0e1a',
  surface: '#111827',
  surfaceAlt: '#1a2235',
  border: '#1f2937',
  accent: '#60a5fa',
  sand: '#d4a373',
  sandDim: '#a07d5a',
  red: '#ef4444',
  amber: '#f59e0b',
  green: '#34d399',
  text: '#f1f5f9',
  textDim: '#94a3b8',
  textMuted: '#4b5563',
};

function LatticeDashboard({ stats, cases, navigate }: DashboardProps) {
  const threatLevel = useMemo(() => {
    const hr = stats?.high_risk ?? 0;
    const cr = stats?.risk_distribution?.critical ?? 0;
    if (cr > 2) return { level: 'CRITICAL', color: LATTICE.red, idx: 4 };
    if (hr > 5) return { level: 'HIGH', color: LATTICE.amber, idx: 3 };
    if (hr > 0) return { level: 'ELEVATED', color: LATTICE.sand, idx: 2 };
    return { level: 'NORMAL', color: LATTICE.green, idx: 1 };
  }, [stats]);

  const caseBySeverity = useMemo(() => {
    const crit = cases.filter(c => c.risk_level === 'critical');
    const high = cases.filter(c => c.risk_level === 'high');
    const rest = cases.filter(c => c.risk_level !== 'critical' && c.risk_level !== 'high');
    return [...crit, ...high, ...rest];
  }, [cases]);

  return (
    <div className="h-full overflow-hidden flex flex-col" style={{ background: LATTICE.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ── TOP BAR — Threat Level ── */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b shrink-0"
        style={{ borderColor: LATTICE.border, background: LATTICE.surface }}
      >
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3">
            <Shield size={16} style={{ color: LATTICE.accent }} />
            <div>
              <div className="text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: LATTICE.textMuted }}>
                Threat Condition
              </div>
              <div className="text-sm font-bold tracking-wider" style={{ color: threatLevel.color }}>
                THREATCON {threatLevel.level}
              </div>
            </div>
          </div>

          {/* Threat level indicator bars */}
          <div className="flex gap-1">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="w-8 h-5 rounded-sm transition-all duration-500"
                style={{
                  background: i <= threatLevel.idx ? threatLevel.color : LATTICE.border,
                  opacity: i <= threatLevel.idx ? 1 : 0.3,
                  boxShadow: i <= threatLevel.idx ? `0 0 12px ${threatLevel.color}44` : 'none',
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6 text-[11px]" style={{ color: LATTICE.textDim }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: LATTICE.green }} />
            <span>Systems Online</span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi size={12} />
            <span>SIGINT Active</span>
          </div>
          <span className="font-mono text-xs" style={{ color: LATTICE.text }}>
            {new Date().toLocaleTimeString('en-GB', { hour12: false })}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: `${LATTICE.border} transparent` }}>
        {/* ── METRICS ROW ── */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Active Investigations', value: stats?.total_cases ?? 0, icon: Briefcase, color: LATTICE.accent, sub: 'Total portfolio' },
            { label: 'Pending Triage', value: stats?.pending_review ?? 0, icon: Clock, color: LATTICE.amber, sub: 'Awaiting analyst', alert: (stats?.pending_review ?? 0) > 5 },
            { label: 'Critical Entities', value: stats?.high_risk ?? 0, icon: Target, color: LATTICE.red, sub: 'Immediate action', alert: (stats?.high_risk ?? 0) > 0 },
            { label: 'Resolved Today', value: stats?.approved_today ?? 0, icon: CheckCircle, color: LATTICE.green, sub: 'Cases cleared' },
          ].map(m => (
            <div
              key={m.label}
              className="relative rounded-lg p-5 border overflow-hidden"
              style={{
                background: LATTICE.surface,
                borderColor: m.alert ? m.color + '44' : LATTICE.border,
              }}
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: m.color }} />

              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: LATTICE.textMuted }}>
                    {m.label}
                  </div>
                  <div className="text-[10px]" style={{ color: LATTICE.textMuted }}>{m.sub}</div>
                </div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: m.color + '15' }}>
                  <m.icon size={18} style={{ color: m.color }} />
                </div>
              </div>
              <div className="text-3xl font-bold" style={{ color: m.alert ? m.color : LATTICE.text }}>
                {m.value}
              </div>
            </div>
          ))}
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="grid grid-cols-3 gap-4">
          {/* Priority Cases — 2 cols */}
          <div className="col-span-2 rounded-lg border overflow-hidden" style={{ background: LATTICE.surface, borderColor: LATTICE.border }}>
            <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: LATTICE.border }}>
              <div className="flex items-center gap-3">
                <Crosshair size={14} style={{ color: LATTICE.accent }} />
                <span className="text-xs font-bold" style={{ color: LATTICE.text }}>Priority Cases</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: LATTICE.accent + '15', color: LATTICE.accent }}>
                  {caseBySeverity.length}
                </span>
              </div>
              <button onClick={() => navigate('/v3/cases')} className="text-[10px] font-semibold flex items-center gap-1" style={{ color: LATTICE.accent }}>
                View All <ChevronRight size={12} />
              </button>
            </div>

            <div className="divide-y" style={{ borderColor: LATTICE.border }}>
              {caseBySeverity.slice(0, 7).map((c: any) => {
                const riskColor = c.risk_level === 'critical' ? LATTICE.red
                  : c.risk_level === 'high' ? LATTICE.amber
                  : c.risk_level === 'medium' ? LATTICE.sand
                  : LATTICE.accent;
                return (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/v3/cases/${c.id}`)}
                    className="flex items-center gap-4 px-5 py-3 cursor-pointer transition-all hover:bg-white/[0.02]"
                    style={{ borderColor: LATTICE.border }}
                  >
                    {/* Severity indicator */}
                    <div className="w-1 h-8 rounded-full shrink-0" style={{ background: riskColor }} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold" style={{ color: LATTICE.text }}>
                          {c.applicant.firstName} {c.applicant.lastName}
                        </span>
                        <span className="text-[10px] font-mono" style={{ color: LATTICE.textMuted }}>{c.case_id}</span>
                      </div>
                      <div className="text-[10px]" style={{ color: LATTICE.textMuted }}>
                        {c.applicant.nationality} → {c.travel_destination} · {c.consulate_location}
                      </div>
                    </div>

                    {/* Risk score bar */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-20 h-2 rounded-full overflow-hidden" style={{ background: LATTICE.border }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${c.risk_score}%`, background: riskColor }} />
                      </div>
                      <span className="text-[10px] font-mono font-bold w-6 text-right" style={{ color: riskColor }}>{c.risk_score}</span>
                    </div>

                    {/* Status chip */}
                    <span
                      className="text-[9px] font-bold uppercase px-2.5 py-1 rounded-full shrink-0"
                      style={{
                        background: c.status === 'escalated' ? LATTICE.red + '15' : c.status === 'approved' ? LATTICE.green + '15' : LATTICE.surfaceAlt,
                        color: c.status === 'escalated' ? LATTICE.red : c.status === 'approved' ? LATTICE.green : LATTICE.textDim,
                      }}
                    >
                      {c.status}
                    </span>

                    <ChevronRight size={14} style={{ color: LATTICE.textMuted }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            {/* Risk Breakdown — Horizontal stacked */}
            <div className="rounded-lg border p-5" style={{ background: LATTICE.surface, borderColor: LATTICE.border }}>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={14} style={{ color: LATTICE.accent }} />
                <span className="text-xs font-bold" style={{ color: LATTICE.text }}>Risk Analysis</span>
              </div>

              {/* Stacked horizontal bar */}
              <div className="h-6 rounded-lg overflow-hidden flex mb-4" style={{ background: LATTICE.border }}>
                {[
                  { val: stats?.risk_distribution?.critical ?? 0, color: LATTICE.red },
                  { val: stats?.risk_distribution?.high ?? 0, color: LATTICE.amber },
                  { val: stats?.risk_distribution?.medium ?? 0, color: LATTICE.sand },
                  { val: stats?.risk_distribution?.low ?? 0, color: LATTICE.green },
                ].map((seg, i) => {
                  const total = stats?.total_cases ?? 1;
                  const w = Math.max(0, (seg.val / total) * 100);
                  return w > 0 ? (
                    <div
                      key={i}
                      className="h-full transition-all duration-700 flex items-center justify-center text-[8px] font-bold"
                      style={{ width: `${w}%`, background: seg.color, color: '#000', minWidth: '16px' }}
                    >
                      {seg.val}
                    </div>
                  ) : null;
                })}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Critical', val: stats?.risk_distribution?.critical ?? 0, color: LATTICE.red },
                  { label: 'High', val: stats?.risk_distribution?.high ?? 0, color: LATTICE.amber },
                  { label: 'Medium', val: stats?.risk_distribution?.medium ?? 0, color: LATTICE.sand },
                  { label: 'Low', val: stats?.risk_distribution?.low ?? 0, color: LATTICE.green },
                ].map(r => (
                  <div key={r.label} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: r.color }} />
                    <span className="text-[10px]" style={{ color: LATTICE.textDim }}>{r.label}</span>
                    <span className="text-[10px] font-bold font-mono ml-auto" style={{ color: LATTICE.text }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity */}
            <div className="rounded-lg border overflow-hidden" style={{ background: LATTICE.surface, borderColor: LATTICE.border }}>
              <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: LATTICE.border }}>
                <Activity size={14} style={{ color: LATTICE.accent }} />
                <span className="text-xs font-bold" style={{ color: LATTICE.text }}>Operations Log</span>
              </div>
              <div className="max-h-60 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: `${LATTICE.border} transparent` }}>
                {(stats?.recent_activity || []).slice(0, 8).map((entry: any) => (
                  <div key={entry.id} className="flex items-start gap-3 px-5 py-2.5 border-b hover:bg-white/[0.01] transition-colors" style={{ borderColor: LATTICE.border }}>
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: LATTICE.accent }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] leading-relaxed" style={{ color: LATTICE.textDim }}>{entry.description}</p>
                    </div>
                    <span className="text-[9px] font-mono shrink-0 mt-0.5" style={{ color: LATTICE.textMuted }}>
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   VARIANT C — "MERCURY"
   Stripe Dashboard × Linear × Vercel
   Ultra-clean, generous spacing, subtle gradients,
   prominent numbers, glass morphism hints,
   rounded corners, soft shadows, purple-blue accent
   ═══════════════════════════════════════════════════ */

const MERCURY = {
  bg: '#09090b',
  surface: '#18181b',
  surfaceHover: '#27272a',
  border: '#27272a',
  borderHover: '#3f3f46',
  accent: '#a78bfa',
  accentDim: '#7c3aed',
  blue: '#60a5fa',
  green: '#4ade80',
  amber: '#fbbf24',
  red: '#f87171',
  text: '#fafafa',
  textDim: '#a1a1aa',
  textMuted: '#52525b',
};

function MercuryDashboard({ stats, cases, navigate }: DashboardProps) {
  const riskData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Low', value: stats.risk_distribution.low || 0, fill: MERCURY.green },
      { name: 'Medium', value: stats.risk_distribution.medium || 0, fill: MERCURY.amber },
      { name: 'High', value: stats.risk_distribution.high || 0, fill: '#fb923c' },
      { name: 'Critical', value: stats.risk_distribution.critical || 0, fill: MERCURY.red },
    ];
  }, [stats]);

  const trendData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => ({
      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      cases: Math.floor(Math.random() * 10 + 3),
      risk: Math.floor(Math.random() * 6 + 1),
    }));
  }, []);

  return (
    <div className="h-full overflow-y-auto" style={{ background: MERCURY.bg, fontFamily: "'Inter', system-ui, sans-serif", scrollbarWidth: 'thin', scrollbarColor: `${MERCURY.border} transparent` }}>
      <div className="max-w-6xl mx-auto px-8 py-8 space-y-8">
        {/* ── HEADER ── */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: MERCURY.text }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}
          </h1>
          <p className="text-sm mt-1" style={{ color: MERCURY.textMuted }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} · {stats?.total_cases ?? 0} active cases
          </p>
        </div>

        {/* ── BENTO GRID ── */}
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              label: 'Total Cases', value: stats?.total_cases ?? 0, sub: 'All investigations',
              gradient: `linear-gradient(135deg, ${MERCURY.accent}08, ${MERCURY.blue}08)`,
              iconBg: MERCURY.accent, icon: Briefcase,
            },
            {
              label: 'Pending Review', value: stats?.pending_review ?? 0, sub: 'Awaiting decision',
              gradient: `linear-gradient(135deg, ${MERCURY.amber}08, ${MERCURY.amber}04)`,
              iconBg: MERCURY.amber, icon: Clock,
            },
            {
              label: 'High Risk', value: stats?.high_risk ?? 0, sub: 'Flagged entities',
              gradient: `linear-gradient(135deg, ${MERCURY.red}08, ${MERCURY.red}04)`,
              iconBg: MERCURY.red, icon: AlertTriangle,
            },
            {
              label: 'Approved', value: stats?.approved_today ?? 0, sub: 'Cases cleared',
              gradient: `linear-gradient(135deg, ${MERCURY.green}08, ${MERCURY.green}04)`,
              iconBg: MERCURY.green, icon: CheckCircle,
            },
          ].map(m => (
            <div
              key={m.label}
              className="rounded-xl p-5 border transition-all duration-200 hover:border-[#3f3f46] group"
              style={{ background: m.gradient, borderColor: MERCURY.border }}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-[11px] font-medium" style={{ color: MERCURY.textDim }}>{m.label}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: m.iconBg + '15' }}>
                  <m.icon size={15} style={{ color: m.iconBg }} />
                </div>
              </div>
              <div className="text-3xl font-semibold tracking-tight" style={{ color: MERCURY.text }}>{m.value}</div>
              <div className="text-[10px] mt-1" style={{ color: MERCURY.textMuted }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* ── MIDDLE ROW ── */}
        <div className="grid grid-cols-5 gap-4">
          {/* Weekly Trend — 3 cols */}
          <div className="col-span-3 rounded-xl border p-5" style={{ background: MERCURY.surface, borderColor: MERCURY.border }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold" style={{ color: MERCURY.text }}>Weekly Trend</span>
              <div className="flex gap-4 text-[10px]">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: MERCURY.accent }} />Cases</span>
                <span className="flex items-center gap-1.5" style={{ color: MERCURY.textMuted }}><span className="w-2 h-2 rounded-full" style={{ background: MERCURY.red }} />High Risk</span>
              </div>
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="mercGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={MERCURY.accent} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={MERCURY.accent} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="mercRedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={MERCURY.red} stopOpacity={0.15} />
                      <stop offset="100%" stopColor={MERCURY.red} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: MERCURY.textMuted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: MERCURY.textMuted }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip
                    contentStyle={{ background: MERCURY.surface, border: `1px solid ${MERCURY.border}`, borderRadius: '8px', fontSize: '11px', color: MERCURY.text }}
                  />
                  <Area type="monotone" dataKey="cases" stroke={MERCURY.accent} fill="url(#mercGrad)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="risk" stroke={MERCURY.red} fill="url(#mercRedGrad)" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Distribution — 2 cols */}
          <div className="col-span-2 rounded-xl border p-5" style={{ background: MERCURY.surface, borderColor: MERCURY.border }}>
            <span className="text-sm font-semibold" style={{ color: MERCURY.text }}>Risk Distribution</span>
            <div className="flex items-center gap-6 mt-4">
              <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskData} dataKey="value" cx="50%" cy="50%" innerRadius={36} outerRadius={56} paddingAngle={3} strokeWidth={0}>
                      {riskData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                {riskData.map(d => {
                  const total = stats?.total_cases ?? 1;
                  const pctVal = Math.round((d.value / total) * 100);
                  return (
                    <div key={d.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-medium flex items-center gap-2" style={{ color: MERCURY.textDim }}>
                          <span className="w-2 h-2 rounded-full" style={{ background: d.fill }} />
                          {d.name}
                        </span>
                        <span className="text-[11px] font-semibold font-mono" style={{ color: MERCURY.text }}>{d.value}</span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: MERCURY.border }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pctVal}%`, background: d.fill }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── CASES LIST ── */}
        <div className="rounded-xl border overflow-hidden" style={{ background: MERCURY.surface, borderColor: MERCURY.border }}>
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: MERCURY.border }}>
            <span className="text-sm font-semibold" style={{ color: MERCURY.text }}>Recent Cases</span>
            <button onClick={() => navigate('/v3/cases')} className="text-[11px] font-medium flex items-center gap-1 hover:gap-2 transition-all" style={{ color: MERCURY.accent }}>
              View all cases <ArrowRight size={12} />
            </button>
          </div>
          <div>
            {cases.slice(0, 6).map((c: any, i: number) => {
              const riskColor = c.risk_level === 'critical' ? MERCURY.red
                : c.risk_level === 'high' ? '#fb923c'
                : c.risk_level === 'medium' ? MERCURY.amber
                : MERCURY.green;
              return (
                <div
                  key={c.id}
                  onClick={() => navigate(`/v3/cases/${c.id}`)}
                  className="flex items-center gap-5 px-6 py-3.5 border-b cursor-pointer transition-all hover:bg-white/[0.02]"
                  style={{ borderColor: MERCURY.border }}
                >
                  {/* Avatar/initials */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
                    style={{ background: `${riskColor}15`, color: riskColor }}
                  >
                    {c.applicant.firstName?.[0]}{c.applicant.lastName?.[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium" style={{ color: MERCURY.text }}>
                        {c.applicant.firstName} {c.applicant.lastName}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: MERCURY.surfaceHover, color: MERCURY.textMuted }}>
                        {c.case_id}
                      </span>
                    </div>
                    <span className="text-[10px]" style={{ color: MERCURY.textMuted }}>
                      {c.applicant.nationality} → {c.travel_destination}
                    </span>
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px]" style={{ color: MERCURY.textMuted }}>Risk Score</div>
                      <div className="text-sm font-semibold font-mono" style={{ color: riskColor }}>{c.risk_score}</div>
                    </div>
                    <div className="w-8 h-8 rounded-full relative">
                      <svg width={32} height={32} className="-rotate-90">
                        <circle cx={16} cy={16} r={13} fill="none" stroke={MERCURY.border} strokeWidth={2} />
                        <circle
                          cx={16} cy={16} r={13} fill="none" stroke={riskColor} strokeWidth={2}
                          strokeDasharray={`${(c.risk_score / 100) * 81.7} 81.7`}
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Status */}
                  <span
                    className="text-[10px] font-medium px-3 py-1 rounded-full shrink-0 capitalize"
                    style={{
                      background: c.status === 'approved' ? MERCURY.green + '12' : c.status === 'escalated' ? MERCURY.red + '12' : MERCURY.surfaceHover,
                      color: c.status === 'approved' ? MERCURY.green : c.status === 'escalated' ? MERCURY.red : MERCURY.textDim,
                    }}
                  >
                    {c.status?.replace('_', ' ')}
                  </span>

                  <ChevronRight size={14} style={{ color: MERCURY.textMuted }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* ── ACTIVITY ── */}
        <div className="rounded-xl border overflow-hidden" style={{ background: MERCURY.surface, borderColor: MERCURY.border }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: MERCURY.border }}>
            <span className="text-sm font-semibold" style={{ color: MERCURY.text }}>Activity</span>
          </div>
          <div className="divide-y" style={{ borderColor: MERCURY.border }}>
            {(stats?.recent_activity || []).slice(0, 6).map((entry: any) => (
              <div key={entry.id} className="flex items-center gap-4 px-6 py-3 hover:bg-white/[0.01] transition-colors" style={{ borderColor: MERCURY.border }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: MERCURY.accent + '12' }}>
                  <Activity size={12} style={{ color: MERCURY.accent }} />
                </div>
                <p className="text-[11px] flex-1" style={{ color: MERCURY.textDim }}>{entry.description}</p>
                <span className="text-[10px] font-mono" style={{ color: MERCURY.textMuted }}>
                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   DEMO PAGE — Tab Switcher
   ═══════════════════════════════════════════════════ */

function DemoSkeleton() {
  return (
    <div className="flex items-center justify-center h-full" style={{ background: '#0a0e1a' }}>
      <Loader2 size={24} className="animate-spin" style={{ color: '#60a5fa' }} />
    </div>
  );
}

export default function V3Demo() {
  const navigate = useNavigate();
  const { data: stats, loading: statsLoading } = useV3Dashboard();
  const { data: casesData, loading: casesLoading } = useV3Cases({ page: 1, per_page: 20 });
  const [activeTab, setActiveTab] = useState<TabId>('gotham');

  const cases = casesData?.items || [];

  if (statsLoading || casesLoading) return <DemoSkeleton />;

  return (
    <div className="h-full flex flex-col" style={{ background: '#09090b' }}>
      {/* ── Tab Switcher ── */}
      <div
        className="shrink-0 flex items-center gap-1 px-4 py-2 border-b"
        style={{ borderColor: '#27272a', background: '#09090b' }}
      >
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative px-5 py-2 rounded-lg text-[11px] font-semibold tracking-wide transition-all"
            style={{
              background: activeTab === tab.id ? '#27272a' : 'transparent',
              color: activeTab === tab.id ? '#fafafa' : '#52525b',
            }}
          >
            <span>{tab.label}</span>
            <span className="block text-[8px] font-normal tracking-wider mt-0.5" style={{ color: '#52525b' }}>{tab.sub}</span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full" style={{ background: tab.id === 'gotham' ? '#00ff41' : tab.id === 'lattice' ? '#60a5fa' : '#a78bfa' }} />
            )}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'gotham' && <GothamDashboard stats={stats} cases={cases} navigate={navigate} />}
        {activeTab === 'lattice' && <LatticeDashboard stats={stats} cases={cases} navigate={navigate} />}
        {activeTab === 'mercury' && <MercuryDashboard stats={stats} cases={cases} navigate={navigate} />}
      </div>
    </div>
  );
}
