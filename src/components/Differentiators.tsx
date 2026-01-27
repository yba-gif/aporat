import { Check } from 'lucide-react';

const differentiators = [
  {
    title: 'Explainable integrity checks',
    description: 'Every risk score includes rationale and source attribution, ready for regulatory scrutiny.',
  },
  {
    title: 'Policy as deployable code',
    description: 'Define compliance logic once, deploy across environments with version control, rollback, and audit trails.',
  },
  {
    title: 'Audit-grade chain-of-custody',
    description: 'Cryptographically-linked logs for demanding government and enterprise audits.',
  },
  {
    title: 'Graph-based threat detection',
    description: 'Network analysis surfaces coordinated patterns across entities that siloed systems miss.',
  },
  {
    title: 'Sovereign deployment options',
    description: 'On-premise, air-gapped, or cloud. Your data stays where your security requirements demand.',
  },
];

export function Differentiators() {
  return (
    <section className="section-padding border-t border-border">
      <div className="container-wide">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <p className="text-label mb-4">Why Portolan</p>
          <h2 className="text-headline mb-4">
            Built for governments and enterprises.
          </h2>
        </div>

        {/* Differentiators List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
          {differentiators.map((item, index) => (
            <div
              key={item.title}
              className="group flex items-start gap-4 p-4 -m-4 hover:bg-secondary transition-colors"
            >
              <div className="p-1 bg-accent/10 text-accent shrink-0 mt-0.5">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-medium mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
