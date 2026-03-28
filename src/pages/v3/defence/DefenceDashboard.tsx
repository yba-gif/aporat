import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Building2, Database, AlertTriangle, ExternalLink } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useDashboardStats, useTopThreats, useInstallations } from '@/hooks/useDefenceApi';
import { SeverityBadge, SeverityDot } from '@/components/defence/SeverityBadge';
import { PlatformIcon } from '@/components/defence/PlatformIcon';
import { StatusDot } from '@/components/defence/StatusDot';
import { StatCardSkeleton, AlertCardSkeleton } from '@/components/defence/DefenceSkeletons';

const SEVERITY_COLORS: Record<string, string> = { critical: '#EF4444', high: '#F59E0B', medium: '#EAB308', low: '#3B82F6' };
const INSTALL_COLORS: Record<string, string> = { airfield: '#3B82F6', naval: '#10B981', headquarters: '#EF4444', army_base: '#F59E0B', training: '#A855F7', radar: '#06B6D4' };

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

        {/* Threat Map */}
        <div className="lg:col-span-2 rounded-lg border overflow-hidden" style={{ background: '#111827', borderColor: '#1E293B' }}>
          <div className="px-5 pt-5 pb-2">
            <h3 className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Threat Map</h3>
          </div>
          <div className="h-[260px]">
            <MapContainer
              center={[39, 35]}
              zoom={6}
              style={{ height: '100%', width: '100%', background: '#0A0F1C' }}
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              {installations?.map(inst => (
                <CircleMarker
                  key={inst.id}
                  center={[inst.latitude, inst.longitude]}
                  radius={5}
                  pathOptions={{ color: INSTALL_COLORS[inst.installation_type] || '#3B82F6', fillColor: INSTALL_COLORS[inst.installation_type] || '#3B82F6', fillOpacity: 0.8, weight: 1 }}
                >
                  <Popup>
                    <div className="text-xs">
                      <div className="font-bold">{inst.name}</div>
                      <div className="font-mono text-[10px] text-gray-500">{inst.code}</div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
