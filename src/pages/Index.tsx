
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Church, Users, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, userProfile, loading } = useAuth();

  useEffect(() => {
    // Redirect logged in users to their appropriate dashboard
    if (!loading && user && userProfile && userProfile.ativo) {
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
      }
    }
  }, [user, userProfile, loading]);

  const handleLoginClick = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Church className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ChurchManager</h1>
                <p className="text-sm text-gray-500">Sistema de Gestão de Igrejas</p>
              </div>
            </div>
            {!loading && !user && (
              <Button onClick={handleLoginClick}>
                Fazer Login
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Gerencie sua igreja com simplicidade
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sistema completo para administração de igrejas, controle de membros, 
            eventos e finanças em uma plataforma moderna e intuitiva.
          </p>
        </div>

        {/* Features */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Recursos Principais
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Gestão de Membros</h4>
              <p className="text-gray-600">Controle completo do cadastro de membros, visitantes e liderança.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Church className="w-6 h-6 text-yellow-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Multi-Igreja</h4>
              <p className="text-gray-600">Gerencie igreja matriz e congregações filiais em um só lugar.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Segurança</h4>
              <p className="text-gray-600">Controle de acesso e dados seguros para cada igreja.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
