import { Check, Users, Send, MapPin, BarChart3 } from 'lucide-react';

const modules = [
  {
    icon: Users,
    title: 'Seçmen İstihbaratı',
    description: 'Yapay zekâ destekli demografik ve davranışsal segmentasyon. Her ilçe için özel profiller.',
  },
  {
    icon: Send,
    title: 'Erişim Motoru',
    description: 'SMS, WhatsApp, sosyal medya, çağrı merkezi ve saha ekiplerini tek panelden yönetin.',
  },
  {
    icon: MapPin,
    title: 'Saha Operasyonları',
    description: 'Kapı kapı ziyaret takibi, ekip atamaları ve çevrimdışı mobil destek.',
  },
  {
    icon: BarChart3,
    title: 'Analitik Paneli',
    description: 'Anlık kampanya performansı, duygu analizi ve dönüşüm metrikleri.',
  },
];

export function HudaSolution() {
  return (
    <section className="section-padding border-t border-border">
      <div className="container-wide">
        <div className="flex items-center gap-3 mb-4">
          <Check className="w-5 h-5 text-accent" />
          <p className="text-label text-accent">Çözüm</p>
        </div>
        <h2 className="text-headline mb-12 max-w-2xl">
          Bütünleşik kampanya istihbaratı
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
