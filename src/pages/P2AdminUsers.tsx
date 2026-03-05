import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, MoreHorizontal, X, User, Mail, Shield, Building2,
  Clock, Edit, Pause, Trash2, KeyRound, Eye, Check, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

// ── Types ──
type Role = 'Super Admin' | 'Admin' | 'Senior Officer' | 'Officer' | 'Viewer';
type Status = 'Active' | 'Invited' | 'Suspended';

interface MockUser {
  id: string; name: string; email: string; role: Role; consulate: string;
  status: Status; lastActive: string; initials: string; avatarColor: string;
}

// ── Constants ──
const ROLES: Role[] = ['Super Admin', 'Admin', 'Senior Officer', 'Officer', 'Viewer'];
const STATUSES: Status[] = ['Active', 'Invited', 'Suspended'];
const CONSULATES = ['Ankara HQ', 'Istanbul', 'Izmir', 'Berlin', 'London', 'Paris', 'Washington DC', 'Riyadh'];

const ROLE_BADGE: Record<Role, { color: string; bg: string }> = {
  'Super Admin': { color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
  'Admin': { color: '#4F46E5', bg: 'rgba(79,70,229,0.1)' },
  'Senior Officer': { color: 'var(--p2-blue)', bg: 'rgba(41,128,185,0.1)' },
  'Officer': { color: '#0D9488', bg: 'rgba(13,148,136,0.1)' },
  'Viewer': { color: 'var(--p2-gray-500)', bg: 'rgba(100,116,139,0.1)' },
};

const STATUS_STYLE: Record<Status, { color: string; bg: string }> = {
  Active: { color: 'var(--p2-green)', bg: 'rgba(39,174,96,0.1)' },
  Invited: { color: 'var(--p2-orange)', bg: 'rgba(230,126,34,0.1)' },
  Suspended: { color: 'var(--p2-red)', bg: 'rgba(192,57,43,0.1)' },
};

const AVATAR_COLORS = ['#7C3AED', '#4F46E5', '#2563EB', '#0D9488', '#D97706', '#DC2626', '#059669', '#7C3AED', '#6366F1'];

// ── Mock Users ──
const MOCK_USERS: MockUser[] = ([
  { id: 'u1', name: 'Ayşe Kaya', email: 'ayse.kaya@mfa.gov.tr', role: 'Super Admin', consulate: 'Ankara HQ', status: 'Active', lastActive: '2 min ago' },
  { id: 'u2', name: 'Mehmet Yılmaz', email: 'mehmet.y@mfa.gov.tr', role: 'Admin', consulate: 'Ankara HQ', status: 'Active', lastActive: '15 min ago' },
  { id: 'u3', name: 'Elif Demir', email: 'elif.d@mfa.gov.tr', role: 'Senior Officer', consulate: 'Istanbul', status: 'Active', lastActive: '1 hour ago' },
  { id: 'u4', name: 'Can Özkan', email: 'can.o@mfa.gov.tr', role: 'Officer', consulate: 'Istanbul', status: 'Active', lastActive: '30 min ago' },
  { id: 'u5', name: 'Zeynep Arslan', email: 'zeynep.a@mfa.gov.tr', role: 'Officer', consulate: 'Izmir', status: 'Active', lastActive: '3 hours ago' },
  { id: 'u6', name: 'Hans Weber', email: 'h.weber@embassy.de', role: 'Senior Officer', consulate: 'Berlin', status: 'Active', lastActive: '45 min ago' },
  { id: 'u7', name: 'Sarah Mitchell', email: 's.mitchell@embassy.uk', role: 'Admin', consulate: 'London', status: 'Active', lastActive: '20 min ago' },
  { id: 'u8', name: 'Pierre Dubois', email: 'p.dubois@embassy.fr', role: 'Senior Officer', consulate: 'Paris', status: 'Active', lastActive: '2 hours ago' },
  { id: 'u9', name: 'James Cooper', email: 'j.cooper@embassy.us', role: 'Officer', consulate: 'Washington DC', status: 'Active', lastActive: '5 min ago' },
  { id: 'u10', name: 'Fatma Çelik', email: 'fatma.c@mfa.gov.tr', role: 'Viewer', consulate: 'Ankara HQ', status: 'Active', lastActive: '1 day ago' },
  { id: 'u11', name: 'Ali Şahin', email: 'ali.s@mfa.gov.tr', role: 'Officer', consulate: 'Istanbul', status: 'Suspended', lastActive: '2 weeks ago' },
  { id: 'u12', name: 'Emma Schmidt', email: 'e.schmidt@embassy.de', role: 'Officer', consulate: 'Berlin', status: 'Active', lastActive: '6 hours ago' },
  { id: 'u13', name: 'Omar Al-Rashid', email: 'o.rashid@embassy.sa', role: 'Senior Officer', consulate: 'Riyadh', status: 'Active', lastActive: '1 hour ago' },
  { id: 'u14', name: 'Deniz Yıldız', email: 'deniz.y@mfa.gov.tr', role: 'Viewer', consulate: 'Izmir', status: 'Invited', lastActive: 'Never' },
  { id: 'u15', name: 'Sophie Laurent', email: 's.laurent@embassy.fr', role: 'Viewer', consulate: 'Paris', status: 'Invited', lastActive: 'Never' },
  { id: 'u16', name: 'Thomas Brown', email: 't.brown@embassy.uk', role: 'Officer', consulate: 'London', status: 'Active', lastActive: '4 hours ago' },
  { id: 'u17', name: 'Hasan Koç', email: 'hasan.k@mfa.gov.tr', role: 'Admin', consulate: 'Istanbul', status: 'Active', lastActive: '10 min ago' },
  { id: 'u18', name: 'Maria Gonzalez', email: 'm.gonzalez@embassy.us', role: 'Viewer', consulate: 'Washington DC', status: 'Active', lastActive: '2 days ago' },
  { id: 'u19', name: 'Burak Aydın', email: 'burak.a@mfa.gov.tr', role: 'Officer', consulate: 'Ankara HQ', status: 'Active', lastActive: '25 min ago' },
  { id: 'u20', name: 'Anna Müller', email: 'a.muller@embassy.de', role: 'Viewer', consulate: 'Berlin', status: 'Suspended', lastActive: '1 month ago' },
  { id: 'u21', name: 'Selin Öztürk', email: 'selin.o@mfa.gov.tr', role: 'Senior Officer', consulate: 'Ankara HQ', status: 'Active', lastActive: '8 min ago' },
  { id: 'u22', name: 'David Wilson', email: 'd.wilson@embassy.uk', role: 'Senior Officer', consulate: 'London', status: 'Active', lastActive: '35 min ago' },
  { id: 'u23', name: 'Khalid Hassan', email: 'k.hassan@embassy.sa', role: 'Officer', consulate: 'Riyadh', status: 'Invited', lastActive: 'Never' },
  { id: 'u24', name: 'Ceren Aktaş', email: 'ceren.a@mfa.gov.tr', role: 'Viewer', consulate: 'Izmir', status: 'Active', lastActive: '12 hours ago' },
  { id: 'u25', name: 'Lucas Martin', email: 'l.martin@embassy.fr', role: 'Officer', consulate: 'Paris', status: 'Active', lastActive: '50 min ago' },
] as const).map((u, i) => ({
  ...u,
  initials: u.name.split(' ').map(n => n[0]).join('').slice(0, 2),
  avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
} as MockUser));

const PERMISSIONS = [
  { key: 'view_cases', label: 'View Cases', desc: 'Access case listings and details' },
  { key: 'edit_cases', label: 'Edit Cases', desc: 'Modify case data and status' },
  { key: 'approve_cases', label: 'Approve/Deny Cases', desc: 'Make final decisions on cases' },
  { key: 'view_analytics', label: 'View Analytics', desc: 'Access dashboards and reports' },
  { key: 'manage_users', label: 'Manage Users', desc: 'Invite, edit, and remove users' },
  { key: 'api_access', label: 'API Access', desc: 'Use API keys for integrations' },
  { key: 'export_data', label: 'Export Data', desc: 'Download reports and case data' },
  { key: 'system_config', label: 'System Configuration', desc: 'Modify risk thresholds and settings' },
];

const USER_ACTIVITY = [
  { action: 'Reviewed case CLR-2026-4721', time: '2 min ago' },
  { action: 'Approved applicant Ahmad Rezaee', time: '15 min ago' },
  { action: 'Updated risk threshold to 75', time: '1 hour ago' },
  { action: 'Exported weekly compliance report', time: '3 hours ago' },
  { action: 'Logged in from 85.107.xx.xx', time: '4 hours ago' },
  { action: 'Changed notification preferences', time: 'Yesterday' },
];

// ── Invite Modal ──
function InviteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [emails, setEmails] = useState('');
  const [role, setRole] = useState('');
  const [consulate, setConsulate] = useState('');

  const send = () => {
    const count = emails.split(',').filter(e => e.trim()).length;
    if (!count || !role || !consulate) {
      toast({ title: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    toast({ title: `${count} invitation${count > 1 ? 's' : ''} sent successfully` });
    setEmails(''); setRole(''); setConsulate('');
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[--p2-navy]">Invite Users</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-[--p2-gray-100] text-[--p2-gray-400]"><X size={16} /></button>
        </div>
        <div>
          <Label className="text-xs font-medium text-[--p2-gray-700]">Email Addresses *</Label>
          <Input value={emails} onChange={e => setEmails(e.target.value)} placeholder="user1@example.com, user2@example.com" className="mt-1.5 h-11" />
          <p className="text-[10px] text-[--p2-gray-400] mt-1">Separate multiple emails with commas</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-medium text-[--p2-gray-700]">Role *</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-medium text-[--p2-gray-700]">Consulate *</Label>
            <Select value={consulate} onValueChange={setConsulate}>
              <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{CONSULATES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" className="text-xs h-9" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="text-xs h-9 gap-1.5 bg-purple-600 hover:bg-purple-700 text-white" onClick={send}>
            <Mail size={12} /> Send Invitations
          </Button>
        </div>
      </motion.div>
    </>
  );
}

// ── User Detail Slide-Over ──
function UserDetail({ user, onClose }: { user: MockUser; onClose: () => void }) {
  const rb = ROLE_BADGE[user.role];
  const sb = STATUS_STYLE[user.status];
  const [perms, setPerms] = useState<Record<string, boolean>>(() => {
    const defaults: Record<string, boolean> = {};
    PERMISSIONS.forEach(p => {
      defaults[p.key] = user.role === 'Super Admin' || user.role === 'Admin'
        ? true
        : ['view_cases', 'view_analytics'].includes(p.key);
    });
    return defaults;
  });

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-full max-w-[460px] bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[--p2-gray-200]">
          <h2 className="text-sm font-bold text-[--p2-navy]">User Details</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[--p2-gray-100] text-[--p2-gray-400]"><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Profile */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white" style={{ background: user.avatarColor }}>
              {user.initials}
            </div>
            <div>
              <p className="text-sm font-bold text-[--p2-navy]">{user.name}</p>
              <p className="text-[11px] text-[--p2-gray-500]">{user.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: rb.color, background: rb.bg }}>{user.role}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: sb.color, background: sb.bg }}>{user.status}</span>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Building2, label: 'Consulate', value: user.consulate },
              { icon: Clock, label: 'Last Active', value: user.lastActive },
            ].map(i => (
              <div key={i.label} className="p-3 rounded-lg bg-[--p2-gray-50] border border-[--p2-gray-100]">
                <p className="text-[9px] uppercase tracking-wider text-[--p2-gray-400] font-semibold flex items-center gap-1"><i.icon size={10} />{i.label}</p>
                <p className="text-xs font-semibold text-[--p2-navy] mt-1">{i.value}</p>
              </div>
            ))}
          </div>

          {/* Activity */}
          <div>
            <h3 className="text-[11px] font-semibold text-[--p2-navy] uppercase tracking-wider mb-3">Recent Activity</h3>
            <div className="space-y-0 divide-y divide-[--p2-gray-100] rounded-lg border border-[--p2-gray-100] overflow-hidden">
              {USER_ACTIVITY.map((a, i) => (
                <div key={i} className="px-3 py-2.5 bg-white hover:bg-[--p2-gray-50] transition-colors">
                  <p className="text-[11px] text-[--p2-gray-700]">{a.action}</p>
                  <p className="text-[9px] text-[--p2-gray-400] mt-0.5">{a.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h3 className="text-[11px] font-semibold text-[--p2-navy] uppercase tracking-wider mb-3">Permissions</h3>
            <div className="space-y-0 divide-y divide-[--p2-gray-100] rounded-lg border border-[--p2-gray-100] overflow-hidden">
              {PERMISSIONS.map(p => (
                <div key={p.key} className="flex items-center justify-between px-3 py-3 bg-white">
                  <div>
                    <p className="text-[11px] font-medium text-[--p2-navy]">{p.label}</p>
                    <p className="text-[9px] text-[--p2-gray-400]">{p.desc}</p>
                  </div>
                  <Switch checked={perms[p.key]} onCheckedChange={v => setPerms(prev => ({ ...prev, [p.key]: v }))} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[--p2-gray-200] flex items-center justify-between">
          <Button variant="outline" size="sm" className="text-xs h-9 text-[--p2-red] border-[--p2-red]/20 hover:bg-[--p2-red]/5 gap-1.5"
            onClick={() => { toast({ title: `${user.name} suspended` }); onClose(); }}>
            <Pause size={12} /> Suspend Account
          </Button>
          <Button size="sm" className="text-xs h-9 gap-1.5 bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => { toast({ title: 'Changes saved' }); onClose(); }}>
            <Check size={12} /> Save Changes
          </Button>
        </div>
      </motion.div>
    </>
  );
}

// ── Main Page ──
export default function P2AdminUsers() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [consulateFilter, setConsulateFilter] = useState('All');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);

  const filtered = useMemo(() => {
    return MOCK_USERS.filter(u => {
      if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
      if (roleFilter !== 'All' && u.role !== roleFilter) return false;
      if (statusFilter !== 'All' && u.status !== statusFilter) return false;
      if (consulateFilter !== 'All' && u.consulate !== consulateFilter) return false;
      return true;
    });
  }, [search, roleFilter, statusFilter, consulateFilter]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[--p2-navy]">User Management</h1>
          <p className="text-xs text-[--p2-gray-400]">{MOCK_USERS.length} total users across {CONSULATES.length} consulates</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--p2-gray-400]" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…"
              className="pl-9 h-9 w-52 text-xs" />
          </div>
          <Button size="sm" className="h-9 text-xs gap-1.5 bg-purple-600 hover:bg-purple-700 text-white" onClick={() => setInviteOpen(true)}>
            <Plus size={13} /> Invite User
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="flex flex-wrap items-center gap-2">
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="h-8 text-[11px] w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Roles</SelectItem>
            {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 text-[11px] w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={consulateFilter} onValueChange={setConsulateFilter}>
          <SelectTrigger className="h-8 text-[11px] w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Consulates</SelectItem>
            {CONSULATES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-[10px] text-[--p2-gray-400] ml-1">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="p2-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[--p2-gray-100] bg-[--p2-gray-50]">
                {['User', 'Email', 'Role', 'Consulate', 'Status', 'Last Active', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[--p2-gray-400]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const rb = ROLE_BADGE[u.role];
                const sb = STATUS_STYLE[u.status];
                return (
                  <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 + i * 0.015 }}
                    className="border-b border-[--p2-gray-100] hover:bg-[--p2-gray-50] transition-colors cursor-pointer"
                    onClick={() => setSelectedUser(u)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                          style={{ background: u.avatarColor }}>{u.initials}</div>
                        <span className="font-semibold text-[--p2-navy] whitespace-nowrap">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[--p2-gray-500] font-mono">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ color: rb.color, background: rb.bg }}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-[--p2-gray-600] whitespace-nowrap">{u.consulate}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: sb.color, background: sb.bg }}>{u.status}</span>
                    </td>
                    <td className="px-4 py-3 text-[--p2-gray-500] whitespace-nowrap">{u.lastActive}</td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded-md hover:bg-[--p2-gray-100] text-[--p2-gray-400]"><MoreHorizontal size={14} /></button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => setSelectedUser(u)} className="text-xs gap-2"><Edit size={12} /> Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-xs gap-2"><Pause size={12} /> Suspend</DropdownMenuItem>
                          <DropdownMenuItem className="text-xs gap-2"><KeyRound size={12} /> Reset Password</DropdownMenuItem>
                          <DropdownMenuItem className="text-xs gap-2"><Eye size={12} /> View Activity</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-xs gap-2 text-[--p2-red]"><Trash2 size={12} /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-[--p2-gray-400] text-xs">No users match your filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Invite Modal */}
      <AnimatePresence>{inviteOpen && <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />}</AnimatePresence>

      {/* User Detail */}
      <AnimatePresence>{selectedUser && <UserDetail user={selectedUser} onClose={() => setSelectedUser(null)} />}</AnimatePresence>
    </div>
  );
}
