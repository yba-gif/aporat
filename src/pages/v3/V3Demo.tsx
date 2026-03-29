import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Clock, AlertTriangle, Loader2, CheckCircle, XCircle,
  Search, AlertCircle, Shield, TrendingUp, ArrowUpRight, ArrowDownRight,
  Activity, Eye, Zap, BarChart3, Users, Globe, ChevronRight, Crosshair,
  Radio, Target, Layers, Gauge, FileWarning, ArrowRight, Filter
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { useV3Dashboard, useV3Cases } from '@/api/v3-hooks';
import { RiskBadge, StatusBadge, RiskScoreCircle } from '@/components/v3/V3Badges';

/* ─── Shared helpers ─── */
const fmt = (n: number) => n.toLocaleString();
const pct = (n: number, t: number) => t === 0 ? 0 : Math.round((n / t) * 100);

const TABS = [
  { id: 'a', label: 'Command Center' },
  { id: 'b', label: 'Situation Room' },
  { id: 'c', label: 'Analyst Workspace' },
] as const;

type TabId = typeof TABS[number]['id'];

/* ─── Skeleton ─── */
function DemoSkeleton() {
  return (
    <div className="space-y-4 p-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-20 rounded-md animate-pulse" style={{ background: 'var(--v3-border)' }} />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   ALTERNATIVE A — "COMMAND CENTER"
   Bloomberg Terminal × Palantir Gotham
   Maximum density, horizontal data strips
   ───────────────────────────────────────────────── */

function DashboardA({ stats, cases, navigate }: DashboardProps) {
  const riskDist = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Low', value: stats.risk_distribution.low || 0, color: 'var(--v3-green)' },
      { name: 'Medium', value: stats.risk_distribution.medium || 0, color: 'var(--v3-amber)' },
      { name: 'High', value: stats.risk_distribution.high || 0, color: '#F97316' },
      { name: 'Critical', value: stats.risk_distribution.critical || 0, color: 'var(--v3-red)' },
    ];
  }, [stats]);

  const totalRisk = riskDist.reduce((s, d) => s + d.value, 0);

  // Sparkline mock data
  const sparkData = Array.from({ length: 14 }, (_, i) => ({
    d: i,
    cases: Math.floor(Math.random() * 8 + 2),
    risk: Math.floor(Math.random() * 5 + 1),
  }));

  return (
    <div className="space-y-0">
      {/* ── Threat Ticker Strip ── */}
      <div
        className="flex items-center gap-6 px-5 py-2 border-b overflow-x-auto"
        style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'var(--v3-border)' }}
      >
        <div className="flex items-center gap-2 shrink-0">
          <Radio size={12} className="v3-pulse-red" style={{ color: 'var(--v3-red)' }} />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--v3-red)' }}>
            THREAT ADVISORY
          </span>
        </div>
        {(stats?.high_risk ?? 0) > 0 && (
          <span className="text-[11px] shrink-0" style={{ color: 'var(--v3-text-secondary)' }}>
            <strong style={{ color: 'var(--v3-red)' }}>{stats?.high_risk}</strong> high-risk cases require immediate review
          </span>
        )}
        <span className="text-[11px] shrink-0" style={{ color: 'var(--v3-text-muted)' }}>
          {stats?.pending_review ?? 0} pending · {stats?.total_cases ?? 0} total cases tracked
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* ── KPI Strip — Horizontal, compact ── */}
        <div className="grid grid-cols-6 gap-3">
          {/* KPI Cards */}
          {[
            { label: 'ACTIVE CASES', value: stats?.total_cases ?? 0, icon: Briefcase, color: 'var(--v3-accent)', delta: '+3', up: true },
            { label: 'PENDING REVIEW', value: stats?.pending_review ?? 0, icon: Clock, color: 'var(--v3-amber)', delta: '+2', up: true },
            { label: 'HIGH RISK', value: stats?.high_risk ?? 0, icon: AlertTriangle, color: 'var(--v3-red)', delta: '+1', up: true, pulse: true },
            { label: 'APPROVED', value: stats?.approved_today ?? 0, icon: CheckCircle, color: 'var(--v3-green)', delta: '−', up: false },
          ].map(kpi => (
            <div
              key={kpi.label}
              className="border rounded-none p-3 group transition-colors hover:border-[var(--v3-border-hover)]"
              style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-bold tracking-[0.15em]" style={{ color: 'var(--v3-text-muted)' }}>
                  {kpi.label}
                </span>
                <kpi.icon size={12} style={{ color: kpi.color }} className={kpi.pulse ? 'v3-pulse-red' : ''} />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-xl font-bold font-mono leading-none" style={{ color: kpi.value > 0 && kpi.pulse ? kpi.color : 'var(--v3-text)' }}>
                  {fmt(kpi.value)}
                </span>
                <span className="text-[10px] font-mono flex items-center gap-0.5" style={{ color: kpi.up ? 'var(--v3-amber)' : 'var(--v3-text-muted)' }}>
                  {kpi.up ? <ArrowUpRight size={10} /> : null}
                  {kpi.delta}
                </span>
              </div>
            </div>
          ))}

          {/* Sparkline — Cases per day */}
          <div
            className="border rounded-none p-3"
            style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
          >
            <span className="text-[9px] font-bold tracking-[0.15em]" style={{ color: 'var(--v3-text-muted)' }}>
              14-DAY INTAKE
            </span>
            <div className="h-10 mt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkData}>
                  <defs>
                    <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--v3-accent)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--v3-accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="cases" stroke="var(--v3-accent)" fill="url(#sparkGrad)" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Heatbar */}
          <div
            className="border rounded-none p-3"
            style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
          >
            <span className="text-[9px] font-bold tracking-[0.15em]" style={{ color: 'var(--v3-text-muted)' }}>
              RISK SPECTRUM
            </span>
            <div className="flex h-3 rounded-sm overflow-hidden mt-2 mb-1.5">
              {riskDist.map(d => (
                <div
                  key={d.name}
                  style={{ width: `${pct(d.value, totalRisk)}%`, background: d.color, minWidth: d.value > 0 ? '4px' : '0' }}
                />
              ))}
            </div>
            <div className="flex justify-between text-[9px] font-mono" style={{ color: 'var(--v3-text-muted)' }}>
              {riskDist.map(d => (
                <span key={d.name} style={{ color: d.color }}>{d.value}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main Grid: Cases Table + Side Panels ── */}
        <div className="grid grid-cols-12 gap-3">
          {/* Cases Table — 8 cols */}
          <div
            className="col-span-8 border rounded-none overflow-hidden"
            style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
          >
            <div className="px-4 py-2.5 border-b flex items-center justify-between" style={{ borderColor: 'var(--v3-border)' }}>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: 'var(--v3-text)' }}>
                  Priority Queue
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold" style={{ background: 'var(--v3-accent-muted)', color: 'var(--v3-accent)' }}>
                  {cases.length}
                </span>
              </div>
              <button onClick={() => navigate('/v3/cases')} className="text-[10px] flex items-center gap-1 hover:underline" style={{ color: 'var(--v3-accent)' }}>
                All Cases <ArrowRight size={10} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--v3-border)', background: 'rgba(255,255,255,0.02)' }}>
                    {['ID', 'Applicant', 'Nationality', 'Risk', 'Score', 'Status', 'Date'].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-bold tracking-wide" style={{ color: 'var(--v3-text-muted)', fontSize: '9px', letterSpacing: '0.1em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cases.slice(0, 8).map((c, i) => (
                    <tr
                      key={c.id}
                      onClick={() => navigate(`/v3/cases/${c.id}`)}
                      className="cursor-pointer transition-colors hover:bg-white/[0.03]"
                      style={{ borderBottom: '1px solid var(--v3-border)', animationDelay: `${i * 30}ms` }}
                    >
                      <td className="px-3 py-2 font-mono font-bold" style={{ color: 'var(--v3-accent)' }}>{c.case_id}</td>
                      <td className="px-3 py-2 font-medium" style={{ color: 'var(--v3-text)' }}>{c.applicant.firstName} {c.applicant.lastName}</td>
                      <td className="px-3 py-2 font-mono" style={{ color: 'var(--v3-text-secondary)' }}>{c.applicant.nationality}</td>
                      <td className="px-3 py-2"><RiskBadge level={c.risk_level as any} /></td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--v3-border)' }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${c.risk_score}%`,
                                background: c.risk_score < 30 ? 'var(--v3-green)' : c.risk_score < 60 ? 'var(--v3-amber)' : 'var(--v3-red)',
                              }}
                            />
                          </div>
                          <span className="font-mono text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>{c.risk_score}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2"><StatusBadge status={c.status as any} /></td>
                      <td className="px-3 py-2 font-mono" style={{ color: 'var(--v3-text-muted)' }}>{c.application_date?.slice(5, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column — 4 cols */}
          <div className="col-span-4 space-y-3">
            {/* Risk Donut */}
            <div
              className="border rounded-none p-4"
              style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
            >
              <span className="text-[9px] font-bold tracking-[0.15em] uppercase" style={{ color: 'var(--v3-text-muted)' }}>
                Risk Distribution
              </span>
              <div className="flex items-center gap-4 mt-3">
                <div className="w-24 h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={riskDist} dataKey="value" cx="50%" cy="50%" innerRadius={28} outerRadius={42} paddingAngle={2} strokeWidth={0}>
                        {riskDist.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5">
                  {riskDist.map(d => (
                    <div key={d.name} className="flex items-center gap-2 text-[10px]">
                      <span className="w-2 h-2 rounded-sm" style={{ background: d.color }} />
                      <span style={{ color: 'var(--v3-text-secondary)' }}>{d.name}</span>
                      <span className="font-mono font-bold ml-auto" style={{ color: d.color }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Feed */}
            <div
              className="border rounded-none overflow-hidden"
              style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
            >
              <div className="px-4 py-2.5 border-b flex items-center gap-2" style={{ borderColor: 'var(--v3-border)' }}>
                <Activity size={12} style={{ color: 'var(--v3-accent)' }} />
                <span className="text-[9px] font-bold tracking-[0.15em] uppercase" style={{ color: 'var(--v3-text-muted)' }}>
                  Live Feed
                </span>
              </div>
              <div className="max-h-52 overflow-y-auto v3-scrollbar">
                {(stats?.recent_activity || []).slice(0, 8).map(entry => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-2.5 px-4 py-2 border-b hover:bg-white/[0.02] transition-colors"
                    style={{ borderColor: 'var(--v3-border)' }}
                  >
                    <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--v3-accent)' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] leading-relaxed truncate" style={{ color: 'var(--v3-text-secondary)' }}>{entry.description}</p>
                    </div>
                    <span className="text-[9px] font-mono shrink-0" style={{ color: 'var(--v3-text-muted)' }}>
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

/* ─────────────────────────────────────────────────
   ALTERNATIVE B — "SITUATION ROOM"
   Military C2 × Air Traffic Control
   Central risk gauge, status columns, officer view
   ───────────────────────────────────────────────── */

function DashboardB({ stats, cases, navigate }: DashboardProps) {
  const statusGroups = useMemo(() => {
    const groups: Record<string, typeof cases> = { new: [], in_review: [], escalated: [], approved: [] };
    cases.forEach(c => {
      const key = c.status in groups ? c.status : 'new';
      groups[key].push(c);
    });
    return groups;
  }, [cases]);

  const avgRisk = useMemo(() => {
    if (cases.length === 0) return 0;
    return Math.round(cases.reduce((s, c) => s + c.risk_score, 0) / cases.length);
  }, [cases]);

  const riskColor = avgRisk < 30 ? 'var(--v3-green)' : avgRisk < 50 ? 'var(--v3-amber)' : avgRisk < 70 ? '#F97316' : 'var(--v3-red)';

  return (
    <div className="p-5 space-y-4">
      {/* ── Top Section: Central gauge + flanking metrics ── */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left metrics */}
        <div className="col-span-3 space-y-3">
          {[
            { label: 'Total Cases', value: stats?.total_cases ?? 0, icon: Briefcase, color: 'var(--v3-accent)' },
            { label: 'Pending Review', value: stats?.pending_review ?? 0, icon: Clock, color: 'var(--v3-amber)' },
          ].map(m => (
            <div
              key={m.label}
              className="border rounded-none p-4"
              style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <m.icon size={14} style={{ color: m.color }} />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--v3-text-muted)' }}>{m.label}</span>
              </div>
              <div className="text-3xl font-bold font-mono" style={{ color: 'var(--v3-text)' }}>{fmt(m.value)}</div>
            </div>
          ))}
        </div>

        {/* Center — Threat Level Gauge */}
        <div className="col-span-6">
          <div
            className="border rounded-none p-6 flex flex-col items-center justify-center h-full relative"
            style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
          >
            <div className="absolute top-4 left-5 flex items-center gap-2">
              <Crosshair size={12} style={{ color: riskColor }} />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--v3-text-muted)' }}>
                AGGREGATE THREAT LEVEL
              </span>
            </div>
            <RiskScoreCircle score={avgRisk} size="lg" />
            <div className="mt-3 text-center">
              <div className="text-xs font-bold uppercase tracking-widest" style={{ color: riskColor }}>
                {avgRisk < 30 ? 'LOW' : avgRisk < 50 ? 'MODERATE' : avgRisk < 70 ? 'ELEVATED' : 'SEVERE'}
              </div>
              <div className="text-[10px] mt-1" style={{ color: 'var(--v3-text-muted)' }}>
                Across {stats?.total_cases ?? 0} active cases
              </div>
            </div>

            {/* Risk bar at bottom */}
            <div className="absolute bottom-4 left-5 right-5">
              <div className="flex h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--v3-border)' }}>
                {[
                  { pct: pct(stats?.risk_distribution.low ?? 0, stats?.total_cases ?? 1), color: 'var(--v3-green)' },
                  { pct: pct(stats?.risk_distribution.medium ?? 0, stats?.total_cases ?? 1), color: 'var(--v3-amber)' },
                  { pct: pct(stats?.risk_distribution.high ?? 0, stats?.total_cases ?? 1), color: '#F97316' },
                  { pct: pct(stats?.risk_distribution.critical ?? 0, stats?.total_cases ?? 1), color: 'var(--v3-red)' },
                ].map((seg, i) => (
                  <div key={i} style={{ width: `${seg.pct}%`, background: seg.color, minWidth: seg.pct > 0 ? '2px' : '0' }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right metrics */}
        <div className="col-span-3 space-y-3">
          {[
            { label: 'High Risk', value: stats?.high_risk ?? 0, icon: AlertTriangle, color: 'var(--v3-red)' },
            { label: 'Cleared Today', value: stats?.approved_today ?? 0, icon: CheckCircle, color: 'var(--v3-green)' },
          ].map(m => (
            <div
              key={m.label}
              className="border rounded-none p-4"
              style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <m.icon size={14} style={{ color: m.color }} />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--v3-text-muted)' }}>{m.label}</span>
              </div>
              <div className="text-3xl font-bold font-mono" style={{ color: m.value > 0 && m.color === 'var(--v3-red)' ? m.color : 'var(--v3-text)' }}>
                {fmt(m.value)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Status Columns — Kanban-style ── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { key: 'new', label: 'INCOMING', color: 'var(--v3-text-secondary)', icon: Layers },
          { key: 'in_review', label: 'IN REVIEW', color: 'var(--v3-amber)', icon: Eye },
          { key: 'escalated', label: 'ESCALATED', color: 'var(--v3-red)', icon: AlertTriangle },
          { key: 'approved', label: 'CLEARED', color: 'var(--v3-green)', icon: CheckCircle },
        ].map(col => (
          <div
            key={col.key}
            className="border rounded-none overflow-hidden"
            style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
          >
            <div className="px-3 py-2 border-b flex items-center justify-between" style={{ borderColor: 'var(--v3-border)' }}>
              <div className="flex items-center gap-2">
                <col.icon size={12} style={{ color: col.color }} />
                <span className="text-[9px] font-bold tracking-[0.15em]" style={{ color: col.color }}>{col.label}</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--v3-text-secondary)' }}>
                {(statusGroups[col.key] || []).length}
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto v3-scrollbar p-2 space-y-1.5">
              {(statusGroups[col.key] || []).slice(0, 5).map(c => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/v3/cases/${c.id}`)}
                  className="p-2 rounded-sm border cursor-pointer transition-all hover:border-[var(--v3-border-hover)] hover:bg-white/[0.02]"
                  style={{ borderColor: 'var(--v3-border)' }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--v3-accent)' }}>{c.case_id}</span>
                    <RiskBadge level={c.risk_level as any} />
                  </div>
                  <span className="text-[10px]" style={{ color: 'var(--v3-text-secondary)' }}>
                    {c.applicant.firstName} {c.applicant.lastName}
                  </span>
                </div>
              ))}
              {(statusGroups[col.key] || []).length === 0 && (
                <div className="text-center py-6 text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>Empty</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Bottom: Activity ── */}
      <div
        className="border rounded-none overflow-hidden"
        style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
      >
        <div className="px-4 py-2.5 border-b flex items-center gap-2" style={{ borderColor: 'var(--v3-border)' }}>
          <Activity size={12} style={{ color: 'var(--v3-accent)' }} />
          <span className="text-[9px] font-bold tracking-[0.15em] uppercase" style={{ color: 'var(--v3-text-muted)' }}>
            Operations Log
          </span>
        </div>
        <div className="grid grid-cols-2 divide-x" style={{ borderColor: 'var(--v3-border)' }}>
          <div className="max-h-40 overflow-y-auto v3-scrollbar" style={{ borderColor: 'var(--v3-border)' }}>
            {(stats?.recent_activity || []).slice(0, 6).map(entry => (
              <div key={entry.id} className="flex items-center gap-3 px-4 py-2 border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: 'var(--v3-border)' }}>
                <div className="w-1 h-1 rounded-full shrink-0" style={{ background: 'var(--v3-accent)' }} />
                <p className="text-[10px] flex-1 truncate" style={{ color: 'var(--v3-text-secondary)' }}>{entry.description}</p>
                <span className="text-[9px] font-mono shrink-0" style={{ color: 'var(--v3-text-muted)' }}>
                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
          <div className="max-h-40 overflow-y-auto v3-scrollbar" style={{ borderColor: 'var(--v3-border)' }}>
            {(stats?.recent_activity || []).slice(6, 12).map(entry => (
              <div key={entry.id} className="flex items-center gap-3 px-4 py-2 border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: 'var(--v3-border)' }}>
                <div className="w-1 h-1 rounded-full shrink-0" style={{ background: 'var(--v3-accent)' }} />
                <p className="text-[10px] flex-1 truncate" style={{ color: 'var(--v3-text-secondary)' }}>{entry.description}</p>
                <span className="text-[9px] font-mono shrink-0" style={{ color: 'var(--v3-text-muted)' }}>
                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   ALTERNATIVE C — "ANALYST WORKSPACE"
   Linear × Notion × Stripe
   Clean, scannable, card-based, search-first
   ───────────────────────────────────────────────── */

function DashboardC({ stats, cases, navigate }: DashboardProps) {
  const [view, setView] = useState<'overview' | 'risk'>('overview');

  const riskDist = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Low', value: stats.risk_distribution.low || 0, color: 'var(--v3-green)' },
      { name: 'Medium', value: stats.risk_distribution.medium || 0, color: 'var(--v3-amber)' },
      { name: 'High', value: stats.risk_distribution.high || 0, color: '#F97316' },
      { name: 'Critical', value: stats.risk_distribution.critical || 0, color: 'var(--v3-red)' },
    ];
  }, [stats]);

  const barData = riskDist.map(d => ({ name: d.name, value: d.value }));

  return (
    <div className="p-5 space-y-5">
      {/* ── Header with inline tabs ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--v3-text)' }}>Intelligence Overview</h1>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--v3-text-muted)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-1 p-0.5 rounded-md border" style={{ borderColor: 'var(--v3-border)', background: 'var(--v3-bg)' }}>
          {['overview', 'risk'].map(v => (
            <button
              key={v}
              onClick={() => setView(v as any)}
              className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-colors"
              style={{
                background: view === v ? 'var(--v3-surface)' : 'transparent',
                color: view === v ? 'var(--v3-text)' : 'var(--v3-text-muted)',
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === 'overview' ? (
        <>
          {/* ── Metric Cards — 2-row layout ── */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total Cases', value: stats?.total_cases ?? 0, sub: 'All time', icon: Briefcase, color: 'var(--v3-accent)' },
              { label: 'Awaiting Review', value: stats?.pending_review ?? 0, sub: 'Action needed', icon: Clock, color: 'var(--v3-amber)' },
              { label: 'High Risk', value: stats?.high_risk ?? 0, sub: 'Requires attention', icon: Shield, color: 'var(--v3-red)' },
              { label: 'Cleared', value: stats?.approved_today ?? 0, sub: 'Approved', icon: CheckCircle, color: 'var(--v3-green)' },
            ].map(m => (
              <div
                key={m.label}
                className="border rounded-md p-4 group cursor-default transition-all hover:border-[var(--v3-border-hover)]"
                style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: `${m.color}15` }}>
                    <m.icon size={14} style={{ color: m.color }} />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--v3-text-muted)' }}>{m.label}</span>
                </div>
                <div className="text-2xl font-bold font-mono" style={{ color: 'var(--v3-text)' }}>{fmt(m.value)}</div>
                <div className="text-[10px] mt-1" style={{ color: 'var(--v3-text-muted)' }}>{m.sub}</div>
              </div>
            ))}
          </div>

          {/* ── Case Cards — Clean list ── */}
          <div
            className="border rounded-md overflow-hidden"
            style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
          >
            <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--v3-border)' }}>
              <span className="text-xs font-bold" style={{ color: 'var(--v3-text)' }}>Recent Cases</span>
              <button onClick={() => navigate('/v3/cases')} className="text-[10px] font-medium flex items-center gap-1" style={{ color: 'var(--v3-accent)' }}>
                View all <ChevronRight size={12} />
              </button>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--v3-border)' }}>
              {cases.slice(0, 6).map(c => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/v3/cases/${c.id}`)}
                  className="flex items-center gap-4 px-5 py-3 cursor-pointer transition-colors hover:bg-white/[0.02]"
                  style={{ borderColor: 'var(--v3-border)' }}
                >
                  {/* Risk indicator dot */}
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      background: c.risk_level === 'low' ? 'var(--v3-green)' :
                        c.risk_level === 'medium' ? 'var(--v3-amber)' :
                        c.risk_level === 'high' ? '#F97316' : 'var(--v3-red)'
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium" style={{ color: 'var(--v3-text)' }}>
                        {c.applicant.firstName} {c.applicant.lastName}
                      </span>
                      <span className="text-[10px] font-mono" style={{ color: 'var(--v3-text-muted)' }}>{c.case_id}</span>
                    </div>
                    <span className="text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>
                      {c.applicant.nationality} → {c.travel_destination} · {c.consulate_location}
                    </span>
                  </div>
                  <StatusBadge status={c.status as any} />
                  <RiskBadge level={c.risk_level as any} />
                  <span className="text-[10px] font-mono shrink-0" style={{ color: 'var(--v3-text-muted)' }}>
                    {c.application_date?.slice(0, 10)}
                  </span>
                  <ChevronRight size={14} style={{ color: 'var(--v3-text-muted)' }} />
                </div>
              ))}
            </div>
          </div>

          {/* ── Activity — Minimal ── */}
          <div
            className="border rounded-md overflow-hidden"
            style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
          >
            <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--v3-border)' }}>
              <span className="text-xs font-bold" style={{ color: 'var(--v3-text)' }}>Activity</span>
            </div>
            <div className="max-h-48 overflow-y-auto v3-scrollbar divide-y" style={{ borderColor: 'var(--v3-border)' }}>
              {(stats?.recent_activity || []).slice(0, 8).map(entry => (
                <div key={entry.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'var(--v3-border)' }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--v3-accent-muted)' }}>
                    <Activity size={10} style={{ color: 'var(--v3-accent)' }} />
                  </div>
                  <p className="text-[11px] flex-1" style={{ color: 'var(--v3-text-secondary)' }}>{entry.description}</p>
                  <span className="text-[10px] font-mono" style={{ color: 'var(--v3-text-muted)' }}>
                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* ── Risk Analysis View ── */
        <>
          <div className="grid grid-cols-2 gap-4">
            {/* Risk Bar Chart */}
            <div
              className="border rounded-md p-5"
              style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--v3-text-muted)' }}>
                Distribution by Level
              </span>
              <div className="h-56 mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} barSize={32}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--v3-text-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--v3-text-muted)' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      contentStyle={{ background: 'var(--v3-surface)', border: '1px solid var(--v3-border)', borderRadius: '4px', fontSize: '11px', color: 'var(--v3-text)' }}
                    />
                    <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                      {riskDist.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Highest risk cases */}
            <div
              className="border rounded-md overflow-hidden"
              style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
            >
              <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--v3-border)' }}>
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--v3-text-muted)' }}>
                  Highest Risk Cases
                </span>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--v3-border)' }}>
                {[...cases].sort((a, b) => b.risk_score - a.risk_score).slice(0, 6).map(c => (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/v3/cases/${c.id}`)}
                    className="flex items-center gap-4 px-5 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                    style={{ borderColor: 'var(--v3-border)' }}
                  >
                    <RiskScoreCircle score={c.risk_score} size="sm" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium" style={{ color: 'var(--v3-text)' }}>
                        {c.applicant.firstName} {c.applicant.lastName}
                      </span>
                      <div className="text-[10px] font-mono" style={{ color: 'var(--v3-text-muted)' }}>{c.case_id}</div>
                    </div>
                    <RiskBadge level={c.risk_level as any} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── SHARED TYPES ─── */
interface DashboardProps {
  stats: any;
  cases: any[];
  navigate: (path: string) => void;
}

/* ─── DEMO PAGE ─── */
export default function V3Demo() {
  const navigate = useNavigate();
  const { data: stats, loading: statsLoading } = useV3Dashboard();
  const { data: casesData, loading: casesLoading } = useV3Cases({ page: 1, per_page: 20 });
  const [activeTab, setActiveTab] = useState<TabId>('a');

  const cases = casesData?.items || [];

  if (statsLoading || casesLoading) return <DemoSkeleton />;

  return (
    <div className="h-full flex flex-col">
      {/* Tab Switcher */}
      <div className="shrink-0 px-5 pt-4 pb-0 flex items-center gap-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--v3-text-muted)' }}>
          DASHBOARD VARIANTS
        </span>
        <div className="flex gap-1 p-0.5 rounded-md border" style={{ borderColor: 'var(--v3-border)', background: 'var(--v3-bg)' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all"
              style={{
                background: activeTab === tab.id ? 'var(--v3-surface)' : 'transparent',
                color: activeTab === tab.id ? 'var(--v3-accent)' : 'var(--v3-text-muted)',
                borderBottom: activeTab === tab.id ? '2px solid var(--v3-accent)' : '2px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="flex-1 overflow-y-auto v3-scrollbar">
        {activeTab === 'a' && <DashboardA stats={stats} cases={cases} navigate={navigate} />}
        {activeTab === 'b' && <DashboardB stats={stats} cases={cases} navigate={navigate} />}
        {activeTab === 'c' && <DashboardC stats={stats} cases={cases} navigate={navigate} />}
      </div>
    </div>
  );
}
