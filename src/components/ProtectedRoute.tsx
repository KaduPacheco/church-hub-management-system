
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
  churchId?: string; // For church-specific access validation
}

const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/login',
  churchId 
}: ProtectedRouteProps) => {
  const { user, userProfile, loading } = useAuth();

  useEffect(() => {
    const validateAccess = async () => {
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

        // Church-specific access validation for admin_igreja users
        if (churchId && userProfile.role === 'admin_igreja') {
          try {
            const { data, error } = await supabase.rpc('user_has_church_access', {
              church_id: churchId
            });

            if (error || !data) {
              // Redirect to their authorized church
              window.location.href = userProfile.igreja_id ? `/church/${userProfile.igreja_id}` : '/dashboard';
              return;
            }
          } catch (error) {
            // On error, redirect to safe location
            window.location.href = '/dashboard';
            return;
          }
        }
      }
    };

    validateAccess();
  }, [user, userProfile, loading, allowedRoles, redirectTo, churchId]);

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
