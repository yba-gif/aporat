import { useState, useEffect } from 'react';
import { Play, Loader2, CheckCircle, Zap } from 'lucide-react';
import { v3Scans } from '@/api/v3-supabase';
import type { Scan } from '@/api/client';
import { toast } from 'sonner';

const platforms = ['Instagram', 'Facebook', 'X (Twitter)', 'TikTok', 'LinkedIn', 'Strava', 'Public Records', 'Financial DBs'];

export default function V3Scanner() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [scanning, setScanning] = useState(false);
  const [activeScan, setActiveScan] = useState<Scan | null>(null);
  const [enabledPlatforms, setEnabledPlatforms] = useState(new Set(platforms));

  const togglePlatform = (p: string) => {
    setEnabledPlatforms(prev => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });
  };

  useEffect(() => {
    if (!activeScan || activeScan.status === 'completed' || activeScan.status === 'failed') return;
    const interval = setInterval(async () => {
      try {
        const updated = await v3Scans.get(activeScan.id);
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
      } catch { /* ignore */ }
    }, 2000);
    return () => clearInterval(interval);
  }, [activeScan]);

  const startScan = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setScanning(true);
    try {
      const scan = await v3Scans.trigger({
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

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition-colors focus:border-[var(--v3-accent)]";
  const inputStyle = { background: 'var(--v3-bg)', borderColor: 'var(--v3-border)', color: 'var(--v3-text)' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold tracking-tight" style={{ color: 'var(--v3-text)' }}>OSINT Scanner</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--v3-text-muted)' }}>Run individual OSINT scans on visa applicants or targets</p>
      </div>

      {/* Scanner Card */}
      <div className="rounded-xl border p-8 max-w-2xl" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
        <div className="text-[10px] font-semibold tracking-[0.15em] mb-6" style={{ color: 'var(--v3-text-muted)' }}>SCAN TARGET</div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-[11px] font-medium mb-2" style={{ color: 'var(--v3-text-secondary)' }}>Full Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ahmad Rezaei"
              className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className="block text-[11px] font-medium mb-2" style={{ color: 'var(--v3-text-secondary)' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Optional"
              className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className="block text-[11px] font-medium mb-2" style={{ color: 'var(--v3-text-secondary)' }}>Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Optional"
              className={inputClass} style={inputStyle} />
          </div>
        </div>

        {/* Platforms */}
        <div className="border-t pt-5 mb-6" style={{ borderColor: 'var(--v3-border)' }}>
          <div className="text-[10px] font-semibold tracking-[0.15em] mb-4" style={{ color: 'var(--v3-text-muted)' }}>PLATFORMS</div>
          <div className="flex flex-wrap gap-2">
            {platforms.map(p => {
              const active = enabledPlatforms.has(p);
              return (
                <button key={p} onClick={() => togglePlatform(p)}
                  className="px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all"
                  style={{
                    background: active ? 'var(--v3-accent-muted)' : 'transparent',
                    borderColor: active ? 'var(--v3-accent)' : 'var(--v3-border)',
                    color: active ? 'var(--v3-accent)' : 'var(--v3-text-muted)',
                  }}>
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action */}
        {!scanning ? (
          <button onClick={startScan}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-opacity hover:opacity-90"
            style={{ background: 'var(--v3-accent)', color: 'var(--v3-text-dark)' }}>
            <Play size={14} /> Start Scan
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Loader2 size={14} className="animate-spin" style={{ color: 'var(--v3-accent)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--v3-accent)' }}>
                Scanning with {activeScan?.tools_used?.length || 0} tools...
              </span>
              <span className="text-xs font-mono ml-auto" style={{ color: 'var(--v3-text-muted)' }}>{Math.min(100, progress)}%</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--v3-border)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, progress)}%`, background: 'var(--v3-accent)' }} />
            </div>
          </div>
        )}
      </div>

      {/* Result */}
      {isComplete && (
        <div className="rounded-xl border p-5 max-w-2xl" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-green)' }}>
          <div className="flex items-center gap-2.5 mb-2">
            <CheckCircle size={16} style={{ color: 'var(--v3-green)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--v3-green)' }}>Scan Complete</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--v3-text-secondary)' }}>
            OSINT scan for "{name}" completed. {activeScan?.findings_count || 0} findings detected across {activeScan?.tools_used?.length || 0} tools.
          </p>
        </div>
      )}
    </div>
  );
}
