import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { analytics } from '@/lib/analytics';
import { Shield, Eye, Lock } from 'lucide-react';

/**
 * VARIANT A: "Declassification"
 * 
 * The headline starts masked/clipped and progressively reveals as you scroll.
 * A single horizontal scan-line sweeps down the viewport, "declassifying" content.
 * Stats counter from redacted placeholders to real values.
 * Inspired by classified document aesthetics.
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

export function HeroVariantA() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Scan line position
  const scanY = useTransform(scrollYProgress, [0, 0.5], ['0%', '120%']);

  // Content reveals
  const kickerOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);
  const kickerY = useTransform(scrollYProgress, [0, 0.05], [20, 0]);

  const headlineOpacity = useTransform(scrollYProgress, [0.03, 0.1], [0, 1]);
  const headlineY = useTransform(scrollYProgress, [0.03, 0.1], [40, 0]);
  const headlineBlur = useTransform(scrollYProgress, [0.03, 0.12], [12, 0]);

  const subOpacity = useTransform(scrollYProgress, [0.08, 0.15], [0, 1]);
  const subY = useTransform(scrollYProgress, [0.08, 0.15], [20, 0]);

  const ctaOpacity = useTransform(scrollYProgress, [0.12, 0.2], [0, 1]);
  const ctaY = useTransform(scrollYProgress, [0.12, 0.2], [20, 0]);

  const chipsOpacity = useTransform(scrollYProgress, [0.16, 0.24], [0, 1]);

  const statsOpacity = useTransform(scrollYProgress, [0.2, 0.3], [0, 1]);
  const statsY = useTransform(scrollYProgress, [0.2, 0.3], [30, 0]);

  // Background parallax
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  const handleRequestAccess = () => {
    analytics.trackCTA('request_access', 'hero');
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={containerRef} className="relative min-h-[200vh]">
      <div className="sticky top-0 min-h-screen flex items-center pt-20 pb-12 md:pb-0 overflow-hidden">
        {/* Background */}
        <motion.div
          className="absolute inset-0 bg-grid-fade pointer-events-none"
          style={{ y: bgY }}
        />

        {/* Scan line */}
        <motion.div
          className="absolute left-0 right-0 h-px z-20 pointer-events-none"
          style={{
            top: scanY,
            background: 'linear-gradient(90deg, transparent 0%, hsl(var(--accent)) 20%, hsl(var(--accent)) 80%, transparent 100%)',
            boxShadow: '0 0 30px 10px hsl(var(--accent) / 0.15)',
          }}
        />

        <div className="container-wide relative z-10">
          <div className="max-w-3xl">
            {/* Classification marker */}
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-accent/30 bg-accent/5"
              style={{ opacity: kickerOpacity, y: kickerY }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent">
                Sovereign Intelligence Infrastructure
              </span>
            </motion.div>

            {/* Headline with blur reveal */}
            <motion.h1
              className="text-4xl md:text-display mb-4 md:mb-6"
              style={{
                opacity: headlineOpacity,
                y: headlineY,
                filter: useTransform(headlineBlur, (v) => `blur(${v}px)`),
              }}
            >
              Decision systems
              <br />
              <span className="text-muted-foreground">for critical operations.</span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-subhead mb-6 md:mb-8"
              style={{ opacity: subOpacity, y: subY }}
            >
              Sovereign decision infrastructure. Full-spectrum audit coverage.
            </motion.p>

            <motion.div
              className="mb-6 md:mb-8"
              style={{ opacity: ctaOpacity, y: ctaY }}
            >
              <Button
                size="lg"
                onClick={handleRequestAccess}
                className="bg-foreground text-background hover:bg-foreground/90 px-6 w-full sm:w-auto"
              >
                Request a briefing
              </Button>
            </motion.div>

            <motion.div
              className="flex flex-wrap gap-2 md:gap-4"
              style={{ opacity: chipsOpacity }}
            >
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

          {/* Stats */}
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
