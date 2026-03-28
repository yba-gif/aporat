import { useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useInstallations, useGeofenceCheck, type GeofenceResult } from '@/hooks/useDefenceApi';
import { SeverityBadge } from '@/components/defence/SeverityBadge';
import { X } from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  airfield: '#3B82F6', naval: '#10B981', headquarters: '#EF4444', army_base: '#F59E0B', training: '#A855F7', radar: '#06B6D4',
};
const TYPE_LABELS: Record<string, string> = {
  airfield: 'Airfield', naval: 'Naval Base', headquarters: 'HQ', army_base: 'Army Base', training: 'Training', radar: 'Radar',
};

function CursorPosition() {
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  useMapEvents({
    mousemove(e) { setPos(e.latlng); },
    mouseout() { setPos(null); },
  });
  if (!pos) return null;
  return (
    <div className="absolute top-3 right-3 z-[1000] px-3 py-1.5 rounded-md text-[10px] font-mono text-slate-300" style={{ background: '#111827E6', border: '1px solid #1E293B' }}>
      {pos.lat.toFixed(4)}°N &nbsp; {pos.lng.toFixed(4)}°E
    </div>
  );
}

function ClickChecker({ onResult }: { onResult: (r: GeofenceResult, lat: number, lng: number) => void }) {
  const check = useGeofenceCheck();
  useMapEvents({
    click(e) {
      check.mutate({ latitude: e.latlng.lat, longitude: e.latlng.lng }, {
        onSuccess: (data) => onResult(data, e.latlng.lat, e.latlng.lng),
      });
    },
  });
  return null;
}

export default function DefenceMap() {
  const { data: installations } = useInstallations();
  const [checkResult, setCheckResult] = useState<{ result: GeofenceResult; lat: number; lng: number } | null>(null);

  const handleResult = useCallback((result: GeofenceResult, lat: number, lng: number) => {
    setCheckResult({ result, lat, lng });
  }, []);

  return (
    <div className="relative h-full" style={{ height: 'calc(100vh - 0px)' }}>
      <MapContainer
        center={[39, 35]}
        zoom={6}
        style={{ height: '100%', width: '100%', background: '#0A0F1C' }}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <CursorPosition />
        <ClickChecker onResult={handleResult} />

        {installations?.map(inst => {
          const color = TYPE_COLORS[inst.installation_type] || '#3B82F6';
          return (
            <span key={inst.id}>
              <Circle
                center={[inst.latitude, inst.longitude]}
                radius={inst.radius_km * 1000}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.08, weight: 1, opacity: 0.4 }}
              />
              <CircleMarker
                center={[inst.latitude, inst.longitude]}
                radius={6}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.9, weight: 2, opacity: 1 }}
              >
                <Popup>
                  <div style={{ background: '#111827', color: '#E2E8F0', padding: '8px', borderRadius: '6px', minWidth: '180px', fontSize: '11px', lineHeight: '1.6' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>{inst.name}</div>
                    <div style={{ fontFamily: 'monospace', color: '#94A3B8', fontSize: '10px' }}>{inst.code}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                      <span style={{ padding: '1px 6px', borderRadius: '4px', background: `${color}20`, color, fontWeight: 600, fontSize: '10px' }}>{TYPE_LABELS[inst.installation_type]}</span>
                      <span style={{ color: '#64748B' }}>{inst.city}</span>
                    </div>
                    <div style={{ fontFamily: 'monospace', color: '#64748B', fontSize: '10px', marginTop: '4px' }}>
                      {inst.latitude.toFixed(4)}°N, {inst.longitude.toFixed(4)}°E
                    </div>
                    <div style={{ color: '#64748B', fontSize: '10px', marginTop: '2px' }}>
                      Radius: {inst.radius_km} km
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            </span>
          );
        })}

        {checkResult && (
          <CircleMarker
            center={[checkResult.lat, checkResult.lng]}
            radius={5}
            pathOptions={{ color: '#EF4444', fillColor: '#EF4444', fillOpacity: 1, weight: 2 }}
          />
        )}
      </MapContainer>

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
