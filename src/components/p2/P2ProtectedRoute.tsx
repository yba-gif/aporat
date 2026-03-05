import { Navigate } from 'react-router-dom';
import { useP2Auth } from '@/contexts/P2AuthContext';

interface P2ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function P2ProtectedRoute({ children, requireAdmin }: P2ProtectedRouteProps) {
  const { isAuthenticated, user } = useP2Auth();

  if (!isAuthenticated) {
    return <Navigate to="/p2/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/p2/dashboard" replace />;
  }

  return <>{children}</>;
}
