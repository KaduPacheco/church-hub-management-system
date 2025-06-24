
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

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
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
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
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
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        let errorMessage = 'Erro no login';
        
        switch (error.message) {
          case 'Invalid login credentials':
            errorMessage = 'Email ou senha incorretos';
            break;
          case 'Email not confirmed':
            errorMessage = 'Email não confirmado';
            break;
          default:
            errorMessage = error.message;
        }
        
        toast({
          title: "Erro no login",
          description: errorMessage,
          variant: "destructive",
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
      console.error('Erro no login:', error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro inesperado.",
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
      console.error('Erro no logout:', error);
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
