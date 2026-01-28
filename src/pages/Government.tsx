import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Shield, FileCheck, Network, Clock, Globe, Lock } from 'lucide-react';

const capabilities = [
  {
    icon: FileCheck,
    title: 'Evidence Ingestion',
    description: 'Unified intake for passports, bank statements, employment letters, and supporting documents. OCR extraction with metadata validation.',
  },
  {
    icon: Network,
    title: 'Fraud Detection',
    description: 'Graph-based analysis surfaces coordinated fraud rings. Detect duplicate documents across applications and consulates.',
  },
  {
    icon: Shield,
    title: 'Policy Enforcement',
    description: 'Configure visa categories, eligibility rules, and risk thresholds. Propagate changes to all posts instantly.',
  },
  {
    icon: Clock,
    title: 'Decision Workflows',
    description: 'Structured review queues with escalation paths. Every decision linked to underlying evidence.',
  },
  {
    icon: Globe,
    title: 'Global Coordination',
    description: 'Cross-consulate visibility into application patterns. Real-time operational awareness across 250+ posts.',
  },
  {
    icon: Lock,
    title: 'Sovereign Control',
    description: 'On-premise or sovereign cloud deployment. Data never leaves your jurisdiction. Full audit trails.',
  },
];

const metrics = [
  { value: '99.7%', label: 'Document verification accuracy' },
  { value: '<200ms', label: 'Policy propagation latency' },
  { value: '60-80%', label: 'Processing time reduction' },
  { value: 'SOC 2', label: 'Type II certified' },
];

export default function Government() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Hero */}
        <section className="relative min-h-[80vh] flex items-center pt-20">
          <div className="absolute inset-0 bg-grid-fade pointer-events-none" />
          
          <div className="container-wide relative z-10">
            <div className="max-w-3xl">
              <p className="text-label mb-4 animate-fade-up">Government & Consular</p>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] mb-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
                Mobility compliance infrastructure
                <br />
                <span className="text-muted-foreground">for sovereign operations.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl animate-fade-up" style={{ animationDelay: '200ms' }}>
                Unified evidence intake. Verified document integrity. Audit-grade decision workflows. 
                Built for consular operations where every visa, every credential, and every decision must be defensible.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 animate-fade-up" style={{ animationDelay: '300ms' }}>
                <Button
                  size="lg"
                  onClick={() => document.getElementById('contact-gov')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-foreground text-background hover:bg-foreground/90 px-8"
                >
                  Request briefing
                </Button>
                <span className="text-sm text-muted-foreground">Sovereign deployment available</span>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Statement */}
        <section className="section-padding border-t border-border">
          <div className="container-wide">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
              <div>
                <p className="text-label mb-4">The Challenge</p>
                <h2 className="text-headline mb-6">
                  Consular operations face asymmetric information warfare.
                </h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Organized networks deploy sophisticated document forgery at scale. The same fraudulent bank statement appears across dozens of applications submitted to different consulates. Legacy systems cannot detect these patterns.
                </p>
                <p>
                  Meanwhile, policy changes take weeks to propagate. Diplomatic shifts require immediate response, but updating 250+ posts manually creates dangerous gaps.
                </p>
                <p>
                  When decisions are challenged, officers struggle to reconstruct the evidence chain. Audit trails are fragmented across systems.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section className="section-padding bg-secondary/30">
          <div className="container-wide">
            <div className="max-w-2xl mb-12">
              <p className="text-label mb-4">Capabilities</p>
              <h2 className="text-headline">
                End-to-end decision infrastructure.
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {capabilities.map((cap) => {
                const Icon = cap.icon;
                return (
                  <div key={cap.title} className="p-6 bg-background border border-border hover:border-line-strong transition-colors">
                    <div className="p-2 border border-border bg-secondary w-fit mb-4">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="font-semibold mb-2">{cap.title}</h3>
                    <p className="text-sm text-muted-foreground">{cap.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Metrics */}
        <section className="section-padding border-t border-border">
          <div className="container-wide">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {metrics.map((metric) => (
                <div key={metric.label} className="text-center lg:text-left">
                  <div className="text-3xl md:text-4xl font-semibold mb-2">{metric.value}</div>
                  <div className="text-sm text-muted-foreground">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Data Sovereignty */}
        <section className="section-padding bg-foreground text-background">
          <div className="container-wide">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-xs font-mono tracking-widest text-background/60 mb-4 uppercase">Sovereign Data Control</p>
                <h2 className="text-3xl md:text-4xl font-semibold mb-6">
                  Your data never leaves your jurisdiction.
                </h2>
                <p className="text-background/70 mb-6">
                  Deploy on-premise or in your sovereign cloud. Full control over encryption keys, access policies, and data residency. We provide the infrastructure; you define the rules.
                </p>
                <ul className="space-y-3 text-sm text-background/80">
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                    On-premise or sovereign cloud deployment
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                    Customer-controlled encryption keys
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                    GDPR, KVKK, and local compliance ready
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                    NATO-grade security architecture
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="aspect-square bg-background/5 border border-background/10 p-8 flex items-center justify-center">
                  <div className="text-center">
                    <Lock className="w-16 h-16 text-accent mx-auto mb-4" />
                    <p className="text-lg font-semibold">Sovereign Control</p>
                    <p className="text-sm text-background/60">Full data residency compliance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="contact-gov" className="section-padding">
          <div className="container-wide">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-headline mb-4">
                Ready for a technical briefing?
              </h2>
              <p className="text-body mb-8">
                Schedule a secure briefing with our government solutions team. Discuss your operational requirements and see a tailored demonstration.
              </p>
              <Button
                size="lg"
                onClick={() => window.location.href = '/#contact'}
                className="bg-foreground text-background hover:bg-foreground/90 px-8"
              >
                Request briefing
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
