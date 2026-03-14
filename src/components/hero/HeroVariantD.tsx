import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { analytics } from '@/lib/analytics';
import { Shield, Eye, Lock } from 'lucide-react';

/**
 * VARIANT D: "Gravitational Collapse"
 * 
 * Elements start scattered across the entire viewport — words, stats, 
 * chips — all floating in random positions with different opacities.
 * As you scroll, gravitational force pulls everything toward its 
 * final layout position. Like watching order emerge from entropy.
 * A magnetic snap at the end when everything locks into place.
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

  // "Decision" starts top-right
  const w1X = useTransform(scrollYProgress, [0, 0.2], [400, 0]);
  const w1Y = useTransform(scrollYProgress, [0, 0.2], [-200, 0]);
  const w1Rotate = useTransform(scrollYProgress, [0, 0.2], [12, 0]);
  const w1Opacity = useTransform(scrollYProgress, [0, 0.05], [0.15, 1]);
  const w1Scale = useTransform(scrollYProgress, [0, 0.2], [0.6, 1]);

  // "systems" starts bottom-left
  const w2X = useTransform(scrollYProgress, [0, 0.22], [-350, 0]);
  const w2Y = useTransform(scrollYProgress, [0, 0.22], [180, 0]);
  const w2Rotate = useTransform(scrollYProgress, [0, 0.22], [-8, 0]);
  const w2Opacity = useTransform(scrollYProgress, [0, 0.06], [0.15, 1]);
  const w2Scale = useTransform(scrollYProgress, [0, 0.22], [0.7, 1]);

  // "for" floats from far left
  const w3X = useTransform(scrollYProgress, [0.02, 0.24], [-500, 0]);
  const w3Y = useTransform(scrollYProgress, [0.02, 0.24], [-100, 0]);
  const w3Opacity = useTransform(scrollYProgress, [0.02, 0.08], [0.1, 1]);

  // "critical" drops from top
  const w4Y = useTransform(scrollYProgress, [0.04, 0.26], [-300, 0]);
  const w4X = useTransform(scrollYProgress, [0.04, 0.26], [100, 0]);
  const w4Rotate = useTransform(scrollYProgress, [0.04, 0.26], [6, 0]);
  const w4Opacity = useTransform(scrollYProgress, [0.04, 0.1], [0.1, 1]);

  // "operations." slides from right
  const w5X = useTransform(scrollYProgress, [0.06, 0.28], [450, 0]);
  const w5Y = useTransform(scrollYProgress, [0.06, 0.28], [80, 0]);
  const w5Opacity = useTransform(scrollYProgress, [0.06, 0.12], [0.1, 1]);

  // Kicker collapses from wide spacing
  const kickerOpacity = useTransform(scrollYProgress, [0.15, 0.22], [0, 1]);
  const kickerY = useTransform(scrollYProgress, [0.15, 0.25], [-40, 0]);

  // Magnetic snap flash
  const snapOpacity = useTransform(scrollYProgress, [0.27, 0.29, 0.32], [0, 0.15, 0]);

  // Post-collapse reveals
  const subOpacity = useTransform(scrollYProgress, [0.28, 0.34], [0, 1]);
  const ctaOpacity = useTransform(scrollYProgress, [0.32, 0.38], [0, 1]);
  const ctaY = useTransform(scrollYProgress, [0.32, 0.38], [10, 0]);
  const chipsOpacity = useTransform(scrollYProgress, [0.36, 0.42], [0, 1]);
  const statsOpacity = useTransform(scrollYProgress, [0.4, 0.48], [0, 1]);
  const statsY = useTransform(scrollYProgress, [0.4, 0.48], [15, 0]);

  // Orbiting particles that collapse inward
  const p1X = useTransform(scrollYProgress, [0, 0.25], [600, 0]);
  const p1Y = useTransform(scrollYProgress, [0, 0.25], [-300, 0]);
  const p2X = useTransform(scrollYProgress, [0, 0.25], [-500, 0]);
  const p2Y = useTransform(scrollYProgress, [0, 0.25], [250, 0]);
  const p3X = useTransform(scrollYProgress, [0, 0.25], [300, 0]);
  const p3Y = useTransform(scrollYProgress, [0, 0.25], [400, 0]);
  const particleOpacity = useTransform(scrollYProgress, [0, 0.05, 0.22, 0.28], [0, 0.4, 0.4, 0]);

  const handleRequestAccess = () => {
    analytics.trackCTA('request_access', 'hero');
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={containerRef} className="relative min-h-[200vh]">
      <div className="sticky top-0 min-h-screen flex items-center pt-20 pb-12 md:pb-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid-fade pointer-events-none opacity-20" />

        {/* Orbiting particles */}
        <motion.div
          className="absolute w-1 h-1 bg-accent rounded-full pointer-events-none"
          style={{ x: p1X, y: p1Y, opacity: particleOpacity, top: '40%', left: '50%' }}
        />
        <motion.div
          className="absolute w-1.5 h-1.5 bg-accent/60 rounded-full pointer-events-none"
          style={{ x: p2X, y: p2Y, opacity: particleOpacity, top: '50%', left: '40%' }}
        />
        <motion.div
          className="absolute w-1 h-1 bg-accent/40 rounded-full pointer-events-none"
          style={{ x: p3X, y: p3Y, opacity: particleOpacity, top: '45%', left: '55%' }}
        />

        {/* Magnetic snap flash */}
        <motion.div
          className="absolute inset-0 bg-accent pointer-events-none"
          style={{ opacity: snapOpacity }}
        />

        <div className="container-wide relative z-10">
          <div className="max-w-4xl">
            {/* Kicker */}
            <motion.p
              className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent mb-6"
              style={{ opacity: kickerOpacity, y: kickerY }}
            >
              Sovereign Intelligence Infrastructure
            </motion.p>

            {/* Headline — each word has its own gravity trajectory */}
            <h1 className="text-4xl md:text-display mb-2">
              <motion.span
                className="inline-block mr-[0.3em]"
                style={{ x: w1X, y: w1Y, rotate: w1Rotate, opacity: w1Opacity, scale: w1Scale }}
              >
                Decision
              </motion.span>
              <motion.span
                className="inline-block"
                style={{ x: w2X, y: w2Y, rotate: w2Rotate, opacity: w2Opacity, scale: w2Scale }}
              >
                systems
              </motion.span>
            </h1>
            <p className="text-4xl md:text-display text-muted-foreground mb-6">
              <motion.span
                className="inline-block mr-[0.3em]"
                style={{ x: w3X, y: w3Y, opacity: w3Opacity }}
              >
                for
              </motion.span>
              <motion.span
                className="inline-block mr-[0.3em]"
                style={{ y: w4Y, x: w4X, rotate: w4Rotate, opacity: w4Opacity }}
              >
                critical
              </motion.span>
              <motion.span
                className="inline-block"
                style={{ x: w5X, y: w5Y, opacity: w5Opacity }}
              >
                operations.
              </motion.span>
            </p>

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
