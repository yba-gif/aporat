import { useMemo, useState } from 'react';
import { Plus, MapPin, X } from 'lucide-react';
import { useInstallations, type Installation } from '@/hooks/useDefenceApi';
import { cn } from '@/lib/utils';

const TYPE_COLORS: Record<string, string> = {
  airfield: '#3B82F6',
  naval: '#10B981',
  headquarters: '#EF4444',
  army_base: '#F59E0B',
  training: '#A855F7',
  radar: '#06B6D4',
};

const TYPE_LABELS: Record<string, string> = {
  airfield: 'Airfield',
  naval: 'Naval Base',
  headquarters: 'HQ',
  army_base: 'Army Base',
  training: 'Training',
  radar: 'Radar',
};

type SafeInstallation = Installation & {
  safeLatitude: number | null;
  safeLongitude: number | null;
  safeRadiusKm: number | null;
  safeType: string;
  safeClassification: string;
};

function formatCoordinate(value: number | null, axis: 'lat' | 'lon') {
  if (value === null) return 'Unknown';
  return `${value.toFixed(4)}°${axis === 'lat' ? 'N' : 'E'}`;
}

export default function DefenceInstallations() {
  const { data: installations, isLoading } = useInstallations();
  const [detailId, setDetailId] = useState<string | null>(null);
  const [showAddNotice, setShowAddNotice] = useState(false);

  const safeInstallations = useMemo<SafeInstallation[]>(() => {
    return (installations ?? []).map((inst) => {
      const safeLatitude = Number.isFinite(Number(inst.latitude)) ? Number(inst.latitude) : null;
      const safeLongitude = Number.isFinite(Number(inst.longitude)) ? Number(inst.longitude) : null;
      const safeRadiusKm = Number.isFinite(Number(inst.radius_km)) ? Number(inst.radius_km) : null;
      const safeType = typeof inst.installation_type === 'string' ? inst.installation_type : 'airfield';
      const safeClassification = typeof inst.classification === 'string' ? inst.classification : 'unclassified';

      return {
        ...inst,
        safeLatitude,
        safeLongitude,
        safeRadiusKm,
        safeType,
        safeClassification,
      };
    });
  }, [installations]);

  const detail = safeInstallations.find((inst) => inst.id === detailId) ?? null;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white">Installations</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Military installations with active geofence monitoring</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddNotice((current) => !current)}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-[12px] font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors"
        >
          <Plus size={14} /> Add Installation
        </button>
      </div>

      {showAddNotice && (
        <div className="rounded-lg border px-4 py-3 flex items-start justify-between gap-4" style={{ background: '#111827', borderColor: '#1E293B' }}>
          <div>
            <div className="text-[12px] font-medium text-white">Installation creation is backend-driven</div>
            <div className="text-[11px] text-slate-500 mt-1">The page is now fail-safe even when backend data contains missing or malformed coordinates.</div>
          </div>
          <button type="button" onClick={() => setShowAddNotice(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-4 items-start">
        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-lg border p-4 h-36" style={{ background: '#111827', borderColor: '#1E293B' }} />
              ))}
            </div>
          ) : safeInstallations.length === 0 ? (
            <div className="rounded-lg border text-center py-16 text-slate-600 text-xs" style={{ background: '#111827', borderColor: '#1E293B' }}>
              No installations available
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {safeInstallations.map((inst) => {
                const color = TYPE_COLORS[inst.safeType] || '#3B82F6';
                const isSelected = detailId === inst.id;

                return (
                  <button
                    key={inst.id}
                    type="button"
                    onClick={() => setDetailId(inst.id)}
                    className="rounded-lg border text-left p-4 transition-all relative overflow-hidden group"
                    style={{
                      background: '#111827',
                      borderColor: isSelected ? color : '#1E293B',
                      boxShadow: isSelected ? `0 0 0 1px ${color}20 inset` : 'none',
                    }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: color }} />
                    <div className="text-[13px] font-bold text-white mb-0.5 pr-6">{inst.name}</div>
                    <div className="text-[10px] font-mono text-slate-500 mb-2">{inst.code}</div>

                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: `${color}20`, color }}>
                        {TYPE_LABELS[inst.safeType] || inst.safeType}
                      </span>
                      <span className="text-[10px] text-slate-500">{inst.city || 'Unknown city'}</span>
                    </div>

                    <div className="text-[10px] font-mono text-slate-600">
                      {formatCoordinate(inst.safeLatitude, 'lat')}, {formatCoordinate(inst.safeLongitude, 'lon')}
                    </div>

                    <div className="flex items-center justify-between mt-2 gap-2">
                      <span className="text-[10px] text-slate-600">Radius: {inst.safeRadiusKm !== null ? `${inst.safeRadiusKm} km` : 'Unknown'}</span>
                      <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-bold', inst.safeClassification === 'classified' ? 'bg-red-500/15 text-red-400' : 'bg-slate-600/15 text-slate-500')}>
                        {inst.safeClassification.toUpperCase()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <aside className="rounded-lg border p-4 sticky top-6" style={{ background: '#111827', borderColor: '#1E293B' }}>
          {detail ? (
            <div className="space-y-4">
              <div className="rounded-lg p-4 relative overflow-hidden" style={{ background: '#0A0F1C' }}>
                <div className="absolute top-0 left-0 right-0 h-1" style={{ background: TYPE_COLORS[detail.safeType] || '#3B82F6' }} />
                <div className="flex items-center gap-3 mt-1">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${TYPE_COLORS[detail.safeType] || '#3B82F6'}15` }}>
                    <MapPin size={18} style={{ color: TYPE_COLORS[detail.safeType] || '#3B82F6' }} />
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-white">{detail.name}</div>
                    <div className="text-[10px] font-mono text-slate-500">{detail.code} · {TYPE_LABELS[detail.safeType] || detail.safeType}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 rounded-md" style={{ background: '#0A0F1C' }}>
                  <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-1">City</span>
                  <span className="text-slate-200 font-medium">{detail.city || 'Unknown'}</span>
                </div>
                <div className="p-3 rounded-md" style={{ background: '#0A0F1C' }}>
                  <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-1">Radius</span>
                  <span className="text-slate-200 font-mono">{detail.safeRadiusKm !== null ? `${detail.safeRadiusKm} km` : 'Unknown'}</span>
                </div>
                <div className="p-3 rounded-md" style={{ background: '#0A0F1C' }}>
                  <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-1">Coordinates</span>
                  <span className="text-slate-200 font-mono text-[10px]">
                    {formatCoordinate(detail.safeLatitude, 'lat')}, {formatCoordinate(detail.safeLongitude, 'lon')}
                  </span>
                </div>
                <div className="p-3 rounded-md" style={{ background: '#0A0F1C' }}>
                  <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-1">Classification</span>
                  <span className={detail.safeClassification === 'classified' ? 'text-red-400 font-bold' : 'text-slate-200'}>
                    {detail.safeClassification.toUpperCase()}
                  </span>
                </div>
              </div>

              <a href="/v3/defence/map" className="block text-center text-[11px] text-blue-400 hover:text-blue-300 transition-colors">
                View on Map →
              </a>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="text-[12px] font-medium text-white">Select an installation</div>
              <div className="text-[11px] text-slate-500 mt-1">Details will appear here without opening a modal or map overlay.</div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
