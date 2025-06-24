
import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string;
  role: 'superadmin' | 'cliente' | 'admin_igreja';
  cliente_id?: string;
  igreja_id?: string;
  nome?: string;
  ativo: boolean;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  session: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('Buscando perfil do usuário:', userId);
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
        toast({
          title: "Erro de perfil",
          description: "Não foi possível carregar o perfil do usuário.",
          variant: "destructive",
        });
        return null;
      }

      if (!data) {
        console.error('Usuário não encontrado na tabela usuarios');
        toast({
          title: "Usuário não encontrado",
          description: "Perfil de usuário não encontrado. Entre em contato com o administrador.",
          variant: "destructive",
        });
        return null;
      }

      console.log('Perfil encontrado:', data);
      return data;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
  }, []);

  const performRedirect = useCallback((role: string, clienteId?: string, igrejaId?: string) => {
    console.log('Redirecionando usuário baseado na role:', role);
    
    let redirectUrl = '/';
    
    switch (role) {
      case 'superadmin':
        redirectUrl = '/superadmin';
        break;
      case 'cliente':
        redirectUrl = '/dashboard';
        break;
      case 'admin_igreja':
        redirectUrl = igrejaId ? `/church/${igrejaId}` : '/dashboard';
        break;
      default:
        console.error('Role desconhecida:', role);
        redirectUrl = '/';
    }

    console.log('Redirecionando para:', redirectUrl);
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 100);
  }, []);

  const handleAuthStateChange = useCallback(async (event: string, session: Session | null) => {
    console.log('=== AUTH STATE CHANGE ===');
    console.log('Evento:', event);
    console.log('Session user ID:', session?.user?.id);
    console.log('Is processing:', isProcessing);

    // Evita processamento duplicado
    if (isProcessing && event !== 'SIGNED_OUT') {
      console.log('Já processando, ignorando evento:', event);
      return;
    }

    setIsProcessing(true);
    setSession(session);
    setUser(session?.user ?? null);

    try {
      if (session?.user) {
        console.log('Usuário logado, buscando perfil...');
        const profile = await fetchUserProfile(session.user.id);
        
        if (profile && profile.ativo) {
          console.log('Perfil carregado e ativo:', profile);
          setUserProfile(profile);
          
          // Só redireciona em login efetivo, não em refresh de página
          if (event === 'SIGNED_IN') {
            console.log('Login detectado, iniciando redirecionamento...');
            performRedirect(profile.role, profile.cliente_id, profile.igreja_id);
          }
        } else if (profile && !profile.ativo) {
          console.log('Usuário inativo');
          setUserProfile(null);
          toast({
            title: "Acesso negado",
            description: "Sua conta está inativa. Entre em contato com o administrador.",
            variant: "destructive",
          });
          await supabase.auth.signOut();
        } else {
          console.log('Perfil não encontrado ou inválido');
          setUserProfile(null);
          await supabase.auth.signOut();
        }
      } else {
        console.log('Usuário não logado');
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Erro no handleAuthStateChange:', error);
      setUserProfile(null);
    } finally {
      setLoading(false);
      setIsProcessing(false);
      console.log('=== FIM AUTH STATE CHANGE ===');
    }
  }, [isProcessing, fetchUserProfile, performRedirect]);

  useEffect(() => {
    console.log('=== INICIALIZANDO AUTH PROVIDER ===');
    
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        // Configurar listener de mudanças de auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (mounted) {
              handleAuthStateChange(event, session);
            }
          }
        );

        // Verificar sessão existente
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão:', error);
          setLoading(false);
          return;
        }

        if (mounted) {
          if (session) {
            console.log('Sessão existente encontrada');
            await handleAuthStateChange('INITIAL_SESSION', session);
          } else {
            console.log('Nenhuma sessão existente');
            setLoading(false);
          }
        }

        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Erro na inicialização:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const cleanup = initializeAuth();
    
    return () => {
      mounted = false;
      cleanup.then(cleanupFn => cleanupFn && cleanupFn());
    };
  }, [handleAuthStateChange]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('=== INICIANDO LOGIN ===');
      console.log('Email:', email);
      
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        console.error('Erro no login:', error);
        
        let errorMessage = 'Erro desconhecido no login';
        
        switch (error.message) {
          case 'Invalid login credentials':
            errorMessage = 'Email ou senha incorretos';
            break;
          case 'Email not confirmed':
            errorMessage = 'Email não confirmado. Verifique sua caixa de entrada.';
            break;
          case 'Too many requests':
            errorMessage = 'Muitas tentativas de login. Tente novamente em alguns minutos.';
            break;
          default:
            errorMessage = error.message;
        }
        
        toast({
          title: "Erro no login",
          description: errorMessage,
          variant: "destructive",
        });
        
        setLoading(false);
        return { error };
      }

      console.log('Login bem-sucedido:', data.user?.id);
      return { error: null };
    } catch (error) {
      console.error('Exceção no login:', error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      setLoading(false);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('=== FAZENDO LOGOUT ===');
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro no logout:', error);
      }
      
      // Limpar estado local
      setUser(null);
      setUserProfile(null);
      setSession(null);
      setIsProcessing(false);
      
      // Redirecionar para home
      window.location.href = '/';
    } catch (error) {
      console.error('Exceção no logout:', error);
    } finally {
      setLoading(false);
    }
  };

  const contextValue = {
    user,
    userProfile,
    session,
    loading,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
