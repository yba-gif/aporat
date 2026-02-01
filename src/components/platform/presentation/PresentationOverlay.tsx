import { usePresentation } from '@/contexts/PresentationContext';
import { ChevronLeft, ChevronRight, X, Pause, Play, FileText, Hexagon } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
          {/* Animated grid background */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(20, 184, 166, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(20, 184, 166, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
          
          {/* Radial glow */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(20, 184, 166, 0.08) 0%, transparent 60%)',
            }}
          />

          {/* Corner accents */}
          <div className="absolute top-8 left-8 w-24 h-24 border-l-2 border-t-2 border-teal-500/30" />
          <div className="absolute top-8 right-8 w-24 h-24 border-r-2 border-t-2 border-teal-500/30" />
          <div className="absolute bottom-8 left-8 w-24 h-24 border-l-2 border-b-2 border-teal-500/30" />
          <div className="absolute bottom-8 right-8 w-24 h-24 border-r-2 border-b-2 border-teal-500/30" />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-8">
            {/* Top badge */}
            <div className="absolute top-12 flex items-center gap-3">
              <Hexagon className="w-5 h-5 text-teal-500" strokeWidth={1.5} />
              <span className="text-xs font-mono uppercase tracking-[0.3em] text-teal-500/70">
                Portolan Intelligence
              </span>
              <Hexagon className="w-5 h-5 text-teal-500" strokeWidth={1.5} />
            </div>

            <div className="text-center max-w-5xl animate-fade-in">
              {/* Main title */}
              <h1 
                className="text-6xl md:text-8xl lg:text-9xl font-extralight tracking-tight mb-8"
                style={{
                  background: 'linear-gradient(180deg, #ffffff 0%, #a1a1aa 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 80px rgba(20, 184, 166, 0.3)',
                }}
              >
                {currentSlide.title}
              </h1>
              
              {/* Decorative line */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="h-px w-24 bg-gradient-to-r from-transparent to-teal-500/50" />
                <div className="w-2 h-2 rotate-45 border border-teal-500/50" />
                <div className="h-px w-24 bg-gradient-to-l from-transparent to-teal-500/50" />
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
              <div className="w-px h-8 bg-gradient-to-b from-teal-500/50 to-transparent" />
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

      {/* Slide title banner at top */}
      {!isFullscreenSlide && (
        <div 
          className="fixed top-0 left-0 right-0 z-[9991] pt-4 pb-16 px-8"
          style={{
            background: 'linear-gradient(180deg, rgba(10, 10, 15, 0.95) 0%, rgba(10, 10, 15, 0.8) 60%, transparent 100%)',
          }}
        >
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            {/* Module indicator */}
            {currentSlide.module && (
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="h-px w-8 bg-teal-500/50" />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-teal-500">
                  {currentSlide.module}
                </span>
                <div className="h-px w-8 bg-teal-500/50" />
              </div>
            )}
            
            <h2 
              className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-3"
              style={{
                background: 'linear-gradient(180deg, #ffffff 0%, #d4d4d8 100%)',
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

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[9995] h-0.5 bg-zinc-900">
        <div 
          className="h-full transition-all duration-500 ease-out"
          style={{ 
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%)',
            boxShadow: '0 0 20px rgba(20, 184, 166, 0.5)',
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
          {/* Left: Navigation */}
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
            <div className="px-4 py-2 border border-zinc-800 bg-zinc-900/50 rounded">
              <span className="text-sm font-mono text-zinc-500">
                <span className="text-teal-500">{String(currentSlideIndex + 1).padStart(2, '0')}</span>
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

          {/* Center: Slide indicators */}
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === currentSlideIndex 
                    ? 'w-8 bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]' 
                    : i < currentSlideIndex 
                      ? 'w-1 bg-teal-500/50' 
                      : 'w-1 bg-zinc-700'
                }`}
              />
            ))}
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); toggleSpeakerNotes(); }}
              className={`h-10 w-10 border bg-zinc-900/50 hover:bg-zinc-800 ${
                showSpeakerNotes 
                  ? 'border-teal-500/50 text-teal-500' 
                  : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'
              }`}
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

      {/* Speaker notes panel */}
      {showSpeakerNotes && currentSlide.notes && (
        <div 
          className="fixed bottom-28 left-8 right-8 z-[9994] max-w-2xl mx-auto animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="border border-zinc-800 rounded-lg p-4 backdrop-blur-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.95) 0%, rgba(15, 15, 20, 0.95) 100%)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
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
