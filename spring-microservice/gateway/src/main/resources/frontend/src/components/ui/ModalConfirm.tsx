import { AlertCircle } from 'lucide-react';

interface ModalConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'error' | 'success';
}

export default function ModalConfirm({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  type = 'warning',
}: ModalConfirmProps) {
  if (!isOpen) return null;

  const typeStyles = {
    info: 'alert-info',
    warning: 'alert-warning',
    error: 'alert-error',
    success: 'alert-success',
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">{title}</h3>
        
        <div className={`alert ${typeStyles[type]} mb-6`}>
          <AlertCircle size={24} />
          <span>{message}</span>
        </div>

        <div className="modal-action">
          <button onClick={onClose} className="btn btn-ghost">
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`btn ${
              type === 'error' ? 'btn-error' :
              type === 'success' ? 'btn-success' :
              type === 'warning' ? 'btn-warning' :
              'btn-primary'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
