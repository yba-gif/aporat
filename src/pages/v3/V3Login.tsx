import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function V3Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const fillDemo = () => {
    setEmail('officer.yilmaz@portolan.gov.tr');
    setPassword('classified-demo-2026');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => navigate('/v3/dashboard'), 600);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center v3-grid-bg"
      style={{ background: 'var(--v3-bg)' }}
    >
      <div className="w-full max-w-sm">
        <form
          onSubmit={handleSubmit}
          className="border rounded-md p-8"
          style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
        >
          {/* Wordmark */}
          <div className="text-center mb-8">
            <h1 className="text-lg font-bold tracking-[0.3em]" style={{ color: 'var(--v3-text)' }}>
              PORTOLAN LABS
            </h1>
            <p className="text-xs mt-1 tracking-wider" style={{ color: 'var(--v3-text-muted)' }}>
              Intelligence Platform
            </p>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-[11px] font-semibold mb-1.5 tracking-wide" style={{ color: 'var(--v3-text-secondary)' }}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-md border text-sm outline-none transition-colors"
              style={{
                background: 'var(--v3-bg)',
                borderColor: 'var(--v3-border)',
                color: 'var(--v3-text)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--v3-accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--v3-border)'}
              placeholder="operator@portolan.gov.tr"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-[11px] font-semibold mb-1.5 tracking-wide" style={{ color: 'var(--v3-text-secondary)' }}>
              PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 rounded-md border text-sm outline-none transition-colors"
                style={{
                  background: 'var(--v3-bg)',
                  borderColor: 'var(--v3-border)',
                  color: 'var(--v3-text)',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--v3-accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--v3-border)'}
                placeholder="••••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--v3-text-muted)' }}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-md text-sm font-semibold transition-all duration-150 disabled:opacity-60"
            style={{ background: 'var(--v3-accent)', color: 'var(--v3-text-dark)' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>

          {/* Demo toggle */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={fillDemo}
              className="text-xs transition-colors hover:underline"
              style={{ color: 'var(--v3-text-muted)' }}
            >
              Use demo credentials
            </button>
          </div>
        </form>

        <p className="text-center mt-4 text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>
          Classified system. Unauthorized access is a criminal offense.
        </p>
      </div>
    </div>
  );
}
