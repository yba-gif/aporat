import { TrendingUp } from 'lucide-react';

const stats = [
  { value: '64M+', label: 'Kayıtlı seçmen' },
  { value: '81', label: 'İl' },
  { value: '973', label: 'İlçe' },
  { value: '5 yıl', label: 'Seçim döngüsü' },
];

export function HudaMarketContext() {
  return (
    <section className="section-padding border-t border-border">
      <div className="container-wide">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-5 h-5 text-accent" />
          <p className="text-label text-accent">Stratejik Bağlam</p>
        </div>
        <h2 className="text-headline mb-12 max-w-2xl">
          Türkiye'nin seçim altyapısı parçalı ve dijitalleşmeye hazır
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => (
            <div key={stat.label} className="p-6 bg-card border border-border text-center">
              <p className="text-3xl font-semibold mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="p-6 bg-accent/5 border border-accent/20 text-center">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Mevcut durum:</strong> Kampanya araçları dağınık, manuel ve birbirleriyle entegre değil. Partiler veriye dayalı karar alamıyor.
          </p>
        </div>
      </div>
    </section>
  );
}
