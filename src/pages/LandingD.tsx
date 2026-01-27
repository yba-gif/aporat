import { useState, useEffect } from 'react';
import { ArrowRight, Menu, X, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

/**
 * Landing D: "Statement"
 * Massive typography, dramatic scroll sections, bold declarations
 * High-confidence, minimal elements, maximum impact
 */

const statements = [
  { headline: 'Evidence chaos', subhead: 'becomes structured data.' },
  { headline: 'Integrity gaps', subhead: 'become detected risks.' },
  { headline: 'Manual decisions', subhead: 'become auditable workflows.' },
];

const proof = [
  { metric: '94%', description: 'Reduction in processing time' },
  { metric: '3%', description: 'Manual review rate' },
  { metric: '0', description: 'Compliance violations' },
];

export default function LandingD() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar - Ultra minimal */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-sm' : ''
      }`}>
        <div className="container-wide flex items-center justify-between h-20">
          <Link to="/" className="font-semibold tracking-tight">Portolan Labs</Link>
          <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90">
            Request access
          </Button>
        </div>
      </nav>

      {/* Hero - One big statement */}
      <section className="min-h-screen flex items-center justify-center pt-20">
        <div className="container-wide text-center">
          <p className="text-label text-accent mb-8">Mobility Compliance Infrastructure</p>
          
          <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-semibold tracking-tighter leading-[0.9] mb-12">
            Compliance,<br />engineered.
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12">
            The infrastructure layer for government-scale mobility decisions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 h-14 px-10 text-lg">
              Get started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Transformation statements */}
      {statements.map((statement, index) => (
        <section key={index} className="py-40 border-t border-border">
          <div className="container-wide">
            <div className="max-w-5xl">
              <h2 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05]">
                <span className="text-muted-foreground line-through decoration-accent decoration-4">{statement.headline}</span>
                <br />
                {statement.subhead}
              </h2>
            </div>
          </div>
        </section>
      ))}

      {/* Proof section */}
      <section className="py-40 bg-foreground text-background">
        <div className="container-wide">
          <p className="text-xs font-medium uppercase tracking-widest opacity-50 mb-16 text-center">
            Verified Outcomes
          </p>

          <div className="grid md:grid-cols-3 gap-16 max-w-4xl mx-auto">
            {proof.map((item) => (
              <div key={item.metric} className="text-center">
                <p className="text-7xl md:text-8xl font-semibold tracking-tight mb-4">{item.metric}</p>
                <p className="text-lg opacity-70">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video teaser */}
      <section className="py-40 border-t border-border">
        <div className="container-wide">
          <div className="aspect-video bg-secondary relative group cursor-pointer max-w-5xl mx-auto">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-foreground text-background flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-10 h-10 ml-2" fill="currentColor" />
              </div>
            </div>
            <div className="absolute inset-0 bg-grid opacity-20" />
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/50 to-transparent">
              <p className="text-white text-xl font-semibold">Watch the 3-minute overview</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 border-t border-border">
        <div className="container-wide text-center">
          <h2 className="text-5xl md:text-7xl font-semibold tracking-tight mb-12">
            Start building.
          </h2>
          <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 h-16 px-12 text-lg">
            Request access
            <ArrowRight className="w-5 h-5 ml-3" />
          </Button>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="py-8 border-t border-border">
        <div className="container-wide flex items-center justify-between text-sm text-muted-foreground">
          <p>© 2025 Portolan Labs</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}