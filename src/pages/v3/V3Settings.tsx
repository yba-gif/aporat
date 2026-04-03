import { useState } from 'react';
import { osintTools } from '@/data/v3/mockData';
import { toast } from 'sonner';

const TABS = ['Profile', 'Team', 'Risk Scoring', 'OSINT Tools', 'System'] as const;
type Tab = typeof TABS[number];

const riskCategories = [
  { key: 'document', label: 'Document Verification', default: 20 },
  { key: 'identity', label: 'Identity Verification', default: 20 },
  { key: 'travel', label: 'Travel Pattern Analysis', default: 15 },
  { key: 'financial', label: 'Financial Assessment', default: 20 },
  { key: 'network', label: 'Network Analysis', default: 15 },
  { key: 'digital', label: 'Digital Footprint', default: 10 },
];

const teamMembers = [
  { name: 'Officer Yılmaz', email: 'yilmaz@alpagut.gov.tr', role: 'Analyst', lastActive: '2 min ago' },
  { name: 'Officer Demir', email: 'demir@alpagut.gov.tr', role: 'Analyst', lastActive: '15 min ago' },
  { name: 'Officer Kaya', email: 'kaya@alpagut.gov.tr', role: 'Analyst', lastActive: '1 hour ago' },
  { name: 'Supervisor Arslan', email: 'arslan@alpagut.gov.tr', role: 'Supervisor', lastActive: '5 min ago' },
  { name: 'Officer Çelik', email: 'celik@alpagut.gov.tr', role: 'Analyst', lastActive: '3 hours ago' },
  { name: 'Admin Öztürk', email: 'ozturk@alpagut.gov.tr', role: 'Admin', lastActive: '30 min ago' },
];

const roleColor = (role: string) => {
  if (role === 'Admin') return { bg: 'var(--v3-red-muted)', fg: 'var(--v3-red)' };
  if (role === 'Supervisor') return { bg: 'var(--v3-amber-muted)', fg: 'var(--v3-amber)' };
  return { bg: 'var(--v3-accent-muted)', fg: 'var(--v3-accent)' };
};

export default function V3Settings() {
  const [tab, setTab] = useState<Tab>('Risk Scoring');
  const [weights, setWeights] = useState(riskCategories.map(c => c.default));
  const [toolStates, setToolStates] = useState(osintTools.map(t => ({ ...t, enabled: t.status !== 'offline' })));

  const totalWeight = weights.reduce((a, b) => a + b, 0);

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition-colors focus:border-[var(--v3-accent)] disabled:opacity-50";
  const inputStyle = { background: 'var(--v3-bg)', borderColor: 'var(--v3-border)', color: 'var(--v3-text)' };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold tracking-tight" style={{ color: 'var(--v3-text)' }}>Settings</h2>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl border" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              background: tab === t ? 'var(--v3-accent-muted)' : 'transparent',
              color: tab === t ? 'var(--v3-accent)' : 'var(--v3-text-muted)',
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* Risk Scoring */}
      {tab === 'Risk Scoring' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-xl border p-6" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
            <div className="text-xs font-semibold mb-5" style={{ color: 'var(--v3-text)' }}>Category Weights</div>
            <div className="space-y-5">
              {riskCategories.map((cat, i) => (
                <div key={cat.key}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[11px]" style={{ color: 'var(--v3-text-secondary)' }}>{cat.label}</span>
                    <span className="text-[11px] font-mono font-bold" style={{ color: 'var(--v3-accent)' }}>{weights[i]}%</span>
                  </div>
                  <input type="range" min={0} max={50} value={weights[i]}
                    onChange={e => { const next = [...weights]; next[i] = parseInt(e.target.value); setWeights(next); }}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: 'var(--v3-accent)' }} />
                </div>
              ))}
            </div>
            <div className="mt-5 pt-5 border-t flex items-center justify-between" style={{ borderColor: 'var(--v3-border)' }}>
              <span className="text-xs font-medium" style={{ color: totalWeight === 100 ? 'var(--v3-green)' : 'var(--v3-red)' }}>
                Total: {totalWeight}% {totalWeight !== 100 && '(should be 100%)'}
              </span>
              <button onClick={() => setWeights(riskCategories.map(c => c.default))}
                className="text-xs px-3.5 py-1.5 rounded-lg border transition-colors hover:bg-white/5"
                style={{ borderColor: 'var(--v3-border)', color: 'var(--v3-text-secondary)' }}>
                Reset
              </button>
            </div>
          </div>

          <div className="rounded-xl border p-6" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
            <div className="text-xs font-semibold mb-5" style={{ color: 'var(--v3-text)' }}>Preview — Sample Case</div>
            <div className="space-y-3">
              {riskCategories.map((cat, i) => {
                const sampleScore = Math.floor(Math.random() * 80 + 10);
                const weighted = Math.round((sampleScore * weights[i]) / 100);
                const barColor = sampleScore < 30 ? 'var(--v3-green)' : sampleScore < 60 ? 'var(--v3-amber)' : 'var(--v3-red)';
                return (
                  <div key={cat.key} className="flex items-center gap-3">
                    <span className="text-[11px] w-28 truncate" style={{ color: 'var(--v3-text-muted)' }}>{cat.label}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--v3-border)' }}>
                      <div className="h-full rounded-full" style={{ width: `${sampleScore}%`, background: barColor }} />
                    </div>
                    <span className="text-[10px] font-mono w-10 text-right" style={{ color: 'var(--v3-text-secondary)' }}>{weighted}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* OSINT Tools */}
      {tab === 'OSINT Tools' && (
        <div className="grid grid-cols-2 gap-3">
          {toolStates.map((tool, i) => (
            <div key={tool.name}
              className="rounded-xl border p-5 flex items-center justify-between transition-colors hover:border-[var(--v3-border-hover)]"
              style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
              <div>
                <div className="text-xs font-semibold" style={{ color: 'var(--v3-text)' }}>{tool.name}</div>
                <div className="text-[10px] mt-1" style={{ color: 'var(--v3-text-muted)' }}>
                  Last check: {new Date(tool.lastCheck).toLocaleTimeString()}
                </div>
              </div>
              <button onClick={() => {
                const next = [...toolStates];
                next[i] = { ...next[i], enabled: !next[i].enabled };
                setToolStates(next);
              }}
                className="w-10 h-5.5 rounded-full relative transition-colors"
                style={{ background: tool.enabled ? 'var(--v3-accent)' : 'var(--v3-border)' }}>
                <div className="absolute top-[2px] rounded-full h-4 w-4 bg-white transition-transform"
                  style={{ transform: tool.enabled ? 'translateX(22px)' : 'translateX(2px)' }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Team */}
      {tab === 'Team' && (
        <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--v3-border)' }}>
            <span className="text-xs font-semibold" style={{ color: 'var(--v3-text)' }}>Team Members</span>
            <button className="px-4 py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-90"
              style={{ background: 'var(--v3-accent)', color: 'var(--v3-text-dark)' }}>Invite User</button>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--v3-border)' }}>
            {teamMembers.map(m => {
              const { bg, fg } = roleColor(m.role);
              const initials = m.name.split(' ').map(w => w[0]).join('').slice(0, 2);
              return (
                <div key={m.email} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-white/[0.02]"
                  style={{ borderColor: 'var(--v3-border)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold"
                    style={{ background: bg, color: fg }}>{initials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium" style={{ color: 'var(--v3-text)' }}>{m.name}</div>
                    <div className="text-[11px] font-mono" style={{ color: 'var(--v3-text-muted)' }}>{m.email}</div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: bg, color: fg }}>
                    {m.role}
                  </span>
                  <span className="text-[11px]" style={{ color: 'var(--v3-text-muted)' }}>{m.lastActive}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Profile */}
      {tab === 'Profile' && (
        <div className="rounded-xl border p-8 max-w-md" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ background: 'var(--v3-accent-muted)', color: 'var(--v3-accent)' }}>OY</div>
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--v3-text)' }}>Officer Yılmaz</div>
              <div className="text-[11px]" style={{ color: 'var(--v3-text-muted)' }}>Analyst</div>
            </div>
          </div>
          {[
            { label: 'Full Name', value: 'Officer Yılmaz', type: 'text' },
            { label: 'Email', value: 'yilmaz@portolan.gov.tr', type: 'email' },
            { label: 'Role', value: 'Analyst', type: 'text', disabled: true },
          ].map(field => (
            <div key={field.label} className="mb-5">
              <label className="block text-[11px] font-medium mb-2" style={{ color: 'var(--v3-text-secondary)' }}>{field.label}</label>
              <input type={field.type} defaultValue={field.value} disabled={field.disabled}
                className={inputClass} style={inputStyle} />
            </div>
          ))}
          <button onClick={() => toast.success('Profile saved')}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-90"
            style={{ background: 'var(--v3-accent)', color: 'var(--v3-text-dark)' }}>Save Changes</button>
        </div>
      )}

      {/* System */}
      {tab === 'System' && (
        <div className="rounded-xl border p-8 max-w-md" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
          <div className="text-xs font-semibold mb-5" style={{ color: 'var(--v3-text)' }}>System Information</div>
          <div className="space-y-0">
            {[
              ['Platform Version', 'v3.1.0-beta'],
              ['Database', 'Connected'],
              ['API Status', 'Operational'],
              ['Last Backup', '2026-01-28 04:00 UTC'],
              ['Storage Used', '2.4 GB / 50 GB'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-3 border-t first:border-t-0" style={{ borderColor: 'var(--v3-border)' }}>
                <span className="text-xs" style={{ color: 'var(--v3-text-muted)' }}>{label}</span>
                <span className="text-xs font-mono font-medium" style={{ color: value === 'Connected' || value === 'Operational' ? 'var(--v3-green)' : 'var(--v3-text)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
