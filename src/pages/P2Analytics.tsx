import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';
import {
  FileText, Clock, CheckCircle, AlertTriangle, Download, CalendarIcon,
  TrendingUp, TrendingDown,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { StatCard } from '@/components/p2/StatCard';
import { cn } from '@/lib/utils';

// ── Seed-based pseudo-random ──
function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

// ── Generate 30 days of daily data ──
const rand = seededRandom(42);
const DAILY_DATA = Array.from({ length: 30 }, (_, i) => {
  const date = subDays(new Date('2026-03-05'), 29 - i);
  const base = 30 + Math.floor(rand() * 25);
  const flagged = Math.floor(base * (0.08 + rand() * 0.15));
  return {
    date: format(date, 'MMM d'),
    fullDate: format(date, 'yyyy-MM-dd'),
    applications: base,
    flagged,
    approved: Math.floor(base * (0.7 + rand() * 0.15)),
    denied: Math.floor(base * (0.05 + rand() * 0.1)),
  };
});

// 7-day moving average
const DAILY_WITH_MA = DAILY_DATA.map((d, i) => {
  const window = DAILY_DATA.slice(Math.max(0, i - 6), i + 1);
  const ma = window.reduce((s, v) => s + v.applications, 0) / window.length;
  return { ...d, ma: Math.round(ma * 10) / 10 };
});

// ── Risk histogram ──
const RISK_HISTOGRAM = Array.from({ length: 10 }, (_, i) => {
  const lo = i * 10;
  const hi = lo + 10;
  const r = seededRandom(i + 100);
  const count = i < 3 ? 30 + Math.floor(r() * 40) : i < 6 ? 15 + Math.floor(r() * 25) : 5 + Math.floor(r() * 15);
  return { bin: `${lo}-${hi}`, count, lo };
});

function histoColor(lo: number) {
  if (lo < 30) return 'var(--p2-green)';
  if (lo < 60) return 'var(--p2-orange)';
  return 'var(--p2-red)';
}

// ── Funnel ──
const FUNNEL = [
  { stage: 'Applications Received', count: 1247, pct: 100 },
  { stage: 'Screening Complete', count: 1189, pct: 95.3 },
  { stage: 'Flagged for Review', count: 234, pct: 18.8 },
  { stage: 'Officer Reviewed', count: 198, pct: 15.9 },
  { stage: 'Approved', count: 978, pct: 78.4 },
  { stage: 'Denied', count: 127, pct: 10.2 },
];

// ── Top nationalities ──
const TOP_NATIONALITIES = [
  { country: '🇮🇷 Iran', count: 187, avgRisk: 62 },
  { country: '🇸🇾 Syria', count: 156, avgRisk: 58 },
  { country: '🇦🇫 Afghanistan', count: 134, avgRisk: 55 },
  { country: '🇮🇶 Iraq', count: 121, avgRisk: 52 },
  { country: '🇵🇰 Pakistan', count: 98, avgRisk: 41 },
  { country: '🇱🇧 Lebanon', count: 87, avgRisk: 45 },
  { country: '🇳🇬 Nigeria', count: 76, avgRisk: 38 },
  { country: '🇲🇦 Morocco', count: 64, avgRisk: 28 },
  { country: '🇪🇬 Egypt', count: 58, avgRisk: 24 },
  { country: '🇹🇳 Tunisia', count: 42, avgRisk: 22 },
];

// ── Agency risk ranking ──
const AGENCIES = [
  { rank: 1, name: 'Tehran Consulate', apps: 187, flaggedPct: 24.1, avgScore: 62, level: 'High' as const, trend: [45, 52, 60, 58, 62] },
  { rank: 2, name: 'Damascus Consulate', apps: 156, flaggedPct: 21.8, avgScore: 58, level: 'High' as const, trend: [40, 48, 55, 53, 58] },
  { rank: 3, name: 'Kabul Consulate', apps: 134, flaggedPct: 19.4, avgScore: 55, level: 'Medium' as const, trend: [50, 52, 54, 53, 55] },
  { rank: 4, name: 'Baghdad Consulate', apps: 121, flaggedPct: 17.4, avgScore: 52, level: 'Medium' as const, trend: [48, 50, 51, 50, 52] },
  { rank: 5, name: 'Islamabad Consulate', apps: 98, flaggedPct: 12.2, avgScore: 41, level: 'Medium' as const, trend: [38, 40, 42, 41, 41] },
  { rank: 6, name: 'Beirut Consulate', apps: 87, flaggedPct: 14.9, avgScore: 45, level: 'Medium' as const, trend: [42, 43, 44, 45, 45] },
  { rank: 7, name: 'Lagos Consulate', apps: 76, flaggedPct: 10.5, avgScore: 38, level: 'Low' as const, trend: [35, 36, 37, 38, 38] },
  { rank: 8, name: 'Rabat Consulate', apps: 64, flaggedPct: 6.3, avgScore: 28, level: 'Low' as const, trend: [30, 29, 28, 28, 28] },
];

const LEVEL_STYLES: Record<string, string> = {
  High: 'bg-[--p2-red]/10 text-[--p2-red]',
  Medium: 'bg-[--p2-orange]/10 text-[--p2-orange]',
  Low: 'bg-[--p2-green]/10 text-[--p2-green]',
};

// ── Heatmap data ──
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const heatRand = seededRandom(777);
const HEATMAP = DAYS.map(day =>
  Array.from({ length: 24 }, (_, h) => {
    const isWeekend = day === 'Sat' || day === 'Sun';
    const isWorkHours = h >= 8 && h <= 18;
    const base = isWeekend ? (isWorkHours ? 5 : 1) : (isWorkHours ? 12 + Math.floor(heatRand() * 18) : 1 + Math.floor(heatRand() * 5));
    return { day, hour: h, value: base };
  })
);
const maxHeat = Math.max(...HEATMAP.flat().map(h => h.value));

// ── Denial reasons ──
const DENIAL_REASONS = [
  { name: 'Sanctions Hit', value: 38, color: 'var(--p2-red)' },
  { name: 'Identity Issues', value: 27, color: 'var(--p2-orange)' },
  { name: 'Incomplete Docs', value: 24, color: 'var(--p2-blue)' },
  { name: 'Risk Threshold', value: 22, color: '#8B5CF6' },
  { name: 'Other', value: 16, color: 'var(--p2-gray-400)' },
];

// ── Animation wrapper ──
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}>
      {children}
    </motion.div>
  );
}

// ── Sparkline ──
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 60;
  const h = 20;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} />
    </svg>
  );
}

// ── Main component ──
export default function P2Analytics() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date('2026-03-05'), 30),
    to: new Date('2026-03-05'),
  });
  const [volumeGroup, setVolumeGroup] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [agencySort, setAgencySort] = useState<{ col: string; asc: boolean }>({ col: 'avgScore', asc: false });

  // Grouped volume data
  const volumeData = useMemo(() => {
    if (volumeGroup === 'daily') return DAILY_WITH_MA;
    if (volumeGroup === 'weekly') {
      const weeks: typeof DAILY_WITH_MA = [];
      for (let i = 0; i < DAILY_WITH_MA.length; i += 7) {
        const chunk = DAILY_WITH_MA.slice(i, i + 7);
        weeks.push({
          ...chunk[0],
          date: `W${Math.floor(i / 7) + 1}`,
          applications: chunk.reduce((s, c) => s + c.applications, 0),
          ma: chunk.reduce((s, c) => s + c.ma, 0) / chunk.length,
          flagged: chunk.reduce((s, c) => s + c.flagged, 0),
          approved: chunk.reduce((s, c) => s + c.approved, 0),
          denied: chunk.reduce((s, c) => s + c.denied, 0),
        });
      }
      return weeks;
    }
    // monthly – just return all as one
    return [{
      ...DAILY_WITH_MA[0],
      date: 'Mar 2026',
      applications: DAILY_WITH_MA.reduce((s, c) => s + c.applications, 0),
      ma: DAILY_WITH_MA.reduce((s, c) => s + c.ma, 0) / DAILY_WITH_MA.length,
      flagged: DAILY_WITH_MA.reduce((s, c) => s + c.flagged, 0),
      approved: DAILY_WITH_MA.reduce((s, c) => s + c.approved, 0),
      denied: DAILY_WITH_MA.reduce((s, c) => s + c.denied, 0),
    }];
  }, [volumeGroup]);

  const sortedAgencies = useMemo(() => {
    return [...AGENCIES].sort((a, b) => {
      const key = agencySort.col as keyof typeof a;
      const av = a[key] as number;
      const bv = b[key] as number;
      return agencySort.asc ? av - bv : bv - av;
    });
  }, [agencySort]);

  const toggleSort = (col: string) => {
    setAgencySort(prev => prev.col === col ? { col, asc: !prev.asc } : { col, asc: false });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-[--p2-navy]">Analytics</h1>
            <p className="text-xs text-[--p2-gray-400]">Insights and trends across all consular operations</p>
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5">
                  <CalendarIcon size={13} />
                  {format(dateRange.from, 'MMM d')} – {format(dateRange.to, 'MMM d, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => { if (range?.from && range?.to) setDateRange({ from: range.from, to: range.to }); }}
                  className="p-3 pointer-events-auto"
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Button size="sm" className="h-8 text-xs gap-1.5 bg-[--p2-navy] hover:bg-[--p2-navy]/90 text-white">
              <Download size={13} /> Export Report
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* ROW 1: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: FileText, label: 'Total Applications', value: '1,247', delta: 18, variant: 'blue' as const },
          { icon: Clock, label: 'Avg Processing Time', value: '36h', delta: -12, variant: 'default' as const },
          { icon: CheckCircle, label: 'Approval Rate', value: '78.4%', delta: 2.1, variant: 'green' as const },
          { icon: AlertTriangle, label: 'High Risk Flagged', value: '12.3%', delta: -0.8, variant: 'red' as const },
        ].map((kpi, i) => (
          <FadeIn key={kpi.label} delay={i * 0.08}>
            <StatCard {...kpi} />
          </FadeIn>
        ))}
      </div>

      {/* ROW 2: Volume + Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Application Volume */}
        <FadeIn delay={0.1}>
          <div className="p2-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-[--p2-navy]">Application Volume</h3>
              <div className="flex bg-[--p2-gray-100] rounded-md p-0.5">
                {(['daily', 'weekly', 'monthly'] as const).map(g => (
                  <button key={g} onClick={() => setVolumeGroup(g)}
                    className={cn('px-2.5 py-1 rounded text-[10px] font-medium capitalize transition-all',
                      volumeGroup === g ? 'bg-white text-[--p2-navy] shadow-sm' : 'text-[--p2-gray-500]')}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--p2-gray-100)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--p2-gray-400)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--p2-gray-400)' }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid var(--p2-gray-200)' }} />
                <Bar dataKey="applications" fill="var(--p2-blue)" radius={[3, 3, 0, 0]} name="Applications" />
                <Line dataKey="ma" stroke="var(--p2-orange)" strokeDasharray="6 3" strokeWidth={2} dot={false} name="7d Avg" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </FadeIn>

        {/* Risk Score Distribution */}
        <FadeIn delay={0.15}>
          <div className="p2-card p-5">
            <h3 className="text-xs font-semibold text-[--p2-navy] mb-4">Risk Score Distribution</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={RISK_HISTOGRAM}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--p2-gray-100)" />
                <XAxis dataKey="bin" tick={{ fontSize: 9, fill: 'var(--p2-gray-400)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--p2-gray-400)' }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid var(--p2-gray-200)' }} />
                <Bar dataKey="count" name="Cases" radius={[3, 3, 0, 0]}>
                  {RISK_HISTOGRAM.map((entry, i) => (
                    <Cell key={i} fill={histoColor(entry.lo)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </FadeIn>
      </div>

      {/* ROW 3: Funnel + Top Nationalities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Processing Funnel */}
        <FadeIn delay={0.2}>
          <div className="p2-card p-5">
            <h3 className="text-xs font-semibold text-[--p2-navy] mb-4">Processing Funnel</h3>
            <div className="space-y-2.5">
              {FUNNEL.map((f, i) => {
                const widthPct = Math.max(15, (f.count / FUNNEL[0].count) * 100);
                const opacity = 0.3 + (i / FUNNEL.length) * 0.7;
                return (
                  <motion.div key={f.stage} initial={{ width: 0, opacity: 0 }} animate={{ width: '100%', opacity: 1 }} transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-medium text-[--p2-navy]">{f.stage}</span>
                          <span className="text-[11px] text-[--p2-gray-500]">{f.count.toLocaleString()} ({f.pct}%)</span>
                        </div>
                        <div className="w-full h-7 bg-[--p2-gray-50] rounded-md overflow-hidden">
                          <motion.div
                            className="h-full rounded-md"
                            style={{ background: `var(--p2-navy)`, opacity }}
                            initial={{ width: 0 }}
                            animate={{ width: `${widthPct}%` }}
                            transition={{ delay: 0.4 + i * 0.08, duration: 0.6 }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </FadeIn>

        {/* Top Nationalities */}
        <FadeIn delay={0.25}>
          <div className="p2-card p-5">
            <h3 className="text-xs font-semibold text-[--p2-navy] mb-4">Top Nationalities</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={TOP_NATIONALITIES} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--p2-gray-100)" />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--p2-gray-400)' }} />
                <YAxis dataKey="country" type="category" tick={{ fontSize: 10, fill: 'var(--p2-gray-500)' }} width={100} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid var(--p2-gray-200)' }} />
                <Bar dataKey="count" name="Applications" radius={[0, 3, 3, 0]}>
                  {TOP_NATIONALITIES.map((entry, i) => (
                    <Cell key={i} fill={entry.avgRisk > 50 ? 'var(--p2-red)' : entry.avgRisk > 35 ? 'var(--p2-orange)' : 'var(--p2-blue)'} opacity={0.5 + (entry.avgRisk / 100) * 0.5} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </FadeIn>
      </div>

      {/* ROW 4: Agency Risk Ranking */}
      <FadeIn delay={0.3}>
        <div className="p2-card overflow-hidden">
          <div className="px-5 py-4 border-b border-[--p2-gray-200]">
            <h3 className="text-xs font-semibold text-[--p2-navy]">Agency Risk Ranking</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[--p2-gray-100] bg-[--p2-gray-50]">
                  {[
                    { key: 'rank', label: 'Rank' },
                    { key: 'name', label: 'Source Agency' },
                    { key: 'apps', label: 'Applications' },
                    { key: 'flaggedPct', label: 'Flagged %' },
                    { key: 'avgScore', label: 'Avg Score' },
                    { key: 'level', label: 'Risk Level' },
                    { key: 'trend', label: 'Trend' },
                  ].map(col => (
                    <th key={col.key} onClick={() => col.key !== 'trend' && col.key !== 'level' && toggleSort(col.key)}
                      className={cn('px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[--p2-gray-400]',
                        col.key !== 'trend' && col.key !== 'level' && 'cursor-pointer hover:text-[--p2-navy]',
                        agencySort.col === col.key && 'text-[--p2-navy]')}>
                      {col.label}
                      {agencySort.col === col.key && (
                        <span className="ml-1">{agencySort.asc ? '↑' : '↓'}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedAgencies.map((a, i) => (
                  <motion.tr key={a.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 + i * 0.04 }}
                    className="border-b border-[--p2-gray-100] hover:bg-[--p2-gray-50] transition-colors">
                    <td className="px-4 py-3 font-medium text-[--p2-gray-400]">{a.rank}</td>
                    <td className="px-4 py-3 font-semibold text-[--p2-navy]">{a.name}</td>
                    <td className="px-4 py-3 text-[--p2-gray-600]">{a.apps}</td>
                    <td className="px-4 py-3 text-[--p2-gray-600]">{a.flaggedPct}%</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold" style={{ color: a.avgScore > 50 ? 'var(--p2-red)' : a.avgScore > 35 ? 'var(--p2-orange)' : 'var(--p2-green)' }}>
                        {a.avgScore}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', LEVEL_STYLES[a.level])}>{a.level}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Sparkline data={a.trend} color={a.avgScore > 50 ? 'var(--p2-red)' : a.avgScore > 35 ? 'var(--p2-orange)' : 'var(--p2-green)'} />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FadeIn>

      {/* ROW 5: Heatmap + Denial Reasons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Heatmap */}
        <FadeIn delay={0.35}>
          <div className="p2-card p-5">
            <h3 className="text-xs font-semibold text-[--p2-navy] mb-4">Applications by Day & Hour</h3>
            <div className="overflow-x-auto">
              <div className="min-w-[500px]">
                {/* Hour labels */}
                <div className="flex ml-10 mb-1">
                  {Array.from({ length: 24 }, (_, h) => (
                    <div key={h} className="flex-1 text-center text-[8px] text-[--p2-gray-400]">
                      {h % 3 === 0 ? `${h}` : ''}
                    </div>
                  ))}
                </div>
                {HEATMAP.map((row, di) => (
                  <div key={DAYS[di]} className="flex items-center gap-1 mb-[2px]">
                    <span className="w-9 text-right text-[10px] text-[--p2-gray-500] font-medium pr-1">{DAYS[di]}</span>
                    {row.map((cell, hi) => {
                      const intensity = cell.value / maxHeat;
                      return (
                        <div
                          key={hi}
                          className="flex-1 aspect-square rounded-[2px] relative group cursor-pointer"
                          style={{
                            background: `color-mix(in srgb, var(--p2-navy) ${Math.round(intensity * 100)}%, var(--p2-gray-50))`,
                          }}
                        >
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-20 whitespace-nowrap">
                            <div className="p2-card px-2 py-1 text-[9px] shadow-lg">
                              {cell.day} {String(cell.hour).padStart(2, '0')}:00 — {cell.value} apps
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
                {/* Scale */}
                <div className="flex items-center gap-2 mt-3 ml-10">
                  <span className="text-[9px] text-[--p2-gray-400]">Less</span>
                  <div className="flex gap-[2px]">
                    {[0.1, 0.3, 0.5, 0.7, 0.9].map(v => (
                      <div key={v} className="w-3 h-3 rounded-[2px]" style={{ background: `color-mix(in srgb, var(--p2-navy) ${Math.round(v * 100)}%, var(--p2-gray-50))` }} />
                    ))}
                  </div>
                  <span className="text-[9px] text-[--p2-gray-400]">More</span>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Denial Reasons */}
        <FadeIn delay={0.4}>
          <div className="p2-card p-5">
            <h3 className="text-xs font-semibold text-[--p2-navy] mb-4">Denial Reasons</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={DENIAL_REASONS}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={45}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: 'var(--p2-gray-300)', strokeWidth: 1 }}
                  animationDuration={800}
                  animationBegin={400}
                >
                  {DENIAL_REASONS.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid var(--p2-gray-200)' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {DENIAL_REASONS.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-[10px] text-[--p2-gray-500]">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
