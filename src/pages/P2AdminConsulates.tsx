import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Users, Folder, Plus, X, Settings, Key, Check, Globe,
  Mail, MapPin, CreditCard, BarChart3, Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface Consulate {
  id: string; name: string; city: string; country: string; flag: string;
  users: number; casesMonth: number; tier: 'Basic' | 'Professional' | 'Enterprise';
  contact: string; apiKey: string;
}

const TIER_STYLE: Record<string, { color: string; bg: string }> = {
  Basic: { color: 'var(--p2-gray-500)', bg: 'rgba(100,116,139,0.1)' },
  Professional: { color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
  Enterprise: { color: 'var(--p2-blue)', bg: 'rgba(41,128,185,0.1)' },
};

const CONSULATES: Consulate[] = [
  { id: 'c1', name: 'Ankara HQ', city: 'Ankara', country: 'Turkey', flag: '🇹🇷', users: 42, casesMonth: 312, tier: 'Enterprise', contact: 'admin@mfa.gov.tr', apiKey: 'pk_live_••••7821' },
  { id: 'c2', name: 'Istanbul Consulate', city: 'Istanbul', country: 'Turkey', flag: '🇹🇷', users: 28, casesMonth: 487, tier: 'Enterprise', contact: 'ist@mfa.gov.tr', apiKey: 'pk_live_••••3401' },
  { id: 'c3', name: 'Berlin Embassy', city: 'Berlin', country: 'Germany', flag: '🇩🇪', users: 15, casesMonth: 198, tier: 'Professional', contact: 'visa@berlin.embassy.tr', apiKey: 'pk_live_••••9102' },
  { id: 'c4', name: 'London Embassy', city: 'London', country: 'United Kingdom', flag: '🇬🇧', users: 18, casesMonth: 234, tier: 'Professional', contact: 'visa@london.embassy.tr', apiKey: 'pk_live_••••5543' },
  { id: 'c5', name: 'Paris Embassy', city: 'Paris', country: 'France', flag: '🇫🇷', users: 12, casesMonth: 156, tier: 'Professional', contact: 'visa@paris.embassy.tr', apiKey: 'pk_live_••••2210' },
  { id: 'c6', name: 'Vienna Consulate', city: 'Vienna', country: 'Austria', flag: '🇦🇹', users: 8, casesMonth: 89, tier: 'Basic', contact: 'visa@vienna.embassy.tr', apiKey: 'pk_live_••••8877' },
  { id: 'c7', name: 'Rome Embassy', city: 'Rome', country: 'Italy', flag: '🇮🇹', users: 10, casesMonth: 112, tier: 'Basic', contact: 'visa@rome.embassy.tr', apiKey: 'pk_live_••••6634' },
  { id: 'c8', name: 'Madrid Embassy', city: 'Madrid', country: 'Spain', flag: '🇪🇸', users: 9, casesMonth: 97, tier: 'Basic', contact: 'visa@madrid.embassy.tr', apiKey: 'pk_live_••••4421' },
];

function AddModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [autoKey, setAutoKey] = useState(true);

  if (!open) return null;

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[--p2-navy]">Add New Consulate</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-[--p2-gray-100] text-[--p2-gray-400]"><X size={16} /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label className="text-xs font-medium text-[--p2-gray-700]">Consulate Name *</Label>
            <Input placeholder="e.g. Zurich Consulate" className="mt-1.5 h-10" />
          </div>
          <div>
            <Label className="text-xs font-medium text-[--p2-gray-700]">Country *</Label>
            <Input placeholder="e.g. Switzerland" className="mt-1.5 h-10" />
          </div>
          <div>
            <Label className="text-xs font-medium text-[--p2-gray-700]">City *</Label>
            <Input placeholder="e.g. Zurich" className="mt-1.5 h-10" />
          </div>
          <div className="col-span-2">
            <Label className="text-xs font-medium text-[--p2-gray-700]">Address</Label>
            <Input placeholder="Street address" className="mt-1.5 h-10" />
          </div>
          <div>
            <Label className="text-xs font-medium text-[--p2-gray-700]">Primary Contact Email *</Label>
            <Input type="email" placeholder="visa@consulate.gov" className="mt-1.5 h-10" />
          </div>
          <div>
            <Label className="text-xs font-medium text-[--p2-gray-700]">Subscription Tier *</Label>
            <Select defaultValue="Basic">
              <SelectTrigger className="mt-1.5 h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Basic">Basic</SelectItem>
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="Enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[--p2-gray-50] border border-[--p2-gray-100]">
          <Switch checked={autoKey} onCheckedChange={setAutoKey} />
          <div>
            <p className="text-[11px] font-medium text-[--p2-navy]">Auto-generate API Key</p>
            <p className="text-[9px] text-[--p2-gray-400]">Create a production API key for this consulate</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" className="text-xs h-9" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="text-xs h-9 gap-1.5 bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => { toast({ title: 'Consulate created successfully' }); onClose(); }}>
            <Plus size={12} /> Create Consulate
          </Button>
        </div>
      </motion.div>
    </>
  );
}

function DetailPanel({ consulate, onClose }: { consulate: Consulate; onClose: () => void }) {
  const ts = TIER_STYLE[consulate.tier];
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-full max-w-[440px] bg-white z-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[--p2-gray-200]">
          <h2 className="text-sm font-bold text-[--p2-navy]">{consulate.name}</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[--p2-gray-100] text-[--p2-gray-400]"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{consulate.flag}</span>
            <div>
              <p className="text-sm font-bold text-[--p2-navy]">{consulate.city}, {consulate.country}</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: ts.color, background: ts.bg }}>{consulate.tier}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Users, label: 'Users', value: consulate.users },
              { icon: Folder, label: 'Cases/mo', value: consulate.casesMonth },
              { icon: Key, label: 'API Key', value: consulate.apiKey },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-lg bg-[--p2-gray-50] border border-[--p2-gray-100] text-center">
                <s.icon size={14} className="mx-auto text-[--p2-gray-400] mb-1" />
                <p className="text-xs font-bold text-[--p2-navy]">{s.value}</p>
                <p className="text-[9px] text-[--p2-gray-400]">{s.label}</p>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-[11px] font-semibold text-[--p2-navy] uppercase tracking-wider mb-2">Usage (Last 30 Days)</h3>
            <div className="space-y-2">
              {[
                { label: 'API Requests', value: `${(consulate.casesMonth * 42).toLocaleString()}`, pct: Math.min(100, consulate.casesMonth / 5) },
                { label: 'Screening Scans', value: `${consulate.casesMonth}`, pct: Math.min(100, consulate.casesMonth / 5) },
                { label: 'Storage Used', value: `${(consulate.casesMonth * 0.8).toFixed(0)} MB`, pct: Math.min(100, consulate.casesMonth * 0.15) },
              ].map(m => (
                <div key={m.label} className="p-3 rounded-lg border border-[--p2-gray-100]">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[10px] text-[--p2-gray-500]">{m.label}</span>
                    <span className="text-[10px] font-semibold text-[--p2-navy]">{m.value}</span>
                  </div>
                  <div className="h-1.5 bg-[--p2-gray-100] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: m.pct > 80 ? 'var(--p2-orange)' : 'var(--p2-blue)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-[11px] font-semibold text-[--p2-navy] uppercase tracking-wider mb-2">Contact</h3>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[--p2-gray-50] border border-[--p2-gray-100]">
              <Mail size={13} className="text-[--p2-gray-400]" />
              <span className="text-xs text-[--p2-navy]">{consulate.contact}</span>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[--p2-gray-200] flex justify-end gap-2">
          <Button variant="outline" size="sm" className="text-xs h-9" onClick={onClose}>Close</Button>
          <Button size="sm" className="text-xs h-9 gap-1.5 bg-purple-600 hover:bg-purple-700 text-white">
            <Settings size={12} /> Edit Settings
          </Button>
        </div>
      </motion.div>
    </>
  );
}

export default function P2AdminConsulates() {
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<Consulate | null>(null);

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[--p2-navy]">Consulate Management</h1>
          <p className="text-xs text-[--p2-gray-400]">{CONSULATES.length} consulates across {new Set(CONSULATES.map(c => c.country)).size} countries</p>
        </div>
        <Button size="sm" className="h-9 text-xs gap-1.5 bg-purple-600 hover:bg-purple-700 text-white" onClick={() => setAddOpen(true)}>
          <Plus size={13} /> Add New Consulate
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {CONSULATES.map((c, i) => {
          const ts = TIER_STYLE[c.tier];
          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              whileHover={{ y: -3, boxShadow: '0 8px 30px -12px rgba(0,0,0,0.12)' }}
              className="p2-card p-5 flex flex-col">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl">{c.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[--p2-navy] truncate">{c.name}</p>
                  <p className="text-[10px] text-[--p2-gray-400]">{c.city}, {c.country}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="p-2 rounded-md bg-[--p2-gray-50]">
                  <p className="text-[9px] text-[--p2-gray-400]">Users</p>
                  <p className="text-sm font-bold text-[--p2-navy]">{c.users}</p>
                </div>
                <div className="p-2 rounded-md bg-[--p2-gray-50]">
                  <p className="text-[9px] text-[--p2-gray-400]">Cases/mo</p>
                  <p className="text-sm font-bold text-[--p2-navy]">{c.casesMonth}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: ts.color, background: ts.bg }}>{c.tier}</span>
                <Button variant="outline" size="sm" className="text-[10px] h-7 px-3" onClick={() => setSelected(c)}>Manage</Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>{addOpen && <AddModal open={addOpen} onClose={() => setAddOpen(false)} />}</AnimatePresence>
      <AnimatePresence>{selected && <DetailPanel consulate={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
    </div>
  );
}
