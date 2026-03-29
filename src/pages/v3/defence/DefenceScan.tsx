import { Play, RotateCw } from 'lucide-react';
import { useScanStatus, useTriggerScan } from '@/hooks/useDefenceApi';
import { PlatformIcon, getPlatformLabel } from '@/components/defence/PlatformIcon';
import { StatusDot, StatusLabel } from '@/components/defence/StatusDot';
import { CollectorCardSkeleton } from '@/components/defence/DefenceSkeletons';

function timeAgo(iso: string | null): string {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DefenceScan() {
  const { data: collectors, isLoading } = useScanStatus();
  const trigger = useTriggerScan();

  const handleTriggerAll = () => {
    trigger.mutate(['tiktok', 'strava']);
  };

  const collectorMeta: Record<string, { description: string; interval: string; keywords?: string }> = {
    tiktok: {
      description: 'Scans TikTok for live streams matching Turkish military keywords. Detects unknown soldiers broadcasting from bases, convoys, and training exercises.',
      interval: 'Every 10 minutes',
      keywords: 'askeriye, komando, mehmetcik, jandarma, askerlik, asker, tugay, tabur',
    },
    strava: {
      description: 'Monitors Strava for exercise routes and segments within geofenced zones around 20 Turkish military installations. Detects patrol patterns and internal road exposure.',
      interval: 'Every 30 minutes',
    },
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--v3-text)' }}>Scan Control</h1>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--v3-text-muted)' }}>TikTok live stream & Strava route collectors</p>
        </div>
        <button onClick={handleTriggerAll} disabled={trigger.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold disabled:opacity-50 transition-colors"
          style={{ background: 'var(--v3-accent)', color: 'var(--v3-text-dark)' }}>
          <RotateCw size={14} className={trigger.isPending ? 'animate-spin' : ''} />
          Trigger Both Collectors
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => <CollectorCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {collectors?.map(col => {
            const meta = collectorMeta[col.platform];
            return (
              <div key={col.platform} className="rounded-xl p-6 transition-all"
                style={{ background: 'var(--v3-surface)', border: '1px solid var(--v3-border)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <PlatformIcon platform={col.platform} size="md" />
                    <span className="text-[14px] font-bold" style={{ color: 'var(--v3-text)' }}>{getPlatformLabel(col.platform)}</span>
                  </div>
                  <StatusLabel status={col.status} />
                </div>

                <p className="text-[11px] leading-relaxed mb-4" style={{ color: 'var(--v3-text-secondary)' }}>{meta?.description}</p>

                {meta?.keywords && (
                  <div className="mb-4">
                    <div className="text-[10px] font-bold tracking-wider uppercase mb-2" style={{ color: 'var(--v3-text-muted)' }}>Keywords</div>
                    <div className="flex flex-wrap gap-1.5">
                      {meta.keywords.split(', ').map(kw => (
                        <span key={kw} className="px-2 py-0.5 rounded-full text-[10px] font-mono"
                          style={{ background: 'var(--v3-bg)', color: 'var(--v3-text-secondary)', border: '1px solid var(--v3-border)' }}>
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { v: col.items_collected_today, l: 'Today' },
                    { v: (col.items_collected_total ?? 0).toLocaleString(), l: 'Total' },
                    { v: col.alerts_generated_total, l: 'Alerts' },
                  ].map(s => (
                    <div key={s.l} className="rounded-xl p-3 text-center" style={{ background: 'var(--v3-bg)' }}>
                      <div className="text-lg font-bold font-mono" style={{ color: 'var(--v3-text)' }}>{s.v}</div>
                      <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--v3-text-muted)' }}>{s.l}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono mb-4" style={{ color: 'var(--v3-text-muted)' }}>
                  <span>Last run: {timeAgo(col.last_run_at)}</span>
                  <span>Interval: {meta?.interval}</span>
                </div>

                {col.last_error && (
                  <div className="mb-4 p-3 rounded-xl text-[10px] leading-relaxed" style={{ background: 'var(--v3-red-muted)', color: 'var(--v3-red)' }}>
                    {col.last_error}
                  </div>
                )}

                <button onClick={() => trigger.mutate([col.platform])}
                  disabled={col.status === 'running' || trigger.isPending}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  style={{ background: 'var(--v3-accent-muted)', color: 'var(--v3-accent)' }}>
                  <Play size={12} /> Trigger Scan
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
