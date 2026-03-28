import { useState } from 'react';
import { Upload, Plus, Trash2, Play, Download, ChevronDown, ChevronRight, MapPin, Video, Radio, Users, Eye, Clock } from 'lucide-react';
import { defenceScans, type DefenceScan, type PersonnelResult, type OpsecViolation } from '@/data/v3/mockData';
import { RiskBadge } from '@/components/v3/V3Badges';

const violationIcons: Record<string, typeof MapPin> = {
  location_leak: MapPin,
  operational_disclosure: Radio,
  personnel_identification: Users,
  relationship_mapping: Users,
  live_streaming: Video,
  pattern_of_life: Eye,
};

const violationLabels: Record<string, string> = {
  location_leak: 'Location Leak',
  operational_disclosure: 'Operational Disclosure',
  personnel_identification: 'Personnel ID',
  relationship_mapping: 'Relationship Mapping',
  live_streaming: 'Live Streaming',
  pattern_of_life: 'Pattern of Life',
};

export default function V3Defence() {
  const [tab, setTab] = useState<'new' | 'results'>('results');
  const [inputMode, setInputMode] = useState<'csv' | 'manual'>('csv');
  const [expandedPersonnel, setExpandedPersonnel] = useState<Set<string>>(new Set());
  const [expandedScan, setExpandedScan] = useState<string | null>(defenceScans[0]?.scanId || null);

  const togglePersonnel = (id: string) => {
    setExpandedPersonnel(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h2 className="text-base font-bold" style={{ color: 'var(--v3-text)' }}>Defence OSINT Scanner</h2>
        <div className="flex rounded-md overflow-hidden border" style={{ borderColor: 'var(--v3-border)' }}>
          {(['new', 'results'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-1.5 text-xs font-semibold transition-colors"
              style={{
                background: tab === t ? 'var(--v3-accent-muted)' : 'transparent',
                color: tab === t ? 'var(--v3-accent)' : 'var(--v3-text-muted)',
              }}
            >
              {t === 'new' ? 'New Scan' : 'Scan Results'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'new' && (
        <div className="border rounded-md p-6" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
          <div className="flex gap-3 mb-6">
            {(['csv', 'manual'] as const).map(m => (
              <button
                key={m}
                onClick={() => setInputMode(m)}
                className="px-4 py-2 text-xs font-semibold rounded-md border transition-colors"
                style={{
                  background: inputMode === m ? 'var(--v3-accent-muted)' : 'transparent',
                  borderColor: inputMode === m ? 'var(--v3-accent)' : 'var(--v3-border)',
                  color: inputMode === m ? 'var(--v3-accent)' : 'var(--v3-text-secondary)',
                }}
              >
                {m === 'csv' ? 'Upload CSV' : 'Manual Entry'}
              </button>
            ))}
          </div>

          {inputMode === 'csv' ? (
            <div
              className="border-2 border-dashed rounded-md p-12 text-center cursor-pointer transition-colors hover:border-[var(--v3-accent)]"
              style={{ borderColor: 'var(--v3-border)' }}
            >
              <Upload size={32} className="mx-auto mb-3" style={{ color: 'var(--v3-text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--v3-text-secondary)' }}>Drop CSV file here or click to browse</p>
              <p className="text-[11px] mt-1" style={{ color: 'var(--v3-text-muted)' }}>
                <a href="#" className="underline" style={{ color: 'var(--v3-accent)' }}>Download template</a> · Max 500 personnel per batch
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <input placeholder="Full name *" className="px-3 py-2 rounded-md border text-xs outline-none" style={{ background: 'var(--v3-bg)', borderColor: 'var(--v3-border)', color: 'var(--v3-text)' }} />
                <input placeholder="Known usernames" className="px-3 py-2 rounded-md border text-xs outline-none" style={{ background: 'var(--v3-bg)', borderColor: 'var(--v3-border)', color: 'var(--v3-text)' }} />
                <input placeholder="Unit (optional)" className="px-3 py-2 rounded-md border text-xs outline-none" style={{ background: 'var(--v3-bg)', borderColor: 'var(--v3-border)', color: 'var(--v3-text)' }} />
              </div>
              <button className="flex items-center gap-1 text-xs" style={{ color: 'var(--v3-accent)' }}>
                <Plus size={12} /> Add another
              </button>
            </div>
          )}

          <div className="mt-6 border-t pt-4" style={{ borderColor: 'var(--v3-border)' }}>
            <div className="text-[10px] font-semibold tracking-widest mb-3" style={{ color: 'var(--v3-text-muted)' }}>PLATFORMS TO SCAN</div>
            <div className="flex flex-wrap gap-2">
              {['TikTok', 'Instagram', 'Facebook', 'X (Twitter)', 'Strava', 'Public Records'].map(p => (
                <label key={p} className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: 'var(--v3-text-secondary)' }}>
                  <input type="checkbox" defaultChecked className="accent-[var(--v3-accent)]" />
                  {p}
                </label>
              ))}
            </div>
          </div>

          <button className="mt-6 px-6 py-2.5 rounded-md text-sm font-semibold flex items-center gap-2" style={{ background: 'var(--v3-accent)', color: 'var(--v3-text-dark)' }}>
            <Play size={14} /> Start Scan
          </button>
        </div>
      )}

      {tab === 'results' && (
        <div className="space-y-3">
          {/* Active scan */}
          {defenceScans.filter(s => s.status === 'running').map(scan => (
            <div key={scan.scanId} className="border rounded-md p-4" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-accent)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--v3-accent)' }} />
                  <span className="text-xs font-mono font-bold" style={{ color: 'var(--v3-accent)' }}>{scan.scanId}</span>
                  <span className="text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>RUNNING</span>
                </div>
                <span className="text-xs font-mono" style={{ color: 'var(--v3-text-secondary)' }}>{scan.results.length}/{scan.personnelCount} scanned</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--v3-border)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${scan.progress}%`, background: 'var(--v3-accent)' }} />
              </div>
            </div>
          ))}

          {/* Completed scans */}
          {defenceScans.filter(s => s.status === 'completed').map(scan => {
            const totalViolations = scan.results.reduce((acc, r) => acc + r.opsecViolations.length, 0);
            const isExpanded = expandedScan === scan.scanId;
            return (
              <div key={scan.scanId} className="border rounded-md overflow-hidden" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
                <div
                  className="flex items-center justify-between p-4 cursor-pointer transition-colors hover:bg-white/[0.02]"
                  onClick={() => setExpandedScan(isExpanded ? null : scan.scanId)}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown size={14} style={{ color: 'var(--v3-text-muted)' }} /> : <ChevronRight size={14} style={{ color: 'var(--v3-text-muted)' }} />}
                    <span className="text-xs font-mono font-semibold" style={{ color: 'var(--v3-text)' }}>{scan.scanId}</span>
                    <span className="text-[11px]" style={{ color: 'var(--v3-text-muted)' }}>{scan.personnelCount} personnel</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono" style={{ color: totalViolations > 0 ? 'var(--v3-red)' : 'var(--v3-green)' }}>
                      {totalViolations} violations
                    </span>
                    <span className="text-[10px] font-mono" style={{ color: 'var(--v3-text-muted)' }}>
                      {scan.completedAt ? new Date(scan.completedAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t" style={{ borderColor: 'var(--v3-border)' }}>
                    <table className="w-full text-xs">
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--v3-border)' }}>
                          {['', 'Name', 'Rank', 'Unit', 'Profiles', 'Violations', 'OPSEC Risk'].map(h => (
                            <th key={h} className="px-4 py-2 text-left font-semibold" style={{ color: 'var(--v3-text-muted)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {scan.results.map(person => (
                          <>
                            <tr
                              key={person.id}
                              className="cursor-pointer transition-colors hover:bg-white/[0.03]"
                              style={{ borderBottom: '1px solid var(--v3-border)' }}
                              onClick={() => togglePersonnel(person.id)}
                            >
                              <td className="px-4 py-2">
                                {expandedPersonnel.has(person.id) ? <ChevronDown size={12} style={{ color: 'var(--v3-text-muted)' }} /> : <ChevronRight size={12} style={{ color: 'var(--v3-text-muted)' }} />}
                              </td>
                              <td className="px-4 py-2" style={{ color: 'var(--v3-text)' }}>{person.name}</td>
                              <td className="px-4 py-2" style={{ color: 'var(--v3-text-secondary)' }}>{person.rank}</td>
                              <td className="px-4 py-2" style={{ color: 'var(--v3-text-secondary)' }}>{person.unit}</td>
                              <td className="px-4 py-2 font-mono" style={{ color: 'var(--v3-text)' }}>{person.profilesFound}</td>
                              <td className="px-4 py-2 font-mono" style={{ color: person.opsecViolations.length > 0 ? 'var(--v3-red)' : 'var(--v3-green)' }}>{person.opsecViolations.length}</td>
                              <td className="px-4 py-2"><RiskBadge level={person.overallRisk} /></td>
                            </tr>
                            {expandedPersonnel.has(person.id) && person.opsecViolations.map((v, vi) => {
                              const VIcon = violationIcons[v.type] || Eye;
                              return (
                                <tr key={`${person.id}-v-${vi}`} style={{ background: 'var(--v3-bg)', borderBottom: '1px solid var(--v3-border)' }}>
                                  <td></td>
                                  <td colSpan={6} className="px-4 py-3">
                                    <div className="flex items-start gap-3">
                                      <VIcon size={14} style={{ color: 'var(--v3-amber)', marginTop: 2 }} />
                                      <div>
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-[11px] font-semibold" style={{ color: 'var(--v3-text)' }}>{violationLabels[v.type]}</span>
                                          <RiskBadge level={v.severity} className="text-[9px]" />
                                          <span className="text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>{v.platform}</span>
                                        </div>
                                        <p className="text-[11px]" style={{ color: 'var(--v3-text-secondary)' }}>{v.content}</p>
                                        {v.location && (
                                          <div className="flex items-center gap-1 mt-1 text-[10px]" style={{ color: 'var(--v3-amber)' }}>
                                            <MapPin size={10} /> {v.location}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
