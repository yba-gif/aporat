import { Check, Users, Send, MapPin, BarChart3 } from 'lucide-react';

const modules = [
  {
    icon: Users,
    title: 'Secmen Istihbarati',
    description: 'Yapay zeka destekli demografik ve davranissal segmentasyon. Her ilce icin ozel profiller.',
  },
  {
    icon: Send,
    title: 'Erisim Motoru',
    description: 'SMS, WhatsApp, sosyal medya, cagri merkezi ve saha ekiplerini tek panelden yonetin.',
  },
  {
    icon: MapPin,
    title: 'Saha Operasyonlari',
    description: 'Kapi kapi ziyaret takibi, ekip atamalari ve cevrimdisi mobil destek.',
  },
  {
    icon: BarChart3,
    title: 'Analitik Paneli',
    description: 'Anlik kampanya performansi, duygu analizi ve donusum metrikleri.',
  },
];

export function HudaSolution() {
  return (
    <section className="section-padding border-t border-border">
      <div className="container-wide">
        <div className="flex items-center gap-3 mb-4">
          <Check className="w-5 h-5 text-accent" />
          <p className="text-label text-accent">Cozum</p>
        </div>
        <h2 className="text-headline mb-12 max-w-2xl">
          Butunlesik kampanya istihbarati
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div key={mod.title} className="p-6 bg-card border border-border">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-accent/10 text-accent shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{mod.title}</h3>
                    <p className="text-sm text-muted-foreground">{mod.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
