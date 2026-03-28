import { useState } from 'react';
import { Plus, MapPin, X } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useInstallations, useAddInstallation, type Installation } from '@/hooks/useDefenceApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const TYPE_COLORS: Record<string, string> = {
  airfield: '#3B82F6', naval: '#10B981', headquarters: '#EF4444', army_base: '#F59E0B', training: '#A855F7', radar: '#06B6D4',
};
const TYPE_LABELS: Record<string, string> = {
  airfield: 'Airfield', naval: 'Naval Base', headquarters: 'HQ', army_base: 'Army Base', training: 'Training', radar: 'Radar',
};

export default function DefenceInstallations() {
  const { data: installations, isLoading } = useInstallations();
  const addInst = useAddInstallation();
  const [modalOpen, setModalOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const detail = installations?.find(i => i.id === detailId);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Installations</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Military installations with active geofence monitoring</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-md text-[12px] font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors">
          <Plus size={14} /> Add Installation
        </button>
      </div>

      {/* Card Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border p-4 h-36" style={{ background: '#111827', borderColor: '#1E293B' }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {installations?.map(inst => {
            const color = TYPE_COLORS[inst.installation_type] || '#3B82F6';
            return (
              <button
                key={inst.id}
                onClick={() => setDetailId(inst.id)}
                className="rounded-lg border text-left p-4 transition-all hover:border-slate-700 relative overflow-hidden group"
                style={{ background: '#111827', borderColor: '#1E293B' }}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: color }} />
                <div className="text-[13px] font-bold text-white mb-0.5">{inst.name}</div>
                <div className="text-[10px] font-mono text-slate-500 mb-2">{inst.code}</div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: `${color}20`, color }}>{TYPE_LABELS[inst.installation_type]}</span>
                  <span className="text-[10px] text-slate-500">{inst.city}</span>
                </div>
                <div className="text-[10px] font-mono text-slate-600">{inst.latitude.toFixed(4)}°N, {inst.longitude.toFixed(4)}°E</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-slate-600">Radius: {inst.radius_km} km</span>
                  <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-bold', inst.classification === 'classified' ? 'bg-red-500/15 text-red-400' : 'bg-slate-600/15 text-slate-500')}>
                    {inst.classification.toUpperCase()}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detail} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="border max-w-lg" style={{ background: '#111827', borderColor: '#1E293B' }}>
          <DialogHeader>
            <DialogTitle className="text-white text-sm">{detail?.name}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4 pt-2">
              <div className="h-48 rounded-lg overflow-hidden">
                <MapContainer
                  center={[detail.latitude, detail.longitude]}
                  zoom={12}
                  style={{ height: '100%', width: '100%', background: '#0A0F1C' }}
                  zoomControl={false}
                  attributionControl={false}
                >
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                  <Circle center={[detail.latitude, detail.longitude]} radius={detail.radius_km * 1000} pathOptions={{ color: TYPE_COLORS[detail.installation_type], fillColor: TYPE_COLORS[detail.installation_type], fillOpacity: 0.1, weight: 1 }} />
                  <CircleMarker center={[detail.latitude, detail.longitude]} radius={6} pathOptions={{ color: TYPE_COLORS[detail.installation_type], fillColor: TYPE_COLORS[detail.installation_type], fillOpacity: 0.9, weight: 2 }} />
                </MapContainer>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div><span className="text-slate-500">Code:</span> <span className="text-slate-300 font-mono">{detail.code}</span></div>
                <div><span className="text-slate-500">Type:</span> <span className="text-slate-300">{TYPE_LABELS[detail.installation_type]}</span></div>
                <div><span className="text-slate-500">City:</span> <span className="text-slate-300">{detail.city}</span></div>
                <div><span className="text-slate-500">Radius:</span> <span className="text-slate-300 font-mono">{detail.radius_km} km</span></div>
                <div><span className="text-slate-500">Coordinates:</span> <span className="text-slate-300 font-mono">{detail.latitude.toFixed(4)}, {detail.longitude.toFixed(4)}</span></div>
                <div><span className="text-slate-500">Classification:</span> <span className={detail.classification === 'classified' ? 'text-red-400' : 'text-slate-300'}>{detail.classification}</span></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Modal - simplified */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="border" style={{ background: '#111827', borderColor: '#1E293B' }}>
          <DialogHeader>
            <DialogTitle className="text-white text-sm">Add Installation</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 text-slate-500 text-[12px]">
            <MapPin size={24} className="mx-auto mb-2 text-slate-600" />
            Installation creation requires backend connectivity
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
