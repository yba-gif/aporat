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
import { 
  Network, 
  FileSearch, 
  Settings2, 
  Bell,
  Database,
  Compass,
  Cpu
} from 'lucide-react';

const navItems = [
  { id: 'maris', label: 'Maris', sublabel: 'Evidence', icon: Database },
  { id: 'nautica', label: 'Nautica', sublabel: 'Intelligence', icon: Compass, active: true },
  { id: 'meridian', label: 'Meridian', sublabel: 'Governance', icon: Cpu },
];

function PlatformSidebar() {
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
      
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton 
                className={`w-full justify-start gap-3 px-3 py-2.5 ${
                  item.active 
                    ? 'bg-accent/10 text-accent border-l-2 border-accent' 
                    : 'hover:bg-sidebar-accent'
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {!collapsed && (
                  <div className="text-left">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.sublabel}</p>
                  </div>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}

export default function Platform() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  return (
    <div className="dark">
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-background text-foreground">
          <PlatformSidebar />
          
          <div className="flex-1 flex flex-col">
            {/* Top bar */}
            <header className="h-12 border-b border-border flex items-center justify-between px-4 bg-surface-elevated">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">Fraud Network Analysis</span>
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
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
                </button>
                <button className="p-2 hover:bg-secondary rounded transition-colors">
                  <Settings2 className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </header>

            {/* Main content area */}
            <div className="flex-1 flex">
              {/* Graph visualization */}
              <div className="flex-1 relative">
                <NauticaGraph 
                  onNodeSelect={setSelectedNode} 
                  selectedNode={selectedNode}
                />
              </div>

              {/* Right panel */}
              <div className="w-80 border-l border-border bg-surface-elevated flex flex-col">
                <AlertPanel />
                <ApplicantPanel selectedNode={selectedNode} />
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
