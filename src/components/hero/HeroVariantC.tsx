import { useRef, useMemo, useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { analytics } from '@/lib/analytics';


const CIPHER_CHARS = '█▓▒░╬╠╣╦╩┼─│┌┐└┘├┤┬┴0123456789ABCDEF@#$%&*!?><{}[]';

function CyclingChar({ duration, onDone }: { duration: number; onDone: () => void }) {
  const [char, setChar] = useState(() => CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)]);

  useEffect(() => {
    const interval = setInterval(() => {
      setChar(CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)]);
    }, 50 + Math.random() * 40);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      onDone();
    }, duration);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [duration, onDone]);

  return <>{char}</>;
}

function DecodingText({ text, delayMs, charStagger }: { text: string; delayMs: number; charStagger: number }) {
  const chars = useMemo(() => text.split(''), [text]);
  const [decoded, setDecoded] = useState<boolean[]>(() => chars.map(() => false));
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  useEffect(() => {
    if (!started) return;
    const timers = chars.map((_, i) => {
      if (chars[i] === ' ') {
        setDecoded(prev => { const n = [...prev]; n[i] = true; return n; });
        return null;
      }
      return setTimeout(() => {
        setDecoded(prev => { const n = [...prev]; n[i] = true; return n; });
      }, i * charStagger);
    });
    return () => timers.forEach(t => t && clearTimeout(t));
  }, [started, chars, charStagger]);

  if (!started) return <span className="opacity-0">{text}</span>;

  return (
    <>
      {chars.map((char, i) => {
        if (char === ' ') return <span key={i}>&nbsp;</span>;
        return (
          <span key={i} className="inline-block relative">
            {decoded[i] ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
              >
                {char}
              </motion.span>
            ) : (
              <span className="text-accent/70 font-mono">
                <CyclingChar
                  duration={i * charStagger + 200 + Math.random() * 150}
                  onDone={() => setDecoded(prev => { const n = [...prev]; n[i] = true; return n; })}
                />
              </span>
            )}
          </span>
        );
      })}
    </>
  );
}

export function HeroVariantC() {
  const handleRequestAccess = () => {
    analytics.trackCTA('request_access', 'hero');
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Timeline: kicker 200ms, line1 400ms, line2 800ms, sub 1800ms, cta 2200ms, stats 2600ms
  return (
    <section className="relative min-h-screen">
      <div className="min-h-screen flex items-center pt-20 pb-12 md:pb-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid-fade pointer-events-none opacity-20" />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--foreground)) 2px, hsl(var(--foreground)) 3px)',
          }}
        />

        <div className="container-wide relative z-10">
          <div className="max-w-4xl">
            {/* Terminal prompt */}
            <motion.div
              className="flex items-center gap-2 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-[10px] font-mono text-muted-foreground">DECRYPTING TRANSMISSION</span>
              <motion.span
                className="text-accent font-mono text-[10px]"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.2 }}
              >
                █
              </motion.span>
            </motion.div>

            {/* Kicker */}
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent mb-6">
              <DecodingText text="SOVEREIGN INTELLIGENCE INFRASTRUCTURE" delayMs={200} charStagger={25} />
            </p>

            {/* Headline line 1 */}
            <h1 className="text-4xl md:text-display mb-2">
              <DecodingText text="Decision systems" delayMs={400} charStagger={40} />
            </h1>

            {/* Headline line 2 */}
            <p className="text-4xl md:text-display text-muted-foreground mb-6">
              <DecodingText text="for critical operations." delayMs={800} charStagger={35} />
            </p>

            {/* Sub */}
            <motion.p
              className="text-lg md:text-subhead mb-6 md:mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.8 }}
            >
              Sovereign decision infrastructure. Full-spectrum audit coverage.
            </motion.p>

            <motion.div
              className="mb-6 md:mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 2.2 }}
            >
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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 2.6 }}
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
