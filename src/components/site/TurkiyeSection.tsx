import { useFadeIn } from '@/hooks/useFadeIn';

const cards = [
  { tag: 'DATA', title: 'KVKK-Compliant by Design', desc: 'All data processing within Turkish jurisdiction. No cross-border transfers.' },
  { tag: 'INFRA', title: 'Turkish Cloud Native', desc: 'Deploys on BTK/TUeBITAK infrastructure. White-label ready for ministry integration.' },
  { tag: 'LANG', title: 'Full Turkish Localization', desc: 'Interface, documentation, and AI models optimized for Turkish language processing.' },
  { tag: 'SCALE', title: 'Multi-Sector Expansion', desc: 'From defense to AML, border security to smart cities. One platform across critical sectors.' },
];

export function TurkiyeSection() {
  const ref = useFadeIn();

  return (
    <section id="turkiye" ref={ref as React.RefObject<HTMLElement>} className="section-padding fade-section">
      <div className="container-wide">
        <p className="text-label mb-4">TÜRKIYE OPERATIONS</p>
        <h2 className="section-title max-w-3xl mb-4">Sovereign infrastructure for a sovereign nation.</h2>
        <p className="text-body max-w-2xl mb-16 text-[17px]">
          Portolan Labs is building the first locally-owned intelligence infrastructure for cross-border operations. Ministry-grade. Data-sovereign. Built in Türkiye, for Türkiye.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
          {/* Left text */}
          <div className="space-y-6">
            <p className="text-body">
              Turkey sits at the crossroads of global mobility: 86 million citizens, millions of annual visa applicants, and a defense posture that demands autonomous capability. Yet critical verification infrastructure remains dependent on foreign vendors with foreign data residency.
            </p>
            <p className="text-body">
              Portolan Labs changes this. Our platform deploys on BTK and TUeBITAK-approved infrastructure, operates under KVKK compliance, and delivers the same intelligence capabilities as Western defense platforms, without the sovereignty compromise.
            </p>
          </div>

          {/* Right: feature cards */}
          <div className="space-y-4">
            {cards.map((c) => (
              <div key={c.tag} className="card-elevated p-5 flex items-start gap-4">
                <span
                  className="font-mono text-[11px] font-medium uppercase tracking-wider px-2.5 py-1 shrink-0"
                  style={{ background: 'rgba(192,57,43,0.15)', color: 'hsl(var(--accent-red))' }}
                >
                  {c.tag}
                </span>
                <div>
                  <h3 className="text-[14px] font-bold text-foreground mb-1">{c.title}</h3>
                  <p className="text-[13px] text-muted-foreground">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
