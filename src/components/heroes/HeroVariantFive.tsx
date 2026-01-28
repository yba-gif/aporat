import { Button } from '@/components/ui/button';

// Stark Minimal #5 — Full bleed typography, right-aligned
export function HeroVariantFive() {
  return (
    <section className="relative min-h-screen flex items-center bg-background overflow-hidden">
      {/* Large background text */}
      <div className="absolute inset-0 flex items-center justify-end pointer-events-none select-none overflow-hidden">
        <div className="text-[20vw] font-semibold tracking-tighter text-foreground/[0.03] leading-none -mr-[5vw]">
          AUDIT
        </div>
      </div>
      
      <div className="container-wide relative z-10">
        <div className="max-w-3xl ml-auto text-right">
          <div className="w-16 h-px bg-accent mb-12 ml-auto" />
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[0.95] mb-8">
            Every document traced.
            <br />
            <span className="text-muted-foreground">Every decision logged.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            Compliance infrastructure for organizations where accountability is non-negotiable.
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
    </section>
  );
}
