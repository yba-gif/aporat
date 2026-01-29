import { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export interface FilterState {
  nodeTypes: string[];
  riskRange: [number, number];
  flaggedOnly: boolean;
  networkFilter: string | null;
}

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  networks: string[];
}

const NODE_TYPES = [
  { id: 'applicant', label: 'Applicants', color: '#8b5cf6' },
  { id: 'agent', label: 'Agencies', color: '#0d9488' },
  { id: 'company', label: 'Companies', color: '#3b82f6' },
  { id: 'address', label: 'Addresses', color: '#f59e0b' },
];

export function FilterPanel({ filters, onChange, networks }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  const toggleNodeType = (type: string) => {
    const newTypes = filters.nodeTypes.includes(type)
      ? filters.nodeTypes.filter((t) => t !== type)
      : [...filters.nodeTypes, type];
    onChange({ ...filters, nodeTypes: newTypes });
  };

  const clearFilters = () => {
    onChange({
      nodeTypes: NODE_TYPES.map((t) => t.id),
      riskRange: [0, 100],
      flaggedOnly: false,
      networkFilter: null,
    });
  };

  const hasActiveFilters =
    filters.nodeTypes.length < 4 ||
    filters.riskRange[0] > 0 ||
    filters.riskRange[1] < 100 ||
    filters.flaggedOnly ||
    filters.networkFilter !== null;

  return (
    <div className="absolute top-4 left-16 z-10 w-56">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center justify-between w-full px-3 py-2 bg-surface-elevated border border-border rounded-t hover:bg-secondary/50 transition-colors">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-accent rounded-full" />
              )}
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="bg-surface-elevated border border-t-0 border-border rounded-b p-3 space-y-4">
            {/* Network Filter */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                Network
              </p>
              <select
                value={filters.networkFilter || ''}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    networkFilter: e.target.value || null,
                  })
                }
                className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">All Networks</option>
                {networks.map((net) => (
                  <option key={net} value={net}>
                    {net}
                  </option>
                ))}
              </select>
            </div>

            {/* Node Types */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                Entity Types
              </p>
              <div className="space-y-1.5">
                {NODE_TYPES.map((type) => (
                  <label
                    key={type.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={filters.nodeTypes.includes(type.id)}
                      onCheckedChange={() => toggleNodeType(type.id)}
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: type.color }}
                    />
                    <span className="text-sm">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Risk Range */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Risk Score
                </p>
                <span className="text-xs font-mono text-muted-foreground">
                  {filters.riskRange[0]}-{filters.riskRange[1]}
                </span>
              </div>
              <Slider
                value={filters.riskRange}
                onValueChange={(value) =>
                  onChange({ ...filters, riskRange: value as [number, number] })
                }
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            {/* Flagged Only */}
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filters.flaggedOnly}
                onCheckedChange={(checked) =>
                  onChange({ ...filters, flaggedOnly: checked as boolean })
                }
              />
              <span className="text-sm text-destructive">Flagged only</span>
            </label>

            {/* Clear Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center justify-center gap-1 w-full py-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded transition-colors"
              >
                <X className="w-3 h-3" />
                Clear Filters
              </button>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
