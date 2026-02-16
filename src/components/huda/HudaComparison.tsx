import { Check, X, Scale } from 'lucide-react';

const rows = [
  { feature: 'Seçmen segmentasyonu', manual: false, huda: true },
  { feature: 'Çok kanal senkronizasyonu', manual: false, huda: true },
  { feature: 'Anlık analitik', manual: false, huda: true },
  { feature: 'Saha takibi', manual: false, huda: true },
  { feature: 'Duygu analizi', manual: false, huda: true },
  { feature: 'KVKK uyumu', manual: false, huda: true },
  { feature: 'A/B testi', manual: false, huda: true },
  { feature: 'Demografik hedefleme', manual: false, huda: true },
];

export function HudaComparison() {
  return (
    <section className="section-padding bg-surface-elevated border-t border-border">
      <div className="container-wide">
        <div className="flex items-center gap-3 mb-4">
          <Scale className="w-5 h-5 text-accent" />
          <p className="text-label text-accent">Karşılaştırma</p>
        </div>
        <h2 className="text-headline mb-12 max-w-2xl">
          Manuel kampanyalar vs. HUDA
        </h2>

        <div className="border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-3 gap-0 border-b border-border bg-muted">
            <div className="p-4 text-sm font-medium">Özellik</div>
            <div className="p-4 text-sm font-medium text-center border-l border-border">Manuel</div>
            <div className="p-4 text-sm font-medium text-center border-l border-border text-accent">HUDA</div>
          </div>
          {rows.map((row, i) => (
            <div key={row.feature} className={`grid grid-cols-3 gap-0 ${i < rows.length - 1 ? 'border-b border-border' : ''}`}>
              <div className="p-4 text-sm">{row.feature}</div>
              <div className="p-4 flex justify-center border-l border-border">
                <X className="w-4 h-4 text-destructive" />
              </div>
              <div className="p-4 flex justify-center border-l border-border">
                <Check className="w-4 h-4 text-accent" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
