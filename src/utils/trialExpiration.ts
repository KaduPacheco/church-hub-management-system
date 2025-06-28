
import { supabase } from '@/integrations/supabase/client';
import { errorHandler } from './errorHandler';

export const checkAndInactivateExpiredTrials = async () => {
  try {
    // Chamar a função do Supabase para inativar clientes expirados
    const { error } = await supabase.rpc('inactivate_expired_trial_clients');
    
    if (error) {
      errorHandler.logError(error, {
        action: 'inactivateExpiredTrials',
        userMessage: 'Erro ao verificar períodos de teste expirados'
      });
      return false;
    }
    
    console.log('Verificação de períodos de teste executada com sucesso');
    return true;
  } catch (error) {
    errorHandler.logError(error, {
      action: 'inactivateExpiredTrials',
      userMessage: 'Erro ao verificar períodos de teste expirados'
    });
    return false;
  }
};

// Função para verificar se um cliente está no período de teste e quando expira
export const getTrialStatus = async (clienteId: string) => {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('tag, status, created_at')
      .eq('id', clienteId)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    const isTrialClient = data.tag === 'Período de teste';
    const createdAt = new Date(data.created_at);
    const expiresAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias
    const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000));

    return {
      isTrialClient,
      status: data.status,
      expiresAt,
      daysLeft: Math.max(0, daysLeft),
      isExpired: daysLeft <= 0 && isTrialClient
    };
  } catch (error) {
    errorHandler.logError(error, {
      action: 'getTrialStatus',
      context: { clienteId },
      userMessage: 'Erro ao verificar status do período de teste'
    });
    return null;
  }
};
