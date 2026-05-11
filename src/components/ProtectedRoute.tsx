import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  allowedRoles?: ('admin' | 'employee' | 'customer')[];
}

export function ProtectedRoute({ children, requireAdmin = false, allowedRoles }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    // Show a loading spinner while checking authentication status
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Check if user is approved
  if (user && !user.approved && user.role !== 'customer') {
    // If user is not approved and not a customer, redirect to a pending approval page
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">Account Not Approved</h2>
          <p className="text-muted-foreground mb-4">
            Your account is still pending approval. Please wait for admin approval.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            You will receive an email notification when your account is approved.
          </p>
        </div>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    // Redirect to appropriate dashboard if user is not admin
    if (user.role === 'employee') return <Navigate to="/employee-dashboard" replace />;
    if (user.role === 'customer') return <Navigate to="/customer-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard if user role is not in allowed roles
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'employee') return <Navigate to="/employee-dashboard" replace />;
    if (user.role === 'customer') return <Navigate to="/customer-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}