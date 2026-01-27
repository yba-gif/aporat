import { useState } from 'react';
import { Database, Compass, Cpu, ArrowRight, Layers, GitBranch, Shield } from 'lucide-react';

interface PlatformNode {
  id: string;
  name: string;
  subtitle: string;
  icon: typeof Database;
  layer: string;
  comparable: string;
}

const platforms: PlatformNode[] = [
  {
    id: 'maris',
    name: 'Maris',
    subtitle: 'Data Fabric',
    icon: Database,
    layer: 'Integration',
    comparable: 'Foundry',
  },
  {
    id: 'nautica',
    name: 'Nautica',
    subtitle: 'Intelligence',
    icon: Compass,
    layer: 'Analysis',
    comparable: 'Gotham',
  },
  {
    id: 'meridian',
    name: 'Meridian',
    subtitle: 'Governance',
    icon: Cpu,
    layer: 'Operations',
    comparable: 'Apollo',
  },
];

const dataFlowSteps = [
  { label: 'Ingest', description: 'Documents, signals, APIs' },
  { label: 'Normalize', description: 'Schema unification' },
  { label: 'Resolve', description: 'Entity mapping' },
  { label: 'Score', description: 'Risk computation' },
  { label: 'Enforce', description: 'Policy execution' },
  { label: 'Audit', description: 'Decision logging' },
];

export function ArchitectureDiagram() {
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Trigger animation completion after mount
  useState(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 2000);
    return () => clearTimeout(timer);
  });

  return (
    <div className="py-16 border-t border-border bg-background">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-label mb-3">Architecture</p>
          <h3 className="text-xl md:text-2xl font-semibold mb-2">
            End-to-end decision infrastructure
          </h3>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Three platforms operating as one system. From raw data to auditable decisions.
          </p>
        </div>

        {/* Main Diagram */}
        <div className="relative">
          {/* Background grid */}
          <div className="absolute inset-0 bg-grid opacity-30" />

          {/* Platform Flow */}
          <div className="relative z-10 py-8">
            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
              <defs>
                <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              
              {/* Animated flow line */}
              <line
                x1="20%"
                y1="50%"
                x2="80%"
                y2="50%"
                stroke="url(#flowGradient)"
                strokeWidth="2"
                strokeDasharray="8 4"
                className={animationComplete ? 'animate-pulse-subtle' : ''}
              />
            </svg>

            {/* Platform Cards */}
            <div className="grid md:grid-cols-3 gap-6 md:gap-8 relative z-10">
              {platforms.map((platform, index) => {
                const Icon = platform.icon;
                const isHovered = hoveredPlatform === platform.id;

                return (
                  <div key={platform.id} className="relative">
                    {/* Arrow between cards */}
                    {index < platforms.length - 1 && (
                      <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20">
                        <ArrowRight className="w-4 h-4 text-accent" />
                      </div>
                    )}

                    <div
                      className={`group relative p-6 border transition-all duration-300 cursor-pointer ${
                        isHovered
                          ? 'border-accent bg-surface-elevated shadow-lg shadow-accent/5'
                          : 'border-border bg-background hover:border-line-strong'
                      }`}
                      onMouseEnter={() => setHoveredPlatform(platform.id)}
                      onMouseLeave={() => setHoveredPlatform(null)}
                    >
                      {/* Corner accents */}
                      <div className={`absolute -top-px -left-px w-3 h-3 border-t border-l transition-colors ${isHovered ? 'border-accent' : 'border-transparent'}`} />
                      <div className={`absolute -top-px -right-px w-3 h-3 border-t border-r transition-colors ${isHovered ? 'border-accent' : 'border-transparent'}`} />
                      <div className={`absolute -bottom-px -left-px w-3 h-3 border-b border-l transition-colors ${isHovered ? 'border-accent' : 'border-transparent'}`} />
                      <div className={`absolute -bottom-px -right-px w-3 h-3 border-b border-r transition-colors ${isHovered ? 'border-accent' : 'border-transparent'}`} />

                      {/* Layer indicator */}
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                          {platform.layer}
                        </span>
                      </div>

                      {/* Icon */}
                      <div className={`w-10 h-10 border flex items-center justify-center mb-4 transition-colors ${
                        isHovered ? 'border-accent bg-accent/10' : 'border-border bg-secondary'
                      }`}>
                        <Icon className={`w-5 h-5 transition-colors ${isHovered ? 'text-accent' : 'text-muted-foreground'}`} />
                      </div>

                      {/* Content */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-lg mb-1">
                          Portolan {platform.name}
                        </h4>
                        <p className="text-sm text-muted-foreground font-mono">
                          {platform.subtitle}
                        </p>
                      </div>

                      {/* Comparison badge */}
                      <div className="flex items-center gap-2 pt-4 border-t border-border/50">
                        <Layers className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] font-mono text-muted-foreground">
                          Comparable to {platform.comparable}
                        </span>
                      </div>

                      {/* Animated pulse dot */}
                      <div className={`absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent transition-opacity ${
                        isHovered ? 'opacity-100 animate-pulse' : 'opacity-0'
                      }`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Data Flow Steps */}
          <div className="relative z-10 mt-12 pt-8 border-t border-border/50">
            <div className="flex items-center gap-2 mb-6">
              <GitBranch className="w-4 h-4 text-accent" />
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Data Pipeline
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {dataFlowSteps.map((step, index) => (
                <div
                  key={step.label}
                  className="group relative p-3 border border-border/50 bg-surface-elevated/50 hover:border-accent/50 transition-colors"
                >
                  {/* Step number */}
                  <div className="absolute -top-2 -left-2 w-5 h-5 bg-background border border-border flex items-center justify-center">
                    <span className="text-[10px] font-mono text-accent">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <p className="text-xs font-semibold mb-1 mt-1">{step.label}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom comparison note */}
          <div className="relative z-10 mt-8 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <Shield className="w-3 h-3" />
            <span className="font-mono">
              Vertical Palantir for cross-border mobility compliance
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
