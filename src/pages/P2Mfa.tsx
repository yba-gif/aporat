import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle2, Loader2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import '@/styles/p2.css';

const CORRECT_CODE = '123456'; // Mock correct code

export default function P2Mfa() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showBackup, setShowBackup] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const verify = useCallback((code: string) => {
    setVerifying(true);
    setError(false);
    setErrorMsg('');
    setTimeout(() => {
      if (code === CORRECT_CODE) {
        setSuccess(true);
        setTimeout(() => navigate('/p2'), 1200);
      } else {
        setError(true);
        setErrorMsg('Invalid code. Please try again.');
        setVerifying(false);
        // Reset after shake
        setTimeout(() => {
          setDigits(Array(6).fill(''));
          inputRefs.current[0]?.focus();
        }, 600);
      }
    }, 800);
  }, [navigate]);

  const handleChange = (index: number, value: string) => {
    if (verifying || success) return;
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError(false);
    setErrorMsg('');

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (digit && index === 5 && next.every(d => d)) {
      verify(next.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const next = [...digits];
      next[index - 1] = '';
      setDigits(next);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = Array(6).fill('');
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
    if (pasted.length === 6) {
      verify(pasted);
    }
  };

  const resend = () => {
    if (cooldown > 0) return;
    setCooldown(30);
    setDigits(Array(6).fill(''));
    setError(false);
    setErrorMsg('');
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="p2 min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--p2-gray-100)' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="p2-card p-8 sm:p-10 text-center">
          {/* Icon */}
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="mx-auto mb-5 w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: 'var(--p2-green)' }}
              >
                <CheckCircle2 size={28} className="text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="shield"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mx-auto mb-5 w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(10,22,40,0.06)' }}
              >
                <Shield size={26} style={{ color: 'var(--p2-navy)' }} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Title */}
          <h1 className="text-lg font-bold mb-1" style={{ color: 'var(--p2-navy)' }}>
            {success ? 'Verified!' : 'Two-Factor Authentication'}
          </h1>
          <p className="text-xs mb-7" style={{ color: 'var(--p2-gray-500)' }}>
            {success
              ? 'Redirecting to your dashboard...'
              : showBackup
                ? 'Enter your 8-character backup code'
                : 'Enter the 6-digit code from your authenticator app'}
          </p>

          {!success && !showBackup && (
            <>
              {/* OTP Inputs */}
              <motion.div
                animate={error ? { x: [0, -12, 12, -8, 8, -4, 4, 0] } : {}}
                transition={{ duration: 0.5 }}
                className="flex justify-center gap-2 sm:gap-3 mb-2"
              >
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    disabled={verifying}
                    className={cn(
                      'w-12 h-14 text-center text-xl font-bold rounded-lg border-2 bg-white transition-all duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-[--p2-blue]/30 focus:border-[--p2-blue]',
                      error ? 'border-[--p2-red] bg-[--p2-red]/[0.03]' : digit ? 'border-[--p2-navy]/30' : 'border-[--p2-gray-200]',
                      verifying && 'opacity-60 cursor-not-allowed'
                    )}
                    style={{ color: 'var(--p2-navy)' }}
                  />
                ))}
              </motion.div>

              {/* Error message */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-medium mt-2 mb-3"
                    style={{ color: 'var(--p2-red)' }}
                  >
                    {errorMsg}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Verify button */}
              <Button
                onClick={() => { if (digits.every(d => d)) verify(digits.join('')); }}
                disabled={!digits.every(d => d) || verifying}
                className="w-full h-10 mt-4 text-white disabled:opacity-50"
                style={{ background: 'var(--p2-navy)' }}
              >
                {verifying ? <><Loader2 size={16} className="animate-spin mr-2" /> Verifying...</> : 'Verify'}
              </Button>

              {/* Links */}
              <div className="mt-5 space-y-2">
                <button onClick={() => setShowBackup(true)}
                  className="text-xs font-medium hover:underline block mx-auto"
                  style={{ color: 'var(--p2-blue)' }}>
                  <KeyRound size={12} className="inline mr-1 mb-px" />
                  Use backup code instead
                </button>
                <button onClick={resend} disabled={cooldown > 0}
                  className={cn('text-xs block mx-auto', cooldown > 0 ? 'cursor-not-allowed' : 'hover:underline')}
                  style={{ color: cooldown > 0 ? 'var(--p2-gray-400)' : 'var(--p2-gray-500)' }}>
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : "Didn't receive a code? Resend"}
                </button>
              </div>
            </>
          )}

          {/* Backup code view */}
          {!success && showBackup && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative mb-4">
                <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={backupCode}
                  onChange={e => setBackupCode(e.target.value.toUpperCase())}
                  placeholder="XXXX-XXXX"
                  maxLength={9}
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-md border border-[--p2-gray-200] bg-white focus:outline-none focus:ring-2 focus:ring-[--p2-blue]/30 focus:border-[--p2-blue] text-center font-mono tracking-wider"
                  style={{ color: 'var(--p2-navy)' }}
                />
              </div>
              <Button className="w-full h-10 text-white mb-3" style={{ background: 'var(--p2-navy)' }}
                disabled={backupCode.replace(/-/g, '').length < 8}
                onClick={() => { setVerifying(true); setTimeout(() => { setSuccess(true); setTimeout(() => navigate('/p2'), 1200); }, 800); }}>
                {verifying ? <><Loader2 size={16} className="animate-spin mr-2" /> Verifying...</> : 'Verify Backup Code'}
              </Button>
              <button onClick={() => { setShowBackup(false); setBackupCode(''); }}
                className="text-xs font-medium hover:underline"
                style={{ color: 'var(--p2-gray-500)' }}>
                ← Back to authenticator code
              </button>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] mt-5" style={{ color: 'var(--p2-gray-400)' }}>
          Having trouble? Contact <a href="#" className="hover:underline" style={{ color: 'var(--p2-blue)' }}>support@portolanlabs.com</a>
        </p>
      </motion.div>
    </div>
  );
}
