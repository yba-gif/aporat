import { useEffect, useState } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Search, User, FileText, MapPin, Building2 } from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  nodeType: 'applicant' | 'agent' | 'company' | 'address';
  flagged: boolean;
  riskScore: number;
}

interface CommandBarProps {
  nodes: GraphNode[];
  onSelect: (nodeId: string) => void;
}

const NODE_ICONS: Record<string, typeof User> = {
  applicant: User,
  agent: Building2,
  company: Building2,
  address: MapPin,
};

export function CommandBar({ nodes, onSelect }: CommandBarProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (nodeId: string) => {
    onSelect(nodeId);
    setOpen(false);
  };

  const groupedNodes = nodes.reduce((acc, node) => {
    if (!acc[node.nodeType]) acc[node.nodeType] = [];
    acc[node.nodeType].push(node);
    return acc;
  }, {} as Record<string, GraphNode[]>);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-secondary/50 hover:bg-secondary border border-border rounded-md transition-colors"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Search entities...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono bg-background border border-border rounded">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search applicants, companies, agencies..." />
        <CommandList>
          <CommandEmpty>No entities found.</CommandEmpty>
          
          {Object.entries(groupedNodes).map(([type, typeNodes]) => {
            const Icon = NODE_ICONS[type] || User;
            return (
              <CommandGroup key={type} heading={type.charAt(0).toUpperCase() + type.slice(1) + 's'}>
                {typeNodes.slice(0, 10).map((node) => (
                  <CommandItem
                    key={node.id}
                    value={`${node.label} ${node.id}`}
                    onSelect={() => handleSelect(node.id)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span>{node.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {node.flagged && (
                        <span className="px-1.5 py-0.5 text-[10px] font-mono bg-destructive/20 text-destructive rounded">
                          FLAGGED
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground font-mono">
                        {node.riskScore}%
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}
