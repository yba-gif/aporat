import { useState } from 'react';
import { ChevronDown, Database, Compass, Cpu } from 'lucide-react';
import { analytics } from '@/lib/analytics';
import { ArchitectureDiagram } from './ArchitectureDiagram';

interface Product {
  id: string;
  name: string;
  tagline: string;
  icon: typeof Database;
  capabilities: string[];
  artifacts: string[];
}

const products: Product[] = [
  {
    id: 'maris',
    name: 'Portolan Maris',
    tagline: 'Evidence ingestion and chain-of-custody',
    icon: Database,
    capabilities: [
      'Multi-format document parsing with provenance tracking',
      'Tamper-evident storage with cryptographic verification',
      'Schema normalization across legacy and modern systems',
    ],
    artifacts: ['Evidence Vault', 'Provenance Logs', 'Normalized Schema'],
  },
  {
    id: 'nautica',
    name: 'Portolan Nautica',
    tagline: 'Entity resolution and integrity verification',
    icon: Compass,
    capabilities: [
      'Graph-based entity resolution across complex networks',
      'Configurable integrity checks with explainable scoring',
      'Role-based workflows with approval chains',
    ],
    artifacts: ['Entity Graph', 'Integrity Reports', 'Decision Audit'],
  },
  {
    id: 'meridian',
    name: 'Portolan Meridian',
    tagline: 'Policy deployment and governance',
    icon: Cpu,
    capabilities: [
      'Declarative policy rulesets as deployable configurations',
      'Version-controlled compliance logic with rollback',
      'Real-time monitoring and SLA enforcement',
    ],
    artifacts: ['Policy Registry', 'Governance Logs', 'Operations Dashboard'],
  },
];

export function Products() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    const newExpanded = expandedId === id ? null : id;
    setExpandedId(newExpanded);
    if (newExpanded) {
      analytics.trackProductExpanded(id);
    }
  };

  return (
    <section id="product" className="section-padding">
      <div className="container-wide">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <p className="text-label mb-4">Platform</p>
          <h2 className="text-headline mb-4">
            Three platforms. One workflow.
          </h2>
          <p className="text-body">
            Infrastructure for organizations where evidence integrity determines mission success.
          </p>
        </div>

        {/* Product Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {products.map((product) => {
            const isExpanded = expandedId === product.id;
            const Icon = product.icon;

            return (
              <div
                key={product.id}
                className={`group border transition-all duration-300 ${
                  isExpanded
                    ? 'border-accent bg-surface-elevated'
                    : 'border-border hover:border-line-strong bg-background'
                }`}
              >
                {/* Header */}
                <button
                  className="w-full text-left p-6 focus:outline-none"
                  onClick={() => toggleExpand(product.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 border border-border bg-background">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.tagline}</p>
                </button>

                {/* Expanded Content */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isExpanded ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 pb-6 space-y-6">
                    {/* Divider */}
                    <div className="h-px bg-border" />

                    {/* Capabilities */}
                    <div>
                      <p className="text-label mb-3">Capabilities</p>
                      <ul className="space-y-2">
                        {product.capabilities.map((cap, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="w-1 h-1 rounded-full bg-accent mt-2 shrink-0" />
                            {cap}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Artifacts */}
                    <div>
                      <p className="text-label mb-3">Output Artifacts</p>
                      <div className="flex flex-wrap gap-2">
                        {product.artifacts.map((artifact) => (
                          <span
                            key={artifact}
                            className="px-2 py-1 text-xs font-mono bg-secondary border border-border"
                          >
                            {artifact}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Architecture Diagram */}
        <ArchitectureDiagram />
      </div>
    </section>
  );
}
