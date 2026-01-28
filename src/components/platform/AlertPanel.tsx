import { AlertTriangle, Clock, ChevronRight } from 'lucide-react';

const alerts = [
  {
    id: 1,
    severity: 'critical',
    title: 'Visa mill pattern detected',
    description: '8 applicants linked via identical bank statement hashes',
    time: '2m ago',
  },
  {
    id: 2,
    severity: 'high',
    title: 'Agent flagged for review',
    description: 'Apex Travel Agency linked to coordinated applications',
    time: '5m ago',
  },
  {
    id: 3,
    severity: 'medium',
    title: 'Document hash collision',
    description: 'Same financial document submitted across 4 consulates',
    time: '12m ago',
  },
];

export function AlertPanel() {
  return (
    <div className="border-b border-border">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <span className="text-sm font-medium">Active Alerts</span>
          <span className="px-1.5 py-0.5 text-[10px] font-mono bg-destructive/10 text-destructive rounded">
            {alerts.length}
          </span>
        </div>
        <button className="text-xs text-accent hover:underline">View all</button>
      </div>
      
      <div className="max-h-48 overflow-y-auto">
        {alerts.map((alert) => (
          <div 
            key={alert.id}
            className="p-3 border-b border-border/50 hover:bg-secondary/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  alert.severity === 'critical' 
                    ? 'bg-destructive animate-pulse' 
                    : alert.severity === 'high' 
                      ? 'bg-orange-500' 
                      : 'bg-yellow-500'
                }`} />
                <span className="text-xs font-medium">{alert.title}</span>
              </div>
              <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-[11px] text-muted-foreground mb-1 pl-4">
              {alert.description}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground pl-4">
              <Clock className="w-3 h-3" />
              <span>{alert.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
