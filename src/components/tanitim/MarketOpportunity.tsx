import { TrendingUp, Users, Building, Globe } from 'lucide-react';

const stats = [
  {
    value: '4.5M+',
    label: 'Foreigners in Turkey',
    source: 'PMM 2024',
    icon: Users,
  },
  {
    value: '250+',
    label: 'Consulates Worldwide',
    source: 'Turkish MFA',
    icon: Building,
  },
  {
    value: '2.5M+',
    label: 'Annual Visa Applications',
    source: 'Sector Analysis',
    icon: Globe,
  },
  {
    value: '23%',
    label: 'YoY Growth',
    source: 'TÜİK 2024',
    icon: TrendingUp,
  },
];

const schengenStats = [
  { value: '97K', label: 'Monthly Schengen Applications', sublabel: 'From Turkey' },
  { value: '€9.7M', label: 'Monthly Processing Value', sublabel: 'Estimated' },
  { value: '3.1M', label: 'Syrians Under Protection', sublabel: 'Separate Regime' },
];

export function MarketOpportunity() {
  return (
    <section className="section-padding border-t border-border">
      <div className="container-wide">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-label mb-4">Strategic Context</p>
          <h2 className="text-headline max-w-2xl mx-auto">
            Turkey operates one of the world's most complex visa regimes
          </h2>
        </div>

        {/* Main stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat) => (
            <div 
              key={stat.label}
              className="p-6 bg-surface-elevated border border-border text-center"
            >
              <stat.icon className="w-5 h-5 text-accent mx-auto mb-4" />
              <p className="text-3xl font-semibold mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
              <p className="text-xs font-mono text-muted-foreground/70">
                Source: {stat.source}
              </p>
            </div>
          ))}
        </div>

        {/* Schengen focus box */}
        <div className="bg-accent/5 border border-accent/20 p-8">
          <h3 className="text-lg font-semibold mb-6 text-center">
            Schengen Market Focus
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {schengenStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-semibold text-accent mb-1">{stat.value}</p>
                <p className="text-sm font-medium mb-0.5">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.sublabel}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-center text-muted-foreground mt-6">
            Sources: IOM Displacement Tracking Matrix, Turkish PMM, OECD Migration Outlook 2024
          </p>
        </div>
      </div>
    </section>
  );
}
