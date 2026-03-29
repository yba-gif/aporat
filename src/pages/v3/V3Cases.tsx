import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useV3Cases } from '@/api/v3-hooks';
import { nationalityFlags } from '@/data/v3/mockData';
import type { RiskLevel, CaseStatus } from '@/data/v3/mockData';
import { RiskBadge, StatusBadge, RiskScoreCircle } from '@/components/v3/V3Badges';
import { V3ConfirmDialog } from '@/components/v3/V3ConfirmDialog';
import { toast } from 'sonner';

const PAGE_SIZE = 25;

export default function V3Cases() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [focusedRow, setFocusedRow] = useState(0);
  const [bulkConfirm, setBulkConfirm] = useState<'escalate' | null>(null);

  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, loading } = useV3Cases({
    page,
    per_page: PAGE_SIZE,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    risk_level: riskFilter !== 'all' ? riskFilter : undefined,
    search: debouncedSearch || undefined,
  });

  const cases = data?.items || [];
  const total = data?.total || 0;
  const pageCount = Math.ceil(total / PAGE_SIZE);

  const toggleSelect = (id: string) => {
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  const toggleAll = () => {
    if (selected.size === cases.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(cases.map(c => c.id)));
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT') return;
      if (e.key === 'j') { e.preventDefault(); setFocusedRow(r => Math.min(cases.length - 1, r + 1)); }
      if (e.key === 'k') { e.preventDefault(); setFocusedRow(r => Math.max(0, r - 1)); }
      if (e.key === 'Enter' && cases[focusedRow]) { e.preventDefault(); navigate(`/v3/cases/${cases[focusedRow].id}`); }
      if (e.key === 'Escape') { e.preventDefault(); navigate('/v3/dashboard'); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [cases, focusedRow, navigate]);

  const getInitials = (first: string, last: string) => {
    return `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase();
  };

  const initialsColor = (name: string) => {
    const colors = ['#a78bfa', '#4ade80', '#fbbf24', '#f87171', '#38bdf8', '#fb923c'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--v3-text)' }}>Cases</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--v3-text-muted)' }}>
            {total} total · {cases.filter(c => c.status === 'in_review').length} in review
          </p>
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: 'var(--v3-accent-muted)', color: 'var(--v3-accent)' }}>
              {selected.size} selected
            </span>
            <button onClick={() => setBulkConfirm('escalate')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-90"
              style={{ background: 'var(--v3-amber-muted)', color: 'var(--v3-amber)' }}>
              Escalate
            </button>
            <button onClick={() => { toast.success(`Exported ${selected.size} cases`); setSelected(new Set()); }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-90"
              style={{ background: 'var(--v3-accent-muted)', color: 'var(--v3-accent)' }}>
              Export
            </button>
          </div>
        )}
      </div>

      {bulkConfirm && (
        <V3ConfirmDialog open title="Escalate Selected" description={`Escalate ${selected.size} cases to supervisor?`}
          confirmLabel="Escalate All" confirmColor="var(--v3-amber)"
          onConfirm={() => { toast.success(`${selected.size} cases escalated`); setSelected(new Set()); setBulkConfirm(null); }}
          onCancel={() => setBulkConfirm(null)} />
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--v3-text-muted)' }} />
          <input type="text" placeholder="Search by name, ID..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 rounded-lg border text-xs outline-none transition-colors focus:border-[var(--v3-accent-dim)]"
            style={{ background: 'var(--v3-bg)', borderColor: 'var(--v3-border)', color: 'var(--v3-text)' }} />
        </div>
        <div className="h-5 w-px" style={{ background: 'var(--v3-border)' }} />
        <SlidersHorizontal size={13} style={{ color: 'var(--v3-text-muted)' }} />
        {[
          { value: riskFilter, onChange: (v: string) => { setRiskFilter(v as any); setPage(1); }, options: [['all', 'All Risk'], ['low', 'Low'], ['medium', 'Medium'], ['high', 'High'], ['critical', 'Critical']] },
          { value: statusFilter, onChange: (v: string) => { setStatusFilter(v as any); setPage(1); }, options: [['all', 'All Status'], ['new', 'New'], ['scanning', 'Scanning'], ['in_review', 'In Review'], ['escalated', 'Escalated'], ['approved', 'Approved'], ['rejected', 'Rejected']] },
        ].map((f, i) => (
          <select key={i} value={f.value} onChange={e => f.onChange(e.target.value)}
            className="px-2.5 py-2 rounded-lg border text-xs outline-none cursor-pointer"
            style={{ background: 'var(--v3-bg)', borderColor: 'var(--v3-border)', color: 'var(--v3-text-secondary)' }}>
            {f.options.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
          </select>
        ))}
        <div className="flex-1" />
        <span className="text-[11px] font-mono tabular-nums" style={{ color: 'var(--v3-text-muted)' }}>{total} results</span>
      </div>

      {/* Case List */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--v3-border)', borderTopColor: 'var(--v3-accent)' }} />
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid items-center px-4 py-3 text-[11px] font-medium uppercase tracking-wider border-b"
              style={{ gridTemplateColumns: '36px 1fr 80px 100px 100px 100px', borderColor: 'var(--v3-border)', color: 'var(--v3-text-muted)' }}>
              <div>
                <input type="checkbox" checked={selected.size === cases.length && cases.length > 0}
                  onChange={toggleAll} className="accent-[var(--v3-accent)] rounded" />
              </div>
              <div>Applicant</div>
              <div className="text-center">Score</div>
              <div>Risk</div>
              <div>Status</div>
              <div>Date</div>
            </div>

            {/* Rows */}
            {cases.map((c, i) => {
              const isFocused = i === focusedRow;
              const initials = getInitials(c.applicant.firstName, c.applicant.lastName);
              const color = initialsColor(c.applicant.firstName + c.applicant.lastName);
              return (
                <div key={c.id}
                  className="grid items-center px-4 py-3 cursor-pointer transition-all duration-150 border-b last:border-b-0"
                  style={{
                    gridTemplateColumns: '36px 1fr 80px 100px 100px 100px',
                    borderColor: 'var(--v3-border)',
                    background: isFocused ? 'rgba(167, 139, 250, 0.04)' : 'transparent',
                  }}
                  onClick={() => navigate(`/v3/cases/${c.id}`)}
                  onMouseEnter={() => setFocusedRow(i)}>

                  {/* Checkbox */}
                  <div onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)}
                      className="accent-[var(--v3-accent)] rounded" />
                  </div>

                  {/* Avatar + Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
                      style={{ background: `${color}18`, color }}>
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium truncate" style={{ color: 'var(--v3-text)' }}>
                          {c.applicant.firstName} {c.applicant.lastName}
                        </span>
                        <span className="text-sm">{nationalityFlags[c.applicant.nationality] || ''}</span>
                      </div>
                      <span className="text-[10px] font-mono" style={{ color: 'var(--v3-text-muted)' }}>{c.case_id}</span>
                    </div>
                  </div>

                  {/* Risk Score Circle */}
                  <div className="flex justify-center">
                    <RiskScoreCircle score={Math.round(c.risk_score)} size="sm" />
                  </div>

                  {/* Risk Level */}
                  <div><RiskBadge level={c.risk_level as RiskLevel} /></div>

                  {/* Status */}
                  <div><StatusBadge status={c.status as CaseStatus} /></div>

                  {/* Date */}
                  <div className="text-[11px] font-mono tabular-nums" style={{ color: 'var(--v3-text-muted)' }}>
                    {c.application_date?.slice(0, 10)}
                  </div>
                </div>
              );
            })}

            {cases.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <span className="text-xs" style={{ color: 'var(--v3-text-muted)' }}>No cases found</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] tabular-nums" style={{ color: 'var(--v3-text-muted)' }}>
          {total > 0 ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}` : '0 results'}
        </span>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="p-1.5 rounded-lg border disabled:opacity-20 transition-colors hover:border-[var(--v3-border-hover)]"
            style={{ borderColor: 'var(--v3-border)', color: 'var(--v3-text-secondary)' }}>
            <ChevronLeft size={14} />
          </button>
          <span className="text-[11px] px-2 tabular-nums" style={{ color: 'var(--v3-text-secondary)' }}>
            {page} / {pageCount || 1}
          </span>
          <button onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page >= pageCount}
            className="p-1.5 rounded-lg border disabled:opacity-20 transition-colors hover:border-[var(--v3-border-hover)]"
            style={{ borderColor: 'var(--v3-border)', color: 'var(--v3-text-secondary)' }}>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Keyboard hints */}
      <div className="flex items-center gap-4 text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>
        {[['J/K', 'Navigate'], ['↵', 'Open'], ['ESC', 'Back']].map(([key, label]) => (
          <span key={key} className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded-md border text-[9px] font-mono" style={{ borderColor: 'var(--v3-border)', color: 'var(--v3-text-muted)' }}>{key}</kbd>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
