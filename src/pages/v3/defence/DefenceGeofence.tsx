import { useState } from 'react';
import { Crosshair, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import { useGeofenceCheck, type GeofenceResult } from '@/hooks/useDefenceApi';
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

            <div className="text-center py-4">
              {result.inside_geofence ? (
                <div className="flex flex-col items-center gap-2">
                  <AlertTriangle size={32} className="text-red-400" />
                  <div className="text-2xl font-bold text-red-400">INSIDE GEOFENCE</div>
                  <p className="text-[11px] text-slate-500">Coordinates fall within a restricted military zone</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle size={32} className="text-emerald-400" />
                  <div className="text-2xl font-bold text-emerald-400">OUTSIDE</div>
                  <p className="text-[11px] text-slate-500">Coordinates are outside all monitored geofences</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {result.nearest && (
                <div className="p-3 rounded-md" style={{ background: '#0A0F1C' }}>
                  <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-1">Nearest Installation</span>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-blue-400" />
                    <div>
                      <span className="text-white font-medium text-[12px] block">{result.nearest.name}</span>
                      <span className="text-slate-500 font-mono text-[10px]">{result.nearest.code}</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="p-3 rounded-md" style={{ background: '#0A0F1C' }}>
                <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-1">Distance</span>
                <span className="text-white font-mono text-xl font-bold">{result.distance_km}</span>
                <span className="text-slate-500 ml-1 text-[11px]">km</span>
              </div>
            </div>

            <div className="text-center pt-2">
              <a href="/v3/defence/map" className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors">
                View on full map →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
