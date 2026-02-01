import { useState } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  Activity, 
  Users, 
  FileText, 
  Network,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  CheckCircle2,
  XCircle,
  Zap,
  Globe,
  Database
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  time: string;
  source: string;
}

interface Metric {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
}

const LIVE_ALERTS: Alert[] = [
  { id: '1', type: 'critical', title: 'Ring detected: 12 linked applicants via ABC Travel', time: '2m ago', source: 'Nautica' },
  { id: '2', type: 'critical', title: 'Document hash mismatch: Passport TR-8847291', time: '5m ago', source: 'Maris' },
  { id: '3', type: 'warning', title: 'Volume spike: Istanbul consulate +340%', time: '12m ago', source: 'Meridian' },
  { id: '4', type: 'warning', title: 'Social flag: LinkedIn profile anomaly detected', time: '18m ago', source: 'Nautica' },
  { id: '5', type: 'info', title: 'Policy rule updated: High-risk network threshold', time: '24m ago', source: 'Meridian' },
];

const METRICS: Metric[] = [
  { label: 'Applications Today', value: '2,847', change: 12.4, trend: 'up' },
  { label: 'Flagged', value: '127', change: -8.2, trend: 'down' },
  { label: 'Auto-Approved', value: '2,412', change: 15.1, trend: 'up' },
  { label: 'Pending Review', value: '308', change: 4.3, trend: 'up' },
];

export function AlternativeCommandCenter() {
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);

  return (
    <div className="h-full flex bg-background">
      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-12 grid-rows-6 gap-px bg-border p-px">
        {/* Top Stats Bar */}
        <div className="col-span-12 row-span-1 bg-surface-elevated flex items-center justify-between px-6">
          <div className="flex items-center gap-8">
            {METRICS.map((metric) => (
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
            <span className="text-xs text-muted-foreground font-mono">15:42:33 UTC</span>
          </div>
        </div>

        {/* Network Visualization */}
        <div className="col-span-8 row-span-4 bg-surface-elevated relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="absolute top-4 left-4 z-10">
            <div className="flex items-center gap-2 mb-2">
              <Network className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Live Network View</span>
            </div>
            <p className="text-xs text-muted-foreground">847 entities • 1,294 connections</p>
          </div>
          
          {/* Simulated Network Graph */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 400">
            {/* Connections */}
            <g stroke="hsl(174 62% 45% / 0.3)" strokeWidth="1">
              <line x1="400" y1="200" x2="250" y2="120" />
              <line x1="400" y1="200" x2="550" y2="120" />
              <line x1="400" y1="200" x2="200" y2="280" />
              <line x1="400" y1="200" x2="600" y2="280" />
              <line x1="250" y1="120" x2="150" y2="80" />
              <line x1="250" y1="120" x2="180" y2="180" />
              <line x1="550" y1="120" x2="650" y2="80" />
              <line x1="550" y1="120" x2="620" y2="180" />
              <line x1="200" y1="280" x2="100" y2="320" />
              <line x1="200" y1="280" x2="280" y2="350" />
              <line x1="600" y1="280" x2="700" y2="320" />
              <line x1="600" y1="280" x2="520" y2="350" />
            </g>
            
            {/* Nodes */}
            <g>
              {/* Central Hub */}
              <circle cx="400" cy="200" r="16" fill="hsl(174 62% 45%)" />
              <circle cx="400" cy="200" r="24" fill="none" stroke="hsl(174 62% 45% / 0.3)" strokeWidth="2" />
              
              {/* Agency nodes */}
              <circle cx="250" cy="120" r="12" fill="hsl(199 89% 48%)" />
              <circle cx="550" cy="120" r="12" fill="hsl(199 89% 48%)" />
              
              {/* Flagged agency */}
              <circle cx="200" cy="280" r="12" fill="hsl(0 84% 60%)" />
              <circle cx="200" cy="280" r="18" fill="none" stroke="hsl(0 84% 60%)" strokeWidth="2" strokeDasharray="4 2" />
              
              <circle cx="600" cy="280" r="12" fill="hsl(199 89% 48%)" />
              
              {/* Applicant nodes */}
              <circle cx="150" cy="80" r="8" fill="hsl(262 83% 58%)" />
              <circle cx="180" cy="180" r="8" fill="hsl(262 83% 58%)" />
              <circle cx="650" cy="80" r="8" fill="hsl(262 83% 58%)" />
              <circle cx="620" cy="180" r="8" fill="hsl(262 83% 58%)" />
              <circle cx="100" cy="320" r="8" fill="hsl(262 83% 58%)" />
              <circle cx="280" cy="350" r="8" fill="hsl(262 83% 58%)" />
              <circle cx="700" cy="320" r="8" fill="hsl(262 83% 58%)" />
              <circle cx="520" cy="350" r="8" fill="hsl(262 83% 58%)" />
            </g>
          </svg>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[hsl(262_83%_58%)]" />
              <span className="text-muted-foreground">Applicant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[hsl(199_89%_48%)]" />
              <span className="text-muted-foreground">Agency</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-muted-foreground">Flagged</span>
            </div>
          </div>
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
                className={`p-4 border-b border-border cursor-pointer transition-colors ${
                  selectedAlert === alert.id ? 'bg-secondary' : 'hover:bg-secondary/50'
                }`}
                onClick={() => setSelectedAlert(alert.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 mt-1.5 rounded-full ${
                    alert.type === 'critical' ? 'bg-destructive' :
                    alert.type === 'warning' ? 'bg-yellow-500' :
                    'bg-accent'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{alert.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{alert.time}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-accent">{alert.source}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module Status */}
        <div className="col-span-4 row-span-1 bg-surface-elevated flex items-center justify-around">
          {[
            { name: 'Maris', icon: Database, status: 'operational', load: 42 },
            { name: 'Nautica', icon: Network, status: 'operational', load: 78 },
            { name: 'Meridian', icon: Shield, status: 'operational', load: 35 },
          ].map((module) => (
            <div key={module.name} className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <module.icon className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">{module.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={module.load} className="w-16 h-1.5" />
                <span className="text-xs text-muted-foreground">{module.load}%</span>
              </div>
            </div>
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
            <div className="flex gap-1">
              {['Istanbul', 'Ankara', 'Izmir', 'Berlin', 'London'].map((city, i) => (
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
