import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Wifi, Layers, ChevronDown, ChevronUp, AlertTriangle,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { cn } from '@/lib/utils';

// ── Gauge ──
function Gauge({ label, value, max, unit, color }: { label: string; value: number; max: number; unit?: string; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  const warn = pct > 80;
  const crit = pct > 95;
  const ringColor = crit ? 'var(--p2-red)' : warn ? 'var(--p2-orange)' : color;
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p2-card p-5 flex flex-col items-center">
      <div className="relative w-24 h-24 mb-3">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--p2-gray-100)" strokeWidth="8" />
          <motion.circle cx="50" cy="50" r="40" fill="none" stroke={ringColor} strokeWidth="8"
            strokeLinecap="round" strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-[--p2-navy]">{value.toLocaleString()}</span>
          {unit && <span className="text-[8px] text-[--p2-gray-400] -mt-0.5">{unit}</span>}
        </div>
      </div>
      <p className="text-[10px] font-semibold text-[--p2-navy] text-center">{label}</p>
      <p className="text-[9px] text-[--p2-gray-400]">of {max.toLocaleString()} limit</p>
    </motion.div>
  );
}

// ── Mock: Request Volume ──
const VOLUME_DATA = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  consulate: Math.round(200 + Math.sin(i / 3) * 120 + Math.random() * 40),
  clearance: Math.round(80 + Math.sin(i / 4) * 50 + Math.random() * 20),
  auth: Math.round(40 + Math.cos(i / 5) * 25 + Math.random() * 10),
}));

// ── Mock: Error Log ──
type Severity = 'critical' | 'error' | 'warning';
const SEV_STYLE: Record<Severity, { color: string; bg: string }> = {
  critical: { color: 'var(--p2-red)', bg: 'rgba(192,57,43,0.08)' },
  error: { color: 'var(--p2-orange)', bg: 'rgba(230,126,34,0.08)' },
  warning: { color: '#D97706', bg: 'rgba(217,119,6,0.08)' },
};

const ERRORS: { id: string; time: string; endpoint: string; status: number; message: string; severity: Severity; detail: string }[] = [
  { id: 'e1', time: '14:32:18', endpoint: '/v1/clearance/screen', status: 504, message: 'Gateway timeout from WorldCheck', severity: 'critical', detail: 'WorldCheck API did not respond within 30s timeout. 3 retries attempted. Fallback to cached sanctions list.' },
  { id: 'e2', time: '14:28:41', endpoint: '/v1/consulate/cases', status: 500, message: 'Internal server error in graph traversal', severity: 'error', detail: 'Neo4j query exceeded memory limit during 4-hop relationship expansion for entity E-4921.' },
  { id: 'e3', time: '14:15:09', endpoint: '/v1/auth/refresh', status: 429, message: 'Rate limit exceeded for key pk_live_••••7821', severity: 'warning', detail: 'Ankara HQ API key exceeded 1000 req/min limit. Throttled for 60 seconds.' },
  { id: 'e4', time: '13:58:33', endpoint: '/v1/clearance/verify', status: 404, message: 'Certificate CLR-0000-99999 not found', severity: 'warning', detail: 'Public verification endpoint queried with non-existent certificate ID.' },
  { id: 'e5', time: '13:42:17', endpoint: '/v1/consulate/upload', status: 413, message: 'File size exceeds 10MB limit', severity: 'warning', detail: 'Istanbul consulate attempted to upload 24MB passport scan.' },
  { id: 'e6', time: '13:21:55', endpoint: '/v1/clearance/screen', status: 502, message: 'Bad gateway from Onfido', severity: 'error', detail: 'Onfido identity verification service returned malformed JSON response.' },
  { id: 'e7', time: '12:58:12', endpoint: '/v1/consulate/analytics', status: 500, message: 'Aggregation query timeout', severity: 'error', detail: 'Monthly aggregation query on 48K+ rows exceeded 15s execution limit.' },
  { id: 'e8', time: '12:34:48', endpoint: '/v1/auth/login', status: 401, message: 'Invalid credentials (5th attempt)', severity: 'warning', detail: 'User mehmet.y@mfa.gov.tr failed authentication 5 times. Account locked for 30 min.' },
  { id: 'e9', time: '12:12:30', endpoint: '/v1/clearance/screen', status: 504, message: 'Claude API timeout', severity: 'error', detail: 'AI risk analysis model timed out processing application CLR-2026-4890.' },
  { id: 'e10', time: '11:48:55', endpoint: '/v1/consulate/webhook', status: 500, message: 'Webhook delivery failed to vizesepetim', severity: 'error', detail: 'Target endpoint returned 503. Will retry 3 more times.' },
  { id: 'e11', time: '11:21:09', endpoint: '/v1/clearance/ocr', status: 422, message: 'Unprocessable document format', severity: 'warning', detail: 'HEIC image format not supported for OCR processing.' },
  { id: 'e12', time: '11:02:33', endpoint: '/v1/auth/mfa', status: 400, message: 'Invalid MFA code', severity: 'warning', detail: 'TOTP code expired or incorrect for user elif.d@mfa.gov.tr.' },
  { id: 'e13', time: '10:44:18', endpoint: '/v1/consulate/export', status: 500, message: 'PDF generation OOM', severity: 'critical', detail: 'PDF report generator ran out of memory on 200-page compliance report.' },
  { id: 'e14', time: '10:21:42', endpoint: '/v1/clearance/screen', status: 503, message: 'OpenSanctions API maintenance', severity: 'error', detail: 'Scheduled maintenance window. Fallback to local snapshot (2h old).' },
  { id: 'e15', time: '09:58:11', endpoint: '/v1/consulate/cases', status: 400, message: 'Invalid date range filter', severity: 'warning', detail: 'Client sent end_date before start_date in query parameters.' },
  { id: 'e16', time: '09:32:28', endpoint: '/v1/auth/session', status: 401, message: 'Expired JWT token', severity: 'warning', detail: 'Session token expired 12 minutes ago. Client needs refresh.' },
  { id: 'e17', time: '09:11:45', endpoint: '/v1/clearance/verify', status: 429, message: 'Public verification rate limited', severity: 'warning', detail: 'IP 85.107.xx.xx exceeded 30 req/min on public verification endpoint.' },
  { id: 'e18', time: '08:48:03', endpoint: '/v1/consulate/graph', status: 500, message: 'Graph rendering timeout', severity: 'error', detail: 'Force-directed layout calculation exceeded 10s for graph with 340 nodes.' },
  { id: 'e19', time: '08:22:17', endpoint: '/v1/clearance/screen', status: 502, message: 'Social Links API error', severity: 'error', detail: 'Social media OSINT provider returned HTTP 502 during profile enrichment.' },
  { id: 'e20', time: '08:01:55', endpoint: '/v1/auth/login', status: 403, message: 'Suspended account login attempt', severity: 'warning', detail: 'Suspended user ali.s@mfa.gov.tr attempted login from new IP.' },
];

// ── Mock: Rate Limiting ──
const RATE_KEYS = [
  { name: 'pk_live_••••7821', owner: 'Ankara HQ', today: 18420, limit: 20000 },
  { name: 'pk_live_••••3401', owner: 'Istanbul', today: 19200, limit: 20000 },
  { name: 'pk_live_••••9102', owner: 'Berlin Embassy', today: 8340, limit: 10000 },
  { name: 'pk_live_••••5543', owner: 'London Embassy', today: 7120, limit: 10000 },
  { name: 'pk_live_••••2210', owner: 'Paris Embassy', today: 4890, limit: 10000 },
  { name: 'pk_live_••••8877', owner: 'Vienna Consulate', today: 1420, limit: 5000 },
  { name: 'pk_live_••••6634', owner: 'Rome Embassy', today: 2100, limit: 5000 },
  { name: 'pk_live_••••4421', owner: 'Madrid Embassy', today: 980, limit: 5000 },
];

export default function P2AdminApi() {
  const [expandedError, setExpandedError] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-lg font-bold text-[--p2-navy]">API Monitoring</h1>
        <p className="text-xs text-[--p2-gray-400]">Real-time system metrics and diagnostics</p>
      </motion.div>

      {/* Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Gauge label="Requests / Minute" value={847} max={2000} unit="req/min" color="#7C3AED" />
        <Gauge label="Concurrent Connections" value={156} max={500} unit="conn" color="var(--p2-blue)" />
        <Gauge label="Queue Depth" value={23} max={200} unit="items" color="var(--p2-green)" />
      </div>

      {/* Request Volume */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="p2-card p-5">
        <h3 className="text-xs font-semibold text-[--p2-navy] mb-4">Request Volume (24h)</h3>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={VOLUME_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--p2-gray-200)" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'var(--p2-gray-400)' }} interval={3} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--p2-gray-400)' }} width={40} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid var(--p2-gray-200)' }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Area type="monotone" dataKey="consulate" stackId="1" stroke="var(--p2-blue)" fill="var(--p2-blue)" fillOpacity={0.15} name="/consulate/*" />
              <Area type="monotone" dataKey="clearance" stackId="1" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.15} name="/clearance/*" />
              <Area type="monotone" dataKey="auth" stackId="1" stroke="var(--p2-green)" fill="var(--p2-green)" fillOpacity={0.15} name="/auth/*" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Error Log */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="p2-card overflow-hidden">
        <div className="px-5 py-4 border-b border-[--p2-gray-200] flex items-center justify-between">
          <h3 className="text-xs font-semibold text-[--p2-navy]">Error Log</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[--p2-red]/10 text-[--p2-red]">{ERRORS.length} errors today</span>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {ERRORS.map(e => {
            const sv = SEV_STYLE[e.severity];
            const expanded = expandedError === e.id;
            return (
              <div key={e.id} className="border-b border-[--p2-gray-100]">
                <button onClick={() => setExpandedError(expanded ? null : e.id)}
                  className="w-full text-left px-5 py-3 hover:bg-[--p2-gray-50] transition-colors flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sv.color }} />
                  <span className="text-[10px] text-[--p2-gray-400] font-mono w-16 flex-shrink-0">{e.time}</span>
                  <span className="text-[10px] font-mono text-[--p2-gray-500] w-44 truncate flex-shrink-0">{e.endpoint}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ color: sv.color, background: sv.bg }}>{e.status}</span>
                  <span className="text-[11px] text-[--p2-gray-600] flex-1 truncate">{e.message}</span>
                  {expanded ? <ChevronUp size={12} className="text-[--p2-gray-400] flex-shrink-0" /> : <ChevronDown size={12} className="text-[--p2-gray-400] flex-shrink-0" />}
                </button>
                <AnimatePresence>
                  {expanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="px-5 pb-3 pl-12">
                        <p className="text-[11px] text-[--p2-gray-600] leading-relaxed p-3 rounded-lg bg-[--p2-gray-50] border border-[--p2-gray-100]">{e.detail}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Rate Limiting */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="p2-card overflow-hidden">
        <div className="px-5 py-4 border-b border-[--p2-gray-200]">
          <h3 className="text-xs font-semibold text-[--p2-navy]">Rate Limiting</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[--p2-gray-100] bg-[--p2-gray-50]">
                {['API Key', 'Owner', 'Requests Today', 'Limit', 'Usage', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[--p2-gray-400]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RATE_KEYS.map((k, i) => {
                const pct = Math.round((k.today / k.limit) * 100);
                const warn = pct > 80;
                const crit = pct > 95;
                const barColor = crit ? 'var(--p2-red)' : warn ? 'var(--p2-orange)' : 'var(--p2-blue)';
                return (
                  <motion.tr key={k.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.03 }}
                    className="border-b border-[--p2-gray-100] hover:bg-[--p2-gray-50] transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-[--p2-navy]">{k.name}</td>
                    <td className="px-4 py-3 text-[--p2-gray-600]">{k.owner}</td>
                    <td className="px-4 py-3 text-[--p2-gray-600]">{k.today.toLocaleString()}</td>
                    <td className="px-4 py-3 text-[--p2-gray-500]">{k.limit.toLocaleString()}</td>
                    <td className="px-4 py-3 w-48">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-[--p2-gray-100] rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.5 + i * 0.05 }}
                            className="h-full rounded-full" style={{ background: barColor }} />
                        </div>
                        <span className={cn('text-[10px] font-bold w-10 text-right', crit ? 'text-[--p2-red]' : warn ? 'text-[--p2-orange]' : 'text-[--p2-gray-500]')}>{pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {(warn || crit) && <AlertTriangle size={13} style={{ color: crit ? 'var(--p2-red)' : 'var(--p2-orange)' }} />}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
