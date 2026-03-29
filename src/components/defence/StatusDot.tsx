import { cn } from '@/lib/utils';

type Status = 'running' | 'idle' | 'error' | 'disabled';

const statusStyles: Record<Status, { color: string; pulse: boolean; label: string }> = {
  running: { color: 'var(--v3-green)', pulse: true, label: 'Running' },
  idle: { color: 'var(--v3-green)', pulse: false, label: 'Idle' },
  error: { color: 'var(--v3-red)', pulse: false, label: 'Error' },
  disabled: { color: 'var(--v3-text-muted)', pulse: false, label: 'Disabled' },
};

export function StatusDot({ status, size = 'sm' }: { status: Status; size?: 'sm' | 'md' | 'lg' }) {
  const s = statusStyles[status] || statusStyles.disabled;
  const dim = size === 'lg' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-2.5 h-2.5' : 'w-2 h-2';
  return (
    <span
      className={cn('inline-block rounded-full', dim, s.pulse && 'animate-pulse')}
      style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }}
      title={s.label}
    />
  );
}

export function StatusLabel({ status }: { status: Status }) {
  const s = statusStyles[status] || statusStyles.disabled;
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color: s.color }}>
      <StatusDot status={status} />
      {s.label}
    </span>
  );
}
