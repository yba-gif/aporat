import { Calendar } from 'lucide-react';

const phases = [
  {
    phase: 'Faz 1',
    period: '1-2 ay',
    title: 'MVP',
    items: ['Temel segmentasyon motoru', 'SMS entegrasyonu', 'Yonetim paneli', 'Secmen veritabani'],
  },
  {
    phase: 'Faz 2',
    period: '3-5 ay',
    title: 'Cok Kanal',
    items: ['WhatsApp entegrasyonu', 'Sosyal medya modulu', 'Saha operasyonlari', 'Mobil uygulama'],
  },
  {
    phase: 'Faz 3',
    period: '6-8 ay',
    title: 'Yapay Zeka',
    items: ['Gelismis segmentasyon', 'Duygu analizi', 'A/B test motoru', 'Tahminleme modelleri'],
  },
  {
    phase: 'Faz 4',
    period: '9-12 ay',
    title: 'Tam Platform',
    items: ['Ileri analitik', 'Coklu kampanya yonetimi', 'API ekosistemi', 'Kurumsal ozellikler'],
  },
];

export function HudaTimeline() {
  return (
    <section className="section-padding border-t border-border">
      <div className="container-wide">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-accent" />
          <p className="text-label text-accent">Yol Haritasi</p>
        </div>
        <h2 className="text-headline mb-12 max-w-2xl">
          12 aylik gelistirme plani
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          {phases.map((phase, i) => (
            <div key={phase.phase} className="relative">
              {/* Connector line */}
              {i < phases.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-6 h-px bg-border z-10" />
              )}
              <div className="p-6 bg-card border border-border h-full">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-accent">{phase.phase}</span>
                  <span className="text-xs text-muted-foreground">({phase.period})</span>
                </div>
                <h3 className="font-semibold mb-4">{phase.title}</h3>
                <ul className="space-y-2">
                  {phase.items.map((item) => (
                    <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-accent mt-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
