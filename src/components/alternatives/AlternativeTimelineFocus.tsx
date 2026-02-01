import { useState } from 'react';
import { 
  Clock, 
  ChevronDown, 
  ChevronUp,
  FileText, 
  Network, 
  Shield, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  User,
  Building,
  Eye,
  Flag,
  ArrowRight,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimelineEvent {
  id: string;
  time: string;
  type: 'submit' | 'document' | 'network' | 'policy' | 'decision' | 'flag';
  title: string;
  description: string;
  module: 'Maris' | 'Nautica' | 'Meridian' | 'System';
  severity?: 'critical' | 'warning' | 'info' | 'success';
  expanded?: boolean;
  details?: string[];
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: '1',
    time: '15:42:33',
    type: 'submit',
    title: 'Application Submitted',
    description: 'Work visa application received via ABC Travel agency portal',
    module: 'System',
    severity: 'info',
    details: ['Applicant: Mehmet Yilmaz', 'Agency: ABC Travel (Watch List)', 'Type: Work Visa - Category B']
  },
  {
    id: '2',
    time: '15:42:34',
    type: 'document',
    title: 'Documents Ingested',
    description: '4 documents processed through Maris pipeline',
    module: 'Maris',
    severity: 'success',
    details: ['Passport: TR-8847291 (Verified)', 'Bank Statement: 3 months (OCR 97.2%)', 'Employment Letter: (OCR 94.1%)', 'Travel Itinerary: (Verified)']
  },
  {
    id: '3',
    time: '15:42:35',
    type: 'flag',
    title: 'Document Anomaly Detected',
    description: 'Metadata timestamp inconsistency in employment letter',
    module: 'Maris',
    severity: 'warning',
    details: ['Creation date: 2025-12-15', 'Last modified: 2024-08-22', 'Anomaly: Modified before creation', 'Confidence: 89%']
  },
  {
    id: '4',
    time: '15:42:36',
    type: 'network',
    title: 'Entity Resolution Complete',
    description: 'Applicant linked to 12 entities in fraud network',
    module: 'Nautica',
    severity: 'critical',
    details: ['Direct connections: 3', 'Second-degree: 9', 'Flagged entities in network: 4', 'Ring ID: RING-2026-047']
  },
  {
    id: '5',
    time: '15:42:37',
    type: 'policy',
    title: 'Policy Rules Evaluated',
    description: '3 rules triggered, case escalated to manual review',
    module: 'Meridian',
    severity: 'warning',
    details: ['RULE-001: High-Risk Network Association (TRIGGERED)', 'RULE-003: Document Timestamp Anomaly (TRIGGERED)', 'RULE-004: Agency Volume Spike (TRIGGERED)']
  },
  {
    id: '6',
    time: '15:43:12',
    type: 'decision',
    title: 'Pending Manual Review',
    description: 'Case assigned to Officer Yilmaz for human decision',
    module: 'Meridian',
    severity: 'info',
    details: ['Risk Score: 87/100', 'Auto-decision: BLOCKED', 'Reason: Multiple critical flags', 'SLA: 24 hours']
  },
];

const EVENT_ICONS = {
  submit: FileText,
  document: FileText,
  network: Network,
  policy: Shield,
  decision: CheckCircle2,
  flag: Flag,
};

const MODULE_COLORS = {
  Maris: 'text-blue-400',
  Nautica: 'text-purple-400',
  Meridian: 'text-accent',
  System: 'text-muted-foreground',
};

export function AlternativeTimelineFocus() {
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set(['4']));
  const [selectedCase, setSelectedCase] = useState('VIS-2026-001');

  const toggleEvent = (id: string) => {
    setExpandedEvents(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="h-full flex bg-background">
      {/* Case Selector Sidebar */}
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Active Cases</p>
          <p className="text-2xl font-light font-mono">127</p>
        </div>

        <div className="flex-1 overflow-auto">
          {[
            { id: 'VIS-2026-001', name: 'Mehmet Yilmaz', risk: 87, status: 'review' },
            { id: 'VIS-2026-002', name: 'Ayse Kaya', risk: 12, status: 'approved' },
            { id: 'VIS-2026-003', name: 'Ali Demir', risk: 45, status: 'pending' },
            { id: 'VIS-2026-004', name: 'Fatma Ozturk', risk: 92, status: 'rejected' },
          ].map((caseItem) => (
            <div
              key={caseItem.id}
              onClick={() => setSelectedCase(caseItem.id)}
              className={`p-4 border-b border-border cursor-pointer transition-colors ${
                selectedCase === caseItem.id ? 'bg-secondary' : 'hover:bg-secondary/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted-foreground">{caseItem.id}</span>
                <span className={`text-xs font-mono ${
                  caseItem.risk > 70 ? 'text-destructive' :
                  caseItem.risk > 40 ? 'text-yellow-500' :
                  'text-accent'
                }`}>
                  {caseItem.risk}
                </span>
              </div>
              <p className="font-medium">{caseItem.name}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="p-4 border-t border-border space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Avg. Processing</span>
            <span className="font-mono">1.2s</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Auto-Approved</span>
            <span className="font-mono text-accent">84%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Manual Review</span>
            <span className="font-mono text-yellow-500">12%</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto py-8 px-6">
          {/* Case Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-mono text-muted-foreground">{selectedCase}</span>
                <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-xs rounded">Manual Review</span>
              </div>
              <h1 className="text-2xl font-semibold">Mehmet Yilmaz</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="w-4 h-4" />
                View Dossier
              </Button>
              <Button size="sm" className="gap-2 bg-foreground text-background hover:bg-foreground/90">
                <Zap className="w-4 h-4" />
                Make Decision
              </Button>
            </div>
          </div>

          {/* Timeline Events */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

            <div className="space-y-4">
              {TIMELINE_EVENTS.map((event, index) => {
                const Icon = EVENT_ICONS[event.type];
                const isExpanded = expandedEvents.has(event.id);
                
                return (
                  <div key={event.id} className="relative pl-16">
                    {/* Node */}
                    <div className={`absolute left-4 w-5 h-5 rounded-full border-2 bg-background flex items-center justify-center ${
                      event.severity === 'critical' ? 'border-destructive' :
                      event.severity === 'warning' ? 'border-yellow-500' :
                      event.severity === 'success' ? 'border-accent' :
                      'border-border'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        event.severity === 'critical' ? 'bg-destructive' :
                        event.severity === 'warning' ? 'bg-yellow-500' :
                        event.severity === 'success' ? 'bg-accent' :
                        'bg-muted-foreground'
                      }`} />
                    </div>

                    {/* Content */}
                    <div 
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${
                        isExpanded ? 'bg-surface-elevated border-border' : 'border-transparent hover:bg-secondary/50'
                      }`}
                      onClick={() => toggleEvent(event.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Icon className={`w-4 h-4 mt-0.5 ${MODULE_COLORS[event.module]}`} />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{event.title}</span>
                              <span className={`text-xs ${MODULE_COLORS[event.module]}`}>{event.module}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">{event.time}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && event.details && (
                        <div className="mt-4 pl-7 space-y-2">
                          {event.details.map((detail, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <ArrowRight className="w-3 h-3 text-muted-foreground" />
                              <span className={detail.includes('TRIGGERED') || detail.includes('Anomaly') ? 'text-destructive' : ''}>
                                {detail}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right Summary Panel */}
      <div className="w-72 border-l border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Risk Summary</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-light font-mono text-destructive">87</span>
            <span className="text-muted-foreground mb-1">/ 100</span>
          </div>
        </div>

        <div className="p-4 border-b border-border space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Flags</p>
          <div className="space-y-2">
            {['Network Risk', 'Document Anomaly', 'Agency Watch'].map((flag) => (
              <div key={flag} className="flex items-center gap-2 px-3 py-2 bg-destructive/10 rounded text-sm">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-destructive">{flag}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-b border-border space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Connected Entities</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>3 linked applicants</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Building className="w-4 h-4 text-muted-foreground" />
              <span>1 flagged agency</span>
            </div>
          </div>
        </div>

        <div className="mt-auto p-4 space-y-2">
          <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Approve
          </Button>
          <Button variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive/10">
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
}
