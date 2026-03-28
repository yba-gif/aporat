import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Briefcase, Users, AlertTriangle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  id: string;
  type: 'case' | 'personnel' | 'finding';
  title: string;
  subtitle: string;
  path: string;
}

interface V3CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function V3CommandPalette({ open, onClose }: V3CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timeout = setTimeout(async () => {
      setLoading(true);
      const q = query.toLowerCase();
      const items: SearchResult[] = [];

      // Search cases
      const { data: cases } = await supabase.from('v3_cases').select('id, case_id, applicant, risk_level')
        .or(`case_id.ilike.%${q}%,applicant->>firstName.ilike.%${q}%,applicant->>lastName.ilike.%${q}%`)
        .limit(8);
      (cases || []).forEach((c: any) => {
        const name = `${c.applicant?.firstName || ''} ${c.applicant?.lastName || ''}`;
        items.push({ id: c.id, type: 'case', title: c.case_id, subtitle: `${name} · ${c.risk_level} risk`, path: `/v3/cases/${c.id}` });
      });

      // Search personnel
      const { data: personnel } = await supabase.from('v3_personnel').select('id, name, rank, unit')
        .or(`name.ilike.%${q}%,unit.ilike.%${q}%`)
        .limit(5);
      (personnel || []).forEach((p: any) => {
        items.push({ id: p.id, type: 'personnel', title: p.name, subtitle: `${p.rank} · ${p.unit}`, path: '/v3/personnel' });
      });

      // Search findings
      const { data: findings } = await supabase.from('v3_osint_findings').select('id, title, source, case_id')
        .ilike('title', `%${q}%`)
        .limit(5);
      (findings || []).forEach((f: any) => {
        items.push({ id: f.id, type: 'finding', title: f.title, subtitle: `${f.source}`, path: `/v3/cases/${f.case_id}` });
      });

      setResults(items);
      setSelectedIndex(0);
      setLoading(false);
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(results.length - 1, i + 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(0, i - 1)); }
      if (e.key === 'Enter' && results[selectedIndex]) { navigate(results[selectedIndex].path); onClose(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, results, selectedIndex, navigate, onClose]);

  if (!open) return null;

  const typeIcons: Record<string, typeof Briefcase> = { case: Briefcase, personnel: Users, finding: AlertTriangle };
  const typeColors: Record<string, string> = { case: 'var(--v3-accent)', personnel: 'var(--v3-green)', finding: 'var(--v3-amber)' };

  const grouped = results.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const typeLabels: Record<string, string> = { case: 'Cases', personnel: 'Personnel', finding: 'Findings' };

  let flatIndex = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl border rounded-md overflow-hidden shadow-2xl"
        style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--v3-border)' }}>
          <Search size={16} style={{ color: 'var(--v3-text-muted)' }} />
          <input
            ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search cases, personnel, findings..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--v3-text)' }}
          />
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/5" style={{ color: 'var(--v3-text-muted)' }}>
            <X size={14} />
          </button>
        </div>

        {query.trim() && (
          <div className="max-h-80 overflow-y-auto v3-scrollbar py-2">
            {loading && (
              <div className="px-4 py-3 text-xs" style={{ color: 'var(--v3-text-muted)' }}>Searching...</div>
            )}
            {!loading && results.length === 0 && (
              <div className="px-4 py-8 text-center text-xs" style={{ color: 'var(--v3-text-muted)' }}>
                No results for "{query}"
              </div>
            )}
            {Object.entries(grouped).map(([type, items]) => {
              const Icon = typeIcons[type] || Briefcase;
              return (
                <div key={type}>
                  <div className="px-4 py-1.5 text-[10px] font-semibold tracking-widest" style={{ color: 'var(--v3-text-muted)' }}>
                    {typeLabels[type] || type}
                  </div>
                  {items.map(item => {
                    const idx = flatIndex++;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { navigate(item.path); onClose(); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                        style={{ background: idx === selectedIndex ? 'rgba(6,182,212,0.08)' : undefined }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                      >
                        <Icon size={14} style={{ color: typeColors[type] }} />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium" style={{ color: 'var(--v3-text)' }}>{item.title}</span>
                          <span className="text-[11px] ml-2" style={{ color: 'var(--v3-text-muted)' }}>{item.subtitle}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-4 px-4 py-2 border-t text-[10px]" style={{ borderColor: 'var(--v3-border)', color: 'var(--v3-text-muted)' }}>
          <span><kbd className="px-1 py-0.5 rounded border text-[9px]" style={{ borderColor: 'var(--v3-border)' }}>↑↓</kbd> Navigate</span>
          <span><kbd className="px-1 py-0.5 rounded border text-[9px]" style={{ borderColor: 'var(--v3-border)' }}>↵</kbd> Open</span>
          <span><kbd className="px-1 py-0.5 rounded border text-[9px]" style={{ borderColor: 'var(--v3-border)' }}>ESC</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
