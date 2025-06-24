import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Church, Users, Calendar, DollarSign, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { errorHandler } from "@/utils/errorHandler";
import { validateChurchData, sanitizeText } from "@/utils/inputValidation";

interface Igreja {
  id: string;
  nome: string;
  endereco: string;
  tipo: string;
  pastor_nome: string;
  pastor_email: string;
  membros: number;
  eventos: number;
  receitas: number;
  despesas: number;
  created_at: string;
}

const Dashboard = () => {
  const { signOut, userProfile } = useAuth();
  const [churches, setChurches] = useState<Igreja[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newChurch, setNewChurch] = useState({
    nome: "",
    endereco: "",
    tipo: "filial",
    pastor_nome: "",
    pastor_email: ""
  });

  useEffect(() => {
    if (userProfile?.cliente_id) {
      fetchChurches();
    }
  }, [userProfile]);

  const fetchChurches = async () => {
    if (!userProfile?.cliente_id) return;

    try {
      const { data, error } = await supabase
        .from('igrejas')
        .select('*')
        .eq('cliente_id', userProfile.cliente_id)
        .order('created_at', { ascending: false });

      if (error) {
        errorHandler.logError(error, {
          action: 'fetchChurches',
          context: { clienteId: userProfile.cliente_id },
          userMessage: 'Erro ao carregar igrejas'
        });
        
        toast({
          title: "Erro",
          description: "Erro ao carregar igrejas",
          variant: "destructive",
        });
        return;
      }

      setChurches(data || []);
    } catch (error) {
      errorHandler.logError(error, {
        action: 'fetchChurches',
        context: { clienteId: userProfile.cliente_id },
        userMessage: 'Erro ao carregar igrejas'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddChurch = async () => {
    if (!userProfile?.cliente_id) return;

    try {
      // Validate and sanitize input data
      const validatedData = validateChurchData(newChurch);

      const { error } = await supabase
        .from('igrejas')
        .insert({
          cliente_id: userProfile.cliente_id,
          nome: validatedData.nome,
          endereco: validatedData.endereco,
          tipo: validatedData.tipo,
          pastor_nome: validatedData.pastor_nome,
          pastor_email: validatedData.pastor_email,
          membros: 0,
          eventos: 0,
          receitas: 0,
          despesas: 0
        });

      if (error) {
        errorHandler.logError(error, {
          action: 'addChurch',
          context: { clienteId: userProfile.cliente_id, churchName: validatedData.nome },
          userMessage: 'Erro ao cadastrar igreja'
        });

        toast({
          title: "Erro",
          description: "Erro ao cadastrar igreja",
          variant: "destructive",
        });
        return;
      }

      setNewChurch({
        nome: "",
        endereco: "",
        tipo: "filial",
        pastor_nome: "",
        pastor_email: ""
      });

      setDialogOpen(false);

      toast({
        title: "Igreja adicionada!",
        description: "Nova igreja cadastrada com sucesso.",
      });

      fetchChurches();
    } catch (error) {
      errorHandler.logError(error, {
        action: 'addChurch',
        context: { clienteId: userProfile.cliente_id },
        userMessage: 'Dados da igreja inválidos'
      });

      toast({
        title: "Erro de validação",
        description: "Verifique os dados informados e tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    const sanitizedValue = sanitizeText(value);
    setNewChurch(prev => ({
      ...prev,
      [field]: sanitizedValue
    }));
  };

  const totalMembers = churches.reduce((sum, church) => sum + church.membros, 0);
  const totalEvents = churches.reduce((sum, church) => sum + church.eventos, 0);
  const totalIncome = churches.reduce((sum, church) => sum + church.receitas, 0);
  const totalExpenses = churches.reduce((sum, church) => sum + church.despesas, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

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
                <p className="text-sm text-gray-500">{userProfile?.nome || 'Cliente'}</p>
              </div>
            </div>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
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
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                    value={newChurch.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    placeholder="Congregação Vila Nova"
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={newChurch.endereco}
                    onChange={(e) => handleInputChange('endereco', e.target.value)}
                    placeholder="Rua das Flores, 123 - Bairro"
                    maxLength={200}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <select
                    id="type"
                    value={newChurch.tipo}
                    onChange={(e) => setNewChurch({...newChurch, tipo: e.target.value})}
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
                    value={newChurch.pastor_nome}
                    onChange={(e) => handleInputChange('pastor_nome', e.target.value)}
                    placeholder="Pastor João Silva"
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label htmlFor="pastorEmail">Email do Pastor</Label>
                  <Input
                    id="pastorEmail"
                    type="email"
                    value={newChurch.pastor_email}
                    onChange={(e) => handleInputChange('pastor_email', e.target.value)}
                    placeholder="pastor@igreja.com.br"
                    maxLength={255}
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
                    <CardTitle className="text-lg">{church.nome}</CardTitle>
                    <CardDescription>{church.endereco}</CardDescription>
                  </div>
                  <Badge variant={church.tipo === 'matriz' ? 'default' : 'secondary'}>
                    {church.tipo === 'matriz' ? 'Matriz' : 'Filial'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{church.membros}</p>
                    <p className="text-sm text-gray-600">Membros</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{church.eventos}</p>
                    <p className="text-sm text-gray-600">Eventos</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Receitas:</span>
                    <span className="text-sm font-semibold text-green-600">
                      R$ {church.receitas.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Despesas:</span>
                    <span className="text-sm font-semibold text-red-600">
                      R$ {church.despesas.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-sm font-semibold">Saldo:</span>
                    <span className={`text-sm font-bold ${
                      church.receitas - church.despesas >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      R$ {(church.receitas - church.despesas).toLocaleString()}
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
          
          {churches.length === 0 && (
            <Card className="col-span-2">
              <CardContent className="p-8 text-center">
                <p className="text-gray-600">Nenhuma igreja cadastrada ainda. Clique em "Nova Igreja" para começar.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
