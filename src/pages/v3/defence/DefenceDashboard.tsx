import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useDashboardStats, useTopThreats, useInstallations, useScanStatus } from '@/hooks/useDefenceApi';
import { SeverityBadge, SeverityDot } from '@/components/defence/SeverityBadge';
import { PlatformIcon, getPlatformLabel } from '@/components/defence/PlatformIcon';
import { StatusDot } from '@/components/defence/StatusDot';
import { StatCardSkeleton, AlertCardSkeleton } from '@/components/defence/DefenceSkeletons';

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'var(--v3-red)',
  high: 'var(--v3-amber)',
  medium: '#eab308',
  low: '#60a5fa',
};

function timeAgo(iso: string | null): string {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* ── KPI Card ── */
function KpiCard({ label, value, sub, accent }: { label: string; value: number; sub: string; accent: string }) {
  return (
    <div
      className="rounded-xl p-5 relative overflow-hidden"
      style={{ background: 'var(--v3-surface)', border: '1px solid var(--v3-border)' }}
    >
      <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
      <p className="text-[11px] font-medium tracking-wide uppercase" style={{ color: 'var(--v3-text-muted)' }}>{label}</p>
      <p className="text-3xl font-bold font-mono mt-2" style={{ color: 'var(--v3-text)' }}>{value}</p>
      <p className="text-[11px] mt-1" style={{ color: 'var(--v3-text-muted)' }}>{sub}</p>
    </div>
  );
}

/* ── Collector Card ── */
function CollectorCard({ col, interval }: { col: any; interval: string }) {
  const isTiktok = col.platform === 'tiktok';
  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--v3-surface)', border: '1px solid var(--v3-border)' }}>
      <div className="flex items-center gap-3 mb-4">
        <PlatformIcon platform={col.platform} size="md" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold" style={{ color: 'var(--v3-text)' }}>{getPlatformLabel(col.platform)}</p>
          <p className="text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>
            {isTiktok ? 'Live streams + keyword search' : 'Routes near military bases'}
          </p>
        </div>
        <StatusDot status={col.status} size="sm" />
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { v: col.items_collected_today ?? 0, l: 'Today' },
          { v: (col.items_collected_total ?? 0).toLocaleString(), l: 'Total' },
          { v: col.alerts_generated_total ?? 0, l: 'Alerts' },
        ].map(s => (
          <div key={s.l} className="rounded-xl p-2.5 text-center" style={{ background: 'var(--v3-bg)' }}>
            <p className="text-sm font-bold font-mono" style={{ color: 'var(--v3-text)' }}>{s.v}</p>
            <p className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--v3-text-muted)' }}>{s.l}</p>
          </div>
        ))}
      </div>
      <p className="text-[10px] font-mono" style={{ color: 'var(--v3-text-muted)' }}>
        Last run: {timeAgo(col.last_run_at)} · Interval: {interval}
      </p>
    </div>
  );
}

/* ── Main Dashboard ── */
export default function DefenceDashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: threats, isLoading: threatsLoading } = useTopThreats();
  const { data: installations } = useInstallations();
  const { data: collectors } = useScanStatus();
  const navigate = useNavigate();

  const severityData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.alerts_by_severity).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value,
      color: SEVERITY_COLORS[key],
    }));
  }, [stats]);

  const kpis = stats ? [
    { label: 'Total Alerts', value: stats.total_alerts, sub: `${stats.alerts_last_24h} in last 24h`, accent: 'var(--v3-red)' },
    { label: 'Live Streams Detected', value: stats.live_streams_detected, sub: 'TikTok live scans', accent: '#E11D48' },
    { label: 'Strava Routes Flagged', value: stats.strava_routes_flagged, sub: 'Near military bases', accent: '#FC4C02' },
    { label: 'Active Installations', value: stats.total_installations, sub: 'Geofenced zones', accent: 'var(--v3-green)' },
  ] : [];

  const tiktokCollector = collectors?.find(c => c.platform === 'tiktok');
  const stravaCollector = collectors?.find(c => c.platform === 'strava');

  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : kpis.map(kpi => <KpiCard key={kpi.label} {...kpi} />)
        }
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Severity Donut */}
        <div className="lg:col-span-3 rounded-xl p-6" style={{ background: 'var(--v3-surface)', border: '1px solid var(--v3-border)' }}>
          <h3 className="text-[11px] font-semibold tracking-wider uppercase mb-5" style={{ color: 'var(--v3-text-muted)' }}>
            Alerts by Severity
          </h3>
          <div className="flex items-center gap-10">
            <div className="w-40 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={severityData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3} dataKey="value" stroke="none">
                    {severityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--v3-surface)',
                      border: '1px solid var(--v3-border)',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: 'var(--v3-text)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {severityData.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-xs" style={{ color: 'var(--v3-text-secondary)' }}>{d.name}</span>
                  </div>
                  <span className="text-sm font-bold font-mono" style={{ color: 'var(--v3-text)' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Collector Status */}
        <div className="lg:col-span-2 space-y-4">
          {tiktokCollector && <CollectorCard col={tiktokCollector} interval="10 min" />}
          {stravaCollector && <CollectorCard col={stravaCollector} interval="30 min" />}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Live Alert Feed */}
        <div className="lg:col-span-3 rounded-xl p-6" style={{ background: 'var(--v3-surface)', border: '1px solid var(--v3-border)' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: 'var(--v3-text-muted)' }}>
              Live Alert Feed
            </h3>
            <button
              onClick={() => navigate('/v3/defence/alerts')}
              className="flex items-center gap-1 text-[11px] font-medium transition-colors"
              style={{ color: 'var(--v3-accent)' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              View All <ExternalLink size={10} />
            </button>
          </div>
          <div className="space-y-1 max-h-[280px] overflow-y-auto v3-scrollbar">
            {threatsLoading ? (
              Array.from({ length: 5 }).map((_, i) => <AlertCardSkeleton key={i} />)
            ) : threats?.length === 0 ? (
              <div className="text-center py-10 text-xs" style={{ color: 'var(--v3-text-muted)' }}>No active threats</div>
            ) : (
              threats?.map(alert => (
                <button
                  key={alert.id}
                  onClick={() => navigate('/v3/defence/alerts')}
                  className="flex items-center gap-3 w-full p-3 rounded-xl text-left transition-colors"
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--v3-surface-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <SeverityDot severity={alert.severity} pulse={alert.status === 'new'} />
                  <PlatformIcon platform={alert.platform} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium truncate" style={{ color: 'var(--v3-text)' }}>{alert.title}</p>
                  </div>
                  <span className="text-[10px] font-mono shrink-0" style={{ color: 'var(--v3-text-muted)' }}>{timeAgo(alert.created_at)}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Operational Coverage */}
        <div className="lg:col-span-2 rounded-xl overflow-hidden" style={{ background: 'var(--v3-surface)', border: '1px solid var(--v3-border)' }}>
          <div className="px-6 pt-6 pb-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: 'var(--v3-text-muted)' }}>
                Operational Coverage
              </h3>
              <button
                onClick={() => navigate('/v3/defence/map')}
                className="flex items-center gap-1 text-[11px] font-medium transition-colors"
                style={{ color: 'var(--v3-accent)' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Open Map <ExternalLink size={10} />
              </button>
            </div>
          </div>
          <div className="h-[260px] px-6 pb-6">
            <div className="h-full rounded-xl p-4 flex flex-col" style={{ background: 'var(--v3-bg)', border: '1px solid var(--v3-border)' }}>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl p-3" style={{ background: 'var(--v3-surface)', border: '1px solid var(--v3-border)' }}>
                  <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'var(--v3-text-muted)' }}>Active Sites</p>
                  <p className="mt-2 text-2xl font-mono font-bold" style={{ color: 'var(--v3-text)' }}>
                    {installations?.filter(inst => inst.is_active).length ?? 0}
                  </p>
                </div>
                <div className="rounded-xl p-3" style={{ background: 'var(--v3-surface)', border: '1px solid var(--v3-border)' }}>
                  <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'var(--v3-text-muted)' }}>Coverage</p>
                  <p className="mt-2 text-2xl font-mono font-bold" style={{ color: 'var(--v3-text)' }}>TR-81</p>
                </div>
              </div>
              <div className="space-y-2 overflow-y-auto pr-1 v3-scrollbar">
                {installations?.slice(0, 6).map(inst => (
                  <button
                    key={inst.id}
                    onClick={() => navigate('/v3/defence/map')}
                    className="w-full rounded-xl px-3 py-2 text-left transition-colors"
                    style={{ background: 'var(--v3-surface)', border: '1px solid var(--v3-border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--v3-surface-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--v3-surface)'}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[12px] font-medium truncate" style={{ color: 'var(--v3-text)' }}>{inst.name}</p>
                        <p className="text-[10px] font-mono" style={{ color: 'var(--v3-text-muted)' }}>{inst.code} · {inst.city}</p>
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
