import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const documents = [
  { id: 1, label: 'Identity Verification', hash: '0x7f3a...c2d1', verified: true },
  { id: 2, label: 'Evidence Package', hash: '0x9b2e...f4a8', verified: true },
  { id: 3, label: 'Policy Compliance', hash: '0x4c1d...8e3b', verified: false },
];

// Document Stack — Abstract document layers being verified
export function HeroVariantTwo() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-12 md:pb-0">
      <div className="absolute inset-0 bg-grid-fade pointer-events-none" />
      
      <div className="container-wide relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-display mb-4 leading-[1.1] animate-fade-up">
              Decision infrastructure
              <br />
              <span className="text-muted-foreground">for critical operations.</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
              Unified evidence. Verified integrity. Audit-ready outcomes.
            </p>

            <div className="flex items-center gap-4 animate-fade-up" style={{ animationDelay: '200ms' }}>
              <Button
                size="lg"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-foreground text-background hover:bg-foreground/90 px-6"
              >
                Request demo
              </Button>
              <span className="text-sm text-muted-foreground">No commitment required</span>
            </div>
          </div>

          {/* Right: Document Stack Visualization */}
          <div className="relative h-[350px] md:h-[400px] animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full max-w-sm">
                {documents.map((doc, index) => (
                  <div
                    key={doc.id}
                    className="absolute w-full bg-background border border-border p-4 animate-fade-up"
                    style={{
                      top: `${index * 24}px`,
                      left: `${index * 8}px`,
                      zIndex: documents.length - index,
                      animationDelay: `${400 + index * 150}ms`,
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-sm font-medium mb-1">{doc.label}</div>
                        <div className="text-xs font-mono text-muted-foreground">{doc.hash}</div>
                      </div>
                      {doc.verified && (
                        <div className="w-5 h-5 bg-accent/20 border border-accent flex items-center justify-center">
                          <Check className="w-3 h-3 text-accent" />
                        </div>
                      )}
                    </div>
                    
                    {index === 0 && (
                      <div className="pt-3 border-t border-border">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
                          <span className="text-xs text-muted-foreground">Verification in progress</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Hash signatures at bottom */}
                <div 
                  className="absolute -bottom-16 left-0 right-0 text-center animate-fade-up"
                  style={{ animationDelay: '850ms' }}
                >
                  <div className="text-xs font-mono text-muted-foreground/50">
                    SHA-256 · Tamper-evident · Cryptographically sealed
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
