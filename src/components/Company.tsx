import { ArrowRight } from 'lucide-react';

const openPositions = [
  { title: 'Senior Backend Engineer', location: 'Remote / EU' },
  { title: 'Product Designer', location: 'Remote / EU' },
];

export function Company() {
  return (
    <section id="company" className="section-padding bg-surface-elevated/50 border-y border-border">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left: Mission */}
          <div>
            <p className="text-label mb-4">Company</p>
            <h2 className="text-headline mb-6">
              Building decision infrastructure for the world's most critical operations.
            </h2>
            
            <div className="space-y-4 text-body max-w-lg">
              <p>
                Portolan Labs solves the infrastructure gap in high-stakes decision-making: fragmented systems, inconsistent evidence, opaque processes.
              </p>
              <p>
                We build for organizations that cannot afford to get it wrong: border agencies, defense, consular networks, and regulated enterprises.
              </p>
            </div>
          </div>

          {/* Right: Open Positions */}
          <div className="space-y-12">
            <div>
              <h3 className="font-semibold mb-6">Open Positions</h3>
              <div className="space-y-3">
                {openPositions.map((position, index) => (
                  <a
                    key={index}
                    href="#contact"
                    className="flex items-center justify-between gap-4 p-4 border border-border bg-background hover:bg-secondary/50 transition-colors group"
                  >
                    <div>
                      <p className="font-medium">{position.title}</p>
                      <p className="text-sm text-muted-foreground">{position.location}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
