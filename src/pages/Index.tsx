
import { FreeTrialButton } from '@/components/FreeTrialButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Church, Users, BarChart3, Calendar, Shield, Clock } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Church className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Church Hub</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <a href="/login">Entrar</a>
              </Button>
              <FreeTrialButton />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Gerencie sua Igreja com
            <span className="text-blue-600 block">Simplicidade</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Plataforma completa para administração eclesiástica. Controle membros, 
            finanças, eventos e muito mais em um só lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <FreeTrialButton />
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              7 dias grátis • Sem cartão de crédito
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Tudo que sua igreja precisa
            </h3>
            <p className="text-xl text-gray-600">
              Ferramentas profissionais para uma gestão eficiente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Gestão de Membros</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Cadastre e acompanhe todos os membros da sua congregação com facilidade
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Controle Financeiro</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Gerencie dízimos, ofertas e despesas com relatórios detalhados
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Calendar className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Agenda de Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Organize cultos, reuniões e eventos especiais em um calendário integrado
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trial Benefits */}
      <section className="py-20 bg-green-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-8">
            Por que testar gratuitamente?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-3 rounded-full mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Sem Compromisso</h4>
              <p className="text-gray-600">
                Cancele a qualquer momento durante os 7 dias de teste
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-3 rounded-full mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Acesso Completo</h4>
              <p className="text-gray-600">
                Teste todas as funcionalidades sem limitações
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-3 rounded-full mb-4">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Setup Rápido</h4>
              <p className="text-gray-600">
                Comece a usar em menos de 5 minutos
              </p>
            </div>
          </div>

          <FreeTrialButton />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-8">
            <Church className="h-8 w-8 text-blue-400 mr-3" />
            <h3 className="text-2xl font-bold">Church Hub</h3>
          </div>
          <p className="text-gray-400 mb-8">
            Simplificando a gestão eclesiástica com tecnologia moderna
          </p>
          <div className="text-sm text-gray-500">
            © 2024 Church Hub. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
