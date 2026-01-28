import { Button } from '@/components/ui/button';

const rows = ['ID-001', 'ID-002', 'ID-003', 'ID-004'];
const cols = ['Identity', 'Evidence', 'Integrity', 'Policy', 'Decision'];

// Pre-defined states for the grid cells
const cellStates: Record<string, 'verified' | 'processing' | 'empty'> = {
  'ID-001-Identity': 'verified',
  'ID-001-Evidence': 'verified',
  'ID-001-Integrity': 'verified',
  'ID-001-Policy': 'verified',
  'ID-001-Decision': 'verified',
  'ID-002-Identity': 'verified',
  'ID-002-Evidence': 'verified',
  'ID-002-Integrity': 'verified',
  'ID-002-Policy': 'processing',
  'ID-002-Decision': 'empty',
  'ID-003-Identity': 'verified',
  'ID-003-Evidence': 'verified',
  'ID-003-Integrity': 'processing',
  'ID-003-Policy': 'empty',
  'ID-003-Decision': 'empty',
  'ID-004-Identity': 'verified',
  'ID-004-Evidence': 'processing',
  'ID-004-Integrity': 'empty',
  'ID-004-Policy': 'empty',
  'ID-004-Decision': 'empty',
};

// Grid Matrix — Data points populating a verification grid
export function HeroVariantFour() {
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
              <span className="font-mono text-accent">for critical operations.</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
              Unified evidence. Verified integrity. Audit-ready outcomes.
            </p>

            <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
              <Button
                size="lg"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-foreground text-background hover:bg-foreground/90 px-6"
              >
                Request demo
              </Button>
            </div>
          </div>

          {/* Right: Grid Matrix Visualization */}
          <div className="relative h-[350px] md:h-[400px] animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="absolute inset-0 flex items-center justify-center overflow-x-auto">
              <div className="bg-background border border-border p-4">
                {/* Column headers */}
                <div className="flex gap-1 mb-1">
                  <div className="w-16 h-6" /> {/* Spacer for row labels */}
                  {cols.map((col, i) => (
                    <div 
                      key={col} 
                      className="w-14 h-6 flex items-center justify-center text-[10px] font-mono text-muted-foreground animate-fade-up"
                      style={{ animationDelay: `${400 + i * 50}ms` }}
                    >
                      {col.slice(0, 4)}
                    </div>
                  ))}
                </div>
                
                {/* Grid rows */}
                {rows.map((row, rowIndex) => (
                  <div key={row} className="flex gap-1 mb-1">
                    {/* Row label */}
                    <div 
                      className="w-16 h-10 flex items-center text-[10px] font-mono text-muted-foreground animate-fade-up"
                      style={{ animationDelay: `${500 + rowIndex * 100}ms` }}
                    >
                      {row}
                    </div>
                    
                    {/* Cells */}
                    {cols.map((col, colIndex) => {
                      const state = cellStates[`${row}-${col}`] || 'empty';
                      return (
                        <div
                          key={`${row}-${col}`}
                          className={`w-14 h-10 border transition-colors animate-fade-up ${
                            state === 'verified'
                              ? 'bg-accent/20 border-accent/50'
                              : state === 'processing'
                              ? 'bg-secondary border-accent animate-pulse-soft'
                              : 'bg-secondary border-border'
                          }`}
                          style={{ animationDelay: `${500 + rowIndex * 100 + colIndex * 50}ms` }}
                        >
                          {state === 'verified' && (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-accent" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
                
                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-accent/20 border border-accent/50" />
                    <span className="text-[10px] text-muted-foreground">Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-secondary border border-accent" />
                    <span className="text-[10px] text-muted-foreground">Processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-secondary border border-border" />
                    <span className="text-[10px] text-muted-foreground">Pending</span>
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
