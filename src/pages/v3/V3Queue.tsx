import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { osintTools } from '@/data/v3/mockData';

interface QueueItem {
  id: string;
  type: 'visa' | 'defence';
  target: string;
  tools: string[];
  progress: number;
  started: string;
  eta: string;
}

const queueItems: QueueItem[] = [
  { id: 'Q-001', type: 'visa', target: 'PL-2026-00150', tools: ['Sherlock', 'Maigret', 'Holehe'], progress: 45, started: '15:20', eta: '~2 min' },
  { id: 'Q-002', type: 'defence', target: 'SCAN-2026-0032', tools: ['Sherlock', 'Maigret', 'GHunt', 'PhoneInfoga'], progress: 62, started: '14:00', eta: '~8 min' },
  { id: 'Q-003', type: 'visa', target: 'PL-2026-00151', tools: ['Sherlock'], progress: 0, started: 'Queued', eta: '~5 min' },
];

const statusColors: Record<string, string> = { online: 'var(--v3-green)', rate_limited: 'var(--v3-amber)', offline: 'var(--v3-red)' };
const statusLabels: Record<string, string> = { online: 'Online', rate_limited: 'Rate Limited', offline: 'Offline' };

export default function V3Queue() {
  const [items, setItems] = useState(queueItems);

  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev => prev.map(item => ({
        ...item,
        progress: item.progress > 0 ? Math.min(100, item.progress + Math.floor(Math.random() * 3)) : item.progress,
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-base font-bold" style={{ color: 'var(--v3-text)' }}>Scan Queue & System Status</h2>

      {/* Queue table */}
      <div className="border rounded-md overflow-hidden" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--v3-border)' }}>
          <span className="text-xs font-semibold" style={{ color: 'var(--v3-text)' }}>Active & Queued Scans</span>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--v3-border)' }}>
              {['Scan ID', 'Type', 'Target', 'Tools Running', 'Progress', 'Started', 'ETA'].map(h => (
                <th key={h} className="px-4 py-2 text-left font-semibold" style={{ color: 'var(--v3-text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--v3-border)' }} className="transition-colors hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-mono" style={{ color: 'var(--v3-accent)' }}>{item.id}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold" style={{
                    background: item.type === 'visa' ? 'var(--v3-accent-muted)' : 'var(--v3-amber-muted)',
                    color: item.type === 'visa' ? 'var(--v3-accent)' : 'var(--v3-amber)',
                  }}>{item.type.toUpperCase()}</span>
                </td>
                <td className="px-4 py-3 font-mono" style={{ color: 'var(--v3-text)' }}>{item.target}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {item.tools.map(t => (
                      <span key={t} className="px-1.5 py-0.5 rounded text-[9px] font-mono border" style={{ borderColor: 'var(--v3-border)', color: 'var(--v3-text-muted)' }}>{t}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--v3-border)' }}>
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${item.progress}%`, background: item.progress > 0 ? 'var(--v3-accent)' : 'var(--v3-text-muted)' }} />
                    </div>
                    <span className="font-mono" style={{ color: 'var(--v3-text-secondary)' }}>{item.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono" style={{ color: 'var(--v3-text-muted)' }}>{item.started}</td>
                <td className="px-4 py-3 font-mono" style={{ color: 'var(--v3-text-muted)' }}>{item.eta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tool Status Grid */}
      <div>
        <h3 className="text-xs font-semibold mb-3" style={{ color: 'var(--v3-text)' }}>OSINT Tool Status</h3>
        <div className="grid grid-cols-4 gap-3">
          {osintTools.map(tool => (
            <div
              key={tool.name}
              className="border rounded-md p-3 flex items-center gap-3 transition-colors hover:border-[var(--v3-border-hover)]"
              style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: statusColors[tool.status] }} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold" style={{ color: 'var(--v3-text)' }}>{tool.name}</div>
                <div className="text-[10px]" style={{ color: statusColors[tool.status] }}>{statusLabels[tool.status]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
