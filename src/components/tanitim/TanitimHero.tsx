import { ArrowRight, Shield, Building2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TanitimHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-background to-background" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      
      <div className="container-wide relative z-10 py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-accent/10 border border-accent/20 text-accent text-sm font-medium">
          <Shield className="w-4 h-4" />
          <span>Strategic Partnership Opportunity</span>
        </div>

        {/* Main headline */}
        <h1 className="text-display max-w-4xl mx-auto mb-6">
          Building the Future of{' '}
          <span className="text-accent">Visa Integrity</span>{' '}
          Infrastructure
        </h1>

        <p className="text-subhead max-w-2xl mx-auto mb-12">
          Sovereign infrastructure for cross-border mobility compliance. 
          Stopping fraud networks before they reach your consulates.
        </p>

        {/* Key metrics */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0 mb-12">
          <div className="px-8 py-4 border border-border bg-card">
            <p className="text-3xl font-semibold text-accent">250+</p>
            <p className="text-sm text-muted-foreground">Consulates Supported</p>
          </div>
          <div className="hidden sm:block w-px h-16 bg-border" />
          <div className="px-8 py-4 border border-border bg-card sm:border-l-0">
            <p className="text-3xl font-semibold">60s</p>
            <p className="text-sm text-muted-foreground">Policy Propagation</p>
          </div>
          <div className="hidden sm:block w-px h-16 bg-border" />
          <div className="px-8 py-4 border border-border bg-card sm:border-l-0">
            <p className="text-3xl font-semibold text-accent">100%</p>
            <p className="text-sm text-muted-foreground">Turkish Data Sovereignty</p>
          </div>
        </div>

        {/* CTA */}
        <Button size="lg" className="gap-2">
          <span>Schedule Ministry Briefing</span>
          <ArrowRight className="w-4 h-4" />
        </Button>

        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-8 mt-16 text-muted-foreground">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4" />
            <span>GovTech Ready</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4" />
            <span>KVKK Compliant</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Globe className="w-4 h-4" />
            <span>NATO-Grade Security</span>
          </div>
        </div>
      </div>
    </section>
  );
}
