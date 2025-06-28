
interface ErrorInfo {
  action: string;
  context?: Record<string, any>;
  userMessage?: string;
}

class SecureErrorHandler {
  private isDevelopment = process.env.NODE_ENV === 'development';

  logError(error: any, info: ErrorInfo) {
    // Only log detailed errors in development
    if (this.isDevelopment) {
      console.error(`[${info.action}] Error:`, error);
      if (info.context) {
        console.error('Context:', info.context);
      }
    }

    // In production, only log sanitized error info
    if (!this.isDevelopment) {
      // Send minimal, safe information to external logging service
      const sanitizedError = {
        action: info.action,
        message: info.userMessage || 'Ocorreu um erro inesperado',
        timestamp: new Date().toISOString(),
        userId: info.context?.userId || 'unknown',
        // Only include safe error codes, not full messages
        errorCode: error?.code || 'unknown'
      };
      
      // This could be sent to external logging service like Sentry
      // loggingService.log(sanitizedError);
      console.warn('Error logged:', sanitizedError.action);
    }
  }

  getUserMessage(error: any, defaultMessage: string = 'Ocorreu um erro inesperado'): string {
    // Return safe, user-friendly error messages without exposing system details
    const errorMessage = error?.message?.toLowerCase() || '';
    
    if (errorMessage.includes('invalid login credentials') || errorMessage.includes('invalid_credentials')) {
      return 'Email ou senha incorretos';
    }
    if (errorMessage.includes('email not confirmed') || errorMessage.includes('unconfirmed')) {
      return 'Verifique sua caixa de email e confirme sua conta';
    }
    if (errorMessage.includes('too_many_requests') || errorMessage.includes('rate_limit')) {
      return 'Muitas tentativas. Tente novamente em alguns minutos';
    }
    if (errorMessage.includes('weak_password')) {
      return 'Senha muito fraca. Use pelo menos 8 caracteres com letras e números';
    }
    if (errorMessage.includes('signup_disabled')) {
      return 'Cadastros temporariamente desabilitados';
    }
    if (error?.code === '23505') {
      return 'Este email ou CNPJ já está cadastrado';
    }
    if (error?.code === '42501') {
      return 'Acesso negado. Verifique suas permissões';
    }
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'Problema de conexão. Verifique sua internet e tente novamente';
    }
    
    return defaultMessage;
  }

  // Sanitize sensitive data from logs
  sanitizeForLogging(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'cnpj', 'cpf'];
    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}

export const errorHandler = new SecureErrorHandler();
