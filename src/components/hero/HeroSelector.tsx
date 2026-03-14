import { useState } from 'react';
import { HeroVariantA } from './HeroVariantA';
import { HeroVariantB } from './HeroVariantB';
import { HeroVariantC } from './HeroVariantC';
import { HeroVariantD } from './HeroVariantD';

const variants = [
  { id: 'a', label: 'A: Declassification', description: 'Scan-line reveals content with blur-to-sharp' },
  { id: 'b', label: 'B: Typography', description: 'Words slide in from scattered positions and lock into place' },
  { id: 'c', label: 'C: Depth Field', description: 'Parallax layers at different scroll speeds create z-depth' },
  { id: 'd', label: 'D: Wipe', description: 'Vertical edge sweeps left-to-right revealing content' },
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
            className={`px-3 py-2 text-[10px] md:text-xs font-mono uppercase tracking-wider transition-colors ${
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
      {active === 'd' && <HeroVariantD />}
    </div>
  );
}
