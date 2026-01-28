import { 
  GitBranch, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ArrowRight,
  User,
  Clock,
  FileText,
  Shield,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkflowStep {
  id: string;
  name: string;
  status: 'completed' | 'current' | 'pending' | 'skipped';
  actor?: string;
  timestamp?: string;
  decision?: 'approved' | 'rejected' | 'escalated';
  notes?: string;
}

interface DecisionWorkflowProps {
  caseId: string | null;
}

const DEMO_WORKFLOW: WorkflowStep[] = [
  {
    id: 'step-1',
    name: 'Document Ingestion',
    status: 'completed',
    actor: 'SYSTEM',
    timestamp: '2026-01-25T10:05:00Z',
    notes: 'All documents verified and sealed'
  },
  {
    id: 'step-2',
    name: 'Automated Risk Assessment',
    status: 'completed',
    actor: 'RISK ENGINE',
    timestamp: '2026-01-25T10:05:30Z',
    decision: 'escalated',
    notes: 'Risk score 94 - Flagged for manual review'
  },
  {
    id: 'step-3',
    name: 'Network Analysis',
    status: 'completed',
    actor: 'NAUTICA',
    timestamp: '2026-01-25T11:00:00Z',
    notes: 'Linked to Visa Mill network cluster'
  },
  {
    id: 'step-4',
    name: 'Officer Review',
    status: 'current',
    actor: 'Officer Yilmaz',
    timestamp: '2026-01-28T09:00:00Z',
    notes: 'Reviewing document authenticity'
  },
  {
    id: 'step-5',
    name: 'Supervisor Approval',
    status: 'pending'
  },
  {
    id: 'step-6',
    name: 'Final Decision',
    status: 'pending'
  }
];

const ESCALATION_RULES = [
  { condition: 'Risk Score > 80', action: 'Auto-escalate to Supervisor', active: true },
  { condition: 'Linked to Flagged Network', action: 'Require Intelligence Review', active: true },
  { condition: 'Document Hash Match', action: 'Block pending investigation', active: true },
  { condition: 'SLA < 24h', action: 'Priority queue assignment', active: true }
];

export function DecisionWorkflow({ caseId }: DecisionWorkflowProps) {
  if (!caseId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <GitBranch className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <p className="text-sm text-muted-foreground">Select a case to view workflow</p>
      </div>
    );
  }

  const getStepIcon = (step: WorkflowStep) => {
    if (step.status === 'completed') {
      if (step.decision === 'rejected') return <XCircle className="w-5 h-5 text-destructive" />;
      if (step.decision === 'escalated') return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      return <CheckCircle2 className="w-5 h-5 text-accent" />;
    }
    if (step.status === 'current') {
      return <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />;
    }
    return <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <GitBranch className="w-5 h-5 text-accent" />
          <div>
            <h3 className="font-semibold">Decision Workflow</h3>
            <p className="text-xs text-muted-foreground">CASE-2026-4829</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Workflow Steps */}
        <div className="space-y-1 relative">
          {DEMO_WORKFLOW.map((step, idx) => (
            <div key={step.id} className="relative">
              {/* Connector Line */}
              {idx < DEMO_WORKFLOW.length - 1 && (
                <div className={`absolute left-[9px] top-8 w-0.5 h-8 ${
                  step.status === 'completed' ? 'bg-accent' : 'bg-muted-foreground/20'
                }`} />
              )}
              
              <div className={`flex gap-3 p-3 rounded-lg transition-colors ${
                step.status === 'current' ? 'bg-accent/10 border border-accent/30' : ''
              }`}>
                {getStepIcon(step)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${
                      step.status === 'pending' ? 'text-muted-foreground' : ''
                    }`}>
                      {step.name}
                    </p>
                    {step.decision && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase ${
                        step.decision === 'approved' ? 'bg-accent/20 text-accent' :
                        step.decision === 'rejected' ? 'bg-destructive/20 text-destructive' :
                        'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {step.decision}
                      </span>
                    )}
                  </div>
                  {step.actor && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {step.actor} {step.timestamp && `• ${new Date(step.timestamp).toLocaleString()}`}
                    </p>
                  )}
                  {step.notes && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      "{step.notes}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Current Step Actions */}
        <div className="space-y-3">
          <p className="text-label">Current Step Actions</p>
          <div className="grid grid-cols-2 gap-2">
            <Button className="gap-2" variant="default">
              <CheckCircle2 className="w-4 h-4" />
              Approve
            </Button>
            <Button className="gap-2" variant="destructive">
              <XCircle className="w-4 h-4" />
              Reject
            </Button>
          </div>
          <Button className="w-full gap-2" variant="outline">
            <AlertTriangle className="w-4 h-4" />
            Escalate to Supervisor
          </Button>
        </div>

        {/* Escalation Rules */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent" />
            <p className="text-label">Active Escalation Rules</p>
          </div>
          <div className="space-y-2">
            {ESCALATION_RULES.map((rule, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 bg-secondary/30 rounded">
                <Zap className="w-3 h-3 text-yellow-500" />
                <div className="flex-1 text-xs">
                  <span className="text-muted-foreground">IF </span>
                  <span className="font-medium">{rule.condition}</span>
                  <span className="text-muted-foreground"> THEN </span>
                  <span className="text-accent">{rule.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SLA Timer */}
        <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-400">SLA Deadline</span>
            </div>
            <span className="text-lg font-mono text-orange-400">52:34:12</span>
          </div>
          <p className="text-xs text-orange-400/70 mt-1">Due: Jan 30, 2026 at 18:00</p>
        </div>
      </div>
    </div>
  );
}
