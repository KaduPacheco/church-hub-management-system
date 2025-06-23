
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Users, Church, Settings, Search, Eye, UserCheck, UserX } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const SuperAdmin = () => {
  const [clients, setClients] = useState([
    {
      id: 1,
      name: "Igreja Batista Central",
      email: "contato@batista-central.org.br",
      phone: "(11) 99999-9999",
      status: "active",
      churches: 3,
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      name: "Assembleia de Deus Maranata",
      email: "admin@admaranata.com.br",
      phone: "(21) 88888-8888",
      status: "pending",
      churches: 0,
      createdAt: "2024-02-20"
    },
    {
      id: 3,
      name: "Igreja Universal do Reino",
      email: "gestao@iurd-brasil.org",
      phone: "(11) 77777-7777",
      status: "inactive",
      churches: 8,
      createdAt: "2024-01-10"
    }
  ]);

  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    responsibleName: "",
    responsibleEmail: ""
  });

  const [searchTerm, setSearchTerm] = useState("");

  const handleAddClient = () => {
    const client = {
      id: clients.length + 1,
      ...newClient,
      status: "pending",
      churches: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setClients([...clients, client]);
    setNewClient({
      name: "",
      email: "",
      phone: "",
      responsibleName: "",
      responsibleEmail: ""
    });
    toast({
      title: "Cliente adicionado!",
      description: "Novo cliente cadastrado com sucesso.",
    });
  };

  const toggleClientStatus = (id: number) => {
    setClients(clients.map(client => 
      client.id === id 
        ? { ...client, status: client.status === 'active' ? 'inactive' : 'active' }
        : client
    ));
    toast({
      title: "Status atualizado!",
      description: "Status do cliente foi alterado.",
    });
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inativo</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Painel Administrativo</h1>
                <p className="text-sm text-gray-500">Gerenciamento de clientes</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                  <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {clients.filter(c => c.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <UserX className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {clients.filter(c => c.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Church className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Igrejas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {clients.reduce((sum, client) => sum + client.churches, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Novo Cliente</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                <DialogDescription>
                  Cadastre uma nova igreja no sistema
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="churchName">Nome da Igreja</Label>
                  <Input
                    id="churchName"
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    placeholder="Igreja Batista Central"
                  />
                </div>
                <div>
                  <Label htmlFor="churchEmail">Email da Igreja</Label>
                  <Input
                    id="churchEmail"
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    placeholder="contato@igreja.com.br"
                  />
                </div>
                <div>
                  <Label htmlFor="churchPhone">Telefone</Label>
                  <Input
                    id="churchPhone"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <Label htmlFor="responsibleName">Nome do Responsável</Label>
                  <Input
                    id="responsibleName"
                    value={newClient.responsibleName}
                    onChange={(e) => setNewClient({...newClient, responsibleName: e.target.value})}
                    placeholder="Pastor João Silva"
                  />
                </div>
                <div>
                  <Label htmlFor="responsibleEmail">Email do Responsável</Label>
                  <Input
                    id="responsibleEmail"
                    type="email"
                    value={newClient.responsibleEmail}
                    onChange={(e) => setNewClient({...newClient, responsibleEmail: e.target.value})}
                    placeholder="pastor@igreja.com.br"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddClient}>Adicionar Cliente</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle>Clientes Cadastrados</CardTitle>
            <CardDescription>
              Lista de todas as igrejas cadastradas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{client.name}</h3>
                        <p className="text-sm text-gray-500">{client.email}</p>
                        <p className="text-sm text-gray-500">{client.phone}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{client.churches} igrejas</p>
                      <p className="text-xs text-gray-500">Criado em {client.createdAt}</p>
                    </div>
                    
                    {getStatusBadge(client.status)}
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast({
                          title: "Visualizar cliente",
                          description: `Abrindo detalhes de ${client.name}`,
                        })}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={client.status === 'active' ? 'destructive' : 'default'}
                        onClick={() => toggleClientStatus(client.id)}
                      >
                        {client.status === 'active' ? 'Desativar' : 'Ativar'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdmin;
