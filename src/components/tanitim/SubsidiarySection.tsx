import { Building2, FlaskConical, TrendingUp, Database } from 'lucide-react';

const metrics = [
  { icon: Database, value: '15+', label: 'Document Types Processed' },
  { icon: FlaskConical, value: '8', label: 'Fraud Typologies Detected' },
  { icon: TrendingUp, value: '<2%', label: 'False Positive Rate' },
];

export function SubsidiarySection() {
  return (
    <section className="section-padding border-t border-border">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-accent" />
              <p className="text-label text-accent">Proof of Concept</p>
            </div>
            
            <h2 className="text-headline mb-6">
              Vizesepetim: Our living laboratory
            </h2>

            <p className="text-body mb-6 max-w-lg">
              <strong className="text-foreground">Vizesepetim.com</strong> is a wholly-owned subsidiary of Portolan Labs operating as a visa services marketplace in Turkey.
            </p>

            <p className="text-body mb-8 max-w-lg">
              Unlike competitors who sell theory, we generate authentic fraud pattern data from real Turkish visa traffic. Every detection algorithm is validated against live applications.
            </p>

            {/* Corporate structure note */}
            <div className="p-4 bg-secondary border border-border">
              <p className="text-sm">
                <strong>Corporate structure:</strong> Vizesepetim is a wholly-owned subsidiary, not an acquisition. This ensures unified technology stack, consistent data governance, and direct operational control.
              </p>
            </div>
          </div>

          {/* Right: Metrics and structure */}
          <div className="space-y-6">
            {/* Corporate diagram */}
            <div className="p-6 bg-surface-elevated border border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-6">Corporate Structure</h3>
              
              <div className="space-y-3">
                <div className="p-4 bg-accent/10 border-2 border-accent text-center">
                  <p className="font-semibold">Portolan Labs</p>
                  <p className="text-xs text-muted-foreground">Parent Company</p>
                </div>
                
                <div className="flex justify-center">
                  <div className="w-px h-6 bg-border" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-background border border-border text-center text-sm">
                    <p className="font-medium">Core Products</p>
                    <p className="text-xs text-muted-foreground">Maris, Nautica, Meridian</p>
                  </div>
                  <div className="p-3 bg-background border border-border text-center text-sm">
                    <p className="font-medium">Vizesepetim.com</p>
                    <p className="text-xs text-muted-foreground">Subsidiary</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4">
              {metrics.map((metric) => (
                <div 
                  key={metric.label}
                  className="p-4 bg-surface-elevated border border-border text-center"
                >
                  <metric.icon className="w-5 h-5 text-accent mx-auto mb-3" />
                  <p className="text-2xl font-semibold mb-1">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
