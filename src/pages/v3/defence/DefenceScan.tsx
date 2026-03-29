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
          <h1 className="text-lg font-bold text-white">Scan Control</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">TikTok live stream & Strava route collectors</p>
        </div>
        <button onClick={handleTriggerAll} disabled={trigger.isPending}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-[12px] font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors">
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
              <div key={col.platform} className="rounded-lg border p-6 transition-all hover:border-slate-700" style={{ background: '#111827', borderColor: '#1E293B' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <PlatformIcon platform={col.platform} size="md" />
                    <span className="text-[14px] font-bold text-white">{getPlatformLabel(col.platform)}</span>
                  </div>
                  <StatusLabel status={col.status} />
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed mb-4">{meta?.description}</p>

                {meta?.keywords && (
                  <div className="mb-4">
                    <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-2">Keywords</div>
                    <div className="flex flex-wrap gap-1">
                      {meta.keywords.split(', ').map(kw => (
                        <span key={kw} className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 border" style={{ background: '#0A0F1C', borderColor: '#1E293B' }}>{kw}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="rounded-md p-3 text-center" style={{ background: '#0A0F1C' }}>
                    <div className="text-lg font-bold font-mono text-white">{col.items_collected_today}</div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-wider">Today</div>
                  </div>
                  <div className="rounded-md p-3 text-center" style={{ background: '#0A0F1C' }}>
                    <div className="text-lg font-bold font-mono text-white">{col.items_collected_total.toLocaleString()}</div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-wider">Total</div>
                  </div>
                  <div className="rounded-md p-3 text-center" style={{ background: '#0A0F1C' }}>
                    <div className="text-lg font-bold font-mono text-white">{col.alerts_generated_total}</div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-wider">Alerts</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-600 font-mono mb-4">
                  <span>Last run: {timeAgo(col.last_run_at)}</span>
                  <span>Interval: {meta?.interval}</span>
                </div>

                {col.last_error && (
                  <div className="mb-4 p-2 rounded-md text-[10px] text-red-400 leading-relaxed" style={{ background: '#EF444410' }}>
                    {col.last_error}
                  </div>
                )}

                <button onClick={() => trigger.mutate([col.platform])}
                  disabled={col.status === 'running' || trigger.isPending}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-md text-[11px] font-medium border text-blue-400 border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
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
