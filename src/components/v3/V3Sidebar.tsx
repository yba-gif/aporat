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
    label: 'INTELLIGENCE',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/v3/dashboard' },
      { label: 'Cases', icon: Briefcase, path: '/v3/cases' },
      { label: 'OSINT Scanner', icon: Search, path: '/v3/scanner' },
    ],
  },
  {
    label: 'DEFENCE',
    items: [
      { label: 'Defence OSINT', icon: Shield, path: '/v3/defence' },
      { label: 'Personnel Database', icon: Users, path: '/v3/personnel' },
    ],
  },
  {
    label: 'SYSTEM',
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
        // Fetch role
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
        'h-screen flex flex-col border-r transition-all duration-150 ease-out shrink-0',
        collapsed ? 'w-16' : 'w-56'
      )}
      style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
    >
      <div className="flex items-center justify-between h-14 px-3 border-b" style={{ borderColor: 'var(--v3-border)' }}>
        {!collapsed && (
          <span className="text-sm font-bold tracking-wider" style={{ color: 'var(--v3-text)' }}>
            PORTOLAN
          </span>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-md transition-colors hover:bg-white/5" style={{ color: 'var(--v3-text-secondary)' }}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 v3-scrollbar">
        {NAV_SECTIONS.map(section => (
          <div key={section.label} className="mb-4">
            {!collapsed && (
              <div className="px-4 mb-1 text-[10px] font-semibold tracking-widest" style={{ color: 'var(--v3-text-muted)' }}>
                {section.label}
              </div>
            )}
            {section.items.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 mx-2 rounded-md text-sm transition-colors duration-150',
                    isActive ? 'border-l-2' : 'border-l-2 border-transparent hover:bg-white/5'
                  )
                }
                style={({ isActive }) => ({
                  color: isActive ? 'var(--v3-accent)' : 'var(--v3-text-secondary)',
                  borderLeftColor: isActive ? 'var(--v3-accent)' : 'transparent',
                  background: isActive ? 'var(--v3-accent-muted)' : undefined,
                })}
              >
                <item.icon size={18} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t px-3 py-3" style={{ borderColor: 'var(--v3-border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'var(--v3-accent-muted)', color: 'var(--v3-accent)' }}>
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate" style={{ color: 'var(--v3-text)' }}>{displayName}</div>
              <div className="text-[10px] capitalize" style={{ color: 'var(--v3-text-muted)' }}>{userRole}</div>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout} className="p-1.5 rounded-md hover:bg-white/5 transition-colors" style={{ color: 'var(--v3-text-muted)' }}>
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
