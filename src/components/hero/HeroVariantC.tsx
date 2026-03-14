import { useRef, useMemo, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { analytics } from '@/lib/analytics';
import { Shield, Eye, Lock } from 'lucide-react';

/**
 * VARIANT C: "Cipher Decode"
 * 
 * The headline starts as encrypted text — random hex, symbols, unicode.
 * As you scroll, each character cycles through random glyphs before 
 * landing on the correct letter. Like watching a cipher crack in real-time.
 * The decode ripples left to right.
 */


const stats = [
  { value: '4.2hrs', label: 'Fraud ring resolution' },
  { value: '40+', label: 'Countries' },
  { value: '100%', label: 'Audit chain coverage' },
  { value: '0', label: 'Data leaves your jurisdiction' },
];

const CIPHER_CHARS = '█▓▒░╬╠╣╦╩┼─│┌┐└┘├┤┬┴0123456789ABCDEF@#$%&*!?><{}[]';

function useDecodeText(text: string, scrollYProgress: MotionValue<number>, startAt: number, duration: number) {
  const chars = useMemo(() => text.split(''), [text]);
  
  return chars.map((char, i) => {
    if (char === ' ') return { char: '\u00A0', isSpace: true, opacity: 1 as any, isDecoded: 1 as any };
    
    const charStart = startAt + (i / chars.length) * duration;
    const charEnd = charStart + duration * 0.3;
    
    const isDecoded = useTransform(scrollYProgress, [charStart, charEnd], [0, 1]);
    const opacity = useTransform(scrollYProgress, [startAt - 0.02, startAt], [0, 1]);
    
    return { char, isSpace: false, opacity, isDecoded };
  });
}

function DecodingChar({ char, isDecoded, opacity, isSpace }: { char: string; isDecoded: any; opacity: any; isSpace: boolean }) {
  if (isSpace) return <span>&nbsp;</span>;
  
  return (
    <motion.span
      className="inline-block relative"
      style={{ opacity }}
    >
      {/* Decoded (real) character */}
      <motion.span
        className="relative z-10"
        style={{
          opacity: isDecoded,
        }}
      >
        {char}
      </motion.span>
      
      {/* Encrypted character overlay */}
      <motion.span
        className="absolute inset-0 text-accent/70 font-mono"
        style={{
          opacity: useTransform(isDecoded, [0, 0.5, 1], [1, 0.5, 0]),
        }}
      >
        <CyclingChar />
      </motion.span>
    </motion.span>
  );
}

function CyclingChar() {
  const [char, setChar] = useState(() => CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)]);

  useEffect(() => {
    const interval = setInterval(() => {
      setChar(CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)]);
    }, 60 + Math.random() * 80);
    return () => clearInterval(interval);
  }, []);

  return <>{char}</>;
}

export function HeroVariantC() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Decode the headline text
  const line1Chars = useDecodeText('Decision systems', scrollYProgress, 0.04, 0.18);
  const line2Chars = useDecodeText('for critical operations.', scrollYProgress, 0.1, 0.2);

  // Kicker decodes first
  const kickerChars = useDecodeText('SOVEREIGN INTELLIGENCE INFRASTRUCTURE', scrollYProgress, 0.02, 0.12);

  // Cursor blink at the end of decode
  const cursorOpacity = useTransform(scrollYProgress, [0.02, 0.04, 0.3, 0.35], [0, 1, 1, 0]);

  // Sub content
  const subOpacity = useTransform(scrollYProgress, [0.26, 0.32], [0, 1]);
  const subY = useTransform(scrollYProgress, [0.26, 0.32], [10, 0]);
  const ctaOpacity = useTransform(scrollYProgress, [0.3, 0.36], [0, 1]);
  const chipsOpacity = useTransform(scrollYProgress, [0.34, 0.4], [0, 1]);
  const statsOpacity = useTransform(scrollYProgress, [0.38, 0.46], [0, 1]);
  const statsY = useTransform(scrollYProgress, [0.38, 0.46], [15, 0]);

  // Terminal frame
  const frameOpacity = useTransform(scrollYProgress, [0, 0.03], [0, 1]);

  const handleRequestAccess = () => {
    analytics.trackCTA('request_access', 'hero');
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={containerRef} className="relative min-h-[200vh]">
      <div className="sticky top-0 min-h-screen flex items-center pt-20 pb-12 md:pb-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid-fade pointer-events-none opacity-20" />

        {/* Subtle scan lines effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--foreground)) 2px, hsl(var(--foreground)) 3px)',
          }}
        />

        <div className="container-wide relative z-10">
          <div className="max-w-4xl">
            {/* Terminal-style prompt */}
            <motion.div
              className="flex items-center gap-2 mb-8"
              style={{ opacity: frameOpacity }}
            >
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-[10px] font-mono text-muted-foreground">DECRYPTING TRANSMISSION</span>
              <motion.span
                className="text-accent font-mono text-[10px]"
                style={{ opacity: cursorOpacity }}
              >
                █
              </motion.span>
            </motion.div>

            {/* Kicker - decoded char by char */}
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent mb-6">
              {kickerChars.map((c, i) => (
                <DecodingChar key={i} {...c} />
              ))}
            </p>

            {/* Headline line 1 */}
            <h1 className="text-4xl md:text-display mb-2">
              {line1Chars.map((c, i) => (
                <DecodingChar key={i} {...c} />
              ))}
            </h1>

            {/* Headline line 2 */}
            <p className="text-4xl md:text-display text-muted-foreground mb-6">
              {line2Chars.map((c, i) => (
                <DecodingChar key={i} {...c} />
              ))}
            </p>

            {/* Sub */}
            <motion.p
              className="text-lg md:text-subhead mb-6 md:mb-8"
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
