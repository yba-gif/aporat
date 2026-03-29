import { Fragment, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Tooltip as LeafletTooltip, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useGeofenceCheck, type Installation, type GeofenceResult } from '@/hooks/useDefenceApi';

const TYPE_COLORS: Record<string, string> = {
  airfield: '#3B82F6', naval: '#10B981', headquarters: '#EF4444', army_base: '#F59E0B', training: '#A855F7', radar: '#06B6D4',
};

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
  const safeInstallations = useMemo(() =>
    (installations ?? [])
      .map(inst => ({
        ...inst,
        lat: Number(inst.latitude),
        lng: Number(inst.longitude),
        r: Number(inst.radius_km),
      }))
      .filter(inst => Number.isFinite(inst.lat) && Number.isFinite(inst.lng)),
    [installations]
  );

  return (
    <MapContainer
      center={[39, 35]}
      zoom={6}
      style={{ height: '100%', width: '100%', background: '#0A0F1C' }}
      zoomControl={true}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
      <ClickChecker onResult={onGeofenceResult} />

      {safeInstallations.map((inst) => {
        const color = TYPE_COLORS[inst.installation_type] || '#3B82F6';
        const radius = Number.isFinite(inst.r) && inst.r > 0 ? inst.r * 1000 : 5000;

        return (
          <Fragment key={inst.id}>
            <Circle
              center={[inst.lat, inst.lng]}
              radius={radius}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.08, weight: 1, opacity: 0.4 }}
            />
            <CircleMarker
              center={[inst.lat, inst.lng]}
              radius={6}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.9, weight: 2, opacity: 1 }}
            >
              <LeafletTooltip direction="top" offset={[0, -8]} opacity={0.95}>
                <div style={{ fontWeight: 700, fontSize: '12px' }}>{inst.name}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#666' }}>{inst.code} · {inst.city}</div>
              </LeafletTooltip>
            </CircleMarker>
          </Fragment>
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
