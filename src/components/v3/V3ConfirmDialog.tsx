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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <div
        className="relative w-full max-w-sm rounded-2xl border p-8"
        style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${confirmColor}18` }}>
            <AlertTriangle size={18} style={{ color: confirmColor }} />
          </div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--v3-text)' }}>{title}</h3>
        </div>
        <p className="text-xs mb-8 ml-[52px] leading-relaxed" style={{ color: 'var(--v3-text-secondary)' }}>{description}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold border transition-colors hover:bg-white/5"
            style={{ borderColor: 'var(--v3-border)', color: 'var(--v3-text-secondary)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-90"
            style={{ background: confirmColor, color: 'white' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
