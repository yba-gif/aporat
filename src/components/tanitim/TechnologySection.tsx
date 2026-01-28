import { Cpu, Network, Shield, Zap } from 'lucide-react';

const techFeatures = [
  {
    icon: Cpu,
    title: 'SHA-256 Document Hashing',
    description: 'Cryptographic fingerprinting detects when identical forged documents appear across multiple consulates.',
    tags: ['Cryptography', 'Tamper Detection'],
  },
  {
    icon: Network,
    title: 'Graph-Based Entity Resolution',
    description: 'Relationship analysis surfaces visa mills, shared addresses, and coordinated submission patterns.',
    tags: ['Graph Algorithms', 'Pattern Matching'],
  },
  {
    icon: Shield,
    title: 'Policy-as-Code Engine',
    description: 'Compliance rules defined once, deployed globally with version control and instant rollback.',
    tags: ['GitOps', 'Real-time Sync'],
  },
  {
    icon: Zap,
    title: 'Real-time Processing Pipeline',
    description: 'Documents ingested, analyzed, and scored in under 3 seconds. No batch delays.',
    tags: ['Stream Processing', 'Low Latency'],
  },
];

const metrics = [
  { value: '<3s', label: 'Document Processing', description: 'End-to-end ingestion to score' },
  { value: '60s', label: 'Global Propagation', description: 'Policy updates to all consulates' },
  { value: '99.9%', label: 'Uptime SLA', description: 'Enterprise availability guarantee' },
  { value: '50+', label: 'Document Types', description: 'Passports, statements, letters' },
];

export function TechnologySection() {
  return (
    <section className="section-padding bg-foreground text-background">
      <div className="container-wide">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-label text-accent mb-4">Deep Tech</p>
          <h2 className="text-headline text-background max-w-2xl mx-auto">
            Infrastructure built for government-grade operations
          </h2>
        </div>

        {/* Tech features grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {techFeatures.map((feature) => (
            <div 
              key={feature.title}
              className="p-6 bg-background/5 border border-background/10"
            >
              <feature.icon className="w-6 h-6 text-accent mb-4" />
              <h3 className="font-semibold text-background mb-2">{feature.title}</h3>
              <p className="text-sm text-background/70 mb-4">{feature.description}</p>
              <div className="flex gap-2">
                {feature.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="text-xs px-2 py-1 bg-accent/20 text-accent font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div 
              key={metric.label}
              className="text-center p-6 bg-background/5 border border-background/10"
            >
              <p className="text-3xl font-semibold text-accent mb-1">{metric.value}</p>
              <p className="text-sm font-medium text-background mb-0.5">{metric.label}</p>
              <p className="text-xs text-background/50">{metric.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
