import { cn } from '@/lib/utils';

function Shimmer({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg', className)} style={{ background: 'var(--v3-surface-hover)' }} />;
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--v3-surface)', border: '1px solid var(--v3-border)' }}>
      <Shimmer className="h-3 w-20 mb-3" />
      <Shimmer className="h-8 w-16 mb-2" />
      <Shimmer className="h-2.5 w-24" />
    </div>
  );
}

export function AlertCardSkeleton() {
  return (
    <div className="rounded-xl p-4 flex gap-3" style={{ background: 'var(--v3-surface)', border: '1px solid var(--v3-border)' }}>
      <Shimmer className="w-1 h-12 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Shimmer className="h-3.5 w-3/4" />
        <Shimmer className="h-2.5 w-full" />
        <Shimmer className="h-2.5 w-1/2" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 px-4 rounded-xl" style={{ background: 'var(--v3-surface)' }}>
          <Shimmer className="h-4 w-32" />
          <Shimmer className="h-4 w-20" />
          <Shimmer className="h-4 w-24" />
          <Shimmer className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
}

export function CollectorCardSkeleton() {
  return (
    <div className="rounded-xl p-5 space-y-3" style={{ background: 'var(--v3-surface)', border: '1px solid var(--v3-border)' }}>
      <div className="flex items-center gap-3">
        <Shimmer className="w-8 h-8 rounded-xl" />
        <Shimmer className="h-4 w-20" />
      </div>
      <Shimmer className="h-10 w-10 rounded-full mx-auto" />
      <div className="space-y-1.5">
        <Shimmer className="h-2.5 w-full" />
        <Shimmer className="h-2.5 w-3/4" />
        <Shimmer className="h-2.5 w-1/2" />
      </div>
    </div>
  );
}
