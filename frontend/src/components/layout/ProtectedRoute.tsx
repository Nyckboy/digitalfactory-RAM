import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import type { UserRole } from '../../types/auth';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  // 1. If not logged in, kick them to the login page
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. If the route is restricted to specific roles, check the user's role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect unauthorized users to a safe default page based on their role
    switch (user.role) {
      case 'SUPER_ADMIN': return <Navigate to="/admin" replace />;
      case 'SUPERVISOR': return <Navigate to="/supervisor" replace />;
      case 'INTERN': return <Navigate to="/intern" replace />;
      default: return <Navigate to="/login" replace />;
    }
  }

  // 3. If authenticated and authorized, render the child routes
  return <Outlet />;
};