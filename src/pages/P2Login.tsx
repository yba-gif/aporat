import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Building2, Loader2 } from 'lucide-react';
import { useP2Auth } from '@/contexts/P2AuthContext';
import '@/styles/p2.css';

export default function P2Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useP2Auth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  if (isAuthenticated) return <Navigate to="/p2/dashboard" replace />;

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Please enter a valid email address';
    if (!password || password.length < 8) e.password = 'Password must be at least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setTouched({ email: true, password: true });
    if (!validate()) return;
    setLoading(true);
    const ok = await login(email, password);
    if (ok) {
      navigate('/p2/auth/mfa');
    }
    setLoading(false);
  };

  return (
    <div className="p2 flex min-h-screen">
      {/* LEFT - Branding */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'var(--p2-navy)' }}>
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }} />

        <div className="relative z-10" />

        <div className="relative z-10">
          <h1 className="text-5xl font-bold tracking-tight">
            <span className="text-white">PORTOLAN</span>{' '}
            <span style={{ color: 'var(--p2-blue)' }}>LABS</span>
          </h1>
          <p className="mt-3 text-lg" style={{ color: 'var(--p2-gray-400)' }}>Visa Intelligence Platform</p>
        </div>

        <p className="relative z-10 text-xs" style={{ color: 'var(--p2-gray-500)' }}>
          Trusted by 12+ consulates across Europe
        </p>
      </div>

      {/* Mobile header */}
      <div className="lg:hidden w-full h-16 flex items-center px-5 fixed top-0 z-50"
        style={{ background: 'var(--p2-navy)' }}>
        <span className="font-bold text-sm tracking-wide text-white">PORTOLAN</span>
        <span className="font-bold text-sm tracking-wide ml-1.5" style={{ color: 'var(--p2-blue)' }}>LABS</span>
      </div>

      {/* RIGHT - Form */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full lg:w-[40%] flex items-center justify-center px-6 pt-24 pb-10 lg:pt-0 lg:pb-0"
        style={{ background: 'var(--p2-gray-50)' }}
      >
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--p2-navy)' }}>Welcome back</h1>
          <p className="text-sm mt-1 mb-8" style={{ color: 'var(--p2-gray-500)' }}>Sign in to your dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--p2-gray-600)' }}>Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--p2-gray-400)' }} />
                <input type="email" value={email}
                  onChange={e => { setEmail(e.target.value); if (touched.email) validate(); }}
                  onBlur={() => { setTouched(t => ({ ...t, email: true })); validate(); }}
                  placeholder="name@consulate.gov"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-md border bg-white focus:outline-none focus:ring-2 transition-colors"
                  style={{
                    borderColor: errors.email && touched.email ? 'var(--p2-red)' : 'var(--p2-gray-200)',
                    color: 'var(--p2-gray-800)',
                    ...(errors.email && touched.email ? {} : {}),
                  }}
                />
              </div>
              {errors.email && touched.email && <p className="text-xs mt-1" style={{ color: 'var(--p2-red)' }}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--p2-gray-600)' }}>Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--p2-gray-400)' }} />
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => { setPassword(e.target.value); if (touched.password) validate(); }}
                  onBlur={() => { setTouched(t => ({ ...t, password: true })); validate(); }}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-sm rounded-md border bg-white focus:outline-none focus:ring-2 transition-colors"
                  style={{
                    borderColor: errors.password && touched.password ? 'var(--p2-red)' : 'var(--p2-gray-200)',
                    color: 'var(--p2-gray-800)',
                  }}
                />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
                  style={{ color: 'var(--p2-gray-400)' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && touched.password && <p className="text-xs mt-1" style={{ color: 'var(--p2-red)' }}>{errors.password}</p>}
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border accent-[--p2-blue]"
                  style={{ borderColor: 'var(--p2-gray-300)' }} />
                <span className="text-xs" style={{ color: 'var(--p2-gray-600)' }}>Remember me</span>
              </label>
              <a href="#" className="text-xs font-medium hover:underline" style={{ color: 'var(--p2-blue)' }}>Forgot password?</a>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-md text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-70"
              style={{ background: 'var(--p2-navy)' }}>
              {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: 'var(--p2-gray-200)' }} />
            <span className="text-xs" style={{ color: 'var(--p2-gray-400)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--p2-gray-200)' }} />
          </div>

          {/* SSO */}
          <button className="w-full py-2.5 rounded-md text-sm font-medium border flex items-center justify-center gap-2 transition-colors hover:bg-[--p2-gray-100]"
            style={{ borderColor: 'var(--p2-gray-200)', color: 'var(--p2-gray-700)' }}>
            <Building2 size={16} />
            Sign in with SSO
          </button>

          {/* Footer link */}
          <p className="text-center text-xs mt-8" style={{ color: 'var(--p2-gray-400)' }}>
            Need a clearance certificate?{' '}
            <a href="/apply" className="font-medium hover:underline" style={{ color: 'var(--p2-blue)' }}>Apply here</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
