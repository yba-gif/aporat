import { useState } from 'react';
import { ArrowRight, Check, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const workflowSteps = [
  {
    id: 1,
    label: 'INGEST',
    title: 'Evidence Collection',
    description: 'Documents, biometrics, and metadata ingested from disparate sources into a unified evidence layer.',
    status: 'complete',
  },
  {
    id: 2,
    label: 'VALIDATE',
    title: 'Integrity Verification',
    description: 'Multi-modal checks against authoritative sources. Cryptographic sealing of verified artifacts.',
    status: 'complete',
  },
  {
    id: 3,
    label: 'ANALYZE',
    title: 'Risk Assessment',
    description: 'Pattern detection across historical data. Anomaly scoring with explainable outputs.',
    status: 'active',
  },
  {
    id: 4,
    label: 'DECIDE',
    title: 'Policy Execution',
    description: 'Configurable decision logic with full audit trail. Human-in-the-loop escalation paths.',
    status: 'pending',
  },
  {
    id: 5,
    label: 'AUDIT',
    title: 'Compliance Archive',
    description: 'Immutable record of every decision. Regulator-ready export formats.',
    status: 'pending',
  },
];

export default function DemoA() {
  const [activeStep, setActiveStep] = useState(3);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container-wide flex items-center justify-between h-16">
          <Link to="/" className="text-sm font-medium">
            ← Back to Home
          </Link>
          <span className="text-label">Demo Variant A</span>
        </div>
      </header>

      {/* Hero */}
      <section className="section-padding border-b border-border">
        <div className="container-wide">
          <p className="text-label mb-4">Interactive Workflow</p>
          <h1 className="text-display max-w-3xl mb-6">
            Experience the compliance pipeline.
          </h1>
          <p className="text-subhead max-w-2xl">
            Step through each stage of evidence processing—from ingestion to audit-ready archive.
          </p>
        </div>
      </section>

      {/* Workflow Visualization */}
      <section className="py-20">
        <div className="container-wide">
          <div className="grid lg:grid-cols-[300px_1fr] gap-12">
            {/* Steps List */}
            <div className="space-y-2">
              {workflowSteps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`w-full text-left p-4 border transition-all duration-200 ${
                    activeStep === step.id
                      ? 'border-foreground bg-secondary'
                      : 'border-border hover:border-line-strong hover:bg-secondary/50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-6 h-6 flex items-center justify-center text-xs ${
                        step.status === 'complete'
                          ? 'bg-accent text-accent-foreground'
                          : step.status === 'active'
                          ? 'bg-foreground text-background'
                          : 'bg-secondary text-muted-foreground border border-border'
                      }`}
                    >
                      {step.status === 'complete' ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <span className="text-label">{step.label}</span>
                  </div>
                  <p className="font-medium">{step.title}</p>
                </button>
              ))}
            </div>

            {/* Active Step Detail */}
            <div className="bg-surface-elevated border border-border p-12">
              <div className="mb-8">
                <span className="text-label text-accent">
                  Step {workflowSteps[activeStep - 1].id} of 5
                </span>
              </div>
              <h2 className="text-headline mb-4">
                {workflowSteps[activeStep - 1].title}
              </h2>
              <p className="text-body max-w-lg mb-8">
                {workflowSteps[activeStep - 1].description}
              </p>

              {/* Visual Representation */}
              <div className="bg-background border border-border p-8 mb-8">
                <div className="flex items-center gap-4 text-mono text-muted-foreground">
                  <div className="node-ring" />
                  <span>workflow.{workflowSteps[activeStep - 1].label.toLowerCase()}()</span>
                  <ChevronRight className="w-4 h-4" />
                  <span className={activeStep < 4 ? 'text-accent' : 'text-muted-foreground/50'}>
                    {activeStep < 5 ? 'PROCESSING' : 'COMPLETE'}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                  disabled={activeStep === 1}
                  className="px-6 py-3 border border-border text-sm font-medium disabled:opacity-30"
                >
                  Previous
                </button>
                <button
                  onClick={() => setActiveStep(Math.min(5, activeStep + 1))}
                  disabled={activeStep === 5}
                  className="px-6 py-3 bg-foreground text-background text-sm font-medium disabled:opacity-30"
                >
                  Next Step
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-foreground text-background">
        <div className="container-wide text-center">
          <h2 className="text-headline mb-4">Ready for a live walkthrough?</h2>
          <p className="text-lg opacity-70 mb-8 max-w-lg mx-auto">
            See how Portolan Labs integrates with your existing infrastructure.
          </p>
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-background text-foreground font-medium">
            Request Demo
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
