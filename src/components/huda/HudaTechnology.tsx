import { Cpu, Wifi, Layers, Smartphone } from 'lucide-react';

const capabilities = [
  { icon: Cpu, title: 'Yapay Zekâ Segmentasyonu', description: 'Demografik ve davranışsal verilerle otomatik seçmen profilleme.' },
  { icon: Wifi, title: 'Anlık Duygu Takibi', description: 'Sosyal medya ve saha verilerinden canlı kamuoyu eğilimi.' },
  { icon: Layers, title: 'Çok Kanallı Orkestrasyon', description: 'Tüm iletişim kanalları tek platformdan koordineli yönetim.' },
  { icon: Smartphone, title: 'Çevrimdışı Mobil', description: 'İnternet olmadan saha çalışması, otomatik senkronizasyon.' },
];

const metrics = [
  { value: '<2sn', label: 'Segmentasyon süresi' },
  { value: '5', label: 'Entegre kanal' },
  { value: '81', label: 'İl kapsamı' },
  { value: 'Anlık', label: 'Veri senkronizasyonu' },
];

export function HudaTechnology() {
  return (
    <section className="section-padding border-t border-border">
      <div className="container-wide">
        <div className="flex items-center gap-3 mb-4">
          <Cpu className="w-5 h-5 text-accent" />
          <p className="text-label text-accent">Teknik Altyapı</p>
        </div>
        <h2 className="text-headline mb-12 max-w-2xl">
          Siyasi operasyonlar için ölçeklenebilir altyapı
        </h2>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div key={cap.title} className="p-6 bg-card border border-border">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-accent/10 text-accent shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{cap.title}</h3>
                    <p className="text-sm text-muted-foreground">{cap.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m) => (
            <div key={m.label} className="p-6 bg-accent/5 border border-accent/20 text-center">
              <p className="text-2xl font-semibold text-accent mb-1">{m.value}</p>
              <p className="text-sm text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
