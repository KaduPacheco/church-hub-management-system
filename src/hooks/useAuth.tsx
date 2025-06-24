
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { errorHandler } from '@/utils/errorHandler';

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

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        errorHandler.logError(error, {
          action: 'fetchUserProfile',
          context: { userId },
          userMessage: 'Erro ao carregar perfil do usuário'
        });
        return null;
      }

      if (!data) {
        toast({
          title: "Perfil não encontrado",
          description: "Entre em contato com o administrador.",
          variant: "destructive",
        });
        return null;
      }

      if (!data.ativo) {
        toast({
          title: "Conta inativa",
          description: "Sua conta está inativa. Entre em contato com o administrador.",
          variant: "destructive",
        });
        return null;
      }

      return data;
    } catch (error) {
      errorHandler.logError(error, {
        action: 'fetchUserProfile',
        context: { userId },
        userMessage: 'Erro ao carregar perfil do usuário'
      });
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          if (initialSession?.user) {
            const profile = await fetchUserProfile(initialSession.user.id);
            if (mounted) {
              setUserProfile(profile);
            }
          }
          
          setLoading(false);
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;

            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
              const profile = await fetchUserProfile(session.user.id);
              if (mounted) {
                setUserProfile(profile);
              }
            } else {
              setUserProfile(null);
            }
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        errorHandler.logError(error, {
          action: 'initAuth',
          userMessage: 'Erro ao inicializar autenticação'
        });
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      if (error) {
        const userMessage = errorHandler.getUserMessage(error);
        
        toast({
          title: "Erro no login",
          description: userMessage,
          variant: "destructive",
        });

        errorHandler.logError(error, {
          action: 'signIn',
          context: { email: email.trim().toLowerCase() },
          userMessage
        });
        
        return { error };
      }

      // Success - the auth state change will handle profile loading
      toast({
        title: "Login realizado",
        description: "Bem-vindo ao sistema!",
      });

      return { error: null };
    } catch (error) {
      const userMessage = 'Ocorreu um erro inesperado no login';
      
      errorHandler.logError(error, {
        action: 'signIn',
        context: { email: email.trim().toLowerCase() },
        userMessage
      });
      
      toast({
        title: "Erro no login",
        description: userMessage,
        variant: "destructive",
      });
      
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
      setSession(null);
      
      // Redirect to home after logout
      window.location.href = '/';
    } catch (error) {
      errorHandler.logError(error, {
        action: 'signOut',
        userMessage: 'Erro ao fazer logout'
      });
    }
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        userProfile,
        session,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
