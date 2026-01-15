import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, isOpen, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const styles = {
    success: {
      bg: 'bg-success',
      icon: CheckCircle,
      alertClass: 'alert-success'
    },
    error: {
      bg: 'bg-error',
      icon: XCircle,
      alertClass: 'alert-error'
    },
    warning: {
      bg: 'bg-warning',
      icon: AlertCircle,
      alertClass: 'alert-warning'
    },
    info: {
      bg: 'bg-info',
      icon: Info,
      alertClass: 'alert-info'
    }
  };

  const config = styles[type];
  const Icon = config.icon;

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top-2 duration-300">
      <div className={`alert ${config.alertClass} shadow-lg max-w-md`}>
        <Icon size={24} />
        <span className="font-medium">{message}</span>
        <button 
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
