import { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Users, Building2, Cpu, CreditCard, Wrench,
  ChevronLeft, ChevronRight, Search, Menu, X,
  User as UserIcon, LogOut, Settings, Compass, ShieldCheck,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useP2Auth } from '@/contexts/P2AuthContext';
import '@/styles/p2.css';

const NAV_ITEMS = [
  { label: 'System Health', icon: Activity, path: '/p2/admin' },
  { label: 'Users', icon: Users, path: '/p2/admin/users' },
  { label: 'Consulates', icon: Building2, path: '/p2/admin/consulates' },
  { label: 'API Monitoring', icon: Cpu, path: '/p2/admin/api' },
  { label: 'Billing', icon: CreditCard, path: '/p2/admin/billing' },
  { label: 'Configuration', icon: Wrench, path: '/p2/admin/config' },
];

const PAGE_TITLES: Record<string, { title: string; breadcrumb: string[] }> = {
  '/p2/admin': { title: 'System Health', breadcrumb: ['Admin', 'System Health'] },
  '/p2/admin/users': { title: 'Users', breadcrumb: ['Admin', 'Users'] },
  '/p2/admin/consulates': { title: 'Consulates', breadcrumb: ['Admin', 'Consulates'] },
  '/p2/admin/api': { title: 'API Monitoring', breadcrumb: ['Admin', 'API Monitoring'] },
  '/p2/admin/billing': { title: 'Billing', breadcrumb: ['Admin', 'Billing'] },
  '/p2/admin/config': { title: 'Configuration', breadcrumb: ['Admin', 'Configuration'] },
};

const ACCENT = '#7C3AED'; // purple-600
const ACCENT_LIGHT = '#8B5CF6'; // purple-500

function NavItem({ item, active, collapsed }: { item: typeof NAV_ITEMS[0]; active: boolean; collapsed: boolean }) {
  const content = (
    <Link to={item.path}
      className={cn(
        'flex items-center gap-3 rounded-md transition-all duration-150 relative group',
        collapsed ? 'justify-center px-3 py-2.5 mx-2' : 'px-3 py-2.5 mx-2',
        active ? 'bg-white/[0.08] text-white' : 'text-[--p2-gray-400] hover:bg-white/[0.05] hover:text-[--p2-gray-200]'
      )}>
      {active && (
        <motion.div layoutId="admin-sidebar-active"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
          style={{ background: ACCENT }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
      )}
      <item.icon size={18} className={cn(active && 'text-purple-400')} />
      {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="text-xs">{item.label}</TooltipContent>
      </Tooltip>
    );
  }
  return content;
}

export default function P2AdminLayout() {
  const location = useLocation();
  const { user, logout } = useP2Auth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const currentPath = location.pathname;
  const pageInfo = PAGE_TITLES[currentPath] || { title: 'Admin', breadcrumb: ['Admin'] };

  useEffect(() => { setMobileOpen(false); }, [currentPath]);

  const sidebarWidth = collapsed ? 64 : 260;

  const sidebarContent = (
    <div className="flex flex-col h-full" style={{ background: 'var(--p2-navy)' }}>
      {/* Logo */}
      <div className={cn('flex items-center gap-2.5 h-16 px-4 border-b border-white/[0.08] flex-shrink-0', collapsed && 'justify-center px-2')}>
        <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: ACCENT }}>
          <ShieldCheck size={15} className="text-white" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-baseline gap-1">
            <span className="font-bold text-sm tracking-wide text-white">ADMIN</span>
            <span className="font-bold text-sm tracking-wide" style={{ color: ACCENT_LIGHT }}>PANEL</span>
          </motion.div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <NavItem key={item.path} item={item} active={currentPath === item.path} collapsed={collapsed} />
        ))}
      </nav>

      {/* Back to dashboard */}
      <div className="border-t border-white/[0.08] py-3 px-2">
        <Link to="/p2/dashboard"
          className={cn('flex items-center gap-2 px-3 py-2 rounded-md text-[--p2-gray-400] hover:text-white hover:bg-white/[0.05] transition-colors text-xs',
            collapsed && 'justify-center')}>
          <Compass size={14} />
          {!collapsed && <span>Consulate Dashboard</span>}
        </Link>
      </div>

      {/* Collapse */}
      <div className="hidden lg:block border-t border-white/[0.08] p-2">
        <button onClick={() => setCollapsed(c => !c)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-md text-[--p2-gray-400] hover:text-white hover:bg-white/[0.05] transition-colors">
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span className="text-xs">Collapse</span></>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="p2 flex min-h-screen">
      <motion.aside className="hidden lg:block fixed left-0 top-0 bottom-0 z-40 overflow-hidden"
        animate={{ width: sidebarWidth }} transition={{ duration: 0.2, ease: 'easeInOut' }}>
        {sidebarContent}
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[260px] overflow-hidden">
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      <motion.div className="flex-1 flex flex-col min-h-screen"
        animate={{ marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024 ? sidebarWidth : 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        style={{ marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024 ? sidebarWidth : 0 }}>
        
        <header className="sticky top-0 z-30 bg-white border-b flex items-center justify-between px-4 sm:px-6 flex-shrink-0"
          style={{ height: 64, borderColor: 'var(--p2-gray-200)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 -ml-1 rounded-md hover:bg-[--p2-gray-100]">
              <Menu size={20} style={{ color: 'var(--p2-gray-600)' }} />
            </button>
            <div>
              <nav className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--p2-gray-400)' }}>
                {pageInfo.breadcrumb.map((b, i) => (
                  <span key={i}>{i > 0 && <span className="mx-1">/</span>}{b}</span>
                ))}
              </nav>
              <h1 className="text-sm font-semibold" style={{ color: 'var(--p2-navy)' }}>{pageInfo.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-purple-700 bg-purple-100">Admin</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: ACCENT }}>
                  {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'AD'}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || 'admin@portolanlabs.com'}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/p2/dashboard" className="cursor-pointer"><Compass size={14} className="mr-2" /> Consulate Dashboard</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-[--p2-red]"><LogOut size={14} className="mr-2" /> Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto" style={{ background: 'var(--p2-gray-50)' }}>
          <Outlet />
        </main>
      </motion.div>
    </div>
  );
}
