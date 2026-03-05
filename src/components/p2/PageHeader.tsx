import { ChevronRight } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {breadcrumbs && (
        <nav className="flex items-center gap-1 text-xs text-[--p2-gray-400] mb-2">
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={12} />}
              {b.href ? <a href={b.href} className="hover:text-[--p2-blue]">{b.label}</a> : <span>{b.label}</span>}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[--p2-navy]">{title}</h1>
          {subtitle && <p className="text-sm text-[--p2-gray-500] mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
