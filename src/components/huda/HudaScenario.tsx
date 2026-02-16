import { useState, useEffect } from 'react';
import { Play, Database, Users, Send, BarChart3, CheckCircle2, ArrowRight, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';

const steps = [
  {
    id: 1,
    icon: Database,
    label: 'Veri Toplama',
    title: 'Seçmen veritabanı oluşturuluyor',
    narrative: 'Kadıköy ilçesi için 142.000 kayıtlı seçmen verisi sisteme yüklendi. Demografik profiller çıkarılıyor...',
    detail: {
      type: 'stats' as const,
      data: [
        { label: 'Toplam Seçmen', value: '142.000' },
        { label: 'Yaş Grubu Sayısı', value: '4' },
        { label: 'Mahalle', value: '28' },
        { label: 'Veri Kalitesi', value: '%94' },
      ],
    },
  },
  {
    id: 2,
    icon: Users,
    label: 'Segmentasyon',
    title: 'Yapay zekâ seçmen segmentasyonu',
    narrative: 'TensorFlow modeli 142.000 seçmeni 6 davranışsal segmente ayırdı. En büyük fırsat: 38.000 kararsız seçmen.',
    detail: {
      type: 'chart' as const,
      data: [
        { name: 'Sadık', value: 42000, color: 'hsl(174, 62%, 32%)' },
        { name: 'Kararsız', value: 38000, color: 'hsl(174, 62%, 45%)' },
        { name: 'Muhalif', value: 31000, color: 'hsl(0, 0%, 60%)' },
        { name: 'İlk Seçmen', value: 18000, color: 'hsl(0, 0%, 75%)' },
        { name: 'Pasif', value: 13000, color: 'hsl(0, 0%, 85%)' },
      ],
    },
  },
  {
    id: 3,
    icon: Send,
    label: 'Erişim',
    title: 'Çok kanallı kampanya başlatıldı',
    narrative: 'Kararsız segmente özelleşmiş mesajlar 3 kanaldan eş zamanlı gönderiliyor. A/B testi aktif.',
    detail: {
      type: 'channels' as const,
      data: [
        { channel: 'SMS', sent: 12400, delivered: 12100, opened: 8200 },
        { channel: 'WhatsApp', sent: 9800, delivered: 9600, opened: 7100 },
        { channel: 'Sosyal Medya', sent: 15800, delivered: 15800, opened: 11200 },
      ],
    },
  },
  {
    id: 4,
    icon: BarChart3,
    label: 'Analiz',
    title: 'Kampanya sonuçları',
    narrative: '72 saat sonra: %34 etkileşim oranı, %8,7 dönüşüm. Kadıköy\'de kararsız segment %12 olumlu kaydı.',
    detail: {
      type: 'results' as const,
      data: [
        { metric: 'Erişim', value: '38.000', change: '+100%' },
        { metric: 'Etkileşim', value: '%34,2', change: '+18%' },
        { metric: 'Dönüşüm', value: '%8,7', change: '+5,2%' },
        { metric: 'Maliyet/Erişim', value: '₺0,12', change: '-42%' },
      ],
    },
  },
];

const CHART_COLORS = ['hsl(174, 62%, 32%)', 'hsl(174, 62%, 45%)', 'hsl(0, 0%, 60%)', 'hsl(0, 0%, 75%)', 'hsl(0, 0%, 85%)'];

export function HudaScenario() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animatedBars, setAnimatedBars] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    setAnimatedBars(false);
    const t = setTimeout(() => setAnimatedBars(true), 100);
    return () => clearTimeout(t);
  }, [activeStep]);

  const current = steps[activeStep];

  const renderDetail = () => {
    const d = current.detail;
    if (d.type === 'stats') {
      return (
        <div className="grid grid-cols-2 gap-3">
          {d.data.map((s) => (
            <div key={s.label} className="p-4 bg-background border border-border animate-fade-up">
              <p className="text-2xl font-semibold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      );
    }
    if (d.type === 'chart') {
      return (
        <div className="p-4 bg-background border border-border animate-fade-up">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={d.data} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {d.data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }
    if (d.type === 'channels') {
      return (
        <div className="space-y-3 animate-fade-up">
          {d.data.map((ch) => (
            <div key={ch.channel} className="p-4 bg-background border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">{ch.channel}</p>
                <Badge className="bg-accent/10 text-accent border-accent/20 text-xs">Aktif</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Gönderilen</p>
                  <p className="font-medium">{ch.sent.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ulaşan</p>
                  <p className="font-medium">{ch.delivered.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Açılan</p>
                  <p className="font-medium text-accent">{ch.opened.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-1000 ease-out"
                  style={{ width: animatedBars ? `${(ch.opened / ch.sent) * 100}%` : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (d.type === 'results') {
      return (
        <div className="grid grid-cols-2 gap-3 animate-fade-up">
          {d.data.map((r) => (
            <div key={r.metric} className="p-4 bg-background border border-border">
              <p className="text-xs text-muted-foreground mb-1">{r.metric}</p>
              <p className="text-2xl font-semibold">{r.value}</p>
              <p className="text-xs text-accent font-medium">{r.change}</p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <section className="section-padding border-t border-border">
      <div className="container-wide">
        <div className="flex items-center gap-3 mb-4">
          <Play className="w-5 h-5 text-accent" />
          <p className="text-label text-accent">Örnek Kullanım</p>
        </div>
        <h2 className="text-headline mb-4 max-w-2xl">
          Kadıköy ilçesi: kampanya senaryosu
        </h2>
        <p className="text-muted-foreground mb-8 max-w-xl">
          Gerçekçi bir yerel seçim kampanyasının HUDA üzerinde 4 adımda nasıl yürütüldüğünü inceleyin.
        </p>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === activeStep;
            const isDone = i < activeStep;
            return (
              <button
                key={step.id}
                onClick={() => { setActiveStep(i); setIsPlaying(false); }}
                className="flex items-center gap-2 group"
              >
                <div className={`flex items-center gap-2 px-3 py-2 border transition-all duration-300 cursor-pointer ${
                  isActive ? 'border-accent bg-accent/10 text-accent' : isDone ? 'border-accent/30 bg-accent/5 text-accent/70' : 'border-border bg-background text-muted-foreground hover:border-accent/50'
                }`}>
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  <span className="text-xs font-medium hidden sm:inline">{step.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <ChevronRight className={`w-3 h-3 ${isDone ? 'text-accent/50' : 'text-border'}`} />
                )}
              </button>
            );
          })}

          <button
            onClick={() => { setActiveStep(0); setIsPlaying(true); }}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/90 transition-colors"
          >
            <Play className="w-3 h-3" />
            Otomatik Oynat
          </button>
        </div>

        {/* Active step content */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-card border border-border" key={activeStep}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 flex items-center justify-center bg-accent text-accent-foreground font-semibold text-sm">
                {current.id}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{current.label}</p>
                <h3 className="font-semibold">{current.title}</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 animate-fade-up">
              {current.narrative}
            </p>
            {activeStep < steps.length - 1 && (
              <button
                onClick={() => setActiveStep(activeStep + 1)}
                className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors"
              >
                Sonraki adım <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {activeStep === steps.length - 1 && (
              <div className="flex items-center gap-2 text-sm text-accent">
                <CheckCircle2 className="w-4 h-4" />
                Kampanya tamamlandı
              </div>
            )}
          </div>

          <div key={`detail-${activeStep}`}>
            {renderDetail()}
          </div>
        </div>
      </div>
    </section>
  );
}
