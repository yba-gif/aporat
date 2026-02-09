import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'supervisor' | 'analyst' | 'viewer';

interface UserRoleState {
  role: AppRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  // Permission helpers
  canViewSensitiveData: boolean;
  canEditCases: boolean;
  canApproveDecisions: boolean;
  canManageUsers: boolean;
}

export function useUserRole(): UserRoleState {
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          if (mounted) {
            setIsAuthenticated(false);
            // Default to 'analyst' for unauthenticated demo visitors
            setRole('analyst');
            setUserId(null);
            setIsLoading(false);
          }
          return;
        }

        if (mounted) {
          setIsAuthenticated(true);
          setUserId(session.user.id);
        }

        // Fetch user's role from user_roles table
        const { data: roleData, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .order('role') // Get highest priority role
          .limit(1)
          .single();

        if (mounted) {
          if (error || !roleData) {
            // Default to 'analyst' if no role assigned (for demo purposes)
            // In production, this should be 'viewer' or deny access
            setRole('analyst');
          } else {
            setRole(roleData.role as AppRole);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
        if (mounted) {
          setRole(null);
          setIsLoading(false);
        }
      }
    };

    fetchRole();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          if (session?.user) {
            setIsAuthenticated(true);
            setUserId(session.user.id);
            fetchRole();
          } else {
            setIsAuthenticated(false);
            setRole(null);
            setUserId(null);
            setIsLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Compute permissions based on role
  const canViewSensitiveData = role === 'admin' || role === 'supervisor' || role === 'analyst';
  const canEditCases = role === 'admin' || role === 'supervisor' || role === 'analyst';
  const canApproveDecisions = role === 'admin' || role === 'supervisor';
  const canManageUsers = role === 'admin';

  return {
    role,
    isLoading,
    isAuthenticated,
    userId,
    canViewSensitiveData,
    canEditCases,
    canApproveDecisions,
    canManageUsers,
  };
}

// Helper function to check if a role has permission
export function hasPermission(
  userRole: AppRole | null,
  requiredRoles: AppRole[]
): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

// Role hierarchy for comparison
export const ROLE_HIERARCHY: Record<AppRole, number> = {
  admin: 4,
  supervisor: 3,
  analyst: 2,
  viewer: 1,
};

export function hasMinimumRole(userRole: AppRole | null, minimumRole: AppRole): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
}
