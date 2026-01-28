import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

// The Audit Cascade - Terminal-style event waterfall
const auditEvents = [
  { time: '14:32:07.892', event: 'DECISION_RENDERED', status: 'APPROVED', hash: '0x7f3a' },
  { time: '14:32:07.445', event: 'POLICY_CHECK', status: 'PASS', hash: '0x2c1b' },
  { time: '14:32:06.998', event: 'RISK_SCORE', status: '0.08', hash: '0x9e4d' },
  { time: '14:32:06.221', event: 'INTEGRITY_VERIFY', status: 'VALID', hash: '0x1a8f' },
  { time: '14:32:05.887', event: 'EVIDENCE_INGEST', status: 'COMPLETE', hash: '0x5b2e' },
  { time: '14:32:04.112', event: 'IDENTITY_BIND', status: 'VERIFIED', hash: '0x3d7c' },
  { time: '14:32:03.556', event: 'SESSION_INIT', status: 'ACTIVE', hash: '0x8e1a' },
];

export function HeroVariantFour() {
  const [visibleEvents, setVisibleEvents] = useState(0);
  const [cursorBlink, setCursorBlink] = useState(true);

  useEffect(() => {
    const eventInterval = setInterval(() => {
      setVisibleEvents(prev => {
        if (prev >= auditEvents.length) {
          // Reset after showing all
          setTimeout(() => setVisibleEvents(0), 2000);
          return prev;
        }
        return prev + 1;
      });
    }, 600);

    const cursorInterval = setInterval(() => {
      setCursorBlink(prev => !prev);
    }, 530);

    return () => {
      clearInterval(eventInterval);
      clearInterval(cursorInterval);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background">
      {/* Terminal grid */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      
      <div className="container-wide relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <p className="text-label mb-4 animate-fade-up">Immutable Record</p>
            <h1 className="text-display mb-6 animate-fade-up delay-100">
              Every action.
              <br />
              <span className="text-muted-foreground">Permanently logged.</span>
            </h1>
            <p className="text-subhead mb-8 animate-fade-up delay-200">
              Cryptographically sealed audit trails that stand up to any scrutiny.
            </p>
            <Button
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 animate-fade-up delay-300"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Request demo
            </Button>
          </div>

          {/* Audit Terminal */}
          <div className="relative animate-fade-in delay-200">
            <div className="bg-foreground/[0.03] border border-border backdrop-blur-sm">
              {/* Terminal header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-xs font-mono text-muted-foreground">audit.log</span>
              </div>
              
              {/* Terminal content */}
              <div className="p-4 font-mono text-xs space-y-1 h-[320px] overflow-hidden">
                {auditEvents.slice(0, visibleEvents).map((event, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 animate-fade-in"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <span className="text-muted-foreground shrink-0">{event.time}</span>
                    <span className="text-foreground shrink-0 w-32">{event.event}</span>
                    <span className={`shrink-0 ${
                      event.status === 'APPROVED' || event.status === 'PASS' || event.status === 'VALID' || event.status === 'COMPLETE' || event.status === 'VERIFIED' || event.status === 'ACTIVE'
                        ? 'text-accent'
                        : 'text-foreground'
                    }`}>
                      {event.status}
                    </span>
                    <span className="text-muted-foreground/50 ml-auto">{event.hash}</span>
                  </div>
                ))}
                
                {/* Cursor line */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-accent">›</span>
                  <span className={`w-2 h-4 bg-accent ${cursorBlink ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
                </div>
              </div>
            </div>
            
            {/* Decorative corner */}
            <div className="absolute -top-px -right-px w-8 h-8 border-t border-r border-accent" />
            <div className="absolute -bottom-px -left-px w-8 h-8 border-b border-l border-accent" />
          </div>
        </div>
      </div>
    </section>
  );
}
