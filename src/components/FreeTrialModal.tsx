
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { errorHandler } from '@/utils/errorHandler';

const freeTrialSchema = z.object({
  fullName: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s\-\.]+$/, 'Nome contém caracteres inválidos'),
  phone: z.string()
    .min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .max(15, 'Telefone muito longo')
    .regex(/^[\d\s\-\(\)\+]+$/, 'Formato de telefone inválido'),
  cnpj: z.string()
    .min(14, 'CNPJ deve ter 14 dígitos')
    .max(18, 'CNPJ muito longo')
    .regex(/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}\-?\d{2}$/, 'Formato de CNPJ inválido'),
  members: z.number()
    .min(1, 'Deve ter pelo menos 1 membro')
    .max(10000, 'Número muito alto'),
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email muito longo'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(128, 'Senha muito longa')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter ao menos uma letra minúscula, uma maiúscula e um número'),
});

type FreeTrialFormData = z.infer<typeof freeTrialSchema>;

interface FreeTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FreeTrialModal = ({ isOpen, onClose }: FreeTrialModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FreeTrialFormData>({
    resolver: zodResolver(freeTrialSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      cnpj: '',
      members: 1,
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FreeTrialFormData) => {
    setIsLoading(true);
    
    try {
      console.log('Iniciando cadastro...', { email: data.email });
      
      // Limpar e validar CNPJ
      const cleanCnpj = data.cnpj.replace(/[^\d]/g, '');
      console.log('CNPJ limpo:', cleanCnpj);
      
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email.toLowerCase().trim(),
        password: data.password,
        options: {
          data: {
            full_name: data.fullName.trim(),
          }
        }
      });

      if (authError) {
        console.error('Erro no auth:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Erro ao criar usuário');
      }

      console.log('Usuário criado com sucesso:', authData.user.id);

      // Aguardar um momento para garantir que o usuário foi criado
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Criar perfil do cliente
      const clientData = {
        user_id: authData.user.id,
        full_name: data.fullName.trim(),
        phone: data.phone.trim(),
        cnpj: cleanCnpj,
        members: data.members,
        email: data.email.toLowerCase().trim(),
        nome: data.fullName.trim(), // Para compatibilidade
        status: 'ativo',
        tag: 'Período de teste',
      };

      console.log('Dados do cliente a serem inseridos:', clientData);

      const { error: clientError } = await supabase
        .from('clientes')
        .insert(clientData);

      if (clientError) {
        console.error('Erro ao criar cliente:', clientError);
        throw clientError;
      }

      console.log('Cliente criado com sucesso');

      // Criar usuário na tabela usuarios
      const { error: userError } = await supabase
        .from('usuarios')
        .insert({
          id: authData.user.id,
          email: data.email.toLowerCase().trim(),
          nome: data.fullName.trim(),
          role: 'cliente',
          cliente_id: null, // Será atualizado depois se necessário
          ativo: true,
        });

      if (userError) {
        console.error('Erro ao criar usuário na tabela usuarios:', userError);
        errorHandler.logError(userError, {
          action: 'createUserProfile',
          context: { userId: authData.user.id }
        });
      }

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Seu período de teste de 7 dias começou. Verifique seu email para confirmar a conta.",
      });

      onClose();
      form.reset();

      // Redirecionar para dashboard após um pequeno delay
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);

    } catch (error: any) {
      console.error('Erro durante o cadastro:', error);
      
      errorHandler.logError(error, {
        action: 'freeTrialSignup',
        context: { email: data.email },
        userMessage: 'Erro durante cadastro'
      });

      let errorMessage = 'Erro inesperado durante o cadastro';
      
      if (error.message?.includes('duplicate key')) {
        if (error.message.includes('email')) {
          errorMessage = 'Este email já está cadastrado';
        } else if (error.message.includes('cnpj')) {
          errorMessage = 'Este CNPJ já está cadastrado';
        }
      } else if (error.message?.includes('User already registered')) {
        errorMessage = 'Este email já está cadastrado';
      } else if (error.message?.includes('over_email_send_rate_limit')) {
        errorMessage = 'Muitas tentativas de cadastro. Aguarde alguns minutos e tente novamente.';
      } else if (error.code === '42501') {
        errorMessage = 'Erro de permissão. Tente novamente em alguns instantes.';
      }

      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Comece seu Teste Grátis
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            7 dias grátis para conhecer todas as funcionalidades do Church Hub
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Digite seu nome completo" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(11) 99999-9999" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="members"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Membros *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Ex: 100" 
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="00.000.000/0000-00" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="seu@email.com" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 8 caracteres" 
                        {...field} 
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700" 
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  'Iniciar Teste Grátis'
                )}
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Ao criar sua conta, você concorda com nossos termos de uso. 
              Cancele a qualquer momento durante o período de teste.
            </p>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
