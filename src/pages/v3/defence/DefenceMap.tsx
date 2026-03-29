import { useState, useCallback, lazy, Suspense } from 'react';
import { useInstallations, useGeofenceCheck, type GeofenceResult } from '@/hooks/useDefenceApi';
import { SeverityBadge } from '@/components/defence/SeverityBadge';
import { X } from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  airfield: '#3B82F6', naval: '#10B981', headquarters: '#EF4444', army_base: '#F59E0B', training: '#A855F7', radar: '#06B6D4',
};
const TYPE_LABELS: Record<string, string> = {
  airfield: 'Airfield', naval: 'Naval Base', headquarters: 'HQ', army_base: 'Army Base', training: 'Training', radar: 'Radar',
};

// Lazy-load the actual Leaflet map to isolate potential crashes
const LeafletMap = lazy(() => import('./DefenceMapLeaflet'));

export default function DefenceMap() {
  const { data: installations } = useInstallations();
  const [checkResult, setCheckResult] = useState<{ result: GeofenceResult; lat: number; lng: number } | null>(null);

  const handleResult = useCallback((result: GeofenceResult, lat: number, lng: number) => {
    setCheckResult({ result, lat, lng });
  }, []);

  return (
    <div className="relative h-full" style={{ height: 'calc(100vh - 0px)' }}>
      <Suspense fallback={
        <div className="h-full flex items-center justify-center" style={{ background: '#0A0F1C' }}>
          <div className="text-slate-500 text-[12px]">Loading map...</div>
        </div>
      }>
        <LeafletMap installations={installations || []} onGeofenceResult={handleResult} checkResult={checkResult} />
      </Suspense>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] rounded-lg p-3 space-y-1.5" style={{ background: '#111827E6', border: '1px solid #1E293B' }}>
        <div className="text-[9px] font-bold tracking-wider text-slate-500 uppercase mb-1">Installation Types</div>
        {Object.entries(TYPE_LABELS).map(([type, label]) => (
          <div key={type} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: TYPE_COLORS[type] }} />
            <span className="text-[10px] text-slate-400">{label}</span>
          </div>
        ))}
        <div className="pt-1 border-t mt-1" style={{ borderColor: '#1E293B' }}>
          <div className="text-[9px] text-slate-600">Click map to check geofence</div>
        </div>
      </div>

      {/* Check Result floating card */}
      {checkResult && (
        <div className="absolute bottom-4 right-4 z-[1000] rounded-lg p-4 w-72" style={{ background: '#111827', border: '1px solid #1E293B' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Geofence Check</span>
            <button onClick={() => setCheckResult(null)} className="text-slate-600 hover:text-slate-400"><X size={14} /></button>
          </div>
          {checkResult.result.severity && <SeverityBadge severity={checkResult.result.severity as any} className="mb-2" />}
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Status</span>
              <span className={checkResult.result.inside_geofence ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                {checkResult.result.inside_geofence ? 'INSIDE GEOFENCE' : 'Outside'}
              </span>
            </div>
            {checkResult.result.nearest && (
              <div className="flex justify-between">
                <span className="text-slate-500">Nearest</span>
                <span className="text-slate-300 font-mono text-[10px]">{checkResult.result.nearest.name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Distance</span>
              <span className="text-slate-300 font-mono">{checkResult.result.distance_km} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Coordinates</span>
              <span className="text-slate-300 font-mono text-[10px]">{checkResult.lat.toFixed(4)}, {checkResult.lng.toFixed(4)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
