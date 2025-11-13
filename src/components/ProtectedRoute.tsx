import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole?: UserRole;
}

export const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-none h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (allowedRole && role !== allowedRole) {
    // Redirect to appropriate dashboard based on user's actual role
    let redirectPath = '/dashboard/student';
    if (role === 'teacher') {
      redirectPath = '/dashboard/teacher';
    } else if (role === 'admin') {
      redirectPath = '/admin';
    }
    return <Navigate to={redirectPath} replace />;
  }

  // User is authenticated and has correct role
  return <>{children}</>;
};
