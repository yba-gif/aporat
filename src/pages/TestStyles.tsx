import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown } from 'lucide-react';

type StyleVariant = 'brutalist' | 'editorial' | 'corporate' | 'darktech' | 'warm';

const styles: { id: StyleVariant; name: string; description: string }[] = [
  { id: 'brutalist', name: 'Brutalist', description: 'Raw, bold, unapologetic' },
  { id: 'editorial', name: 'Editorial', description: 'Elegant, refined, magazine-like' },
  { id: 'corporate', name: 'Neo-Corporate', description: 'Professional, structured, trustworthy' },
  { id: 'darktech', name: 'Dark Tech', description: 'Futuristic, sleek, high-contrast' },
  { id: 'warm', name: 'Warm Minimal', description: 'Organic, approachable, soft' },
];

const styleClasses: Record<StyleVariant, string> = {
  brutalist: 'style-brutalist',
  editorial: 'style-editorial',
  corporate: 'style-corporate',
  darktech: 'style-darktech',
  warm: 'style-warm',
};

export default function TestStyles() {
  const [activeStyle, setActiveStyle] = useState<StyleVariant>('brutalist');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`min-h-screen ${styleClasses[activeStyle]}`}>
      {/* Style Switcher - Always visible */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white backdrop-blur-sm border-b-2 border-black/20 safe-area-top">
        <div className="px-3 py-2 sm:px-4 sm:py-3">
          {/* Mobile: Dropdown */}
          <div className="md:hidden relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 border-2 border-black text-sm font-bold bg-white"
            >
              <span className="truncate">{styles.find(s => s.id === activeStyle)?.name}</span>
              <ChevronDown className={`w-5 h-5 flex-shrink-0 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
              <div className="absolute left-0 right-0 mt-1 bg-white border-2 border-black shadow-lg max-h-[60vh] overflow-y-auto">
                {styles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => {
                      setActiveStyle(style.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-3 text-sm border-b border-black/10 last:border-b-0 ${
                      activeStyle === style.id ? 'bg-black text-white' : 'hover:bg-black/5 active:bg-black/10'
                    }`}
                  >
                    <span className="font-bold block">{style.name}</span>
                    <span className="text-xs opacity-70 block mt-0.5">{style.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Desktop: Buttons */}
          <div className="hidden md:flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold mr-2">Style:</span>
            {styles.map((style) => (
              <button
                key={style.id}
                onClick={() => setActiveStyle(style.id)}
                className={`px-3 py-1.5 text-sm border-2 transition-all font-medium ${
                  activeStyle === style.id
                    ? 'bg-black text-white border-black'
                    : 'bg-white border-black/30 hover:border-black'
                }`}
              >
                {style.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content - proper spacing for fixed header */}
      <main className="pt-16 sm:pt-20">
        <StyleDemo variant={activeStyle} />
      </main>
    </div>
  );
}

function StyleDemo({ variant }: { variant: StyleVariant }) {
  return (
    <div className="style-container">
      {/* Hero */}
      <section className="style-hero">
        <div className="style-hero-content">
          <p className="style-label">Enterprise Infrastructure</p>
          <h1 className="style-headline">
            Mobility compliance,<br />
            <span className="style-headline-accent">engineered.</span>
          </h1>
          <p className="style-subhead">
            Portolan Labs standardizes evidence, detects integrity risks, and delivers audit-grade decision workflows for cross-border mobility.
          </p>
          <div className="style-cta-group">
            <Button className="style-cta-primary">Request access</Button>
            <Button className="style-cta-secondary">View product brief</Button>
          </div>
        </div>
        <div className="style-hero-visual">
          <HeroVisual variant={variant} />
        </div>
      </section>

      {/* Features */}
      <section className="style-section">
        <div className="style-section-header">
          <p className="style-label">Product</p>
          <h2 className="style-title">Three platforms. One system.</h2>
        </div>
        <div className="style-cards">
          {['Foundry', 'Gotham', 'Apollo'].map((name, i) => (
            <div key={name} className="style-card">
              <div className="style-card-icon">{['◇', '◈', '○'][i]}</div>
              <h3 className="style-card-title">Portolan {name}</h3>
              <p className="style-card-text">
                {['Data fabric and evidence vault', 'Case intelligence workbench', 'Policy deployment engine'][i]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Differentiators */}
      <section className="style-section-alt">
        <div className="style-section-header">
          <p className="style-label">Why Portolan</p>
          <h2 className="style-title">What sets us apart.</h2>
        </div>
        <div className="style-list">
          {[
            'Explainable integrity checks',
            'Policy rulesets as deployable configurations',
            'Audit-grade chain-of-custody',
            'Network anomaly detection at scale',
          ].map((item) => (
            <div key={item} className="style-list-item">
              <Check className="style-list-icon" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="style-cta-section">
        <h2 className="style-cta-title">Ready to see Portolan in action?</h2>
        <p className="style-cta-text">Request access to our pilot program.</p>
        <Button className="style-cta-primary">Get started</Button>
      </section>

      {/* Footer */}
      <footer className="style-footer">
        <div className="style-footer-logo">◎ Portolan Labs</div>
        <div className="style-footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Security</a>
        </div>
        <p className="style-footer-copy">© 2024 Portolan Labs</p>
      </footer>
    </div>
  );
}

function HeroVisual({ variant }: { variant: StyleVariant }) {
  const visuals: Record<StyleVariant, JSX.Element> = {
    brutalist: (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-[120px] md:text-[200px] font-black leading-none opacity-10">
          ◎
        </div>
      </div>
    ),
    editorial: (
      <div className="w-full h-full relative">
        <svg viewBox="0 0 400 300" className="w-full h-full">
          <defs>
            <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" opacity="0.2" />
            </pattern>
          </defs>
          <rect fill="url(#dots)" width="400" height="300" />
          <line x1="50" y1="150" x2="350" y2="150" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="100" cy="150" r="4" fill="currentColor" />
          <circle cx="200" cy="150" r="4" fill="currentColor" />
          <circle cx="300" cy="150" r="4" fill="currentColor" />
        </svg>
      </div>
    ),
    corporate: (
      <div className="w-full h-full grid grid-cols-3 gap-4 p-8">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="bg-blue-500/10 border border-blue-500/20 rounded-lg animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
        ))}
      </div>
    ),
    darktech: (
      <div className="w-full h-full relative overflow-hidden">
        <svg viewBox="0 0 400 300" className="w-full h-full">
          {[...Array(20)].map((_, i) => (
            <line
              key={i}
              x1={Math.random() * 400}
              y1={Math.random() * 300}
              x2={Math.random() * 400}
              y2={Math.random() * 300}
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.3"
            />
          ))}
          <circle cx="200" cy="150" r="40" fill="none" stroke="currentColor" strokeWidth="1" className="animate-pulse" />
          <circle cx="200" cy="150" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
          <circle cx="200" cy="150" r="80" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.3" />
        </svg>
      </div>
    ),
    warm: (
      <div className="w-full h-full flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-48 h-48">
          <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <circle cx="100" cy="100" r="20" fill="currentColor" opacity="0.2" />
        </svg>
      </div>
    ),
  };

  return visuals[variant];
}
