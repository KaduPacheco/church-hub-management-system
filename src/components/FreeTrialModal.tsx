
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

// Tipo para o retorno da função create_trial_client
interface TrialClientResult {
  success: boolean;
  error?: string;
  client_id?: string;
}

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
      // Sanitizar e validar dados
      const sanitizedData = {
        fullName: data.fullName.trim(),
        phone: data.phone.trim(),
        cnpj: data.cnpj.replace(/[^\d]/g, ''),
        members: data.members,
        email: data.email.toLowerCase().trim(),
        password: data.password,
      };

      // Verificar se CNPJ tem exatamente 14 dígitos após limpeza
      if (sanitizedData.cnpj.length !== 14) {
        throw new Error('CNPJ deve ter exatamente 14 dígitos');
      }

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: sanitizedData.email,
        password: sanitizedData.password,
        options: {
          data: {
            full_name: sanitizedData.fullName,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Falha na criação do usuário');
      }

      // Usar a função segura do banco para criar o cliente
      const { data: clientResult, error: clientError } = await supabase.rpc(
        'create_trial_client',
        {
          p_user_id: authData.user.id,
          p_full_name: sanitizedData.fullName,
          p_phone: sanitizedData.phone,
          p_cnpj: sanitizedData.cnpj,
          p_members: sanitizedData.members,
          p_email: sanitizedData.email,
        }
      );

      if (clientError) {
        // Se falhar, tentar limpar o usuário criado no Auth
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (cleanupError) {
          console.error('Erro ao limpar usuário após falha:', cleanupError);
        }
        throw clientError;
      }

      // Fazer cast do resultado para o tipo correto
      const result = clientResult as TrialClientResult;

      // Verificar resultado da função
      if (!result?.success) {
        // Se falhar, tentar limpar o usuário criado no Auth
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (cleanupError) {
          console.error('Erro ao limpar usuário após falha:', cleanupError);
        }
        throw new Error(result?.error || 'Erro ao criar cliente');
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
      errorHandler.logError(error, {
        action: 'freeTrialSignup',
        context: { email: data.email },
        userMessage: 'Erro durante cadastro'
      });

      let errorMessage = 'Erro inesperado durante o cadastro';
      
      // Tratar erros específicos de forma segura
      if (error.message?.includes('Email já cadastrado') || error.message?.includes('duplicate key')) {
        errorMessage = 'Este email já está cadastrado';
      } else if (error.message?.includes('CNPJ já cadastrado')) {
        errorMessage = 'Este CNPJ já está cadastrado';
      } else if (error.message?.includes('CNPJ inválido')) {
        errorMessage = 'CNPJ informado é inválido';
      } else if (error.message?.includes('User already registered')) {
        errorMessage = 'Este email já está cadastrado';
      } else if (error.message?.includes('over_email_send_rate_limit')) {
        errorMessage = 'Muitas tentativas de cadastro. Aguarde alguns minutos e tente novamente.';
      } else if (error.code === '23505') {
        errorMessage = 'Email ou CNPJ já cadastrado';
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
                      maxLength={100}
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
                        maxLength={15}
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
                        min="1"
                        max="10000"
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
                      maxLength={18}
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
                      maxLength={255}
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
                        maxLength={128}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                        tabIndex={-1}
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
