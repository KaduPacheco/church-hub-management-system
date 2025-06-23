
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Church, 
  UserPlus, 
  CalendarPlus,
  PieChart,
  ArrowLeft,
  Settings
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ChurchDashboard = () => {
  const { churchId } = useParams();
  
  // Dados simulados baseados no ID da igreja
  const churchData = {
    "1": {
      name: "Igreja Matriz Central",
      type: "matriz",
      members: 850,
      visitors: 45,
      events: 12,
      income: 45000,
      expenses: 32000,
      tithe: 38000,
      offerings: 7000,
      categories: {
        maintenance: 15000,
        social: 8000,
        missions: 5000,
        utilities: 4000
      }
    },
    "2": {
      name: "Congregação Vila Nova",
      type: "filial",
      members: 320,
      visitors: 18,
      events: 8,
      income: 18000,
      expenses: 12000,
      tithe: 15000,
      offerings: 3000,
      categories: {
        maintenance: 6000,
        social: 3000,
        missions: 2000,
        utilities: 1000
      }
    }
  };

  const church = churchData[churchId as keyof typeof churchData] || churchData["1"];
  const balance = church.income - church.expenses;
  const growthRate = 12; // Simulação de crescimento mensal

  const upcomingEvents = [
    { name: "Culto de Domingo", date: "2024-06-30", time: "19:00", attendees: 120 },
    { name: "Reunião de Oração", date: "2024-07-01", time: "20:00", attendees: 80 },
    { name: "Escola Bíblica", date: "2024-07-02", time: "19:30", attendees: 60 },
    { name: "Culto de Quarta", date: "2024-07-03", time: "20:00", attendees: 95 }
  ];

  const recentMembers = [
    { name: "Maria Silva", joinDate: "2024-06-15", status: "active" },
    { name: "João Santos", joinDate: "2024-06-10", status: "active" },
    { name: "Ana Costa", joinDate: "2024-06-05", status: "visitor" },
    { name: "Pedro Lima", joinDate: "2024-06-01", status: "active" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = '/dashboard'}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Church className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{church.name}</h1>
                <div className="flex items-center space-x-2">
                  <Badge variant={church.type === 'matriz' ? 'default' : 'secondary'}>
                    {church.type === 'matriz' ? 'Igreja Matriz' : 'Congregação Filial'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Membros Ativos</p>
                  <p className="text-3xl font-bold text-gray-900">{church.members}</p>
                  <p className="text-sm text-green-600 mt-1">+{growthRate}% este mês</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Visitantes</p>
                  <p className="text-3xl font-bold text-gray-900">{church.visitors}</p>
                  <p className="text-sm text-blue-600 mt-1">Última semana</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <UserPlus className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Eventos Ativos</p>
                  <p className="text-3xl font-bold text-gray-900">{church.events}</p>
                  <p className="text-sm text-purple-600 mt-1">Este mês</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Saldo Mensal</p>
                  <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {balance.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {balance >= 0 ? 'Superávit' : 'Déficit'}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${balance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <TrendingUp className={`w-6 h-6 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Resumo Financeiro</span>
              </CardTitle>
              <CardDescription>Receitas e despesas do mês atual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">Dízimos</span>
                    <span className="text-sm font-semibold">R$ {church.tithe.toLocaleString()}</span>
                  </div>
                  <Progress value={(church.tithe / church.income) * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">Ofertas</span>
                    <span className="text-sm font-semibold">R$ {church.offerings.toLocaleString()}</span>
                  </div>
                  <Progress value={(church.offerings / church.income) * 100} className="h-2" />
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Receitas</span>
                    <span className="font-bold text-green-600">R$ {church.income.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Manutenção</span>
                    <span className="text-sm">R$ {church.categories.maintenance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Ação Social</span>
                    <span className="text-sm">R$ {church.categories.social.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Missões</span>
                    <span className="text-sm">R$ {church.categories.missions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Utilidades</span>
                    <span className="text-sm">R$ {church.categories.utilities.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Despesas</span>
                    <span className="font-bold text-red-600">R$ {church.expenses.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Próximos Eventos</span>
              </CardTitle>
              <CardDescription>Programação da semana</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-sm">{event.name}</h4>
                      <p className="text-xs text-gray-600">{event.date} às {event.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{event.attendees}</p>
                      <p className="text-xs text-gray-600">pessoas</p>
                    </div>
                  </div>
                ))}
                <Button className="w-full mt-4" variant="outline">
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Novo Evento
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Novos Membros</span>
            </CardTitle>
            <CardDescription>Membros recentemente cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMembers.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{member.name}</h4>
                      <p className="text-sm text-gray-600">Cadastrado em {member.joinDate}</p>
                    </div>
                  </div>
                  <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                    {member.status === 'active' ? 'Membro' : 'Visitante'}
                  </Badge>
                </div>
              ))}
              <Button className="w-full mt-4" variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Cadastrar Novo Membro
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChurchDashboard;
