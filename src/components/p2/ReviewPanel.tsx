import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addMonths } from 'date-fns';
import { cn } from '@/lib/utils';

type Decision = 'approve' | 'deny' | 'escalate';

interface ReviewPanelProps {
  open: boolean;
  onClose: () => void;
  applicantName: string;
  initialDecision: Decision;
}

const DECISION_META: Record<Decision, { label: string; color: string; icon: typeof CheckCircle; desc: string }> = {
  approve: { label: 'Approve', color: 'var(--p2-green)', icon: CheckCircle, desc: 'Grant visa application. Applicant meets all requirements and passes risk assessment.' },
  deny: { label: 'Deny', color: 'var(--p2-red)', icon: XCircle, desc: 'Reject visa application. Applicant does not meet requirements or poses unacceptable risk.' },
  escalate: { label: 'Escalate', color: 'var(--p2-orange)', icon: AlertTriangle, desc: 'Forward case to senior authority for additional review and decision.' },
};

export default function ReviewPanel({ open, onClose, applicantName, initialDecision }: ReviewPanelProps) {
  const [decision, setDecision] = useState<Decision>(initialDecision);
  const [confirmStep, setConfirmStep] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Approve fields
  const [clearance, setClearance] = useState('standard');
  const [validUntil, setValidUntil] = useState<Date>(addMonths(new Date(), 6));
  const [approveNotes, setApproveNotes] = useState('');

  // Deny fields
  const [denyReason, setDenyReason] = useState('');
  const [denyExplanation, setDenyExplanation] = useState('');
  const [sendNotification, setSendNotification] = useState(false);

  // Escalate fields
  const [escalateTo, setEscalateTo] = useState('');
  const [priority, setPriority] = useState('normal');
  const [escalateReason, setEscalateReason] = useState('');

  useEffect(() => {
    setDecision(initialDecision);
    setConfirmStep(false);
    setSubmitted(false);
  }, [initialDecision, open]);

  const canSubmit = () => {
    if (decision === 'deny') return denyReason !== '' && denyExplanation.length >= 50;
    if (decision === 'escalate') return escalateTo !== '' && escalateReason.trim().length > 0;
    return true;
  };

  const handleSubmit = () => {
    if (!confirmStep) { setConfirmStep(true); return; }
    setSubmitted(true);
    setTimeout(() => { onClose(); setSubmitted(false); setConfirmStep(false); }, 1500);
  };

  const meta = DECISION_META[decision];
  const btnColor = decision === 'approve' ? 'bg-[--p2-green] hover:bg-[--p2-green]/90' : decision === 'deny' ? 'bg-[--p2-red] hover:bg-[--p2-red]/90' : 'bg-[--p2-orange] hover:bg-[--p2-orange]/90';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-[480px] bg-white z-50 shadow-2xl flex flex-col"
          >
            {submitted ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex-1 flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: meta.color }}>
                  <CheckCircle size={32} className="text-white" />
                </div>
                <p className="text-sm font-semibold text-[--p2-navy]">Review submitted</p>
                <p className="text-xs text-[--p2-gray-500]">Case decision has been recorded</p>
              </motion.div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[--p2-gray-200]">
                  <div>
                    <h2 className="text-sm font-bold text-[--p2-navy]">Review Case: {applicantName}</h2>
                    <p className="text-[11px] text-[--p2-gray-400] mt-0.5">Submit your decision for this application</p>
                  </div>
                  <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[--p2-gray-50] text-[--p2-gray-400] hover:text-[--p2-navy] transition-colors">
                    <X size={18} />
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                  {/* Decision radio */}
                  <div>
                    <label className="text-xs font-semibold text-[--p2-navy] mb-3 block">Decision</label>
                    <RadioGroup value={decision} onValueChange={(v) => { setDecision(v as Decision); setConfirmStep(false); }}>
                      {(['approve', 'deny', 'escalate'] as Decision[]).map(d => {
                        const m = DECISION_META[d];
                        const Icon = m.icon;
                        return (
                          <label key={d} className={cn(
                            'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                            decision === d ? 'border-current ring-1' : 'border-[--p2-gray-200] hover:border-[--p2-gray-300]'
                          )} style={decision === d ? { borderColor: m.color, '--tw-ring-color': m.color } as React.CSSProperties : undefined}>
                            <RadioGroupItem value={d} className="mt-0.5" />
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5">
                                <Icon size={14} style={{ color: m.color }} />
                                <span className="text-xs font-semibold" style={{ color: m.color }}>{m.label}</span>
                              </div>
                              {decision === d && (
                                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-[11px] text-[--p2-gray-500] mt-1 leading-relaxed">
                                  {m.desc}
                                </motion.p>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </RadioGroup>
                  </div>

                  {/* Conditional fields */}
                  <AnimatePresence mode="wait">
                    <motion.div key={decision} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }} className="space-y-4">

                      {decision === 'approve' && (
                        <>
                          <div>
                            <Label className="text-xs font-semibold text-[--p2-navy] mb-1.5 block">Clearance Level</Label>
                            <Select value={clearance} onValueChange={setClearance}>
                              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="enhanced">Enhanced</SelectItem>
                                <SelectItem value="diplomatic">Diplomatic</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-[--p2-navy] mb-1.5 block">Valid Until</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left text-xs h-9 font-normal">
                                  {format(validUntil, 'PPP')}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={validUntil} onSelect={(d) => d && setValidUntil(d)} initialFocus className="p-3 pointer-events-auto" />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-[--p2-navy] mb-1.5 block">Notes <span className="font-normal text-[--p2-gray-400]">(optional)</span></Label>
                            <Textarea value={approveNotes} onChange={e => setApproveNotes(e.target.value)} placeholder="Additional notes..." className="text-xs min-h-[80px] resize-none" />
                          </div>
                        </>
                      )}

                      {decision === 'deny' && (
                        <>
                          <div>
                            <Label className="text-xs font-semibold text-[--p2-navy] mb-1.5 block">Denial Reason <span className="text-[--p2-red]">*</span></Label>
                            <Select value={denyReason} onValueChange={setDenyReason}>
                              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select reason..." /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sanctions">Sanctions Hit</SelectItem>
                                <SelectItem value="identity">Identity Concerns</SelectItem>
                                <SelectItem value="documentation">Incomplete Documentation</SelectItem>
                                <SelectItem value="risk_score">Risk Score Threshold</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-[--p2-navy] mb-1.5 block">Detailed Explanation <span className="text-[--p2-red]">*</span></Label>
                            <Textarea value={denyExplanation} onChange={e => setDenyExplanation(e.target.value)} placeholder="Provide detailed explanation (min 50 characters)..." className="text-xs min-h-[100px] resize-none" />
                            <p className={cn('text-[10px] mt-1', denyExplanation.length >= 50 ? 'text-[--p2-green]' : 'text-[--p2-gray-400]')}>
                              {denyExplanation.length}/50 characters minimum
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox id="notify" checked={sendNotification} onCheckedChange={(v) => setSendNotification(v === true)} />
                            <Label htmlFor="notify" className="text-xs text-[--p2-gray-600] cursor-pointer">Send denial notification to applicant</Label>
                          </div>
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-[--p2-orange]/5 border border-[--p2-orange]/20">
                            <Info size={14} className="text-[--p2-orange] flex-shrink-0 mt-0.5" />
                            <p className="text-[11px] text-[--p2-gray-600]">This action will be recorded in the audit log and cannot be undone without supervisor approval.</p>
                          </div>
                        </>
                      )}

                      {decision === 'escalate' && (
                        <>
                          <div>
                            <Label className="text-xs font-semibold text-[--p2-navy] mb-1.5 block">Escalate To <span className="text-[--p2-red]">*</span></Label>
                            <Select value={escalateTo} onValueChange={setEscalateTo}>
                              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select recipient..." /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="senior_officer">Senior Officer</SelectItem>
                                <SelectItem value="department_head">Department Head</SelectItem>
                                <SelectItem value="security_division">Security Division</SelectItem>
                                <SelectItem value="external_agency">External Agency</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-[--p2-navy] mb-3 block">Priority</Label>
                            <RadioGroup value={priority} onValueChange={setPriority} className="flex gap-3">
                              {[
                                { v: 'normal', l: 'Normal', c: 'var(--p2-blue)' },
                                { v: 'high', l: 'High', c: 'var(--p2-orange)' },
                                { v: 'urgent', l: 'Urgent', c: 'var(--p2-red)' },
                              ].map(p => (
                                <label key={p.v} className={cn(
                                  'flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-xs transition-all',
                                  priority === p.v ? 'ring-1' : 'border-[--p2-gray-200]'
                                )} style={priority === p.v ? { borderColor: p.c, '--tw-ring-color': p.c, color: p.c } as React.CSSProperties : undefined}>
                                  <RadioGroupItem value={p.v} />
                                  {p.l}
                                </label>
                              ))}
                            </RadioGroup>
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-[--p2-navy] mb-1.5 block">Reason for Escalation <span className="text-[--p2-red]">*</span></Label>
                            <Textarea value={escalateReason} onChange={e => setEscalateReason(e.target.value)} placeholder="Explain why this case needs escalation..." className="text-xs min-h-[100px] resize-none" />
                          </div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[--p2-gray-200] flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={onClose} className="text-xs h-9">Cancel</Button>
                  <Button
                    size="sm"
                    disabled={!canSubmit()}
                    onClick={handleSubmit}
                    className={cn('text-xs h-9 text-white transition-all', btnColor, !canSubmit() && 'opacity-50')}
                  >
                    {confirmStep ? `Confirm ${meta.label}?` : 'Submit Review'}
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
