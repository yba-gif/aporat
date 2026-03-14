import { useFadeIn } from '@/hooks/useFadeIn';

const problems = [
  {
    num: '01',
    title: 'Fragmented Intelligence',
    body: 'Consular officers toggle between 6+ systems per applicant. No unified view. No relationship awareness. Critical patterns go undetected.',
  },
  {
    num: '02',
    title: 'Zero Provenance',
    body: 'Decisions are made in email threads and sticky notes. When auditors arrive, the chain of custody does not exist. Every approval is a liability.',
  },
  {
    num: '03',
    title: 'Adversarial Scale',
    body: 'Fraud rings operate across jurisdictions with forged documents, shell sponsors, and coordinated submissions. Point solutions cannot see the network.',
  },
];

export function ProblemSectionNew() {
  const ref = useFadeIn();

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="section-padding fade-section">
      <div className="container-wide">
        <p className="text-label mb-4">THE PROBLEM</p>
        <h2 className="section-title max-w-3xl mb-4">Legacy systems were not built for adversarial actors.</h2>
        <p className="text-body max-w-2xl mb-16 text-[17px]">
          Cross-border mobility decisions still rely on disconnected tools, manual review, and siloed data. Fraud networks exploit the gaps.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px] bg-border">
          {problems.map((p) => (
            <div key={p.num} className="card-elevated p-9">
              <span className="font-mono text-[48px] font-bold" style={{ color: 'hsl(var(--border-accent))' }}>
                {p.num}
              </span>
              <h3 className="text-[17px] font-bold text-foreground mt-4 mb-3">{p.title}</h3>
              <p className="text-[14px] leading-[1.7] text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
