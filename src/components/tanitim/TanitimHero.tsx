import { Shield, Building2, Lock } from 'lucide-react';

export function TanitimHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-background to-background" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      
      <div className="container-wide relative z-10 py-20 text-center">
        {/* Classification badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-muted border border-border text-muted-foreground text-xs font-mono uppercase tracking-wider">
          <Lock className="w-3 h-3" />
          <span>Confidential Briefing Document</span>
        </div>

        {/* Main headline */}
        <h1 className="text-display max-w-4xl mx-auto mb-6">
          Sovereign verification infrastructure for consular operations
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
          Fraud networks are coordinated. Your detection should be too.
          The verification layer that VFS and iDATA cannot provide.
        </p>

        {/* Key metrics */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0 mb-12">
          <div className="px-8 py-4 border border-border bg-card">
            <p className="text-3xl font-semibold text-accent">2.5M+</p>
            <p className="text-sm text-muted-foreground">Annual applications</p>
          </div>
          <div className="hidden sm:block w-px h-16 bg-border" />
          <div className="px-8 py-4 border border-border bg-card sm:border-l-0">
            <p className="text-3xl font-semibold">60s</p>
            <p className="text-sm text-muted-foreground">Policy propagation</p>
          </div>
          <div className="hidden sm:block w-px h-16 bg-border" />
          <div className="px-8 py-4 border border-border bg-card sm:border-l-0">
            <p className="text-3xl font-semibold text-accent">0</p>
            <p className="text-sm text-muted-foreground">Foreign data routing</p>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-8 mt-16 text-muted-foreground">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4" />
            <span>On-premise deployment</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4" />
            <span>KVKK compliant</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Lock className="w-4 h-4" />
            <span>Full data sovereignty</span>
          </div>
        </div>
      </div>
    </section>
  );
}
