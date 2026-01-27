import { ArrowRight, FileText, Shield, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const metrics = [
  { label: 'Documents Processed', value: '2.4M+', sublabel: 'Monthly volume' },
  { label: 'Risk Detection Rate', value: '99.7%', sublabel: 'Verified accuracy' },
  { label: 'Decision Latency', value: '<200ms', sublabel: 'P95 response time' },
  { label: 'Audit Compliance', value: '100%', sublabel: 'Regulatory pass rate' },
];

const caseStudy = {
  title: 'Border Security Modernization',
  client: 'National Immigration Authority',
  region: 'Southern Europe',
  challenge: 'Legacy systems created 72-hour processing delays with 15% manual review rates. Inconsistent evidence standards across 12 border checkpoints.',
  solution: 'Deployed unified evidence layer with real-time integrity verification. Standardized document processing with automated risk scoring.',
  outcomes: [
    'Processing time reduced from 72 hours to 4 hours',
    'Manual review rate dropped to 3%',
    'Zero compliance violations in 18 months',
    'Full audit trail for 2.4M+ decisions',
  ],
};

export default function DemoB() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container-wide flex items-center justify-between h-16">
          <Link to="/" className="text-sm font-medium">
            ← Back to Home
          </Link>
          <span className="text-label">Demo Variant B</span>
        </div>
      </header>

      {/* Hero */}
      <section className="section-padding border-b border-border bg-grid-fade">
        <div className="container-wide">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 bg-accent" />
            <span className="text-label">Intelligence Briefing</span>
          </div>
          <h1 className="text-display max-w-4xl mb-6">
            Case Study: Border Security Modernization
          </h1>
          <p className="text-subhead max-w-2xl">
            How a national authority reduced processing time by 94% while achieving full regulatory compliance.
          </p>
        </div>
      </section>

      {/* Metrics Strip */}
      <section className="border-b border-border">
        <div className="container-wide">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric, index) => (
              <div
                key={metric.label}
                className={`py-8 px-6 ${
                  index !== metrics.length - 1 ? 'border-r border-border' : ''
                }`}
              >
                <p className="text-3xl font-semibold mb-1">{metric.value}</p>
                <p className="text-sm font-medium">{metric.label}</p>
                <p className="text-xs text-muted-foreground">{metric.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study Content */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left: Context */}
            <div>
              <div className="mb-12">
                <p className="text-label mb-4">Client Profile</p>
                <div className="space-y-3">
                  <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Organization</span>
                    <span className="font-medium">{caseStudy.client}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Region</span>
                    <span className="font-medium">{caseStudy.region}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Sector</span>
                    <span className="font-medium">Government / Border Security</span>
                  </div>
                </div>
              </div>

              <div className="mb-12">
                <p className="text-label mb-4">The Challenge</p>
                <p className="text-body">{caseStudy.challenge}</p>
              </div>

              <div>
                <p className="text-label mb-4">The Solution</p>
                <p className="text-body">{caseStudy.solution}</p>
              </div>
            </div>

            {/* Right: Outcomes */}
            <div>
              <div className="bg-foreground text-background p-10">
                <p className="text-xs font-medium uppercase tracking-widest opacity-50 mb-8">
                  Verified Outcomes
                </p>
                <div className="space-y-6">
                  {caseStudy.outcomes.map((outcome, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-6 h-6 bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-accent-foreground">{index + 1}</span>
                      </div>
                      <p className="text-lg">{outcome}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Element */}
              <div className="mt-8 p-8 border border-border bg-surface-elevated">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex gap-1">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <Shield className="w-5 h-5 text-muted-foreground" />
                    <BarChart3 className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <p className="text-mono text-muted-foreground text-sm">
                  EVIDENCE → VERIFY → SCORE → DECIDE → ARCHIVE
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding border-t border-border">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <h2 className="text-headline mb-2">Request your briefing.</h2>
              <p className="text-body">
                See how similar outcomes apply to your organization.
              </p>
            </div>
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background font-medium">
              Schedule Briefing
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
