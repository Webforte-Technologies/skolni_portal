import React from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-success-50 border-success-200 text-success-800';
      case 'error':
        return 'bg-danger-50 border-danger-200 text-danger-800';
      case 'warning':
        return 'bg-warning-50 border-warning-200 text-warning-800';
      case 'info':
        return 'bg-info-50 border-info-200 text-info-800';
      default:
        return 'bg-neutral-50 border-neutral-200 text-neutral-800';
    }
  };

  return (
    <div className={cn('flex items-center justify-between p-4 border rounded-md shadow-soft animate-slide-up', getToastStyles())}>
      <div className="flex items-center space-x-2">
        {toast.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
        {toast.type === 'error' && <AlertCircle className="h-4 w-4" />}
        {toast.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
        {toast.type === 'info' && <Info className="h-4 w-4" />}
        <span className="text-sm font-medium">{toast.message}</span>
      </div>
      <div className="ml-4 flex items-center gap-2">
        {toast.onAction && toast.actionLabel && (
          <button onClick={toast.onAction} className="text-primary-600 hover:underline text-sm">
            {toast.actionLabel}
          </button>
        )}
        <button onClick={() => onRemove(toast.id)} className="text-neutral-400 hover:text-neutral-600">
        <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
