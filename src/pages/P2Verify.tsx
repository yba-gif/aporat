import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertTriangle, Search, QrCode, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';

type VerifyResult = 'valid' | 'invalid' | 'expired' | null;

const VALID_CERTS: Record<string, { name: string; issue: string; expiry: string; level: string; status: VerifyResult }> = {
  'CLR-2026-47210': { name: 'Alexander Müller', issue: 'March 5, 2026', expiry: 'September 5, 2026', level: 'STANDARD CLEARANCE', status: 'valid' },
  'CLR-2025-31842': { name: 'Fatima Al-Rashid', issue: 'June 12, 2025', expiry: 'December 12, 2025', level: 'STANDARD CLEARANCE', status: 'expired' },
};

const RESULT_CONFIG = {
  valid: { icon: Check, color: 'var(--p2-green)', bg: 'rgba(39,174,96,0.08)', title: 'Certificate Valid', desc: 'This certificate was issued by Portolan Labs and is authentic.' },
  invalid: { icon: X, color: 'var(--p2-red)', bg: 'rgba(192,57,43,0.08)', title: 'Certificate Not Found', desc: 'This certificate ID could not be verified. Please check and try again.' },
  expired: { icon: AlertTriangle, color: 'var(--p2-orange)', bg: 'rgba(230,126,34,0.08)', title: 'Certificate Expired', desc: 'This certificate has passed its expiry date and is no longer valid.' },
};

export default function P2Verify() {
  const { certId: paramId } = useParams();
  const [input, setInput] = useState(paramId || '');
  const [result, setResult] = useState<VerifyResult>(null);
  const [certData, setCertData] = useState<(typeof VALID_CERTS)[string] | null>(null);
  const [loading, setLoading] = useState(false);

  const verify = () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const cert = VALID_CERTS[input.trim().toUpperCase()];
      if (cert) {
        setResult(cert.status);
        setCertData(cert);
      } else {
        setResult('invalid');
        setCertData(null);
      }
      setLoading(false);
    }, 1500);
  };

  const cfg = result ? RESULT_CONFIG[result] : null;

  return (
    <div className="p2 min-h-screen bg-white flex flex-col">
      <header className="border-b border-[--p2-gray-200] bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/p2" className="flex items-center gap-2"><img src={logo} alt="Portolan Labs" className="h-7" /></Link>
          <div className="flex items-center gap-4">
            <Link to="/p2/apply" className="text-[11px] text-[--p2-gray-500] hover:text-[--p2-blue] transition-colors">Apply Now</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-[480px] space-y-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-[--p2-navy]/5 flex items-center justify-center mx-auto mb-4">
              <Shield size={24} className="text-[--p2-navy]" />
            </div>
            <h1 className="text-xl font-bold text-[--p2-navy]">Certificate Verification</h1>
            <p className="text-xs text-[--p2-gray-500] mt-1">Verify the authenticity of a Portolan Labs clearance certificate</p>
          </motion.div>

          {/* Input */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="space-y-3">
            <div className="flex gap-2">
              <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Enter Certificate ID (e.g. CLR-2026-47210)"
                className="h-12 text-sm font-mono" onKeyDown={e => e.key === 'Enter' && verify()} />
              <Button onClick={verify} disabled={loading || !input.trim()} className="h-12 px-6 bg-[--p2-blue] hover:bg-[--p2-blue]/90 text-white text-sm gap-1.5 shrink-0">
                {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> : <><Search size={14} /> Verify</>}
              </Button>
            </div>
            <button className="flex items-center gap-1.5 text-[11px] text-[--p2-gray-400] hover:text-[--p2-blue] mx-auto transition-colors">
              <QrCode size={12} /> Or scan QR code
            </button>
          </motion.div>

          {/* Result */}
          <AnimatePresence mode="wait">
            {result && cfg && (
              <motion.div key={result} initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', damping: 20 }}
                className="rounded-2xl border border-[--p2-gray-200] overflow-hidden">
                <div className="p-6 sm:p-8 text-center" style={{ background: cfg.bg }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12, delay: 0.15 }}
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: `color-mix(in srgb, ${cfg.color} 15%, transparent)` }}>
                    <cfg.icon size={32} style={{ color: cfg.color }} />
                  </motion.div>
                  <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                    className="text-base font-bold text-[--p2-navy]">{cfg.title}</motion.h2>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                    className="text-xs text-[--p2-gray-500] mt-1.5 max-w-[340px] mx-auto">{cfg.desc}</motion.p>
                </div>

                {certData && (result === 'valid' || result === 'expired') && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                    className="px-6 sm:px-8 py-5 divide-y divide-[--p2-gray-100]">
                    {[
                      ['Applicant', certData.name],
                      ['Issue Date', certData.issue],
                      ['Expiry Date', certData.expiry],
                      ['Clearance Level', certData.level],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between py-2.5">
                        <span className="text-[11px] text-[--p2-gray-500]">{label}</span>
                        <span className={cn('text-[11px] font-semibold text-right',
                          label === 'Expiry Date' && result === 'expired' ? 'text-[--p2-orange]' : 'text-[--p2-navy]'
                        )}>{value}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Test IDs */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="rounded-xl border border-dashed border-[--p2-gray-300] p-4 bg-[--p2-gray-50]">
            <p className="text-[10px] font-semibold text-[--p2-gray-400] uppercase tracking-wider mb-2">Demo IDs</p>
            <div className="space-y-1">
              {[
                ['CLR-2026-47210', 'Valid certificate'],
                ['CLR-2025-31842', 'Expired certificate'],
                ['CLR-0000-00000', 'Invalid / not found'],
              ].map(([id, desc]) => (
                <button key={id} onClick={() => { setInput(id); setResult(null); }}
                  className="w-full text-left flex items-center justify-between px-3 py-1.5 rounded-md hover:bg-white transition-colors">
                  <span className="text-[10px] font-mono text-[--p2-blue]">{id}</span>
                  <span className="text-[10px] text-[--p2-gray-400]">{desc}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="border-t border-[--p2-gray-200] py-6">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-[--p2-gray-400]">© 2026 Portolan Labs AG. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-[10px] text-[--p2-gray-400] hover:text-[--p2-blue]">Terms</a>
            <a href="#" className="text-[10px] text-[--p2-gray-400] hover:text-[--p2-blue]">Privacy</a>
            <a href="#" className="text-[10px] text-[--p2-gray-400] hover:text-[--p2-blue]">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
