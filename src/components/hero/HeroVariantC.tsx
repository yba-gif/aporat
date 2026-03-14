import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { analytics } from '@/lib/analytics';
import { Shield, Eye, Lock } from 'lucide-react';

/**
 * VARIANT C: "Depth Field"
 * 
 * Multiple parallax layers at different scroll speeds create real depth.
 * Background grid crawls. Mid-layer data fragments drift. 
 * Foreground content moves fastest. Scroll controls the z-axis.
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

// Floating data fragments for mid-layer
const fragments = [
  { text: 'SHA-256', x: '75%', y: '20%', speed: 0.3 },
  { text: 'VERIFIED', x: '85%', y: '45%', speed: 0.5 },
  { text: '0x7f3a...', x: '70%', y: '65%', speed: 0.2 },
  { text: 'AUDIT::OK', x: '82%', y: '80%', speed: 0.4 },
  { text: 'NODE:7', x: '90%', y: '30%', speed: 0.35 },
  { text: 'POLICY:ACTIVE', x: '65%', y: '50%', speed: 0.25 },
];

export function HeroVariantC() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Layer speeds (background slowest, foreground fastest)
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
  const bgScale = useTransform(scrollYProgress, [0, 0.5], [1.05, 1]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.3], [0.15, 0.4]);

  // Content (foreground) - appears and stays
  const contentOpacity = useTransform(scrollYProgress, [0, 0.08], [0, 1]);
  const contentY = useTransform(scrollYProgress, [0, 0.15], [80, 0]);
  const contentScale = useTransform(scrollYProgress, [0, 0.15], [0.95, 1]);

  const kickerOpacity = useTransform(scrollYProgress, [0, 0.06], [0, 1]);
  const subOpacity = useTransform(scrollYProgress, [0.1, 0.18], [0, 1]);
  const ctaOpacity = useTransform(scrollYProgress, [0.16, 0.22], [0, 1]);
  const chipsOpacity = useTransform(scrollYProgress, [0.2, 0.26], [0, 1]);
  const statsOpacity = useTransform(scrollYProgress, [0.24, 0.32], [0, 1]);
  const statsY = useTransform(scrollYProgress, [0.24, 0.32], [20, 0]);

  // Vertical depth lines
  const depthLine1Height = useTransform(scrollYProgress, [0, 0.2], ['0%', '100%']);
  const depthLine2Height = useTransform(scrollYProgress, [0.05, 0.25], ['0%', '80%']);
  const depthLineOpacity = useTransform(scrollYProgress, [0, 0.05, 0.3, 0.4], [0, 0.15, 0.15, 0]);

  const handleRequestAccess = () => {
    analytics.trackCTA('request_access', 'hero');
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={containerRef} className="relative min-h-[200vh]">
      <div className="sticky top-0 min-h-screen flex items-center pt-20 pb-12 md:pb-0 overflow-hidden">

        {/* Layer 0: Background grid - slowest */}
        <motion.div
          className="absolute inset-0 bg-grid-fade pointer-events-none"
          style={{ y: bgY, scale: bgScale, opacity: bgOpacity }}
        />

        {/* Layer 1: Depth lines */}
        <motion.div
          className="absolute left-[20%] top-0 w-px bg-accent pointer-events-none origin-top hidden md:block"
          style={{ height: depthLine1Height, opacity: depthLineOpacity }}
        />
        <motion.div
          className="absolute right-[30%] bottom-0 w-px bg-accent pointer-events-none origin-bottom hidden md:block"
          style={{ height: depthLine2Height, opacity: depthLineOpacity }}
        />

        {/* Layer 2: Mid-layer data fragments - medium speed */}
        <div className="absolute inset-0 pointer-events-none hidden md:block">
          {fragments.map((frag, i) => {
            const fragY = useTransform(scrollYProgress, [0, 1], [0, -200 * frag.speed]);
            const fragOpacity = useTransform(
              scrollYProgress,
              [0, 0.05, 0.35, 0.45],
              [0, 0.25, 0.25, 0]
            );

            return (
              <motion.span
                key={i}
                className="absolute text-[9px] font-mono text-accent/60 select-none"
                style={{
                  left: frag.x,
                  top: frag.y,
                  y: fragY,
                  opacity: fragOpacity,
                }}
              >
                {frag.text}
              </motion.span>
            );
          })}
        </div>

        {/* Layer 3: Foreground content - fastest */}
        <motion.div
          className="container-wide relative z-10"
          style={{ y: contentY, scale: contentScale }}
        >
          <div className="max-w-3xl">
            <motion.p
              className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent mb-6"
              style={{ opacity: kickerOpacity }}
            >
              Sovereign Intelligence Infrastructure
            </motion.p>

            <motion.h1
              className="text-4xl md:text-display mb-4 md:mb-6"
              style={{ opacity: contentOpacity }}
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
        </motion.div>
      </div>
    </section>
  );
}
