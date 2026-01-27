import { useState, useEffect } from 'react';
import { ArrowRight, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

/**
 * Landing E: "Intelligence Dossier"
 * Dense information architecture, sidebar navigation, data tables
 * Feels like accessing classified technical documentation
 */

const navLinks = [
  { label: 'Overview', href: '#overview' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Specifications', href: '#specifications' },
  { label: 'Access', href: '#access' },
];

const capabilities = [
  {
    category: 'Data Ingestion',
    items: [
      'Multi-format document parsing (PDF, images, structured data)',
      'Biometric template normalization across vendors',
      'Third-party signal aggregation via API',
      'Cryptographic attestation at source',
    ],
  },
  {
    category: 'Integrity Verification',
    items: [
      'Document tampering detection (visual + metadata)',
      'Identity verification against authoritative sources',
      'Historical pattern cross-referencing',
      'Real-time watchlist screening',
    ],
  },
  {
    category: 'Risk Assessment',
    items: [
      'Multi-factor scoring with configurable weights',
      'Explainable AI for audit compliance',
      'Threshold-based routing logic',
      'Confidence intervals and uncertainty quantification',
    ],
  },
  {
    category: 'Workflow Automation',
    items: [
      'Visual policy configuration interface',
      'Conditional branching and approval chains',
      'Human-in-the-loop escalation triggers',
      'SLA monitoring and alerting',
    ],
  },
];

const specifications = [
  { label: 'Decision Latency (P95)', value: '<200ms' },
  { label: 'Throughput', value: '10,000 requests/second' },
  { label: 'Availability SLA', value: '99.99%' },
  { label: 'Data Retention', value: '7+ years' },
  { label: 'Encryption', value: 'AES-256, TLS 1.3' },
  { label: 'Compliance', value: 'SOC 2 Type II, ISO 27001' },
  { label: 'Deployment', value: 'Cloud, On-premise, Hybrid' },
  { label: 'API Protocol', value: 'REST, gRPC' },
];

export default function LandingE() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-12 bg-foreground text-background flex items-center">
        <div className="container-wide flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium uppercase tracking-wider opacity-70">Classification:</span>
            <span className="text-xs font-medium bg-accent px-2 py-0.5">UNCLASSIFIED // PUBLIC</span>
          </div>
          <span className="text-xs opacity-50">Document ID: PL-2025-MCI-001</span>
        </div>
      </div>

      {/* Navbar */}
      <nav className={`fixed top-12 left-0 right-0 z-40 transition-all duration-300 bg-background border-b border-border`}>
        <div className="container-wide flex items-center justify-between h-14">
          <Link to="/" className="font-semibold tracking-tight">Portolan Labs</Link>
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {link.label}
              </a>
            ))}
            <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90">
              Request Access
            </Button>
          </div>
        </div>
      </nav>

      {/* Main content with sidebar */}
      <div className="pt-[104px]">
        <div className="container-wide">
          <div className="grid lg:grid-cols-[250px_1fr] gap-12">
            {/* Sidebar - Table of Contents */}
            <aside className="hidden lg:block py-12">
              <div className="sticky top-32">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">Contents</p>
                <nav className="space-y-1">
                  {navLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className={`block py-2 text-sm border-l-2 pl-4 transition-colors ${
                        activeSection === link.href.slice(1)
                          ? 'border-accent text-foreground'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>

                <div className="mt-12 pt-8 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-4">Quick Actions</p>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                      Download PDF
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                      Request Briefing
                    </Button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main content */}
            <main className="py-12 min-h-screen">
              {/* Overview */}
              <section id="overview" className="mb-20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-px bg-accent" />
                  <p className="text-xs font-medium uppercase tracking-wider text-accent">Section 1</p>
                </div>
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
                  Mobility Compliance Infrastructure
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mb-8 leading-relaxed">
                  Portolan Labs provides the infrastructure layer for cross-border mobility compliance. Our platform standardizes evidence, detects integrity risks, and delivers audit-grade decision workflows at government scale.
                </p>
                <div className="bg-secondary p-6 border-l-4 border-accent">
                  <p className="font-medium mb-2">Executive Summary</p>
                  <p className="text-muted-foreground text-sm">
                    A unified compliance infrastructure that reduces processing time by 94%, achieves 99.7% detection accuracy, and maintains full audit compliance across all decision workflows.
                  </p>
                </div>
              </section>

              {/* Capabilities */}
              <section id="capabilities" className="mb-20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-px bg-accent" />
                  <p className="text-xs font-medium uppercase tracking-wider text-accent">Section 2</p>
                </div>
                <h2 className="text-3xl font-semibold tracking-tight mb-8">Platform Capabilities</h2>
                
                <div className="space-y-8">
                  {capabilities.map((category) => (
                    <div key={category.category} className="border border-border">
                      <div className="p-4 bg-secondary border-b border-border">
                        <h3 className="font-semibold">{category.category}</h3>
                      </div>
                      <ul className="p-4 space-y-3">
                        {category.items.map((item, index) => (
                          <li key={index} className="flex items-start gap-3 text-sm">
                            <div className="w-1.5 h-1.5 bg-accent mt-2 flex-shrink-0" />
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              {/* Specifications */}
              <section id="specifications" className="mb-20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-px bg-accent" />
                  <p className="text-xs font-medium uppercase tracking-wider text-accent">Section 3</p>
                </div>
                <h2 className="text-3xl font-semibold tracking-tight mb-8">Technical Specifications</h2>
                
                <div className="border border-border">
                  <table className="w-full">
                    <tbody>
                      {specifications.map((spec, index) => (
                        <tr key={spec.label} className={index !== specifications.length - 1 ? 'border-b border-border' : ''}>
                          <td className="p-4 text-sm text-muted-foreground bg-secondary w-1/3">{spec.label}</td>
                          <td className="p-4 text-sm font-medium">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Access */}
              <section id="access" className="mb-20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-px bg-accent" />
                  <p className="text-xs font-medium uppercase tracking-wider text-accent">Section 4</p>
                </div>
                <h2 className="text-3xl font-semibold tracking-tight mb-8">Request Access</h2>
                
                <div className="bg-foreground text-background p-10">
                  <p className="text-lg mb-6">
                    Schedule a technical briefing with our team to discuss your requirements and access options.
                  </p>
                  <Button size="lg" className="bg-background text-foreground hover:bg-background/90">
                    Request Briefing
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container-wide flex items-center justify-between text-sm text-muted-foreground">
          <p>© 2025 Portolan Labs. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}