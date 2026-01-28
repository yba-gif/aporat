import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

// The Convergence Grid - Data points converging to a central decision
export function HeroVariantOne() {
  const [activePoints, setActivePoints] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newPoint = Math.floor(Math.random() * 25);
      setActivePoints(prev => {
        const updated = [...prev, newPoint];
        return updated.slice(-8);
      });
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Convergence Grid Background */}
      <div className="absolute inset-0">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="30%">
              <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
            </radialGradient>
          </defs>
          
          {/* Grid points */}
          {Array.from({ length: 25 }).map((_, i) => {
            const row = Math.floor(i / 5);
            const col = i % 5;
            const x = 20 + col * 15;
            const y = 20 + row * 15;
            const isActive = activePoints.includes(i);
            
            return (
              <g key={i}>
                {/* Connection line to center */}
                <line
                  x1={x}
                  y1={y}
                  x2={50}
                  y2={50}
                  stroke="hsl(var(--line-subtle))"
                  strokeWidth="0.1"
                  strokeDasharray="1 1"
                />
                {isActive && (
                  <line
                    x1={x}
                    y1={y}
                    x2={50}
                    y2={50}
                    stroke="hsl(var(--accent))"
                    strokeWidth="0.2"
                    className="animate-fade-in"
                  />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? 0.8 : 0.4}
                  fill={isActive ? "hsl(var(--accent))" : "hsl(var(--muted-foreground))"}
                  className="transition-all duration-300"
                />
              </g>
            );
          })}
          
          {/* Center decision node */}
          <circle cx={50} cy={50} r={8} fill="url(#centerGlow)" />
          <circle cx={50} cy={50} r={3} fill="hsl(var(--accent))" className="animate-pulse-soft" />
          <circle cx={50} cy={50} r={1.5} fill="hsl(var(--background))" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-2xl px-6">
        <p className="text-label mb-4 animate-fade-up">Decision Infrastructure</p>
        <h1 className="text-display mb-6 animate-fade-up delay-100">
          Every signal.
          <br />
          <span className="text-muted-foreground">One resolution.</span>
        </h1>
        <p className="text-subhead mb-8 animate-fade-up delay-200">
          Converge fragmented evidence into audit-grade decisions.
        </p>
        <Button
          size="lg"
          className="bg-foreground text-background hover:bg-foreground/90 animate-fade-up delay-300"
          onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Request demo
        </Button>
      </div>
    </section>
  );
}
