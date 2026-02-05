import { ReactNode } from 'react';
import { useUserRole, AppRole, hasMinimumRole } from '@/hooks/useUserRole';
import { useLocale, TranslationKey } from '@/lib/i18n';
import { Shield, Lock } from 'lucide-react';

interface RoleGateProps {
  children: ReactNode;
  allowedRoles?: AppRole[];
  minimumRole?: AppRole;
  fallback?: ReactNode;
  showAccessDenied?: boolean;
}

/**
 * RoleGate - Conditionally render content based on user role
 * 
 * Usage:
 * <RoleGate minimumRole="supervisor">
 *   <ApproveButton />
 * </RoleGate>
 * 
 * or with specific roles:
 * <RoleGate allowedRoles={['admin', 'supervisor']}>
 *   <AdminPanel />
 * </RoleGate>
 */
export function RoleGate({ 
  children, 
  allowedRoles, 
  minimumRole,
  fallback = null,
  showAccessDenied = false 
}: RoleGateProps) {
  const { role, isLoading } = useUserRole();
  const { t } = useLocale();

  // While loading, render nothing or a skeleton
  if (isLoading) {
    return null;
  }

  // Check access
  let hasAccess = false;

  if (minimumRole) {
    hasAccess = hasMinimumRole(role, minimumRole);
  } else if (allowedRoles) {
    hasAccess = role !== null && allowedRoles.includes(role);
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  // Access denied
  if (showAccessDenied) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
        <Lock className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm">{t('insufficientPermissions')}</p>
        {minimumRole && (
          <p className="text-xs mt-1">
            {t('requiresRole')}: <span className="font-medium capitalize">{t(minimumRole as TranslationKey)}</span> {t('orHigher')}
          </p>
        )}
      </div>
    );
  }

  return <>{fallback}</>;
}

/**
 * RoleBadge - Display current user role
 */
export function RoleBadge() {
  const { role, isLoading } = useUserRole();
  const { t } = useLocale();

  if (isLoading || !role) return null;

  const roleColors: Record<AppRole, string> = {
    admin: 'bg-destructive/20 text-destructive border-destructive/30',
    supervisor: 'bg-warning/20 text-warning border-warning/30',
    analyst: 'bg-accent/20 text-accent border-accent/30',
    viewer: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <div className={`
      inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium
      border ${roleColors[role]}
    `}>
      <Shield className="h-3 w-3" />
      {t(role as TranslationKey)}
    </div>
  );
}
