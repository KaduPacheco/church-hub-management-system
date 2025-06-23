
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Church, Users, Calendar, DollarSign, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [churches, setChurches] = useState([
    {
      id: 1,
      name: "Igreja Matriz Central",
      address: "Rua Principal, 123 - Centro",
      type: "matriz",
      members: 850,
      events: 12,
      income: 45000,
      expenses: 32000,
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      name: "Congregação Vila Nova",
      address: "Av. das Flores, 456 - Vila Nova",
      type: "filial",
      members: 320,
      events: 8,
      income: 18000,
      expenses: 12000,
      createdAt: "2024-02-20"
    }
  ]);

  const [newChurch, setNewChurch] = useState({
    name: "",
    address: "",
    type: "filial",
    pastorName: "",
    pastorEmail: ""
  });

  const handleAddChurch = () => {
    const church = {
      id: churches.length + 1,
      ...newChurch,
      members: 0,
      events: 0,
      income: 0,
      expenses: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setChurches([...churches, church]);
    setNewChurch({
      name: "",
      address: "",
      type: "filial",
      pastorName: "",
      pastorEmail: ""
    });
    toast({
      title: "Igreja adicionada!",
      description: "Nova igreja cadastrada com sucesso.",
    });
  };

  const totalMembers = churches.reduce((sum, church) => sum + church.members, 0);
  const totalEvents = churches.reduce((sum, church) => sum + church.events, 0);
  const totalIncome = churches.reduce((sum, church) => sum + church.income, 0);
  const totalExpenses = churches.reduce((sum, church) => sum + church.expenses, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Church className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Painel do Cliente</h1>
                <p className="text-sm text-gray-500">Igreja Batista Central</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Membros</p>
                  <p className="text-2xl font-bold text-gray-900">{totalMembers.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Eventos Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">{totalEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Receitas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {totalIncome.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Despesas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {totalExpenses.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Suas Igrejas</h2>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Nova Igreja</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Cadastrar Nova Igreja</DialogTitle>
                <DialogDescription>
                  Adicione uma igreja matriz ou congregação filial
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome da Igreja</Label>
                  <Input
                    id="name"
                    value={newChurch.name}
                    onChange={(e) => setNewChurch({...newChurch, name: e.target.value})}
                    placeholder="Congregação Vila Nova"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={newChurch.address}
                    onChange={(e) => setNewChurch({...newChurch, address: e.target.value})}
                    placeholder="Rua das Flores, 123 - Bairro"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <select
                    id="type"
                    value={newChurch.type}
                    onChange={(e) => setNewChurch({...newChurch, type: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="matriz">Igreja Matriz</option>
                    <option value="filial">Congregação Filial</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="pastorName">Nome do Pastor</Label>
                  <Input
                    id="pastorName"
                    value={newChurch.pastorName}
                    onChange={(e) => setNewChurch({...newChurch, pastorName: e.target.value})}
                    placeholder="Pastor João Silva"
                  />
                </div>
                <div>
                  <Label htmlFor="pastorEmail">Email do Pastor</Label>
                  <Input
                    id="pastorEmail"
                    type="email"
                    value={newChurch.pastorEmail}
                    onChange={(e) => setNewChurch({...newChurch, pastorEmail: e.target.value})}
                    placeholder="pastor@igreja.com.br"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddChurch}>Cadastrar Igreja</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Churches Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {churches.map((church) => (
            <Card key={church.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{church.name}</CardTitle>
                    <CardDescription>{church.address}</CardDescription>
                  </div>
                  <Badge variant={church.type === 'matriz' ? 'default' : 'secondary'}>
                    {church.type === 'matriz' ? 'Matriz' : 'Filial'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{church.members}</p>
                    <p className="text-sm text-gray-600">Membros</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{church.events}</p>
                    <p className="text-sm text-gray-600">Eventos</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Receitas:</span>
                    <span className="text-sm font-semibold text-green-600">
                      R$ {church.income.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Despesas:</span>
                    <span className="text-sm font-semibold text-red-600">
                      R$ {church.expenses.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-sm font-semibold">Saldo:</span>
                    <span className={`text-sm font-bold ${
                      church.income - church.expenses >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      R$ {(church.income - church.expenses).toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => window.location.href = `/church/${church.id}`}
                >
                  Gerenciar Igreja
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
