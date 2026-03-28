import { useState, useEffect } from 'react';
import { Search, Play, Loader2, CheckCircle } from 'lucide-react';
import { v3Scans } from '@/api/v3-supabase';
import type { Scan } from '@/api/client';
import { toast } from 'sonner';

export default function V3Scanner() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [scanning, setScanning] = useState(false);
  const [activeScan, setActiveScan] = useState<Scan | null>(null);

  const platforms = ['Instagram', 'Facebook', 'X (Twitter)', 'TikTok', 'LinkedIn', 'Strava', 'Public Records', 'Financial DBs'];
  const [enabledPlatforms, setEnabledPlatforms] = useState(new Set(platforms));

  const togglePlatform = (p: string) => {
    setEnabledPlatforms(prev => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });
  };

  // Poll scan status
  useEffect(() => {
    if (!activeScan || activeScan.status === 'completed' || activeScan.status === 'failed') return;
    const interval = setInterval(async () => {
      try {
        const updated = await scansApi.get(activeScan.id);
        setActiveScan(updated);
        if (updated.status === 'completed') {
          setScanning(false);
          toast.success(`OSINT scan completed — ${updated.findings_count} findings`);
          clearInterval(interval);
        } else if (updated.status === 'failed') {
          setScanning(false);
          toast.error(`Scan failed: ${updated.error || 'Unknown error'}`);
          clearInterval(interval);
        }
      } catch { /* ignore poll errors */ }
    }, 2000);
    return () => clearInterval(interval);
  }, [activeScan]);

  const startScan = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setScanning(true);
    try {
      const scan = await scansApi.trigger({
        target_name: name,
        target_email: email || undefined,
        target_username: username || undefined,
        scan_type: 'visa',
      });
      setActiveScan(scan);
      toast.success('Scan queued — OSINT tools running...');
    } catch (e: any) {
      toast.error(e.message || 'Failed to start scan');
      setScanning(false);
    }
  };

  const progress = activeScan?.progress || 0;
  const isComplete = activeScan?.status === 'completed';

  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold" style={{ color: 'var(--v3-text)' }}>OSINT Scanner</h2>
      <p className="text-xs" style={{ color: 'var(--v3-text-muted)' }}>Run individual OSINT scans on visa applicants</p>

      <div className="border rounded-md p-6 max-w-2xl" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
        <div className="text-[10px] font-semibold tracking-widest mb-4" style={{ color: 'var(--v3-text-muted)' }}>SCAN TARGET</div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-[11px] font-semibold mb-1.5 tracking-wide" style={{ color: 'var(--v3-text-secondary)' }}>FULL NAME *</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Ahmad Rezaei"
              className="w-full px-3 py-2 rounded-md border text-xs outline-none"
              style={{ background: 'var(--v3-bg)', borderColor: 'var(--v3-border)', color: 'var(--v3-text)' }}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold mb-1.5 tracking-wide" style={{ color: 'var(--v3-text-secondary)' }}>EMAIL</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Optional"
              className="w-full px-3 py-2 rounded-md border text-xs outline-none"
              style={{ background: 'var(--v3-bg)', borderColor: 'var(--v3-border)', color: 'var(--v3-text)' }}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold mb-1.5 tracking-wide" style={{ color: 'var(--v3-text-secondary)' }}>USERNAME</label>
            <input
              type="text" value={username} onChange={e => setUsername(e.target.value)}
              placeholder="Optional"
              className="w-full px-3 py-2 rounded-md border text-xs outline-none"
              style={{ background: 'var(--v3-bg)', borderColor: 'var(--v3-border)', color: 'var(--v3-text)' }}
            />
          </div>
        </div>

        <div className="border-t pt-4 mb-4" style={{ borderColor: 'var(--v3-border)' }}>
          <div className="text-[10px] font-semibold tracking-widest mb-3" style={{ color: 'var(--v3-text-muted)' }}>PLATFORMS</div>
          <div className="flex flex-wrap gap-2">
            {platforms.map(p => (
              <label key={p} className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: 'var(--v3-text-secondary)' }}>
                <input type="checkbox" checked={enabledPlatforms.has(p)} onChange={() => togglePlatform(p)} className="accent-[var(--v3-accent)]" />
                {p}
              </label>
            ))}
          </div>
        </div>

        {!scanning ? (
          <button onClick={startScan} className="px-6 py-2.5 rounded-md text-sm font-semibold flex items-center gap-2"
            style={{ background: 'var(--v3-accent)', color: 'var(--v3-text-dark)' }}>
            <Play size={14} /> Start Scan
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" style={{ color: 'var(--v3-accent)' }} />
              <span className="text-xs" style={{ color: 'var(--v3-accent)' }}>Scanning with {activeScan?.tools_used?.length || 0} tools...</span>
              <span className="text-xs font-mono" style={{ color: 'var(--v3-text-muted)' }}>{Math.min(100, progress)}%</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--v3-border)' }}>
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, progress)}%`, background: 'var(--v3-accent)' }} />
            </div>
          </div>
        )}
      </div>

      {isComplete && (
        <div className="border rounded-md p-4 max-w-2xl" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-green)' }}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={14} style={{ color: 'var(--v3-green)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--v3-green)' }}>Scan Complete</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--v3-text-secondary)' }}>
            OSINT scan for "{name}" completed. {activeScan?.findings_count || 0} findings detected across {activeScan?.tools_used?.length || 0} tools.
          </p>
        </div>
      )}
    </div>
  );
}
