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
    const active = collectors?.filter(c => c.status !== 'disabled').map(c => c.platform) || [];
    trigger.mutate(active);
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Scan Control</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">OSINT collector agents and operational status</p>
        </div>
        <button
          onClick={handleTriggerAll}
          disabled={trigger.isPending}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-[12px] font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors"
        >
          <RotateCw size={14} className={trigger.isPending ? 'animate-spin' : ''} />
          Trigger All Collectors
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => <CollectorCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {collectors?.map(col => (
            <div key={col.platform} className="rounded-lg border p-5 transition-all hover:border-slate-700" style={{ background: '#111827', borderColor: '#1E293B' }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <PlatformIcon platform={col.platform} size="md" />
                  <span className="text-[13px] font-bold text-white">{getPlatformLabel(col.platform)}</span>
                </div>
                <StatusLabel status={col.status} />
              </div>

              {/* Status Indicator */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${col.status === 'running' ? 'border-emerald-500/50 animate-pulse' : col.status === 'error' ? 'border-red-500/50' : 'border-slate-700'}`}>
                    <StatusDot status={col.status} size="lg" />
                  </div>
                  {col.status === 'running' && (
                    <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping" />
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Run</span>
                  <span className="text-slate-300 font-mono">{timeAgo((col as any).last_run_at ?? (col as any).last_run)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Items Today</span>
                  <span className="text-slate-300 font-mono">{(col as any).items_collected_today ?? (col as any).items_today ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Items</span>
                  <span className="text-slate-300 font-mono">{((col as any).items_collected_total ?? (col as any).items_total ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Alerts Generated</span>
                  <span className="text-slate-300 font-mono">{(col as any).alerts_generated_total ?? 0}</span>
                </div>
              </div>

              {/* Error */}
              {col.last_error && (
                <div className="mt-3 p-2 rounded-md text-[10px] text-red-400 leading-relaxed" style={{ background: '#EF444410' }}>
                  {col.last_error}
                </div>
              )}

              {/* Trigger */}
              <button
                onClick={() => trigger.mutate([col.platform])}
                disabled={col.status === 'disabled' || col.status === 'running' || trigger.isPending}
                className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 rounded-md text-[11px] font-medium border text-blue-400 border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Play size={12} /> Trigger Scan
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
