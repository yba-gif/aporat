import { useMemo } from 'react';
import {
  Briefcase, Clock, AlertTriangle, Loader2, CheckCircle,
  Activity, ChevronRight, ArrowRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell
} from 'recharts';
import { useV3Dashboard, useV3Cases } from '@/api/v3-hooks';
import { useNavigate } from 'react-router-dom';

export default function V3Dashboard() {
  const navigate = useNavigate();
  const { data: stats, loading: statsLoading } = useV3Dashboard();
  const { data: casesData, loading: casesLoading } = useV3Cases({ page: 1, per_page: 10 });

  const cases = casesData?.items || [];

  const riskData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Low', value: stats.risk_distribution.low || 0, fill: '#4ade80' },
      { name: 'Medium', value: stats.risk_distribution.medium || 0, fill: '#fbbf24' },
      { name: 'High', value: stats.risk_distribution.high || 0, fill: '#fb923c' },
      { name: 'Critical', value: stats.risk_distribution.critical || 0, fill: '#f87171' },
    ];
  }, [stats]);

  const trendData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => ({
      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      cases: Math.floor(Math.random() * 10 + 3),
      risk: Math.floor(Math.random() * 6 + 1),
    }));
  }, []);

  if (statsLoading || casesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--v3-accent)' }} />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--v3-border) transparent' }}>
      <div className="max-w-6xl mx-auto px-8 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--v3-text)' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--v3-text-muted)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} · {stats?.total_cases ?? 0} active cases
          </p>
        </div>

        {/* KPI Cards — No icons, clean numbers */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Cases', value: stats?.total_cases ?? 0, sub: 'All investigations', color: 'var(--v3-accent)' },
            { label: 'Pending Review', value: stats?.pending_review ?? 0, sub: 'Awaiting decision', color: 'var(--v3-amber)' },
            { label: 'High Risk', value: stats?.high_risk ?? 0, sub: 'Flagged entities', color: 'var(--v3-red)' },
            { label: 'Approved', value: stats?.approved_today ?? 0, sub: 'Cases cleared', color: 'var(--v3-green)' },
          ].map(m => (
            <div
              key={m.label}
              className="rounded-xl p-5 border transition-all duration-200 hover:border-[var(--v3-border-hover)]"
              style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
            >
              <div className="text-[11px] font-medium mb-5" style={{ color: 'var(--v3-text-muted)' }}>
                {m.label}
              </div>
              <div className="text-3xl font-semibold tracking-tight" style={{ color: 'var(--v3-text)' }}>
                {m.value}
              </div>
              <div className="text-[10px] mt-1.5" style={{ color: 'var(--v3-text-muted)' }}>{m.sub}</div>
              {/* Subtle accent line at bottom */}
              <div className="h-0.5 rounded-full mt-4 w-8" style={{ background: m.color + '44' }} />
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-5 gap-4">
          {/* Trend Chart — 3 cols */}
          <div className="col-span-3 rounded-xl border p-5" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold" style={{ color: 'var(--v3-text)' }}>Weekly Trend</span>
              <div className="flex gap-4 text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: 'var(--v3-accent)' }} />
                  Cases
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: 'var(--v3-red)' }} />
                  High Risk
                </span>
              </div>
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="gradAccent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--v3-accent)" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="var(--v3-accent)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradRed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--v3-red)" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="var(--v3-red)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--v3-text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--v3-text-muted)' }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--v3-surface)',
                      border: '1px solid var(--v3-border)',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: 'var(--v3-text)',
                    }}
                  />
                  <Area type="monotone" dataKey="cases" stroke="var(--v3-accent)" fill="url(#gradAccent)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="risk" stroke="var(--v3-red)" fill="url(#gradRed)" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Distribution — 2 cols */}
          <div className="col-span-2 rounded-xl border p-5" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
            <span className="text-sm font-semibold" style={{ color: 'var(--v3-text)' }}>Risk Distribution</span>
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
                        <span className="text-[11px] font-medium flex items-center gap-2" style={{ color: 'var(--v3-text-secondary)' }}>
                          <span className="w-2 h-2 rounded-full" style={{ background: d.fill }} />
                          {d.name}
                        </span>
                        <span className="text-[11px] font-semibold font-mono" style={{ color: 'var(--v3-text)' }}>{d.value}</span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--v3-border)' }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pctVal}%`, background: d.fill }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Cases List */}
        <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--v3-border)' }}>
            <span className="text-sm font-semibold" style={{ color: 'var(--v3-text)' }}>Recent Cases</span>
            <button
              onClick={() => navigate('/v3/cases')}
              className="text-[11px] font-medium flex items-center gap-1 hover:gap-2 transition-all"
              style={{ color: 'var(--v3-accent)' }}
            >
              View all cases <ArrowRight size={12} />
            </button>
          </div>
          <div>
            {cases.map((c: any) => {
              const riskColor = c.risk_level === 'critical' ? '#f87171'
                : c.risk_level === 'high' ? '#fb923c'
                : c.risk_level === 'medium' ? '#fbbf24'
                : '#4ade80';
              return (
                <div
                  key={c.id}
                  onClick={() => navigate(`/v3/cases/${c.id}`)}
                  className="flex items-center gap-5 px-6 py-3.5 border-b cursor-pointer transition-all hover:bg-white/[0.02]"
                  style={{ borderColor: 'var(--v3-border)' }}
                >
                  {/* Initials avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
                    style={{ background: riskColor + '15', color: riskColor }}
                  >
                    {c.applicant.firstName?.[0]}{c.applicant.lastName?.[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium" style={{ color: 'var(--v3-text)' }}>
                        {c.applicant.firstName} {c.applicant.lastName}
                      </span>
                      <span
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--v3-surface-hover)', color: 'var(--v3-text-muted)' }}
                      >
                        {c.case_id}
                      </span>
                    </div>
                    <span className="text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>
                      {c.applicant.nationality} → {c.travel_destination}
                    </span>
                  </div>

                  {/* Ring score */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>Risk</div>
                      <div className="text-sm font-semibold font-mono" style={{ color: riskColor }}>{c.risk_score}</div>
                    </div>
                    <div className="w-8 h-8 rounded-full relative">
                      <svg width={32} height={32} className="-rotate-90">
                        <circle cx={16} cy={16} r={13} fill="none" stroke="var(--v3-border)" strokeWidth={2} />
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
                      background: c.status === 'approved' ? 'var(--v3-green-muted)' : c.status === 'escalated' ? 'var(--v3-red-muted)' : 'var(--v3-surface-hover)',
                      color: c.status === 'approved' ? 'var(--v3-green)' : c.status === 'escalated' ? 'var(--v3-red)' : 'var(--v3-text-secondary)',
                    }}
                  >
                    {c.status?.replace('_', ' ')}
                  </span>

                  <ChevronRight size={14} style={{ color: 'var(--v3-text-muted)' }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity */}
        <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--v3-border)' }}>
            <span className="text-sm font-semibold" style={{ color: 'var(--v3-text)' }}>Activity</span>
          </div>
          <div>
            {(stats?.recent_activity || []).slice(0, 6).map((entry: any) => (
              <div
                key={entry.id}
                className="flex items-center gap-4 px-6 py-3 border-b hover:bg-white/[0.01] transition-colors"
                style={{ borderColor: 'var(--v3-border)' }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'var(--v3-accent-muted)' }}
                >
                  <Activity size={12} style={{ color: 'var(--v3-accent)' }} />
                </div>
                <p className="text-[11px] flex-1" style={{ color: 'var(--v3-text-secondary)' }}>{entry.description}</p>
                <span className="text-[10px] font-mono" style={{ color: 'var(--v3-text-muted)' }}>
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
