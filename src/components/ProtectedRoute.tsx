
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
      // Se não está logado, redireciona para login
      if (!user) {
        window.location.href = redirectTo;
        return;
      }

      // Se tem roles específicas e o usuário não tem permissão
      if (allowedRoles.length > 0 && userProfile && !allowedRoles.includes(userProfile.role)) {
        // Redireciona baseado na role do usuário
        switch (userProfile.role) {
          case 'superadmin':
            window.location.href = '/superadmin';
            break;
          case 'cliente':
            window.location.href = '/dashboard';
            break;
          case 'admin_igreja':
            if (userProfile.igreja_id) {
              window.location.href = `/church/${userProfile.igreja_id}`;
            } else {
              window.location.href = '/dashboard';
            }
            break;
          default:
            window.location.href = '/login';
        }
        return;
      }

      // Se o usuário não está ativo
      if (userProfile && !userProfile.ativo) {
        window.location.href = '/login';
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

  // Se não está logado ou não tem permissão, não renderiza nada
  // (o redirecionamento já foi feito no useEffect)
  if (!user || !userProfile || !userProfile.ativo) {
    return null;
  }

  // Se tem roles específicas e não tem permissão
  if (allowedRoles.length > 0 && !allowedRoles.includes(userProfile.role)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
