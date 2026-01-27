import { useState, useEffect } from 'react';
import { ArrowRight, ArrowDown, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

/**
 * Landing C: "Blueprint"
 * Technical/architectural feel, line-art diagrams, monospace accents
 * Feels like internal documentation made public
 */

const navLinks = [
  { label: 'Architecture', href: '#architecture' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Docs', href: '#docs' },
];

const architecture = [
  { layer: 'INGEST', description: 'Multi-format document parsing, biometric normalization, API aggregation' },
  { layer: 'VERIFY', description: 'Cryptographic attestation, source verification, tamper detection' },
  { layer: 'SCORE', description: 'Pattern analysis, anomaly detection, explainable risk computation' },
  { layer: 'DECIDE', description: 'Policy execution, conditional branching, human escalation' },
  { layer: 'ARCHIVE', description: 'Immutable logging, provenance tracking, regulatory export' },
];

const specs = [
  { label: 'Latency P95', value: '<200ms' },
  { label: 'Throughput', value: '10K req/s' },
  { label: 'Uptime SLA', value: '99.99%' },
  { label: 'Data Retention', value: '7 years' },
];

export default function LandingC() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-sm border-b border-border' : ''
      }`}>
        <div className="container-wide flex items-center justify-between h-16">
          <Link to="/" className="font-mono text-sm font-medium">PORTOLAN_LABS</Link>
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">
                {link.label}
              </a>
            ))}
            <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 font-mono text-xs">
              ACCESS
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero - Technical */}
      <section className="min-h-screen flex items-center pt-16 relative">
        {/* Grid background */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        
        {/* Line decorations */}
        <div className="absolute top-32 left-8 w-px h-32 bg-border hidden lg:block" />
        <div className="absolute top-32 left-8 w-32 h-px bg-border hidden lg:block" />

        <div className="container-wide relative z-10">
          <div className="max-w-4xl">
            <div className="font-mono text-xs text-muted-foreground mb-8 flex items-center gap-4">
              <span className="w-8 h-px bg-accent" />
              <span>COMPLIANCE INFRASTRUCTURE v2.0</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.02] mb-8">
              Evidence standardization.<br />
              Integrity verification.<br />
              Audit-grade decisions.
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed">
              The infrastructure layer for cross-border mobility compliance. Built for government-scale operations.
            </p>

            <div className="flex flex-wrap items-center gap-6 mb-16">
              <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 h-12 px-8 font-mono text-sm">
                REQUEST_ACCESS
              </Button>
              <a href="#architecture" className="font-mono text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
                VIEW_ARCHITECTURE
                <ArrowDown className="w-4 h-4" />
              </a>
            </div>

            {/* Specs strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
              {specs.map((spec) => (
                <div key={spec.label} className="bg-background p-4">
                  <p className="font-mono text-2xl font-semibold">{spec.value}</p>
                  <p className="font-mono text-xs text-muted-foreground uppercase">{spec.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="py-32 border-t border-border">
        <div className="container-wide">
          <div className="mb-16">
            <p className="font-mono text-xs text-accent uppercase tracking-wider mb-4">// SYSTEM ARCHITECTURE</p>
            <h2 className="text-4xl font-semibold tracking-tight">Pipeline overview</h2>
          </div>

          <div className="relative">
            {/* Vertical line connector */}
            <div className="absolute left-[60px] top-0 bottom-0 w-px bg-border hidden md:block" />

            <div className="space-y-0">
              {architecture.map((layer, index) => (
                <div key={layer.layer} className="relative grid md:grid-cols-[120px_1fr] gap-8 py-8 border-b border-border last:border-0">
                  {/* Layer label */}
                  <div className="relative">
                    <div className="md:absolute md:left-0 md:top-0 font-mono text-sm font-semibold bg-background pr-4 z-10">
                      {layer.layer}
                    </div>
                    {/* Node dot */}
                    <div className="hidden md:block absolute left-[56px] top-1 w-2 h-2 bg-accent rounded-full z-10" />
                  </div>
                  
                  {/* Description */}
                  <div className="md:pl-8">
                    <p className="text-muted-foreground">{layer.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technical CTA */}
      <section className="py-32 bg-foreground text-background">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider opacity-50 mb-4">// NEXT STEPS</p>
              <h2 className="text-4xl font-semibold tracking-tight mb-6">Ready to integrate?</h2>
              <p className="text-lg opacity-70 mb-8">
                Request API access and technical documentation for your engineering team.
              </p>
              <div className="flex gap-4">
                <Button size="lg" className="bg-background text-foreground hover:bg-background/90 h-12 px-8 font-mono text-sm">
                  REQUEST_ACCESS
                </Button>
                <Button variant="outline" size="lg" className="border-background/30 text-background hover:bg-background/10 h-12 px-8 font-mono text-sm">
                  VIEW_DOCS
                </Button>
              </div>
            </div>

            <div className="font-mono text-sm opacity-50 leading-relaxed">
              <pre>{`// Example: Risk scoring endpoint
POST /v1/assess
{
  "evidence_pack_id": "ep_a1b2c3",
  "policy_set": "default",
  "options": {
    "include_explainability": true
  }
}

// Response
{
  "risk_score": 0.12,
  "decision": "APPROVE",
  "latency_ms": 142
}`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container-wide flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-muted-foreground">© 2025 PORTOLAN_LABS</p>
          <div className="flex gap-8 font-mono text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">PRIVACY</a>
            <a href="#" className="hover:text-foreground transition-colors">TERMS</a>
            <a href="#" className="hover:text-foreground transition-colors">SECURITY</a>
          </div>
        </div>
      </footer>
    </div>
  );
}