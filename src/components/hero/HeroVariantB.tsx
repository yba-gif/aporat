import { useRef, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { analytics } from '@/lib/analytics';
import { Shield, Eye, Lock } from 'lucide-react';

/**
 * VARIANT B: "Redaction Lift"
 * 
 * The viewport starts as a classified document. Black redaction bars 
 * cover each line of text. As you scroll, bars peel away with a 3D 
 * rotation — like someone is physically declassifying the page.
 * The text underneath glows briefly as it's exposed.
 */

const proofChips = [
  { icon: Eye, label: 'Full audit chain' },
  { icon: Shield, label: 'Sovereign deployment' },
  { icon: Lock, label: 'Zero data export' },
];

const stats = [
  { value: '4.2hrs', label: 'Fraud ring resolution' },
  { value: '40+', label: 'Countries' },
  { value: '100%', label: 'Audit chain coverage' },
  { value: '0', label: 'Data leaves your jurisdiction' },
];

interface RedactionBarProps {
  scrollYProgress: any;
  startAt: number;
  endAt: number;
  width: string;
  children: React.ReactNode;
}

function RedactionBar({ scrollYProgress, startAt, endAt, width, children }: RedactionBarProps) {
  const rotateX = useTransform(scrollYProgress, [startAt, endAt], [0, -90]);
  const barOpacity = useTransform(scrollYProgress, [startAt, endAt - 0.01, endAt], [1, 1, 0]);
  const textOpacity = useTransform(scrollYProgress, [startAt, endAt], [0, 1]);
  const textGlow = useTransform(
    scrollYProgress,
    [startAt, endAt, endAt + 0.04],
    ['0px', '8px', '0px']
  );

  return (
    <div className="relative">
      {/* The text underneath */}
      <motion.div
        style={{
          opacity: textOpacity,
          textShadow: useTransform(textGlow, (v) => `0 0 ${v} hsl(var(--accent) / 0.4)`),
        }}
      >
        {children}
      </motion.div>

      {/* The black redaction bar */}
      <motion.div
        className="absolute inset-0 flex items-center pointer-events-none origin-bottom"
        style={{
          rotateX,
          opacity: barOpacity,
          perspective: '800px',
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          className="h-[1.15em] bg-foreground"
          style={{ width }}
        />
      </motion.div>
    </div>
  );
}

export function HeroVariantB() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Classification stamp rotation
  const stampRotate = useTransform(scrollYProgress, [0, 0.04], [-8, -3]);
  const stampOpacity = useTransform(scrollYProgress, [0, 0.03], [0, 1]);
  const stampScale = useTransform(scrollYProgress, [0, 0.04], [1.5, 1]);

  // Post-reveal elements
  const ctaOpacity = useTransform(scrollYProgress, [0.32, 0.38], [0, 1]);
  const ctaY = useTransform(scrollYProgress, [0.32, 0.38], [10, 0]);
  const chipsOpacity = useTransform(scrollYProgress, [0.36, 0.42], [0, 1]);
  const statsOpacity = useTransform(scrollYProgress, [0.4, 0.48], [0, 1]);
  const statsY = useTransform(scrollYProgress, [0.4, 0.48], [15, 0]);

  // Document border
  const borderOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 0.15]);

  const handleRequestAccess = () => {
    analytics.trackCTA('request_access', 'hero');
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={containerRef} className="relative min-h-[200vh]">
      <div className="sticky top-0 min-h-screen flex items-center pt-20 pb-12 md:pb-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid-fade pointer-events-none opacity-20" />

        {/* Document border effect */}
        <motion.div
          className="absolute inset-8 md:inset-16 border border-foreground pointer-events-none"
          style={{ opacity: borderOpacity }}
        />

        {/* Classification stamp */}
        <motion.div
          className="absolute top-28 right-12 md:right-24 z-20 pointer-events-none"
          style={{ rotate: stampRotate, opacity: stampOpacity, scale: stampScale }}
        >
          <div className="border-2 border-accent px-4 py-2">
            <span className="text-accent font-mono text-xs md:text-sm font-bold uppercase tracking-widest">
              Declassified
            </span>
          </div>
        </motion.div>

        <div className="container-wide relative z-10">
          <div className="max-w-3xl space-y-2">
            {/* Kicker - first to reveal */}
            <RedactionBar scrollYProgress={scrollYProgress} startAt={0.04} endAt={0.1} width="55%">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent py-2">
                Sovereign Intelligence Infrastructure
              </p>
            </RedactionBar>

            {/* Headline line 1 */}
            <RedactionBar scrollYProgress={scrollYProgress} startAt={0.08} endAt={0.16} width="75%">
              <h1 className="text-4xl md:text-display py-1">
                Decision systems
              </h1>
            </RedactionBar>

            {/* Headline line 2 */}
            <RedactionBar scrollYProgress={scrollYProgress} startAt={0.12} endAt={0.2} width="85%">
              <p className="text-4xl md:text-display text-muted-foreground py-1">
                for critical operations.
              </p>
            </RedactionBar>

            {/* Subtitle */}
            <div className="pt-4">
              <RedactionBar scrollYProgress={scrollYProgress} startAt={0.18} endAt={0.26} width="90%">
                <p className="text-lg md:text-subhead py-2">
                  Sovereign decision infrastructure. Full-spectrum audit coverage.
                </p>
              </RedactionBar>
            </div>

            {/* CTA */}
            <motion.div className="pt-4" style={{ opacity: ctaOpacity, y: ctaY }}>
              <Button
                size="lg"
                onClick={handleRequestAccess}
                className="bg-foreground text-background hover:bg-foreground/90 px-6 w-full sm:w-auto"
              >
                Request a briefing
              </Button>
            </motion.div>

            {/* Chips */}
            <motion.div className="flex flex-wrap gap-2 md:gap-4 pt-2" style={{ opacity: chipsOpacity }}>
              {proofChips.map((chip) => (
                <div
                  key={chip.label}
                  className="flex items-center gap-2 px-2 md:px-3 py-1.5 bg-secondary border border-border text-xs md:text-sm"
                >
                  <chip.icon className="w-3 h-3 md:w-3.5 md:h-3.5 text-accent" />
                  <span className="text-muted-foreground">{chip.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-12 border-t border-border"
            style={{ opacity: statsOpacity, y: statsY }}
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl md:text-3xl font-semibold">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
