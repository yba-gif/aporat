import { ArrowRight } from 'lucide-react';

const advisorPlaceholders = [
  { expertise: 'GovTech & Enterprise', placeholder: true },
  { expertise: 'Mobility Compliance', placeholder: true },
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
                Portolan Labs was founded to solve the infrastructure gap in high-stakes decision-making—where fragmented systems, inconsistent evidence, and opaque processes create risk for governments and enterprises alike.
              </p>
              <p>
                We build software for organizations that cannot afford to get it wrong: border security agencies, defense departments, consular networks, and global enterprises navigating complex regulatory environments.
              </p>
            </div>
          </div>

          {/* Right: Team & Advisors */}
          <div className="space-y-12">
            {/* Advisors */}
            <div>
              <h3 className="font-semibold mb-6">Advisors</h3>
              <div className="space-y-3">
                {advisorPlaceholders.map((advisor, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 border border-border bg-background"
                  >
                    <div className="w-8 h-8 bg-secondary flex items-center justify-center">
                      <span className="text-muted-foreground text-xs">—</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{advisor.expertise}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Careers */}
            <div>
              <a
                href="#"
                className="inline-flex items-center gap-2 text-sm font-medium link-underline group"
              >
                View open positions
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
