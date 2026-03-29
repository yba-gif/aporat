import { useMemo, useState } from 'react';
import { Plus, MapPin, X } from 'lucide-react';
import { useInstallations, type Installation } from '@/hooks/useDefenceApi';
import { cn } from '@/lib/utils';

const TYPE_COLORS: Record<string, string> = {
  airfield: '#60a5fa',
  naval: 'var(--v3-green)',
  headquarters: 'var(--v3-red)',
  hq: 'var(--v3-red)',
  army_base: 'var(--v3-amber)',
  base: 'var(--v3-amber)',
  training: 'var(--v3-accent)',
  radar: '#22d3ee',
};

const TYPE_LABELS: Record<string, string> = {
  airfield: 'Airfield',
  naval: 'Naval Base',
  headquarters: 'HQ',
  hq: 'HQ',
  army_base: 'Army Base',
  base: 'Base',
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
      return { ...inst, safeLatitude, safeLongitude, safeRadiusKm, safeType, safeClassification };
    });
  }, [installations]);

  const detail = safeInstallations.find((inst) => inst.id === detailId) ?? null;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--v3-text)' }}>Installations</h1>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--v3-text-muted)' }}>Military installations with active geofence monitoring</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddNotice(c => !c)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-colors"
          style={{ background: 'var(--v3-accent)', color: 'var(--v3-text-dark)' }}
        >
          <Plus size={14} /> Add Installation
        </button>
      </div>

      {showAddNotice && (
        <div className="rounded-xl px-5 py-3 flex items-start justify-between gap-4" style={{ background: 'var(--v3-surface)', border: '1px solid var(--v3-border)' }}>
          <div>
            <p className="text-[12px] font-medium" style={{ color: 'var(--v3-text)' }}>Installation creation is backend-driven</p>
            <p className="text-[11px] mt-1" style={{ color: 'var(--v3-text-muted)' }}>The page is now fail-safe even when backend data contains missing or malformed coordinates.</p>
          </div>
          <button type="button" onClick={() => setShowAddNotice(false)} style={{ color: 'var(--v3-text-muted)' }} className="transition-colors hover:opacity-70">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-4 items-start">
        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl p-4 h-36" style={{ background: 'var(--v3-surface)', border: '1px solid var(--v3-border)' }} />
              ))}
            </div>
          ) : safeInstallations.length === 0 ? (
            <div className="rounded-xl text-center py-16 text-xs" style={{ background: 'var(--v3-surface)', border: '1px solid var(--v3-border)', color: 'var(--v3-text-muted)' }}>
              No installations available
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {safeInstallations.map((inst) => {
                const color = TYPE_COLORS[inst.safeType] || '#60a5fa';
                const isSelected = detailId === inst.id;

                return (
                  <button
                    key={inst.id}
                    type="button"
                    onClick={() => setDetailId(inst.id)}
                    className="rounded-xl text-left p-4 transition-all relative overflow-hidden"
                    style={{
                      background: 'var(--v3-surface)',
                      border: `1px solid ${isSelected ? color : 'var(--v3-border)'}`,
                    }}
                  >
                    <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
                    <p className="text-[13px] font-bold pr-6" style={{ color: 'var(--v3-text)' }}>{inst.name}</p>
                    <p className="text-[10px] font-mono mb-2" style={{ color: 'var(--v3-text-muted)' }}>{inst.code}</p>

                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: `${color}20`, color }}>
                        {TYPE_LABELS[inst.safeType] || inst.safeType}
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>{inst.city || 'Unknown city'}</span>
                    </div>

                    <p className="text-[10px] font-mono" style={{ color: 'var(--v3-text-muted)' }}>
                      {formatCoordinate(inst.safeLatitude, 'lat')}, {formatCoordinate(inst.safeLongitude, 'lon')}
                    </p>

                    <div className="flex items-center justify-between mt-2 gap-2">
                      <span className="text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>Radius: {inst.safeRadiusKm !== null ? `${inst.safeRadiusKm} km` : 'Unknown'}</span>
                      <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-bold')}
                        style={{
                          background: inst.safeClassification === 'classified' ? 'var(--v3-red-muted)' : 'var(--v3-surface-hover)',
                          color: inst.safeClassification === 'classified' ? 'var(--v3-red)' : 'var(--v3-text-muted)',
                        }}>
                        {inst.safeClassification.toUpperCase()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <aside className="rounded-xl p-5 sticky top-6" style={{ background: 'var(--v3-surface)', border: '1px solid var(--v3-border)' }}>
          {detail ? (
            <div className="space-y-4">
              <div className="rounded-xl p-4 relative overflow-hidden" style={{ background: 'var(--v3-bg)' }}>
                <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${TYPE_COLORS[detail.safeType] || '#60a5fa'}, transparent)` }} />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${TYPE_COLORS[detail.safeType] || '#60a5fa'}15` }}>
                    <MapPin size={18} style={{ color: TYPE_COLORS[detail.safeType] || '#60a5fa' }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold" style={{ color: 'var(--v3-text)' }}>{detail.name}</p>
                    <p className="text-[10px] font-mono" style={{ color: 'var(--v3-text-muted)' }}>{detail.code} · {TYPE_LABELS[detail.safeType] || detail.safeType}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                {[
                  { label: 'City', value: detail.city || 'Unknown' },
                  { label: 'Radius', value: detail.safeRadiusKm !== null ? `${detail.safeRadiusKm} km` : 'Unknown', mono: true },
                  { label: 'Coordinates', value: `${formatCoordinate(detail.safeLatitude, 'lat')}, ${formatCoordinate(detail.safeLongitude, 'lon')}`, mono: true },
                  { label: 'Classification', value: detail.safeClassification.toUpperCase(), highlight: detail.safeClassification === 'classified' },
                ].map(item => (
                  <div key={item.label} className="p-3 rounded-xl" style={{ background: 'var(--v3-bg)' }}>
                    <span className="block text-[9px] uppercase tracking-wider mb-1" style={{ color: 'var(--v3-text-muted)' }}>{item.label}</span>
                    <span className={cn(item.mono && 'font-mono', 'text-[10px]')}
                      style={{ color: item.highlight ? 'var(--v3-red)' : 'var(--v3-text)' }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <a href="/v3/defence/map" className="block text-center text-[11px] transition-colors" style={{ color: 'var(--v3-accent)' }}>
                View on Map →
              </a>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-[12px] font-medium" style={{ color: 'var(--v3-text)' }}>Select an installation</p>
              <p className="text-[11px] mt-1" style={{ color: 'var(--v3-text-muted)' }}>Details will appear here</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
