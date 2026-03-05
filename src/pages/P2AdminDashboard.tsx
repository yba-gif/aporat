import { motion } from 'framer-motion';
import {
  Activity, Users, Cpu, AlertTriangle, CheckCircle2, Clock,
  LogIn, Key, Settings, XCircle, Zap, Database, Brain, Eye, Globe, ShieldCheck,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { cn } from '@/lib/utils';

// ── Stat Card ──
function AdminStat({ label, value, sub, color, icon: Icon, delay }: {
  label: string; value: string; sub: string; color: string; icon: typeof Activity; delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="p2-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[--p2-gray-400]">{label}</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--p2-navy)' }}>{value}</p>
          <p className="text-[10px] mt-1" style={{ color }}>{sub}</p>
        </div>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `color-mix(in srgb, ${color} 12%, transparent)` }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
    </motion.div>
  );
}

// ── Mock Data: Response Times ──
const LATENCY_DATA = Array.from({ length: 24 }, (_, i) => {
  const base = 45 + Math.sin(i / 4) * 15;
  return {
    hour: `${String(i).padStart(2, '0')}:00`,
    p50: Math.round(base + Math.random() * 10),
    p95: Math.round(base * 2.5 + Math.random() * 30),
    p99: Math.round(base * 4 + Math.random() * 60),
  };
});

// ── Mock Data: Third-Party API Status ──
const API_STATUS = [
  { service: 'WorldCheck', status: 'Operational', latency: '142ms', lastCheck: '2 min ago', uptime: '99.98%' },
  { service: 'OpenSanctions', status: 'Operational', latency: '89ms', lastCheck: '1 min ago', uptime: '99.99%' },
  { service: 'Social Links', status: 'Degraded', latency: '892ms', lastCheck: '3 min ago', uptime: '98.7%' },
  { service: 'Onfido', status: 'Operational', latency: '234ms', lastCheck: '1 min ago', uptime: '99.95%' },
  { service: 'Neo4j', status: 'Operational', latency: '12ms', lastCheck: '30 sec ago', uptime: '99.99%' },
  { service: 'Claude API', status: 'Operational', latency: '1,240ms', lastCheck: '1 min ago', uptime: '99.92%' },
];

const STATUS_DOT: Record<string, { color: string; label: string }> = {
  Operational: { color: 'var(--p2-green)', label: 'Operational' },
  Degraded: { color: 'var(--p2-orange)', label: 'Degraded' },
  Down: { color: 'var(--p2-red)', label: 'Down' },
};

// ── Mock Data: Activity Log ──
const ACTIVITY_LOG = [
  { icon: LogIn, text: 'Ayşe Kaya logged in from Istanbul', time: '2 min ago', user: 'ayse.kaya' },
  { icon: Key, text: 'API key pk_live_••••7821 used for /v1/screen', time: '5 min ago', user: 'system' },
  { icon: Settings, text: 'Risk threshold updated: High 70→75', time: '12 min ago', user: 'admin' },
  { icon: XCircle, text: 'Error 504: Social Links API timeout', time: '18 min ago', user: 'system' },
  { icon: LogIn, text: 'Mehmet Yılmaz logged in from Ankara', time: '23 min ago', user: 'mehmet.y' },
  { icon: Zap, text: 'Express processing queue cleared (12 items)', time: '31 min ago', user: 'system' },
  { icon: Database, text: 'Database backup completed successfully', time: '1 hour ago', user: 'system' },
  { icon: Brain, text: 'AI model retrained on 2,400 new cases', time: '2 hours ago', user: 'system' },
  { icon: Eye, text: 'OSINT scan triggered for entity E-4921', time: '2 hours ago', user: 'ayse.kaya' },
  { icon: Globe, text: 'New consulate onboarded: Bern Embassy', time: '3 hours ago', user: 'admin' },
  { icon: ShieldCheck, text: 'Security audit completed — 0 findings', time: '4 hours ago', user: 'system' },
  { icon: Key, text: 'API key pk_live_••••3102 rotated', time: '5 hours ago', user: 'admin' },
];

export default function P2AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStat label="API Uptime" value="99.97%" sub="Last 30 days" color="var(--p2-green)" icon={Activity} delay={0} />
        <AdminStat label="Active Users" value="234" sub="Currently online" color="var(--p2-blue)" icon={Users} delay={0.05} />
        <AdminStat label="Requests Today" value="48,293" sub="+8% vs yesterday" color="#7C3AED" icon={Cpu} delay={0.1} />
        <AdminStat label="Error Rate" value="0.03%" sub="Below threshold" color="var(--p2-green)" icon={AlertTriangle} delay={0.15} />
      </div>

      {/* Response Times Chart */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="p2-card p-5">
        <h3 className="text-xs font-semibold text-[--p2-navy] mb-4">API Response Times (24h)</h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={LATENCY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--p2-gray-200)" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'var(--p2-gray-400)' }} interval={3} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--p2-gray-400)' }} unit="ms" width={50} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid var(--p2-gray-200)' }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="p50" stroke="var(--p2-blue)" strokeWidth={2} dot={false} name="p50" />
              <Line type="monotone" dataKey="p95" stroke="var(--p2-orange)" strokeWidth={2} dot={false} name="p95" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="p99" stroke="var(--p2-red)" strokeWidth={2} dot={false} name="p99" strokeDasharray="2 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Third-Party API Status */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="p2-card overflow-hidden">
        <div className="px-5 py-4 border-b border-[--p2-gray-200]">
          <h3 className="text-xs font-semibold text-[--p2-navy]">Third-Party API Status</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[--p2-gray-100] bg-[--p2-gray-50]">
                {['Service', 'Status', 'Latency', 'Last Check', 'Uptime (30d)'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[--p2-gray-400]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {API_STATUS.map((api, i) => {
                const st = STATUS_DOT[api.status];
                return (
                  <motion.tr key={api.service} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 + i * 0.03 }}
                    className="border-b border-[--p2-gray-100] hover:bg-[--p2-gray-50] transition-colors">
                    <td className="px-4 py-3 font-semibold text-[--p2-navy]">{api.service}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: st.color }} />
                        <span style={{ color: st.color }} className="font-medium">{st.label}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[--p2-gray-500] font-mono">{api.latency}</td>
                    <td className="px-4 py-3 text-[--p2-gray-500]">{api.lastCheck}</td>
                    <td className="px-4 py-3 text-[--p2-gray-500]">{api.uptime}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Activity Log */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="p2-card overflow-hidden">
        <div className="px-5 py-4 border-b border-[--p2-gray-200] flex items-center justify-between">
          <h3 className="text-xs font-semibold text-[--p2-navy]">Recent Activity Log</h3>
          <button className="text-[10px] font-medium text-purple-600 hover:underline">View Full Log</button>
        </div>
        <div className="max-h-[400px] overflow-y-auto divide-y divide-[--p2-gray-100]">
          {ACTIVITY_LOG.map((event, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 + i * 0.02 }}
              className="flex items-start gap-3 px-5 py-3 hover:bg-[--p2-gray-50] transition-colors">
              <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background: event.icon === XCircle ? 'rgba(192,57,43,0.08)' : 'rgba(124,58,237,0.08)',
                }}>
                <event.icon size={13} style={{
                  color: event.icon === XCircle ? 'var(--p2-red)' : '#7C3AED',
                }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-[--p2-gray-700]">{event.text}</p>
                <p className="text-[10px] text-[--p2-gray-400] mt-0.5">{event.time} · <span className="font-mono">{event.user}</span></p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
