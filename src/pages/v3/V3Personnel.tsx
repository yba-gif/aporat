import { useState, useMemo } from 'react';
import { Search, Loader2 } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--v3-accent)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold tracking-tight" style={{ color: 'var(--v3-text)' }}>Personnel Database</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--v3-text-muted)' }}>{filtered.length} personnel records</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--v3-text-muted)' }} />
          <input type="text" placeholder="Search personnel..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs outline-none transition-colors focus:border-[var(--v3-accent)]"
            style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)', color: 'var(--v3-text)' }} />
        </div>
        <div className="flex gap-1 p-1 rounded-xl border" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
          {(['all', 'low', 'medium', 'high', 'critical'] as const).map(f => (
            <button key={f} onClick={() => setRiskFilter(f)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
              style={{
                background: riskFilter === f ? 'var(--v3-accent-muted)' : 'transparent',
                color: riskFilter === f ? 'var(--v3-accent)' : 'var(--v3-text-muted)',
              }}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Personnel List */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
        {/* Header */}
        <div className="grid items-center px-5 py-3 border-b text-[10px] font-semibold tracking-[0.1em]"
          style={{ gridTemplateColumns: '1fr 100px 120px 100px 80px 80px 90px', borderColor: 'var(--v3-border)', color: 'var(--v3-text-muted)' }}>
          <span>NAME</span><span>RANK</span><span>UNIT</span><span>BRANCH</span><span className="text-center">PROFILES</span><span className="text-center">VIOLATIONS</span><span className="text-center">RISK</span>
        </div>
        {/* Rows */}
        {filtered.map(p => {
          const violations = (p.opsec_violations as any[]) || [];
          const initials = p.name.split(' ').map(w => w[0]).join('').slice(0, 2);
          return (
            <div key={p.id} className="grid items-center px-5 py-3.5 border-b transition-colors hover:bg-white/[0.02] cursor-pointer"
              style={{ gridTemplateColumns: '1fr 100px 120px 100px 80px 80px 90px', borderColor: 'var(--v3-border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold"
                  style={{ background: 'var(--v3-accent-muted)', color: 'var(--v3-accent)' }}>{initials}</div>
                <span className="text-xs font-medium" style={{ color: 'var(--v3-text)' }}>{p.name}</span>
              </div>
              <span className="text-[11px]" style={{ color: 'var(--v3-text-secondary)' }}>{p.rank}</span>
              <span className="text-[11px]" style={{ color: 'var(--v3-text-secondary)' }}>{p.unit}</span>
              <span className="text-[11px]" style={{ color: 'var(--v3-text-muted)' }}>{p.branch}</span>
              <span className="text-xs font-mono text-center" style={{ color: 'var(--v3-text)' }}>{p.profiles_found}</span>
              <span className="text-xs font-mono text-center" style={{ color: violations.length > 0 ? 'var(--v3-red)' : 'var(--v3-green)' }}>
                {violations.length}
              </span>
              <div className="flex justify-center"><RiskBadge level={p.overall_risk as any} /></div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 rounded-xl border" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
          <Search size={32} className="mx-auto mb-3" style={{ color: 'var(--v3-text-muted)' }} />
          <p className="text-xs" style={{ color: 'var(--v3-text-muted)' }}>No personnel matching your search</p>
        </div>
      )}
    </div>
  );
}
