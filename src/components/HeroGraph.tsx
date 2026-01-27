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
  { id: 'identity', label: 'Identity', description: 'Verified applicant identity and credentials', x: 50, y: 120 },
  { id: 'evidence', label: 'Evidence', description: 'Standardized document collection and validation', x: 180, y: 60 },
  { id: 'integrity', label: 'Integrity', description: 'Anomaly detection and risk scoring', x: 310, y: 120 },
  { id: 'policy', label: 'Policy', description: 'Configurable compliance rulesets', x: 440, y: 60 },
  { id: 'decision', label: 'Decision', description: 'Audit-grade workflow resolution', x: 570, y: 120 },
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
    <div className="relative w-full h-full min-h-[400px] md:min-h-[450px]">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid opacity-50" />
      
      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 640 200">
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
                x1={from.x + 40}
                y1={from.y + 20}
                x2={to.x}
                y2={to.y + 20}
                stroke="hsl(var(--line-subtle))"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              {isAnimated && (
                <line
                  x1={from.x + 40}
                  y1={from.y + 20}
                  x2={to.x}
                  y2={to.y + 20}
                  stroke="url(#lineGradient)"
                  strokeWidth="1.5"
                  className="animate-fade-in"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      <div className="absolute inset-0">
        {nodes.map((node, index) => (
          <div
            key={node.id}
            className="absolute animate-fade-up"
            style={{
              left: `${(node.x / 640) * 100}%`,
              top: `${(node.y / 200) * 100}%`,
              animationDelay: `${index * 100}ms`,
            }}
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
                {/* Node indicator */}
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse-soft shrink-0" />
                <span className="text-xs font-medium tracking-wide">{node.label}</span>
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

      {/* Audit Trail Panel - positioned below the graph */}
      <div className="absolute -bottom-4 left-0 w-full md:w-64 bg-surface-elevated/90 backdrop-blur-sm border border-border p-3">
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
  );
}
