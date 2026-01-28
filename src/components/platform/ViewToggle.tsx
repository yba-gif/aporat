import { Box, Grid2X2 } from 'lucide-react';

interface ViewToggleProps {
  view: '2d' | '3d';
  onChange: (view: '2d' | '3d') => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center bg-surface-elevated border border-border rounded overflow-hidden">
      <button
        onClick={() => onChange('2d')}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
          view === '2d'
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
        }`}
      >
        <Grid2X2 className="w-3.5 h-3.5" />
        2D
      </button>
      <div className="w-px h-6 bg-border" />
      <button
        onClick={() => onChange('3d')}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
          view === '3d'
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
        }`}
      >
        <Box className="w-3.5 h-3.5" />
        3D
      </button>
    </div>
  );
}
