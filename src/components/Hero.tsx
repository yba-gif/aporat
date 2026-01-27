import { Button } from '@/components/ui/button';
import { HeroGraph } from './HeroGraph';
import { analytics } from '@/lib/analytics';
import { Shield, FileCheck, Settings } from 'lucide-react';

const proofChips = [
  { icon: FileCheck, label: 'Audit-grade logs' },
  { icon: Shield, label: 'Explainable checks' },
  { icon: Settings, label: 'Policy rulesets' },
];

export function Hero() {
  const handleRequestAccess = () => {
    analytics.trackCTA('request_access', 'hero');
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-12 md:pb-0">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid-fade pointer-events-none" />
      
      {/* Subtle radial gradient */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-surface-elevated/50 to-transparent pointer-events-none" />

      <div className="container-wide relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-8 items-center">
          {/* Left: Content */}
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-display mb-4 md:mb-6 animate-fade-up">
              Decision infrastructure
              <br />
              <span className="text-muted-foreground">for critical operations.</span>
            </h1>
            
            <p className="text-lg md:text-subhead mb-6 md:mb-8 animate-fade-up delay-100">
              Unified evidence. Verified integrity. Audit-ready outcomes.
            </p>

            {/* CTA */}
            <div className="mb-6 md:mb-8 animate-fade-up delay-200">
              <Button
                size="lg"
                onClick={handleRequestAccess}
                className="bg-foreground text-background hover:bg-foreground/90 px-6 w-full sm:w-auto"
              >
                Request access
              </Button>
            </div>

            {/* Proof Chips */}
            <div className="flex flex-wrap gap-2 md:gap-4 animate-fade-up delay-300">
              {proofChips.map((chip) => (
                <div
                  key={chip.label}
                  className="flex items-center gap-2 px-2 md:px-3 py-1.5 bg-secondary border border-border text-xs md:text-sm"
                >
                  <chip.icon className="w-3 h-3 md:w-3.5 md:h-3.5 text-accent" />
                  <span className="text-muted-foreground">{chip.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Interactive Graph */}
          <div className="relative h-[350px] md:h-[400px] lg:h-[450px] animate-fade-in delay-300">
            <HeroGraph />
          </div>
        </div>
      </div>

      {/* Scroll indicator - hidden on mobile */}
      <div className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <div className="w-px h-12 bg-gradient-to-b from-transparent via-line-strong to-transparent" />
      </div>
    </section>
  );
}
