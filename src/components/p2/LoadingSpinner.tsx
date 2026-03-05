import { Compass } from 'lucide-react';

interface LoadingSpinnerProps {
  text?: string;
}

export function LoadingSpinner({ text = 'Processing intelligence...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Compass size={32} className="text-[--p2-blue] p2-compass-spin" />
      <p className="text-xs font-medium text-[--p2-gray-400] tracking-wide">{text}</p>
    </div>
  );
}
