import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, Database, AlertTriangle, ExternalLink } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useDashboardStats, useTopThreats, useInstallations } from '@/hooks/useDefenceApi';
import { SeverityBadge, SeverityDot } from '@/components/defence/SeverityBadge';
import { PlatformIcon } from '@/components/defence/PlatformIcon';
import { StatusDot } from '@/components/defence/StatusDot';
import { StatCardSkeleton, AlertCardSkeleton } from '@/components/defence/DefenceSkeletons';

const SEVERITY_COLORS: Record<string, string> = { critical: '#EF4444', high: '#F59E0B', medium: '#EAB308', low: '#3B82F6' };

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DefenceDashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: threats, isLoading: threatsLoading } = useTopThreats();
  const { data: installations } = useInstallations();
  const navigate = useNavigate();

  const severityData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.alerts_by_severity).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value,
      color: SEVERITY_COLORS[key],
    }));
  }, [stats]);

  const collectors = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.collectors_status).map(([platform, status]) => ({
      platform,
      status: status as 'running' | 'idle' | 'error' | 'disabled',
    }));
  }, [stats]);

  const kpis = stats ? [
    { label: 'Total Alerts', value: stats.total_alerts, sub: `${stats.alerts_last_24h} in last 24h`, icon: AlertTriangle, accent: stats.total_alerts > 0 ? '#EF4444' : '#3B82F6' },
    { label: 'Monitored Personnel', value: stats.total_persons, sub: 'Active profiles', icon: Users, accent: '#3B82F6' },
    { label: 'Active Installations', value: stats.total_installations, sub: 'Geofenced zones', icon: Building2, accent: '#10B981' },
    { label: 'Content Collected', value: stats.total_content.toLocaleString(), sub: 'Across all platforms', icon: Database, accent: '#A855F7' },
  ] : [];

  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          kpis.map(kpi => (
            <div key={kpi.label} className="rounded-lg border p-4 relative overflow-hidden" style={{ background: '#111827', borderColor: '#1E293B' }}>
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${kpi.accent}, transparent)` }} />
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">{kpi.label}</span>
                <kpi.icon size={16} style={{ color: kpi.accent }} />
              </div>
              <div className="text-2xl font-bold text-white font-mono">{kpi.value}</div>
              <div className="text-[11px] text-slate-500 mt-1">{kpi.sub}</div>
            </div>
          ))
        )}
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Alerts by Severity */}
        <div className="lg:col-span-3 rounded-lg border p-5" style={{ background: '#111827', borderColor: '#1E293B' }}>
          <h3 className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-4">Alerts by Severity</h3>
          <div className="flex items-center gap-8">
            <div className="w-40 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={severityData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value" stroke="none">
                    {severityData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: '6px', fontSize: '11px', color: '#E5E7EB' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2.5">
              {severityData.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
                    <span className="text-xs text-slate-400">{d.name}</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-white">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Collector Status */}
        <div className="lg:col-span-2 rounded-lg border p-5" style={{ background: '#111827', borderColor: '#1E293B' }}>
          <h3 className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-4">Collector Status</h3>
          <div className="grid grid-cols-2 gap-2">
            {collectors.map(c => (
              <div key={c.platform} className="flex items-center gap-2 p-2 rounded-md" style={{ background: '#0A0F1C' }}>
                <PlatformIcon platform={c.platform} size="sm" />
                <span className="text-[11px] text-slate-400 flex-1 capitalize">{c.platform}</span>
                <StatusDot status={c.status} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Live Alert Feed */}
        <div className="lg:col-span-3 rounded-lg border p-5" style={{ background: '#111827', borderColor: '#1E293B' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Live Alert Feed</h3>
            <button onClick={() => navigate('/v3/defence/alerts')} className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors">
              View All <ExternalLink size={10} />
            </button>
          </div>
          <div className="space-y-1.5 max-h-[280px] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1E293B transparent' }}>
            {threatsLoading ? (
              Array.from({ length: 5 }).map((_, i) => <AlertCardSkeleton key={i} />)
            ) : threats?.length === 0 ? (
              <div className="text-center py-8 text-slate-600 text-xs">No active threats</div>
            ) : (
              threats?.map(alert => (
                <button
                  key={alert.id}
                  onClick={() => navigate('/v3/defence/alerts')}
                  className="flex items-center gap-3 w-full p-2.5 rounded-md text-left transition-colors hover:bg-white/[0.03]"
                >
                  <SeverityDot severity={alert.severity} pulse={alert.status === 'new'} />
                  <PlatformIcon platform={alert.platform} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] text-slate-200 font-medium truncate">{alert.title}</div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-600 shrink-0">{timeAgo(alert.created_at)}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Operational Coverage */}
        <div className="lg:col-span-2 rounded-lg border overflow-hidden" style={{ background: '#111827', borderColor: '#1E293B' }}>
          <div className="px-5 pt-5 pb-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Operational Coverage</h3>
              <button
                onClick={() => navigate('/v3/defence/map')}
                className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
              >
                Open Map <ExternalLink size={10} />
              </button>
            </div>
          </div>
          <div className="h-[260px] px-5 pb-5">
            <div className="h-full rounded-lg border p-4 flex flex-col" style={{ background: '#0A0F1C', borderColor: '#1E293B' }}>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-md border p-3" style={{ background: '#111827', borderColor: '#1E293B' }}>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Active Sites</div>
                  <div className="mt-2 text-2xl font-mono font-bold text-white">{installations?.filter(inst => inst.is_active).length ?? 0}</div>
                </div>
                <div className="rounded-md border p-3" style={{ background: '#111827', borderColor: '#1E293B' }}>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Coverage</div>
                  <div className="mt-2 text-2xl font-mono font-bold text-white">TR-81</div>
                </div>
              </div>

              <div className="space-y-2 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1E293B transparent' }}>
                {installations?.slice(0, 6).map(inst => (
                  <button
                    key={inst.id}
                    onClick={() => navigate('/v3/defence/map')}
                    className="w-full rounded-md border px-3 py-2 text-left transition-colors hover:bg-white/[0.03]"
                    style={{ background: '#111827', borderColor: '#1E293B' }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[12px] font-medium text-slate-100 truncate">{inst.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{inst.code} · {inst.city}</div>
                      </div>
                      <SeverityBadge severity={inst.classification === 'classified' ? 'high' : 'low'} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
