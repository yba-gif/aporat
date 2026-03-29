import { useLocation } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';

const routeLabels: Record<string, string> = {
  '/v3/dashboard': 'Dashboard',
  '/v3/cases': 'Cases',
  '/v3/scanner': 'OSINT Scanner',
  '/v3/defence': 'Defence OSINT',
  '/v3/personnel': 'Personnel Database',
  '/v3/queue': 'Scan Queue',
  '/v3/settings': 'Settings',
  '/v3/demo': 'Demo',
};

interface V3TopBarProps {
  onSearchClick?: () => void;
}

export function V3TopBar({ onSearchClick }: V3TopBarProps) {
  const location = useLocation();

  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentLabel = routeLabels[location.pathname] || pathParts[pathParts.length - 1];
  const isCaseDetail = location.pathname.match(/\/v3\/cases\/.+/);

  return (
    <header
      className="h-12 flex items-center px-5 border-b shrink-0 gap-4"
      style={{ background: 'var(--v3-bg)', borderColor: 'var(--v3-border)' }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[13px]">
        <span style={{ color: 'var(--v3-text-muted)' }}>Platform</span>
        <ChevronRight size={12} style={{ color: 'var(--v3-text-muted)' }} />
        {isCaseDetail ? (
          <>
            <span style={{ color: 'var(--v3-text-secondary)' }}>Cases</span>
            <ChevronRight size={12} style={{ color: 'var(--v3-text-muted)' }} />
            <span className="font-mono text-xs" style={{ color: 'var(--v3-text)' }}>
              {pathParts[pathParts.length - 1]}
            </span>
          </>
        ) : (
          <span style={{ color: 'var(--v3-text)' }}>{currentLabel}</span>
        )}
      </div>

      {/* Search - pushed right */}
      <button
        onClick={onSearchClick}
        className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all hover:border-[var(--v3-border-hover)] hover:bg-[var(--v3-surface)]"
        style={{ borderColor: 'var(--v3-border)', color: 'var(--v3-text-muted)', background: 'transparent' }}
      >
        <Search size={13} />
        <span>Search...</span>
        <kbd className="ml-8 px-1.5 py-0.5 rounded text-[10px] border" style={{ borderColor: 'var(--v3-border)', color: 'var(--v3-text-muted)' }}>
          ⌘K
        </kbd>
      </button>
    </header>
  );
}
