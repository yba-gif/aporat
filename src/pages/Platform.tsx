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
import { AlertPanel } from '@/components/platform/AlertPanel';
import { MarisPanel } from '@/components/platform/MarisPanel';
import { MeridianPanel } from '@/components/platform/MeridianPanel';
import { SocialIntelligencePanel } from '@/components/platform/SocialIntelligencePanel';
import { EntityDossier } from '@/components/platform/nautica/EntityDossier';
import { UnifiedCommandPalette } from '@/components/platform/UnifiedCommandPalette';
import { KeyboardShortcutHints } from '@/components/platform/KeyboardShortcutHints';
import { PlatformProvider, usePlatform } from '@/contexts/PlatformContext';
import { useRealtimeAlerts } from '@/hooks/useRealtimeAlerts';
import { usePlatformKeyboard } from '@/hooks/usePlatformKeyboard';
import { 
  Network, 
  FileSearch, 
  Settings2, 
  Bell,
  Database,
  Scale,
  Globe,
  ChevronDown,
  Zap,
  Keyboard
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useState } from 'react';

type NauticaView = 'graph' | 'social';

const navItems = [
  { id: 'maris' as const, label: 'Maris', sublabel: 'Evidence', icon: Database },
  { id: 'nautica' as const, label: 'Nautica', sublabel: 'Intelligence', icon: Network },
  { id: 'meridian' as const, label: 'Meridian', sublabel: 'Governance', icon: Scale },
];

function PlatformSidebar() {
  const { state } = useSidebar();
  const { activeModule, setActiveModule } = usePlatform();
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

function PlatformContent() {
  const { activeModule, selectedEntityId, selectEntity } = usePlatform();
  const [nauticaView, setNauticaView] = useState<NauticaView>('graph');
  const [showEntityPanel, setShowEntityPanel] = useState(true);
  
  // Initialize realtime alerts
  const { createAlert } = useRealtimeAlerts();
  
  // Initialize keyboard shortcuts
  usePlatformKeyboard({
    onToggleEntityPanel: () => setShowEntityPanel(prev => !prev),
  });

  const getModuleTitle = () => {
    switch (activeModule) {
      case 'maris': return { title: 'Evidence Ingestion', subtitle: 'Document processing & chain-of-custody' };
      case 'nautica': return { title: 'Fraud Network Analysis', subtitle: nauticaView === 'graph' ? 'Entity resolution & integrity verification' : 'OSINT & social intelligence' };
      case 'meridian': return { title: 'Policy Governance', subtitle: 'Compliance & decision workflows' };
    }
  };

  const handleTriggerDemoAlert = () => {
    const alertTypes = [
      { 
        alert_type: 'fraud_pattern', 
        severity: 'critical' as const, 
        title: 'New Fraud Pattern Detected', 
        message: 'Visa mill pattern identified: 12 applications share document hashes',
        entity_id: 'app-rezaee',
      },
      { 
        alert_type: 'risk_escalation', 
        severity: 'high' as const, 
        title: 'Risk Score Escalated', 
        message: 'Entity Ahmad Rezaee risk increased to 94 due to network connections',
        entity_id: 'app-rezaee',
      },
      { 
        alert_type: 'document_anomaly', 
        severity: 'medium' as const, 
        title: 'Document Timestamp Anomaly', 
        message: 'Employment letter creation date precedes employer registration',
      },
    ];
    const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    createAlert(randomAlert);
  };

  const moduleInfo = getModuleTitle();

  return (
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
        
        <div className="flex items-center gap-2">
          {/* Unified Command Palette */}
          <UnifiedCommandPalette />
          
          {/* Demo Alert Trigger */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={handleTriggerDemoAlert}
                className="p-2 hover:bg-accent/20 rounded transition-colors group"
              >
                <Zap className="w-4 h-4 text-accent group-hover:text-accent" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Trigger demo alert</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Keyboard Shortcuts */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="p-2 hover:bg-secondary rounded transition-colors">
                <Keyboard className="w-4 h-4 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48">
              <p className="text-xs font-medium mb-2">Keyboard Shortcuts</p>
              <KeyboardShortcutHints />
            </PopoverContent>
          </Popover>
          
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
                    onNodeSelect={(nodeId) => selectEntity(nodeId)} 
                    selectedNode={selectedEntityId}
                  />
                </div>
                {showEntityPanel && (
                  <div className="w-96 border-l border-border bg-surface-elevated flex flex-col">
                    <AlertPanel />
                    <EntityDossier />
                  </div>
                )}
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
  );
}

export default function Platform() {
  return (
    <div className="dark">
      <PlatformProvider defaultModule="nautica">
        <SidebarProvider defaultOpen={true}>
          <div className="min-h-screen flex w-full bg-background text-foreground">
            <PlatformSidebar />
            <PlatformContent />
          </div>
        </SidebarProvider>
      </PlatformProvider>
    </div>
  );
}
