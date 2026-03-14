import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { analytics } from '@/lib/analytics';
import { Shield, Eye, Lock } from 'lucide-react';

/**
 * VARIANT B: "Typographic Assembly"
 * 
 * Each word of the headline slides in from scattered positions 
 * and locks into place as you scroll. Words travel along different 
 * axes at different rates. Controlled chaos to surgical precision.
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

  // Word-level transforms for "Decision systems"
  const word1X = useTransform(scrollYProgress, [0, 0.12], [-200, 0]);
  const word1Opacity = useTransform(scrollYProgress, [0, 0.08], [0, 1]);
  const word2X = useTransform(scrollYProgress, [0.02, 0.14], [300, 0]);
  const word2Opacity = useTransform(scrollYProgress, [0.02, 0.1], [0, 1]);

  // Word-level transforms for "for critical operations."
  const word3Y = useTransform(scrollYProgress, [0.06, 0.16], [60, 0]);
  const word3Opacity = useTransform(scrollYProgress, [0.06, 0.12], [0, 1]);
  const word4X = useTransform(scrollYProgress, [0.08, 0.18], [-150, 0]);
  const word4Opacity = useTransform(scrollYProgress, [0.08, 0.14], [0, 1]);
  const word5X = useTransform(scrollYProgress, [0.1, 0.2], [200, 0]);
  const word5Opacity = useTransform(scrollYProgress, [0.1, 0.16], [0, 1]);

  // Underline that draws itself after words lock
  const underlineWidth = useTransform(scrollYProgress, [0.18, 0.28], ['0%', '100%']);
  const underlineOpacity = useTransform(scrollYProgress, [0.18, 0.22], [0, 1]);

  // Kicker
  const kickerOpacity = useTransform(scrollYProgress, [0.14, 0.2], [0, 1]);
  const kickerLetterSpacing = useTransform(scrollYProgress, [0.14, 0.22], [16, 3]);

  // Sub, CTA, chips
  const subOpacity = useTransform(scrollYProgress, [0.22, 0.28], [0, 1]);
  const subY = useTransform(scrollYProgress, [0.22, 0.28], [15, 0]);
  const ctaOpacity = useTransform(scrollYProgress, [0.26, 0.32], [0, 1]);
  const chipsOpacity = useTransform(scrollYProgress, [0.3, 0.36], [0, 1]);
  const statsOpacity = useTransform(scrollYProgress, [0.34, 0.42], [0, 1]);
  const statsY = useTransform(scrollYProgress, [0.34, 0.42], [20, 0]);

  const handleRequestAccess = () => {
    analytics.trackCTA('request_access', 'hero');
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={containerRef} className="relative min-h-[200vh]">
      <div className="sticky top-0 min-h-screen flex items-center pt-20 pb-12 md:pb-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid-fade pointer-events-none" />

        <div className="container-wide relative z-10">
          <div className="max-w-4xl">
            {/* Kicker with letter-spacing scrub */}
            <motion.p
              className="text-[10px] font-mono uppercase text-accent mb-6 overflow-hidden"
              style={{
                opacity: kickerOpacity,
                letterSpacing: useTransform(kickerLetterSpacing, (v) => `${v}px`),
              }}
            >
              Sovereign Intelligence Infrastructure
            </motion.p>

            {/* Headline - each word independently positioned */}
            <h1 className="text-4xl md:text-display mb-4 md:mb-6">
              <span className="block">
                <motion.span
                  className="inline-block mr-[0.3em]"
                  style={{ x: word1X, opacity: word1Opacity }}
                >
                  Decision
                </motion.span>
                <motion.span
                  className="inline-block"
                  style={{ x: word2X, opacity: word2Opacity }}
                >
                  systems
                </motion.span>
              </span>
              <span className="block text-muted-foreground">
                <motion.span
                  className="inline-block mr-[0.3em]"
                  style={{ y: word3Y, opacity: word3Opacity }}
                >
                  for
                </motion.span>
                <motion.span
                  className="inline-block mr-[0.3em]"
                  style={{ x: word4X, opacity: word4Opacity }}
                >
                  critical
                </motion.span>
                <motion.span
                  className="inline-block"
                  style={{ x: word5X, opacity: word5Opacity }}
                >
                  operations.
                </motion.span>
              </span>
            </h1>

            {/* Drawn underline */}
            <motion.div
              className="h-px bg-accent mb-8 origin-left"
              style={{ width: underlineWidth, opacity: underlineOpacity }}
            />

            <motion.p
              className="text-lg md:text-subhead mb-6 md:mb-8 max-w-2xl"
              style={{ opacity: subOpacity, y: subY }}
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
