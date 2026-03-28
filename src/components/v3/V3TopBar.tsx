import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, ChevronRight } from 'lucide-react';

const routeLabels: Record<string, string> = {
  '/v3/dashboard': 'Dashboard',
  '/v3/cases': 'Cases',
  '/v3/scanner': 'OSINT Scanner',
  '/v3/defence': 'Defence OSINT',
  '/v3/personnel': 'Personnel Database',
  '/v3/queue': 'Scan Queue',
  '/v3/settings': 'Settings',
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
      className="h-12 flex items-center justify-between px-4 border-b shrink-0"
      style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
    >
      <div className="flex items-center gap-1.5 text-sm">
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

      <button
        onClick={onSearchClick}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs transition-colors hover:border-[var(--v3-border-hover)]"
        style={{ borderColor: 'var(--v3-border)', color: 'var(--v3-text-muted)', background: 'var(--v3-bg)' }}
      >
        <Search size={13} />
        <span>Search cases, people, findings...</span>
        <kbd className="ml-6 px-1.5 py-0.5 rounded text-[10px] border" style={{ borderColor: 'var(--v3-border)', color: 'var(--v3-text-muted)' }}>
          ⌘K
        </kbd>
      </button>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-md hover:bg-white/5 transition-colors" style={{ color: 'var(--v3-text-secondary)' }}>
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ background: 'var(--v3-red)', color: 'white' }}>3</span>
        </button>
        <div className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold" style={{ background: 'var(--v3-accent-muted)', color: 'var(--v3-accent)' }}>OY</div>
      </div>
    </header>
  );
}
