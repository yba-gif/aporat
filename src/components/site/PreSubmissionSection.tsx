import { useFadeIn } from '@/hooks/useFadeIn';

export function PreSubmissionSection() {
  const ref = useFadeIn();

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="section-padding fade-section">
      <div className="container-wide">
        <div
          className="card-elevated p-8 md:p-14"
          style={{
            background: 'linear-gradient(135deg, rgba(192,57,43,0.06), rgba(41,128,185,0.04))',
            border: '1px solid hsl(var(--border))',
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-14">
            {/* Left */}
            <div>
              <p className="text-label mb-4">PRE-SUBMISSION INTELLIGENCE</p>
              <h2 className="text-[28px] font-bold text-foreground mb-6 leading-tight">
                Detect fraud before it reaches government systems.
              </h2>
              <p className="text-body">
                Portolan Labs operates a private intelligence channel through Vizesepetim, a pre-submission risk signal platform. Fraudulent applications are flagged, scored, and filtered before they enter consular queues. Governments receive cleaner pipelines. Applicants get faster processing. Fraud networks lose their cover.
              </p>
            </div>

            {/* Right: ASCII flow */}
            <div className="flex items-center justify-center">
              <pre className="font-mono text-[12px] leading-loose text-center whitespace-pre" style={{ color: 'hsl(var(--text-muted))' }}>
{`APPLICANT POOL
      |
`}<span className="font-bold text-accent-red">[ RISK FILTER ]</span>{`
    /     \\
`}<span className="text-accent-green">CLEAN</span>{`     `}<span className="text-accent-red">FLAGGED</span>{`
    \\     /
CONSULATE  REVIEW`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
