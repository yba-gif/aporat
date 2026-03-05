import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  delta?: number;
  variant?: 'default' | 'blue' | 'red' | 'green';
}

const variantStyles = {
  default: { bg: 'bg-white', icon: 'text-[--p2-gray-500]', border: 'border-[--p2-gray-200]' },
  blue: { bg: 'bg-[--p2-blue]/5', icon: 'text-[--p2-blue]', border: 'border-[--p2-blue]/20' },
  red: { bg: 'bg-[--p2-red]/5', icon: 'text-[--p2-red]', border: 'border-[--p2-red]/20' },
  green: { bg: 'bg-[--p2-green]/5', icon: 'text-[--p2-green]', border: 'border-[--p2-green]/20' },
};

export function StatCard({ icon: Icon, label, value, delta, variant = 'default' }: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn('p2-card p-5', styles.bg, `border-[${styles.border}]`)}
      style={{ borderColor: variant !== 'default' ? undefined : undefined }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-[--p2-gray-400] mb-1">{label}</p>
          <p className="text-2xl font-semibold text-[--p2-navy]">{value}</p>
          {delta !== undefined && (
            <div className={cn('flex items-center gap-1 mt-1 text-xs font-medium', delta >= 0 ? 'text-[--p2-green]' : 'text-[--p2-red]')}>
              {delta >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{delta >= 0 ? '+' : ''}{delta}%</span>
            </div>
          )}
        </div>
        <div className={cn('p-2.5 rounded-lg', variant === 'default' ? 'bg-[--p2-gray-100]' : styles.bg)}>
          <Icon size={20} className={styles.icon} />
        </div>
      </div>
    </motion.div>
  );
}
