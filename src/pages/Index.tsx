
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Church, Users, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [loginType, setLoginType] = useState<'superadmin' | 'client' | null>(null);
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleLogin = (type: 'superadmin' | 'client') => {
    // Simulação de login
    if (type === 'superadmin') {
      window.location.href = '/superadmin';
    } else {
      window.location.href = '/dashboard';
    }
    toast({
      title: "Login realizado com sucesso!",
      description: `Bem-vindo ao sistema de gestão de igrejas.`,
    });
  };

  if (loginType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              {loginType === 'superadmin' ? <Shield className="w-6 h-6 text-blue-600" /> : <Church className="w-6 h-6 text-blue-600" />}
            </div>
            <CardTitle className="text-2xl">
              {loginType === 'superadmin' ? 'Acesso Administrativo' : 'Acesso do Cliente'}
            </CardTitle>
            <CardDescription>
              {loginType === 'superadmin' 
                ? 'Painel de controle do sistema' 
                : 'Gerencie suas igrejas'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu@email.com"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Button 
                className="w-full" 
                onClick={() => handleLogin(loginType)}
              >
                Entrar
              </Button>
              <Button 
                variant="ghost" 
                className="w-full" 
                onClick={() => setLoginType(null)}
              >
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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

        {/* Login Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLoginType('superadmin')}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl">Administrador do Sistema</CardTitle>
              <CardDescription>
                Gerencie todos os clientes e configure o sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  Cadastro de novos clientes
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  Controle de ativações
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  Monitoramento geral
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLoginType('client')}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Cliente - Igreja</CardTitle>
              <CardDescription>
                Acesse o painel da sua igreja
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Gestão de membros
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Controle financeiro
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Organização de eventos
                </li>
              </ul>
            </CardContent>
          </Card>
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
