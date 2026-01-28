import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Check, Shield, FileCheck, Lock, Eye } from 'lucide-react';

// The Evidence Chain - Horizontal verification pipeline
const checkpoints = [
  { id: 'ingest', label: 'Ingest', icon: FileCheck },
  { id: 'verify', label: 'Verify', icon: Shield },
  { id: 'encrypt', label: 'Encrypt', icon: Lock },
  { id: 'audit', label: 'Audit', icon: Eye },
  { id: 'resolve', label: 'Resolve', icon: Check },
];

export function HeroVariantTwo() {
  const [activeCheckpoint, setActiveCheckpoint] = useState(0);
  const [completedCheckpoints, setCompletedCheckpoints] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCheckpoint(prev => {
        const next = (prev + 1) % checkpoints.length;
        if (next === 0) {
          setCompletedCheckpoints([]);
        } else {
          setCompletedCheckpoints(curr => [...curr, prev]);
        }
        return next;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Subtle grid */}
      <div className="absolute inset-0 bg-grid-fade opacity-30" />
      
      {/* Evidence Chain */}
      <div className="relative w-full max-w-5xl px-6 mb-16">
        <div className="flex items-center justify-between">
          {checkpoints.map((checkpoint, index) => {
            const Icon = checkpoint.icon;
            const isActive = index === activeCheckpoint;
            const isCompleted = completedCheckpoints.includes(index);
            
            return (
              <div key={checkpoint.id} className="flex items-center">
                {/* Checkpoint */}
                <div className="flex flex-col items-center">
                  <div
                    className={`relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center border-2 transition-all duration-500 ${
                      isActive
                        ? 'border-accent bg-accent/10 scale-110'
                        : isCompleted
                        ? 'border-accent/50 bg-accent/5'
                        : 'border-border bg-background'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 md:w-6 md:h-6 transition-colors duration-300 ${
                        isActive || isCompleted ? 'text-accent' : 'text-muted-foreground'
                      }`}
                    />
                    {isActive && (
                      <div className="absolute inset-0 border-2 border-accent animate-ping opacity-50" />
                    )}
                  </div>
                  <span
                    className={`mt-3 text-xs font-medium tracking-wider uppercase transition-colors ${
                      isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {checkpoint.label}
                  </span>
                </div>
                
                {/* Connection line */}
                {index < checkpoints.length - 1 && (
                  <div className="flex-1 h-px mx-2 md:mx-4 relative">
                    <div className="absolute inset-0 bg-border" />
                    <div
                      className={`absolute inset-y-0 left-0 bg-accent transition-all duration-500 ${
                        isCompleted || index < activeCheckpoint ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-2xl px-6">
        <h1 className="text-display mb-6 animate-fade-up">
          Chain of custody.
          <br />
          <span className="text-muted-foreground">Chain of trust.</span>
        </h1>
        <p className="text-subhead mb-8 animate-fade-up delay-100">
          Every document verified. Every action logged. Every decision defensible.
        </p>
        <Button
          size="lg"
          className="bg-foreground text-background hover:bg-foreground/90 animate-fade-up delay-200"
          onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Request demo
        </Button>
      </div>
    </section>
  );
}
