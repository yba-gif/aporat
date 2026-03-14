import { useFadeIn } from '@/hooks/useFadeIn';

const badges = ['TAMPER-PROOF', 'QR-VERIFIABLE', '40+ COUNTRIES', 'GDPR COMPLIANT'];

const tiers = [
  {
    name: 'Standard Clearance',
    desc: 'Identity verification + compliance check',
    price: 'CHF 89',
  },
  {
    name: 'Enhanced Clearance',
    desc: 'Full background + financial + travel history',
    price: 'CHF 149',
  },
];

export function ClearanceSection() {
  const ref = useFadeIn();

  return (
    <section id="clearance" ref={ref as React.RefObject<HTMLElement>} className="section-padding fade-section">
      <div className="container-wide">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          {/* Left */}
          <div>
            <p className="text-label mb-4">CLEARANCE CERTIFICATES</p>
            <h2 className="text-[32px] font-bold text-foreground mb-6 leading-tight">
              Verified credibility.<br />Recognized worldwide.
            </h2>
            <p className="text-body mb-8">
              Digital Notary clearance certificates give individuals a portable, cryptographically-verified proof of compliance history. Accepted by consulates, financial institutions, and employers across 40+ countries.
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-3 mb-8">
              {badges.map((b) => (
                <span
                  key={b}
                  className="font-mono text-[11px] px-3.5 py-1.5 border border-border-accent text-muted-foreground"
                >
                  {b}
                </span>
              ))}
            </div>

            <button
              onClick={() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-7 py-3.5 text-[13px] font-semibold uppercase tracking-wider bg-accent-red text-white border-none cursor-pointer hover:opacity-90 transition-opacity"
            >
              GET YOUR CERTIFICATE
            </button>
          </div>

          {/* Right: pricing tiers */}
          <div className="space-y-4">
            {tiers.map((t) => (
              <div key={t.name} className="card-elevated p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-[16px] font-bold text-foreground">{t.name}</h3>
                  <p className="text-[13px] text-muted-foreground mt-1">{t.desc}</p>
                </div>
                <p className="font-mono text-[24px] font-bold text-foreground shrink-0">
                  <span className="text-[14px] text-muted-foreground mr-1">CHF</span>
                  {t.price.replace('CHF ', '')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
