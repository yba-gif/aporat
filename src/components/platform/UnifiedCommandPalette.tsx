import { useEffect, useState, useMemo } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { 
  Search, 
  User, 
  Building2, 
  MapPin, 
  FileText, 
  Briefcase,
  Network,
  Scale,
  Database,
  ArrowRight
} from 'lucide-react';
import { usePlatform, PlatformEntity, PlatformDocument, PlatformCase } from '@/contexts/PlatformContext';

const ENTITY_ICONS: Record<string, typeof User> = {
  applicant: User,
  agent: Building2,
  company: Building2,
  address: MapPin,
};

const MODULE_ICONS = {
  maris: Database,
  nautica: Network,
  meridian: Scale,
};

export function UnifiedCommandPalette() {
  const [open, setOpen] = useState(false);
  const {
    entities,
    documents,
    cases,
    navigateToEntity,
    navigateToCase,
    navigateToDocument,
    setActiveModule,
  } = usePlatform();

  // Global keyboard shortcut
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

  // Group entities by type
  const groupedEntities = useMemo(() => {
    return entities.reduce((acc, entity) => {
      if (!acc[entity.type]) acc[entity.type] = [];
      acc[entity.type].push(entity);
      return acc;
    }, {} as Record<string, PlatformEntity[]>);
  }, [entities]);

  const handleEntitySelect = (entityId: string) => {
    navigateToEntity(entityId);
    setOpen(false);
  };

  const handleDocumentSelect = (documentId: string) => {
    navigateToDocument(documentId);
    setOpen(false);
  };

  const handleCaseSelect = (caseId: string) => {
    navigateToCase(caseId);
    setOpen(false);
  };

  const handleModuleSelect = (module: 'maris' | 'nautica' | 'meridian') => {
    setActiveModule(module);
    setOpen(false);
  };

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-secondary/50 hover:bg-secondary border border-border rounded-md transition-colors"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Search everything...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono bg-background border border-border rounded">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search entities, documents, cases, or navigate modules..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {/* Quick Navigation */}
          <CommandGroup heading="Quick Navigation">
            <CommandItem onSelect={() => handleModuleSelect('maris')}>
              <Database className="w-4 h-4 mr-2 text-amber-500" />
              <span>Maris</span>
              <span className="ml-auto text-xs text-muted-foreground">Evidence & Documents</span>
            </CommandItem>
            <CommandItem onSelect={() => handleModuleSelect('nautica')}>
              <Network className="w-4 h-4 mr-2 text-teal-500" />
              <span>Nautica</span>
              <span className="ml-auto text-xs text-muted-foreground">Network Intelligence</span>
            </CommandItem>
            <CommandItem onSelect={() => handleModuleSelect('meridian')}>
              <Scale className="w-4 h-4 mr-2 text-purple-500" />
              <span>Meridian</span>
              <span className="ml-auto text-xs text-muted-foreground">Case Management</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Cases */}
          {cases.length > 0 && (
            <CommandGroup heading="Cases">
              {cases.map((c) => (
                <CommandItem
                  key={c.id}
                  value={`case ${c.caseNumber} ${c.applicant} ${c.type}`}
                  onSelect={() => handleCaseSelect(c.id)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <span className="font-mono text-xs text-muted-foreground">{c.caseNumber}</span>
                      <span className="mx-2">·</span>
                      <span>{c.applicant}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 text-[10px] rounded ${
                      c.status === 'escalated' ? 'bg-destructive/20 text-destructive' :
                      c.status === 'under_review' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-secondary text-muted-foreground'
                    }`}>
                      {c.status.replace('_', ' ')}
                    </span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />

          {/* Entities by type */}
          {Object.entries(groupedEntities).map(([type, typeEntities]) => {
            const Icon = ENTITY_ICONS[type] || User;
            const displayType = type === 'agent' ? 'Agencies' : type.charAt(0).toUpperCase() + type.slice(1) + 's';
            
            return (
              <CommandGroup key={type} heading={displayType}>
                {typeEntities.slice(0, 8).map((entity) => (
                  <CommandItem
                    key={entity.id}
                    value={`entity ${entity.id} ${entity.label} ${type}`}
                    onSelect={() => handleEntitySelect(entity.id)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span>{entity.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {entity.flagged && (
                        <span className="px-1.5 py-0.5 text-[10px] font-mono bg-destructive/20 text-destructive rounded">
                          FLAGGED
                        </span>
                      )}
                      {entity.riskScore !== undefined && entity.riskScore > 0 && (
                        <span className={`text-xs font-mono ${
                          entity.riskScore >= 70 ? 'text-destructive' :
                          entity.riskScore >= 40 ? 'text-yellow-500' :
                          'text-muted-foreground'
                        }`}>
                          {entity.riskScore}%
                        </span>
                      )}
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </CommandItem>
                ))}
                {typeEntities.length > 8 && (
                  <CommandItem disabled className="text-muted-foreground text-xs">
                    +{typeEntities.length - 8} more {displayType.toLowerCase()}
                  </CommandItem>
                )}
              </CommandGroup>
            );
          })}

          <CommandSeparator />

          {/* Documents */}
          {documents.length > 0 && (
            <CommandGroup heading="Documents">
              {documents.slice(0, 6).map((doc) => (
                <CommandItem
                  key={doc.id}
                  value={`document ${doc.filename} ${doc.hash}`}
                  onSelect={() => handleDocumentSelect(doc.id)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <FileText className={`w-4 h-4 ${
                      doc.status === 'flagged' ? 'text-destructive' : 'text-muted-foreground'
                    }`} />
                    <span className="truncate max-w-[200px]">{doc.filename}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 text-[10px] rounded ${
                      doc.status === 'flagged' ? 'bg-destructive/20 text-destructive' :
                      doc.status === 'verified' ? 'bg-accent/20 text-accent' :
                      'bg-secondary text-muted-foreground'
                    }`}>
                      {doc.status}
                    </span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  </div>
                </CommandItem>
              ))}
              {documents.length > 6 && (
                <CommandItem disabled className="text-muted-foreground text-xs">
                  +{documents.length - 6} more documents
                </CommandItem>
              )}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
