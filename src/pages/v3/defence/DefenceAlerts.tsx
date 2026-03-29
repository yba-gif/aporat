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
        <h1 className="text-lg font-bold" style={{ color: 'var(--v3-text)' }}>Alert Feed</h1>
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--v3-text-muted)' }}>Real-time OPSEC violation alerts from TikTok & Strava</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--v3-text-muted)' }} />
          <input type="text" placeholder="Search alerts..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-3 py-1.5 rounded-xl text-[12px] border focus:outline-none focus:ring-1"
            style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)', color: 'var(--v3-text)', caretColor: 'var(--v3-accent)' }} />
        </div>

        <div className="w-px h-6" style={{ background: 'var(--v3-border)' }} />

        {SEVERITIES.map(s => {
          const colors: Record<string, string> = { critical: 'var(--v3-red)', high: 'var(--v3-amber)', medium: '#eab308', low: '#60a5fa' };
          const c = colors[s];
          return (
            <button key={s} onClick={() => setSeverity(severity === s ? undefined : s)}
              className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all', severity === s ? 'opacity-100' : 'opacity-40 hover:opacity-70')}
              style={{ background: severity === s ? `${c}20` : 'var(--v3-surface)', color: c }}>
              {s}
            </button>
          );
        })}

        <div className="w-px h-6" style={{ background: 'var(--v3-border)' }} />

        <select value={status || ''} onChange={e => setStatus(e.target.value || undefined)}
          className="px-2.5 py-1.5 rounded-xl text-[11px] border focus:outline-none"
          style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)', color: 'var(--v3-text-secondary)' }}>
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>

        <select value={platform || ''} onChange={e => setPlatform(e.target.value || undefined)}
          className="px-2.5 py-1.5 rounded-xl text-[11px] border focus:outline-none"
          style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)', color: 'var(--v3-text-secondary)' }}>
          <option value="">All Platforms</option>
          {PLATFORMS.map(p => <option key={p} value={p}>{getPlatformLabel(p)}</option>)}
        </select>
      </div>

      <div className="text-[11px]" style={{ color: 'var(--v3-text-muted)' }}>
        Showing <span className="font-mono" style={{ color: 'var(--v3-text-secondary)' }}>{filtered.length}</span> of <span className="font-mono" style={{ color: 'var(--v3-text-secondary)' }}>{alerts?.length || 0}</span> alerts
      </div>

      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <AlertCardSkeleton key={i} />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-xs" style={{ color: 'var(--v3-text-muted)' }}>No alerts match your filters</div>
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
  const severityColors: Record<string, string> = { critical: 'var(--v3-red)', high: 'var(--v3-amber)', medium: '#eab308', low: '#60a5fa' };
  const borderColor = severityColors[alert.severity] || 'var(--v3-border)';

  return (
    <div
      className={cn('rounded-xl transition-all', alert.severity === 'critical' && alert.status === 'new' && 'shadow-[0_0_20px_rgba(248,113,113,0.08)]')}
      style={{ background: 'var(--v3-surface)', border: '1px solid var(--v3-border)' }}
    >
      <div className="flex">
        <div className={cn('w-1 rounded-l-xl shrink-0', alert.status === 'new' && 'animate-pulse')} style={{ background: borderColor }} />
        <div className="flex-1 p-5">
          <button onClick={onToggle} className="flex items-start gap-3 w-full text-left">
            <PlatformIcon platform={alert.platform} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <SeverityBadge severity={alert.severity} />
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--v3-bg)', color: 'var(--v3-text-muted)' }}>
                  {CATEGORY_LABELS[alert.threat_category] || alert.threat_category}
                </span>
                {alert.status !== 'new' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full capitalize" style={{ background: 'var(--v3-surface-hover)', color: 'var(--v3-text-muted)' }}>
                    {alert.status.replace('_', ' ')}
                  </span>
                )}
              </div>
              <p className="text-[13px] font-medium mb-1" style={{ color: 'var(--v3-text)' }}>{alert.title}</p>
              {!expanded && <p className="text-[11px] line-clamp-2" style={{ color: 'var(--v3-text-muted)' }}>{alert.description}</p>}
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className="text-[10px] font-mono" style={{ color: 'var(--v3-text-muted)' }}>{timeAgo(alert.created_at)}</span>
              {expanded ? <ChevronUp size={14} style={{ color: 'var(--v3-text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--v3-text-muted)' }} />}
            </div>
          </button>

          {expanded && (
            <div className="mt-4 pt-4 space-y-3" style={{ borderTop: '1px solid var(--v3-border)' }}>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--v3-text-secondary)' }}>{alert.description}</p>
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                {alert.evidence_url && (
                  <div>
                    <span style={{ color: 'var(--v3-text-muted)' }}>Evidence:</span>
                    <a href={alert.evidence_url} target="_blank" rel="noopener noreferrer"
                      className="ml-1 inline-flex items-center gap-0.5" style={{ color: 'var(--v3-accent)' }}>
                      View <ExternalLink size={10} />
                    </a>
                  </div>
                )}
                {alert.installation_name && (
                  <div>
                    <span style={{ color: 'var(--v3-text-muted)' }}>Installation:</span>{' '}
                    <span style={{ color: 'var(--v3-text-secondary)' }}>{alert.installation_name}</span>
                  </div>
                )}
                <div>
                  <span style={{ color: 'var(--v3-text-muted)' }}>Timestamp:</span>{' '}
                  <span className="font-mono" style={{ color: 'var(--v3-text-secondary)' }}>{new Date(alert.created_at).toLocaleString()}</span>
                </div>
              </div>
              {alert.resolution_notes && (
                <div className="text-[11px] p-3 rounded-xl" style={{ background: 'var(--v3-bg)' }}>
                  <span style={{ color: 'var(--v3-text-muted)' }}>Resolution: </span>
                  <span style={{ color: 'var(--v3-text-secondary)' }}>{alert.resolution_notes}</span>
                </div>
              )}
              {alert.status !== 'resolved' && alert.status !== 'false_positive' && (
                <div className="flex items-center gap-2 pt-1">
                  {alert.status === 'new' && (
                    <button onClick={onAcknowledge}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-colors"
                      style={{ background: 'var(--v3-green-muted)', color: 'var(--v3-green)' }}>
                      <Check size={12} /> Acknowledge
                    </button>
                  )}
                  <button onClick={onResolve}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-colors"
                    style={{ background: 'var(--v3-accent-muted)', color: 'var(--v3-accent)' }}>
                    <ShieldCheck size={12} /> Resolve
                  </button>
                  <button onClick={onFalsePositive}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-colors"
                    style={{ background: 'var(--v3-surface-hover)', color: 'var(--v3-text-muted)' }}>
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
