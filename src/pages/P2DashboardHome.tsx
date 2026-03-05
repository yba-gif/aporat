import { Users, AlertTriangle, FileCheck, Activity, TrendingUp, ArrowUpRight } from 'lucide-react';
import { StatCard } from '@/components/p2/StatCard';
import { RiskBadge } from '@/components/p2/RiskBadge';
import { StatusBadge } from '@/components/p2/StatusBadge';
import { ScoreCircle } from '@/components/p2/ScoreCircle';

const recentCases = [
  { id: 'VIS-2026-0891', name: 'Mehmet Yılmaz', risk: 'LOW' as const, status: 'CLEARED' as const, score: 23 },
  { id: 'VIS-2026-0892', name: 'Ahmad Rezaee', risk: 'CRITICAL' as const, status: 'FLAGGED' as const, score: 87 },
  { id: 'VIS-2026-0893', name: 'Elena Petrov', risk: 'MEDIUM' as const, status: 'PROCESSING' as const, score: 41 },
  { id: 'VIS-2026-0894', name: 'Li Wei', risk: 'HIGH' as const, status: 'PENDING' as const, score: 62 },
];

export default function P2DashboardHome() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Active Cases" value="2,847" delta={12.5} />
        <StatCard icon={AlertTriangle} label="Flagged" value="143" delta={-3.2} variant="red" />
        <StatCard icon={FileCheck} label="Cleared Today" value="89" delta={8.1} variant="green" />
        <StatCard icon={Activity} label="Avg. Processing" value="4.2h" delta={-15.3} variant="blue" />
      </div>

      {/* Recent cases */}
      <div className="p2-card">
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--p2-gray-200)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--p2-navy)' }}>Recent Cases</h2>
          <a href="/p2/dashboard/cases" className="text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: 'var(--p2-blue)' }}>
            View all <ArrowUpRight size={12} />
          </a>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--p2-gray-100)' }}>
          {recentCases.map(c => (
            <div key={c.id} className="flex items-center justify-between p-4 hover:bg-[--p2-gray-50]/50 transition-colors">
              <div className="flex items-center gap-3">
                <ScoreCircle score={c.score} size="sm" />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--p2-navy)' }}>{c.name}</p>
                  <p className="text-xs" style={{ color: 'var(--p2-gray-400)' }}>{c.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <RiskBadge level={c.risk} size="sm" />
                <StatusBadge status={c.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
