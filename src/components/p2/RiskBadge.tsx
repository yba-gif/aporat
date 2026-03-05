import { cn } from '@/lib/utils';

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface RiskBadgeProps {
  level: RiskLevel;
  showDot?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const levelStyles: Record<RiskLevel, { bg: string; text: string; dot: string }> = {
  LOW: { bg: 'bg-[--p2-green]/10', text: 'text-[--p2-green]', dot: 'bg-[--p2-green]' },
  MEDIUM: { bg: 'bg-[--p2-orange]/10', text: 'text-[--p2-orange]', dot: 'bg-[--p2-orange]' },
  HIGH: { bg: 'bg-[--p2-red-light]/10', text: 'text-[--p2-red-light]', dot: 'bg-[--p2-red-light]' },
  CRITICAL: { bg: 'bg-[--p2-red]/15', text: 'text-[--p2-red]', dot: 'bg-[--p2-red]' },
};

const sizeStyles = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
};

export function RiskBadge({ level, showDot = true, size = 'md' }: RiskBadgeProps) {
  const styles = levelStyles[level];

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full font-semibold', styles.bg, styles.text, sizeStyles[size], level === 'CRITICAL' && 'p2-pulse')}>
      {showDot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', styles.dot, level === 'CRITICAL' && 'p2-dot-pulse')} />
      )}
      {level}
    </span>
  );
}
