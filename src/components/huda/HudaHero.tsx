import { Shield, Building2, BarChart3, Lock } from 'lucide-react';

export function HudaHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-background to-background" />
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="container-wide relative z-10 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-muted border border-border text-muted-foreground text-xs font-mono uppercase tracking-wider">
          <Lock className="w-3 h-3" />
          <span>Gizli Urun Dosyasi</span>
        </div>

        <h1 className="text-display max-w-4xl mx-auto mb-6">
          Yerel secimler icin yapay zeka destekli kampanya istihbarati
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
          Secmen segmentasyonu. Cok kanalli erisim. Anlik analitik. Tek platform.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0 mb-12">
          <div className="px-8 py-4 border border-border bg-card">
            <p className="text-3xl font-semibold text-accent">81</p>
            <p className="text-sm text-muted-foreground">Il</p>
          </div>
          <div className="hidden sm:block w-px h-16 bg-border" />
          <div className="px-8 py-4 border border-border bg-card sm:border-l-0">
            <p className="text-3xl font-semibold">973</p>
            <p className="text-sm text-muted-foreground">Ilce</p>
          </div>
          <div className="hidden sm:block w-px h-16 bg-border" />
          <div className="px-8 py-4 border border-border bg-card sm:border-l-0">
            <p className="text-3xl font-semibold text-accent">5</p>
            <p className="text-sm text-muted-foreground">Kanal</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-8 mt-16 text-muted-foreground">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4" />
            <span>KVKK uyumlu</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4" />
            <span>Yerinde kurulum</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <BarChart3 className="w-4 h-4" />
            <span>Anlik analitik</span>
          </div>
        </div>
      </div>
    </section>
  );
}
