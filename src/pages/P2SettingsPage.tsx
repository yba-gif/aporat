import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Bell, Key, Users, Sliders, Camera, Copy, Trash2, Plus, Send,
  Check, Eye, EyeOff, AlertTriangle, Info, Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

// ── Types ──
type SettingsTab = 'profile' | 'notifications' | 'api-keys' | 'team' | 'risk-thresholds';

const TABS: { key: SettingsTab; label: string; icon: typeof User }[] = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'api-keys', label: 'API Keys', icon: Key },
  { key: 'team', label: 'Team Management', icon: Users },
  { key: 'risk-thresholds', label: 'Risk Thresholds', icon: Sliders },
];

// ── Mock data ──
const MOCK_API_KEYS = [
  { id: '1', name: 'Production API', key: 'pk_live_••••••••a3F9', created: '2026-01-15', lastUsed: '2 hours ago', status: 'active' as const },
  { id: '2', name: 'Staging API', key: 'pk_test_••••••••x7K2', created: '2026-02-03', lastUsed: '3 days ago', status: 'active' as const },
  { id: '3', name: 'Legacy Integration', key: 'pk_live_••••••••m1P8', created: '2025-08-20', lastUsed: '45 days ago', status: 'revoked' as const },
];

const MOCK_TEAM = [
  { id: '1', name: 'Ayşe Kaya', email: 'ayse.kaya@consulate.gov', role: 'Admin', lastActive: '2 min ago', status: 'Active' as const },
  { id: '2', name: 'Elif Demir', email: 'elif.demir@consulate.gov', role: 'Senior Officer', lastActive: '15 min ago', status: 'Active' as const },
  { id: '3', name: 'Burak Aydın', email: 'burak.aydin@consulate.gov', role: 'Officer', lastActive: '1 hour ago', status: 'Active' as const },
  { id: '4', name: 'Mehmet Yılmaz', email: 'mehmet.yilmaz@consulate.gov', role: 'Senior Officer', lastActive: 'Yesterday', status: 'Active' as const },
  { id: '5', name: 'Zeynep Arslan', email: 'zeynep.arslan@consulate.gov', role: 'Viewer', lastActive: '3 days ago', status: 'Active' as const },
  { id: '6', name: 'Maria Kowalski', email: 'maria.k@consulate.gov', role: 'Officer', lastActive: '—', status: 'Invited' as const },
];

// ── Profile Tab ──
function ProfileTab() {
  const [name, setName] = useState('Ayşe Kaya');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('Europe/Istanbul');

  return (
    <div className="space-y-6 max-w-lg">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full bg-[--p2-navy] flex items-center justify-center text-white text-xl font-bold">AK</div>
          <button className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Camera size={20} className="text-white" />
          </button>
        </div>
        <div>
          <p className="text-sm font-semibold text-[--p2-navy]">Ayşe Kaya</p>
          <p className="text-xs text-[--p2-gray-400]">Click avatar to change photo</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-xs font-semibold text-[--p2-navy] mb-1.5 block">Full Name</Label>
          <Input value={name} onChange={e => setName(e.target.value)} className="h-9 text-sm" />
        </div>
        <div>
          <Label className="text-xs font-semibold text-[--p2-navy] mb-1.5 block">Email <span className="text-[--p2-gray-400] font-normal">(read-only)</span></Label>
          <Input value="ayse.kaya@consulate.gov" readOnly className="h-9 text-sm bg-[--p2-gray-50] text-[--p2-gray-500]" />
        </div>
        <div>
          <Label className="text-xs font-semibold text-[--p2-navy] mb-1.5 block">Role <span className="text-[--p2-gray-400] font-normal">(read-only)</span></Label>
          <Input value="Administrator" readOnly className="h-9 text-sm bg-[--p2-gray-50] text-[--p2-gray-500]" />
        </div>
        <div>
          <Label className="text-xs font-semibold text-[--p2-navy] mb-1.5 block">Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="tr">Türkçe</SelectItem>
              <SelectItem value="ar">العربية</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs font-semibold text-[--p2-navy] mb-1.5 block">Timezone</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Europe/Istanbul">Europe/Istanbul (UTC+3)</SelectItem>
              <SelectItem value="Europe/London">Europe/London (UTC+0)</SelectItem>
              <SelectItem value="Europe/Berlin">Europe/Berlin (UTC+1)</SelectItem>
              <SelectItem value="Asia/Tehran">Asia/Tehran (UTC+3:30)</SelectItem>
              <SelectItem value="America/New_York">America/New_York (UTC-5)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button size="sm" className="bg-[--p2-blue] hover:bg-[--p2-blue]/90 text-white text-xs h-9"
        onClick={() => toast({ title: 'Profile updated', description: 'Your changes have been saved.' })}>
        Save Changes
      </Button>
    </div>
  );
}

// ── Notifications Tab ──
function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    emailHighRisk: true,
    emailDigest: false,
    inAppAssignments: true,
    inAppUpdates: true,
    smsCritical: false,
  });
  const [phone, setPhone] = useState('');

  const toggle = (key: keyof typeof prefs) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const items: { key: keyof typeof prefs; label: string; desc: string }[] = [
    { key: 'emailHighRisk', label: 'Email notifications for high-risk cases', desc: 'Receive an email when a case is flagged with a risk score above your threshold.' },
    { key: 'emailDigest', label: 'Email daily digest', desc: 'Get a summary of all activity from the past 24 hours sent to your inbox each morning.' },
    { key: 'inAppAssignments', label: 'In-app alerts for new assignments', desc: 'Show a notification when a case is assigned to you or your team.' },
    { key: 'inAppUpdates', label: 'In-app alerts for case updates', desc: 'Show a notification when cases you are following have status changes.' },
    { key: 'smsCritical', label: 'SMS alerts for critical cases', desc: 'Receive an SMS message for cases with CRITICAL risk level. Requires phone number.' },
  ];

  return (
    <div className="space-y-5 max-w-lg">
      {items.map(item => (
        <div key={item.key} className="flex items-start gap-4 p-4 rounded-lg border border-[--p2-gray-200] hover:border-[--p2-gray-300] transition-colors">
          <Switch checked={prefs[item.key]} onCheckedChange={() => toggle(item.key)} className="mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-[--p2-navy]">{item.label}</p>
            <p className="text-[11px] text-[--p2-gray-500] mt-0.5 leading-relaxed">{item.desc}</p>
            {item.key === 'smsCritical' && prefs.smsCritical && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3">
                <Input placeholder="+90 5XX XXX XX XX" value={phone} onChange={e => setPhone(e.target.value)} className="h-8 text-xs w-48" />
              </motion.div>
            )}
          </div>
        </div>
      ))}
      <Button size="sm" className="bg-[--p2-blue] hover:bg-[--p2-blue]/90 text-white text-xs h-9"
        onClick={() => toast({ title: 'Preferences saved' })}>
        Save Preferences
      </Button>
    </div>
  );
}

// ── API Keys Tab ──
function ApiKeysTab() {
  const [keys, setKeys] = useState(MOCK_API_KEYS);
  const [showModal, setShowModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyExpiry, setNewKeyExpiry] = useState('90d');
  const [newKeyPerms, setNewKeyPerms] = useState({ readCases: true, writeCases: false, readAnalytics: true, manageUsers: false });
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateKey = () => {
    const key = 'pk_live_' + Array.from({ length: 32 }, () => 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 62)]).join('');
    setGeneratedKey(key);
    setKeys(prev => [{
      id: String(Date.now()), name: newKeyName || 'Untitled Key',
      key: 'pk_live_••••••••' + key.slice(-4),
      created: 'Just now', lastUsed: 'Never', status: 'active' as const,
    }, ...prev]);
  };

  const revokeKey = (id: string) => {
    setKeys(prev => prev.map(k => k.id === id ? { ...k, status: 'revoked' as const } : k));
    setRevokeId(null);
    toast({ title: 'API key revoked' });
  };

  const copyKey = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast({ title: 'Copied to clipboard' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[--p2-gray-500]">Manage API keys for external integrations.</p>
        <Button size="sm" className="h-8 text-xs gap-1.5 bg-[--p2-blue] hover:bg-[--p2-blue]/90 text-white"
          onClick={() => { setShowModal(true); setGeneratedKey(null); setNewKeyName(''); }}>
          <Plus size={13} /> Generate New Key
        </Button>
      </div>

      {/* Table */}
      <div className="p2-card overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[--p2-gray-100] bg-[--p2-gray-50]">
              {['Name', 'Key', 'Created', 'Last Used', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[--p2-gray-400]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {keys.map(k => (
              <tr key={k.id} className="border-b border-[--p2-gray-100] hover:bg-[--p2-gray-50] transition-colors">
                <td className="px-4 py-3 font-semibold text-[--p2-navy]">{k.name}</td>
                <td className="px-4 py-3 font-mono text-[--p2-gray-500]">{k.key}</td>
                <td className="px-4 py-3 text-[--p2-gray-500]">{k.created}</td>
                <td className="px-4 py-3 text-[--p2-gray-500]">{k.lastUsed}</td>
                <td className="px-4 py-3">
                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full',
                    k.status === 'active' ? 'bg-[--p2-green]/10 text-[--p2-green]' : 'bg-[--p2-gray-200]/50 text-[--p2-gray-400]')}>
                    {k.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => copyKey(k.key)} className="p-1.5 rounded-md hover:bg-[--p2-gray-100] text-[--p2-gray-400] hover:text-[--p2-navy]">
                      <Copy size={13} />
                    </button>
                    {k.status === 'active' && (
                      <button onClick={() => setRevokeId(k.id)} className="p-1.5 rounded-md hover:bg-[--p2-red]/5 text-[--p2-gray-400] hover:text-[--p2-red]">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Generate Key Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">{generatedKey ? 'API Key Generated' : 'Generate New API Key'}</DialogTitle>
            <DialogDescription className="text-xs text-[--p2-gray-400]">
              {generatedKey ? 'Copy your key now. It won\'t be shown again.' : 'Configure your new API key.'}
            </DialogDescription>
          </DialogHeader>

          {generatedKey ? (
            <div className="space-y-4">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-[--p2-orange]/5 border border-[--p2-orange]/20">
                <AlertTriangle size={14} className="text-[--p2-orange] flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-[--p2-gray-600]">This key will only be displayed once. Store it securely.</p>
              </div>
              <div className="flex items-center gap-2 p-3 bg-[--p2-gray-50] rounded-lg border border-[--p2-gray-200]">
                <code className="text-[10px] font-mono text-[--p2-navy] flex-1 break-all">{generatedKey}</code>
                <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 flex-shrink-0" onClick={() => copyKey(generatedKey)}>
                  {copied ? <Check size={11} /> : <Copy size={11} />} {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-semibold text-[--p2-navy] mb-1.5 block">Key Name</Label>
                <Input value={newKeyName} onChange={e => setNewKeyName(e.target.value)} placeholder="e.g., Production API" className="h-9 text-xs" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-[--p2-navy] mb-2 block">Permissions</Label>
                <div className="space-y-2">
                  {[
                    { key: 'readCases' as const, label: 'Read Cases' },
                    { key: 'writeCases' as const, label: 'Write Cases' },
                    { key: 'readAnalytics' as const, label: 'Read Analytics' },
                    { key: 'manageUsers' as const, label: 'Manage Users' },
                  ].map(p => (
                    <label key={p.key} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox checked={newKeyPerms[p.key]}
                        onCheckedChange={(v) => setNewKeyPerms(prev => ({ ...prev, [p.key]: v === true }))} />
                      <span className="text-xs text-[--p2-gray-600]">{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold text-[--p2-navy] mb-1.5 block">Expiration</Label>
                <Select value={newKeyExpiry} onValueChange={setNewKeyExpiry}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30d">30 days</SelectItem>
                    <SelectItem value="90d">90 days</SelectItem>
                    <SelectItem value="1y">1 year</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            {generatedKey ? (
              <Button size="sm" className="text-xs h-9" onClick={() => setShowModal(false)}>Done</Button>
            ) : (
              <Button size="sm" className="text-xs h-9 bg-[--p2-blue] hover:bg-[--p2-blue]/90 text-white" onClick={generateKey} disabled={!newKeyName.trim()}>
                Generate Key
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation */}
      <Dialog open={!!revokeId} onOpenChange={() => setRevokeId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Revoke API Key?</DialogTitle>
            <DialogDescription className="text-xs text-[--p2-gray-500]">
              This action cannot be undone. Any integrations using this key will stop working immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => setRevokeId(null)}>Cancel</Button>
            <Button size="sm" className="text-xs h-8 bg-[--p2-red] hover:bg-[--p2-red]/90 text-white" onClick={() => revokeId && revokeKey(revokeId)}>Revoke Key</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Team Management Tab ──
function TeamTab() {
  const [team, setTeam] = useState(MOCK_TEAM);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Officer');

  const sendInvite = () => {
    if (!inviteEmail.trim()) return;
    setTeam(prev => [...prev, {
      id: String(Date.now()), name: inviteEmail.split('@')[0],
      email: inviteEmail, role: inviteRole, lastActive: '—', status: 'Invited' as const,
    }]);
    setInviteEmail('');
    setShowInvite(false);
    toast({ title: 'Invitation sent', description: `Invite sent to ${inviteEmail}` });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[--p2-gray-500]">{team.length} team members</p>
        <Button size="sm" className="h-8 text-xs gap-1.5 bg-[--p2-blue] hover:bg-[--p2-blue]/90 text-white"
          onClick={() => setShowInvite(true)}>
          <Plus size={13} /> Invite Team Member
        </Button>
      </div>

      <div className="p2-card overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[--p2-gray-100] bg-[--p2-gray-50]">
              {['Name', 'Email', 'Role', 'Last Active', 'Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[--p2-gray-400]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {team.map(m => (
              <tr key={m.id} className="border-b border-[--p2-gray-100] hover:bg-[--p2-gray-50] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[--p2-navy] text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                      {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className="font-semibold text-[--p2-navy]">{m.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[--p2-gray-500]">{m.email}</td>
                <td className="px-4 py-3">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[--p2-blue]/10 text-[--p2-blue]">{m.role}</span>
                </td>
                <td className="px-4 py-3 text-[--p2-gray-500]">{m.lastActive}</td>
                <td className="px-4 py-3">
                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full',
                    m.status === 'Active' ? 'bg-[--p2-green]/10 text-[--p2-green]' : 'bg-[--p2-orange]/10 text-[--p2-orange]')}>
                    {m.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Invite Team Member</DialogTitle>
            <DialogDescription className="text-xs text-[--p2-gray-400]">Send an invitation to join the platform.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold text-[--p2-navy] mb-1.5 block">Email Address</Label>
              <Input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@consulate.gov" className="h-9 text-xs" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-[--p2-navy] mb-1.5 block">Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Senior Officer">Senior Officer</SelectItem>
                  <SelectItem value="Officer">Officer</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" className="text-xs h-9 gap-1.5 bg-[--p2-blue] hover:bg-[--p2-blue]/90 text-white" onClick={sendInvite} disabled={!inviteEmail.trim()}>
              <Send size={11} /> Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Risk Thresholds Tab ──
function RiskThresholdsTab() {
  const [low, setLow] = useState(25);
  const [med, setMed] = useState(50);
  const [high, setHigh] = useState(75);

  const [weights, setWeights] = useState({
    compliance: 30,
    social: 25,
    behavioral: 20,
    identity: 15,
    pattern: 10,
  });

  const totalWeight = useMemo(() => Object.values(weights).reduce((s, v) => s + v, 0), [weights]);
  const weightWarning = totalWeight !== 100;

  const setWeight = (key: keyof typeof weights, val: number) => {
    setWeights(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="space-y-8 max-w-xl">
      {/* Risk Ranges */}
      <div>
        <h3 className="text-xs font-semibold text-[--p2-navy] mb-4">Risk Score Ranges</h3>

        {/* Visual bar */}
        <div className="h-8 rounded-lg overflow-hidden flex mb-5">
          <div className="flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${low}%`, background: 'var(--p2-green)' }}>
            Low (0-{low})
          </div>
          <div className="flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${med - low}%`, background: 'var(--p2-orange)' }}>
            Med ({low + 1}-{med})
          </div>
          <div className="flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${high - med}%`, background: 'var(--p2-red)' }}>
            High ({med + 1}-{high})
          </div>
          <div className="flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${100 - high}%`, background: 'var(--p2-navy)' }}>
            Critical ({high + 1}+)
          </div>
        </div>

        <div className="space-y-5">
          {[
            { label: 'Low Risk Maximum', value: low, set: setLow, color: 'var(--p2-green)', max: med - 1 },
            { label: 'Medium Risk Maximum', value: med, set: setMed, color: 'var(--p2-orange)', max: high - 1 },
            { label: 'High Risk Maximum', value: high, set: setHigh, color: 'var(--p2-red)', max: 99 },
          ].map(s => (
            <div key={s.label}>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-[11px] font-medium text-[--p2-gray-600]">{s.label}</Label>
                <span className="text-xs font-bold" style={{ color: s.color }}>{s.value}</span>
              </div>
              <Slider
                value={[s.value]}
                min={1}
                max={s.max}
                step={1}
                onValueChange={([v]) => s.set(v)}
                className="w-full"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Weight Config */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-[--p2-navy]">Score Weight Configuration</h3>
          <span className={cn('text-xs font-bold', weightWarning ? 'text-[--p2-red]' : 'text-[--p2-green]')}>
            Total: {totalWeight}%
          </span>
        </div>

        {weightWarning && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[--p2-red]/5 border border-[--p2-red]/20 mb-4">
            <AlertTriangle size={14} className="text-[--p2-red] flex-shrink-0" />
            <p className="text-[11px] text-[--p2-gray-600]">Weights must sum to 100%. Currently: {totalWeight}%</p>
          </div>
        )}

        <div className="space-y-4">
          {[
            { key: 'compliance' as const, label: 'Compliance Weight' },
            { key: 'social' as const, label: 'Social Network Weight' },
            { key: 'behavioral' as const, label: 'Behavioral Weight' },
            { key: 'identity' as const, label: 'Identity Weight' },
            { key: 'pattern' as const, label: 'Pattern Weight' },
          ].map(w => (
            <div key={w.key}>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-[11px] font-medium text-[--p2-gray-600]">{w.label}</Label>
                <span className="text-xs font-bold text-[--p2-navy]">{weights[w.key]}%</span>
              </div>
              <Slider
                value={[weights[w.key]]}
                min={0}
                max={100}
                step={5}
                onValueChange={([v]) => setWeight(w.key, v)}
                className="w-full"
              />
            </div>
          ))}
        </div>
      </div>

      <Button size="sm" className="bg-[--p2-blue] hover:bg-[--p2-blue]/90 text-white text-xs h-9" disabled={weightWarning}
        onClick={() => toast({ title: 'Configuration saved', description: 'Risk thresholds and weights updated.' })}>
        Save Configuration
      </Button>
    </div>
  );
}

// ── Main Settings Component ──
export default function P2Settings() {
  const [tab, setTab] = useState<SettingsTab>('profile');

  const renderContent = () => {
    switch (tab) {
      case 'profile': return <ProfileTab />;
      case 'notifications': return <NotificationsTab />;
      case 'api-keys': return <ApiKeysTab />;
      case 'team': return <TeamTab />;
      case 'risk-thresholds': return <RiskThresholdsTab />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left nav */}
      <nav className="lg:w-52 flex-shrink-0">
        <div className="p2-card p-2 lg:sticky lg:top-20">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-xs font-medium transition-all text-left',
                  tab === t.key
                    ? 'bg-[--p2-blue]/10 text-[--p2-blue]'
                    : 'text-[--p2-gray-500] hover:bg-[--p2-gray-50] hover:text-[--p2-navy]',
                )}>
                <Icon size={15} />
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="p2-card p-6"
          >
            <h2 className="text-sm font-bold text-[--p2-navy] mb-5">{TABS.find(t => t.key === tab)?.label}</h2>
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
