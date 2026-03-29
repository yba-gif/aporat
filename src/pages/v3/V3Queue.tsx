import { useState, useEffect } from 'react';
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
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold tracking-tight" style={{ color: 'var(--v3-text)' }}>Scan Queue & System Status</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--v3-text-muted)' }}>Monitor active scans and OSINT tool health</p>
      </div>

      {/* Queue Cards */}
      <div>
        <div className="text-[10px] font-semibold tracking-[0.15em] mb-4" style={{ color: 'var(--v3-text-muted)' }}>ACTIVE & QUEUED SCANS</div>
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="rounded-xl border p-5 transition-colors hover:border-[var(--v3-border-hover)]"
              style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
              <div className="flex items-center gap-4 mb-3">
                <span className="text-xs font-mono font-bold" style={{ color: 'var(--v3-accent)' }}>{item.id}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold" style={{
                  background: item.type === 'visa' ? 'var(--v3-accent-muted)' : 'var(--v3-amber-muted)',
                  color: item.type === 'visa' ? 'var(--v3-accent)' : 'var(--v3-amber)',
                }}>{item.type.toUpperCase()}</span>
                <span className="text-xs font-mono" style={{ color: 'var(--v3-text)' }}>{item.target}</span>
                <div className="flex-1" />
                <span className="text-[11px] font-mono" style={{ color: 'var(--v3-text-muted)' }}>Started {item.started}</span>
                <span className="text-[11px] font-mono" style={{ color: 'var(--v3-text-muted)' }}>ETA {item.eta}</span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="flex gap-1.5 flex-wrap flex-1">
                  {item.tools.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-mono border"
                      style={{ borderColor: 'var(--v3-border)', color: 'var(--v3-text-secondary)' }}>{t}</span>
                  ))}
                </div>
                <span className="text-sm font-mono font-bold min-w-[40px] text-right" style={{ color: item.progress > 0 ? 'var(--v3-accent)' : 'var(--v3-text-muted)' }}>
                  {item.progress}%
                </span>
              </div>

              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--v3-border)' }}>
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${item.progress}%`, background: item.progress > 0 ? 'var(--v3-accent)' : 'var(--v3-text-muted)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tool Status Grid */}
      <div>
        <div className="text-[10px] font-semibold tracking-[0.15em] mb-4" style={{ color: 'var(--v3-text-muted)' }}>OSINT TOOL STATUS</div>
        <div className="grid grid-cols-4 gap-3">
          {osintTools.map(tool => (
            <div key={tool.name}
              className="rounded-xl border p-4 transition-colors hover:border-[var(--v3-border-hover)]"
              style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: statusColors[tool.status] }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold" style={{ color: 'var(--v3-text)' }}>{tool.name}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: statusColors[tool.status] }}>{statusLabels[tool.status]}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
