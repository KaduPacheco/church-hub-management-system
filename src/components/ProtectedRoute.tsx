
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/login' 
}: ProtectedRouteProps) => {
  const { user, userProfile, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      // Not logged in
      if (!user || !userProfile) {
        window.location.href = redirectTo;
        return;
      }

      // Inactive user
      if (!userProfile.ativo) {
        window.location.href = '/login';
        return;
      }

      // Check role permissions
      if (allowedRoles.length > 0 && !allowedRoles.includes(userProfile.role)) {
        // Redirect based on user role
        switch (userProfile.role) {
          case 'superadmin':
            window.location.href = '/superadmin';
            break;
          case 'cliente':
            window.location.href = '/dashboard';
            break;
          case 'admin_igreja':
            window.location.href = userProfile.igreja_id ? `/church/${userProfile.igreja_id}` : '/dashboard';
            break;
          default:
            window.location.href = '/login';
        }
        return;
      }
    }
  }, [user, userProfile, loading, allowedRoles, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or no permission
  if (!user || !userProfile || !userProfile.ativo) {
    return null;
  }

  // Check role permissions
  if (allowedRoles.length > 0 && !allowedRoles.includes(userProfile.role)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
