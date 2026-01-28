import { Button } from '@/components/ui/button';

// Stark Minimal #1 — Pure typography, single accent line
export function HeroVariantOne() {
  return (
    <section className="relative min-h-screen flex items-center bg-background">
      <div className="container-wide">
        <div className="max-w-4xl">
          {/* Accent line */}
          <div className="w-16 h-px bg-accent mb-12" />
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-[0.95] mb-8">
            Decisions that
            <br />
            hold up in court.
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mb-12 leading-relaxed">
            Infrastructure for evidence integrity, policy enforcement, and audit-grade resolution.
          </p>

          <Button
            size="lg"
            className="bg-foreground text-background hover:bg-foreground/90 text-base px-8 h-12"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Request demo
          </Button>
        </div>
      </div>
      
      {/* Minimal corner mark */}
      <div className="absolute bottom-12 right-12 hidden lg:block">
        <div className="text-xs font-mono text-muted-foreground/50 tracking-wider">
          PORTOLAN LABS
        </div>
      </div>
    </section>
  );
}
