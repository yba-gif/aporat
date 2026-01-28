import { Check, X } from 'lucide-react';

const comparisonRows = [
  { feature: 'Cross-consulate hash matching', current: false, portolan: true },
  { feature: 'Relationship graph analysis', current: false, portolan: true },
  { feature: 'Real-time policy propagation', current: false, portolan: true },
  { feature: 'Cryptographic audit trail', current: false, portolan: true },
  { feature: 'Turkish data sovereignty', current: false, portolan: true },
  { feature: 'KVKK compliance built-in', current: false, portolan: true },
  { feature: 'Visa mill detection', current: false, portolan: true },
  { feature: 'Social intelligence layer', current: false, portolan: true },
];

export function ComparisonSection() {
  return (
    <section className="section-padding bg-surface-elevated border-t border-border">
      <div className="container-wide">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-label mb-4">Comparison</p>
          <h2 className="text-headline max-w-2xl mx-auto">
            Generic booking systems vs. verification infrastructure
          </h2>
        </div>

        {/* Comparison table */}
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="col-span-1" />
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Current Systems</p>
              <p className="text-xs text-muted-foreground/70">VFS/iDATA</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-accent">Portolan</p>
              <p className="text-xs text-muted-foreground/70">Verification Layer</p>
            </div>
          </div>

          <div className="space-y-2">
            {comparisonRows.map((row) => (
              <div 
                key={row.feature}
                className="grid grid-cols-3 gap-4 p-4 bg-background border border-border items-center"
              >
                <p className="text-sm">{row.feature}</p>
                <div className="flex justify-center">
                  {row.current ? (
                    <div className="p-1 bg-accent/10 text-accent">
                      <Check className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="p-1 bg-muted text-muted-foreground">
                      <X className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="flex justify-center">
                  {row.portolan ? (
                    <div className="p-1 bg-accent/10 text-accent">
                      <Check className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="p-1 bg-muted text-muted-foreground">
                      <X className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Summary callout */}
          <div className="mt-8 p-6 bg-accent/5 border border-accent/20 text-center">
            <p className="text-sm">
              <strong>Key distinction:</strong> VFS Global and iDATA handle logistics. Portolan handles verification. They are complementary, not competitive.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
