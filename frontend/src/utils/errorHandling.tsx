/**
 * Enhanced error handling utilities for the User CRUD system
 */

import { AxiosError } from 'axios';

// Error types for better categorization
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: Error;
  statusCode?: number;
  field?: string;
  retryable: boolean;
  userMessage: string;
}

// Error classification based on HTTP status codes and error patterns
export function classifyError(error: any): AppError {
  // Handle Axios errors
  if (error.isAxiosError) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;
    const data = axiosError.response?.data as any;

    switch (status) {
      case 400:
        return {
          type: ErrorType.VALIDATION,
          message: data?.error || 'Neplatné údaje',
          originalError: error,
          statusCode: status,
          field: data?.field,
          retryable: false,
          userMessage: data?.error || 'Zkontrolujte prosím zadané údaje a zkuste to znovu.'
        };

      case 401:
        return {
          type: ErrorType.AUTHENTICATION,
          message: 'Neautorizovaný přístup',
          originalError: error,
          statusCode: status,
          retryable: false,
          userMessage: 'Vaše relace vypršela. Přihlaste se prosím znovu.'
        };

      case 403:
        return {
          type: ErrorType.AUTHORIZATION,
          message: 'Nedostatečná oprávnění',
          originalError: error,
          statusCode: status,
          retryable: false,
          userMessage: 'Nemáte oprávnění k provedení této akce.'
        };

      case 404:
        return {
          type: ErrorType.NOT_FOUND,
          message: 'Zdroj nebyl nalezen',
          originalError: error,
          statusCode: status,
          retryable: false,
          userMessage: 'Požadovaný zdroj nebyl nalezen.'
        };

      case 409:
        return {
          type: ErrorType.CONFLICT,
          message: data?.error || 'Konflikt dat',
          originalError: error,
          statusCode: status,
          retryable: false,
          userMessage: data?.error || 'Došlo ke konfliktu dat. Zkuste to prosím znovu.'
        };

      case 422:
        return {
          type: ErrorType.VALIDATION,
          message: data?.error || 'Chyba validace',
          originalError: error,
          statusCode: status,
          field: data?.field,
          retryable: false,
          userMessage: data?.error || 'Zadané údaje nejsou platné.'
        };

      case 429:
        return {
          type: ErrorType.RATE_LIMIT,
          message: 'Příliš mnoho požadavků',
          originalError: error,
          statusCode: status,
          retryable: true,
          userMessage: 'Příliš mnoho požadavků. Zkuste to prosím za chvíli.'
        };

      case 500:
      case 502:
      case 503:
      case 504:
        return {
          type: ErrorType.SERVER,
          message: 'Chyba serveru',
          originalError: error,
          statusCode: status,
          retryable: true,
          userMessage: 'Došlo k chybě serveru. Zkuste to prosím znovu.'
        };

      default:
        if (!status) {
          return {
            type: ErrorType.NETWORK,
            message: 'Chyba sítě',
            originalError: error,
            retryable: true,
            userMessage: 'Zkontrolujte připojení k internetu a zkuste to znovu.'
          };
        }
    }
  }

  // Handle network errors
  if (error.message?.includes('Network Error') || error.code === 'NETWORK_ERROR') {
    return {
      type: ErrorType.NETWORK,
      message: 'Chyba sítě',
      originalError: error,
      retryable: true,
      userMessage: 'Zkontrolujte připojení k internetu a zkuste to znovu.'
    };
  }

  // Handle timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return {
      type: ErrorType.NETWORK,
      message: 'Časový limit vypršel',
      originalError: error,
      retryable: true,
      userMessage: 'Požadavek trval příliš dlouho. Zkuste to prosím znovu.'
    };
  }

  // Default unknown error
  return {
    type: ErrorType.UNKNOWN,
    message: error.message || 'Neznámá chyba',
    originalError: error,
    retryable: false,
    userMessage: 'Došlo k neočekávané chybě. Zkuste to prosím znovu.'
  };
}

// Error logging service
class ErrorLogger {
  private static logs: Array<{
    error: AppError;
    timestamp: Date;
    context?: string;
    userId?: string;
  }> = [];

  static log(error: AppError, context?: string, userId?: string) {
    const logEntry = {
      error,
      timestamp: new Date(),
      context,
      userId
    };

    this.logs.push(logEntry);

    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', logEntry);
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(logEntry);
    }
  }

  private static async sendToMonitoringService(logEntry: any) {
    try {
      // This would typically send to a service like Sentry, LogRocket, etc.
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logEntry)
      });
    } catch (e) {
      // Silently fail - don't want error logging to cause more errors
      console.warn('Failed to send error to monitoring service:', e);
    }
  }

  static getLogs() {
    return [...this.logs];
  }

  static getLogsByType(type: ErrorType) {
    return this.logs.filter(log => log.error.type === type);
  }

  static clearLogs() {
    this.logs = [];
  }
}

// Retry mechanism for retryable errors
export class RetryManager {
  private static retryAttempts = new Map<string, number>();
  private static maxRetries = 3;
  private static retryDelays = [1000, 2000, 4000]; // Exponential backoff

  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationId: string,
    maxRetries: number = this.maxRetries
  ): Promise<T> {
    const attempts = this.retryAttempts.get(operationId) || 0;

    try {
      const result = await operation();
      // Reset retry count on success
      this.retryAttempts.delete(operationId);
      return result;
    } catch (error) {
      const appError = classifyError(error);
      
      if (!appError.retryable || attempts >= maxRetries) {
        this.retryAttempts.delete(operationId);
        throw appError;
      }

      // Increment retry count
      this.retryAttempts.set(operationId, attempts + 1);

      // Wait before retry with exponential backoff
      const delay = this.retryDelays[attempts] || this.retryDelays[this.retryDelays.length - 1];
      await new Promise(resolve => setTimeout(resolve, delay));

      // Recursive retry
      return this.executeWithRetry(operation, operationId, maxRetries);
    }
  }

  static clearRetryCount(operationId: string) {
    this.retryAttempts.delete(operationId);
  }

  static getRetryCount(operationId: string): number {
    return this.retryAttempts.get(operationId) || 0;
  }
}

// React hook for error handling
export function useErrorHandler() {
  const [errors, setErrors] = React.useState<AppError[]>([]);

  const handleError = React.useCallback((error: any, context?: string) => {
    const appError = classifyError(error);
    
    // Log the error
    ErrorLogger.log(appError, context);
    
    // Add to component state
    setErrors(prev => [...prev, appError]);
    
    return appError;
  }, []);

  const clearError = React.useCallback((index: number) => {
    setErrors(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearAllErrors = React.useCallback(() => {
    setErrors([]);
  }, []);

  return {
    errors,
    handleError,
    clearError,
    clearAllErrors
  };
}

// Error boundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: AppError;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{
    fallback?: React.ComponentType<{ error: AppError; retry: () => void }>;
    onError?: (error: AppError) => void;
  }>,
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const appError = classifyError(error);
    return {
      hasError: true,
      error: appError
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const appError = classifyError(error);
    ErrorLogger.log(appError, `React Error Boundary: ${errorInfo.componentStack}`);
    
    if (this.props.onError) {
      this.props.onError(appError);
    }
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }

      return (
        <div className="error-boundary p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Něco se pokazilo
          </h2>
          <p className="text-red-700 mb-4">
            {this.state.error.userMessage}
          </p>
          <button
            onClick={this.retry}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Zkusit znovu
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Validation error helpers
export function createValidationError(field: string, message: string): AppError {
  return {
    type: ErrorType.VALIDATION,
    message,
    field,
    retryable: false,
    userMessage: message
  };
}

export function formatValidationErrors(errors: Record<string, string>): AppError[] {
  return Object.entries(errors).map(([field, message]) =>
    createValidationError(field, message)
  );
}

// Export the error logger and retry manager
export { ErrorLogger, RetryManager };

// React import
import React from 'react';
