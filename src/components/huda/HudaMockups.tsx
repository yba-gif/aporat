import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Monitor, MousePointerClick, Send, CheckCircle2 } from 'lucide-react';

const segmentData = [
  { name: '18-25 Yas', value: 22, voters: '31,240' },
  { name: '26-35 Yas', value: 28, voters: '39,760' },
  { name: '36-50 Yas', value: 30, voters: '42,600' },
  { name: '50+ Yas', value: 20, voters: '28,400' },
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
  { name: 'SMS', status: 'Aktif', reach: '34,200', icon: '📱' },
  { name: 'WhatsApp', status: 'Aktif', reach: '28,100', icon: '💬' },
  { name: 'Sosyal Medya', status: 'Aktif', reach: '52,400', icon: '📢' },
  { name: 'Cagri Merkezi', status: 'Beklemede', reach: '12,800', icon: '📞' },
  { name: 'Saha Ekibi', status: 'Aktif', reach: '8,600', icon: '🚶' },
];

const fieldTeams = [
  { team: 'Ekip Alfa', district: 'Kadikoy', visits: 142, coverage: 78, lastUpdate: '2 dk once' },
  { team: 'Ekip Beta', district: 'Besiktas', visits: 98, coverage: 62, lastUpdate: '5 dk once' },
  { team: 'Ekip Gama', district: 'Uskudar', visits: 167, coverage: 85, lastUpdate: '1 dk once' },
  { team: 'Ekip Delta', district: 'Bakirkoy', visits: 73, coverage: 41, lastUpdate: '12 dk once' },
];

export function HudaMockups() {
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [messageSent, setMessageSent] = useState(false);
  const [sendingAnimation, setSendingAnimation] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  // Animated KPI counter
  const [kpiAnimated, setKpiAnimated] = useState(false);
  useEffect(() => {
    if (activeTab === 'dashboard') {
      setKpiAnimated(false);
      const t = setTimeout(() => setKpiAnimated(true), 200);
      return () => clearTimeout(t);
    }
  }, [activeTab]);

  const handleSendMessage = () => {
    setSendingAnimation(true);
    setTimeout(() => {
      setSendingAnimation(false);
      setMessageSent(true);
      setTimeout(() => setMessageSent(false), 3000);
    }, 1500);
  };

  return (
    <section className="section-padding bg-surface-elevated border-t border-border">
      <div className="container-wide">
        <div className="flex items-center gap-3 mb-4">
          <Monitor className="w-5 h-5 text-accent" />
          <p className="text-label text-accent">Platform Goruntuleri</p>
        </div>
        <h2 className="text-headline mb-2 max-w-2xl">
          Tek ekrandan tum kampanya yonetimi
        </h2>
        <p className="text-sm text-muted-foreground mb-8 flex items-center gap-2">
          <MousePointerClick className="w-4 h-4" />
          Interaktif demo: grafiklere tiklayin, mesaj gonderin, ekipleri inceleyin
        </p>

        <div className="border border-border bg-card">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
              {/* KPI Cards with animation */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Toplam Erisim', value: '127,900', change: '+12.4% bu hafta' },
                  { label: 'Etkilesim Orani', value: '%34.2', change: '+5.1% bu hafta' },
                  { label: 'Donusum', value: '%8.7', change: '+2.3% bu hafta' },
                ].map((kpi, i) => (
                  <div
                    key={kpi.label}
                    className={`p-4 bg-background border border-border transition-all duration-500 hover:border-accent/50 hover:shadow-sm cursor-default ${
                      kpiAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                    }`}
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
                    <p className="text-2xl font-semibold">{kpi.value}</p>
                    <p className="text-xs text-accent">{kpi.change}</p>
                  </div>
                ))}
              </div>

              {/* Charts Row - interactive */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-background border border-border">
                  <p className="text-sm font-medium mb-2">Secmen Segmentasyonu</p>
                  <p className="text-xs text-muted-foreground mb-4">Bir dilime tiklayin</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={segmentData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        onClick={(_, index) => setSelectedSegment(index === selectedSegment ? null : index)}
                        cursor="pointer"
                        label={({ name, value }) => `${name}: %${value}`}
                      >
                        {segmentData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            opacity={selectedSegment !== null && selectedSegment !== index ? 0.3 : 1}
                            strokeWidth={selectedSegment === index ? 3 : 1}
                            stroke={selectedSegment === index ? 'hsl(174, 62%, 32%)' : 'transparent'}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  {selectedSegment !== null && (
                    <div className="mt-3 p-3 bg-accent/5 border border-accent/20 animate-fade-up text-sm">
                      <p className="font-medium">{segmentData[selectedSegment].name}</p>
                      <p className="text-muted-foreground">{segmentData[selectedSegment].voters} secmen, toplamin %{segmentData[selectedSegment].value}'i</p>
                      <p className="text-xs text-accent mt-1">Bu segmente kampanya baslatmak icin Erisim Motoru'na gecin →</p>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-background border border-border">
                  <p className="text-sm font-medium mb-4">Haftalik Performans</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 90%)" />
                      <XAxis dataKey="gun" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="erisim" name="Erisim" stroke="hsl(174, 62%, 32%)" strokeWidth={2} dot={{ r: 4, cursor: 'pointer' }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="etkilesim" name="Etkilesim" stroke="hsl(0, 0%, 45%)" strokeWidth={2} dot={{ r: 4, cursor: 'pointer' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-accent inline-block" /> Erisim</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-muted-foreground inline-block" /> Etkilesim</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="outreach" className="p-6 mt-0">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div className="p-4 bg-background border border-border">
                    <p className="text-sm font-medium mb-3">Mesaj Olusturucu</p>
                    <div className="p-3 bg-muted border border-border text-sm text-muted-foreground min-h-[100px]">
                      Sayin <span className="text-accent font-medium">Ahmet Yilmaz</span>, <span className="text-accent font-medium">Kadikoy</span> bolgesindeki yeni projelerimiz hakkinda bilgi almak ister misiniz? Detaylar icin: <span className="text-accent font-medium underline">huda.app/k/2847</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Badge variant="outline" className="text-xs">{'{secmen_adi}'}</Badge>
                      <Badge variant="outline" className="text-xs">{'{ilce}'}</Badge>
                      <Badge variant="outline" className="text-xs">{'{link}'}</Badge>
                    </div>
                  </div>
                  <div className="p-4 bg-background border border-border">
                    <p className="text-sm font-medium mb-3">Hedef Kitle Filtreleri</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className="bg-accent/10 text-accent border-accent/20">Yas: 26-50</Badge>
                      <Badge className="bg-accent/10 text-accent border-accent/20">Bolge: Istanbul</Badge>
                      <Badge className="bg-accent/10 text-accent border-accent/20">Segment: Kararsiz</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Tahmini erisim: <strong className="text-foreground">38,000</strong> secmen</p>
                  </div>

                  {/* Send button */}
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingAnimation || messageSent}
                    className={`w-full py-3 flex items-center justify-center gap-2 text-sm font-medium transition-all duration-300 ${
                      messageSent
                        ? 'bg-accent/10 text-accent border border-accent/30'
                        : sendingAnimation
                        ? 'bg-accent/50 text-accent-foreground border border-accent animate-pulse'
                        : 'bg-accent text-accent-foreground hover:bg-accent/90 border border-accent'
                    }`}
                  >
                    {sendingAnimation ? (
                      <>
                        <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                        Gonderiliyor...
                      </>
                    ) : messageSent ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        38,000 secmene gonderildi!
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Kampanya Baslat (Demo)
                      </>
                    )}
                  </button>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium">Kanal Durumu</p>
                  {channels.map((ch) => (
                    <div key={ch.name} className="p-3 bg-background border border-border flex items-center justify-between hover:border-accent/30 transition-colors cursor-default">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{ch.icon}</span>
                        <div>
                          <p className="text-sm font-medium">{ch.name}</p>
                          <p className="text-xs text-muted-foreground">{ch.reach} erisim</p>
                        </div>
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
              <div className="space-y-3">
                <div className="grid grid-cols-5 gap-4 text-sm font-medium text-muted-foreground px-4 pb-2 border-b border-border">
                  <span>Ekip</span>
                  <span>Ilce</span>
                  <span>Ziyaret</span>
                  <span>Kapsam</span>
                  <span>Son Guncelleme</span>
                </div>
                {fieldTeams.map((team) => (
                  <div key={team.team}>
                    <div
                      onClick={() => setExpandedTeam(expandedTeam === team.team ? null : team.team)}
                      className={`grid grid-cols-5 gap-4 items-center p-4 bg-background border transition-all duration-200 cursor-pointer ${
                        expandedTeam === team.team ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/30'
                      }`}
                    >
                      <p className="text-sm font-medium">{team.team}</p>
                      <p className="text-sm text-muted-foreground">{team.district}</p>
                      <p className="text-sm">{team.visits}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full transition-all duration-700" style={{ width: `${team.coverage}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-8">%{team.coverage}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{team.lastUpdate}</p>
                    </div>
                    {expandedTeam === team.team && (
                      <div className="p-4 bg-accent/5 border border-t-0 border-accent/20 animate-fade-up">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Bugun Ziyaret</p>
                            <p className="font-semibold">{Math.floor(team.visits * 0.15)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Olumlu Geri Bildirim</p>
                            <p className="font-semibold text-accent">%{Math.floor(team.coverage * 0.6)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Kalan Mahalle</p>
                            <p className="font-semibold">{Math.floor((100 - team.coverage) / 10)}</p>
                          </div>
                        </div>
                      </div>
                    )}
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
