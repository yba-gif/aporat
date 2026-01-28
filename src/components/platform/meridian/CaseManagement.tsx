import { useState } from 'react';
import { 
  Briefcase, 
  User, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  MessageSquare,
  Paperclip,
  ChevronRight,
  Users,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Case {
  id: string;
  caseNumber: string;
  applicant: string;
  type: string;
  status: 'open' | 'under_review' | 'pending_approval' | 'escalated' | 'closed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  riskScore: number;
  assignee: string;
  team: string;
  createdAt: string;
  updatedAt: string;
  documents: number;
  notes: number;
  linkedEntities: string[];
  slaDeadline: string;
  slaBreach: boolean;
}

const DEMO_CASES: Case[] = [
  {
    id: 'case-001',
    caseNumber: 'CASE-2026-4829',
    applicant: 'Ahmad Rezaee',
    type: 'Visa Fraud Investigation',
    status: 'under_review',
    priority: 'critical',
    riskScore: 94,
    assignee: 'Officer Yilmaz',
    team: 'Fraud Detection Unit',
    createdAt: '2026-01-25T10:00:00Z',
    updatedAt: '2026-01-28T14:30:00Z',
    documents: 12,
    notes: 8,
    linkedEntities: ['Global Finance Consultants', 'Dmitri Volkov', 'Template Bank Statement'],
    slaDeadline: '2026-01-30T18:00:00Z',
    slaBreach: false
  },
  {
    id: 'case-002',
    caseNumber: 'CASE-2026-4827',
    applicant: 'Elena Sokolova',
    type: 'Document Verification',
    status: 'escalated',
    priority: 'high',
    riskScore: 72,
    assignee: 'Supervisor Demir',
    team: 'Document Review',
    createdAt: '2026-01-26T09:00:00Z',
    updatedAt: '2026-01-28T11:00:00Z',
    documents: 7,
    notes: 4,
    linkedEntities: ['TechServe Solutions GmbH'],
    slaDeadline: '2026-01-29T12:00:00Z',
    slaBreach: true
  },
  {
    id: 'case-003',
    caseNumber: 'CASE-2026-4830',
    applicant: 'Viktor Petrov',
    type: 'Network Analysis',
    status: 'open',
    priority: 'high',
    riskScore: 65,
    assignee: 'Unassigned',
    team: 'Intelligence',
    createdAt: '2026-01-27T14:00:00Z',
    updatedAt: '2026-01-28T08:00:00Z',
    documents: 5,
    notes: 2,
    linkedEntities: ['Apex Travel Agency', 'High-Risk Network Cluster'],
    slaDeadline: '2026-01-31T18:00:00Z',
    slaBreach: false
  },
  {
    id: 'case-004',
    caseNumber: 'CASE-2026-4825',
    applicant: 'Maria Santos',
    type: 'Routine Verification',
    status: 'closed',
    priority: 'low',
    riskScore: 12,
    assignee: 'Officer Kaya',
    team: 'Standard Processing',
    createdAt: '2026-01-24T11:00:00Z',
    updatedAt: '2026-01-27T16:45:00Z',
    documents: 4,
    notes: 1,
    linkedEntities: [],
    slaDeadline: '2026-01-28T18:00:00Z',
    slaBreach: false
  }
];

interface CaseManagementProps {
  onCaseSelect: (caseId: string) => void;
  selectedCaseId: string | null;
}

export function CaseManagement({ onCaseSelect, selectedCaseId }: CaseManagementProps) {
  const [statusFilter, setStatusFilter] = useState<Case['status'] | 'all'>('all');

  const filteredCases = DEMO_CASES.filter(c => 
    statusFilter === 'all' || c.status === statusFilter
  );

  const getStatusColor = (status: Case['status']) => {
    switch (status) {
      case 'open': return 'bg-blue-500/20 text-blue-400';
      case 'under_review': return 'bg-yellow-500/20 text-yellow-400';
      case 'pending_approval': return 'bg-purple-500/20 text-purple-400';
      case 'escalated': return 'bg-destructive/20 text-destructive';
      case 'closed': return 'bg-accent/20 text-accent';
    }
  };

  const getPriorityColor = (priority: Case['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-secondary text-muted-foreground';
    }
  };

  const getSlaStatus = (c: Case) => {
    if (c.status === 'closed') return null;
    const deadline = new Date(c.slaDeadline);
    const now = new Date('2026-01-28T15:00:00Z');
    const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (c.slaBreach) return { text: 'SLA BREACHED', color: 'text-destructive' };
    if (hoursLeft < 24) return { text: `${Math.round(hoursLeft)}h left`, color: 'text-orange-400' };
    return { text: `${Math.round(hoursLeft / 24)}d left`, color: 'text-muted-foreground' };
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-accent" />
            <div>
              <h3 className="font-semibold">Case Management</h3>
              <p className="text-xs text-muted-foreground">
                {filteredCases.length} cases • {DEMO_CASES.filter(c => c.status !== 'closed').length} active
              </p>
            </div>
          </div>
          <Button size="sm" className="gap-2">
            <ArrowUpRight className="w-4 h-4" />
            New Case
          </Button>
        </div>

        {/* Status Filters */}
        <div className="flex gap-1 flex-wrap">
          {(['all', 'open', 'under_review', 'escalated', 'pending_approval', 'closed'] as const).map((status) => (
            <button
              key={status}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                statusFilter === status 
                  ? 'bg-accent text-accent-foreground' 
                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
              }`}
              onClick={() => setStatusFilter(status)}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Case List */}
      <div className="flex-1 overflow-auto">
        {filteredCases.map((c) => {
          const slaStatus = getSlaStatus(c);
          
          return (
            <div
              key={c.id}
              className={`p-4 border-b border-border cursor-pointer transition-colors ${
                selectedCaseId === c.id ? 'bg-accent/10' : 'hover:bg-secondary/30'
              }`}
              onClick={() => onCaseSelect(c.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getPriorityColor(c.priority)}`}>
                    {c.priority.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">{c.caseNumber}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] ${getStatusColor(c.status)}`}>
                  {c.status.replace('_', ' ')}
                </span>
              </div>

              <p className="font-medium text-sm">{c.applicant}</p>
              <p className="text-xs text-muted-foreground">{c.type}</p>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {c.assignee}
                  </span>
                  <span className="flex items-center gap-1">
                    <Paperclip className="w-3 h-3" />
                    {c.documents}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {c.notes}
                  </span>
                </div>
                {slaStatus && (
                  <span className={`flex items-center gap-1 text-[10px] ${slaStatus.color}`}>
                    <Clock className="w-3 h-3" />
                    {slaStatus.text}
                  </span>
                )}
              </div>

              {c.linkedEntities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {c.linkedEntities.slice(0, 2).map((entity, idx) => (
                    <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-secondary rounded">
                      {entity}
                    </span>
                  ))}
                  {c.linkedEntities.length > 2 && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded text-muted-foreground">
                      +{c.linkedEntities.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="p-3 border-t border-border bg-secondary/20">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-blue-400">{DEMO_CASES.filter(c => c.status === 'open').length}</p>
            <p className="text-[10px] text-muted-foreground">Open</p>
          </div>
          <div>
            <p className="text-lg font-bold text-yellow-400">{DEMO_CASES.filter(c => c.status === 'under_review').length}</p>
            <p className="text-[10px] text-muted-foreground">In Review</p>
          </div>
          <div>
            <p className="text-lg font-bold text-destructive">{DEMO_CASES.filter(c => c.status === 'escalated').length}</p>
            <p className="text-[10px] text-muted-foreground">Escalated</p>
          </div>
          <div>
            <p className="text-lg font-bold text-accent">{DEMO_CASES.filter(c => c.status === 'closed').length}</p>
            <p className="text-[10px] text-muted-foreground">Closed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
