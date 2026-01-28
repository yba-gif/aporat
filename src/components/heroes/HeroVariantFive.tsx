import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const logEntries = [
  { time: '14:31:40.123', type: 'INFO', msg: 'Workflow initiated', hash: null },
  { time: '14:31:45.456', type: 'INFO', msg: 'Document ingested', hash: '0x7f3a' },
  { time: '14:31:52.789', type: 'OK', msg: 'Identity verification passed', hash: null },
  { time: '14:32:05.012', type: 'OK', msg: 'Evidence pack validated', hash: '0x9b2e' },
  { time: '14:32:07.345', type: 'INFO', msg: 'Integrity check: score 0.98', hash: null },
  { time: '14:32:18.678', type: 'INFO', msg: 'Policy ruleset applied', hash: '0x4c1d' },
  { time: '14:32:22.901', type: 'OK', msg: 'Decision rendered: APPROVED', hash: '0xf2a9' },
];

// Terminal Feed — Live operations console aesthetic
export function HeroVariantFive() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleLines((prev) => {
        if (prev >= logEntries.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 400);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-12 md:pb-0">
      <div className="absolute inset-0 bg-grid-fade pointer-events-none" />
      
      <div className="container-wide relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-display mb-6 animate-fade-up">
              Decision infrastructure
              <br />
              <span className="text-muted-foreground">for critical operations.</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
              Unified evidence. Verified integrity. <code className="text-accent font-mono text-base">audit-ready</code> outcomes.
            </p>

            <div className="mb-8 animate-fade-up" style={{ animationDelay: '200ms' }}>
              <Button
                size="lg"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-foreground text-background hover:bg-foreground/90 px-6"
              >
                Request demo
              </Button>
            </div>

            <p className="text-sm text-muted-foreground animate-fade-up" style={{ animationDelay: '300ms' }}>
              Audit-grade logs · Explainable checks · Policy rulesets
            </p>
          </div>

          {/* Right: Terminal Visualization */}
          <div className="relative h-[350px] md:h-[400px] animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="absolute inset-4 bg-background border border-border flex flex-col">
              {/* Terminal header */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-secondary">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                </div>
                <span className="text-xs font-mono text-muted-foreground ml-2">audit-log</span>
              </div>
              
              {/* Terminal content */}
              <div className="flex-1 p-3 font-mono text-xs overflow-hidden">
                <div className="space-y-1">
                  {logEntries.slice(0, visibleLines).map((entry, index) => (
                    <div 
                      key={index} 
                      className="flex gap-2 animate-fade-in"
                    >
                      <span className="text-muted-foreground shrink-0">{entry.time}</span>
                      <span className={`shrink-0 ${
                        entry.type === 'OK' ? 'text-accent' : 'text-muted-foreground'
                      }`}>
                        [{entry.type}]
                      </span>
                      <span className="text-foreground/80">{entry.msg}</span>
                      {entry.hash && (
                        <span className="text-muted-foreground/50 shrink-0">{entry.hash}</span>
                      )}
                    </div>
                  ))}
                  
                  {/* Blinking cursor */}
                  {visibleLines >= logEntries.length && (
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-muted-foreground">$</span>
                      <div className="w-2 h-4 bg-accent animate-pulse-soft" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
