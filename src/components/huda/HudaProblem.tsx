import { X, AlertTriangle } from 'lucide-react';

const problems = [
  {
    title: 'Yapay zeka segmentasyonu yok',
    description: 'Secmen kitleleri demografik veriye gore otomatik segmente edilemiyor.',
  },
  {
    title: 'Kanallararasi kopukluk',
    description: 'SMS, WhatsApp, sosyal medya ve saha ekipleri birbirinden bagimsiz calisiyor.',
  },
  {
    title: 'Geri bildirim dongusu yok',
    description: 'Kampanya mesajlarinin etkisi olculemiyor, strateji korukorune yurutuluyor.',
  },
  {
    title: 'Saha takibi manuel',
    description: 'Kapi kapi ziyaretler kagit uzerinde takip ediliyor, veri kaybi yuksek.',
  },
  {
    title: 'Duygu analizi yok',
    description: 'Secmen tepkileri ve kamuoyu egilimi anlik olarak izlenemiyor.',
  },
  {
    title: 'Demografik kor noktalar',
    description: 'Hangi bolge ve kitleye odaklanilacagi sezgisel kararlara birakiliyor.',
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
          Mevcut kampanya araclari daginik ve manuel
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
