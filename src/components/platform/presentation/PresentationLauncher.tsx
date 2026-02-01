import { Presentation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePresentation } from '@/contexts/PresentationContext';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function PresentationLauncher() {
  const { startPresentation, isPresenting } = usePresentation();

  if (isPresenting) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={() => startPresentation()}
          className="gap-2 border-purple-500/50 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300"
        >
          <Presentation className="h-3 w-3" />
          <span className="hidden sm:inline">Present</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Start presentation mode for live demo</p>
      </TooltipContent>
    </Tooltip>
  );
}
