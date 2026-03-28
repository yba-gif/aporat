import { cn } from '@/lib/utils';

export type Severity = 'critical' | 'high' | 'medium' | 'low';

const config: Record<Severity, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
  high: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  medium: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  low: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
};

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  const c = config[severity];
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-bold tracking-wider uppercase', c.bg, c.text, c.border, className)}>
      {severity}
    </span>
  );
}

const dotColors: Record<Severity, string> = { critical: 'bg-red-500', high: 'bg-amber-500', medium: 'bg-yellow-500', low: 'bg-blue-500' };

export function SeverityDot({ severity, pulse }: { severity: Severity; pulse?: boolean }) {
  return (
    <span className={cn('inline-block w-2 h-2 rounded-full', dotColors[severity], pulse && 'animate-pulse')} />
  );
}
