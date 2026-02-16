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

        <div className="border border-border bg-card overflow-x-auto">
          <table className="w-full min-w-[320px]">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-left">Özellik</th>
                <th className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-center border-l border-border">Manuel</th>
                <th className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-center border-l border-border text-accent">HUDA</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.feature} className={i < rows.length - 1 ? 'border-b border-border' : ''}>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm">{row.feature}</td>
                  <td className="p-3 sm:p-4 border-l border-border text-center">
                    <X className="w-4 h-4 text-destructive inline-block" />
                  </td>
                  <td className="p-3 sm:p-4 border-l border-border text-center">
                    <Check className="w-4 h-4 text-accent inline-block" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
