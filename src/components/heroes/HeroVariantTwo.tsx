import { Button } from '@/components/ui/button';

// Stark Minimal #2 — Centered, single word emphasis
export function HeroVariantTwo() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-5xl px-6">
        <p className="text-xs font-mono tracking-[0.3em] text-muted-foreground mb-8 uppercase">
          Mobility Compliance Infrastructure
        </p>
        
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-semibold tracking-tight leading-[0.9] mb-4">
          Evidence.
        </h1>
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-semibold tracking-tight leading-[0.9] text-muted-foreground/40 mb-4">
          Integrity.
        </h1>
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-semibold tracking-tight leading-[0.9] text-muted-foreground/20 mb-16">
          Audit.
        </h1>

        <Button
          size="lg"
          className="bg-foreground text-background hover:bg-foreground/90 text-base px-8 h-12"
          onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Request demo
        </Button>
      </div>
    </section>
  );
}
