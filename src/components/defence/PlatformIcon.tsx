import { cn } from '@/lib/utils';

const platformConfig: Record<string, { color: string; label: string; letter: string }> = {
  tiktok: { color: '#E11D48', label: 'TikTok', letter: 'Tk' },
  strava: { color: '#FC4C02', label: 'Strava', letter: 'St' },
};

export function PlatformIcon({ platform, size = 'sm', className }: { platform: string; size?: 'sm' | 'md'; className?: string }) {
  const cfg = platformConfig[platform] || { color: '#52525b', label: platform, letter: platform.substring(0, 2).toUpperCase() };
  const dim = size === 'md' ? 'w-8 h-8 text-xs' : 'w-5 h-5 text-[9px]';
  return (
    <div
      className={cn('rounded-lg flex items-center justify-center font-bold shrink-0', dim, className)}
      style={{ background: `${cfg.color}20`, color: cfg.color }}
      title={cfg.label}
    >
      {cfg.letter}
    </div>
  );
}

export function getPlatformLabel(platform: string): string {
  return platformConfig[platform]?.label || platform;
}

export function getPlatformColor(platform: string): string {
  return platformConfig[platform]?.color || '#52525b';
}
