import { useEffect, useState, useRef } from 'react';

interface Step {
  id: string;
  label: string;
  input: string;
  process: string;
  output: string;
}

const steps: Step[] = [
  {
    id: 'ingest',
    label: 'Ingest',
    input: 'Raw documents, forms, biometrics',
    process: 'Multi-format parsing',
    output: 'Structured evidence objects',
  },
  {
    id: 'normalize',
    label: 'Normalize',
    input: 'Evidence objects',
    process: 'Schema alignment',
    output: 'Canonical data model',
  },
  {
    id: 'verify',
    label: 'Verify',
    input: 'Canonical records',
    process: 'Integrity checks',
    output: 'Validated + scored',
  },
  {
    id: 'decide',
    label: 'Decide',
    input: 'Verified data + policy',
    process: 'Rule evaluation',
    output: 'Workflow resolution',
  },
  {
    id: 'audit',
    label: 'Audit',
    input: 'Decision events',
    process: 'Immutable logging',
    output: 'Compliance record',
  },
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <section ref={sectionRef} className="section-padding bg-surface-elevated/50 border-y border-border">
      <div className="container-wide">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <p className="text-label mb-4">How it works</p>
          <h2 className="text-headline mb-4">
            From evidence to audit.
          </h2>
          <p className="text-body">
            A continuous pipeline that standardizes, verifies, and records every mobility decision.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-8 left-0 right-0 h-px bg-border" />
          
          {/* Progress line */}
          <div
            className="hidden lg:block absolute top-8 left-0 h-px bg-accent transition-all duration-500"
            style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
          />

          {/* Step cards */}
          <div className="grid md:grid-cols-5 gap-6">
            {steps.map((step, index) => {
              const isActive = index === activeStep;
              const isPast = index < activeStep;

              return (
                <div
                  key={step.id}
                  className={`relative transition-all duration-300 cursor-pointer ${
                    isInView ? 'animate-fade-up' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setActiveStep(index)}
                >
                  {/* Node */}
                  <div
                    className={`w-4 h-4 rounded-full border-2 mx-auto mb-4 transition-all duration-300 ${
                      isActive
                        ? 'bg-accent border-accent scale-125'
                        : isPast
                        ? 'bg-accent border-accent'
                        : 'bg-background border-border'
                    }`}
                  />

                  {/* Card */}
                  <div
                    className={`p-4 border transition-all duration-300 ${
                      isActive
                        ? 'border-accent bg-background shadow-lg shadow-accent/5'
                        : 'border-border bg-background/50 hover:border-line-strong'
                    }`}
                  >
                    <h3 className="font-semibold text-center mb-4">{step.label}</h3>
                    
                    <div className="space-y-3 text-xs">
                      <div>
                        <p className="text-muted-foreground mb-1">Input</p>
                        <p className="font-mono text-foreground/80">{step.input}</p>
                      </div>
                      <div className="flex justify-center">
                        <svg width="12" height="12" viewBox="0 0 12 12" className="text-accent">
                          <path d="M6 0 L6 12 M2 8 L6 12 L10 8" stroke="currentColor" fill="none" strokeWidth="1.5" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Process</p>
                        <p className="font-mono text-foreground/80">{step.process}</p>
                      </div>
                      <div className="flex justify-center">
                        <svg width="12" height="12" viewBox="0 0 12 12" className="text-accent">
                          <path d="M6 0 L6 12 M2 8 L6 12 L10 8" stroke="currentColor" fill="none" strokeWidth="1.5" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Output</p>
                        <p className="font-mono text-foreground/80">{step.output}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
