import { useFadeIn } from '@/hooks/useFadeIn';

const deployments = [
  { icon: '◇', title: 'On-Premise', desc: 'Full stack on your hardware. Your SOC, your rules, your perimeter.' },
  { icon: '☁', title: 'Sovereign Cloud', desc: 'Deployed on government-approved cloud infrastructure. BTK, TUeBITAK, or Swiss data centers.' },
  { icon: '⬡', title: 'Air-Gapped', desc: 'No external network. No telemetry. Full operational capability in disconnected environments.' },
  { icon: '⇄', title: 'Hybrid', desc: 'Classified workloads on-prem. Analytics in sovereign cloud. Sync when you choose.' },
];

const compliance = [
  '256-bit AES encryption at rest and in transit',
  'ISO 27001 compliant architecture',
  'GDPR & KVKK data sovereignty',
  'Zero-trust access control',
  'Full audit logging',
];

export function DeploymentSectionNew() {
  const ref = useFadeIn();

  return (
    <section id="deployment" ref={ref as React.RefObject<HTMLElement>} className="section-padding fade-section">
      <div className="container-wide">
        <p className="text-label mb-4">DEPLOYMENT</p>
        <h2 className="section-title max-w-3xl mb-4">Your data. Your jurisdiction. Your infrastructure.</h2>
        <p className="text-body max-w-2xl mb-16 text-[17px]">
          Portolan Labs deploys where you need it. From sovereign cloud to fully air-gapped facilities. Zero external dependencies in offline mode.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-[2px] bg-border mb-16">
          {deployments.map((d) => (
            <div key={d.title} className="card-elevated p-8 text-center">
              <span className="font-mono text-[24px] block mb-4" style={{ color: 'hsl(var(--text-muted))' }}>
                {d.icon}
              </span>
              <h3 className="text-[15px] font-bold text-foreground mb-2">{d.title}</h3>
              <p className="text-[12px] leading-[1.6]" style={{ color: 'hsl(var(--text-muted))' }}>{d.desc}</p>
            </div>
          ))}
        </div>

        {/* Compliance row */}
        <div className="border-t border-border pt-12">
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {compliance.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="font-mono text-accent-green text-[14px]">&#10003;</span>
                <span className="text-[14px] text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
