import { usePresentation } from '@/contexts/PresentationContext';
import { ChevronLeft, ChevronRight, X, Pause, Play, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

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
          className="fixed inset-0 z-[9990] bg-background flex items-center justify-center cursor-pointer"
          onClick={nextSlide}
        >
          <div className="text-center max-w-4xl px-8 animate-scale-in">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6">
              {currentSlide.title}
            </h1>
            {currentSlide.subtitle && (
              <p className="text-2xl md:text-3xl text-muted-foreground">
                {currentSlide.subtitle}
              </p>
            )}
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
        <div className="fixed top-0 left-0 right-0 z-[9991] bg-gradient-to-b from-background via-background/80 to-transparent pt-4 pb-12 px-8">
          <div className="max-w-4xl mx-auto text-center animate-slide-in-up">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              {currentSlide.title}
            </h2>
            {currentSlide.subtitle && (
              <p className="text-lg md:text-xl text-muted-foreground">
                {currentSlide.subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[9995]">
        <Progress value={progress} className="h-1 rounded-none" />
      </div>

      {/* Bottom control bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[9995] bg-gradient-to-t from-background via-background/80 to-transparent pb-4 pt-12">
        <div className="flex items-center justify-between px-8 max-w-4xl mx-auto">
          {/* Left: Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); prevSlide(); }}
              disabled={isFirstSlide}
              className="h-12 w-12"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <span className="text-sm font-mono text-muted-foreground min-w-[60px] text-center">
              {currentSlideIndex + 1} / {slides.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); nextSlide(); }}
              disabled={isLastSlide}
              className="h-12 w-12"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Center: Slide indicators */}
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentSlideIndex 
                    ? 'bg-accent w-6' 
                    : i < currentSlideIndex 
                      ? 'bg-accent/50' 
                      : 'bg-muted-foreground/30'
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
              className={`h-10 w-10 ${showSpeakerNotes ? 'bg-accent/20' : ''}`}
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); togglePause(); }}
              className="h-10 w-10"
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); endPresentation(); }}
              className="h-10 w-10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Speaker notes panel */}
      {showSpeakerNotes && currentSlide.notes && (
        <div 
          className="fixed bottom-24 left-8 right-8 z-[9994] max-w-2xl mx-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-secondary/90 backdrop-blur-sm border border-border rounded-lg p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
              Speaker Notes
            </p>
            <p className="text-sm leading-relaxed">
              {currentSlide.notes}
            </p>
          </div>
        </div>
      )}

      {/* Keyboard hints (shown briefly) */}
      <div className="fixed bottom-4 right-8 z-[9993] text-[10px] text-muted-foreground/50 flex items-center gap-4">
        <span><kbd className="px-1 py-0.5 bg-secondary/50 rounded">→</kbd> Next</span>
        <span><kbd className="px-1 py-0.5 bg-secondary/50 rounded">←</kbd> Back</span>
        <span><kbd className="px-1 py-0.5 bg-secondary/50 rounded">N</kbd> Notes</span>
        <span><kbd className="px-1 py-0.5 bg-secondary/50 rounded">Esc</kbd> Exit</span>
      </div>
    </>
  );
}
