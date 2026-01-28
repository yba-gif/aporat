import { Check } from 'lucide-react';

const differentiators = [
  {
    title: 'Digital Notary certificates',
    description: 'Every document gets a Certificate of Authenticity. Legally defensible in administrative court.',
  },
  {
    title: 'Pre-Submission Risk detection',
    description: 'Vizesepetim signals identify fraud before it reaches government systems. A unique moat.',
  },
  {
    title: 'Explainable Reason Codes',
    description: 'Every risk score includes legally valid justification. Not "AI says so" but evidence chains.',
  },
  {
    title: 'Cross-border intelligence',
    description: 'When a fraudster is rejected in Berlin and applies in Ankara, we know.',
  },
  {
    title: 'Sovereignty Engine',
    description: 'On-premise, air-gapped, or sovereign cloud. Offline-capable for unstable connections.',
  },
  {
    title: 'Case Management Workspace',
    description: 'Purpose-built UI for consular officers. Not dashboards - workspaces for decisions.',
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
            Built for high-stakes operations.
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
