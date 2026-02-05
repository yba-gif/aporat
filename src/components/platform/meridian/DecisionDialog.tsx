import { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Shield,
  FileText,
  Users,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useLocale } from '@/lib/i18n';

type DecisionType = 'approve' | 'reject' | 'escalate';

interface DecisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decisionType: DecisionType;
  caseNumber: string;
  applicantName: string;
  riskScore: number;
  onConfirm: (notes: string) => void;
}

const getDecisionConfig = (t: (key: string) => string) => ({
  approve: {
    title: t('approve'),
    description: 'This will approve the application and move it to final processing.',
    icon: CheckCircle2,
    iconColor: 'text-accent',
    buttonText: t('approve'),
    buttonVariant: 'default' as const,
    impact: [
      'Application will be approved',
      'Applicant will be notified',
      'Case will be closed',
    ]
  },
  reject: {
    title: t('reject'),
    description: 'This will reject the application. This action requires justification.',
    icon: XCircle,
    iconColor: 'text-destructive',
    buttonText: t('reject'),
    buttonVariant: 'destructive' as const,
    impact: [
      'Application will be denied',
      'Reason codes will be recorded',
      'Applicant will be notified with appeal rights',
    ]
  },
  escalate: {
    title: t('escalate'),
    description: 'This will escalate the case for supervisor review.',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    buttonText: t('escalate'),
    buttonVariant: 'outline' as const,
    impact: [
      'Case priority will be elevated',
      'Supervisor will be notified',
      'SLA timer will be paused',
    ]
  }
});

export function DecisionDialog({
  open,
  onOpenChange,
  decisionType,
  caseNumber,
  applicantName,
  riskScore,
  onConfirm
}: DecisionDialogProps) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLocale();

  const DECISION_CONFIG = getDecisionConfig(t);
  const config = DECISION_CONFIG[decisionType];
  const Icon = config.icon;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    onConfirm(notes);
    setIsSubmitting(false);
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              decisionType === 'approve' ? 'bg-accent/20' :
              decisionType === 'reject' ? 'bg-destructive/20' :
              'bg-yellow-500/20'
            }`}>
              <Icon className={`w-5 h-5 ${config.iconColor}`} />
            </div>
            <div>
              <DialogTitle>{config.title}</DialogTitle>
              <DialogDescription>{config.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Case Summary */}
        <div className="p-3 bg-secondary/30 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Case</span>
            <span className="text-xs font-mono">{caseNumber}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Applicant</span>
            <span className="text-xs font-medium">{applicantName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{t('riskScore')}</span>
            <Badge 
              variant={riskScore >= 80 ? 'destructive' : riskScore >= 50 ? 'secondary' : 'default'}
              className="text-[10px]"
            >
              {riskScore}
            </Badge>
          </div>
        </div>

        {/* Impact Summary */}
        <div className="space-y-2">
          <p className="text-xs font-medium flex items-center gap-2">
            <Shield className="w-3 h-3" />
            Impact Summary
          </p>
          <ul className="space-y-1">
            {config.impact.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-1 h-1 rounded-full bg-accent" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-xs font-medium">
            {decisionType === 'reject' ? 'Rejection Reason (Required)' : 'Notes (Optional)'}
          </label>
          <Textarea
            placeholder={
              decisionType === 'reject' 
                ? 'Enter the reason for rejection...' 
                : 'Add any notes or observations...'
            }
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-24 text-sm"
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button 
            variant={config.buttonVariant}
            onClick={handleConfirm}
            disabled={isSubmitting || (decisionType === 'reject' && !notes.trim())}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              config.buttonText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Success state component
interface DecisionSuccessProps {
  decisionType: DecisionType;
  caseNumber: string;
  onDismiss: () => void;
}

export function DecisionSuccess({ decisionType, caseNumber, onDismiss }: DecisionSuccessProps) {
  return (
    <div className="p-6 text-center space-y-4">
      <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
        decisionType === 'approve' ? 'bg-accent/20' :
        decisionType === 'reject' ? 'bg-destructive/20' :
        'bg-yellow-500/20'
      }`}>
        {decisionType === 'approve' && <CheckCircle2 className="w-8 h-8 text-accent" />}
        {decisionType === 'reject' && <XCircle className="w-8 h-8 text-destructive" />}
        {decisionType === 'escalate' && <AlertTriangle className="w-8 h-8 text-yellow-500" />}
      </div>

      <div>
        <p className="text-lg font-semibold">
          {decisionType === 'approve' && 'Application Approved'}
          {decisionType === 'reject' && 'Application Rejected'}
          {decisionType === 'escalate' && 'Case Escalated'}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Decision recorded for {caseNumber}
        </p>
      </div>

      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <FileText className="w-3 h-3" />
          <span>Audit logged</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>Notifications sent</span>
        </div>
      </div>

      <Button onClick={onDismiss} className="mt-4">
        Continue
      </Button>
    </div>
  );
}
