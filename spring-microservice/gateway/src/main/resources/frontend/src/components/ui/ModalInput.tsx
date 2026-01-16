import { useState } from 'react';
import { X, MessageSquare, AlertCircle, HelpCircle, Send } from 'lucide-react';

type VarianteModal = 'default' | 'warning' | 'info' | 'danger';

interface ModalInputProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  label: string;
  placeholder?: string;
  description?: string;
  type?: 'text' | 'textarea';
  required?: boolean;
  confirmText?: string;
  cancelText?: string;
  maxLength?: number;
  variante?: VarianteModal;
}

// Configuration des variantes
const CONFIG_VARIANTE: Record<VarianteModal, {
  icone: typeof MessageSquare;
  classeIcone: string;
  classeFond: string;
  classeBouton: string;
}> = {
  default: {
    icone: MessageSquare,
    classeIcone: 'text-primary',
    classeFond: 'bg-primary/10',
    classeBouton: 'bg-primary hover:bg-primary/90',
  },
  warning: {
    icone: AlertCircle,
    classeIcone: 'text-amber-600',
    classeFond: 'bg-amber-100',
    classeBouton: 'bg-amber-500 hover:bg-amber-600',
  },
  info: {
    icone: HelpCircle,
    classeIcone: 'text-blue-600',
    classeFond: 'bg-blue-100',
    classeBouton: 'bg-blue-500 hover:bg-blue-600',
  },
  danger: {
    icone: AlertCircle,
    classeIcone: 'text-red-600',
    classeFond: 'bg-red-100',
    classeBouton: 'bg-red-500 hover:bg-red-600',
  },
};

export default function ModalInput({
  isOpen,
  onClose,
  onConfirm,
  title,
  label,
  placeholder,
  description,
  type = 'textarea',
  required = true,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  maxLength = 500,
  variante = 'default',
}: ModalInputProps) {
  const [value, setValue] = useState('');

  const config = CONFIG_VARIANTE[variante];
  const Icone = config.icone;

  const handleConfirm = () => {
    if (required && !value.trim()) {
      return;
    }
    onConfirm(value);
    setValue('');
  };

  const handleClose = () => {
    setValue('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl max-w-sm w-full shadow-xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${config.classeFond}`}>
              <Icone size={18} className={config.classeIcone} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
              {description && (
                <p className="text-xs text-gray-500">{description}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-3">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>

          {type === 'textarea' ? (
            <textarea
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={maxLength}
              rows={3}
              autoFocus
            />
          ) : (
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={maxLength}
              autoFocus
            />
          )}

          <div className="flex justify-end mt-1">
            <span className="text-xs text-gray-400">
              {value.length}/{maxLength}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          <button
            onClick={handleClose}
            className="px-3 py-1.5 text-gray-600 hover:bg-slate-200 rounded-lg transition-colors text-sm font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={required && !value.trim()}
            className={`px-4 py-1.5 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 ${config.classeBouton}`}
          >
            <Send size={14} />
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
