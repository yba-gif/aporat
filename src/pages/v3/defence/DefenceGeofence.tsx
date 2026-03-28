import { useState } from 'react';
import { Crosshair } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useGeofenceCheck, MOCK_INSTALLATIONS, type GeofenceResult } from '@/hooks/useDefenceApi';
import { SeverityBadge } from '@/components/defence/SeverityBadge';

export default function DefenceGeofence() {
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const check = useGeofenceCheck();
  const [result, setResult] = useState<GeofenceResult | null>(null);

  const handleCheck = () => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    if (isNaN(latitude) || isNaN(longitude)) return;
    check.mutate({ latitude, longitude }, {
      onSuccess: (data) => setResult(data),
    });
  };

  const nearestInst = result?.nearest ? MOCK_INSTALLATIONS.find(i => i.id === result.nearest!.id || i.name === result.nearest!.name) : null;

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-lg font-bold text-white">Geofence Checker</h1>
          <p className="text-[11px] text-slate-500 mt-1">Check coordinates against active military installation geofences</p>
        </div>

        {/* Input */}
        <div className="rounded-lg border p-6" style={{ background: '#111827', borderColor: '#1E293B' }}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={e => setLat(e.target.value)}
                placeholder="37.0021"
                className="w-full px-3 py-2.5 rounded-md text-[13px] font-mono text-white border focus:outline-none focus:border-blue-500/50"
                style={{ background: '#0A0F1C', borderColor: '#1E293B' }}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={lon}
                onChange={e => setLon(e.target.value)}
                placeholder="35.4259"
                className="w-full px-3 py-2.5 rounded-md text-[13px] font-mono text-white border focus:outline-none focus:border-blue-500/50"
                style={{ background: '#0A0F1C', borderColor: '#1E293B' }}
              />
            </div>
          </div>
          <button
            onClick={handleCheck}
            disabled={!lat || !lon || check.isPending}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 transition-colors"
          >
            <Crosshair size={16} /> Check Coordinates
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="rounded-lg border p-6 space-y-4" style={{ background: '#111827', borderColor: '#1E293B' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Result</span>
              {result.severity && <SeverityBadge severity={result.severity as any} />}
            </div>

            <div className="text-center py-3">
              <div className={`text-2xl font-bold ${result.inside_geofence ? 'text-red-400' : 'text-emerald-400'}`}>
                {result.inside_geofence ? '⚠ INSIDE GEOFENCE' : '✓ OUTSIDE'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[12px]">
              {result.nearest && (
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-0.5">Nearest Installation</span>
                  <span className="text-white font-medium">{result.nearest.name}</span>
                  <span className="text-slate-500 font-mono text-[10px] block">{result.nearest.code}</span>
                </div>
              )}
              <div>
                <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-0.5">Distance</span>
                <span className="text-white font-mono text-xl font-bold">{result.distance_km}</span>
                <span className="text-slate-500 ml-1">km</span>
              </div>
            </div>

            {/* Map */}
            {nearestInst && (
              <div className="h-48 rounded-lg overflow-hidden mt-2">
                <MapContainer
                  center={[(parseFloat(lat) + nearestInst.latitude) / 2, (parseFloat(lon) + nearestInst.longitude) / 2]}
                  zoom={10}
                  style={{ height: '100%', width: '100%', background: '#0A0F1C' }}
                  zoomControl={false}
                  attributionControl={false}
                >
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                  <Circle center={[nearestInst.latitude, nearestInst.longitude]} radius={nearestInst.radius_km * 1000} pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.1, weight: 1 }} />
                  <CircleMarker center={[nearestInst.latitude, nearestInst.longitude]} radius={6} pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.9, weight: 2 }} />
                  <CircleMarker center={[parseFloat(lat), parseFloat(lon)]} radius={6} pathOptions={{ color: '#EF4444', fillColor: '#EF4444', fillOpacity: 0.9, weight: 2 }} />
                </MapContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
