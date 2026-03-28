import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Briefcase, Users, AlertTriangle, X } from 'lucide-react';
import { v3Cases, defenceScans } from '@/data/v3/mockData';

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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const results = useMemo((): SearchResult[] => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const items: SearchResult[] = [];

    // Cases
    v3Cases.forEach(c => {
      const name = `${c.applicant.firstName} ${c.applicant.lastName}`;
      if (c.caseId.toLowerCase().includes(q) || name.toLowerCase().includes(q) || c.applicant.nationality.toLowerCase().includes(q)) {
        items.push({ id: c.id, type: 'case', title: c.caseId, subtitle: `${name} · ${c.riskLevel} risk`, path: `/v3/cases/${c.id}` });
      }
    });

    // Personnel
    defenceScans.forEach(scan => {
      scan.results.forEach(p => {
        if (p.name.toLowerCase().includes(q) || p.unit.toLowerCase().includes(q)) {
          items.push({ id: p.id, type: 'personnel', title: p.name, subtitle: `${p.rank} · ${p.unit}`, path: '/v3/defence' });
        }
      });
    });

    // Findings
    v3Cases.forEach(c => {
      c.osintFindings.forEach(f => {
        if (f.title.toLowerCase().includes(q) || f.detail.toLowerCase().includes(q)) {
          items.push({ id: `${c.id}-${f.id}`, type: 'finding', title: f.title, subtitle: `${c.caseId} · ${f.source}`, path: `/v3/cases/${c.id}` });
        }
      });
    });

    return items.slice(0, 15);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(results.length - 1, i + 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(0, i - 1)); }
      if (e.key === 'Enter' && results[selectedIndex]) {
        navigate(results[selectedIndex].path);
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, results, selectedIndex, navigate, onClose]);

  if (!open) return null;

  const typeIcons = { case: Briefcase, personnel: Users, finding: AlertTriangle };
  const typeLabels = { case: 'Case', personnel: 'Personnel', finding: 'Finding' };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg border rounded-md overflow-hidden"
        style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--v3-border)' }}>
          <Search size={16} style={{ color: 'var(--v3-text-muted)' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Search cases, people, findings..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--v3-text)' }}
          />
          <kbd className="px-1.5 py-0.5 rounded text-[10px] border" style={{ borderColor: 'var(--v3-border)', color: 'var(--v3-text-muted)' }}>ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto v3-scrollbar">
          {query && results.length === 0 && (
            <div className="px-4 py-8 text-center text-xs" style={{ color: 'var(--v3-text-muted)' }}>
              No results for "{query}"
            </div>
          )}
          {results.map((result, i) => {
            const Icon = typeIcons[result.type];
            return (
              <button
                key={result.id}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                style={{
                  background: i === selectedIndex ? 'var(--v3-accent-muted)' : 'transparent',
                }}
                onClick={() => { navigate(result.path); onClose(); }}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                <Icon size={14} style={{ color: i === selectedIndex ? 'var(--v3-accent)' : 'var(--v3-text-muted)' }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate" style={{ color: 'var(--v3-text)' }}>{result.title}</div>
                  <div className="text-[10px] truncate" style={{ color: 'var(--v3-text-muted)' }}>{result.subtitle}</div>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'var(--v3-bg)', color: 'var(--v3-text-muted)' }}>
                  {typeLabels[result.type]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        {query && results.length > 0 && (
          <div className="px-4 py-2 border-t text-[10px] flex items-center gap-4" style={{ borderColor: 'var(--v3-border)', color: 'var(--v3-text-muted)' }}>
            <span>↑↓ Navigate</span>
            <span>↵ Open</span>
            <span>ESC Close</span>
          </div>
        )}
      </div>
    </div>
  );
}
