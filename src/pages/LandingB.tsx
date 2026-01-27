import { useState, useEffect } from 'react';
import { ArrowRight, Menu, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

/**
 * Landing B: "Editorial"
 * Clean white space, asymmetric layout, magazine-style typography
 * Premium feel with strategic accent color
 */

const navLinks = [
  { label: 'Platform', href: '#platform' },
  { label: 'Use Cases', href: '#use-cases' },
  { label: 'Company', href: '#company' },
];

const pillars = [
  { number: '01', title: 'Evidence', desc: 'Unified data fabric for heterogeneous inputs' },
  { number: '02', title: 'Integrity', desc: 'Real-time verification and risk scoring' },
  { number: '03', title: 'Workflow', desc: 'Configurable decision automation' },
  { number: '04', title: 'Audit', desc: 'Immutable compliance archive' },
];

const useCases = [
  {
    title: 'Border Security',
    description: 'Modernize checkpoint operations with unified evidence processing and real-time risk assessment.',
  },
  {
    title: 'Immigration Services',
    description: 'Streamline application processing while maintaining full audit compliance.',
  },
  {
    title: 'Enterprise Mobility',
    description: 'Manage global workforce compliance with automated policy enforcement.',
  },
];

export default function LandingB() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar - Minimal */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-sm' : ''
      }`}>
        <div className="container-wide flex items-center justify-between h-20">
          <Link to="/" className="font-semibold text-xl tracking-tight">Portolan</Link>
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {link.label}
              </a>
            ))}
            <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90">
              Get started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero - Editorial split */}
      <section className="min-h-screen pt-20">
        <div className="container-wide">
          <div className="grid lg:grid-cols-[1.2fr_1fr] min-h-[calc(100vh-5rem)]">
            {/* Left: Typography */}
            <div className="flex flex-col justify-center py-20 pr-12">
              <p className="text-label text-accent mb-6">Mobility Compliance Infrastructure</p>
              
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-[0.95] mb-8">
                Compliance<br />
                at scale.
              </h1>

              <p className="text-xl text-muted-foreground max-w-md mb-10 leading-relaxed">
                The infrastructure layer for cross-border mobility decisions.
              </p>

              <div className="flex gap-4">
                <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 h-12 px-6">
                  Request access
                </Button>
                <Button variant="ghost" size="lg" className="h-12 px-6 text-muted-foreground hover:text-foreground">
                  Learn more →
                </Button>
              </div>
            </div>

            {/* Right: Abstract visual */}
            <div className="relative border-l border-border flex items-center justify-center">
              <div className="absolute inset-0 bg-grid opacity-50" />
              
              {/* Geometric composition */}
              <div className="relative w-80 h-80">
                <div className="absolute top-0 left-0 w-40 h-40 border border-foreground" />
                <div className="absolute top-20 left-20 w-40 h-40 bg-accent" />
                <div className="absolute top-40 left-40 w-40 h-40 border border-foreground" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars - Numbered list */}
      <section id="platform" className="py-32 border-t border-border">
        <div className="container-wide">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-16">
            <div>
              <p className="text-label mb-4">The Platform</p>
              <h2 className="text-4xl font-semibold tracking-tight">
                Four layers,<br />one system.
              </h2>
            </div>

            <div className="space-y-0">
              {pillars.map((pillar, index) => (
                <div key={pillar.number} className={`py-8 ${index !== pillars.length - 1 ? 'border-b border-border' : ''}`}>
                  <div className="flex items-start gap-8">
                    <span className="text-5xl font-light text-muted-foreground/30">{pillar.number}</span>
                    <div>
                      <h3 className="text-2xl font-semibold mb-2">{pillar.title}</h3>
                      <p className="text-muted-foreground">{pillar.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="py-32 bg-secondary">
        <div className="container-wide">
          <div className="mb-16">
            <p className="text-label mb-4">Use Cases</p>
            <h2 className="text-4xl font-semibold tracking-tight">Built for critical operations.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase) => (
              <div key={useCase.title} className="bg-background p-10 border border-border">
                <h3 className="text-xl font-semibold mb-4">{useCase.title}</h3>
                <p className="text-muted-foreground mb-6">{useCase.description}</p>
                <a href="#" className="text-sm font-medium inline-flex items-center gap-2 group">
                  Learn more
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Full width band */}
      <section className="py-20 bg-foreground text-background">
        <div className="container-wide flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight mb-2">Ready to start?</h2>
            <p className="text-background/60">Schedule a demo with our team.</p>
          </div>
          <Button size="lg" className="bg-background text-foreground hover:bg-background/90 h-12 px-8">
            Request demo
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-border">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div>
              <p className="font-semibold text-xl mb-2">Portolan Labs</p>
              <p className="text-sm text-muted-foreground">Mobility compliance infrastructure.</p>
            </div>
            <div className="flex gap-12 text-sm">
              <div className="space-y-3">
                <p className="font-medium">Platform</p>
                <a href="#" className="block text-muted-foreground hover:text-foreground">Evidence Fabric</a>
                <a href="#" className="block text-muted-foreground hover:text-foreground">Integrity Engine</a>
                <a href="#" className="block text-muted-foreground hover:text-foreground">Workflows</a>
              </div>
              <div className="space-y-3">
                <p className="font-medium">Company</p>
                <a href="#" className="block text-muted-foreground hover:text-foreground">About</a>
                <a href="#" className="block text-muted-foreground hover:text-foreground">Careers</a>
                <a href="#" className="block text-muted-foreground hover:text-foreground">Contact</a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
            <p>© 2025 Portolan Labs</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground">Privacy</a>
              <a href="#" className="hover:text-foreground">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}