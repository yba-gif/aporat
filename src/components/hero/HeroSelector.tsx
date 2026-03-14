import { useState } from 'react';
import { HeroVariantA } from './HeroVariantA';
import { HeroVariantB } from './HeroVariantB';
import { HeroVariantC } from './HeroVariantC';

const variants = [
  { id: 'a', label: 'A: Declassification', description: 'Scan-line reveals content with blur-to-sharp transition' },
  { id: 'b', label: 'B: Signal Acquisition', description: 'Targeting reticle contracts and locks onto headline' },
  { id: 'c', label: 'C: Horizon Split', description: 'Horizontal line splits viewport, content assembles in the gap' },
] as const;

type VariantId = typeof variants[number]['id'];

export function HeroSelector() {
  const [active, setActive] = useState<VariantId>('a');

  return (
    <div>
      {/* Floating selector */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-1 bg-foreground/95 backdrop-blur-sm border border-border shadow-2xl">
        {variants.map((v) => (
          <button
            key={v.id}
            onClick={() => {
              setActive(v.id);
              window.scrollTo({ top: 0 });
            }}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${
              active === v.id
                ? 'bg-accent text-accent-foreground'
                : 'text-background/70 hover:text-background'
            }`}
            title={v.description}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Active variant */}
      {active === 'a' && <HeroVariantA />}
      {active === 'b' && <HeroVariantB />}
      {active === 'c' && <HeroVariantC />}
    </div>
  );
}
