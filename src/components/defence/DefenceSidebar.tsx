import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, Map, Users, Building2, Radar, Crosshair, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusDot } from './StatusDot';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: Shield, path: '/v3/defence' },
  { label: 'Alerts', icon: AlertTriangle, path: '/v3/defence/alerts' },
  { label: 'Map', icon: Map, path: '/v3/defence/map' },
  { label: 'Personnel', icon: Users, path: '/v3/defence/personnel' },
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
        'h-screen flex flex-col border-r transition-all duration-150 shrink-0',
        collapsed ? 'w-14' : 'w-56'
      )}
      style={{ background: '#0D1321', borderColor: '#1E293B' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-12 px-3 border-b" style={{ borderColor: '#1E293B' }}>
        {!collapsed && (
          <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400">PORTOLAN LABS</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Divider */}
      <div className="h-px mx-3 my-1" style={{ background: '#1E293B' }} />

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/v3/defence'}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 px-3 py-2 mx-1.5 rounded-md text-[13px] font-medium transition-all duration-150',
                isActive
                  ? 'text-blue-400 border-l-2 border-blue-500 bg-blue-500/8'
                  : 'text-slate-500 border-l-2 border-transparent hover:text-slate-300 hover:bg-white/5'
              )
            }
          >
            <item.icon size={16} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Back to Platform */}
      <div className="border-t px-2 py-2" style={{ borderColor: '#1E293B' }}>
        <button
          onClick={() => navigate('/v3/dashboard')}
          className={cn(
            'flex items-center gap-2 w-full px-2 py-2 rounded-md text-[11px] font-medium text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors',
          )}
          title="Back to Platform"
        >
          <ArrowLeft size={14} />
          {!collapsed && <span>Main Platform</span>}
        </button>
      </div>

      {/* Status */}
      <div className="px-3 py-2.5 border-t flex items-center gap-2" style={{ borderColor: '#1E293B' }}>
        <StatusDot status={backendOnline ? 'idle' : 'error'} size="sm" />
        {!collapsed && (
          <span className="text-[10px] text-slate-500 font-medium">
            {backendOnline ? 'System Online' : 'Demo Mode'}
          </span>
        )}
      </div>
    </aside>
  );
}
