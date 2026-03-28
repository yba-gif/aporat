import { AlertTriangle } from 'lucide-react';

interface V3ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmColor: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function V3ConfirmDialog({ open, title, description, confirmLabel, confirmColor, onConfirm, onCancel }: V3ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm border rounded-md p-6"
        style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: `${confirmColor}20` }}>
            <AlertTriangle size={16} style={{ color: confirmColor }} />
          </div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--v3-text)' }}>{title}</h3>
        </div>
        <p className="text-xs mb-6 ml-11" style={{ color: 'var(--v3-text-secondary)' }}>{description}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md text-xs font-semibold border transition-colors hover:bg-white/5"
            style={{ borderColor: 'var(--v3-border)', color: 'var(--v3-text-secondary)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md text-xs font-semibold"
            style={{ background: confirmColor, color: 'white' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
