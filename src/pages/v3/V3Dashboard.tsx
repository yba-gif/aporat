import { useMemo } from 'react';
import {
  Briefcase, Clock, AlertTriangle, Loader2, Timer, TrendingUp,
  ArrowUpRight, ArrowDownRight, Minus, CheckCircle, XCircle, Search, AlertCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { v3Cases, kpiData, activityFeed, topRiskSignals, nationalityFlags } from '@/data/v3/mockData';
import { RiskBadge, StatusBadge } from '@/components/v3/V3Badges';
import { useNavigate } from 'react-router-dom';

const KPI_CARDS = [
  { label: 'Total Cases', value: kpiData.totalCases, icon: Briefcase, accent: 'var(--v3-accent)' },
  { label: 'Pending Review', value: kpiData.pendingReview, icon: Clock, accent: 'var(--v3-amber)', warn: kpiData.pendingReview > 10 },
  { label: 'High Risk Flagged', value: kpiData.highRiskFlagged, icon: AlertTriangle, accent: 'var(--v3-red)', pulse: kpiData.highRiskFlagged > 0 },
  { label: 'Active Scans', value: kpiData.activeScans, icon: Loader2, accent: 'var(--v3-accent)', spin: kpiData.activeScans > 0 },
  { label: 'Avg Processing', value: kpiData.avgProcessingTime, icon: Timer, accent: 'var(--v3-text-secondary)' },
  { label: 'Approval Rate', value: `${kpiData.approvalRate}%`, icon: TrendingUp, accent: 'var(--v3-green)' },
];

const activityIcons: Record<string, typeof CheckCircle> = {
  scan_complete: Search,
  case_escalated: AlertTriangle,
  case_approved: CheckCircle,
  case_rejected: XCircle,
  finding_added: AlertCircle,
  scan_started: Loader2,
};

const activityColors: Record<string, string> = {
  scan_complete: 'var(--v3-accent)',
  case_escalated: 'var(--v3-amber)',
  case_approved: 'var(--v3-green)',
  case_rejected: 'var(--v3-red)',
  finding_added: 'var(--v3-red)',
  scan_started: 'var(--v3-accent)',
};

export default function V3Dashboard() {
  const navigate = useNavigate();
  const recentCases = v3Cases.slice(0, 10);

  const riskDistribution = useMemo(() => {
    const counts = { low: 0, medium: 0, high: 0, critical: 0 };
    v3Cases.forEach(c => counts[c.riskLevel]++);
    return [
      { name: 'Low', value: counts.low, color: 'var(--v3-green)' },
      { name: 'Medium', value: counts.medium, color: 'var(--v3-amber)' },
      { name: 'High', value: counts.high, color: '#F97316' },
      { name: 'Critical', value: counts.critical, color: 'var(--v3-red)' },
    ];
  }, []);

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-6 gap-3">
        {KPI_CARDS.map(kpi => (
          <div
            key={kpi.label}
            className="border rounded-md p-4 transition-colors duration-150 hover:border-[var(--v3-border-hover)]"
            style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold tracking-wide uppercase" style={{ color: 'var(--v3-text-muted)' }}>
                {kpi.label}
              </span>
              <kpi.icon
                size={14}
                style={{ color: kpi.accent }}
                className={kpi.spin ? 'animate-spin' : kpi.pulse ? 'v3-pulse-red' : ''}
              />
            </div>
            <div className="text-2xl font-bold font-mono" style={{ color: kpi.warn ? kpi.accent : 'var(--v3-text)' }}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-5 gap-4">
        {/* Recent Cases */}
        <div
          className="col-span-3 border rounded-md overflow-hidden"
          style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
        >
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--v3-border)' }}>
            <span className="text-xs font-semibold tracking-wide" style={{ color: 'var(--v3-text)' }}>Recent Cases</span>
            <button onClick={() => navigate('/v3/cases')} className="text-[11px]" style={{ color: 'var(--v3-accent)' }}>View All</button>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--v3-border)' }}>
                {['Case ID', 'Applicant', '', 'Risk', 'Status', 'Time'].map(h => (
                  <th key={h} className="px-4 py-2 text-left font-semibold" style={{ color: 'var(--v3-text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentCases.map(c => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/v3/cases/${c.id}`)}
                  className="cursor-pointer transition-colors duration-150 hover:bg-white/[0.03]"
                  style={{ borderBottom: '1px solid var(--v3-border)' }}
                >
                  <td className="px-4 py-2 font-mono" style={{ color: 'var(--v3-accent)' }}>{c.caseId}</td>
                  <td className="px-4 py-2" style={{ color: 'var(--v3-text)' }}>{c.applicant.firstName} {c.applicant.lastName}</td>
                  <td className="px-1">{nationalityFlags[c.applicant.nationality]}</td>
                  <td className="px-4 py-2"><RiskBadge level={c.riskLevel} /></td>
                  <td className="px-4 py-2"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-2 font-mono" style={{ color: 'var(--v3-text-muted)' }}>{c.applicationDate.slice(5)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Risk Distribution */}
        <div
          className="col-span-2 border rounded-md p-4"
          style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
        >
          <span className="text-xs font-semibold tracking-wide" style={{ color: 'var(--v3-text)' }}>Risk Distribution</span>
          <div className="h-48 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskDistribution} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                  {riskDistribution.map((d, i) => <Cell key={i} fill={d.color} stroke="none" />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--v3-surface)', border: '1px solid var(--v3-border)', borderRadius: '4px', fontSize: '11px', color: 'var(--v3-text)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-1">
            {riskDistribution.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                <span style={{ color: 'var(--v3-text-secondary)' }}>{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-5 gap-4">
        {/* Activity Feed */}
        <div
          className="col-span-3 border rounded-md overflow-hidden"
          style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--v3-border)' }}>
            <span className="text-xs font-semibold tracking-wide" style={{ color: 'var(--v3-text)' }}>Activity Feed</span>
          </div>
          <div className="max-h-64 overflow-y-auto v3-scrollbar">
            {activityFeed.map(entry => {
              const Icon = activityIcons[entry.type] || AlertCircle;
              return (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 px-4 py-2.5 border-b transition-colors hover:bg-white/[0.02]"
                  style={{ borderColor: 'var(--v3-border)' }}
                >
                  <Icon size={14} style={{ color: activityColors[entry.type], marginTop: 2 }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--v3-text-secondary)' }}>{entry.description}</p>
                  </div>
                  <span className="text-[10px] font-mono shrink-0" style={{ color: 'var(--v3-text-muted)' }}>
                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Risk Signals */}
        <div
          className="col-span-2 border rounded-md overflow-hidden"
          style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--v3-border)' }}>
            <span className="text-xs font-semibold tracking-wide" style={{ color: 'var(--v3-text)' }}>Top Risk Signals (This Week)</span>
          </div>
          <div className="p-2">
            {topRiskSignals.map((signal, i) => {
              const TrendIcon = signal.trend === 'up' ? ArrowUpRight : signal.trend === 'down' ? ArrowDownRight : Minus;
              const trendColor = signal.trend === 'up' ? 'var(--v3-red)' : signal.trend === 'down' ? 'var(--v3-green)' : 'var(--v3-text-muted)';
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors hover:bg-white/[0.03]"
                >
                  <span className="text-xs font-mono w-5 text-right" style={{ color: 'var(--v3-text-muted)' }}>{i + 1}.</span>
                  <span className="flex-1 text-xs" style={{ color: 'var(--v3-text-secondary)' }}>{signal.label}</span>
                  <span className="text-xs font-bold font-mono" style={{ color: 'var(--v3-text)' }}>{signal.count}</span>
                  <TrendIcon size={12} style={{ color: trendColor }} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
