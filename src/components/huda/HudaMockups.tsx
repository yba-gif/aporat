import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Monitor } from 'lucide-react';

const segmentData = [
  { name: '18-25 Yas', value: 22 },
  { name: '26-35 Yas', value: 28 },
  { name: '36-50 Yas', value: 30 },
  { name: '50+ Yas', value: 20 },
];

const performanceData = [
  { gun: 'Pzt', erisim: 12400, etkilesim: 3200 },
  { gun: 'Sal', erisim: 15800, etkilesim: 4100 },
  { gun: 'Car', erisim: 18200, etkilesim: 5300 },
  { gun: 'Per', erisim: 21000, etkilesim: 6800 },
  { gun: 'Cum', erisim: 24500, etkilesim: 7200 },
  { gun: 'Cmt', erisim: 19800, etkilesim: 5900 },
  { gun: 'Paz', erisim: 16200, etkilesim: 4600 },
];

const COLORS = ['hsl(174, 62%, 32%)', 'hsl(174, 62%, 45%)', 'hsl(0, 0%, 45%)', 'hsl(0, 0%, 70%)'];

const channels = [
  { name: 'SMS', status: 'Aktif', reach: '34,200' },
  { name: 'WhatsApp', status: 'Aktif', reach: '28,100' },
  { name: 'Sosyal Medya', status: 'Aktif', reach: '52,400' },
  { name: 'Cagri Merkezi', status: 'Beklemede', reach: '12,800' },
  { name: 'Saha Ekibi', status: 'Aktif', reach: '8,600' },
];

const fieldTeams = [
  { team: 'Ekip Alfa', district: 'Kadikoy', visits: 142, coverage: 78 },
  { team: 'Ekip Beta', district: 'Besiktas', visits: 98, coverage: 62 },
  { team: 'Ekip Gama', district: 'Uskudar', visits: 167, coverage: 85 },
  { team: 'Ekip Delta', district: 'Bakirköy', visits: 73, coverage: 41 },
];

export function HudaMockups() {
  return (
    <section className="section-padding bg-surface-elevated border-t border-border">
      <div className="container-wide">
        <div className="flex items-center gap-3 mb-4">
          <Monitor className="w-5 h-5 text-accent" />
          <p className="text-label text-accent">Platform Goruntuleri</p>
        </div>
        <h2 className="text-headline mb-12 max-w-2xl">
          Tek ekrandan tum kampanya yonetimi
        </h2>

        <div className="border border-border bg-card">
          <Tabs defaultValue="dashboard" className="w-full">
            <div className="border-b border-border px-4">
              <TabsList className="bg-transparent h-12">
                <TabsTrigger value="dashboard" className="data-[state=active]:bg-accent/10 data-[state=active]:text-accent">
                  Kontrol Paneli
                </TabsTrigger>
                <TabsTrigger value="outreach" className="data-[state=active]:bg-accent/10 data-[state=active]:text-accent">
                  Erisim Motoru
                </TabsTrigger>
                <TabsTrigger value="field" className="data-[state=active]:bg-accent/10 data-[state=active]:text-accent">
                  Saha Operasyonlari
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="dashboard" className="p-6 mt-0">
              {/* KPI Cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-background border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Toplam Erisim</p>
                  <p className="text-2xl font-semibold">127,900</p>
                  <p className="text-xs text-accent">+12.4% bu hafta</p>
                </div>
                <div className="p-4 bg-background border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Etkilesim Orani</p>
                  <p className="text-2xl font-semibold">%34.2</p>
                  <p className="text-xs text-accent">+5.1% bu hafta</p>
                </div>
                <div className="p-4 bg-background border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Donusum</p>
                  <p className="text-2xl font-semibold">%8.7</p>
                  <p className="text-xs text-accent">+2.3% bu hafta</p>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-background border border-border">
                  <p className="text-sm font-medium mb-4">Secmen Segmentasyonu</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={segmentData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: %${value}`}>
                        {segmentData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="p-4 bg-background border border-border">
                  <p className="text-sm font-medium mb-4">Haftalik Performans</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 90%)" />
                      <XAxis dataKey="gun" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Line type="monotone" dataKey="erisim" stroke="hsl(174, 62%, 32%)" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="etkilesim" stroke="hsl(0, 0%, 45%)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="outreach" className="p-6 mt-0">
              {/* Message Composer */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div className="p-4 bg-background border border-border">
                    <p className="text-sm font-medium mb-3">Mesaj Olusturucu</p>
                    <div className="p-3 bg-muted border border-border text-sm text-muted-foreground min-h-[100px]">
                      Sayin {'{secmen_adi}'}, {'{ilce}'} bolgesindeki yeni projelerimiz hakkinda bilgi almak ister misiniz? Detaylar icin: {'{link}'}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Badge variant="outline" className="text-xs">{'{secmen_adi}'}</Badge>
                      <Badge variant="outline" className="text-xs">{'{ilce}'}</Badge>
                      <Badge variant="outline" className="text-xs">{'{link}'}</Badge>
                    </div>
                  </div>
                  <div className="p-4 bg-background border border-border">
                    <p className="text-sm font-medium mb-3">Hedef Kitle Filtreleri</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-accent/10 text-accent border-accent/20">Yas: 26-50</Badge>
                      <Badge className="bg-accent/10 text-accent border-accent/20">Bolge: Istanbul</Badge>
                      <Badge className="bg-accent/10 text-accent border-accent/20">Segment: Kararsiz</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium">Kanal Durumu</p>
                  {channels.map((ch) => (
                    <div key={ch.name} className="p-3 bg-background border border-border flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{ch.name}</p>
                        <p className="text-xs text-muted-foreground">{ch.reach} erisim</p>
                      </div>
                      <Badge variant={ch.status === 'Aktif' ? 'default' : 'secondary'} className={ch.status === 'Aktif' ? 'bg-accent text-accent-foreground' : ''}>
                        {ch.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="field" className="p-6 mt-0">
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground px-4 pb-2 border-b border-border">
                  <span>Ekip</span>
                  <span>Ilce</span>
                  <span>Ziyaret</span>
                  <span>Kapsam</span>
                </div>
                {fieldTeams.map((team) => (
                  <div key={team.team} className="grid grid-cols-4 gap-4 items-center p-4 bg-background border border-border">
                    <p className="text-sm font-medium">{team.team}</p>
                    <p className="text-sm text-muted-foreground">{team.district}</p>
                    <p className="text-sm">{team.visits}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full"
                          style={{ width: `${team.coverage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8">%{team.coverage}</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
