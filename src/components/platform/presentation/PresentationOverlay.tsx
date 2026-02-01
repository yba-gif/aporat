import { usePresentation } from '@/contexts/PresentationContext';
import { ChevronLeft, ChevronRight, X, Pause, Play, FileText, Hexagon, Network, Database, Scale, Target, Shield, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Unique visual themes for each slide type
const getSlideVisuals = (slideId: string, module?: string) => {
  const themes: Record<string, { icon: React.ReactNode; accentColor: string; glowColor: string; pattern: string }> = {
    'title': {
      icon: <Hexagon className="w-16 h-16" strokeWidth={0.5} />,
      accentColor: 'teal',
      glowColor: 'rgba(20, 184, 166, 0.15)',
      pattern: 'radial',
    },
    'nautica-overview': {
      icon: <Network className="w-16 h-16" strokeWidth={0.5} />,
      accentColor: 'cyan',
      glowColor: 'rgba(6, 182, 212, 0.15)',
      pattern: 'nodes',
    },
    'ahmad-case': {
      icon: <Target className="w-16 h-16" strokeWidth={0.5} />,
      accentColor: 'red',
      glowColor: 'rgba(239, 68, 68, 0.15)',
      pattern: 'target',
    },
    'fraud-network': {
      icon: <Zap className="w-16 h-16" strokeWidth={0.5} />,
      accentColor: 'orange',
      glowColor: 'rgba(249, 115, 22, 0.15)',
      pattern: 'network',
    },
    'maris-vault': {
      icon: <Database className="w-16 h-16" strokeWidth={0.5} />,
      accentColor: 'emerald',
      glowColor: 'rgba(16, 185, 129, 0.15)',
      pattern: 'vault',
    },
    'document-integrity': {
      icon: <Shield className="w-16 h-16" strokeWidth={0.5} />,
      accentColor: 'amber',
      glowColor: 'rgba(245, 158, 11, 0.15)',
      pattern: 'shield',
    },
    'meridian-workflow': {
      icon: <Scale className="w-16 h-16" strokeWidth={0.5} />,
      accentColor: 'violet',
      glowColor: 'rgba(139, 92, 246, 0.15)',
      pattern: 'flow',
    },
    'decision-audit': {
      icon: <FileText className="w-16 h-16" strokeWidth={0.5} />,
      accentColor: 'pink',
      glowColor: 'rgba(236, 72, 153, 0.15)',
      pattern: 'audit',
    },
    'deployment': {
      icon: <Globe className="w-16 h-16" strokeWidth={0.5} />,
      accentColor: 'blue',
      glowColor: 'rgba(59, 130, 246, 0.15)',
      pattern: 'globe',
    },
    'closing': {
      icon: <Hexagon className="w-16 h-16" strokeWidth={0.5} />,
      accentColor: 'teal',
      glowColor: 'rgba(20, 184, 166, 0.2)',
      pattern: 'radial',
    },
  };
  
  return themes[slideId] || themes['title'];
};

const accentColors: Record<string, { primary: string; secondary: string; glow: string }> = {
  teal: { primary: '#14b8a6', secondary: '#0d9488', glow: 'rgba(20, 184, 166, 0.5)' },
  cyan: { primary: '#06b6d4', secondary: '#0891b2', glow: 'rgba(6, 182, 212, 0.5)' },
  red: { primary: '#ef4444', secondary: '#dc2626', glow: 'rgba(239, 68, 68, 0.5)' },
  orange: { primary: '#f97316', secondary: '#ea580c', glow: 'rgba(249, 115, 22, 0.5)' },
  emerald: { primary: '#10b981', secondary: '#059669', glow: 'rgba(16, 185, 129, 0.5)' },
  amber: { primary: '#f59e0b', secondary: '#d97706', glow: 'rgba(245, 158, 11, 0.5)' },
  violet: { primary: '#8b5cf6', secondary: '#7c3aed', glow: 'rgba(139, 92, 246, 0.5)' },
  pink: { primary: '#ec4899', secondary: '#db2777', glow: 'rgba(236, 72, 153, 0.5)' },
  blue: { primary: '#3b82f6', secondary: '#2563eb', glow: 'rgba(59, 130, 246, 0.5)' },
};

export function PresentationOverlay() {
  const { 
    isPresenting, 
    isPaused,
    currentSlide, 
    currentSlideIndex, 
    slides,
    nextSlide,
    prevSlide,
    endPresentation,
    togglePause,
    showSpeakerNotes,
    toggleSpeakerNotes,
  } = usePresentation();

  if (!isPresenting || !currentSlide) return null;

  const progress = ((currentSlideIndex + 1) / slides.length) * 100;
  const isFirstSlide = currentSlideIndex === 0;
  const isLastSlide = currentSlideIndex === slides.length - 1;
  const visuals = getSlideVisuals(currentSlide.id, currentSlide.module);
  const colors = accentColors[visuals.accentColor] || accentColors.teal;

  // Title slides (no module) get full-screen treatment
  const isFullscreenSlide = !currentSlide.module;

  return (
    <>
      {/* Full-screen slide overlay for title/closing slides */}
      {isFullscreenSlide && (
        <div 
          className="fixed inset-0 z-[9990] cursor-pointer overflow-hidden"
          onClick={nextSlide}
          style={{
            background: 'linear-gradient(135deg, #0a0a0f 0%, #0d1117 50%, #0a0f14 100%)',
          }}
        >
          {/* Animated grid background with accent color */}
          <div 
            className="absolute inset-0 opacity-[0.04] transition-all duration-700"
            style={{
              backgroundImage: `
                linear-gradient(${colors.primary}40 1px, transparent 1px),
                linear-gradient(90deg, ${colors.primary}40 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
          
          {/* Radial glow with dynamic color */}
          <div 
            className="absolute inset-0 transition-all duration-700"
            style={{
              background: `radial-gradient(ellipse 80% 50% at 50% 50%, ${visuals.glowColor} 0%, transparent 60%)`,
            }}
          />

          {/* Floating icon with glow */}
          <div 
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 transition-all duration-700"
            style={{ color: colors.primary, filter: `drop-shadow(0 0 40px ${colors.glow})` }}
          >
            {visuals.icon}
          </div>

          {/* Corner accents with dynamic color */}
          <div className="absolute top-8 left-8 w-24 h-24 border-l-2 border-t-2 transition-colors duration-500" style={{ borderColor: `${colors.primary}50` }} />
          <div className="absolute top-8 right-8 w-24 h-24 border-r-2 border-t-2 transition-colors duration-500" style={{ borderColor: `${colors.primary}50` }} />
          <div className="absolute bottom-8 left-8 w-24 h-24 border-l-2 border-b-2 transition-colors duration-500" style={{ borderColor: `${colors.primary}50` }} />
          <div className="absolute bottom-8 right-8 w-24 h-24 border-r-2 border-b-2 transition-colors duration-500" style={{ borderColor: `${colors.primary}50` }} />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-8">
            {/* Top badge with dynamic color */}
            <div className="absolute top-12 flex items-center gap-3">
              <Hexagon className="w-5 h-5 transition-colors duration-500" style={{ color: colors.primary }} strokeWidth={1.5} />
              <span 
                className="text-xs font-mono uppercase tracking-[0.3em] transition-colors duration-500"
                style={{ color: `${colors.primary}b3` }}
              >
                Portolan Intelligence
              </span>
              <Hexagon className="w-5 h-5 transition-colors duration-500" style={{ color: colors.primary }} strokeWidth={1.5} />
            </div>

            {/* Slide number indicator */}
            <div 
              className="absolute top-12 right-12 text-6xl font-extralight opacity-10 transition-colors duration-500"
              style={{ color: colors.primary }}
            >
              {String(currentSlideIndex + 1).padStart(2, '0')}
            </div>

            <div className="text-center max-w-5xl animate-fade-in" key={currentSlide.id}>
              {/* Main title */}
              <h1 
                className="text-6xl md:text-8xl lg:text-9xl font-extralight tracking-tight mb-8 transition-all duration-500"
                style={{
                  background: `linear-gradient(180deg, #ffffff 0%, ${colors.primary} 150%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: `0 0 80px ${colors.glow}`,
                }}
              >
                {currentSlide.title}
              </h1>
              
              {/* Decorative line with dynamic color */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="h-px w-24 transition-all duration-500" style={{ background: `linear-gradient(to right, transparent, ${colors.primary}80)` }} />
                <div className="w-2 h-2 rotate-45 border transition-colors duration-500" style={{ borderColor: `${colors.primary}80` }} />
                <div className="h-px w-24 transition-all duration-500" style={{ background: `linear-gradient(to left, transparent, ${colors.primary}80)` }} />
              </div>

              {/* Subtitle */}
              {currentSlide.subtitle && (
                <p className="text-xl md:text-2xl lg:text-3xl font-light text-zinc-400 tracking-wide">
                  {currentSlide.subtitle}
                </p>
              )}
            </div>

            {/* Click to continue hint */}
            <div className="absolute bottom-16 flex flex-col items-center gap-2 animate-pulse">
              <div 
                className="w-px h-8 transition-all duration-500"
                style={{ background: `linear-gradient(to bottom, ${colors.primary}80, transparent)` }}
              />
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">
                Click to continue
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Clickable overlay for advancing slides (when not fullscreen) */}
      {!isFullscreenSlide && (
        <div 
          className="fixed inset-0 z-[9980] cursor-pointer"
          onClick={nextSlide}
          style={{ pointerEvents: 'auto' }}
        />
      )}

      {/* Slide title banner at top - now with dynamic colors */}
      {!isFullscreenSlide && (
        <div 
          className="fixed top-0 left-0 right-0 z-[9991] pt-4 pb-16 px-8"
          style={{
            background: 'linear-gradient(180deg, rgba(10, 10, 15, 0.98) 0%, rgba(10, 10, 15, 0.9) 60%, transparent 100%)',
          }}
        >
          {/* Accent line at very top */}
          <div 
            className="absolute top-0 left-0 right-0 h-1 transition-all duration-500"
            style={{ 
              background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
              boxShadow: `0 0 30px ${colors.glow}`,
            }}
          />
          
          <div className="max-w-4xl mx-auto text-center animate-fade-in" key={currentSlide.id}>
            {/* Icon + Module indicator */}
            <div className="flex items-center justify-center gap-3 mb-3">
              <div 
                className="p-2 rounded-lg border transition-all duration-500"
                style={{ 
                  borderColor: `${colors.primary}40`,
                  background: `${colors.primary}10`,
                }}
              >
                {currentSlide.module === 'nautica' && <Network className="w-4 h-4" style={{ color: colors.primary }} />}
                {currentSlide.module === 'maris' && <Database className="w-4 h-4" style={{ color: colors.primary }} />}
                {currentSlide.module === 'meridian' && <Scale className="w-4 h-4" style={{ color: colors.primary }} />}
              </div>
              <span 
                className="text-[10px] font-mono uppercase tracking-[0.2em] transition-colors duration-500"
                style={{ color: colors.primary }}
              >
                {currentSlide.module}
              </span>
              <div className="h-px w-12 transition-all duration-500" style={{ background: `${colors.primary}50` }} />
              <span className="text-[10px] font-mono text-zinc-600">
                Slide {currentSlideIndex + 1} of {slides.length}
              </span>
            </div>
            
            <h2 
              className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-3 transition-all duration-500"
              style={{
                background: `linear-gradient(180deg, #ffffff 0%, ${colors.primary} 200%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {currentSlide.title}
            </h2>
            {currentSlide.subtitle && (
              <p className="text-base md:text-lg text-zinc-500 font-light">
                {currentSlide.subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Progress bar with dynamic color */}
      <div className="fixed top-0 left-0 right-0 z-[9995] h-0.5 bg-zinc-900">
        <div 
          className="h-full transition-all duration-500 ease-out"
          style={{ 
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${colors.secondary} 0%, ${colors.primary} 50%, ${colors.primary} 100%)`,
            boxShadow: `0 0 20px ${colors.glow}`,
          }}
        />
      </div>

      {/* Bottom control bar */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-[9995] pb-4 pt-16"
        style={{
          background: 'linear-gradient(0deg, rgba(10, 10, 15, 0.95) 0%, rgba(10, 10, 15, 0.8) 60%, transparent 100%)',
        }}
      >
        <div className="flex items-center justify-between px-8 max-w-5xl mx-auto">
          {/* Left: Navigation with dynamic accent */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); prevSlide(); }}
              disabled={isFirstSlide}
              className="h-10 w-10 border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-700 disabled:opacity-30 text-zinc-400"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div 
              className="px-4 py-2 border bg-zinc-900/50 rounded transition-all duration-500"
              style={{ borderColor: `${colors.primary}30` }}
            >
              <span className="text-sm font-mono text-zinc-500">
                <span style={{ color: colors.primary }}>{String(currentSlideIndex + 1).padStart(2, '0')}</span>
                <span className="mx-2 text-zinc-700">/</span>
                <span>{String(slides.length).padStart(2, '0')}</span>
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); nextSlide(); }}
              disabled={isLastSlide}
              className="h-10 w-10 border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-700 disabled:opacity-30 text-zinc-400"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Center: Slide indicators with dynamic colors */}
          <div className="flex gap-2">
            {slides.map((slide, i) => {
              const slideVisuals = getSlideVisuals(slide.id, slide.module);
              const slideColors = accentColors[slideVisuals.accentColor] || accentColors.teal;
              return (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentSlideIndex 
                      ? 'w-8' 
                      : 'w-1.5'
                  }`}
                  style={{
                    backgroundColor: i === currentSlideIndex 
                      ? slideColors.primary 
                      : i < currentSlideIndex 
                        ? `${slideColors.primary}60`
                        : '#3f3f46',
                    boxShadow: i === currentSlideIndex ? `0 0 10px ${slideColors.glow}` : 'none',
                  }}
                />
              );
            })}
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); toggleSpeakerNotes(); }}
              className="h-10 w-10 border bg-zinc-900/50 hover:bg-zinc-800 transition-all duration-300"
              style={{
                borderColor: showSpeakerNotes ? `${colors.primary}60` : '#27272a',
                color: showSpeakerNotes ? colors.primary : '#71717a',
              }}
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); togglePause(); }}
              className={`h-10 w-10 border bg-zinc-900/50 hover:bg-zinc-800 ${
                isPaused 
                  ? 'border-amber-500/50 text-amber-500' 
                  : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'
              }`}
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); endPresentation(); }}
              className="h-10 w-10 border border-zinc-800 bg-zinc-900/50 hover:bg-red-950/50 hover:border-red-900/50 hover:text-red-400 text-zinc-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Speaker notes panel with dynamic accent */}
      {showSpeakerNotes && currentSlide.notes && (
        <div 
          className="fixed bottom-28 left-8 right-8 z-[9994] max-w-2xl mx-auto animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="border rounded-lg p-4 backdrop-blur-xl transition-all duration-500"
            style={{
              background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.95) 0%, rgba(15, 15, 20, 0.95) 100%)',
              borderColor: `${colors.primary}30`,
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div 
                className="w-1.5 h-1.5 rounded-full transition-colors duration-500"
                style={{ backgroundColor: colors.primary }}
              />
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">
                Speaker Notes
              </p>
            </div>
            <p className="text-sm leading-relaxed text-zinc-400">
              {currentSlide.notes}
            </p>
          </div>
        </div>
      )}

      {/* Keyboard hints */}
      <div className="fixed bottom-4 right-8 z-[9993] flex items-center gap-4">
        {[
          { key: '→', label: 'Next' },
          { key: '←', label: 'Back' },
          { key: 'N', label: 'Notes' },
          { key: 'Esc', label: 'Exit' },
        ].map(({ key, label }) => (
          <span key={key} className="flex items-center gap-1.5 text-[10px] text-zinc-600">
            <kbd className="px-1.5 py-0.5 font-mono border border-zinc-800 rounded bg-zinc-900/50 text-zinc-500">
              {key}
            </kbd>
            {label}
          </span>
        ))}
      </div>
    </>
  );
}
