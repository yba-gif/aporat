import { X, AlertTriangle } from 'lucide-react';

const problems = [
  {
    title: 'Yapay zekâ segmentasyonu yok',
    description: 'Seçmen kitleleri demografik veriye göre otomatik segmente edilemiyor.',
  },
  {
    title: 'Kanallar arası kopukluk',
    description: 'SMS, WhatsApp, sosyal medya ve saha ekipleri birbirinden bağımsız çalışıyor.',
  },
  {
    title: 'Geri bildirim döngüsü yok',
    description: 'Kampanya mesajlarının etkisi ölçülemiyor, strateji körükörüne yürütülüyor.',
  },
  {
    title: 'Saha takibi manuel',
    description: 'Kapı kapı ziyaretler kâğıt üzerinde takip ediliyor, veri kaybı yüksek.',
  },
  {
    title: 'Duygu analizi yok',
    description: 'Seçmen tepkileri ve kamuoyu eğilimi anlık olarak izlenemiyor.',
  },
  {
    title: 'Demografik kör noktalar',
    description: 'Hangi bölge ve kitleye odaklanılacağı sezgisel kararlara bırakılıyor.',
  },
];

export function HudaProblem() {
  return (
    <section className="section-padding bg-surface-elevated border-t border-border">
      <div className="container-wide">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <p className="text-label text-destructive">Sorun</p>
        </div>
        <h2 className="text-headline mb-12 max-w-2xl">
          Mevcut kampanya araçları dağınık ve manuel
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem) => (
            <div key={problem.title} className="p-6 bg-background border border-border">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-1.5 bg-destructive/10 text-destructive shrink-0">
                  <X className="w-4 h-4" />
                </div>
                <h3 className="font-medium">{problem.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground pl-9">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
