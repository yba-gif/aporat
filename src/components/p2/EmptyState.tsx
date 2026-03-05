import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-[--p2-gray-100] flex items-center justify-center mb-4">
        <Icon size={24} className="text-[--p2-gray-400]" />
      </div>
      <h3 className="text-sm font-semibold text-[--p2-gray-700] mb-1">{title}</h3>
      {description && <p className="text-xs text-[--p2-gray-400] max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
