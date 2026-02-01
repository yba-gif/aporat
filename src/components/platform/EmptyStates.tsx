import { 
  FileText, 
  Search, 
  Briefcase, 
  Network, 
  Filter, 
  Plus,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onAction?: () => void;
}

export function NoDocumentsFound({ onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-in fade-in duration-300">
      <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
        <FileText className="w-8 h-8 text-muted-foreground/50" />
      </div>
      <h3 className="text-sm font-medium mb-2">No documents found</h3>
      <p className="text-xs text-muted-foreground max-w-xs mb-4">
        No documents match your current filters. Try adjusting your search criteria.
      </p>
      {onAction && (
        <Button variant="outline" size="sm" onClick={onAction} className="gap-2">
          <Filter className="w-3 h-3" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}

export function NoSearchResults({ query, onAction }: EmptyStateProps & { query?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-in fade-in duration-300">
      <div className="w-14 h-14 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
        <Search className="w-7 h-7 text-muted-foreground/50" />
      </div>
      <h3 className="text-sm font-medium mb-2">No results for "{query || 'your search'}"</h3>
      <p className="text-xs text-muted-foreground max-w-xs mb-4">
        Try searching with different keywords or check the spelling.
      </p>
      {onAction && (
        <Button variant="ghost" size="sm" onClick={onAction} className="gap-2">
          <RefreshCw className="w-3 h-3" />
          Clear Search
        </Button>
      )}
    </div>
  );
}

export function NoCasesAssigned({ onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-in fade-in duration-300">
      <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
        <Briefcase className="w-8 h-8 text-accent/50" />
      </div>
      <h3 className="text-sm font-medium mb-2">No cases assigned</h3>
      <p className="text-xs text-muted-foreground max-w-xs mb-4">
        You don't have any active cases. Browse available cases to get started.
      </p>
      {onAction && (
        <Button variant="default" size="sm" onClick={onAction} className="gap-2">
          <Search className="w-3 h-3" />
          Browse Cases
        </Button>
      )}
    </div>
  );
}

export function NoEntitiesSelected() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center animate-in fade-in duration-300">
      <div className="w-14 h-14 rounded-full bg-secondary/30 flex items-center justify-center mb-4">
        <Network className="w-7 h-7 text-muted-foreground/30" />
      </div>
      <h3 className="text-sm font-medium mb-2">Select an entity</h3>
      <p className="text-xs text-muted-foreground max-w-[200px]">
        Click on any node in the graph to view its details
      </p>
      <div className="mt-4 flex items-center gap-2 text-[10px] text-muted-foreground">
        <kbd className="px-1.5 py-0.5 bg-secondary rounded font-mono">⌘K</kbd>
        <span>to search entities</span>
      </div>
    </div>
  );
}

export function NoAlertsToday() {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center animate-in fade-in duration-300">
      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6 text-accent/50" />
      </div>
      <h3 className="text-xs font-medium mb-1">All clear</h3>
      <p className="text-[10px] text-muted-foreground">
        No new alerts today
      </p>
    </div>
  );
}

export function NoConnectionsFound() {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center animate-in fade-in duration-300">
      <div className="w-12 h-12 rounded-full bg-secondary/30 flex items-center justify-center mb-3">
        <Network className="w-6 h-6 text-muted-foreground/30" />
      </div>
      <h3 className="text-xs font-medium mb-1">No connections</h3>
      <p className="text-[10px] text-muted-foreground">
        This entity has no linked connections
      </p>
    </div>
  );
}

export function EmptyVault({ onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-in fade-in duration-300">
      <div className="w-20 h-20 rounded-full bg-secondary/30 flex items-center justify-center mb-4">
        <FileText className="w-10 h-10 text-muted-foreground/30" />
      </div>
      <h3 className="text-base font-medium mb-2">Evidence vault is empty</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        Upload your first document to begin building your evidence chain.
      </p>
      {onAction && (
        <Button onClick={onAction} className="gap-2">
          <Plus className="w-4 h-4" />
          Upload Document
        </Button>
      )}
    </div>
  );
}
