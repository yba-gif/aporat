import { useState, useCallback, lazy, Suspense } from 'react';
import { useInstallations, type GeofenceResult } from '@/hooks/useDefenceApi';
import { SeverityBadge } from '@/components/defence/SeverityBadge';
import { X } from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  airfield: '#3B82F6', naval: '#10B981', headquarters: '#EF4444', army_base: '#F59E0B', training: '#A855F7', radar: '#06B6D4',
};
const TYPE_LABELS: Record<string, string> = {
  airfield: 'Airfield', naval: 'Naval Base', headquarters: 'HQ', army_base: 'Army Base', training: 'Training', radar: 'Radar',
};

const LeafletMap = lazy(() => import('./DefenceMapLeaflet'));

export default function DefenceMap() {
  const { data: installations } = useInstallations();
  const [checkResult, setCheckResult] = useState<{ result: GeofenceResult; lat: number; lng: number } | null>(null);

  const handleResult = useCallback((result: GeofenceResult, lat: number, lng: number) => {
    setCheckResult({ result, lat, lng });
  }, []);

  return (
    <div className="relative h-full" style={{ height: '100%' }}>
      <Suspense fallback={
        <div className="h-full flex items-center justify-center" style={{ background: 'var(--v3-bg)' }}>
          <div className="text-[12px]" style={{ color: 'var(--v3-text-muted)' }}>Loading map…</div>
        </div>
      }>
        <LeafletMap installations={installations || []} onGeofenceResult={handleResult} checkResult={checkResult} />
      </Suspense>

      {/* Legend — Mercury panel */}
      <div
        className="absolute bottom-4 left-4 z-[1000] rounded-xl p-3.5 space-y-1.5 backdrop-blur-md"
        style={{ background: 'color-mix(in srgb, var(--v3-surface) 92%, transparent)', border: '1px solid var(--v3-border)' }}
      >
        <div className="text-[9px] font-bold tracking-[0.15em] uppercase mb-1.5" style={{ color: 'var(--v3-text-muted)' }}>
          Installation Types
        </div>
        {Object.entries(TYPE_LABELS).map(([type, label]) => (
          <div key={type} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: TYPE_COLORS[type] }} />
            <span className="text-[10px]" style={{ color: 'var(--v3-text-secondary)' }}>{label}</span>
          </div>
        ))}
        <div className="pt-1.5 border-t mt-1.5" style={{ borderColor: 'var(--v3-border)' }}>
          <div className="text-[9px]" style={{ color: 'var(--v3-text-muted)' }}>Click map to check geofence</div>
        </div>
      </div>

      {/* Check Result — Mercury floating card */}
      {checkResult && (
        <div
          className="absolute bottom-4 right-4 z-[1000] rounded-xl p-4 w-72 backdrop-blur-md"
          style={{ background: 'color-mix(in srgb, var(--v3-surface) 95%, transparent)', border: '1px solid var(--v3-border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-bold tracking-[0.15em] uppercase" style={{ color: 'var(--v3-text-muted)' }}>
              Geofence Check
            </span>
            <button
              onClick={() => setCheckResult(null)}
              className="p-1 rounded-lg transition-colors"
              style={{ color: 'var(--v3-text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--v3-surface-hover)'; e.currentTarget.style.color = 'var(--v3-text-secondary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--v3-text-muted)'; }}
            >
              <X size={14} />
            </button>
          </div>
          {checkResult.result.severity && <SeverityBadge severity={checkResult.result.severity as any} className="mb-2" />}
          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between">
              <span style={{ color: 'var(--v3-text-muted)' }}>Status</span>
              <span className="font-semibold" style={{ color: checkResult.result.inside_geofence ? '#f87171' : '#34d399' }}>
                {checkResult.result.inside_geofence ? 'INSIDE GEOFENCE' : 'Outside'}
              </span>
            </div>
            {checkResult.result.nearest && (
              <div className="flex justify-between">
                <span style={{ color: 'var(--v3-text-muted)' }}>Nearest</span>
                <span className="font-mono text-[10px]" style={{ color: 'var(--v3-text-primary)' }}>{checkResult.result.nearest.name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span style={{ color: 'var(--v3-text-muted)' }}>Distance</span>
              <span className="font-mono" style={{ color: 'var(--v3-text-primary)' }}>{checkResult.result.distance_km} km</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--v3-text-muted)' }}>Coordinates</span>
              <span className="font-mono text-[10px]" style={{ color: 'var(--v3-text-secondary)' }}>
                {checkResult.lat.toFixed(4)}, {checkResult.lng.toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
