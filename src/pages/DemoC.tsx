import { ArrowRight, Database, Shield, GitBranch, Archive } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    id: 'evidence',
    icon: Database,
    title: 'Evidence Fabric',
    subtitle: 'Unified data layer',
    description: 'Ingest documents, biometrics, and third-party signals into a normalized schema. Transform heterogeneous inputs into structured, queryable evidence.',
    capabilities: [
      'Multi-format document parsing',
      'Biometric template normalization',
      'Third-party API aggregation',
      'Cryptographic attestation',
    ],
  },
  {
    id: 'integrity',
    icon: Shield,
    title: 'Integrity Engine',
    subtitle: 'Risk detection',
    description: 'Detect anomalies, verify authenticity, and compute risk scores with explainable outputs. Cross-reference against authoritative data sources.',
    capabilities: [
      'Document tampering detection',
      'Identity verification checks',
      'Historical pattern analysis',
      'Explainable risk scoring',
    ],
  },
  {
    id: 'workflow',
    icon: GitBranch,
    title: 'Decision Workflows',
    subtitle: 'Policy execution',
    description: 'Configure decision logic with visual policy builders. Define escalation paths, approval chains, and human-in-the-loop intervention points.',
    capabilities: [
      'Visual policy configuration',
      'Role-based access control',
      'Conditional branching logic',
      'SLA monitoring & alerts',
    ],
  },
  {
    id: 'audit',
    icon: Archive,
    title: 'Audit Archive',
    subtitle: 'Compliance records',
    description: 'Immutable record of every decision with full provenance chain. Generate regulator-ready reports with one-click export.',
    capabilities: [
      'Tamper-proof decision logs',
      'Full provenance tracking',
      'Regulatory report generation',
      'Long-term retention policies',
    ],
  },
];

export default function DemoC() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container-wide flex items-center justify-between h-16">
          <Link to="/" className="text-sm font-medium">
            ← Back to Home
          </Link>
          <span className="text-label">Demo Variant C</span>
        </div>
      </header>

      {/* Hero */}
      <section className="section-padding border-b border-border">
        <div className="container-wide">
          <p className="text-label mb-4">Platform Capabilities</p>
          <h1 className="text-display max-w-3xl mb-6">
            Four pillars of compliance infrastructure.
          </h1>
          <p className="text-subhead max-w-2xl">
            Each layer is independently deployable, fully auditable, and built for enterprise scale.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 gap-px bg-border">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="bg-background p-10 lg:p-14 group hover:bg-surface-elevated transition-colors duration-300"
              >
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <feature.icon className="w-8 h-8 text-foreground mb-4" strokeWidth={1.5} />
                    <p className="text-label text-accent mb-2">{feature.subtitle}</p>
                    <h3 className="text-2xl font-semibold">{feature.title}</h3>
                  </div>
                </div>

                <p className="text-body mb-8">{feature.description}</p>

                <div className="space-y-3">
                  {feature.capabilities.map((capability, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 text-sm"
                    >
                      <div className="w-1 h-1 bg-accent" />
                      <span>{capability}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-10 pt-6 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="inline-flex items-center gap-2 text-sm font-medium">
                    Learn more
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Diagram */}
      <section className="section-padding border-t border-border bg-surface-elevated">
        <div className="container-wide">
          <div className="text-center mb-12">
            <p className="text-label mb-4">System Architecture</p>
            <h2 className="text-headline">End-to-end data flow</h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between gap-4 py-8">
              {['Ingest', 'Normalize', 'Verify', 'Score', 'Decide', 'Archive'].map(
                (stage, index) => (
                  <div key={stage} className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 border border-foreground flex items-center justify-center mb-2">
                        <span className="text-mono text-sm">{String(index + 1).padStart(2, '0')}</span>
                      </div>
                      <p className="text-xs font-medium">{stage}</p>
                    </div>
                    {index < 5 && (
                      <div className="w-8 h-px bg-border hidden lg:block" />
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-foreground text-background">
        <div className="container-wide text-center">
          <h2 className="text-headline mb-4">See it in action.</h2>
          <p className="text-lg opacity-70 mb-8 max-w-lg mx-auto">
            Request a technical deep-dive with our engineering team.
          </p>
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-background text-foreground font-medium">
            Request Technical Demo
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
