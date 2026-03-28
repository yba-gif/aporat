import { cn } from '@/lib/utils';

type Status = 'running' | 'idle' | 'error' | 'disabled';

const statusStyles: Record<Status, { dot: string; ring: string; pulse: boolean; label: string }> = {
  running: { dot: 'bg-emerald-400', ring: 'ring-emerald-400/30', pulse: true, label: 'Running' },
  idle: { dot: 'bg-emerald-600', ring: 'ring-emerald-600/20', pulse: false, label: 'Idle' },
  error: { dot: 'bg-red-500', ring: 'ring-red-500/30', pulse: false, label: 'Error' },
  disabled: { dot: 'bg-gray-600', ring: 'ring-gray-600/10', pulse: false, label: 'Disabled' },
};

export function StatusDot({ status, size = 'sm' }: { status: Status; size?: 'sm' | 'md' | 'lg' }) {
  const s = statusStyles[status] || statusStyles.disabled;
  const dim = size === 'lg' ? 'w-4 h-4' : size === 'md' ? 'w-3 h-3' : 'w-2 h-2';
  return (
    <span className={cn('inline-block rounded-full ring-2', dim, s.dot, s.ring, s.pulse && 'animate-pulse')} title={s.label} />
  );
}

export function StatusLabel({ status }: { status: Status }) {
  const s = statusStyles[status] || statusStyles.disabled;
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color: status === 'running' ? '#34D399' : status === 'error' ? '#F87171' : status === 'idle' ? '#6EE7B7' : '#6B7280' }}>
      <StatusDot status={status} />
      {s.label}
    </span>
  );
}
