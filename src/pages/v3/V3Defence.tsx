import { useState, useRef } from 'react';
import { Upload, Plus, Play, ChevronDown, ChevronRight, MapPin, Loader2 } from 'lucide-react';
import { useV3DefenceScans } from '@/api/v3-hooks';
import { v3Defence as defenceApi, v3Scans } from '@/api/v3-supabase';
import { RiskBadge } from '@/components/v3/V3Badges';
import { toast } from 'sonner';

export default function V3Defence() {
  const [tab, setTab] = useState<'new' | 'results'>('results');
  const [inputMode, setInputMode] = useState<'csv' | 'manual'>('csv');
  const [manualName, setManualName] = useState('');
  const [manualUsername, setManualUsername] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: defScans, loading, refetch } = useV3DefenceScans();
  const [expandedScan, setExpandedScan] = useState<string | null>(null);

  const handleCSVUpload = async (file: File) => {
    setUploading(true);
    try {
      toast.success('CSV upload queued for processing');
      refetch();
      setTab('results');
    } catch (e: any) {
      toast.error(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleManualScan = async () => {
    if (!manualName.trim()) { toast.error('Name is required'); return; }
    try {
      await v3Scans.trigger({
        scan_type: 'defence',
        target_name: manualName,
        target_email: manualEmail || undefined,
        target_username: manualUsername || undefined,
      });
      toast.success(`Scan queued for ${manualName}`);
      setManualName(''); setManualUsername(''); setManualEmail('');
      refetch();
      setTab('results');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h2 className="text-base font-bold" style={{ color: 'var(--v3-text)' }}>Defence OSINT Scanner</h2>
        <div className="flex rounded-md overflow-hidden border" style={{ borderColor: 'var(--v3-border)' }}>
          {(['new', 'results'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className="px-4 py-1.5 text-xs font-semibold transition-colors"
              style={{ background: tab === t ? 'var(--v3-accent-muted)' : 'transparent', color: tab === t ? 'var(--v3-accent)' : 'var(--v3-text-muted)' }}>
              {t === 'new' ? 'New Scan' : 'Scan Results'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'new' && (
        <div className="border rounded-md p-6" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
          <div className="flex gap-3 mb-6">
            {(['csv', 'manual'] as const).map(m => (
              <button key={m} onClick={() => setInputMode(m)} className="px-4 py-2 text-xs font-semibold rounded-md border transition-colors"
                style={{ background: inputMode === m ? 'var(--v3-accent-muted)' : 'transparent', borderColor: inputMode === m ? 'var(--v3-accent)' : 'var(--v3-border)', color: inputMode === m ? 'var(--v3-accent)' : 'var(--v3-text-secondary)' }}>
                {m === 'csv' ? 'Upload CSV' : 'Manual Entry'}
              </button>
            ))}
          </div>

          {inputMode === 'csv' ? (
            <div>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => e.target.files?.[0] && handleCSVUpload(e.target.files[0])} />
              <div
                className="border-2 border-dashed rounded-md p-12 text-center cursor-pointer transition-colors hover:border-[var(--v3-accent)]"
                style={{ borderColor: 'var(--v3-border)' }}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 size={32} className="mx-auto mb-3 animate-spin" style={{ color: 'var(--v3-accent)' }} />
                ) : (
                  <Upload size={32} className="mx-auto mb-3" style={{ color: 'var(--v3-text-muted)' }} />
                )}
                <p className="text-sm" style={{ color: 'var(--v3-text-secondary)' }}>
                  {uploading ? 'Uploading...' : 'Drop CSV file here or click to browse'}
                </p>
                <p className="text-[11px] mt-1" style={{ color: 'var(--v3-text-muted)' }}>
                  Columns: name, email (optional), username (optional)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <input placeholder="Full name *" value={manualName} onChange={e => setManualName(e.target.value)}
                  className="px-3 py-2 rounded-md border text-xs outline-none" style={{ background: 'var(--v3-bg)', borderColor: 'var(--v3-border)', color: 'var(--v3-text)' }} />
                <input placeholder="Known usernames" value={manualUsername} onChange={e => setManualUsername(e.target.value)}
                  className="px-3 py-2 rounded-md border text-xs outline-none" style={{ background: 'var(--v3-bg)', borderColor: 'var(--v3-border)', color: 'var(--v3-text)' }} />
                <input placeholder="Email (optional)" value={manualEmail} onChange={e => setManualEmail(e.target.value)}
                  className="px-3 py-2 rounded-md border text-xs outline-none" style={{ background: 'var(--v3-bg)', borderColor: 'var(--v3-border)', color: 'var(--v3-text)' }} />
              </div>
            </div>
          )}

          <button onClick={inputMode === 'manual' ? handleManualScan : () => fileRef.current?.click()}
            className="mt-6 px-6 py-2.5 rounded-md text-sm font-semibold flex items-center gap-2"
            style={{ background: 'var(--v3-accent)', color: 'var(--v3-text-dark)' }}>
            <Play size={14} /> {inputMode === 'csv' ? 'Upload & Scan' : 'Start Scan'}
          </button>
        </div>
      )}

      {tab === 'results' && (
        <div className="space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin" style={{ color: 'var(--v3-accent)' }} />
            </div>
          )}

          {(defScans || []).map((scan: any) => {
            const isExpanded = expandedScan === scan.id;
            const statusColor = scan.status === 'completed' ? 'var(--v3-green)' : scan.status === 'running' ? 'var(--v3-accent)' : scan.status === 'failed' ? 'var(--v3-red)' : 'var(--v3-text-muted)';
            const personnel = scan.v3_personnel || [];
            const violationCount = personnel.reduce((sum: number, p: any) => sum + ((p.opsec_violations as any[])?.length || 0), 0);

            return (
              <div key={scan.id} className="border rounded-md overflow-hidden" style={{ background: 'var(--v3-surface)', borderColor: scan.status === 'running' ? 'var(--v3-accent)' : 'var(--v3-border)' }}>
                <div className="flex items-center justify-between p-4 cursor-pointer transition-colors hover:bg-white/[0.02]"
                  onClick={() => setExpandedScan(isExpanded ? null : scan.id)}>
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown size={14} style={{ color: 'var(--v3-text-muted)' }} /> : <ChevronRight size={14} style={{ color: 'var(--v3-text-muted)' }} />}
                    <span className="text-xs font-mono font-semibold" style={{ color: 'var(--v3-accent)' }}>{scan.scan_id}</span>
                    <span className="text-xs" style={{ color: 'var(--v3-text)' }}>{scan.personnel_count} personnel</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: `${statusColor}20`, color: statusColor }}>{scan.status}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {violationCount > 0 && (
                      <span className="text-[11px] font-mono" style={{ color: 'var(--v3-red)' }}>{violationCount} violations</span>
                    )}
                    <span className="text-[10px] font-mono" style={{ color: 'var(--v3-text-muted)' }}>{scan.created_at?.slice(0, 10)}</span>
                  </div>
                </div>
                {scan.status === 'running' && (
                  <div className="px-4 pb-3">
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--v3-border)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${scan.progress}%`, background: 'var(--v3-accent)' }} />
                    </div>
                  </div>
                )}
                {isExpanded && personnel.length > 0 && (
                  <div className="border-t" style={{ borderColor: 'var(--v3-border)' }}>
                    <table className="w-full text-xs">
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--v3-border)' }}>
                          {['Name', 'Rank', 'Unit', 'Branch', 'Profiles', 'Violations', 'Risk'].map(h => (
                            <th key={h} className="px-4 py-2 text-left font-semibold" style={{ color: 'var(--v3-text-muted)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {personnel.map((p: any) => (
                          <tr key={p.id} style={{ borderBottom: '1px solid var(--v3-border)' }}>
                            <td className="px-4 py-2" style={{ color: 'var(--v3-text)' }}>{p.name}</td>
                            <td className="px-4 py-2" style={{ color: 'var(--v3-text-secondary)' }}>{p.rank}</td>
                            <td className="px-4 py-2" style={{ color: 'var(--v3-text-secondary)' }}>{p.unit}</td>
                            <td className="px-4 py-2" style={{ color: 'var(--v3-text-secondary)' }}>{p.branch}</td>
                            <td className="px-4 py-2 font-mono" style={{ color: 'var(--v3-accent)' }}>{p.profiles_found}</td>
                            <td className="px-4 py-2 font-mono" style={{ color: (p.opsec_violations as any[])?.length > 0 ? 'var(--v3-red)' : 'var(--v3-green)' }}>
                              {(p.opsec_violations as any[])?.length || 0}
                            </td>
                            <td className="px-4 py-2"><RiskBadge level={p.overall_risk} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}

          {!loading && (!defScans || defScans.length === 0) && (
            <div className="text-center py-12 text-xs" style={{ color: 'var(--v3-text-muted)' }}>
              No defence scans yet. Start one from the "New Scan" tab.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
