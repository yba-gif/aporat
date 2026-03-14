export function HeroSection() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="min-h-screen flex items-center relative" style={{ paddingTop: '64px' }}>
      <div className="container-wide relative z-10">
        <div className="max-w-3xl">
          {/* Kicker */}
          <p className="text-label mb-8">SOVEREIGN INTELLIGENCE INFRASTRUCTURE</p>

          {/* Headline */}
          <h1 className="text-display mb-6">
            Decision systems for{' '}
            <span className="text-gradient-red">critical operations.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-body max-w-[560px] mb-10 text-[18px]">
            Portolan Labs builds verification and intelligence infrastructure for governments, financial institutions, and border security agencies. From document intake to network-level fraud detection.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 mb-20">
            <button
              onClick={() => scrollTo('cta')}
              className="px-7 py-3.5 text-[13px] font-semibold uppercase tracking-wider bg-accent-red text-white border-none cursor-pointer hover:opacity-90 transition-opacity"
            >
              REQUEST ACCESS
            </button>
            <button
              onClick={() => scrollTo('platform')}
              className="px-7 py-3.5 text-[13px] font-semibold uppercase tracking-wider bg-transparent text-foreground border border-border-accent cursor-pointer hover:border-foreground transition-colors"
            >
              VIEW PLATFORM
            </button>
          </div>

          {/* Stats row */}
          <div className="border-t border-border pt-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '4.2', suffix: 'hrs', label: 'AVG. FRAUD RING RESOLUTION' },
                { value: '40', suffix: '+', label: 'COUNTRIES ACCEPTING CLEARANCE' },
                { value: '100', suffix: '%', label: 'AUDIT-READY CHAIN OF CUSTODY' },
                { value: '0', suffix: '', label: 'DATA LEAVES YOUR JURISDICTION' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-mono text-[32px] font-bold text-foreground">
                    {stat.value}
                    {stat.suffix && <span className="text-[16px] text-accent-red ml-0.5">{stat.suffix}</span>}
                  </p>
                  <p className="text-[12px] uppercase tracking-wider mt-2" style={{ color: 'hsl(var(--text-muted))' }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
