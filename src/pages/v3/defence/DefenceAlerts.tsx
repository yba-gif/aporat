import { useState, useMemo } from 'react';
import { Search, Check, ShieldCheck, XCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useAlerts, useAcknowledgeAlert, useResolveAlert, type Alert } from '@/hooks/useDefenceApi';
import { SeverityBadge, SeverityDot, type Severity } from '@/components/defence/SeverityBadge';
import { PlatformIcon, getPlatformLabel } from '@/components/defence/PlatformIcon';
import { AlertCardSkeleton } from '@/components/defence/DefenceSkeletons';
import { cn } from '@/lib/utils';

const SEVERITIES: Severity[] = ['critical', 'high', 'medium', 'low'];
const STATUSES = ['new', 'acknowledged', 'investigating', 'resolved', 'false_positive'] as const;
const PLATFORMS = ['tiktok', 'strava'];

const CATEGORY_LABELS: Record<string, string> = {
  live_stream: 'Live Stream',
  route_exposure: 'Route Exposure',
  location_leak: 'Location Leak',
  facility_exposure: 'Facility Exposure',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DefenceAlerts() {
  const [severity, setSeverity] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const [platform, setPlatform] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: alerts, isLoading } = useAlerts({ severity, status, platform });
  const ack = useAcknowledgeAlert();
  const resolve = useResolveAlert();

  const filtered = useMemo(() => {
    if (!alerts) return [];
    if (!search) return alerts;
    return alerts.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase()));
  }, [alerts, search]);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-lg font-bold text-white">Alert Feed</h1>
        <p className="text-[11px] text-slate-500 mt-0.5">Real-time OPSEC violation alerts from TikTok & Strava</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search alerts..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-md text-[12px] text-slate-200 border focus:outline-none focus:border-blue-500/50"
            style={{ background: '#111827', borderColor: '#1E293B' }} />
        </div>

        <div className="w-px h-6 bg-slate-800" />

        {SEVERITIES.map(s => (
          <button key={s} onClick={() => setSeverity(severity === s ? undefined : s)}
            className={cn('px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border transition-colors', severity === s ? '' : 'opacity-50 hover:opacity-80')}
            style={{
              background: severity === s ? `${s === 'critical' ? '#EF4444' : s === 'high' ? '#F59E0B' : s === 'medium' ? '#EAB308' : '#3B82F6'}20` : '#111827',
              borderColor: severity === s ? `${s === 'critical' ? '#EF4444' : s === 'high' ? '#F59E0B' : s === 'medium' ? '#EAB308' : '#3B82F6'}40` : '#1E293B',
              color: s === 'critical' ? '#F87171' : s === 'high' ? '#FBBF24' : s === 'medium' ? '#FDE047' : '#60A5FA',
            }}>
            {s}
          </button>
        ))}

        <div className="w-px h-6 bg-slate-800" />

        <select value={status || ''} onChange={e => setStatus(e.target.value || undefined)}
          className="px-2 py-1.5 rounded-md text-[11px] text-slate-300 border focus:outline-none"
          style={{ background: '#111827', borderColor: '#1E293B' }}>
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>

        <select value={platform || ''} onChange={e => setPlatform(e.target.value || undefined)}
          className="px-2 py-1.5 rounded-md text-[11px] text-slate-300 border focus:outline-none"
          style={{ background: '#111827', borderColor: '#1E293B' }}>
          <option value="">All Platforms</option>
          {PLATFORMS.map(p => <option key={p} value={p}>{getPlatformLabel(p)}</option>)}
        </select>
      </div>

      <div className="text-[11px] text-slate-500">
        Showing <span className="text-slate-300 font-mono">{filtered.length}</span> of <span className="text-slate-300 font-mono">{alerts?.length || 0}</span> alerts
      </div>

      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <AlertCardSkeleton key={i} />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-600 text-xs">No alerts match your filters</div>
        ) : (
          filtered.map(alert => (
            <AlertCard key={alert.id} alert={alert} expanded={expandedId === alert.id}
              onToggle={() => setExpandedId(expandedId === alert.id ? null : alert.id)}
              onAcknowledge={() => ack.mutate(alert.id)}
              onResolve={() => resolve.mutate({ id: alert.id, notes: 'Resolved by operator', falsePositive: false })}
              onFalsePositive={() => resolve.mutate({ id: alert.id, notes: 'Marked as false positive', falsePositive: true })} />
          ))
        )}
      </div>
    </div>
  );
}

function AlertCard({ alert, expanded, onToggle, onAcknowledge, onResolve, onFalsePositive }: {
  alert: Alert; expanded: boolean; onToggle: () => void;
  onAcknowledge: () => void; onResolve: () => void; onFalsePositive: () => void;
}) {
  const borderColor = alert.severity === 'critical' ? '#EF4444' : alert.severity === 'high' ? '#F59E0B' : alert.severity === 'medium' ? '#EAB308' : '#3B82F6';

  return (
    <div className={cn('rounded-lg border transition-all', alert.severity === 'critical' && alert.status === 'new' && 'shadow-[0_0_15px_rgba(239,68,68,0.1)]')}
      style={{ background: '#111827', borderColor: '#1E293B' }}>
      <div className="flex">
        <div className={cn('w-1 rounded-l-lg shrink-0', alert.status === 'new' && 'animate-pulse')} style={{ background: borderColor }} />
        <div className="flex-1 p-4">
          <button onClick={onToggle} className="flex items-start gap-3 w-full text-left">
            <PlatformIcon platform={alert.platform} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <SeverityBadge severity={alert.severity} />
                <span className="text-[10px] px-1.5 py-0.5 rounded border text-slate-400" style={{ background: '#0A0F1C', borderColor: '#1E293B' }}>
                  {CATEGORY_LABELS[alert.threat_category] || alert.threat_category}
                </span>
                {alert.status !== 'new' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded text-slate-500 capitalize" style={{ background: '#1E293B40' }}>
                    {alert.status.replace('_', ' ')}
                  </span>
                )}
              </div>
              <div className="text-[13px] font-medium text-slate-200 mb-1">{alert.title}</div>
              {!expanded && <div className="text-[11px] text-slate-500 line-clamp-2">{alert.description}</div>}
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className="text-[10px] font-mono text-slate-600">{timeAgo(alert.created_at)}</span>
              {expanded ? <ChevronUp size={14} className="text-slate-600" /> : <ChevronDown size={14} className="text-slate-600" />}
            </div>
          </button>

          {expanded && (
            <div className="mt-3 pt-3 border-t space-y-3" style={{ borderColor: '#1E293B' }}>
              <p className="text-[12px] text-slate-400 leading-relaxed">{alert.description}</p>
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                {alert.evidence_url && (
                  <div>
                    <span className="text-slate-600">Evidence:</span>
                    <a href={alert.evidence_url} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-400 hover:text-blue-300 inline-flex items-center gap-0.5">
                      View <ExternalLink size={10} />
                    </a>
                  </div>
                )}
                {alert.installation_name && <div><span className="text-slate-600">Installation:</span> <span className="text-slate-300">{alert.installation_name}</span></div>}
                <div><span className="text-slate-600">Timestamp:</span> <span className="text-slate-300 font-mono">{new Date(alert.created_at).toLocaleString()}</span></div>
              </div>
              {alert.resolution_notes && (
                <div className="text-[11px] p-2 rounded-md" style={{ background: '#0A0F1C' }}>
                  <span className="text-slate-600">Resolution: </span>
                  <span className="text-slate-400">{alert.resolution_notes}</span>
                </div>
              )}
              {alert.status !== 'resolved' && alert.status !== 'false_positive' && (
                <div className="flex items-center gap-2 pt-1">
                  {alert.status === 'new' && (
                    <button onClick={onAcknowledge} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors">
                      <Check size={12} /> Acknowledge
                    </button>
                  )}
                  <button onClick={onResolve} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium text-blue-400 border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 transition-colors">
                    <ShieldCheck size={12} /> Resolve
                  </button>
                  <button onClick={onFalsePositive} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium text-slate-400 border border-slate-600/30 bg-slate-600/10 hover:bg-slate-600/20 transition-colors">
                    <XCircle size={12} /> False Positive
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
