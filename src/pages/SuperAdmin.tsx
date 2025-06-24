import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Church, Users, Building, Shield, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { errorHandler } from "@/utils/errorHandler";

interface Cliente {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  created_at: string;
}

const SuperAdmin = () => {
  const { signOut, userProfile } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        errorHandler.logError(error, {
          action: 'fetchClientes',
          userMessage: 'Erro ao carregar clientes'
        });
        
        toast({
          title: "Erro",
          description: "Erro ao carregar clientes",
          variant: "destructive",
        });
        return;
      }

      setClientes(data || []);
    } catch (error) {
      errorHandler.logError(error, {
        action: 'fetchClientes',
        userMessage: 'Erro ao carregar clientes'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleClienteStatus = async (clienteId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .update({ ativo: !currentStatus })
        .eq('id', clienteId);

      if (error) {
        errorHandler.logError(error, {
          action: 'toggleClienteStatus',
          context: { clienteId, currentStatus },
          userMessage: 'Erro ao atualizar status do cliente'
        });

        toast({
          title: "Erro",
          description: "Erro ao atualizar status do cliente",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: `Cliente ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`,
      });

      fetchClientes();
    } catch (error) {
      errorHandler.logError(error, {
        action: 'toggleClienteStatus',
        context: { clienteId, currentStatus },
        userMessage: 'Erro ao atualizar cliente'
      });
      
      toast({
        title: "Erro",
        description: "Erro ao atualizar cliente",
        variant: "destructive",
      });
    }
  };

  const totalClientes = clientes.length;
  const clientesAtivos = clientes.filter(c => c.ativo).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Painel Super Admin</h1>
                <p className="text-sm text-gray-500">Gestão da Plataforma ChurchManager</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                  <p className="text-2xl font-bold text-gray-900">{totalClientes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Building className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Clientes Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">{clientesAtivos}</p>
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
                  <p className="text-sm font-medium text-gray-600">Taxa de Ativação</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalClientes > 0 ? Math.round((clientesAtivos / totalClientes) * 100) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clientes List */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Clientes Cadastrados</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Carregando clientes...</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {clientes.map((cliente) => (
                <Card key={cliente.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{cliente.nome}</h3>
                          <Badge variant={cliente.ativo ? 'default' : 'secondary'}>
                            {cliente.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <p className="text-gray-600">{cliente.email}</p>
                        <p className="text-sm text-gray-500">
                          Cadastrado em: {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant={cliente.ativo ? "destructive" : "default"}
                          onClick={() => toggleClienteStatus(cliente.id, cliente.ativo)}
                        >
                          {cliente.ativo ? 'Desativar' : 'Ativar'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {clientes.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600">Nenhum cliente cadastrado ainda.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;
