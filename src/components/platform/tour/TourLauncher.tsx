import { Play, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTour } from '@/contexts/TourContext';
import { getAhmadRezaeeTour } from './ahmadRezaeeTour';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function TourLauncher() {
  const { startTour, isActive } = useTour();

  const handleStartTour = () => {
    const steps = getAhmadRezaeeTour();
    startTour(steps);
  };

  if (isActive) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={handleStartTour}
          className="gap-2 border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground"
        >
          <Play className="h-3 w-3" />
          <span className="hidden sm:inline">Guided Demo</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Walk through the Ahmad Rezaee fraud case</p>
      </TooltipContent>
    </Tooltip>
  );
}
