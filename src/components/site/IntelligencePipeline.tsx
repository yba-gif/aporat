import { useFadeIn } from '@/hooks/useFadeIn';

const stages = [
  { num: '01', name: 'Ingest', desc: 'Documents, biometric data, and external feeds enter a unified evidence store with cryptographic fingerprinting.' },
  { num: '02', name: 'Extract', desc: 'AI classification, OCR, and entity extraction produce structured intelligence from unstructured evidence.' },
  { num: '03', name: 'Correlate', desc: 'Graph analysis surfaces hidden connections across applicants, sponsors, addresses, and travel patterns.' },
  { num: '04', name: 'Assess', desc: 'Risk scoring engine with explainable factors. Officers see why, not just what, the system flagged.' },
  { num: '05', name: 'Decide', desc: 'Audit-ready decisions with full chain of custody. From evidence to outcome in a single provenance chain.' },
];

export function IntelligencePipeline() {
  const ref = useFadeIn();

  return (
    <section id="intelligence" ref={ref as React.RefObject<HTMLElement>} className="section-padding fade-section">
      <div className="container-wide">
        <p className="text-label mb-4">INTELLIGENCE PIPELINE</p>
        <h2 className="section-title max-w-3xl mb-4">Five stages. Full provenance.</h2>
        <p className="text-body max-w-2xl mb-16 text-[17px]">
          From raw evidence to auditable decision. Every transformation logged. Every signal attributed.
        </p>

        {/* Desktop: horizontal */}
        <div className="hidden md:flex border border-border">
          {stages.map((s, i) => (
            <div
              key={s.num}
              className="flex-1 p-6 relative"
              style={{ borderRight: i < stages.length - 1 ? '1px solid hsl(var(--border))' : 'none' }}
            >
              {i < stages.length - 1 && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 font-mono text-muted-foreground text-[14px]">
                  &rarr;
                </span>
              )}
              <span className="text-label">{s.num}</span>
              <h3 className="text-[15px] font-bold text-foreground mt-3 mb-2">{s.name}</h3>
              <p className="text-[12px] leading-[1.6]" style={{ color: 'hsl(var(--text-muted))' }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Mobile: vertical */}
        <div className="md:hidden border border-border">
          {stages.map((s, i) => (
            <div
              key={s.num}
              className="p-6"
              style={{ borderBottom: i < stages.length - 1 ? '1px solid hsl(var(--border))' : 'none' }}
            >
              <span className="text-label">{s.num}</span>
              <h3 className="text-[15px] font-bold text-foreground mt-3 mb-2">{s.name}</h3>
              <p className="text-[12px] leading-[1.6]" style={{ color: 'hsl(var(--text-muted))' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
