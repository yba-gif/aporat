import { useState } from 'react';
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Clock,
  User,
  FileText,
  ChevronRight,
  Play,
  Settings2,
  Activity,
  GitBranch,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface PolicyRule {
  id: string;
  name: string;
  description: string;
  category: 'identity' | 'financial' | 'network' | 'document';
  severity: 'critical' | 'high' | 'medium' | 'low';
  enabled: boolean;
  triggerCount: number;
  lastTriggered?: string;
}

interface ApprovalItem {
  id: string;
  applicant: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  riskScore: number;
  triggeredRules: string[];
  submittedAt: string;
  assignedTo?: string;
}

interface AuditEntry {
  id: string;
  action: string;
  user: string;
  target: string;
  timestamp: string;
  details: string;
}

const POLICY_RULES: PolicyRule[] = [
  {
    id: 'rule-001',
    name: 'Duplicate Identity Detection',
    description: 'Flag applications with matching biometric or document hashes',
    category: 'identity',
    severity: 'critical',
    enabled: true,
    triggerCount: 47,
    lastTriggered: '2026-01-28T14:22:00Z'
  },
  {
    id: 'rule-002',
    name: 'High-Risk Network Association',
    description: 'Flag applicants connected to >3 flagged entities',
    category: 'network',
    severity: 'critical',
    enabled: true,
    triggerCount: 23,
    lastTriggered: '2026-01-28T13:45:00Z'
  },
  {
    id: 'rule-003',
    name: 'Document Timestamp Anomaly',
    description: 'Detect metadata inconsistencies in submitted documents',
    category: 'document',
    severity: 'high',
    enabled: true,
    triggerCount: 89,
    lastTriggered: '2026-01-28T14:30:00Z'
  },
  {
    id: 'rule-004',
    name: 'Agency Volume Spike',
    description: 'Alert when agency submits >50% more applications than baseline',
    category: 'network',
    severity: 'medium',
    enabled: true,
    triggerCount: 12,
    lastTriggered: '2026-01-27T09:15:00Z'
  },
  {
    id: 'rule-005',
    name: 'Social Media Risk Indicators',
    description: 'Flag connections to sanctioned entities on social platforms',
    category: 'network',
    severity: 'critical',
    enabled: true,
    triggerCount: 8,
    lastTriggered: '2026-01-28T11:00:00Z'
  },
  {
    id: 'rule-006',
    name: 'Financial Threshold Breach',
    description: 'Flag bank statements with suspicious transaction patterns',
    category: 'financial',
    severity: 'high',
    enabled: false,
    triggerCount: 156
  }
];

const APPROVAL_QUEUE: ApprovalItem[] = [
  {
    id: 'appr-001',
    applicant: 'Ahmad Rezaee',
    type: 'Tourist Visa',
    status: 'pending',
    riskScore: 87,
    triggeredRules: ['Duplicate Identity Detection', 'High-Risk Network Association'],
    submittedAt: '2026-01-28T14:00:00Z',
    assignedTo: 'Officer Yilmaz'
  },
  {
    id: 'appr-002',
    applicant: 'Elena Sokolova',
    type: 'Business Visa',
    status: 'escalated',
    riskScore: 72,
    triggeredRules: ['Document Timestamp Anomaly'],
    submittedAt: '2026-01-28T10:30:00Z',
    assignedTo: 'Supervisor Demir'
  },
  {
    id: 'appr-003',
    applicant: 'Viktor Petrov',
    type: 'Work Permit',
    status: 'pending',
    riskScore: 65,
    triggeredRules: ['High-Risk Network Association'],
    submittedAt: '2026-01-28T09:15:00Z'
  },
  {
    id: 'appr-004',
    applicant: 'Maria Santos',
    type: 'Tourist Visa',
    status: 'approved',
    riskScore: 12,
    triggeredRules: [],
    submittedAt: '2026-01-27T16:45:00Z',
    assignedTo: 'Officer Kaya'
  }
];

const AUDIT_LOG: AuditEntry[] = [
  {
    id: 'audit-001',
    action: 'POLICY_TRIGGERED',
    user: 'SYSTEM',
    target: 'Ahmad Rezaee',
    timestamp: '2026-01-28T14:22:00Z',
    details: 'Duplicate Identity Detection triggered - hash match with case #4829'
  },
  {
    id: 'audit-002',
    action: 'CASE_ESCALATED',
    user: 'Officer Yilmaz',
    target: 'Elena Sokolova',
    timestamp: '2026-01-28T13:45:00Z',
    details: 'Escalated to supervisor for manual review'
  },
  {
    id: 'audit-003',
    action: 'RULE_MODIFIED',
    user: 'Admin Ozturk',
    target: 'Agency Volume Spike',
    timestamp: '2026-01-28T11:30:00Z',
    details: 'Threshold adjusted from 40% to 50%'
  },
  {
    id: 'audit-004',
    action: 'CASE_APPROVED',
    user: 'Officer Kaya',
    target: 'Maria Santos',
    timestamp: '2026-01-27T17:00:00Z',
    details: 'Manual approval after document verification'
  }
];

export function MeridianPanel() {
  const [rules, setRules] = useState(POLICY_RULES);
  const [selectedTab, setSelectedTab] = useState<'policies' | 'queue' | 'audit'>('policies');
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(null);

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(r => 
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const getSeverityColor = (severity: PolicyRule['severity']) => {
    switch (severity) {
      case 'critical': return 'text-destructive bg-destructive/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'low': return 'text-accent bg-accent/10';
    }
  };

  const getStatusIcon = (status: ApprovalItem['status']) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="w-4 h-4 text-accent" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-destructive" />;
      case 'escalated': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="flex-1 flex">
      {/* Left: Navigation */}
      <div className="w-64 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <p className="text-label mb-1">Governance</p>
          <p className="text-xs text-muted-foreground">Policy enforcement & compliance</p>
        </div>

        <div className="p-2 space-y-1">
          <button
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-colors ${
              selectedTab === 'policies' ? 'bg-accent/10 text-accent' : 'hover:bg-secondary'
            }`}
            onClick={() => setSelectedTab('policies')}
          >
            <Shield className="w-4 h-4" />
            <div>
              <p className="text-sm font-medium">Policy Rules</p>
              <p className="text-[10px] text-muted-foreground">{rules.filter(r => r.enabled).length} active</p>
            </div>
          </button>

          <button
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-colors ${
              selectedTab === 'queue' ? 'bg-accent/10 text-accent' : 'hover:bg-secondary'
            }`}
            onClick={() => setSelectedTab('queue')}
          >
            <GitBranch className="w-4 h-4" />
            <div>
              <p className="text-sm font-medium">Approval Queue</p>
              <p className="text-[10px] text-muted-foreground">
                {APPROVAL_QUEUE.filter(a => a.status === 'pending').length} pending
              </p>
            </div>
          </button>

          <button
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-colors ${
              selectedTab === 'audit' ? 'bg-accent/10 text-accent' : 'hover:bg-secondary'
            }`}
            onClick={() => setSelectedTab('audit')}
          >
            <History className="w-4 h-4" />
            <div>
              <p className="text-sm font-medium">Audit Log</p>
              <p className="text-[10px] text-muted-foreground">Full decision trail</p>
            </div>
          </button>
        </div>

        {/* Stats */}
        <div className="mt-auto p-4 border-t border-border space-y-3">
          <p className="text-label">Today's Stats</p>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Rules triggered</span>
              <span className="font-mono text-foreground">127</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Cases approved</span>
              <span className="font-mono text-accent">84</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Cases rejected</span>
              <span className="font-mono text-destructive">12</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Avg. decision time</span>
              <span className="font-mono text-foreground">4.2h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Main Content */}
      <div className="flex-1 overflow-auto">
        {selectedTab === 'policies' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Policy Rules</h3>
                <p className="text-sm text-muted-foreground">Configure automated compliance checks</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings2 className="w-4 h-4" />
                Configure
              </Button>
            </div>

            <div className="space-y-3">
              {rules.map((rule) => (
                <div 
                  key={rule.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    rule.enabled ? 'border-border bg-background' : 'border-border/50 bg-secondary/20 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`px-2 py-1 rounded text-[10px] font-medium uppercase ${getSeverityColor(rule.severity)}`}>
                        {rule.severity}
                      </div>
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            {rule.triggerCount} triggers
                          </span>
                          {rule.lastTriggered && (
                            <span>Last: {new Date(rule.lastTriggered).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Switch 
                      checked={rule.enabled} 
                      onCheckedChange={() => toggleRule(rule.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'queue' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Approval Queue</h3>
                <p className="text-sm text-muted-foreground">Cases requiring human review</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Filter</Button>
                <Button variant="outline" size="sm">Assign</Button>
              </div>
            </div>

            <div className="space-y-2">
              {APPROVAL_QUEUE.map((item) => (
                <div 
                  key={item.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedApproval?.id === item.id ? 'border-accent bg-accent/5' : 'border-border hover:bg-secondary/30'
                  }`}
                  onClick={() => setSelectedApproval(item)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <p className="font-medium">{item.applicant}</p>
                        <p className="text-sm text-muted-foreground">{item.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`font-mono ${item.riskScore > 70 ? 'text-destructive' : item.riskScore > 40 ? 'text-yellow-500' : 'text-accent'}`}>
                          {item.riskScore}
                        </p>
                        <p className="text-[10px] text-muted-foreground">risk score</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  {item.triggeredRules.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {item.triggeredRules.map((rule, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-1 bg-destructive/10 text-destructive rounded">
                          {rule}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'audit' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Audit Log</h3>
                <p className="text-sm text-muted-foreground">Complete decision trail with timestamps</p>
              </div>
              <Button variant="outline" size="sm">Export</Button>
            </div>

            <div className="space-y-1">
              {AUDIT_LOG.map((entry) => (
                <div key={entry.id} className="flex items-start gap-4 p-3 hover:bg-secondary/30 rounded transition-colors">
                  <div className="w-20 shrink-0">
                    <p className="text-[10px] font-mono text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded text-[10px] font-mono shrink-0 ${
                    entry.action.includes('APPROVED') ? 'bg-accent/10 text-accent' :
                    entry.action.includes('REJECTED') ? 'bg-destructive/10 text-destructive' :
                    entry.action.includes('TRIGGERED') ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-secondary text-muted-foreground'
                  }`}>
                    {entry.action}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs font-medium">{entry.user}</span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-accent">{entry.target}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{entry.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Detail Panel (for queue) */}
      {selectedTab === 'queue' && selectedApproval && (
        <div className="w-80 border-l border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <p className="font-medium">{selectedApproval.applicant}</p>
              {getStatusIcon(selectedApproval.status)}
            </div>
            <p className="text-sm text-muted-foreground">{selectedApproval.type}</p>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-6">
            <div className="flex gap-2">
              <Button className="flex-1 gap-2" variant="default">
                <CheckCircle2 className="w-4 h-4" />
                Approve
              </Button>
              <Button className="flex-1 gap-2" variant="destructive">
                <XCircle className="w-4 h-4" />
                Reject
              </Button>
            </div>

            <div className="space-y-3">
              <p className="text-label">Risk Assessment</p>
              <div className="p-3 bg-secondary/30 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Composite Score</span>
                  <span className={`text-2xl font-bold ${
                    selectedApproval.riskScore > 70 ? 'text-destructive' : 
                    selectedApproval.riskScore > 40 ? 'text-yellow-500' : 'text-accent'
                  }`}>
                    {selectedApproval.riskScore}
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      selectedApproval.riskScore > 70 ? 'bg-destructive' : 
                      selectedApproval.riskScore > 40 ? 'bg-yellow-500' : 'bg-accent'
                    }`}
                    style={{ width: `${selectedApproval.riskScore}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-label">Triggered Rules</p>
              {selectedApproval.triggeredRules.length > 0 ? (
                <div className="space-y-2">
                  {selectedApproval.triggeredRules.map((rule, idx) => (
                    <div key={idx} className="p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
                      {rule}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No rules triggered</p>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-label">Assignment</p>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{selectedApproval.assignedTo || 'Unassigned'}</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-label">Quick Actions</p>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <FileText className="w-4 h-4" />
                  View Documents
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Activity className="w-4 h-4" />
                  View in Nautica
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Escalate
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
