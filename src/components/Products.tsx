import { useState } from 'react';
import { ChevronDown, Database, Compass, Cpu } from 'lucide-react';
import { analytics } from '@/lib/analytics';

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
    id: 'foundry',
    name: 'Portolan Foundry',
    tagline: 'Mobility data fabric and evidence vault',
    icon: Database,
    capabilities: [
      'Unified ingestion pipelines for documents, biometrics, and metadata',
      'Tamper-evident storage with cryptographic chain-of-custody',
      'Schema normalization across source systems and formats',
    ],
    artifacts: ['Evidence Vault', 'Normalized Schema', 'Ingestion Reports'],
  },
  {
    id: 'gotham',
    name: 'Portolan Gotham',
    tagline: 'Case intelligence & decision workbench',
    icon: Compass,
    capabilities: [
      'Entity resolution and relationship mapping across dossiers',
      'Configurable integrity checks with explainable scoring',
      'Collaborative review workflows with role-based access',
    ],
    artifacts: ['Risk Graph', 'Dossier Timeline', 'Decision Audit'],
  },
  {
    id: 'apollo',
    name: 'Portolan Apollo',
    tagline: 'Policy deployment & governance',
    icon: Cpu,
    capabilities: [
      'Declarative policy rulesets as deployable configurations',
      'Version-controlled policy lifecycle management',
      'Real-time compliance monitoring and drift detection',
    ],
    artifacts: ['Policy Registry', 'Compliance Dashboard', 'Governance Logs'],
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
          <p className="text-label mb-4">Product</p>
          <h2 className="text-headline mb-4">
            Three platforms.
            <br />
            One integrated system.
          </h2>
          <p className="text-body">
            Purpose-built infrastructure for mobility compliance—from evidence ingestion to policy enforcement.
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
      </div>
    </section>
  );
}
