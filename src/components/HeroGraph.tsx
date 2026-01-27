import { useState, useEffect } from 'react';

interface Node {
  id: string;
  label: string;
  description: string;
  x: number;
  y: number;
}

interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
}

const nodes: Node[] = [
  { id: 'identity', label: 'Identity', description: 'Verified applicant identity', x: 40, y: 20 },
  { id: 'evidence', label: 'Evidence', description: 'Standardized document validation', x: 180, y: 20 },
  { id: 'integrity', label: 'Integrity', description: 'Anomaly detection and scoring', x: 320, y: 20 },
  { id: 'policy', label: 'Policy', description: 'Configurable compliance rulesets', x: 460, y: 20 },
  { id: 'decision', label: 'Decision', description: 'Audit-grade resolution', x: 600, y: 20 },
];

const connections = [
  { from: 'identity', to: 'evidence' },
  { from: 'evidence', to: 'integrity' },
  { from: 'integrity', to: 'policy' },
  { from: 'policy', to: 'decision' },
];

const auditEvents: AuditEvent[] = [
  { id: '1', timestamp: '14:32:07', action: 'Evidence pack validated', actor: 'system' },
  { id: '2', timestamp: '14:32:05', action: 'Identity verification complete', actor: 'operator' },
  { id: '3', timestamp: '14:31:58', action: 'Document integrity check passed', actor: 'system' },
  { id: '4', timestamp: '14:31:52', action: 'Risk score computed: 0.12', actor: 'system' },
  { id: '5', timestamp: '14:31:45', action: 'Policy ruleset applied', actor: 'system' },
  { id: '6', timestamp: '14:31:40', action: 'Workflow initiated', actor: 'operator' },
];

export function HeroGraph() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [animatedLines, setAnimatedLines] = useState<number>(0);
  const [visibleEvents, setVisibleEvents] = useState<number>(0);

  useEffect(() => {
    // Animate connection lines
    const lineInterval = setInterval(() => {
      setAnimatedLines((prev) => Math.min(prev + 1, connections.length));
    }, 300);

    // Animate audit events
    const eventInterval = setInterval(() => {
      setVisibleEvents((prev) => Math.min(prev + 1, auditEvents.length));
    }, 400);

    return () => {
      clearInterval(lineInterval);
      clearInterval(eventInterval);
    };
  }, []);

  const getNodePosition = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  return (
    <div className="relative w-full h-full min-h-[300px] md:min-h-[400px]">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid opacity-50" />
      
      {/* Mobile: Simplified vertical flow */}
      <div className="md:hidden px-4 py-8 space-y-3">
        {nodes.map((node, index) => (
          <div key={node.id} className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-accent" />
              {index < nodes.length - 1 && (
                <div className="w-px h-6 bg-accent/50" />
              )}
            </div>
            <div className="flex-1 px-3 py-2 bg-background border border-border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">{node.label}</span>
              </div>
            </div>
          </div>
        ))}
        
        {/* Mobile Audit Trail */}
        <div className="mt-6 bg-surface-elevated/90 border border-border p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
            <span className="text-label text-xs">Audit Trail</span>
          </div>
          <div className="space-y-1">
            {auditEvents.slice(0, 3).map((event) => (
              <div key={event.id} className="flex items-start gap-2 text-[10px]">
                <span className="text-muted-foreground font-mono shrink-0">{event.timestamp}</span>
                <span className="text-foreground/80 truncate">{event.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: Full graph visualization */}
      <div className="hidden md:block h-full">
        {/* Connection lines */}
        <svg className="absolute top-0 left-0 w-full h-20" viewBox="0 0 700 60" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--line-strong))" />
              <stop offset="50%" stopColor="hsl(var(--accent))" />
              <stop offset="100%" stopColor="hsl(var(--line-strong))" />
            </linearGradient>
          </defs>
          
          {connections.map((conn, index) => {
            const from = getNodePosition(conn.from);
            const to = getNodePosition(conn.to);
            const isAnimated = index < animatedLines;
            
            return (
              <g key={`${conn.from}-${conn.to}`}>
                <line
                  x1={from.x + 70}
                  y1={30}
                  x2={to.x}
                  y2={30}
                  stroke="hsl(var(--line-subtle))"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                {isAnimated && (
                  <line
                    x1={from.x + 70}
                    y1={30}
                    x2={to.x}
                    y2={30}
                    stroke="url(#lineGradient)"
                    strokeWidth="1.5"
                    className="animate-fade-in"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Nodes - horizontal row */}
        <div className="absolute top-4 left-0 right-0 flex justify-between px-4">
          {nodes.map((node, index) => (
            <div
              key={node.id}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <div
                className={`relative px-3 py-2 bg-background border transition-all duration-200 cursor-pointer ${
                  hoveredNode === node.id
                    ? 'border-accent shadow-lg shadow-accent/10 -translate-y-0.5'
                    : 'border-border hover:border-line-strong'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse-soft shrink-0" />
                  <span className="text-xs font-medium tracking-wide whitespace-nowrap">{node.label}</span>
                </div>
              </div>
              
              {/* Tooltip */}
              {hoveredNode === node.id && (
                <div className="absolute top-full left-0 mt-2 p-2 bg-foreground text-background text-xs max-w-[180px] z-10 animate-fade-in">
                  {node.description}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Audit Trail Panel - positioned at bottom left, clear of nodes */}
        <div className="absolute bottom-4 left-0 w-64 bg-surface-elevated/90 backdrop-blur-sm border border-border p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
            <span className="text-label text-xs">Audit Trail</span>
          </div>
          <div className="space-y-1 max-h-24 overflow-hidden">
            {auditEvents.slice(0, visibleEvents).map((event, index) => (
              <div
                key={event.id}
                className="flex items-start gap-2 text-[10px] animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="text-muted-foreground font-mono shrink-0">{event.timestamp}</span>
                <span className="text-foreground/80 truncate">{event.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
