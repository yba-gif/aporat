import { WifiOff, RefreshCw } from 'lucide-react';

export function BackendBanner({ onRetry }: { onRetry?: () => void }) {
  return (
    <div
      className="flex items-center justify-between px-5 py-2.5 text-xs font-medium border-b"
      style={{ background: 'var(--v3-red-muted)', borderColor: 'rgba(248,113,113,0.15)', color: 'var(--v3-red)' }}
    >
      <div className="flex items-center gap-2">
        <WifiOff size={14} />
        <span>SYSTEM OFFLINE — Running in demo mode with simulated data</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-colors"
          style={{ background: 'rgba(248,113,113,0.12)', color: 'var(--v3-red)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,0.12)'}
        >
          <RefreshCw size={12} />
          Reconnect
        </button>
      )}
    </div>
  );
}
