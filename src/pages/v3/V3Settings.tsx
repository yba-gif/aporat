import { useState } from 'react';
import { osintTools } from '@/data/v3/mockData';

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
  { name: 'Officer Yılmaz', email: 'yilmaz@portolan.gov.tr', role: 'Analyst', lastActive: '2 min ago' },
  { name: 'Officer Demir', email: 'demir@portolan.gov.tr', role: 'Analyst', lastActive: '15 min ago' },
  { name: 'Officer Kaya', email: 'kaya@portolan.gov.tr', role: 'Analyst', lastActive: '1 hour ago' },
  { name: 'Supervisor Arslan', email: 'arslan@portolan.gov.tr', role: 'Supervisor', lastActive: '5 min ago' },
  { name: 'Officer Çelik', email: 'celik@portolan.gov.tr', role: 'Analyst', lastActive: '3 hours ago' },
  { name: 'Admin Öztürk', email: 'ozturk@portolan.gov.tr', role: 'Admin', lastActive: '30 min ago' },
];

export default function V3Settings() {
  const [tab, setTab] = useState<Tab>('Risk Scoring');
  const [weights, setWeights] = useState(riskCategories.map(c => c.default));
  const [toolStates, setToolStates] = useState(osintTools.map(t => ({ ...t, enabled: t.status !== 'offline' })));

  const totalWeight = weights.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold" style={{ color: 'var(--v3-text)' }}>Settings</h2>

      {/* Tab bar */}
      <div className="flex border-b" style={{ borderColor: 'var(--v3-border)' }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 text-xs font-semibold border-b-2 transition-colors"
            style={{
              color: tab === t ? 'var(--v3-accent)' : 'var(--v3-text-muted)',
              borderBottomColor: tab === t ? 'var(--v3-accent)' : 'transparent',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Risk Scoring */}
      {tab === 'Risk Scoring' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="border rounded-md p-6" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
            <div className="text-xs font-semibold mb-4" style={{ color: 'var(--v3-text)' }}>Category Weights</div>
            <div className="space-y-4">
              {riskCategories.map((cat, i) => (
                <div key={cat.key}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[11px]" style={{ color: 'var(--v3-text-secondary)' }}>{cat.label}</span>
                    <span className="text-[11px] font-mono font-bold" style={{ color: 'var(--v3-accent)' }}>{weights[i]}%</span>
                  </div>
                  <input
                    type="range" min={0} max={50} value={weights[i]}
                    onChange={e => {
                      const next = [...weights];
                      next[i] = parseInt(e.target.value);
                      setWeights(next);
                    }}
                    className="w-full h-1 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: 'var(--v3-accent)' }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--v3-border)' }}>
              <span className="text-xs" style={{ color: totalWeight === 100 ? 'var(--v3-green)' : 'var(--v3-red)' }}>
                Total: {totalWeight}% {totalWeight !== 100 && '(should be 100%)'}
              </span>
              <button
                onClick={() => setWeights(riskCategories.map(c => c.default))}
                className="text-xs px-3 py-1 rounded-md border transition-colors hover:bg-white/5"
                style={{ borderColor: 'var(--v3-border)', color: 'var(--v3-text-secondary)' }}
              >
                Reset to defaults
              </button>
            </div>
          </div>

          <div className="border rounded-md p-6" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
            <div className="text-xs font-semibold mb-4" style={{ color: 'var(--v3-text)' }}>Preview — Sample Case</div>
            <div className="space-y-2">
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
            <div
              key={tool.name}
              className="border rounded-md p-4 flex items-center justify-between transition-colors hover:border-[var(--v3-border-hover)]"
              style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
            >
              <div>
                <div className="text-xs font-semibold" style={{ color: 'var(--v3-text)' }}>{tool.name}</div>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--v3-text-muted)' }}>
                  Last check: {new Date(tool.lastCheck).toLocaleTimeString()}
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={tool.enabled}
                  onChange={() => {
                    const next = [...toolStates];
                    next[i] = { ...next[i], enabled: !next[i].enabled };
                    setToolStates(next);
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:rounded-full after:h-4 after:w-4 after:transition-all"
                  style={{
                    background: tool.enabled ? 'var(--v3-accent)' : 'var(--v3-border)',
                  }}
                >
                  <div className="absolute top-[2px] rounded-full h-4 w-4 bg-white transition-transform" style={{ transform: tool.enabled ? 'translateX(16px)' : 'translateX(2px)' }} />
                </div>
              </label>
            </div>
          ))}
        </div>
      )}

      {/* Team */}
      {tab === 'Team' && (
        <div className="border rounded-md overflow-hidden" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--v3-border)' }}>
            <span className="text-xs font-semibold" style={{ color: 'var(--v3-text)' }}>Team Members</span>
            <button className="px-3 py-1.5 rounded-md text-xs font-semibold" style={{ background: 'var(--v3-accent)', color: 'var(--v3-text-dark)' }}>Invite User</button>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--v3-border)' }}>
                {['Name', 'Email', 'Role', 'Last Active'].map(h => (
                  <th key={h} className="px-4 py-2 text-left font-semibold" style={{ color: 'var(--v3-text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teamMembers.map(m => (
                <tr key={m.email} style={{ borderBottom: '1px solid var(--v3-border)' }} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5" style={{ color: 'var(--v3-text)' }}>{m.name}</td>
                  <td className="px-4 py-2.5 font-mono" style={{ color: 'var(--v3-text-secondary)' }}>{m.email}</td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold" style={{
                      background: m.role === 'Admin' ? 'var(--v3-red-muted)' : m.role === 'Supervisor' ? 'var(--v3-amber-muted)' : 'var(--v3-accent-muted)',
                      color: m.role === 'Admin' ? 'var(--v3-red)' : m.role === 'Supervisor' ? 'var(--v3-amber)' : 'var(--v3-accent)',
                    }}>{m.role}</span>
                  </td>
                  <td className="px-4 py-2.5" style={{ color: 'var(--v3-text-muted)' }}>{m.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Profile */}
      {tab === 'Profile' && (
        <div className="border rounded-md p-6 max-w-md" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
          {[
            { label: 'Full Name', value: 'Officer Yılmaz', type: 'text' },
            { label: 'Email', value: 'yilmaz@portolan.gov.tr', type: 'email' },
            { label: 'Role', value: 'Analyst', type: 'text', disabled: true },
          ].map(field => (
            <div key={field.label} className="mb-4">
              <label className="block text-[11px] font-semibold mb-1.5 tracking-wide" style={{ color: 'var(--v3-text-muted)' }}>{field.label.toUpperCase()}</label>
              <input
                type={field.type}
                defaultValue={field.value}
                disabled={field.disabled}
                className="w-full px-3 py-2 rounded-md border text-xs outline-none disabled:opacity-50"
                style={{ background: 'var(--v3-bg)', borderColor: 'var(--v3-border)', color: 'var(--v3-text)' }}
              />
            </div>
          ))}
          <button className="px-4 py-2 rounded-md text-xs font-semibold" style={{ background: 'var(--v3-accent)', color: 'var(--v3-text-dark)' }}>Save Changes</button>
        </div>
      )}

      {/* System */}
      {tab === 'System' && (
        <div className="border rounded-md p-6 max-w-md" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
          <div className="text-xs font-semibold mb-4" style={{ color: 'var(--v3-text)' }}>System Information</div>
          {[
            ['Platform Version', 'v3.1.0-beta'],
            ['Database', 'Connected'],
            ['API Status', 'Operational'],
            ['Last Backup', '2026-01-28 04:00 UTC'],
            ['Storage Used', '2.4 GB / 50 GB'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between py-2 border-t" style={{ borderColor: 'var(--v3-border)' }}>
              <span className="text-xs" style={{ color: 'var(--v3-text-muted)' }}>{label}</span>
              <span className="text-xs font-mono" style={{ color: 'var(--v3-text)' }}>{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
