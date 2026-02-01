import { useState, useEffect, useCallback } from 'react';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Globe,
  Database,
  Network,
  Shield,
  ChevronRight,
  Loader2,
  Users,
  Building,
  MapPin
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { CommandCenterGraph, GraphNode } from './CommandCenterGraph';
import { EntityQuickView } from './EntityQuickView';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  time: string;
  source: 'Maris' | 'Nautica' | 'Meridian';
}

interface Metric {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
}

interface GraphLink {
  source: string;
  target: string;
  edgeType: string;
}

interface CommandCenterViewProps {
  onNavigate: (module: 'command' | 'maris' | 'nautica' | 'meridian') => void;
}

const LIVE_ALERTS: Alert[] = [
  { id: '1', type: 'critical', title: 'Ring detected: 12 linked applicants via ABC Travel', time: '2m ago', source: 'Nautica' },
  { id: '2', type: 'critical', title: 'Document hash mismatch: Passport TR-8847291', time: '5m ago', source: 'Maris' },
  { id: '3', type: 'warning', title: 'Volume spike: Istanbul consulate +340%', time: '12m ago', source: 'Meridian' },
  { id: '4', type: 'warning', title: 'Social flag: LinkedIn profile anomaly detected', time: '18m ago', source: 'Nautica' },
  { id: '5', type: 'info', title: 'Policy rule updated: High-risk network threshold', time: '24m ago', source: 'Meridian' },
];

export function CommandCenterView({ onNavigate }: CommandCenterViewProps) {
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch real data from Supabase
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [nodesRes, edgesRes] = await Promise.all([
        supabase.from('demo_fraud_nodes').select('*'),
        supabase.from('demo_fraud_edges').select('*'),
      ]);

      if (nodesRes.data && edgesRes.data) {
        const nodes: GraphNode[] = nodesRes.data.map((n) => ({
          id: n.node_id,
          label: n.label,
          nodeType: n.node_type as GraphNode['nodeType'],
          flagged: n.flagged || false,
          riskScore: n.risk_score || 0,
        }));

        const links: GraphLink[] = edgesRes.data.map((e) => ({
          source: e.source_node_id,
          target: e.target_node_id,
          edgeType: e.edge_type,
        }));

        setGraphData({ nodes, links });
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  // Update clock
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate real metrics from data
  const metrics: Metric[] = [
    { 
      label: 'Entities', 
      value: graphData.nodes.length.toString(), 
      change: 12.4, 
      trend: 'up' 
    },
    { 
      label: 'Flagged', 
      value: graphData.nodes.filter(n => n.flagged).length.toString(), 
      change: -8.2, 
      trend: 'down' 
    },
    { 
      label: 'Connections', 
      value: graphData.links.length.toString(), 
      change: 15.1, 
      trend: 'up' 
    },
    { 
      label: 'High Risk', 
      value: graphData.nodes.filter(n => n.riskScore > 70).length.toString(), 
      change: 4.3, 
      trend: 'up' 
    },
  ];

  // Node type counts
  const nodeCounts = {
    applicant: graphData.nodes.filter(n => n.nodeType === 'applicant').length,
    agent: graphData.nodes.filter(n => n.nodeType === 'agent').length,
    company: graphData.nodes.filter(n => n.nodeType === 'company').length,
    address: graphData.nodes.filter(n => n.nodeType === 'address').length,
  };

  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert.id);
    // Navigate to relevant module
    if (alert.source === 'Maris') onNavigate('maris');
    else if (alert.source === 'Nautica') onNavigate('nautica');
    else if (alert.source === 'Meridian') onNavigate('meridian');
  };

  return (
    <div className="h-full flex bg-background">
      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-12 grid-rows-6 gap-px bg-border p-px">
        {/* Top Stats Bar */}
        <div className="col-span-12 row-span-1 bg-surface-elevated flex items-center justify-between px-6">
          <div className="flex items-center gap-8">
            {metrics.map((metric) => (
              <div key={metric.label} className="flex items-center gap-4">
                <div>
                  <p className="text-2xl font-semibold font-mono">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                </div>
                <div className={`flex items-center gap-1 text-xs ${metric.trend === 'up' ? 'text-accent' : 'text-destructive'}`}>
                  {metric.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(metric.change)}%
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-xs text-accent font-medium">LIVE</span>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {currentTime.toLocaleTimeString('en-US', { hour12: false })} UTC
            </span>
          </div>
        </div>

        {/* Network Visualization */}
        <div className="col-span-8 row-span-4 bg-surface-elevated relative overflow-hidden">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="absolute inset-0 bg-grid opacity-30" />
              <div className="absolute top-4 left-4 z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Network className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">Live Network View</span>
                  <button 
                    onClick={() => onNavigate('nautica')}
                    className="ml-2 text-xs text-accent hover:underline flex items-center gap-1"
                  >
                    Full View <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {graphData.nodes.length} entities • {graphData.links.length} connections
                </p>
              </div>
              
              <CommandCenterGraph 
                nodes={graphData.nodes} 
                links={graphData.links} 
                onNodeClick={setSelectedNode}
                selectedNodeId={selectedNode?.id}
              />

              {/* Entity Quick View Panel */}
              {selectedNode && (
                <EntityQuickView
                  node={selectedNode}
                  links={graphData.links}
                  allNodes={graphData.nodes}
                  onClose={() => setSelectedNode(null)}
                  onNavigateToNautica={() => onNavigate('nautica')}
                />
              )}

              {/* Legend */}
              <div className="absolute bottom-4 left-4 flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3 text-[#8b5cf6]" />
                  <span className="text-muted-foreground">Applicants ({nodeCounts.applicant})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-3 h-3 text-[#0d9488]" />
                  <span className="text-muted-foreground">Agencies ({nodeCounts.agent})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-3 h-3 text-[#3b82f6]" />
                  <span className="text-muted-foreground">Companies ({nodeCounts.company})</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-[#f59e0b]" />
                  <span className="text-muted-foreground">Addresses ({nodeCounts.address})</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Alert Feed */}
        <div className="col-span-4 row-span-4 bg-surface-elevated flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium">Live Alerts</span>
            </div>
            <span className="text-xs text-muted-foreground">{LIVE_ALERTS.length} active</span>
          </div>
          <div className="flex-1 overflow-auto">
            {LIVE_ALERTS.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 border-b border-border cursor-pointer transition-colors group ${
                  selectedAlert === alert.id ? 'bg-secondary' : 'hover:bg-secondary/50'
                }`}
                onClick={() => handleAlertClick(alert)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                    alert.type === 'critical' ? 'bg-destructive animate-pulse' :
                    alert.type === 'warning' ? 'bg-yellow-500' :
                    'bg-accent'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{alert.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{alert.time}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className={`text-xs ${
                        alert.source === 'Maris' ? 'text-blue-400' :
                        alert.source === 'Nautica' ? 'text-purple-400' :
                        'text-accent'
                      }`}>{alert.source}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module Status */}
        <div className="col-span-4 row-span-1 bg-surface-elevated flex items-center justify-around">
          {[
            { name: 'Maris', icon: Database, status: 'operational', load: 42, module: 'maris' as const },
            { name: 'Nautica', icon: Network, status: 'operational', load: 78, module: 'nautica' as const },
            { name: 'Meridian', icon: Shield, status: 'operational', load: 35, module: 'meridian' as const },
          ].map((mod) => (
            <button 
              key={mod.name} 
              className="text-center p-2 rounded hover:bg-secondary/50 transition-colors"
              onClick={() => onNavigate(mod.module)}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <mod.icon className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">{mod.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={mod.load} className="w-16 h-1.5" />
                <span className="text-xs text-muted-foreground">{mod.load}%</span>
              </div>
            </button>
          ))}
        </div>

        {/* Recent Decisions */}
        <div className="col-span-4 row-span-1 bg-surface-elevated flex items-center px-6">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-2">Recent Decisions</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span className="text-sm font-mono">2,412</span>
                <span className="text-xs text-muted-foreground">approved</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm font-mono">127</span>
                <span className="text-xs text-muted-foreground">rejected</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-mono">308</span>
                <span className="text-xs text-muted-foreground">pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Coverage */}
        <div className="col-span-4 row-span-1 bg-surface-elevated flex items-center px-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-accent" />
                <span className="text-xs text-muted-foreground">Active Consulates</span>
              </div>
              <span className="text-sm font-mono">47</span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {['Istanbul', 'Ankara', 'Izmir', 'Berlin', 'London'].map((city) => (
                <span key={city} className="px-2 py-1 bg-secondary rounded text-[10px]">{city}</span>
              ))}
              <span className="px-2 py-1 bg-secondary rounded text-[10px] text-muted-foreground">+42</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
