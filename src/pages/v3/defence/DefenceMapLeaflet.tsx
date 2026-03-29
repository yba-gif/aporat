import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Tooltip as LeafletTooltip, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useGeofenceCheck, type Installation, type GeofenceResult } from '@/hooks/useDefenceApi';

const TYPE_COLORS: Record<string, string> = {
  airfield: '#3B82F6', naval: '#10B981', headquarters: '#EF4444', army_base: '#F59E0B', training: '#A855F7', radar: '#06B6D4',
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

interface Props {
  installations: Installation[];
  onGeofenceResult: (result: GeofenceResult, lat: number, lng: number) => void;
  checkResult: { result: GeofenceResult; lat: number; lng: number } | null;
}

export default function DefenceMapLeaflet({ installations, onGeofenceResult, checkResult }: Props) {
  return (
    <MapContainer
      center={[39, 35]}
      zoom={6}
      style={{ height: '100%', width: '100%', background: '#0A0F1C' }}
      zoomControl={true}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
      <CursorPosition />
      <ClickChecker onResult={onGeofenceResult} />

      {installations.map(inst => {
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
              <LeafletTooltip direction="top" offset={[0, -8]} opacity={0.95}>
                <span style={{ fontWeight: 700, fontSize: '12px' }}>{inst.name}</span>
                <br />
                <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#666' }}>{inst.code} · {inst.city}</span>
              </LeafletTooltip>
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
  );
}
