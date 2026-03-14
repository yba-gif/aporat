import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { analytics } from '@/lib/analytics';
import { Shield, Eye, Lock } from 'lucide-react';

/**
 * VARIANT D: "Horizontal Wipe"
 * 
 * A hard vertical edge sweeps left-to-right across the viewport as you scroll.
 * Behind the wipe: blank/dark. Ahead of the wipe: full content revealed.
 * Like pulling a curtain. The wipe line itself has a teal accent glow.
 * Content only exists where the wipe has passed.
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

export function HeroVariantD() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Wipe position: 0% to 100% of viewport width
  const wipeX = useTransform(scrollYProgress, [0, 0.35], ['0%', '100%']);
  const wipeLineOpacity = useTransform(scrollYProgress, [0, 0.02, 0.33, 0.36], [0, 1, 1, 0]);

  // Content clip - revealed by the wipe using clipPath percentage
  const clipRight = useTransform(scrollYProgress, [0, 0.35], [100, 0]);

  // Post-wipe: content fully visible, elements animate in
  const kickerOpacity = useTransform(scrollYProgress, [0.02, 0.08], [0, 1]);
  const headlineOpacity = useTransform(scrollYProgress, [0.06, 0.14], [0, 1]);
  const subOpacity = useTransform(scrollYProgress, [0.14, 0.22], [0, 1]);
  const ctaOpacity = useTransform(scrollYProgress, [0.2, 0.28], [0, 1]);
  const chipsOpacity = useTransform(scrollYProgress, [0.26, 0.34], [0, 1]);
  const statsOpacity = useTransform(scrollYProgress, [0.32, 0.4], [0, 1]);
  const statsY = useTransform(scrollYProgress, [0.32, 0.4], [20, 0]);

  // Dark overlay that gets wiped away
  const overlayClipLeft = useTransform(scrollYProgress, [0, 0.35], [0, 100]);

  const handleRequestAccess = () => {
    analytics.trackCTA('request_access', 'hero');
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={containerRef} className="relative min-h-[200vh]">
      <div className="sticky top-0 min-h-screen flex items-center pt-20 pb-12 md:pb-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid-fade pointer-events-none" />

        {/* Dark overlay - clips from left as wipe progresses */}
        <motion.div
          className="absolute inset-0 bg-foreground/[0.03] z-20 pointer-events-none"
          style={{
            clipPath: useTransform(overlayClipLeft, (v) => `inset(0 0 0 ${v}%)`),
          }}
        />

        {/* Wipe line - vertical accent edge */}
        <motion.div
          className="absolute top-0 bottom-0 w-px z-30 pointer-events-none"
          style={{
            left: wipeX,
            opacity: wipeLineOpacity,
            background: 'hsl(var(--accent))',
            boxShadow: '0 0 40px 8px hsl(var(--accent) / 0.3), 0 0 80px 20px hsl(var(--accent) / 0.1)',
          }}
        />

        {/* Small horizontal tick marks along the wipe line */}
        <motion.div
          className="absolute top-[20%] z-30 pointer-events-none hidden md:block"
          style={{ left: wipeX, opacity: wipeLineOpacity }}
        >
          <div className="w-3 h-px bg-accent -translate-x-3" />
        </motion.div>
        <motion.div
          className="absolute top-[50%] z-30 pointer-events-none hidden md:block"
          style={{ left: wipeX, opacity: wipeLineOpacity }}
        >
          <div className="w-4 h-px bg-accent -translate-x-4" />
        </motion.div>
        <motion.div
          className="absolute top-[80%] z-30 pointer-events-none hidden md:block"
          style={{ left: wipeX, opacity: wipeLineOpacity }}
        >
          <div className="w-3 h-px bg-accent -translate-x-3" />
        </motion.div>

        {/* Content - revealed progressively */}
        <div className="container-wide relative z-10">
          <div className="max-w-3xl">
            <motion.p
              className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent mb-6"
              style={{ opacity: kickerOpacity }}
            >
              Sovereign Intelligence Infrastructure
            </motion.p>

            <motion.h1
              className="text-4xl md:text-display mb-4 md:mb-6"
              style={{ opacity: headlineOpacity }}
            >
              Decision systems
              <br />
              <span className="text-muted-foreground">for critical operations.</span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-subhead mb-6 md:mb-8"
              style={{ opacity: subOpacity }}
            >
              Sovereign decision infrastructure. Full-spectrum audit coverage.
            </motion.p>

            <motion.div className="mb-6 md:mb-8" style={{ opacity: ctaOpacity }}>
              <Button
                size="lg"
                onClick={handleRequestAccess}
                className="bg-foreground text-background hover:bg-foreground/90 px-6 w-full sm:w-auto"
              >
                Request a briefing
              </Button>
            </motion.div>

            <motion.div className="flex flex-wrap gap-2 md:gap-4" style={{ opacity: chipsOpacity }}>
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
