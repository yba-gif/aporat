import { Button } from '@/components/ui/button';

const checkpoints = [
  { time: '14:31:40', label: 'Workflow initiated', status: 'complete', side: 'left' },
  { time: '14:31:52', label: 'Identity verified', status: 'complete', side: 'right' },
  { time: '14:32:05', label: 'Evidence validated', status: 'complete', side: 'left' },
  { time: '14:32:18', label: 'Policy applied', status: 'active', side: 'right' },
  { time: '—', label: 'Decision rendered', status: 'pending', side: 'left' },
];

// Timeline Spine — Vertical timeline with decision checkpoints
export function HeroVariantThree() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-12 md:pb-0">
      <div className="absolute inset-0 bg-grid-fade pointer-events-none" />
      
      <div className="container-wide relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div className="max-w-xl lg:text-center lg:mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-display mb-6 animate-fade-up">
              Decision infrastructure
              <br />
              <span className="text-muted-foreground">for critical operations.</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
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

            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground animate-fade-up" style={{ animationDelay: '300ms' }}>
              <span>Audit-grade logs</span>
              <span className="w-px h-3 bg-border" />
              <span>Explainable checks</span>
              <span className="w-px h-3 bg-border" />
              <span>Policy rulesets</span>
            </div>
          </div>

          {/* Right: Timeline Spine Visualization */}
          <div className="relative h-[400px] md:h-[450px] animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="absolute inset-0 flex justify-center">
              {/* Central spine */}
              <div className="absolute top-8 bottom-8 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
              
              <div className="relative w-full max-w-xs pt-8 pb-8 flex flex-col justify-between">
                {checkpoints.map((cp, index) => (
                  <div
                    key={index}
                    className={`relative flex items-center gap-4 animate-fade-up ${
                      cp.side === 'right' ? 'flex-row-reverse text-right' : ''
                    }`}
                    style={{ animationDelay: `${400 + index * 120}ms` }}
                  >
                    {/* Checkpoint card */}
                    <div className={`flex-1 ${cp.side === 'right' ? 'pr-4' : 'pl-4'}`}>
                      <div className={`bg-background border p-3 ${
                        cp.status === 'active' ? 'border-accent' : 'border-border'
                      }`}>
                        <div className="text-xs font-mono text-muted-foreground mb-1">{cp.time}</div>
                        <div className="text-sm font-medium">{cp.label}</div>
                      </div>
                    </div>
                    
                    {/* Node on spine */}
                    <div className="absolute left-1/2 -translate-x-1/2 z-10">
                      <div className={`w-3 h-3 rounded-full border-2 ${
                        cp.status === 'complete' 
                          ? 'bg-accent border-accent' 
                          : cp.status === 'active'
                          ? 'bg-background border-accent animate-pulse-soft'
                          : 'bg-background border-border'
                      }`} />
                    </div>
                    
                    {/* Spacer for opposite side */}
                    <div className="flex-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
