import { cn } from '@/lib/utils';

export type Severity = 'critical' | 'high' | 'medium' | 'low';

const config: Record<Severity, { bg: string; text: string }> = {
  critical: { bg: 'var(--v3-red-muted)', text: 'var(--v3-red)' },
  high: { bg: 'var(--v3-amber-muted)', text: 'var(--v3-amber)' },
  medium: { bg: 'rgba(234, 179, 8, 0.12)', text: '#eab308' },
  low: { bg: 'rgba(96, 165, 250, 0.12)', text: '#60a5fa' },
};

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  const c = config[severity];
  return (
    <span
      className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase', className)}
      style={{ background: c.bg, color: c.text }}
    >
      {severity}
    </span>
  );
}

const dotColors: Record<Severity, string> = {
  critical: 'var(--v3-red)',
  high: 'var(--v3-amber)',
  medium: '#eab308',
  low: '#60a5fa',
};

export function SeverityDot({ severity, pulse }: { severity: Severity; pulse?: boolean }) {
  return (
    <span
      className={cn('inline-block w-2 h-2 rounded-full', pulse && 'animate-pulse')}
      style={{ background: dotColors[severity] }}
    />
  );
}
