import { useState } from 'react';
import { HeroVariantA } from './HeroVariantA';
import { HeroVariantB } from './HeroVariantB';
import { HeroVariantC } from './HeroVariantC';
import { HeroVariantD } from './HeroVariantD';

const variants = [
  { id: 'a', label: 'A: Declassify' },
  { id: 'b', label: 'B: Redaction' },
  { id: 'c', label: 'C: Cipher' },
  { id: 'd', label: 'D: Gravity' },
] as const;

type VariantId = typeof variants[number]['id'];

export function HeroSelector() {
  const [active, setActive] = useState<VariantId>('b');

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
          >
            {v.label}
          </button>
        ))}
      </div>

      {active === 'a' && <HeroVariantA />}
      {active === 'b' && <HeroVariantB />}
      {active === 'c' && <HeroVariantC />}
      {active === 'd' && <HeroVariantD />}
    </div>
  );
}
