import { 
  AlertTriangle, 
  Users, 
  FileWarning, 
  Globe,
  Shield,
  Network
} from 'lucide-react';

interface RedFlag {
  id: string;
  severity: 'critical' | 'high' | 'medium';
  title: string;
  description: string;
  source: string;
  evidence: string;
  icon: typeof AlertTriangle;
}

interface RedFlagSummaryProps {
  caseId: string;
  applicantName: string;
  riskScore: number;
}

const DEMO_FLAGS: RedFlag[] = [
  {
    id: 'flag-1',
    severity: 'critical',
    title: 'Visa Mill Network Connection',
    description: 'Applicant connected to known visa mill network through employment agency',
    source: 'Nautica Intelligence',
    evidence: 'Linked to Apex Travel Agency (flagged cluster with 12 entities)',
    icon: Network
  },
  {
    id: 'flag-2',
    severity: 'critical',
    title: 'Document Hash Match',
    description: 'Bank statement SHA-256 hash matches template used in 8 other applications',
    source: 'Maris Document Vault',
    evidence: 'Hash: e3b0c442...98fb (matches APP-2024-*, APP-2025-*)',
    icon: FileWarning
  },
  {
    id: 'flag-3',
    severity: 'high',
    title: 'Pre-Submission Risk Signal',
    description: 'Applicant used shared mobile number with 3 other visa applicants',
    source: 'vizesepetim.com',
    evidence: 'Mobile hash shared with external_id: VS-2026-*, VS-2026-*',
    icon: Globe
  }
];

export function RedFlagSummary({ caseId, applicantName, riskScore }: RedFlagSummaryProps) {
  const getSeverityStyles = (severity: RedFlag['severity']) => {
    switch (severity) {
      case 'critical':
        return 'border-destructive/50 bg-destructive/10';
      case 'high':
        return 'border-orange-500/50 bg-orange-500/10';
      case 'medium':
        return 'border-yellow-500/50 bg-yellow-500/10';
    }
  };

  const getSeverityBadge = (severity: RedFlag['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-destructive text-destructive-foreground';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-black';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-destructive" />
          <h4 className="font-semibold text-sm">Red Flag Summary</h4>
        </div>
        <span className="text-xs text-muted-foreground">
          {DEMO_FLAGS.length} flags identified
        </span>
      </div>

      {/* Risk Score Banner */}
      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Composite Risk Score</p>
            <p className="text-2xl font-bold text-destructive">{riskScore}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Applicant</p>
            <p className="font-medium">{applicantName}</p>
          </div>
        </div>
      </div>

      {/* Flags List */}
      <div className="space-y-3">
        {DEMO_FLAGS.map((flag, index) => {
          const Icon = flag.icon;
          return (
            <div 
              key={flag.id}
              className={`p-3 rounded-lg border ${getSeverityStyles(flag.severity)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background/50 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getSeverityBadge(flag.severity)}`}>
                      #{index + 1}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${getSeverityBadge(flag.severity)}`}>
                      {flag.severity}
                    </span>
                  </div>
                  <p className="font-medium text-sm">{flag.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{flag.description}</p>
                  
                  <div className="mt-2 p-2 bg-background/30 rounded text-xs">
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">Source:</span> {flag.source}
                    </p>
                    <p className="text-muted-foreground mt-1">
                      <span className="font-medium text-foreground">Evidence:</span> {flag.evidence}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
