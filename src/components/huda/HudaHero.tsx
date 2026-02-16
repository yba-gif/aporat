import { Lock } from 'lucide-react';

export function HudaHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-background to-background" />
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="container-wide relative z-10 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-muted border border-border text-muted-foreground text-xs font-mono uppercase tracking-wider">
          <Lock className="w-3 h-3" />
          <span>Gizli Ürün Dosyası</span>
        </div>

        <h1 className="text-display max-w-4xl mx-auto mb-6">
          Yerel seçimler için yapay zekâ destekli kampanya istihbaratı
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
          Seçmen segmentasyonu. Çok kanallı erişim. Anlık analitik. Tek platform.
        </p>


      </div>
    </section>
  );
}
