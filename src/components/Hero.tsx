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

  const handleViewBrief = () => {
    analytics.trackCTA('view_product_brief', 'hero');
    analytics.trackDownload('product_brief');
    // TODO: Open PDF or modal
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid-fade pointer-events-none" />
      
      {/* Subtle radial gradient */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-surface-elevated/50 to-transparent pointer-events-none" />

      <div className="container-wide relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: Content */}
          <div className="max-w-xl">
            <h1 className="text-display mb-6 animate-fade-up">
              Decision infrastructure
              <br />
              <span className="text-muted-foreground">for critical operations.</span>
            </h1>
            
            <p className="text-subhead mb-8 animate-fade-up delay-100">
              Unified evidence. Verified integrity. Audit-ready outcomes.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-8 animate-fade-up delay-200">
              <Button
                size="lg"
                onClick={handleRequestAccess}
                className="bg-foreground text-background hover:bg-foreground/90 px-6"
              >
                Request access
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleViewBrief}
                className="px-6 border-line-strong hover:bg-secondary"
              >
                View product brief
              </Button>
            </div>

            {/* Proof Chips */}
            <div className="flex flex-wrap gap-4 animate-fade-up delay-300">
              {proofChips.map((chip) => (
                <div
                  key={chip.label}
                  className="flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border text-sm"
                >
                  <chip.icon className="w-3.5 h-3.5 text-accent" />
                  <span className="text-muted-foreground">{chip.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Interactive Graph */}
          <div className="relative lg:h-[500px] animate-fade-in delay-300">
            <HeroGraph />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <div className="w-px h-12 bg-gradient-to-b from-transparent via-line-strong to-transparent" />
      </div>
    </section>
  );
}
