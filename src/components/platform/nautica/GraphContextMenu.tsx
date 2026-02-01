import { useEffect, useRef } from 'react';
import { FileText, Briefcase, Star, Network, ExternalLink, AlertTriangle } from 'lucide-react';
import { usePlatform } from '@/contexts/PlatformContext';

interface ContextMenuProps {
  x: number;
  y: number;
  nodeId: string;
  nodeLabel: string;
  nodeType: string;
  flagged: boolean;
  caseId: string | null;
  onClose: () => void;
}

export function GraphContextMenu({ 
  x, 
  y, 
  nodeId, 
  nodeLabel, 
  nodeType,
  flagged,
  caseId,
  onClose 
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { navigateToDocument, navigateToCase, setActiveModule } = usePlatform();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleViewDocuments = () => {
    setActiveModule('maris');
    onClose();
  };

  const handleOpenCase = () => {
    if (caseId) {
      navigateToCase(caseId);
    }
    onClose();
  };

  const handleAddToWatchlist = () => {
    // Simulated - would add to user's watchlist
    console.log('Added to watchlist:', nodeId);
    onClose();
  };

  const handleViewConnections = () => {
    // Already in Nautica, just highlight connections
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-surface-elevated border border-border rounded-lg shadow-xl py-1 min-w-48"
      style={{
        left: Math.min(x, window.innerWidth - 200),
        top: Math.min(y, window.innerHeight - 250),
      }}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{nodeLabel}</p>
          {flagged && <AlertTriangle className="w-3 h-3 text-destructive shrink-0" />}
        </div>
        <p className="text-[10px] text-muted-foreground capitalize">{nodeType}</p>
      </div>

      {/* Actions */}
      <div className="py-1">
        <button
          onClick={handleViewDocuments}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-secondary transition-colors text-left"
        >
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span>View Documents</span>
        </button>

        {caseId && (
          <button
            onClick={handleOpenCase}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-secondary transition-colors text-left"
          >
            <Briefcase className="w-4 h-4 text-muted-foreground" />
            <span>Open Case</span>
          </button>
        )}

        <button
          onClick={handleViewConnections}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-secondary transition-colors text-left"
        >
          <Network className="w-4 h-4 text-muted-foreground" />
          <span>Highlight Connections</span>
        </button>

        <div className="h-px bg-border my-1" />

        <button
          onClick={handleAddToWatchlist}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-secondary transition-colors text-left"
        >
          <Star className="w-4 h-4 text-muted-foreground" />
          <span>Add to Watchlist</span>
        </button>
      </div>

      {/* Keyboard hint */}
      <div className="px-3 py-1.5 border-t border-border">
        <p className="text-[10px] text-muted-foreground">
          Press <kbd className="px-1 py-0.5 bg-secondary rounded text-[9px]">Esc</kbd> to close
        </p>
      </div>
    </div>
  );
}
