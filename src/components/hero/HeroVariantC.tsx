import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { analytics } from '@/lib/analytics';
import { Shield, Eye, Lock } from 'lucide-react';

/**
 * VARIANT C: "Horizon Split"
 * 
 * A single horizontal line sits at the vertical center of the viewport.
 * As you scroll, it splits — the top half slides up, the bottom half slides down,
 * revealing the headline in the gap. Architectural. Minimal. Precise.
 * The line then fades and content assembles with surgical stagger.
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

export function HeroVariantC() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Horizon line splits
  const topLineY = useTransform(scrollYProgress, [0, 0.12], ['0%', '-50vh']);
  const bottomLineY = useTransform(scrollYProgress, [0, 0.12], ['0%', '50vh']);
  const lineOpacity = useTransform(scrollYProgress, [0, 0.05, 0.15, 0.2], [0, 1, 1, 0]);
  const lineWidth = useTransform(scrollYProgress, [0, 0.06], ['0%', '100%']);

  // Curtain panels that slide away
  const topCurtainY = useTransform(scrollYProgress, [0.05, 0.18], ['0%', '-100%']);
  const bottomCurtainY = useTransform(scrollYProgress, [0.05, 0.18], ['0%', '100%']);
  const curtainOpacity = useTransform(scrollYProgress, [0.05, 0.18], [1, 0]);

  // Content reveal - staggered, precise
  const kickerOpacity = useTransform(scrollYProgress, [0.1, 0.16], [0, 1]);
  const kickerX = useTransform(scrollYProgress, [0.1, 0.16], [-20, 0]);

  const headlineOpacity = useTransform(scrollYProgress, [0.13, 0.2], [0, 1]);
  const headlineScale = useTransform(scrollYProgress, [0.13, 0.2], [0.97, 1]);

  const subOpacity = useTransform(scrollYProgress, [0.18, 0.25], [0, 1]);

  const ctaOpacity = useTransform(scrollYProgress, [0.22, 0.28], [0, 1]);
  const ctaY = useTransform(scrollYProgress, [0.22, 0.28], [15, 0]);

  const chipsOpacity = useTransform(scrollYProgress, [0.26, 0.32], [0, 1]);

  const statsOpacity = useTransform(scrollYProgress, [0.3, 0.38], [0, 1]);
  const statsY = useTransform(scrollYProgress, [0.3, 0.38], [20, 0]);

  // Vertical accent lines that frame content
  const frameLeftOpacity = useTransform(scrollYProgress, [0.15, 0.22], [0, 0.3]);
  const frameLeftHeight = useTransform(scrollYProgress, [0.15, 0.35], ['0%', '60%']);

  const handleRequestAccess = () => {
    analytics.trackCTA('request_access', 'hero');
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={containerRef} className="relative min-h-[200vh]">
      <div className="sticky top-0 min-h-screen flex items-center pt-20 pb-12 md:pb-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid-fade pointer-events-none opacity-30" />

        {/* Curtain panels - solid bg that splits apart */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-1/2 bg-background z-30 pointer-events-none"
          style={{ y: topCurtainY, opacity: curtainOpacity }}
        />
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1/2 bg-background z-30 pointer-events-none"
          style={{ y: bottomCurtainY, opacity: curtainOpacity }}
        />

        {/* Horizon lines - the split */}
        <motion.div
          className="absolute left-0 right-0 z-40 pointer-events-none flex justify-center"
          style={{ top: '50%', y: topLineY, opacity: lineOpacity }}
        >
          <motion.div
            className="h-px bg-accent"
            style={{ width: lineWidth }}
          />
        </motion.div>
        <motion.div
          className="absolute left-0 right-0 z-40 pointer-events-none flex justify-center"
          style={{ top: '50%', y: bottomLineY, opacity: lineOpacity }}
        >
          <motion.div
            className="h-px bg-accent/50"
            style={{ width: lineWidth }}
          />
        </motion.div>

        {/* Left frame accent */}
        <motion.div
          className="absolute left-8 md:left-16 top-1/2 -translate-y-1/2 w-px bg-accent pointer-events-none hidden md:block"
          style={{ opacity: frameLeftOpacity, height: frameLeftHeight }}
        />

        {/* Content */}
        <div className="container-wide relative z-10">
          <div className="max-w-3xl">
            <motion.p
              className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent mb-6"
              style={{ opacity: kickerOpacity, x: kickerX }}
            >
              Sovereign Intelligence Infrastructure
            </motion.p>

            <motion.h1
              className="text-4xl md:text-display mb-4 md:mb-6"
              style={{ opacity: headlineOpacity, scale: headlineScale }}
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

            <motion.div className="mb-6 md:mb-8" style={{ opacity: ctaOpacity, y: ctaY }}>
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
