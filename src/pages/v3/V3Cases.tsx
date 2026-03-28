import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpDown, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { v3Cases, nationalityFlags } from '@/data/v3/mockData';
import type { RiskLevel, CaseStatus, V3Case } from '@/data/v3/mockData';
import { RiskBadge, StatusBadge } from '@/components/v3/V3Badges';
import { V3ConfirmDialog } from '@/components/v3/V3ConfirmDialog';
import { toast } from 'sonner';

const PAGE_SIZE = 25;

export default function V3Cases() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [consulateFilter, setConsulateFilter] = useState<V3Case['consulateLocation'] | 'all'>('all');
  const [sortBy, setSortBy] = useState<'riskScore' | 'applicationDate' | 'caseId'>('riskScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [focusedRow, setFocusedRow] = useState(0);
  const [bulkConfirm, setBulkConfirm] = useState<'escalate' | null>(null);
  const tableRef = useRef<HTMLTableSectionElement>(null);

  const filtered = useMemo(() => {
    let data = [...v3Cases];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(c => c.caseId.toLowerCase().includes(q) || `${c.applicant.firstName} ${c.applicant.lastName}`.toLowerCase().includes(q));
    }
    if (riskFilter !== 'all') data = data.filter(c => c.riskLevel === riskFilter);
    if (statusFilter !== 'all') data = data.filter(c => c.status === statusFilter);
    if (consulateFilter !== 'all') data = data.filter(c => c.consulateLocation === consulateFilter);
    data.sort((a, b) => {
      const m = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'riskScore') return (a.riskScore - b.riskScore) * m;
      if (sortBy === 'applicationDate') return a.applicationDate.localeCompare(b.applicationDate) * m;
      return a.caseId.localeCompare(b.caseId) * m;
    });
    return data;
  }, [search, riskFilter, statusFilter, consulateFilter, sortBy, sortDir]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  // Keyboard shortcuts: J/K/Enter/Esc
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT') return;
      if (e.key === 'j') { e.preventDefault(); setFocusedRow(r => Math.min(paged.length - 1, r + 1)); }
      if (e.key === 'k') { e.preventDefault(); setFocusedRow(r => Math.max(0, r - 1)); }
      if (e.key === 'Enter' && paged[focusedRow]) { e.preventDefault(); navigate(`/v3/cases/${paged[focusedRow].id}`); }
      if (e.key === 'Escape') { e.preventDefault(); navigate('/v3/dashboard'); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [paged, focusedRow, navigate]);

  const selectStyle = 'px-2.5 py-1.5 rounded-md border text-xs outline-none';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold" style={{ color: 'var(--v3-text)' }}>Case Management</h2>
        {selected.size > 0 && (
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--v3-text-secondary)' }}>
            <span>{selected.size} selected</span>
            <button onClick={() => setBulkConfirm('escalate')} className="px-3 py-1.5 rounded-md text-xs font-medium" style={{ background: 'var(--v3-amber-muted)', color: 'var(--v3-amber)' }}>Escalate</button>
            <button onClick={() => { toast.success(`Exported ${selected.size} cases to CSV`); setSelected(new Set()); }} className="px-3 py-1.5 rounded-md text-xs font-medium" style={{ background: 'var(--v3-accent-muted)', color: 'var(--v3-accent)' }}>Export CSV</button>
          </div>
        )}
      </div>

      {/* Bulk Confirm */}
      {bulkConfirm && (
        <V3ConfirmDialog open title="Escalate Selected Cases" description={`Are you sure you want to escalate ${selected.size} cases to a supervisor?`}
          confirmLabel="Escalate All" confirmColor="var(--v3-amber)"
          onConfirm={() => { toast.success(`${selected.size} cases escalated`); setSelected(new Set()); setBulkConfirm(null); }}
          onCancel={() => setBulkConfirm(null)} />
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 p-3 border rounded-md" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
        <Filter size={14} style={{ color: 'var(--v3-text-muted)' }} />
        <input type="text" placeholder="Search cases..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
          className={selectStyle} style={{ background: 'var(--v3-bg)', borderColor: 'var(--v3-border)', color: 'var(--v3-text)', width: 200 }} />
        <select value={riskFilter} onChange={e => { setRiskFilter(e.target.value as any); setPage(0); }} className={selectStyle}
          style={{ background: 'var(--v3-bg)', borderColor: 'var(--v3-border)', color: 'var(--v3-text-secondary)' }}>
          <option value="all">All Risk</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as any); setPage(0); }} className={selectStyle}
          style={{ background: 'var(--v3-bg)', borderColor: 'var(--v3-border)', color: 'var(--v3-text-secondary)' }}>
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="scanning">Scanning</option>
          <option value="in_review">In Review</option>
          <option value="escalated">Escalated</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={consulateFilter} onChange={e => { setConsulateFilter(e.target.value as any); setPage(0); }} className={selectStyle}
          style={{ background: 'var(--v3-bg)', borderColor: 'var(--v3-border)', color: 'var(--v3-text-secondary)' }}>
          <option value="all">All Consulates</option>
          <option value="Istanbul">Istanbul</option>
          <option value="Ankara">Ankara</option>
          <option value="Izmir">Izmir</option>
        </select>
        <div className="flex-1" />
        <span className="text-[11px] font-mono" style={{ color: 'var(--v3-text-muted)' }}>{filtered.length} cases</span>
      </div>

      {/* Table */}
      <div className="border rounded-md overflow-hidden" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--v3-border)' }}>
              <th className="px-3 py-2.5 w-8"><input type="checkbox" className="accent-[var(--v3-accent)]" /></th>
              {[
                { key: 'caseId', label: 'Case ID' }, { key: null, label: 'Applicant' }, { key: null, label: '' },
                { key: null, label: 'Consulate' }, { key: 'riskScore', label: 'Risk Score' }, { key: null, label: 'Risk' },
                { key: null, label: 'Status' }, { key: null, label: 'Assigned' }, { key: 'applicationDate', label: 'Date' },
              ].map((col, i) => (
                <th key={i} className="px-3 py-2.5 text-left font-semibold cursor-pointer select-none" style={{ color: 'var(--v3-text-muted)' }}
                  onClick={() => col.key && toggleSort(col.key as any)}>
                  <span className="inline-flex items-center gap-1">{col.label}{col.key && <ArrowUpDown size={10} />}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody ref={tableRef}>
            {paged.map((c, i) => {
              const scoreColor = c.riskScore < 30 ? 'var(--v3-green)' : c.riskScore < 60 ? 'var(--v3-amber)' : c.riskScore < 80 ? '#F97316' : 'var(--v3-red)';
              const isFocused = i === focusedRow;
              return (
                <tr key={c.id} className="cursor-pointer transition-colors duration-150"
                  style={{ borderBottom: '1px solid var(--v3-border)', background: isFocused ? 'rgba(6,182,212,0.05)' : undefined }}
                  onClick={() => navigate(`/v3/cases/${c.id}`)}>
                  <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} className="accent-[var(--v3-accent)]" />
                  </td>
                  <td className="px-3 py-2 font-mono" style={{ color: 'var(--v3-accent)' }}>{c.caseId}</td>
                  <td className="px-3 py-2" style={{ color: 'var(--v3-text)' }}>{c.applicant.firstName} {c.applicant.lastName}</td>
                  <td className="px-1">{nationalityFlags[c.applicant.nationality]}</td>
                  <td className="px-3 py-2" style={{ color: 'var(--v3-text-secondary)' }}>{c.consulateLocation}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold" style={{ color: scoreColor }}>{c.riskScore}</span>
                      <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--v3-border)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${c.riskScore}%`, background: scoreColor }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2"><RiskBadge level={c.riskLevel} /></td>
                  <td className="px-3 py-2"><StatusBadge status={c.status} /></td>
                  <td className="px-3 py-2" style={{ color: 'var(--v3-text-secondary)' }}>{c.assignedOfficer}</td>
                  <td className="px-3 py-2 font-mono" style={{ color: 'var(--v3-text-muted)' }}>{c.applicationDate}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--v3-text-muted)' }}>
        <span>Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} cases</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            className="p-1.5 rounded-md border disabled:opacity-30 transition-colors hover:bg-white/5" style={{ borderColor: 'var(--v3-border)' }}>
            <ChevronLeft size={14} />
          </button>
          <span>Page {page + 1} of {pageCount}</span>
          <button onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))} disabled={page >= pageCount - 1}
            className="p-1.5 rounded-md border disabled:opacity-30 transition-colors hover:bg-white/5" style={{ borderColor: 'var(--v3-border)' }}>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Keyboard hints */}
      <div className="flex items-center gap-4 text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>
        <span><kbd className="px-1 py-0.5 rounded border text-[9px]" style={{ borderColor: 'var(--v3-border)' }}>J</kbd>/<kbd className="px-1 py-0.5 rounded border text-[9px]" style={{ borderColor: 'var(--v3-border)' }}>K</kbd> Navigate</span>
        <span><kbd className="px-1 py-0.5 rounded border text-[9px]" style={{ borderColor: 'var(--v3-border)' }}>↵</kbd> Open</span>
        <span><kbd className="px-1 py-0.5 rounded border text-[9px]" style={{ borderColor: 'var(--v3-border)' }}>ESC</kbd> Back</span>
      </div>
    </div>
  );
}
