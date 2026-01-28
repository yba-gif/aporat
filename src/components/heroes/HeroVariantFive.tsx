import { Button } from '@/components/ui/button';
import { useEffect, useState, useCallback } from 'react';

// The Intelligence Mesh - Dynamic network topology
interface NetworkNode {
  id: string;
  x: number;
  y: number;
  type: 'source' | 'processor' | 'output';
  label: string;
}

interface Connection {
  from: string;
  to: string;
}

const nodes: NetworkNode[] = [
  { id: 'doc1', x: 10, y: 25, type: 'source', label: 'DOC' },
  { id: 'doc2', x: 10, y: 50, type: 'source', label: 'DOC' },
  { id: 'doc3', x: 10, y: 75, type: 'source', label: 'DOC' },
  { id: 'proc1', x: 35, y: 35, type: 'processor', label: 'PARSE' },
  { id: 'proc2', x: 35, y: 65, type: 'processor', label: 'PARSE' },
  { id: 'verify', x: 55, y: 50, type: 'processor', label: 'VERIFY' },
  { id: 'score', x: 75, y: 40, type: 'processor', label: 'SCORE' },
  { id: 'policy', x: 75, y: 60, type: 'processor', label: 'POLICY' },
  { id: 'decision', x: 92, y: 50, type: 'output', label: 'OUT' },
];

const connections: Connection[] = [
  { from: 'doc1', to: 'proc1' },
  { from: 'doc2', to: 'proc1' },
  { from: 'doc2', to: 'proc2' },
  { from: 'doc3', to: 'proc2' },
  { from: 'proc1', to: 'verify' },
  { from: 'proc2', to: 'verify' },
  { from: 'verify', to: 'score' },
  { from: 'verify', to: 'policy' },
  { from: 'score', to: 'decision' },
  { from: 'policy', to: 'decision' },
];

export function HeroVariantFive() {
  const [activeConnections, setActiveConnections] = useState<number[]>([]);
  const [pulsingNodes, setPulsingNodes] = useState<string[]>([]);

  const getNode = useCallback((id: string) => nodes.find(n => n.id === id), []);

  useEffect(() => {
    let connectionIndex = 0;
    
    const interval = setInterval(() => {
      const conn = connections[connectionIndex];
      setActiveConnections(prev => [...prev.slice(-4), connectionIndex]);
      setPulsingNodes([conn.from, conn.to]);
      
      connectionIndex = (connectionIndex + 1) % connections.length;
      if (connectionIndex === 0) {
        setActiveConnections([]);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background">
      {/* Network Mesh Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-60">
        <svg className="w-full h-full max-w-6xl" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {/* Connections */}
          {connections.map((conn, i) => {
            const from = getNode(conn.from);
            const to = getNode(conn.to);
            if (!from || !to) return null;
            
            const isActive = activeConnections.includes(i);
            
            return (
              <g key={`${conn.from}-${conn.to}`}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="hsl(var(--border))"
                  strokeWidth="0.15"
                />
                {isActive && (
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="hsl(var(--accent))"
                    strokeWidth="0.3"
                    filter="url(#glow)"
                    className="animate-fade-in"
                  />
                )}
              </g>
            );
          })}
          
          {/* Nodes */}
          {nodes.map(node => {
            const isPulsing = pulsingNodes.includes(node.id);
            const size = node.type === 'output' ? 4 : node.type === 'processor' ? 3 : 2;
            
            return (
              <g key={node.id}>
                {isPulsing && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={size + 2}
                    fill="hsl(var(--accent))"
                    opacity="0.2"
                    className="animate-ping"
                  />
                )}
                <rect
                  x={node.x - size/2}
                  y={node.y - size/2}
                  width={size}
                  height={size}
                  fill={isPulsing ? "hsl(var(--accent))" : "hsl(var(--muted-foreground))"}
                  className="transition-all duration-200"
                />
                {node.type === 'output' && (
                  <rect
                    x={node.x - size/2 - 0.5}
                    y={node.y - size/2 - 0.5}
                    width={size + 1}
                    height={size + 1}
                    fill="none"
                    stroke="hsl(var(--accent))"
                    strokeWidth="0.3"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Content */}
      <div className="container-wide relative z-10">
        <div className="max-w-xl ml-auto text-right">
          <p className="text-label mb-4 animate-fade-up">Intelligence Synthesis</p>
          <h1 className="text-display mb-6 animate-fade-up delay-100">
            Raw signals.
            <br />
            <span className="text-muted-foreground">Clear resolution.</span>
          </h1>
          <p className="text-subhead mb-8 animate-fade-up delay-200">
            Transform fragmented data streams into actionable intelligence.
          </p>
          <Button
            size="lg"
            className="bg-foreground text-background hover:bg-foreground/90 animate-fade-up delay-300"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Request demo
          </Button>
        </div>
      </div>
      
      {/* Status indicator */}
      <div className="absolute bottom-8 left-8 flex items-center gap-3 animate-fade-in delay-500">
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse-soft" />
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          Processing active
        </span>
      </div>
    </section>
  );
}
