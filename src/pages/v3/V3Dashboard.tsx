import { useMemo } from 'react';
import {
  Briefcase, Clock, AlertTriangle, Loader2, Timer, TrendingUp,
  ArrowUpRight, ArrowDownRight, Minus, CheckCircle, XCircle, Search, AlertCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useV3Dashboard, useV3Cases } from '@/api/v3-hooks';
import { nationalityFlags } from '@/data/v3/mockData';
import { RiskBadge, StatusBadge } from '@/components/v3/V3Badges';
import { useNavigate } from 'react-router-dom';

const activityIcons: Record<string, typeof CheckCircle> = {
  scan_completed: Search, scan_complete: Search,
  escalated: AlertTriangle, case_escalated: AlertTriangle,
  approved: CheckCircle, case_approved: CheckCircle,
  rejected: XCircle, case_rejected: XCircle,
  finding_added: AlertCircle,
  scan_started: Loader2, created: Briefcase,
  reviewed: CheckCircle, risk_scored: AlertCircle,
};

const activityColors: Record<string, string> = {
  scan_completed: 'var(--v3-accent)', scan_complete: 'var(--v3-accent)',
  escalated: 'var(--v3-amber)', case_escalated: 'var(--v3-amber)',
  approved: 'var(--v3-green)', case_approved: 'var(--v3-green)',
  rejected: 'var(--v3-red)', case_rejected: 'var(--v3-red)',
  finding_added: 'var(--v3-red)',
  scan_started: 'var(--v3-accent)', created: 'var(--v3-text-muted)',
  reviewed: 'var(--v3-text-secondary)', risk_scored: 'var(--v3-accent)',
};

export default function V3Dashboard() {
  const navigate = useNavigate();
  const { data: stats, loading: statsLoading } = useDashboard();
  const { data: casesData, loading: casesLoading } = useCases({ page: 1, per_page: 10 });

  const recentCases = casesData?.items || [];

  const kpiCards = useMemo(() => {
    if (!stats) return [];
    return [
      { label: 'Total Cases', value: stats.total_cases, icon: Briefcase, accent: 'var(--v3-accent)' },
      { label: 'Pending Review', value: stats.pending_review, icon: Clock, accent: 'var(--v3-amber)', warn: stats.pending_review > 10 },
      { label: 'High Risk Flagged', value: stats.high_risk, icon: AlertTriangle, accent: 'var(--v3-red)', pulse: stats.high_risk > 0 },
      { label: 'Approved Today', value: stats.approved_today, icon: CheckCircle, accent: 'var(--v3-green)' },
    ];
  }, [stats]);

  const riskDistribution = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Low', value: stats.risk_distribution.low || 0, color: 'var(--v3-green)' },
      { name: 'Medium', value: stats.risk_distribution.medium || 0, color: 'var(--v3-amber)' },
      { name: 'High', value: stats.risk_distribution.high || 0, color: '#F97316' },
      { name: 'Critical', value: stats.risk_distribution.critical || 0, color: 'var(--v3-red)' },
    ];
  }, [stats]);

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--v3-accent)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-3">
        {kpiCards.map(kpi => (
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
                className={kpi.pulse ? 'v3-pulse-red' : ''}
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
          {casesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={18} className="animate-spin" style={{ color: 'var(--v3-accent)' }} />
            </div>
          ) : (
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
                    <td className="px-4 py-2 font-mono" style={{ color: 'var(--v3-accent)' }}>{c.case_id}</td>
                    <td className="px-4 py-2" style={{ color: 'var(--v3-text)' }}>{c.applicant.firstName} {c.applicant.lastName}</td>
                    <td className="px-1">{nationalityFlags[c.applicant.nationality] || ''}</td>
                    <td className="px-4 py-2"><RiskBadge level={c.risk_level as any} /></td>
                    <td className="px-4 py-2"><StatusBadge status={c.status as any} /></td>
                    <td className="px-4 py-2 font-mono" style={{ color: 'var(--v3-text-muted)' }}>{c.application_date?.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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

      {/* Activity Feed */}
      <div
        className="border rounded-md overflow-hidden"
        style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
      >
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--v3-border)' }}>
          <span className="text-xs font-semibold tracking-wide" style={{ color: 'var(--v3-text)' }}>Activity Feed</span>
        </div>
        <div className="max-h-64 overflow-y-auto v3-scrollbar">
          {(stats?.recent_activity || []).map(entry => {
            const Icon = activityIcons[entry.type] || AlertCircle;
            return (
              <div
                key={entry.id}
                className="flex items-start gap-3 px-4 py-2.5 border-b transition-colors hover:bg-white/[0.02]"
                style={{ borderColor: 'var(--v3-border)' }}
              >
                <Icon size={14} style={{ color: activityColors[entry.type] || 'var(--v3-text-muted)', marginTop: 2 }} />
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
    </div>
  );
}
