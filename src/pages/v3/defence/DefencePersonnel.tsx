import { useState, useMemo } from 'react';
import { UserPlus, ChevronDown, ChevronUp } from 'lucide-react';
import { usePersonnel, useAddPersonnel, type Person } from '@/hooks/useDefenceApi';
import { PlatformIcon } from '@/components/defence/PlatformIcon';
import { TableSkeleton } from '@/components/defence/DefenceSkeletons';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

function OpsecBar({ score }: { score: number }) {
  const color = score >= 70 ? '#EF4444' : score >= 40 ? '#F59E0B' : '#10B981';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-[11px] font-mono font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

export default function DefencePersonnel() {
  const { data: personnel, isLoading } = usePersonnel();
  const addPerson = useAddPersonnel();
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', rank: '', unit: '' });

  const sorted = useMemo(() => {
    if (!personnel) return [];
    return [...personnel].sort((a, b) => b.opsec_score - a.opsec_score);
  }, [personnel]);

  const handleAdd = () => {
    if (!form.name.trim()) return;
    addPerson.mutate({ name: form.name, rank: form.rank || undefined, unit: form.unit || undefined });
    setForm({ name: '', rank: '', unit: '' });
    setModalOpen(false);
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Personnel Database</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Monitored military personnel and OPSEC risk scores</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-[12px] font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors"
        >
          <UserPlus size={14} /> Add Person
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden" style={{ background: '#111827', borderColor: '#1E293B' }}>
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase border-b" style={{ borderColor: '#1E293B' }}>
          <div className="col-span-3">Name</div>
          <div className="col-span-2">Rank</div>
          <div className="col-span-3">Unit</div>
          <div className="col-span-2">OPSEC Risk</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1"></div>
        </div>

        {isLoading ? <div className="p-4"><TableSkeleton rows={5} /></div> : sorted.length === 0 ? (
          <div className="text-center py-12 text-slate-600 text-xs">No personnel in database</div>
        ) : (
          sorted.map(person => (
            <div key={person.id}>
              <button
                onClick={() => setExpandedId(expandedId === person.id ? null : person.id)}
                className="grid grid-cols-12 gap-4 items-center px-4 py-3 w-full text-left text-[12px] transition-colors hover:bg-white/[0.02] border-b"
                style={{ borderColor: '#1E293B20' }}
              >
                <div className="col-span-3 text-slate-200 font-medium">{person.name}</div>
                <div className="col-span-2 text-slate-400 font-mono text-[11px]">{person.rank || '—'}</div>
                <div className="col-span-3 text-slate-400 text-[11px]">{person.unit || '—'}</div>
                <div className="col-span-2"><OpsecBar score={person.opsec_score} /></div>
                <div className="col-span-1">
                  <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold', person.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-600/15 text-slate-500')}>
                    {person.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                <div className="col-span-1 text-right text-slate-600">
                  {expandedId === person.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </button>

              {/* Expanded */}
              {expandedId === person.id && (
                <div className="px-6 py-4 border-b space-y-3" style={{ background: '#0D1321', borderColor: '#1E293B20' }}>
                  <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Social Accounts</div>
                  {person.social_accounts && person.social_accounts.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {person.social_accounts.map(acc => (
                        <div key={`${acc.platform}-${acc.username}`} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border" style={{ background: '#111827', borderColor: '#1E293B' }}>
                          <PlatformIcon platform={acc.platform} size="sm" />
                          <span className="text-[11px] font-mono text-slate-300">{acc.username}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-600">No social accounts linked</div>
                  )}
                  <div className="flex gap-4 text-[11px]">
                    <span className="text-slate-500">Alerts: <span className="text-slate-300 font-mono">{person.alert_count || 0}</span></span>
                    <span className="text-slate-500">Added: <span className="text-slate-300 font-mono">{new Date(person.created_at).toLocaleDateString()}</span></span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="border" style={{ background: '#111827', borderColor: '#1E293B' }}>
          <DialogHeader>
            <DialogTitle className="text-white text-sm">Add Personnel</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Name *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-md text-[12px] text-white border focus:outline-none focus:border-blue-500/50" style={{ background: '#0A0F1C', borderColor: '#1E293B' }} />
            </div>
            <div>
              <label className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Rank</label>
              <input value={form.rank} onChange={e => setForm({ ...form, rank: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-md text-[12px] text-white border focus:outline-none focus:border-blue-500/50" style={{ background: '#0A0F1C', borderColor: '#1E293B' }} />
            </div>
            <div>
              <label className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Unit</label>
              <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-md text-[12px] text-white border focus:outline-none focus:border-blue-500/50" style={{ background: '#0A0F1C', borderColor: '#1E293B' }} />
            </div>
            <button onClick={handleAdd} className="w-full py-2 rounded-md text-[12px] font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors">
              Add Personnel
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
