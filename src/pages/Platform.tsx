import { useState, useEffect, useCallback } from 'react';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import { CompassLogo } from '@/components/CompassLogo';
import { MarisPanel } from '@/components/platform/MarisPanel';
import { MeridianPanel } from '@/components/platform/MeridianPanel';
import { SocialIntelligencePanel } from '@/components/platform/SocialIntelligencePanel';
import { CommandCenterView } from '@/components/platform/CommandCenterView';
import { 
  Network, 
  FileSearch, 
  Settings2, 
  Bell,
  Database,
  Scale,
  LayoutDashboard,
  ChevronDown
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ActiveModule = 'command' | 'maris' | 'nautica' | 'meridian';

const navItems = [
  { id: 'command' as const, label: 'Command', sublabel: 'Overview', icon: LayoutDashboard },
  { id: 'maris' as const, label: 'Maris', sublabel: 'Evidence', icon: Database },
  { id: 'nautica' as const, label: 'Nautica', sublabel: 'Intelligence', icon: Network },
  { id: 'meridian' as const, label: 'Meridian', sublabel: 'Governance', icon: Scale },
];

function PlatformSidebar({ 
  activeModule, 
  setActiveModule 
}: { 
  activeModule: ActiveModule;
  setActiveModule: (module: ActiveModule) => void;
}) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar className="border-r border-border bg-sidebar">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <CompassLogo className="w-8 h-8" />
          {!collapsed && (
            <div>
              <p className="font-semibold text-sm">Portolan</p>
              <p className="text-[10px] font-mono text-muted-foreground">v2.4.1</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-3">
        <TooltipProvider delayDuration={0}>
          <SidebarMenu className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeModule === item.id;
              return (
                <SidebarMenuItem key={item.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton 
                        className={`w-full justify-start px-3 py-2.5 cursor-pointer rounded-lg transition-all duration-200 ${
                          isActive 
                            ? 'bg-accent text-accent-foreground' 
                            : 'hover:bg-sidebar-accent'
                        }`}
                        onClick={() => setActiveModule(item.id)}
                      >
                        <item.icon className={`w-4 h-4 mr-2 ${collapsed ? 'mr-0' : ''}`} />
                        {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right" className="flex flex-col">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-xs text-muted-foreground">{item.sublabel}</span>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </TooltipProvider>
      </SidebarContent>
    </Sidebar>
  );
}

export default function Platform() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('command');
  const [alertCount, setAlertCount] = useState(3);

  const getModuleTitle = () => {
    switch (activeModule) {
      case 'command': return { title: 'Command Center', subtitle: 'Real-time operations overview' };
      case 'maris': return { title: 'Evidence Ingestion', subtitle: 'Document processing & chain-of-custody' };
      case 'nautica': return { title: 'Social Intelligence', subtitle: 'OSINT & social network analysis' };
      case 'meridian': return { title: 'Policy Governance', subtitle: 'Compliance & decision workflows' };
    }
  };

  const moduleInfo = getModuleTitle();

  return (
    <div className="dark">
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-background text-foreground">
          <PlatformSidebar activeModule={activeModule} setActiveModule={setActiveModule} />
          
          <div className="flex-1 flex flex-col">
            {/* Top bar */}
            <header className="h-12 border-b border-border flex items-center justify-between px-4 bg-surface-elevated">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="flex items-center gap-2">
                  {activeModule === 'command' && <LayoutDashboard className="w-4 h-4 text-accent" />}
                  {activeModule === 'maris' && <Database className="w-4 h-4 text-accent" />}
                  {activeModule === 'nautica' && <Network className="w-4 h-4 text-accent" />}
                  {activeModule === 'meridian' && <Scale className="w-4 h-4 text-accent" />}
                  <span className="text-sm font-medium">{moduleInfo.title}</span>
                  <span className="text-xs font-mono text-muted-foreground px-2 py-0.5 bg-secondary rounded">
                    DEMO
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-secondary rounded transition-colors">
                  <FileSearch className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="p-2 hover:bg-secondary rounded transition-colors relative">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  {alertCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
                  )}
                </button>
                <button className="p-2 hover:bg-secondary rounded transition-colors">
                  <Settings2 className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </header>

            {/* Main content area */}
            <div className="flex-1 flex overflow-hidden">
              {activeModule === 'command' && (
                <CommandCenterView onNavigate={setActiveModule} />
              )}
              
              {activeModule === 'maris' && <MarisPanel />}

              {activeModule === 'nautica' && <SocialIntelligencePanel />}

              {activeModule === 'meridian' && <MeridianPanel />}
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
