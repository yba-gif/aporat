import { Button } from '@/components/ui/button';

// Stark Minimal #4 — Editorial layout with stats
export function HeroVariantFour() {
  return (
    <section className="relative min-h-screen flex items-center bg-background">
      <div className="container-wide">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main headline */}
          <div className="lg:col-span-8">
            <p className="text-xs font-mono tracking-[0.2em] text-muted-foreground mb-6 uppercase">
              Decision Infrastructure
            </p>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tight leading-[0.95] mb-8">
              We build the systems that make critical decisions auditable.
            </h1>

            <Button
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 text-base px-8 h-12"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Request demo
            </Button>
          </div>
          
          {/* Side metrics */}
          <div className="lg:col-span-4 flex flex-col justify-end">
            <div className="space-y-8 border-l border-border pl-6">
              <div>
                <div className="text-3xl font-semibold mb-1">99.7%</div>
                <div className="text-sm text-muted-foreground">Document verification accuracy</div>
              </div>
              <div>
                <div className="text-3xl font-semibold mb-1">&lt;200ms</div>
                <div className="text-sm text-muted-foreground">Policy enforcement latency</div>
              </div>
              <div>
                <div className="text-3xl font-semibold mb-1">SOC 2</div>
                <div className="text-sm text-muted-foreground">Type II certified</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
