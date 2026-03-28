export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-md p-4 h-20" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
            <div className="h-2.5 w-16 rounded mb-3" style={{ background: 'var(--v3-border)' }} />
            <div className="h-6 w-12 rounded" style={{ background: 'var(--v3-border)' }} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 border rounded-md h-64" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }} />
        <div className="col-span-2 border rounded-md h-64" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }} />
      </div>
    </div>
  );
}

export function CaseDetailSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-md" style={{ background: 'var(--v3-border)' }} />
        <div className="h-4 w-32 rounded" style={{ background: 'var(--v3-border)' }} />
        <div className="h-5 w-16 rounded-md" style={{ background: 'var(--v3-border)' }} />
      </div>
      <div className="grid grid-cols-[280px_1fr_320px] gap-4">
        <div className="space-y-4">
          <div className="border rounded-md h-48" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }} />
          <div className="border rounded-md h-32" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }} />
        </div>
        <div className="border rounded-md h-96" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }} />
        <div className="border rounded-md h-72" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }} />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="border rounded-md overflow-hidden animate-pulse" style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}>
      <div className="h-10 border-b" style={{ borderColor: 'var(--v3-border)', background: 'var(--v3-bg)' }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 border-b flex items-center gap-4 px-4" style={{ borderColor: 'var(--v3-border)' }}>
          <div className="h-3 w-20 rounded" style={{ background: 'var(--v3-border)' }} />
          <div className="h-3 w-28 rounded" style={{ background: 'var(--v3-border)' }} />
          <div className="h-3 w-16 rounded" style={{ background: 'var(--v3-border)' }} />
          <div className="h-3 w-12 rounded" style={{ background: 'var(--v3-border)' }} />
        </div>
      ))}
    </div>
  );
}
