import { useState, useMemo } from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';
import { useV3Personnel } from '@/api/v3-hooks';
import { RiskBadge } from '@/components/v3/V3Badges';
import type { RiskLevel } from '@/data/v3/mockData';

export default function V3Personnel() {
  const { data: personnel, loading } = useV3Personnel();
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');

  const filtered = useMemo(() => {
    let data = [...(personnel || [])];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(p => p.name.toLowerCase().includes(q) || p.unit.toLowerCase().includes(q) || p.rank.toLowerCase().includes(q));
    }
    if (riskFilter !== 'all') data = data.filter(p => p.overall_risk === riskFilter);
    return data;
  }, [personnel, search, riskFilter]);

  const selectStyle = 'px-2.5 py-1.5 rounded-md border text-xs outline-none';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--v3-accent)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold" style={{ color: 'var(--v3-text)' }}>Personnel Database</h2>

      <div className="flex items-center gap-3 p-3 border rounded-md" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
        <Filter size={14} style={{ color: 'var(--v3-text-muted)' }} />
        <input type="text" placeholder="Search personnel..." value={search} onChange={e => setSearch(e.target.value)}
          className={selectStyle} style={{ background: 'var(--v3-bg)', borderColor: 'var(--v3-border)', color: 'var(--v3-text)', width: 200 }} />
        <select value={riskFilter} onChange={e => setRiskFilter(e.target.value as any)} className={selectStyle}
          style={{ background: 'var(--v3-bg)', borderColor: 'var(--v3-border)', color: 'var(--v3-text-secondary)' }}>
          <option value="all">All Risk</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <div className="flex-1" />
        <span className="text-[11px] font-mono" style={{ color: 'var(--v3-text-muted)' }}>{filtered.length} personnel</span>
      </div>

      <div className="border rounded-md overflow-hidden" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--v3-border)' }}>
              {['Name', 'Rank', 'Unit', 'Branch', 'Profiles Found', 'Violations', 'OPSEC Risk'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left font-semibold" style={{ color: 'var(--v3-text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const violations = (p.opsec_violations as any[]) || [];
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--v3-border)' }} className="transition-colors hover:bg-white/[0.03]">
                  <td className="px-4 py-2.5" style={{ color: 'var(--v3-text)' }}>{p.name}</td>
                  <td className="px-4 py-2.5" style={{ color: 'var(--v3-text-secondary)' }}>{p.rank}</td>
                  <td className="px-4 py-2.5" style={{ color: 'var(--v3-text-secondary)' }}>{p.unit}</td>
                  <td className="px-4 py-2.5" style={{ color: 'var(--v3-text-muted)' }}>{p.branch}</td>
                  <td className="px-4 py-2.5 font-mono" style={{ color: 'var(--v3-text)' }}>{p.profiles_found}</td>
                  <td className="px-4 py-2.5 font-mono" style={{ color: violations.length > 0 ? 'var(--v3-red)' : 'var(--v3-green)' }}>
                    {violations.length}
                  </td>
                  <td className="px-4 py-2.5"><RiskBadge level={p.overall_risk as any} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 border rounded-md" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
          <Search size={32} className="mx-auto mb-3" style={{ color: 'var(--v3-text-muted)' }} />
          <p className="text-xs" style={{ color: 'var(--v3-text-muted)' }}>No personnel matching your search</p>
        </div>
      )}
    </div>
  );
}
