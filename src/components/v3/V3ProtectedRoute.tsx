import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/api/AuthContext';

export function V3ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthContext();

  if (!isAuthenticated) return <Navigate to="/v3" replace />;

  return <>{children}</>;
}
