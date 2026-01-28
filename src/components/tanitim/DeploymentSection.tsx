import { Shield, Cloud, Building2, Check } from 'lucide-react';

const deploymentOptions = [
  {
    icon: Building2,
    name: 'Sovereign Platform',
    description: 'Ministry-owned infrastructure on BTK/TÜBİTAK cloud',
    timeline: '6 months',
    control: 'Full Ministry ownership',
    features: [
      'Complete data sovereignty',
      'Ministry-branded interface',
      'Air-gapped option available',
      'Full source code escrow',
    ],
    recommended: true,
  },
  {
    icon: Cloud,
    name: 'Managed Service',
    description: 'Turkish-hosted, Portolan-operated infrastructure',
    timeline: '3 months',
    control: 'Shared operational model',
    features: [
      'Turkish jurisdiction only',
      'Portolan manages updates',
      'SLA-backed availability',
      'Rapid deployment',
    ],
    recommended: false,
  },
  {
    icon: Shield,
    name: '90-Day Pilot',
    description: 'Single consulate proof-of-value deployment',
    timeline: '90 days',
    control: 'Full Ministry oversight',
    features: [
      'Isolated environment',
      'Parallel processing',
      'Metrics-driven evaluation',
      'No commitment required',
    ],
    recommended: false,
  },
];

export function DeploymentSection() {
  return (
    <section className="section-padding bg-surface-elevated border-t border-border">
      <div className="container-wide">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-label mb-4">Deployment</p>
          <h2 className="text-headline max-w-2xl mx-auto mb-4">
            Your data never leaves Turkey
          </h2>
          <p className="text-body max-w-xl mx-auto">
            Choose the deployment model that matches your sovereignty requirements and timeline.
          </p>
        </div>

        {/* Deployment options */}
        <div className="grid lg:grid-cols-3 gap-6">
          {deploymentOptions.map((option) => (
            <div 
              key={option.name}
              className={`p-6 bg-background border ${
                option.recommended 
                  ? 'border-accent ring-1 ring-accent' 
                  : 'border-border'
              } relative`}
            >
              {option.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-accent-foreground text-xs font-medium">
                  Recommended
                </div>
              )}

              <option.icon className="w-6 h-6 text-accent mb-4" />
              <h3 className="font-semibold mb-1">{option.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{option.description}</p>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Timeline</span>
                  <span className="font-medium">{option.timeline}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Control</span>
                  <span className="font-medium">{option.control}</span>
                </div>
              </div>

              <ul className="space-y-2">
                {option.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-accent shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contrast callout */}
        <div className="mt-12 p-6 bg-accent/5 border border-accent/20 text-center">
          <p className="text-sm">
            <strong>Contrast with current state:</strong> VFS Global and iDATA route data through foreign infrastructure. Portolan keeps Turkish data in Turkey.
          </p>
        </div>
      </div>
    </section>
  );
}
