import { useState, useEffect } from 'react';
import { ArrowRight, Menu, X, Shield, FileCheck, Settings, ChevronRight, Database, GitBranch, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

/**
 * Landing A: "Command Center"
 * Dark mode, full-bleed hero, data-dense aesthetic
 * Inspired by mission control / intelligence dashboards
 */

const navLinks = [
  { label: 'Platform', href: '#platform' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Security', href: '#security' },
  { label: 'Company', href: '#company' },
];

const capabilities = [
  {
    icon: Database,
    title: 'Evidence Fabric',
    description: 'Unified data layer for documents, biometrics, and third-party signals.',
  },
  {
    icon: Shield,
    title: 'Integrity Engine',
    description: 'Real-time verification with explainable risk scoring.',
  },
  {
    icon: GitBranch,
    title: 'Decision Workflows',
    description: 'Configurable policy execution with human-in-the-loop escalation.',
  },
  {
    icon: Archive,
    title: 'Audit Archive',
    description: 'Immutable records with regulator-ready export.',
  },
];

const stats = [
  { value: '<200ms', label: 'Decision latency' },
  { value: '99.7%', label: 'Detection accuracy' },
  { value: '2.4M+', label: 'Monthly decisions' },
];

export default function LandingA() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(0,0%,4%)] text-[hsl(0,0%,96%)]">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[hsl(0,0%,4%)]/95 backdrop-blur-sm border-b border-[hsl(0,0%,15%)]' : ''
      }`}>
        <div className="container-wide flex items-center justify-between h-16">
          <Link to="/" className="font-semibold text-lg tracking-tight">Portolan Labs</Link>
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="text-sm text-[hsl(0,0%,60%)] hover:text-white transition-colors">
                {link.label}
              </a>
            ))}
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-[hsl(0,0%,60%)] hover:text-white hover:bg-white/10">
              Talk to sales
            </Button>
            <Button size="sm" className="bg-white text-black hover:bg-white/90">
              Request access
            </Button>
          </div>
          <button className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Hero - Full bleed dark */}
      <section className="min-h-screen flex items-center pt-16 relative overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(hsl(0,0%,20%) 1px, transparent 1px), linear-gradient(90deg, hsl(0,0%,20%) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        {/* Accent glow */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[hsl(174,62%,32%)] rounded-full blur-[200px] opacity-20" />

        <div className="container-wide relative z-10">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-2 h-2 bg-[hsl(174,62%,45%)] animate-pulse" />
              <span className="text-xs font-medium uppercase tracking-widest text-[hsl(0,0%,50%)]">
                Compliance Infrastructure
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] mb-8">
              The decision layer<br />
              for global mobility.
            </h1>

            <p className="text-xl text-[hsl(0,0%,60%)] max-w-2xl mb-10 leading-relaxed">
              Standardize evidence. Detect integrity risks. Deliver audit-grade workflows—at the speed your operations demand.
            </p>

            <div className="flex flex-wrap gap-4 mb-16">
              <Button size="lg" className="bg-white text-black hover:bg-white/90 h-14 px-8 text-base">
                Request access
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="border-[hsl(0,0%,25%)] text-white hover:bg-white/5 h-14 px-8 text-base">
                View documentation
              </Button>
            </div>

            {/* Stats strip */}
            <div className="flex gap-12">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-semibold text-[hsl(174,62%,45%)]">{stat.value}</p>
                  <p className="text-sm text-[hsl(0,0%,50%)]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-[hsl(0,0%,30%)] to-transparent" />
        </div>
      </section>

      {/* Capabilities */}
      <section id="platform" className="py-32 border-t border-[hsl(0,0%,12%)]">
        <div className="container-wide">
          <div className="mb-16">
            <p className="text-xs font-medium uppercase tracking-widest text-[hsl(0,0%,50%)] mb-4">Platform</p>
            <h2 className="text-4xl font-semibold tracking-tight">Four integrated layers.</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-px bg-[hsl(0,0%,12%)]">
            {capabilities.map((cap) => (
              <div key={cap.title} className="bg-[hsl(0,0%,4%)] p-10 group hover:bg-[hsl(0,0%,7%)] transition-colors">
                <cap.icon className="w-8 h-8 mb-6 text-[hsl(174,62%,45%)]" strokeWidth={1.5} />
                <h3 className="text-xl font-semibold mb-3">{cap.title}</h3>
                <p className="text-[hsl(0,0%,55%)] leading-relaxed">{cap.description}</p>
                <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm text-[hsl(174,62%,45%)] inline-flex items-center gap-1">
                    Learn more <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 border-t border-[hsl(0,0%,12%)]">
        <div className="container-wide text-center">
          <h2 className="text-4xl font-semibold tracking-tight mb-6">Ready to modernize your compliance stack?</h2>
          <p className="text-lg text-[hsl(0,0%,55%)] mb-10 max-w-xl mx-auto">
            Schedule a technical walkthrough with our team.
          </p>
          <Button size="lg" className="bg-white text-black hover:bg-white/90 h-14 px-10">
            Request demo
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[hsl(0,0%,12%)]">
        <div className="container-wide flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[hsl(0,0%,45%)]">© 2025 Portolan Labs. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-[hsl(0,0%,45%)]">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}