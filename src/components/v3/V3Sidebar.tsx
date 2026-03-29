import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, Search, Shield, Users, ListOrdered,
  Settings, ChevronLeft, ChevronRight, LogOut, Network
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const NAV_SECTIONS = [
  {
    label: 'Intelligence',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/v3/dashboard' },
      { label: 'Cases', icon: Briefcase, path: '/v3/cases' },
      { label: 'Network Graph', icon: Network, path: '/v3/graph' },
      { label: 'OSINT Scanner', icon: Search, path: '/v3/scanner' },
    ],
  },
  {
    label: 'Defence',
    items: [
      { label: 'Defence OSINT', icon: Shield, path: '/v3/defence' },
      { label: 'Personnel', icon: Users, path: '/v3/personnel' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Scan Queue', icon: ListOrdered, path: '/v3/queue' },
      { label: 'Settings', icon: Settings, path: '/v3/settings' },
    ],
  },
];

export function V3Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('Analyst');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email || '');
        supabase.rpc('get_user_role', { _user_id: user.id }).then(({ data }) => {
          if (data) setUserRole(data as string);
        });
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/v3');
  };

  const initials = userEmail ? userEmail.substring(0, 2).toUpperCase() : 'OY';
  const displayName = userEmail?.split('@')[0] || 'Officer';

  return (
    <aside
      className={cn(
        'h-screen flex flex-col border-r transition-all duration-200 ease-out shrink-0',
        collapsed ? 'w-[60px]' : 'w-[220px]'
      )}
      style={{ background: 'var(--v3-bg)', borderColor: 'var(--v3-border)' }}
    >
      {/* Brand */}
      <div className="flex items-center justify-between h-14 px-3 border-b" style={{ borderColor: 'var(--v3-border)' }}>
        {!collapsed && (
          <span className="text-[13px] font-semibold tracking-wide" style={{ color: 'var(--v3-text)' }}>
            Portolan
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg transition-colors hover:bg-[var(--v3-surface)]"
          style={{ color: 'var(--v3-text-muted)' }}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 v3-scrollbar">
        {NAV_SECTIONS.map(section => (
          <div key={section.label} className="mb-5">
            {!collapsed && (
              <div className="px-4 mb-2 text-[10px] font-medium tracking-wider uppercase" style={{ color: 'var(--v3-text-muted)' }}>
                {section.label}
              </div>
            )}
            <div className="space-y-0.5 px-2">
              {section.items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-150',
                      isActive ? 'font-medium' : 'hover:bg-[var(--v3-surface)]'
                    )
                  }
                  style={({ isActive }) => ({
                    color: isActive ? 'var(--v3-text)' : 'var(--v3-text-secondary)',
                    background: isActive ? 'var(--v3-surface)' : undefined,
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon size={16} style={{ color: isActive ? 'var(--v3-accent)' : 'var(--v3-text-muted)' }} />
                      {!collapsed && <span>{item.label}</span>}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t px-3 py-3" style={{ borderColor: 'var(--v3-border)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-semibold shrink-0"
            style={{ background: 'var(--v3-accent-muted)', color: 'var(--v3-accent)' }}
          >
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium truncate" style={{ color: 'var(--v3-text)' }}>{displayName}</div>
              <div className="text-[10px] capitalize" style={{ color: 'var(--v3-text-muted)' }}>{userRole}</div>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-[var(--v3-surface)] transition-colors" style={{ color: 'var(--v3-text-muted)' }}>
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
