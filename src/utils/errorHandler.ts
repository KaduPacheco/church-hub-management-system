
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
      // You could send this to a logging service like Sentry
      // For now, we'll just store minimal info
      const sanitizedError = {
        action: info.action,
        message: info.userMessage || 'Ocorreu um erro inesperado',
        timestamp: new Date().toISOString(),
        userId: info.context?.userId || 'unknown'
      };
      
      // Could be sent to external logging service
      // loggingService.log(sanitizedError);
    }
  }

  getUserMessage(error: any, defaultMessage: string = 'Ocorreu um erro inesperado'): string {
    // Return safe, user-friendly error messages
    if (error?.message?.includes('Invalid login credentials')) {
      return 'Email ou senha incorretos';
    }
    if (error?.message?.includes('Email not confirmed')) {
      return 'Email não confirmado';
    }
    if (error?.message?.includes('too_many_requests')) {
      return 'Muitas tentativas. Tente novamente em alguns minutos';
    }
    
    return defaultMessage;
  }
}

export const errorHandler = new SecureErrorHandler();
