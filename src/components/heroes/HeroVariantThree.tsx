import { Button } from '@/components/ui/button';

// Stark Minimal #3 — Split layout, stark contrast
export function HeroVariantThree() {
  return (
    <section className="relative min-h-screen flex items-center bg-background">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-end">
          {/* Left — Large statement */}
          <div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[0.95]">
              The infrastructure
              <br />
              behind the decision.
            </h1>
          </div>
          
          {/* Right — Details */}
          <div className="lg:pb-2">
            <div className="w-12 h-px bg-foreground mb-8" />
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-md">
              When every visa, every credential, every document must be verified and every decision must be defensible.
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
      </div>
    </section>
  );
}
