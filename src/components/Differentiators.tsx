import { Check } from 'lucide-react';

const differentiators = [
  {
    title: 'Pre-submission intelligence',
    description: 'Detect threats before they reach government systems. A private upstream channel that filters, scores, and flags.',
  },
  {
    title: 'Cross-jurisdiction awareness',
    description: 'When a threat actor is rejected in one post and applies at another, the system knows. Intelligence no single office can achieve alone.',
  },
  {
    title: 'Explainable reason codes',
    description: 'Every risk score includes legally valid justification. Evidence chains, not black boxes.',
  },
  {
    title: 'Sovereignty engine',
    description: 'On-premise, air-gapped, or sovereign cloud. Offline-capable for unstable connections.',
  },
  {
    title: 'Cryptographic provenance',
    description: 'Every document gets a Certificate of Authenticity. Legally defensible. Tamper-proof.',
  },
  {
    title: 'Decision workspace',
    description: 'Purpose-built for officers. Not dashboards. Workspaces for decisions.',
  },
];

export function Differentiators() {
  return (
    <section className="section-padding border-t border-border">
      <div className="container-wide">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <p className="text-label mb-4">Why ALPAGUT</p>
          <h2 className="text-headline mb-4">
            Built for what's at stake.
          </h2>
        </div>

        {/* Differentiators List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
          {differentiators.map((item) => (
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
