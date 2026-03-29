import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, Map, Building2, Radar, Crosshair, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusDot } from './StatusDot';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: Shield, path: '/v3/defence' },
  { label: 'Alerts', icon: AlertTriangle, path: '/v3/defence/alerts' },
  { label: 'Map', icon: Map, path: '/v3/defence/map' },
  { label: 'Installations', icon: Building2, path: '/v3/defence/installations' },
  { label: 'Scan Control', icon: Radar, path: '/v3/defence/scan' },
  { label: 'Geofence Checker', icon: Crosshair, path: '/v3/defence/geofence' },
];

export function DefenceSidebar({ backendOnline }: { backendOnline: boolean }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <aside
      className={cn(
        'h-screen flex flex-col border-r transition-all duration-200 shrink-0',
        collapsed ? 'w-14' : 'w-56'
      )}
      style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-14 px-3 border-b" style={{ borderColor: 'var(--v3-border)' }}>
        {!collapsed && (
          <span className="text-[10px] font-bold tracking-[0.2em]" style={{ color: 'var(--v3-text-secondary)' }}>
            DEFENCE OSINT
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--v3-text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--v3-surface-hover)'; e.currentTarget.style.color = 'var(--v3-text-secondary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--v3-text-muted)'; }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto space-y-0.5">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/v3/defence'}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 px-3 py-2 mx-2 rounded-xl text-[13px] font-medium transition-all duration-150',
                isActive
                  ? 'text-[var(--v3-accent)] bg-[var(--v3-accent-muted)]'
                  : 'text-[var(--v3-text-muted)] hover:text-[var(--v3-text-secondary)] hover:bg-[var(--v3-surface-hover)]'
              )
            }
          >
            <item.icon size={16} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Back button */}
      <div className="border-t px-2 py-2" style={{ borderColor: 'var(--v3-border)' }}>
        <button
          onClick={() => navigate('/v3/dashboard')}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-[11px] font-medium transition-colors"
          style={{ color: 'var(--v3-text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--v3-surface-hover)'; e.currentTarget.style.color = 'var(--v3-text-secondary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--v3-text-muted)'; }}
          title="Back to Platform"
        >
          <ArrowLeft size={14} />
          {!collapsed && <span>Main Platform</span>}
        </button>
      </div>

      {/* Status */}
      <div className="px-3 py-3 border-t flex items-center gap-2" style={{ borderColor: 'var(--v3-border)' }}>
        <StatusDot status={backendOnline ? 'idle' : 'error'} size="sm" />
        {!collapsed && (
          <span className="text-[10px] font-medium" style={{ color: 'var(--v3-text-muted)' }}>
            {backendOnline ? 'System Online' : 'Demo Mode'}
          </span>
        )}
      </div>
    </aside>
  );
}
