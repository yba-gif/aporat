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
          <h1 className="text-lg font-bold" style={{ color: 'var(--v3-text)' }}>Geofence Checker</h1>
          <p className="text-[11px] mt-1" style={{ color: 'var(--v3-text-muted)' }}>Check coordinates against active military installation geofences</p>
        </div>

        {/* Input */}
        <div className="rounded-xl p-6" style={{ background: 'var(--v3-surface)', border: '1px solid var(--v3-border)' }}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[10px] font-bold tracking-wider uppercase block mb-1.5" style={{ color: 'var(--v3-text-muted)' }}>Latitude</label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={e => setLat(e.target.value)}
                placeholder="37.0021"
                className="w-full px-3 py-2.5 rounded-xl text-[13px] font-mono border focus:outline-none focus:ring-1"
                style={{ background: 'var(--v3-bg)', borderColor: 'var(--v3-border)', color: 'var(--v3-text)', caretColor: 'var(--v3-accent)' }}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold tracking-wider uppercase block mb-1.5" style={{ color: 'var(--v3-text-muted)' }}>Longitude</label>
              <input
                type="number"
                step="any"
                value={lon}
                onChange={e => setLon(e.target.value)}
                placeholder="35.4259"
                className="w-full px-3 py-2.5 rounded-xl text-[13px] font-mono border focus:outline-none focus:ring-1"
                style={{ background: 'var(--v3-bg)', borderColor: 'var(--v3-border)', color: 'var(--v3-text)', caretColor: 'var(--v3-accent)' }}
              />
            </div>
          </div>
          <button
            onClick={handleCheck}
            disabled={!lat || !lon || check.isPending}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold disabled:opacity-40 transition-colors"
            style={{ background: 'var(--v3-accent)', color: 'var(--v3-text-dark)' }}
          >
            <Crosshair size={16} /> Check Coordinates
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="rounded-xl p-6 space-y-4" style={{ background: 'var(--v3-surface)', border: '1px solid var(--v3-border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--v3-text-muted)' }}>Result</span>
              {result.severity && <SeverityBadge severity={result.severity as any} />}
            </div>

            <div className="text-center py-4">
              {result.inside_geofence ? (
                <div className="flex flex-col items-center gap-2">
                  <AlertTriangle size={32} style={{ color: 'var(--v3-red)' }} />
                  <div className="text-2xl font-bold" style={{ color: 'var(--v3-red)' }}>INSIDE GEOFENCE</div>
                  <p className="text-[11px]" style={{ color: 'var(--v3-text-muted)' }}>Coordinates fall within a restricted military zone</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle size={32} style={{ color: 'var(--v3-green)' }} />
                  <div className="text-2xl font-bold" style={{ color: 'var(--v3-green)' }}>OUTSIDE</div>
                  <p className="text-[11px]" style={{ color: 'var(--v3-text-muted)' }}>Coordinates are outside all monitored geofences</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {result.nearest && (
                <div className="p-3 rounded-xl" style={{ background: 'var(--v3-bg)' }}>
                  <span className="block text-[9px] uppercase tracking-wider mb-1.5" style={{ color: 'var(--v3-text-muted)' }}>Nearest Installation</span>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} style={{ color: 'var(--v3-accent)' }} />
                    <div>
                      <span className="font-medium text-[12px] block" style={{ color: 'var(--v3-text)' }}>{result.nearest.name}</span>
                      <span className="font-mono text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>{result.nearest.code}</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="p-3 rounded-xl" style={{ background: 'var(--v3-bg)' }}>
                <span className="block text-[9px] uppercase tracking-wider mb-1.5" style={{ color: 'var(--v3-text-muted)' }}>Distance</span>
                <span className="font-mono text-xl font-bold" style={{ color: 'var(--v3-text)' }}>{result.distance_km}</span>
                <span className="ml-1 text-[11px]" style={{ color: 'var(--v3-text-muted)' }}>km</span>
              </div>
            </div>

            <div className="text-center pt-2">
              <a href="/v3/defence/map" className="text-[11px] transition-colors" style={{ color: 'var(--v3-accent)' }}>
                View on full map →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
