import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  HeroVariantOne,
  HeroVariantTwo,
  HeroVariantThree,
  HeroVariantFour,
  HeroVariantFive,
} from '@/components/heroes';

const variants = [
  { id: 1, name: 'Signal Flow', description: 'Horizontal signal bars showing verification stages' },
  { id: 2, name: 'Document Stack', description: 'Abstract document layers being verified' },
  { id: 3, name: 'Timeline Spine', description: 'Vertical timeline with decision checkpoints' },
  { id: 4, name: 'Grid Matrix', description: 'Data points populating a verification grid' },
  { id: 5, name: 'Terminal Feed', description: 'Live operations console aesthetic' },
];

const heroComponents = [
  HeroVariantOne,
  HeroVariantTwo,
  HeroVariantThree,
  HeroVariantFour,
  HeroVariantFive,
];

export default function Demo() {
  const [activeVariant, setActiveVariant] = useState(0);
  const ActiveHero = heroComponents[activeVariant];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Variant selector */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-1 bg-background/90 backdrop-blur-sm border border-border">
        {variants.map((variant, index) => (
          <button
            key={variant.id}
            onClick={() => setActiveVariant(index)}
            className={`px-3 py-2 text-xs font-medium transition-all ${
              activeVariant === index
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            <span className="hidden md:inline">{variant.name}</span>
            <span className="md:hidden">{variant.id}</span>
          </button>
        ))}
      </div>

      {/* Active hero */}
      <main>
        <ActiveHero />
      </main>

      {/* Variant info */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 text-center">
        <div className="bg-background/90 backdrop-blur-sm border border-border px-6 py-3">
          <p className="text-sm font-medium">{variants[activeVariant].name}</p>
          <p className="text-xs text-muted-foreground">{variants[activeVariant].description}</p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
