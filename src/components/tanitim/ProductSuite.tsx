import { Database, Network, Scale, ArrowRight } from 'lucide-react';

const products = [
  {
    icon: Database,
    name: 'Maris',
    subtitle: 'Evidence Ingestion',
    description: 'Document intake, OCR, and cryptographic hashing. Normalizes 50+ document types into unified evidence format.',
    capabilities: [
      'Multi-format document ingestion',
      'SHA-256 integrity verification',
      'OCR with confidence scoring',
      'Automated quality flagging',
    ],
  },
  {
    icon: Network,
    name: 'Nautica',
    subtitle: 'Fraud Intelligence',
    description: 'Graph-based entity resolution and relationship analysis. Surfaces coordinated fraud that siloed systems miss.',
    capabilities: [
      'Cross-consulate hash matching',
      'Visa mill network detection',
      'Social intelligence layer',
      'Risk score propagation',
    ],
  },
  {
    icon: Scale,
    name: 'Meridian',
    subtitle: 'Policy Governance',
    description: 'Codified compliance rules with version control. Real-time propagation to all consulates globally.',
    capabilities: [
      'Policy-as-code deployment',
      '60-second global sync',
      'Audit trail generation',
      'SLA tracking & case priority',
    ],
  },
];

export function ProductSuite() {
  return (
    <section className="section-padding border-t border-border">
      <div className="container-wide">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-label mb-4">Product Suite</p>
          <h2 className="text-headline max-w-2xl mx-auto mb-4">
            Three integrated modules. One unified workflow.
          </h2>
          <p className="text-body max-w-xl mx-auto">
            Evidence flows through Maris, analyzed by Nautica, governed by Meridian. Complete chain-of-custody from intake to decision.
          </p>
        </div>

        {/* Product cards */}
        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          {products.map((product, index) => (
            <div 
              key={product.name}
              className="p-6 bg-surface-elevated border border-border relative group hover:border-accent/50 transition-colors"
            >
              {/* Product header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-accent/10">
                  <product.icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-xs text-muted-foreground">{product.subtitle}</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                {product.description}
              </p>

              {/* Capabilities */}
              <ul className="space-y-2">
                {product.capabilities.map((cap) => (
                  <li key={cap} className="flex items-center gap-2 text-sm">
                    <div className="w-1 h-1 bg-accent rounded-full" />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>

              {/* Flow arrow (except last) */}
              {index < products.length - 1 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="w-6 h-6 text-accent" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Workflow summary */}
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="font-mono">Maris</span>
          <ArrowRight className="w-4 h-4" />
          <span className="font-mono">Nautica</span>
          <ArrowRight className="w-4 h-4" />
          <span className="font-mono">Meridian</span>
          <ArrowRight className="w-4 h-4" />
          <span className="font-medium text-foreground">Decision</span>
        </div>
      </div>
    </section>
  );
}
