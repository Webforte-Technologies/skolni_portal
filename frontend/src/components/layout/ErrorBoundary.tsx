import React from 'react';
// import { useToast } from '../../contexts/ToastContext';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-6">
          <div className="max-w-lg w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-soft text-center">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Something went wrong</h2>
            <p className="text-neutral-600 dark:text-neutral-300 mb-4">An unexpected error occurred. Please refresh the page. If the problem persists, contact support.</p>
            <button onClick={() => window.location.reload()} className="inline-flex items-center justify-center bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">Zkusit znovu</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;


