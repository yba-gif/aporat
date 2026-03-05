import { cn } from '@/lib/utils';

type Status = 'PENDING' | 'PROCESSING' | 'CLEARED' | 'FLAGGED' | 'DENIED';

interface StatusBadgeProps {
  status: Status;
}

const statusStyles: Record<Status, { bg: string; text: string; dot: string; pulse?: boolean }> = {
  PENDING: { bg: 'bg-[--p2-gray-200]/60', text: 'text-[--p2-gray-600]', dot: 'bg-[--p2-gray-400]' },
  PROCESSING: { bg: 'bg-[--p2-blue]/10', text: 'text-[--p2-blue]', dot: 'bg-[--p2-blue]', pulse: true },
  CLEARED: { bg: 'bg-[--p2-green]/10', text: 'text-[--p2-green]', dot: 'bg-[--p2-green]' },
  FLAGGED: { bg: 'bg-[--p2-red]/10', text: 'text-[--p2-red]', dot: 'bg-[--p2-red]' },
  DENIED: { bg: 'bg-[--p2-navy]/10', text: 'text-[--p2-navy]', dot: 'bg-[--p2-navy]' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const s = statusStyles[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full text-xs font-semibold px-2.5 py-1', s.bg, s.text)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', s.dot, s.pulse && 'p2-dot-pulse')} />
      {status}
    </span>
  );
}
