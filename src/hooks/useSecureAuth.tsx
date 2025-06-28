
import { useState, useEffect } from 'react';
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

interface SecureAuthState {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isTrialExpired: boolean;
}

export const useSecureAuth = (): SecureAuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTrialExpired, setIsTrialExpired] = useState(false);

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

  const checkTrialStatus = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_trial_expired', {
        client_user_id: userId
      });

      if (error) {
        console.error('Erro ao verificar status do trial:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Erro ao verificar status do trial:', error);
      return false;
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
              
              // Check trial status for cliente users
              if (profile?.role === 'cliente') {
                const expired = await checkTrialStatus(initialSession.user.id);
                setIsTrialExpired(expired);
              }
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
              // Use setTimeout to prevent callback recursion
              setTimeout(async () => {
                if (mounted) {
                  const profile = await fetchUserProfile(session.user.id);
                  setUserProfile(profile);
                  
                  // Check trial status for cliente users
                  if (profile?.role === 'cliente') {
                    const expired = await checkTrialStatus(session.user.id);
                    setIsTrialExpired(expired);
                  }
                }
              }, 0);
            } else {
              setUserProfile(null);
              setIsTrialExpired(false);
            }
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        errorHandler.logError(error, {
          action: 'initSecureAuth',
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

  return {
    user,
    userProfile,
    session,
    loading,
    isTrialExpired
  };
};
