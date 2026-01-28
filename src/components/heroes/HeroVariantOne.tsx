import { Button } from '@/components/ui/button';

const stages = [
  { label: 'Ingest', progress: 100 },
  { label: 'Normalize', progress: 85 },
  { label: 'Verify', progress: 60 },
  { label: 'Resolve', progress: 35 },
];

// Signal Flow — Horizontal signal bars showing verification stages
export function HeroVariantOne() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-12 md:pb-0">
      <div className="absolute inset-0 bg-grid-fade pointer-events-none" />
      
      <div className="container-wide relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-display mb-6 animate-fade-up">
              Decision infrastructure
              <br />
              <span className="text-muted-foreground">for critical operations.</span>
            </h1>
            
            <p className="text-lg md:text-subhead mb-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
              Unified evidence. Verified integrity. Audit-ready outcomes.
            </p>

            <div className="mb-8 animate-fade-up" style={{ animationDelay: '200ms' }}>
              <Button
                size="lg"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-foreground text-background hover:bg-foreground/90 px-6"
              >
                Request demo
              </Button>
            </div>

            <p className="text-sm text-muted-foreground animate-fade-up" style={{ animationDelay: '300ms' }}>
              Audit-grade logs · Explainable checks · Policy rulesets
            </p>
          </div>

          {/* Right: Signal Flow Visualization */}
          <div className="relative h-[350px] md:h-[400px] animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="absolute inset-0 flex flex-col justify-center gap-6 px-4">
              {stages.map((stage, index) => (
                <div 
                  key={stage.label} 
                  className="animate-fade-up"
                  style={{ animationDelay: `${400 + index * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono tracking-wider text-muted-foreground uppercase">
                      {stage.label}
                    </span>
                    <span className="text-xs font-mono text-accent">
                      {stage.progress}%
                    </span>
                  </div>
                  <div className="h-8 bg-secondary border border-border relative overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent/20 to-accent/40"
                      style={{ width: `${stage.progress}%` }}
                    />
                    <div 
                      className="absolute inset-y-0 left-0 w-1 bg-accent animate-pulse-soft"
                      style={{ 
                        left: `${stage.progress}%`,
                        transform: 'translateX(-50%)'
                      }}
                    />
                  </div>
                </div>
              ))}
              
              {/* Status indicator */}
              <div className="flex items-center gap-2 mt-4 animate-fade-up" style={{ animationDelay: '800ms' }}>
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse-soft" />
                <span className="text-xs font-mono text-muted-foreground">Processing pipeline active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
