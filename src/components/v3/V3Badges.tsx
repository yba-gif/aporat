import { cn } from '@/lib/utils';
import type { RiskLevel, CaseStatus } from '@/data/v3/mockData';

const riskColors: Record<RiskLevel, { bg: string; text: string }> = {
  low: { bg: 'var(--v3-green-muted)', text: 'var(--v3-green)' },
  medium: { bg: 'var(--v3-amber-muted)', text: 'var(--v3-amber)' },
  high: { bg: 'var(--v3-red-muted)', text: '#fb923c' },
  critical: { bg: 'var(--v3-red-muted)', text: 'var(--v3-red)' },
};

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  const c = riskColors[level] || riskColors.medium;
  return (
    <span
      className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium capitalize', className)}
      style={{ background: c.bg, color: c.text }}
    >
      {level}
    </span>
  );
}

const statusColors: Record<CaseStatus, { bg: string; text: string }> = {
  new: { bg: 'rgba(161, 161, 170, 0.12)', text: 'var(--v3-text-secondary)' },
  scanning: { bg: 'var(--v3-accent-muted)', text: 'var(--v3-accent)' },
  in_review: { bg: 'var(--v3-amber-muted)', text: 'var(--v3-amber)' },
  escalated: { bg: 'var(--v3-red-muted)', text: 'var(--v3-red)' },
  approved: { bg: 'var(--v3-green-muted)', text: 'var(--v3-green)' },
  rejected: { bg: 'var(--v3-red-muted)', text: 'var(--v3-red)' },
};

const statusLabels: Record<CaseStatus, string> = {
  new: 'New',
  scanning: 'Scanning',
  in_review: 'In Review',
  escalated: 'Escalated',
  approved: 'Approved',
  rejected: 'Rejected',
};

export function StatusBadge({ status, className }: { status: CaseStatus; className?: string }) {
  const c = statusColors[status];
  return (
    <span
      className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium', className)}
      style={{ background: c.bg, color: c.text }}
    >
      {status === 'scanning' && <span className="w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse" style={{ background: 'var(--v3-accent)' }} />}
      {statusLabels[status]}
    </span>
  );
}

export function RiskScoreCircle({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const color = score < 30 ? 'var(--v3-green)' : score < 60 ? 'var(--v3-amber)' : score < 80 ? '#fb923c' : 'var(--v3-red)';
  const dims = size === 'sm' ? 'w-10 h-10 text-sm' : size === 'md' ? 'w-16 h-16 text-xl' : 'w-24 h-24 text-3xl';
  const radius = size === 'sm' ? 16 : size === 'md' ? 26 : 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const svgSize = size === 'sm' ? 40 : size === 'md' ? 64 : 96;

  return (
    <div className={cn('relative flex items-center justify-center', dims)}>
      <svg width={svgSize} height={svgSize} className="absolute inset-0 -rotate-90">
        <circle cx={svgSize / 2} cy={svgSize / 2} r={radius} fill="none" stroke="var(--v3-border)" strokeWidth={size === 'lg' ? 4 : 3} />
        <circle
          cx={svgSize / 2} cy={svgSize / 2} r={radius} fill="none" stroke={color} strokeWidth={size === 'lg' ? 4 : 3}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-500"
        />
      </svg>
      <span className="font-semibold font-mono relative z-10" style={{ color }}>{score}</span>
    </div>
  );
}
