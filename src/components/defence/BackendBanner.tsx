import { WifiOff, RefreshCw } from 'lucide-react';

export function BackendBanner({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-2 text-xs font-medium bg-red-500/10 border-b border-red-500/20 text-red-400">
      <div className="flex items-center gap-2">
        <WifiOff size={14} />
        <span>SYSTEM OFFLINE — Running in demo mode with simulated data</span>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/10 hover:bg-red-500/20 transition-colors">
          <RefreshCw size={12} />
          Reconnect
        </button>
      )}
    </div>
  );
}
