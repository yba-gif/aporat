import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpDown, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { v3Cases, nationalityFlags } from '@/data/v3/mockData';
import type { RiskLevel, CaseStatus } from '@/data/v3/mockData';
import { RiskBadge, StatusBadge } from '@/components/v3/V3Badges';

const PAGE_SIZE = 25;

export default function V3Cases() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'riskScore' | 'applicationDate' | 'caseId'>('riskScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let data = [...v3Cases];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(c =>
        c.caseId.toLowerCase().includes(q) ||
        `${c.applicant.firstName} ${c.applicant.lastName}`.toLowerCase().includes(q)
      );
    }
    if (riskFilter !== 'all') data = data.filter(c => c.riskLevel === riskFilter);
    if (statusFilter !== 'all') data = data.filter(c => c.status === statusFilter);
    data.sort((a, b) => {
      const m = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'riskScore') return (a.riskScore - b.riskScore) * m;
      if (sortBy === 'applicationDate') return a.applicationDate.localeCompare(b.applicationDate) * m;
      return a.caseId.localeCompare(b.caseId) * m;
    });
    return data;
  }, [search, riskFilter, statusFilter, sortBy, sortDir]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectStyle = 'px-2.5 py-1.5 rounded-md border text-xs outline-none';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold" style={{ color: 'var(--v3-text)' }}>Case Management</h2>
        {selected.size > 0 && (
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--v3-text-secondary)' }}>
            <span>{selected.size} selected</span>
            <button className="px-3 py-1.5 rounded-md text-xs font-medium" style={{ background: 'var(--v3-amber-muted)', color: 'var(--v3-amber)' }}>Escalate</button>
            <button className="px-3 py-1.5 rounded-md text-xs font-medium" style={{ background: 'var(--v3-accent-muted)', color: 'var(--v3-accent)' }}>Export CSV</button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div
        className="flex items-center gap-3 p-3 border rounded-md"
        style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
      >
        <Filter size={14} style={{ color: 'var(--v3-text-muted)' }} />
        <input
          type="text"
          placeholder="Search cases..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          className={selectStyle}
          style={{ background: 'var(--v3-bg)', borderColor: 'var(--v3-border)', color: 'var(--v3-text)', width: 200 }}
        />
        <select
          value={riskFilter}
          onChange={e => { setRiskFilter(e.target.value as any); setPage(0); }}
          className={selectStyle}
          style={{ background: 'var(--v3-bg)', borderColor: 'var(--v3-border)', color: 'var(--v3-text-secondary)' }}
        >
          <option value="all">All Risk</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value as any); setPage(0); }}
          className={selectStyle}
          style={{ background: 'var(--v3-bg)', borderColor: 'var(--v3-border)', color: 'var(--v3-text-secondary)' }}
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="scanning">Scanning</option>
          <option value="in_review">In Review</option>
          <option value="escalated">Escalated</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <div className="flex-1" />
        <span className="text-[11px] font-mono" style={{ color: 'var(--v3-text-muted)' }}>
          {filtered.length} cases
        </span>
      </div>

      {/* Table */}
      <div
        className="border rounded-md overflow-hidden"
        style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
      >
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--v3-border)' }}>
              <th className="px-3 py-2.5 w-8">
                <input type="checkbox" className="accent-[var(--v3-accent)]" />
              </th>
              {[
                { key: 'caseId', label: 'Case ID' },
                { key: null, label: 'Applicant' },
                { key: null, label: '' },
                { key: null, label: 'Consulate' },
                { key: 'riskScore', label: 'Risk Score' },
                { key: null, label: 'Risk' },
                { key: null, label: 'Status' },
                { key: null, label: 'Assigned' },
                { key: 'applicationDate', label: 'Date' },
              ].map((col, i) => (
                <th
                  key={i}
                  className="px-3 py-2.5 text-left font-semibold cursor-pointer select-none"
                  style={{ color: 'var(--v3-text-muted)' }}
                  onClick={() => col.key && toggleSort(col.key as any)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.key && <ArrowUpDown size={10} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map(c => {
              const scoreColor = c.riskScore < 30 ? 'var(--v3-green)' : c.riskScore < 60 ? 'var(--v3-amber)' : c.riskScore < 80 ? '#F97316' : 'var(--v3-red)';
              return (
                <tr
                  key={c.id}
                  className="cursor-pointer transition-colors duration-150 hover:bg-white/[0.03]"
                  style={{ borderBottom: '1px solid var(--v3-border)' }}
                  onClick={() => navigate(`/v3/cases/${c.id}`)}
                >
                  <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => toggleSelect(c.id)}
                      className="accent-[var(--v3-accent)]"
                    />
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
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-1.5 rounded-md border disabled:opacity-30 transition-colors hover:bg-white/5"
            style={{ borderColor: 'var(--v3-border)' }}
          >
            <ChevronLeft size={14} />
          </button>
          <span>Page {page + 1} of {pageCount}</span>
          <button
            onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
            disabled={page >= pageCount - 1}
            className="p-1.5 rounded-md border disabled:opacity-30 transition-colors hover:bg-white/5"
            style={{ borderColor: 'var(--v3-border)' }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
