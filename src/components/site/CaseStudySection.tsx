import { useFadeIn } from '@/hooks/useFadeIn';

const metrics = [
  { value: '7', color: 'var(--accent-red)', label: 'Connected applicants identified' },
  { value: '2', color: 'var(--accent-blue)', label: 'Facilitation agents flagged' },
  { value: '4.2h', color: 'var(--accent-green)', label: 'Time to full resolution' },
  { value: '100%', color: 'var(--accent-gold)', label: 'Audit chain completeness' },
];

export function CaseStudySection() {
  const ref = useFadeIn();

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="section-padding fade-section">
      <div className="container-wide">
        <div className="card-elevated p-8 md:p-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
            {/* Left */}
            <div>
              <p className="text-label mb-4">FIELD INTELLIGENCE</p>
              <h2 className="text-[28px] font-bold text-foreground mb-6 leading-tight">
                7-node fraud ring identified in 4.2 hours.
              </h2>
              <p className="text-body mb-4">
                A coordinated visa fraud operation submitted applications through two facilitation agents using forged financial documents and shared sponsor networks. Maris flagged document anomalies. Nautica mapped the full network. Meridian routed the case through review.
              </p>
              <p className="text-body">
                Industry average for comparable detection: 14 business days.
              </p>
            </div>

            {/* Right: metrics grid */}
            <div className="grid grid-cols-2 gap-[2px] bg-border self-start">
              {metrics.map((m) => (
                <div key={m.label} className="bg-secondary p-6 border border-border">
                  <p className="font-mono text-[28px] font-bold" style={{ color: `hsl(${m.color})` }}>
                    {m.value}
                  </p>
                  <p className="text-[12px] mt-2" style={{ color: 'hsl(var(--text-muted))' }}>{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
