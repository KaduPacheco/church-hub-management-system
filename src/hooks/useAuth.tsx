
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
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

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Buscando perfil do usuário:', userId);
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
        
        // Se o usuário não existe na tabela usuarios, pode ser um problema de sincronização
        if (error.code === 'PGRST116') {
          console.log('Usuário não encontrado na tabela usuarios');
          toast({
            title: "Erro de perfil",
            description: "Perfil de usuário não encontrado. Entre em contato com o administrador.",
            variant: "destructive",
          });
        }
        return null;
      }

      console.log('Perfil encontrado:', data);
      return data;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
  };

  const redirectUserBasedOnRole = (role: string, clienteId?: string, igrejaId?: string) => {
    console.log('Redirecionando usuário baseado na role:', role);
    
    switch (role) {
      case 'superadmin':
        window.location.href = '/superadmin';
        break;
      case 'cliente':
        window.location.href = '/dashboard';
        break;
      case 'admin_igreja':
        if (igrejaId) {
          window.location.href = `/church/${igrejaId}`;
        } else {
          window.location.href = '/dashboard';
        }
        break;
      default:
        console.error('Role desconhecida:', role);
        window.location.href = '/';
    }
  };

  useEffect(() => {
    console.log('Configurando listener de autenticação');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Evento de autenticação:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile when authenticated
          setTimeout(async () => {
            const profile = await fetchUserProfile(session.user.id);
            if (profile) {
              setUserProfile(profile);
              // Only redirect if user is logging in (not on page refresh)
              if (event === 'SIGNED_IN') {
                redirectUserBasedOnRole(profile.role, profile.cliente_id, profile.igreja_id);
              }
            } else {
              console.error('Não foi possível carregar o perfil do usuário');
              setUserProfile(null);
            }
          }, 0);
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Sessão existente:', session?.user?.id);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id).then(profile => {
          if (profile) {
            setUserProfile(profile);
          }
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Tentando fazer login com:', email);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro no login:', error);
        
        let errorMessage = error.message;
        
        // Personalizar mensagens de erro
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email não confirmado. Verifique sua caixa de entrada.';
        }
        
        toast({
          title: "Erro no login",
          description: errorMessage,
          variant: "destructive",
        });
        return { error };
      }

      console.log('Login realizado com sucesso');
      return { error: null };
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Fazendo logout');
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
      setSession(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      session,
      loading,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
