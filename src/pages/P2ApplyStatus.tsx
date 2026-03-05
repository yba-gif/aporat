import { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, Clock, X, Loader2, Download, Share2, AlertCircle,
  Mail, ChevronRight, Shield, Globe, FileText, ArrowLeft,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import logo from '@/assets/logo.png';

// ── Types ──
type AppStatus = 'PROCESSING' | 'CLEARED' | 'UNDER_REVIEW' | 'DENIED';

interface StepInfo {
  label: string;
  status: 'done' | 'active' | 'pending';
  timestamp?: string;
}

// ── Mock Data ──
const MOCK = {
  id: 'CLR-2026-4721',
  name: 'Alexander Müller',
  nationality: 'Germany',
  email: 'alexander.m@example.com',
  appliedAt: 'March 5, 2026 — 14:32 UTC',
  processingType: 'Express' as const,
  destination: 'Switzerland',
};

const INITIAL_STEPS: StepInfo[] = [
  { label: 'Application Received', status: 'done', timestamp: 'Mar 5, 14:32' },
  { label: 'Identity Verification', status: 'done', timestamp: 'Mar 5, 14:35' },
  { label: 'Background Screening', status: 'active' },
  { label: 'AI Analysis', status: 'pending' },
  { label: 'Final Decision', status: 'pending' },
];

const STEP_TIMESTAMPS = [
  'Mar 5, 14:32',
  'Mar 5, 14:35',
  'Mar 5, 15:12',
  'Mar 5, 15:48',
  'Mar 5, 16:01',
];

// ── Status Config ──
const STATUS_CONFIG: Record<AppStatus, { icon: typeof Check; color: string; bg: string; label: string; sublabel: string }> = {
  PROCESSING: { icon: Loader2, color: 'var(--p2-blue)', bg: 'rgba(41,128,185,0.08)', label: 'Processing', sublabel: 'Your application is being processed' },
  CLEARED: { icon: Check, color: 'var(--p2-green)', bg: 'rgba(39,174,96,0.08)', label: 'Cleared', sublabel: 'Your clearance certificate is ready!' },
  UNDER_REVIEW: { icon: Clock, color: 'var(--p2-orange)', bg: 'rgba(230,126,34,0.08)', label: 'Under Review', sublabel: 'Under manual review by our team' },
  DENIED: { icon: X, color: 'var(--p2-red)', bg: 'rgba(192,57,43,0.08)', label: 'Denied', sublabel: 'Your application could not be approved' },
};

export default function P2ApplyStatus() {
  const { id } = useParams();
  const appId = id || MOCK.id;

  const [steps, setSteps] = useState<StepInfo[]>(INITIAL_STEPS);
  const [status, setStatus] = useState<AppStatus>('PROCESSING');
  const [progress, setProgress] = useState(42);
  const [remainMinutes, setRemainMinutes] = useState(18 * 60 + 42); // 18h 42m in minutes
  const [showDenialReason, setShowDenialReason] = useState(false);

  // Simulated live progression
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Step 3 completes after 4s
    timers.push(setTimeout(() => {
      setSteps(prev => prev.map((s, i) =>
        i === 2 ? { ...s, status: 'done', timestamp: STEP_TIMESTAMPS[2] } :
        i === 3 ? { ...s, status: 'active' } : s
      ));
      setProgress(65);
    }, 4000));

    // Step 4 completes after 8s
    timers.push(setTimeout(() => {
      setSteps(prev => prev.map((s, i) =>
        i === 3 ? { ...s, status: 'done', timestamp: STEP_TIMESTAMPS[3] } :
        i === 4 ? { ...s, status: 'active' } : s
      ));
      setProgress(88);
    }, 8000));

    // Final decision after 12s
    timers.push(setTimeout(() => {
      setSteps(prev => prev.map((s, i) =>
        i === 4 ? { ...s, status: 'done', timestamp: STEP_TIMESTAMPS[4] } : s
      ));
      setProgress(100);
      setStatus('CLEARED');
    }, 12000));

    // Countdown
    const countdown = setInterval(() => {
      setRemainMinutes(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => { timers.forEach(clearTimeout); clearInterval(countdown); };
  }, []);

  const cfg = STATUS_CONFIG[status];
  const StatusIcon = cfg.icon;
  const hours = Math.floor(remainMinutes / 60);
  const mins = remainMinutes % 60;

  return (
    <div className="p2 min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <header className="border-b border-[--p2-gray-200] bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/p2" className="flex items-center gap-2">
            <img src={logo} alt="Portolan Labs" className="h-7" />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/p2/apply" className="text-[11px] text-[--p2-gray-500] hover:text-[--p2-blue] transition-colors">New Application</Link>
            <Link to="/p2/login" className="text-[11px] font-semibold text-[--p2-blue] hover:underline">Login</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 sm:py-12 px-4">
        <div className="max-w-[800px] mx-auto space-y-8">
          {/* Back link */}
          <Link to="/p2/apply" className="inline-flex items-center gap-1.5 text-[11px] text-[--p2-gray-400] hover:text-[--p2-blue] transition-colors">
            <ArrowLeft size={12} /> Back to application
          </Link>

          {/* Status Hero */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <p className="text-[10px] font-mono text-[--p2-gray-400] tracking-widest mb-4">APPLICATION {appId}</p>

            <motion.div
              key={status}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 20 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
              style={{ background: cfg.bg }}
            >
              <StatusIcon
                size={36}
                style={{ color: cfg.color }}
                className={cn(status === 'PROCESSING' && 'animate-spin')}
              />
            </motion.div>

            <motion.div key={`label-${status}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2"
                style={{ color: cfg.color, background: cfg.bg }}>
                {cfg.label}
              </span>
              <p className="text-sm text-[--p2-gray-600] mt-2">{cfg.sublabel}</p>
            </motion.div>
          </motion.div>

          {/* Progress Tracker */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-2xl border border-[--p2-gray-200] p-6 sm:p-8">
            <h3 className="text-xs font-semibold text-[--p2-navy] mb-6">Processing Steps</h3>
            <div className="flex items-start justify-between relative">
              {/* Background line */}
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-[--p2-gray-200]" />
              {/* Active line */}
              {(() => {
                const doneCount = steps.filter(s => s.status === 'done').length;
                const activeIdx = steps.findIndex(s => s.status === 'active');
                const pct = activeIdx >= 0
                  ? ((doneCount + 0.5) / (steps.length - 1)) * 100
                  : (doneCount / (steps.length - 1)) * 100;
                return <div className="absolute top-4 left-0 h-0.5 bg-[--p2-blue] transition-all duration-700" style={{ width: `${Math.min(pct, 100)}%` }} />;
              })()}

              {steps.map((s, i) => (
                <div key={i} className="flex flex-col items-center relative z-10 w-0 flex-1">
                  <motion.div
                    animate={s.status === 'active' ? { boxShadow: ['0 0 0 0px rgba(41,128,185,0.3)', '0 0 0 8px rgba(41,128,185,0)', '0 0 0 0px rgba(41,128,185,0.3)'] } : {}}
                    transition={s.status === 'active' ? { duration: 2, repeat: Infinity } : {}}
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500',
                      s.status === 'done' ? 'bg-[--p2-blue] border-[--p2-blue] text-white' :
                      s.status === 'active' ? 'bg-white border-[--p2-blue] text-[--p2-blue]' :
                      'bg-white border-[--p2-gray-300] text-[--p2-gray-400]'
                    )}
                  >
                    {s.status === 'done' ? <Check size={14} /> :
                     s.status === 'active' ? <Loader2 size={14} className="animate-spin" /> :
                     <span className="text-[10px] font-bold">{i + 1}</span>}
                  </motion.div>
                  <span className={cn(
                    'text-[9px] sm:text-[10px] mt-2 text-center font-medium leading-tight',
                    s.status === 'done' ? 'text-[--p2-navy]' :
                    s.status === 'active' ? 'text-[--p2-blue]' :
                    'text-[--p2-gray-400]'
                  )}>{s.label}</span>
                  {s.timestamp && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-[8px] text-[--p2-gray-400] mt-0.5">{s.timestamp}</motion.span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Details Card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="rounded-2xl border border-[--p2-gray-200] p-6 sm:p-8 space-y-5">
            <h3 className="text-xs font-semibold text-[--p2-navy]">Application Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Applicant', value: MOCK.name },
                { label: 'Nationality', value: MOCK.nationality },
                { label: 'Applied', value: 'March 5, 2026' },
                { label: 'Processing', value: MOCK.processingType },
              ].map(d => (
                <div key={d.label}>
                  <p className="text-[10px] text-[--p2-gray-400]">{d.label}</p>
                  <p className="text-xs font-semibold text-[--p2-navy] mt-0.5">{d.value}</p>
                </div>
              ))}
            </div>

            {status === 'PROCESSING' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] text-[--p2-gray-500]">Estimated completion</p>
                  <p className="text-[11px] font-semibold text-[--p2-navy]">
                    {hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''} ` : ''}{mins} minute{mins !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="h-2.5 bg-[--p2-gray-100] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[--p2-blue] to-[--p2-blue-light]"
                    initial={{ width: '30%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-[10px] text-[--p2-gray-400] mt-1.5 text-right">{progress}% complete</p>
              </div>
            )}
          </motion.div>

          {/* Actions */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="rounded-2xl border border-[--p2-gray-200] p-6 sm:p-8">

            <AnimatePresence mode="wait">
              {status === 'PROCESSING' && (
                <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-[--p2-blue]/10 flex items-center justify-center mx-auto mb-3">
                    <Mail size={20} className="text-[--p2-blue]" />
                  </div>
                  <p className="text-sm text-[--p2-gray-600]">We'll email you when your certificate is ready</p>
                  <p className="text-xs font-medium text-[--p2-navy] mt-1">{MOCK.email}</p>
                </motion.div>
              )}

              {status === 'CLEARED' && (
                <motion.div key="cleared" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="text-center py-4 space-y-4">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12, delay: 0.2 }}
                    className="w-16 h-16 rounded-full bg-[--p2-green]/10 flex items-center justify-center mx-auto">
                    <Check size={32} className="text-[--p2-green]" />
                  </motion.div>
                  <p className="text-sm font-semibold text-[--p2-navy]">Your clearance certificate is ready for download</p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button size="lg" className="h-12 px-8 text-sm gap-2 bg-[--p2-green] hover:bg-[--p2-green]/90 text-white"
                      onClick={() => toast({ title: 'Certificate downloaded', description: `${appId}-certificate.pdf` })}>
                      <Download size={16} /> Download Certificate
                    </Button>
                    <Button size="lg" variant="outline" className="h-12 px-8 text-sm gap-2"
                      onClick={() => { navigator.clipboard.writeText(`https://verify.portolanlabs.com/${appId}`); toast({ title: 'Link copied!' }); }}>
                      <Share2 size={16} /> Share Certificate
                    </Button>
                  </div>
                </motion.div>
              )}

              {status === 'UNDER_REVIEW' && (
                <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-[--p2-orange]/10 flex items-center justify-center mx-auto mb-3">
                    <Clock size={20} className="text-[--p2-orange]" />
                  </div>
                  <p className="text-sm text-[--p2-gray-600]">A specialist is reviewing your case.</p>
                  <p className="text-xs text-[--p2-gray-400] mt-1">You'll be notified within 24 hours.</p>
                </motion.div>
              )}

              {status === 'DENIED' && (
                <motion.div key="denied" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="py-4 space-y-4">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-[--p2-red]/10 flex items-center justify-center mx-auto mb-3">
                      <AlertCircle size={20} className="text-[--p2-red]" />
                    </div>
                    <p className="text-sm text-[--p2-gray-600]">Unfortunately, your application could not be approved.</p>
                  </div>

                  <AnimatePresence>
                    {showDenialReason && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden">
                        <div className="p-4 rounded-xl bg-[--p2-red]/5 border border-[--p2-red]/20 text-xs text-[--p2-gray-600] leading-relaxed">
                          <p className="font-semibold text-[--p2-navy] mb-1">Reason for denial:</p>
                          <p>The background screening identified discrepancies in the submitted documentation that require further clarification. Additionally, the identity verification process could not confirm all provided information against official records.</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button variant="outline" className="h-10 text-xs gap-1.5" onClick={() => setShowDenialReason(v => !v)}>
                      <FileText size={14} /> {showDenialReason ? 'Hide Details' : 'View Details'}
                    </Button>
                    <Button className="h-10 text-xs gap-1.5 bg-[--p2-red] hover:bg-[--p2-red]/90 text-white"
                      onClick={() => toast({ title: 'Appeal submitted', description: 'Our team will review your case within 5 business days.' })}>
                      Appeal Decision
                    </Button>
                    <Button variant="ghost" className="h-10 text-xs gap-1.5 text-[--p2-gray-500]">
                      <MessageSquare size={14} /> Contact Support
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Demo Controls */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="rounded-xl border border-dashed border-[--p2-gray-300] p-4 bg-[--p2-gray-50]">
            <p className="text-[10px] font-semibold text-[--p2-gray-400] uppercase tracking-wider mb-3">Demo Controls (simulated states)</p>
            <div className="flex flex-wrap gap-2">
              {(['PROCESSING', 'CLEARED', 'UNDER_REVIEW', 'DENIED'] as AppStatus[]).map(s => (
                <button key={s} onClick={() => setStatus(s)}
                  className={cn(
                    'text-[10px] font-semibold px-3 py-1.5 rounded-full border transition-all',
                    status === s
                      ? 'text-white'
                      : 'text-[--p2-gray-500] border-[--p2-gray-300] hover:border-[--p2-gray-400]'
                  )}
                  style={status === s ? { background: STATUS_CONFIG[s].color, borderColor: STATUS_CONFIG[s].color } : {}}>
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[--p2-gray-200] py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-[--p2-gray-400]">© 2026 Portolan Labs AG. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-[10px] text-[--p2-gray-400] hover:text-[--p2-blue] transition-colors">Terms of Service</a>
            <a href="#" className="text-[10px] text-[--p2-gray-400] hover:text-[--p2-blue] transition-colors">Privacy Policy</a>
            <a href="#" className="text-[10px] text-[--p2-gray-400] hover:text-[--p2-blue] transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
