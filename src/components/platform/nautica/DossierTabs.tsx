import { useState } from 'react';
import { 
  User, 
  FileText, 
  Activity, 
  MessageSquare,
  Building2,
  MapPin,
  Briefcase
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface DossierTabsProps {
  documentCount: number;
  connectionCount: number;
  children: {
    overview: React.ReactNode;
    documents: React.ReactNode;
    timeline: React.ReactNode;
    notes: React.ReactNode;
  };
}

export function DossierTabs({ documentCount, connectionCount, children }: DossierTabsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
      <TabsList className="grid grid-cols-4 mx-4 mt-2 bg-secondary/30">
        <TabsTrigger value="overview" className="text-xs gap-1 data-[state=active]:bg-accent">
          <User className="w-3 h-3" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="documents" className="text-xs gap-1 data-[state=active]:bg-accent">
          <FileText className="w-3 h-3" />
          Docs
          {documentCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-4 px-1 text-[9px]">
              {documentCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="timeline" className="text-xs gap-1 data-[state=active]:bg-accent">
          <Activity className="w-3 h-3" />
          Timeline
        </TabsTrigger>
        <TabsTrigger value="notes" className="text-xs gap-1 data-[state=active]:bg-accent">
          <MessageSquare className="w-3 h-3" />
          Notes
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="flex-1 overflow-auto mt-0">
        {children.overview}
      </TabsContent>

      <TabsContent value="documents" className="flex-1 overflow-auto mt-0">
        {children.documents}
      </TabsContent>

      <TabsContent value="timeline" className="flex-1 overflow-auto mt-0">
        {children.timeline}
      </TabsContent>

      <TabsContent value="notes" className="flex-1 overflow-auto mt-0">
        {children.notes}
      </TabsContent>
    </Tabs>
  );
}

// Notes tab content component
interface AnalystNote {
  id: string;
  author: string;
  timestamp: string;
  content: string;
  type: 'observation' | 'action' | 'escalation';
}

const DEMO_NOTES: AnalystNote[] = [
  {
    id: 'note-1',
    author: 'Officer Yilmaz',
    timestamp: '2026-01-28T14:30:00Z',
    content: 'Document authenticity needs verification. Contacted issuing authority for confirmation.',
    type: 'action'
  },
  {
    id: 'note-2',
    author: 'Intel Analyst Chen',
    timestamp: '2026-01-27T09:15:00Z',
    content: 'Network pattern consistent with Visa Mill modus operandi. Recommend full network trace.',
    type: 'observation'
  },
  {
    id: 'note-3',
    author: 'Supervisor Demir',
    timestamp: '2026-01-26T16:45:00Z',
    content: 'Case escalated due to connections to ongoing investigation CASE-2025-8712.',
    type: 'escalation'
  }
];

export function NotesTabContent() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Analyst Notes</p>
        <Badge variant="outline" className="text-[10px]">Read Only</Badge>
      </div>

      <div className="space-y-3">
        {DEMO_NOTES.map(note => (
          <div 
            key={note.id}
            className={`p-3 rounded-lg border ${
              note.type === 'escalation' 
                ? 'bg-yellow-500/5 border-yellow-500/30' 
                : 'bg-secondary/20 border-border'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">{note.author}</span>
              <span className="text-[10px] text-muted-foreground">
                {new Date(note.timestamp).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{note.content}</p>
            <div className="mt-2">
              <Badge 
                variant="secondary" 
                className={`text-[9px] capitalize ${
                  note.type === 'escalation' ? 'bg-yellow-500/20 text-yellow-600' :
                  note.type === 'action' ? 'bg-accent/20 text-accent' :
                  'bg-secondary'
                }`}
              >
                {note.type}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center">
          Demo mode: Note creation disabled
        </p>
      </div>
    </div>
  );
}
