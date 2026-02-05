import { Shield, AlertCircle } from 'lucide-react';
import { RedFlag, getRedFlagsForCase, getCaseById } from './caseData';

interface RedFlagSummaryProps {
  caseId: string;
  applicantName?: string;
  riskScore?: number;
}

export function RedFlagSummary({ caseId, applicantName, riskScore }: RedFlagSummaryProps) {
  const caseData = getCaseById(caseId);
  const flags = getRedFlagsForCase(caseId);
  
  const displayName = applicantName || caseData?.applicant || 'Unknown';
  const displayScore = riskScore ?? caseData?.riskScore ?? 0;

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

  const getRiskScoreColor = () => {
    if (displayScore >= 80) return 'text-destructive';
    if (displayScore >= 50) return 'text-orange-500';
    if (displayScore >= 30) return 'text-yellow-500';
    return 'text-accent';
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
          {flags.length} flag{flags.length !== 1 ? 's' : ''} identified
        </span>
      </div>

      {/* Risk Score Banner */}
      <div className={`p-3 rounded-lg border ${
        displayScore >= 80 ? 'bg-destructive/10 border-destructive/30' :
        displayScore >= 50 ? 'bg-orange-500/10 border-orange-500/30' :
        displayScore >= 30 ? 'bg-yellow-500/10 border-yellow-500/30' :
        'bg-accent/10 border-accent/30'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Composite Risk Score</p>
            <p className={`text-2xl font-bold ${getRiskScoreColor()}`}>{displayScore}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Applicant</p>
            <p className="font-medium">{displayName}</p>
          </div>
        </div>
      </div>

      {/* Flags List */}
      {flags.length > 0 ? (
        <div className="space-y-3">
          {flags.map((flag, index) => {
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
      ) : (
        <div className="p-6 text-center border border-dashed border-border rounded-lg">
          <AlertCircle className="w-8 h-8 text-accent mx-auto mb-2" />
          <p className="text-sm font-medium text-accent">No Red Flags</p>
          <p className="text-xs text-muted-foreground mt-1">This case has no identified risk indicators</p>
        </div>
      )}
    </div>
  );
}
