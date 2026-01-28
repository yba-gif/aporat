import { useState } from 'react';
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
import { NauticaGraph } from '@/components/platform/NauticaGraph';
import { ApplicantPanel } from '@/components/platform/ApplicantPanel';
import { AlertPanel } from '@/components/platform/AlertPanel';
import { MarisPanel } from '@/components/platform/MarisPanel';
import { MeridianPanel } from '@/components/platform/MeridianPanel';
import { SocialIntelligencePanel } from '@/components/platform/SocialIntelligencePanel';
import { 
  Network, 
  FileSearch, 
  Settings2, 
  Bell,
  Database,
  Scale,
  Globe,
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

type ActiveModule = 'maris' | 'nautica' | 'meridian';
type NauticaView = 'graph' | 'social';

const navItems = [
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
                        <span className="text-sm font-medium">{item.label}</span>
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
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<ActiveModule>('nautica');
  const [nauticaView, setNauticaView] = useState<NauticaView>('graph');

  const getModuleTitle = () => {
    switch (activeModule) {
      case 'maris': return { title: 'Evidence Ingestion', subtitle: 'Document processing & chain-of-custody' };
      case 'nautica': return { title: 'Fraud Network Analysis', subtitle: nauticaView === 'graph' ? 'Entity resolution & integrity verification' : 'OSINT & social intelligence' };
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
                  {activeModule === 'maris' && <Database className="w-4 h-4 text-accent" />}
                  {activeModule === 'nautica' && <Network className="w-4 h-4 text-accent" />}
                  {activeModule === 'meridian' && <Scale className="w-4 h-4 text-accent" />}
                  <span className="text-sm font-medium">{moduleInfo.title}</span>
                  <span className="text-xs font-mono text-muted-foreground px-2 py-0.5 bg-secondary rounded">
                    DEMO
                  </span>
                </div>

                {/* Nautica sub-view toggle */}
                {activeModule === 'nautica' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {nauticaView === 'graph' ? 'Network Graph' : 'Social Intel'}
                      <ChevronDown className="w-3 h-3" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => setNauticaView('graph')}>
                        <Network className="w-4 h-4 mr-2" />
                        Network Graph
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setNauticaView('social')}>
                        <Globe className="w-4 h-4 mr-2" />
                        Social Intelligence
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-secondary rounded transition-colors">
                  <FileSearch className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="p-2 hover:bg-secondary rounded transition-colors relative">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
                </button>
                <button className="p-2 hover:bg-secondary rounded transition-colors">
                  <Settings2 className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </header>

            {/* Main content area */}
            <div className="flex-1 flex overflow-hidden">
              {/* Maris Module */}
              {activeModule === 'maris' && <MarisPanel />}

              {/* Nautica Module */}
              {activeModule === 'nautica' && (
                <>
                  {nauticaView === 'graph' ? (
                    <>
                      <div className="flex-1 relative">
                        <NauticaGraph 
                          onNodeSelect={setSelectedNode} 
                          selectedNode={selectedNode}
                        />
                      </div>
                      <div className="w-80 border-l border-border bg-surface-elevated flex flex-col">
                        <AlertPanel />
                        <ApplicantPanel selectedNode={selectedNode} />
                      </div>
                    </>
                  ) : (
                    <SocialIntelligencePanel />
                  )}
                </>
              )}

              {/* Meridian Module */}
              {activeModule === 'meridian' && <MeridianPanel />}
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
