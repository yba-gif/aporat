import { useTour } from '@/contexts/TourContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function TourTooltip() {
  const { 
    isActive, 
    currentStep, 
    currentStepIndex, 
    totalSteps,
    nextStep,
    prevStep,
    endTour,
    spotlightRect
  } = useTour();

  if (!isActive || !currentStep) return null;

  // Calculate tooltip position based on spotlight and position preference
  const getTooltipStyle = () => {
    const baseStyle: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
      maxWidth: '380px',
      width: '90vw',
    };

    if (!spotlightRect || currentStep.position === 'center') {
      // Center in viewport
      return {
        ...baseStyle,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const padding = 16;
    const tooltipHeight = 200; // Approximate
    const tooltipWidth = 380;

    switch (currentStep.position) {
      case 'top':
        return {
          ...baseStyle,
          left: Math.max(padding, Math.min(spotlightRect.left, window.innerWidth - tooltipWidth - padding)),
          bottom: window.innerHeight - spotlightRect.top + padding,
        };
      case 'bottom':
        return {
          ...baseStyle,
          left: Math.max(padding, Math.min(spotlightRect.left, window.innerWidth - tooltipWidth - padding)),
          top: spotlightRect.bottom + padding,
        };
      case 'left':
        return {
          ...baseStyle,
          right: window.innerWidth - spotlightRect.left + padding,
          top: Math.max(padding, Math.min(spotlightRect.top, window.innerHeight - tooltipHeight - padding)),
        };
      case 'right':
      default:
        return {
          ...baseStyle,
          left: spotlightRect.right + padding,
          top: Math.max(padding, Math.min(spotlightRect.top, window.innerHeight - tooltipHeight - padding)),
        };
    }
  };

  const progress = ((currentStepIndex + 1) / totalSteps) * 100;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  return (
    <div
      className="bg-background border border-border shadow-2xl animate-scale-in"
      style={getTooltipStyle()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse-subtle" />
          <span className="text-xs font-medium text-muted-foreground">
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={endTour}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Progress bar */}
      <Progress value={progress} className="h-0.5 rounded-none" />

      {/* Content */}
      <div className="p-4">
        <h3 className="text-base font-semibold mb-2">{currentStep.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {currentStep.content}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/30">
        <Button
          variant="ghost"
          size="sm"
          onClick={prevStep}
          disabled={isFirstStep}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === currentStepIndex 
                  ? 'bg-accent' 
                  : i < currentStepIndex 
                    ? 'bg-accent/50' 
                    : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>

        <Button
          variant={isLastStep ? "default" : "ghost"}
          size="sm"
          onClick={nextStep}
          className="gap-1"
        >
          {isLastStep ? 'Finish' : 'Next'}
          {!isLastStep && <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
