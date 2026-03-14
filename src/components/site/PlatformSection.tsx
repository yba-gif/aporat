import { useFadeIn } from '@/hooks/useFadeIn';

const modules = [
  {
    tag: 'MODULE 01',
    name: 'Maris',
    color: 'var(--accent-red)',
    tagBg: 'rgba(192,57,43,0.15)',
    tagColor: 'hsl(var(--accent-red))',
    tagline: 'Document intelligence and verification engine. Ingest, validate, and certify at scale.',
    features: [
      'AI-powered document classification and data extraction',
      'Multi-source cross-referencing (WorldCheck, OpenSanctions, Social Links)',
      'Digital Notary: cryptographic certificates with tamper-proof provenance',
      'Automated risk scoring with explainable decision factors',
      'Batch processing: 500+ documents per hour per operator',
    ],
  },
  {
    tag: 'MODULE 02',
    name: 'Nautica',
    color: 'var(--accent-blue)',
    tagBg: 'rgba(41,128,185,0.12)',
    tagColor: 'hsl(var(--accent-blue))',
    tagline: 'Relationship intelligence and network analysis. See what flat databases hide.',
    features: [
      'Graph-based entity resolution across submissions, time, and jurisdictions',
      'Fraud network detection: shared addresses, sponsors, travel patterns',
      'Live relationship maps with community clustering',
      'Temporal analysis: when connections form and why it matters',
      'Exportable evidence graphs for prosecution-ready packages',
    ],
  },
  {
    tag: 'MODULE 03',
    name: 'Meridian',
    color: 'var(--accent-green)',
    tagBg: 'rgba(39,174,96,0.12)',
    tagColor: 'hsl(var(--accent-green))',
    tagline: 'Policy propagation and compliance workflow. From rule change to enforcement in minutes.',
    features: [
      'Role-based case management with 4-eye review enforcement',
      'Policy versioning: every rule change tracked and timestamped',
      'Automated SLA monitoring with escalation workflows',
      'Full audit trail: every click, every decision, every reason',
      'Configurable approval chains matching your organizational hierarchy',
    ],
  },
];

export function PlatformSection() {
  const ref = useFadeIn();

  return (
    <section id="platform" ref={ref as React.RefObject<HTMLElement>} className="section-padding fade-section">
      <div className="container-wide">
        <p className="text-label mb-4">THE PLATFORM</p>
        <h2 className="section-title max-w-3xl mb-4">Three modules. One decision surface.</h2>
        <p className="text-body max-w-2xl mb-16 text-[17px]">
          Each module operates independently or as a unified intelligence layer. Evidence flows from intake to audit without leaving the system.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px] bg-border">
          {modules.map((m) => (
            <div
              key={m.name}
              className="card-elevated p-8 flex flex-col"
              style={{ borderTop: `3px solid hsl(${m.color})` }}
            >
              <span
                className="inline-block self-start font-mono text-[11px] font-medium uppercase tracking-wider px-3 py-1 mb-5"
                style={{ background: m.tagBg, color: m.tagColor }}
              >
                {m.tag}
              </span>
              <h3 className="text-[28px] font-bold text-foreground mb-2">{m.name}</h3>
              <p className="text-[14px] text-muted-foreground mb-6 leading-[1.7]">{m.tagline}</p>
              <ul className="space-y-3 mt-auto">
                {m.features.map((f) => (
                  <li key={f} className="flex gap-3 text-[13px] text-muted-foreground">
                    <span className="font-mono text-muted-foreground shrink-0">&rarr;</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
