import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { analytics } from '@/lib/analytics';
import { Shield, Eye, Lock } from 'lucide-react';

/**
 * VARIANT B: "Signal Acquisition"
 * 
 * Crosshair/targeting reticle contracts from the edges of the viewport 
 * toward center as you scroll, "locking on" to the headline.
 * Content fades in only after the lock is acquired.
 * Military-grade targeting aesthetic.
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

export function HeroVariantB() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Reticle animation - contracts inward
  const reticleScale = useTransform(scrollYProgress, [0, 0.15], [3, 1]);
  const reticleOpacity = useTransform(scrollYProgress, [0, 0.05, 0.2, 0.3], [0, 0.6, 0.6, 0]);
  const reticleRotate = useTransform(scrollYProgress, [0, 0.15], [45, 0]);

  // Corner brackets contract
  const bracketOffset = useTransform(scrollYProgress, [0, 0.15], [120, 0]);

  // Content reveals after lock
  const contentOpacity = useTransform(scrollYProgress, [0.12, 0.2], [0, 1]);
  const contentY = useTransform(scrollYProgress, [0.12, 0.2], [30, 0]);

  const kickerOpacity = useTransform(scrollYProgress, [0.1, 0.15], [0, 1]);
  const subOpacity = useTransform(scrollYProgress, [0.18, 0.25], [0, 1]);
  const ctaOpacity = useTransform(scrollYProgress, [0.22, 0.3], [0, 1]);
  const chipsOpacity = useTransform(scrollYProgress, [0.26, 0.34], [0, 1]);
  const statsOpacity = useTransform(scrollYProgress, [0.3, 0.4], [0, 1]);
  const statsY = useTransform(scrollYProgress, [0.3, 0.4], [20, 0]);

  // Lock indicator
  const lockOpacity = useTransform(scrollYProgress, [0.14, 0.16, 0.25, 0.3], [0, 1, 1, 0]);

  const handleRequestAccess = () => {
    analytics.trackCTA('request_access', 'hero');
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={containerRef} className="relative min-h-[200vh]">
      <div className="sticky top-0 min-h-screen flex items-center pt-20 pb-12 md:pb-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid-fade pointer-events-none" />

        {/* Targeting Reticle - center of viewport */}
        <motion.div
          className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
          style={{ opacity: reticleOpacity }}
        >
          <motion.div
            className="relative w-40 h-40 md:w-64 md:h-64"
            style={{ scale: reticleScale, rotate: reticleRotate }}
          >
            {/* Outer ring */}
            <div className="absolute inset-0 border border-accent/40 rounded-full" />
            {/* Inner ring */}
            <div className="absolute inset-8 md:inset-12 border border-accent/60 rounded-full" />
            {/* Crosshairs */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-accent/30" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-accent/30" />
            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent" />
          </motion.div>
        </motion.div>

        {/* Corner brackets */}
        <motion.div className="absolute z-20 pointer-events-none" style={{ top: bracketOffset, left: bracketOffset, opacity: reticleOpacity }}>
          <div className="w-8 h-8 border-t-2 border-l-2 border-accent/50" />
        </motion.div>
        <motion.div className="absolute z-20 pointer-events-none" style={{ top: bracketOffset, right: bracketOffset, opacity: reticleOpacity }}>
          <div className="w-8 h-8 border-t-2 border-r-2 border-accent/50" />
        </motion.div>
        <motion.div className="absolute z-20 pointer-events-none" style={{ bottom: bracketOffset, left: bracketOffset, opacity: reticleOpacity }}>
          <div className="w-8 h-8 border-b-2 border-l-2 border-accent/50" />
        </motion.div>
        <motion.div className="absolute z-20 pointer-events-none" style={{ bottom: bracketOffset, right: bracketOffset, opacity: reticleOpacity }}>
          <div className="w-8 h-8 border-b-2 border-r-2 border-accent/50" />
        </motion.div>

        {/* Lock acquired indicator */}
        <motion.div
          className="absolute top-24 right-8 z-20 pointer-events-none hidden md:block"
          style={{ opacity: lockOpacity }}
        >
          <div className="flex items-center gap-2 px-3 py-1.5 border border-accent/50 bg-accent/10">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-[10px] font-mono text-accent uppercase tracking-wider">Signal Acquired</span>
          </div>
        </motion.div>

        {/* Content */}
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
              style={{ opacity: contentOpacity, y: contentY }}
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
