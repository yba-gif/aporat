import { useFadeIn } from '@/hooks/useFadeIn';

export function CtaSection() {
  const ref = useFadeIn();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="cta" ref={ref as React.RefObject<HTMLElement>} className="fade-section" style={{ padding: '160px 48px' }}>
      <div className="max-w-[1280px] mx-auto text-center">
        <p className="text-label mb-6">GET STARTED</p>
        <h2 className="text-display max-w-[700px] mx-auto mb-6">
          <span className="section-title">Intelligence infrastructure built for what is at stake.</span>
        </h2>
        <p className="text-body text-[17px] mb-10">
          Request a classified briefing or schedule a platform demonstration.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => scrollTo('cta')}
            className="px-7 py-3.5 text-[13px] font-semibold uppercase tracking-wider bg-accent-red text-white border-none cursor-pointer hover:opacity-90 transition-opacity"
          >
            REQUEST DEMO
          </button>
          <button
            onClick={() => scrollTo('cta')}
            className="px-7 py-3.5 text-[13px] font-semibold uppercase tracking-wider bg-transparent text-foreground border border-border-accent cursor-pointer hover:border-foreground transition-colors"
          >
            CONTACT TEAM
          </button>
        </div>
      </div>
    </section>
  );
}
