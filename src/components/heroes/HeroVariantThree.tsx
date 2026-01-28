import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

// The Policy Matrix - Geometric gates representing enforcement layers
export function HeroVariantThree() {
  const [gateLevels, setGateLevels] = useState([false, false, false, false]);

  useEffect(() => {
    const timers = gateLevels.map((_, i) =>
      setTimeout(() => {
        setGateLevels(prev => {
          const updated = [...prev];
          updated[i] = true;
          return updated;
        });
      }, 500 + i * 400)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background">
      {/* Abstract geometric background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-full max-w-4xl h-auto" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="gateGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.8" />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Vertical gate lines */}
          {[150, 300, 500, 650].map((x, i) => (
            <g key={i}>
              {/* Gate frame */}
              <rect
                x={x - 2}
                y={80}
                width={4}
                height={240}
                fill="hsl(var(--border))"
              />
              {/* Active gate indicator */}
              {gateLevels[i] && (
                <rect
                  x={x - 2}
                  y={80}
                  width={4}
                  height={240}
                  fill="hsl(var(--accent))"
                  className="animate-fade-in"
                />
              )}
              {/* Gate label */}
              <text
                x={x}
                y={350}
                textAnchor="middle"
                className="fill-muted-foreground text-xs font-mono uppercase"
                style={{ fontSize: '10px' }}
              >
                {['Identity', 'Evidence', 'Policy', 'Audit'][i]}
              </text>
            </g>
          ))}
          
          {/* Data flow line */}
          <path
            d="M 50 200 L 750 200"
            stroke="hsl(var(--line-subtle))"
            strokeWidth="1"
            strokeDasharray="8 4"
          />
          
          {/* Animated data packet */}
          <circle r="6" fill="hsl(var(--accent))">
            <animateMotion
              dur="4s"
              repeatCount="indefinite"
              path="M 50 200 L 750 200"
            />
          </circle>
          
          {/* Gate intersection indicators */}
          {[150, 300, 500, 650].map((x, i) =>
            gateLevels[i] && (
              <g key={`indicator-${i}`} className="animate-fade-in">
                <circle cx={x} cy={200} r={12} fill="hsl(var(--accent))" fillOpacity="0.2" />
                <circle cx={x} cy={200} r={4} fill="hsl(var(--accent))" />
              </g>
            )
          )}
        </svg>
      </div>

      {/* Content overlay */}
      <div className="container-wide relative z-10">
        <div className="max-w-xl">
          <p className="text-label mb-4 animate-fade-up">Policy Enforcement</p>
          <h1 className="text-display mb-6 animate-fade-up delay-100">
            Four gates.
            <br />
            <span className="text-muted-foreground">Zero gaps.</span>
          </h1>
          <p className="text-subhead mb-8 animate-fade-up delay-200">
            Layered verification ensures nothing passes without scrutiny.
          </p>
          <Button
            size="lg"
            className="bg-foreground text-background hover:bg-foreground/90 animate-fade-up delay-300"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Request demo
          </Button>
        </div>
      </div>
    </section>
  );
}
