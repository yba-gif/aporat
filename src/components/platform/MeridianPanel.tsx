import { useState } from 'react';
import { 
  Shield, 
  GitBranch,
  History,
  Briefcase
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { CaseManagement } from './meridian/CaseManagement';
import { DecisionWorkflow } from './meridian/DecisionWorkflow';

interface PolicyRule {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium';
  enabled: boolean;
  triggerCount: number;
}

const POLICY_RULES: PolicyRule[] = [
  { id: 'rule-001', name: 'Duplicate Identity Detection', description: 'Flag applications with matching biometric or document hashes', severity: 'critical', enabled: true, triggerCount: 47 },
  { id: 'rule-002', name: 'High-Risk Network Association', description: 'Flag applicants connected to >3 flagged entities', severity: 'critical', enabled: true, triggerCount: 23 },
  { id: 'rule-003', name: 'Document Timestamp Anomaly', description: 'Detect metadata inconsistencies', severity: 'high', enabled: true, triggerCount: 89 },
  { id: 'rule-004', name: 'Agency Volume Spike', description: 'Alert when agency submits >50% more applications', severity: 'medium', enabled: true, triggerCount: 12 },
  { id: 'rule-005', name: 'Social Media Risk Indicators', description: 'Flag connections to sanctioned entities', severity: 'critical', enabled: true, triggerCount: 8 },
];

export function MeridianPanel() {
  const [rules, setRules] = useState(POLICY_RULES);
  const [selectedTab, setSelectedTab] = useState<'cases' | 'policies' | 'workflow'>('cases');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>('case-001');

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
  };

  const getSeverityColor = (severity: PolicyRule['severity']) => {
    switch (severity) {
      case 'critical': return 'text-destructive bg-destructive/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
    }
  };

  return (
    <div className="flex-1 flex">
      {/* Left Nav */}
      <div className="w-56 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <p className="text-label mb-1">Governance</p>
          <p className="text-xs text-muted-foreground">Policy & compliance</p>
        </div>

        <div className="p-2 space-y-1">
          <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-colors ${selectedTab === 'cases' ? 'bg-accent/10 text-accent' : 'hover:bg-secondary'}`} onClick={() => setSelectedTab('cases')}>
            <Briefcase className="w-4 h-4" />
            <div><p className="text-sm font-medium">Cases</p><p className="text-[10px] text-muted-foreground">3 active</p></div>
          </button>
          <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-colors ${selectedTab === 'workflow' ? 'bg-accent/10 text-accent' : 'hover:bg-secondary'}`} onClick={() => setSelectedTab('workflow')}>
            <GitBranch className="w-4 h-4" />
            <div><p className="text-sm font-medium">Workflows</p><p className="text-[10px] text-muted-foreground">Decision trails</p></div>
          </button>
          <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-colors ${selectedTab === 'policies' ? 'bg-accent/10 text-accent' : 'hover:bg-secondary'}`} onClick={() => setSelectedTab('policies')}>
            <Shield className="w-4 h-4" />
            <div><p className="text-sm font-medium">Policy Rules</p><p className="text-[10px] text-muted-foreground">{rules.filter(r => r.enabled).length} active</p></div>
          </button>
        </div>

        <div className="mt-auto p-4 border-t border-border space-y-2">
          <p className="text-label">Today's Stats</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Rules triggered</span><span className="font-mono">127</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Cases approved</span><span className="font-mono text-accent">84</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Cases rejected</span><span className="font-mono text-destructive">12</span></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {selectedTab === 'cases' && (
        <>
          <div className="w-96 border-r border-border" data-tour="case-management">
            <CaseManagement onCaseSelect={setSelectedCaseId} selectedCaseId={selectedCaseId} />
          </div>
          <div className="flex-1" data-tour="decision-workflow">
            <DecisionWorkflow caseId={selectedCaseId} />
          </div>
        </>
      )}

      {selectedTab === 'workflow' && (
        <div className="flex-1">
          <DecisionWorkflow caseId={selectedCaseId || 'case-001'} />
        </div>
      )}

      {selectedTab === 'policies' && (
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl space-y-4">
            <h3 className="text-lg font-semibold">Policy Rules</h3>
            <div className="space-y-3">
              {rules.map((rule) => (
                <div key={rule.id} className={`p-4 border rounded-lg ${rule.enabled ? 'border-border' : 'border-border/50 opacity-60'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-medium uppercase ${getSeverityColor(rule.severity)}`}>{rule.severity}</span>
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">{rule.triggerCount} triggers</p>
                      </div>
                    </div>
                    <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
