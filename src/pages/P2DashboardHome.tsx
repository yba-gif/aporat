import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, AlertTriangle, CheckCircle, Clock, Eye, ArrowUpRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { StatCard } from '@/components/p2/StatCard';
import { ScoreCircle } from '@/components/p2/ScoreCircle';
import { StatusBadge } from '@/components/p2/StatusBadge';
import { RiskBadge } from '@/components/p2/RiskBadge';
import { DataTable, Column } from '@/components/p2/DataTable';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── Mock Data ──

const FLAG_MAP: Record<string, string> = {
  TR: '🇹🇷', IR: '🇮🇷', AF: '🇦🇫', SY: '🇸🇾', LB: '🇱🇧', MA: '🇲🇦',
  PK: '🇵🇰', NG: '🇳🇬', IQ: '🇮🇶', EG: '🇪🇬', IN: '🇮🇳', BD: '🇧🇩',
  SO: '🇸🇴', YE: '🇾🇪', TN: '🇹🇳', DZ: '🇩🇿', JO: '🇯🇴', UA: '🇺🇦',
  GE: '🇬🇪', AZ: '🇦🇿',
};

type CaseStatus = 'PENDING' | 'PROCESSING' | 'CLEARED' | 'FLAGGED' | 'DENIED';
type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface MockCase {
  id: string;
  name: string;
  nationality: string;
  nationalityCode: string;
  riskScore: number;
  risk: RiskLevel;
  status: CaseStatus;
  submitted: string;
  daysAgo: number;
}

function riskLevel(score: number): RiskLevel {
  if (score <= 25) return 'LOW';
  if (score <= 50) return 'MEDIUM';
  if (score <= 75) return 'HIGH';
  return 'CRITICAL';
}

const MOCK_CASES: MockCase[] = [
  { id: 'VIS-2026-1001', name: 'Mehmet Yıldırım', nationality: 'Turkey', nationalityCode: 'TR', riskScore: 18, risk: 'LOW', status: 'CLEARED', daysAgo: 0, submitted: 'Today' },
  { id: 'VIS-2026-1002', name: 'Ahmad Rezaei', nationality: 'Iran', nationalityCode: 'IR', riskScore: 87, risk: 'CRITICAL', status: 'FLAGGED', daysAgo: 0, submitted: 'Today' },
  { id: 'VIS-2026-1003', name: 'Fatima Ahmadi', nationality: 'Afghanistan', nationalityCode: 'AF', riskScore: 42, risk: 'MEDIUM', status: 'PROCESSING', daysAgo: 0, submitted: 'Today' },
  { id: 'VIS-2026-1004', name: 'Omar Al-Hassan', nationality: 'Syria', nationalityCode: 'SY', riskScore: 91, risk: 'CRITICAL', status: 'DENIED', daysAgo: 1, submitted: 'Yesterday' },
  { id: 'VIS-2026-1005', name: 'Rania Khoury', nationality: 'Lebanon', nationalityCode: 'LB', riskScore: 33, risk: 'MEDIUM', status: 'PENDING', daysAgo: 1, submitted: 'Yesterday' },
  { id: 'VIS-2026-1006', name: 'Youssef Benali', nationality: 'Morocco', nationalityCode: 'MA', riskScore: 22, risk: 'LOW', status: 'CLEARED', daysAgo: 1, submitted: 'Yesterday' },
  { id: 'VIS-2026-1007', name: 'Ayesha Malik', nationality: 'Pakistan', nationalityCode: 'PK', riskScore: 56, risk: 'HIGH', status: 'PROCESSING', daysAgo: 1, submitted: 'Yesterday' },
  { id: 'VIS-2026-1008', name: 'Chukwuma Obi', nationality: 'Nigeria', nationalityCode: 'NG', riskScore: 73, risk: 'HIGH', status: 'FLAGGED', daysAgo: 2, submitted: '2 days ago' },
  { id: 'VIS-2026-1009', name: 'Ali Al-Zubaidi', nationality: 'Iraq', nationalityCode: 'IQ', riskScore: 64, risk: 'HIGH', status: 'PENDING', daysAgo: 2, submitted: '2 days ago' },
  { id: 'VIS-2026-1010', name: 'Nour El-Din', nationality: 'Egypt', nationalityCode: 'EG', riskScore: 15, risk: 'LOW', status: 'CLEARED', daysAgo: 2, submitted: '2 days ago' },
  { id: 'VIS-2026-1011', name: 'Priya Sharma', nationality: 'India', nationalityCode: 'IN', riskScore: 28, risk: 'MEDIUM', status: 'CLEARED', daysAgo: 3, submitted: '3 days ago' },
  { id: 'VIS-2026-1012', name: 'Rahim Uddin', nationality: 'Bangladesh', nationalityCode: 'BD', riskScore: 45, risk: 'MEDIUM', status: 'PROCESSING', daysAgo: 3, submitted: '3 days ago' },
  { id: 'VIS-2026-1013', name: 'Abdi Mohamed', nationality: 'Somalia', nationalityCode: 'SO', riskScore: 82, risk: 'CRITICAL', status: 'FLAGGED', daysAgo: 3, submitted: '3 days ago' },
  { id: 'VIS-2026-1014', name: 'Saleh Al-Yemeni', nationality: 'Yemen', nationalityCode: 'YE', riskScore: 78, risk: 'CRITICAL', status: 'PENDING', daysAgo: 4, submitted: '4 days ago' },
  { id: 'VIS-2026-1015', name: 'Leila Trabelsi', nationality: 'Tunisia', nationalityCode: 'TN', riskScore: 12, risk: 'LOW', status: 'CLEARED', daysAgo: 4, submitted: '4 days ago' },
  { id: 'VIS-2026-1016', name: 'Karim Boudiaf', nationality: 'Algeria', nationalityCode: 'DZ', riskScore: 38, risk: 'MEDIUM', status: 'PROCESSING', daysAgo: 5, submitted: '5 days ago' },
  { id: 'VIS-2026-1017', name: 'Hala Nasser', nationality: 'Jordan', nationalityCode: 'JO', riskScore: 21, risk: 'LOW', status: 'CLEARED', daysAgo: 5, submitted: '5 days ago' },
  { id: 'VIS-2026-1018', name: 'Olena Kovalenko', nationality: 'Ukraine', nationalityCode: 'UA', riskScore: 10, risk: 'LOW', status: 'CLEARED', daysAgo: 5, submitted: '5 days ago' },
  { id: 'VIS-2026-1019', name: 'Giorgi Beridze', nationality: 'Georgia', nationalityCode: 'GE', riskScore: 52, risk: 'HIGH', status: 'PENDING', daysAgo: 6, submitted: '6 days ago' },
  { id: 'VIS-2026-1020', name: 'Elvin Mammadov', nationality: 'Azerbaijan', nationalityCode: 'AZ', riskScore: 95, risk: 'CRITICAL', status: 'DENIED', daysAgo: 6, submitted: '6 days ago' },
];

// Trend data generators
function generateTrendData(days: number) {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const base = 30 + Math.floor(Math.random() * 25);
    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      total: base,
      flagged: Math.floor(base * (0.1 + Math.random() * 0.15)),
    });
  }
  return data;
}

const TREND_7 = generateTrendData(7);
const TREND_30 = generateTrendData(30);
const TREND_90 = generateTrendData(90);

const RISK_DIST = [
  { name: 'Low Risk', value: 72, color: '#27AE60' },
  { name: 'Medium', value: 48, color: '#E67E22' },
  { name: 'High', value: 24, color: '#E74C3C' },
  { name: 'Critical', value: 12, color: '#C0392B' },
];
const TOTAL_CASES = RISK_DIST.reduce((s, r) => s + r.value, 0);

// ── Component ──

const columns: Column<MockCase>[] = [
  {
    key: 'name', label: 'Applicant', sortable: true,
    render: (row) => (
      <div className="flex items-center gap-2">
        <span className="text-base">{FLAG_MAP[row.nationalityCode] || '🏳️'}</span>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--p2-navy)' }}>{row.name}</p>
          <p className="text-[11px]" style={{ color: 'var(--p2-gray-400)' }}>{row.nationality}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'riskScore', label: 'Risk Score', sortable: true,
    render: (row) => <ScoreCircle score={row.riskScore} size="sm" />,
  },
  {
    key: 'risk', label: 'Level',
    render: (row) => <RiskBadge level={row.risk} size="sm" />,
  },
  {
    key: 'status', label: 'Status',
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: 'submitted', label: 'Submitted', sortable: true,
  },
  {
    key: 'id', label: '',
    render: (row) => (
      <Link to={`/p2/dashboard/cases/${row.id}`}>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Eye size={15} style={{ color: 'var(--p2-gray-400)' }} />
        </Button>
      </Link>
    ),
  },
];

export default function P2DashboardHome() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const trendData = period === '7d' ? TREND_7 : period === '90d' ? TREND_90 : TREND_30;

  const stats = [
    { icon: FileText, label: "Today's Applications", value: '47', delta: 12, variant: 'blue' as const },
    { icon: AlertTriangle, label: 'Flagged Cases', value: '8', delta: 3, variant: 'red' as const },
    { icon: CheckCircle, label: 'Cleared Today', value: '31', delta: -5, variant: 'green' as const },
    { icon: Clock, label: 'Pending Review', value: '14', delta: 0, variant: 'default' as const },
  ];

  return (
    <div className="space-y-6">
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4, ease: 'easeOut' }}
          >
            <StatCard icon={s.icon} label={s.label} value={s.value} delta={s.delta} variant={s.variant} />
          </motion.div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Application Trends - 60% */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="lg:col-span-3 p2-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--p2-navy)' }}>Application Trends</h2>
            <div className="flex rounded-md border overflow-hidden" style={{ borderColor: 'var(--p2-gray-200)' }}>
              {(['7d', '30d', '90d'] as const).map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={cn(
                    'px-3 py-1 text-xs font-medium transition-colors',
                    period === p
                      ? 'bg-[--p2-navy] text-white'
                      : 'bg-white text-[--p2-gray-500] hover:bg-[--p2-gray-50]'
                  )}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2980B9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2980B9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="flaggedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E74C3C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#E74C3C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false}
                interval={period === '90d' ? 13 : period === '30d' ? 4 : 0} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} width={30} />
              <ReTooltip
                contentStyle={{ background: '#0A1628', border: 'none', borderRadius: 6, fontSize: 12, color: '#fff' }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#94A3B8', marginBottom: 4 }}
              />
              <Area type="monotone" dataKey="total" stroke="#2980B9" strokeWidth={2} fill="url(#totalGrad)" name="Total" animationDuration={1200} />
              <Area type="monotone" dataKey="flagged" stroke="#E74C3C" strokeWidth={2} fill="url(#flaggedGrad)" name="Flagged" animationDuration={1400} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Risk Distribution - 40% */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="lg:col-span-2 p2-card p-5"
        >
          <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--p2-navy)' }}>Risk Distribution</h2>
          <div className="relative">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={RISK_DIST}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  animationBegin={600}
                  animationDuration={1000}
                >
                  {RISK_DIST.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <ReTooltip
                  contentStyle={{ background: '#0A1628', border: 'none', borderRadius: 6, fontSize: 12, color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: -10 }}>
              <span className="text-2xl font-bold" style={{ color: 'var(--p2-navy)' }}>{TOTAL_CASES}</span>
              <span className="text-[10px]" style={{ color: 'var(--p2-gray-400)' }}>cases</span>
            </div>
          </div>
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {RISK_DIST.map(r => (
              <div key={r.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: r.color }} />
                <span className="text-xs" style={{ color: 'var(--p2-gray-500)' }}>{r.name}</span>
                <span className="text-xs font-semibold ml-auto" style={{ color: 'var(--p2-gray-700)' }}>{r.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Recent Applications Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--p2-navy)' }}>Recent Applications</h2>
          <Link to="/p2/dashboard/queue" className="text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: 'var(--p2-blue)' }}>
            View All <ArrowUpRight size={12} />
          </Link>
        </div>
        <DataTable
          columns={columns}
          data={MOCK_CASES}
          searchPlaceholder="Search applicants..."
          onRowClick={(row) => console.log('Navigate to', row.id)}
        />
      </motion.div>
    </div>
  );
}
