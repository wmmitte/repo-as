import { useState } from 'react';
import { X, MessageSquare, AlertCircle, HelpCircle, Send, Lightbulb } from 'lucide-react';

type VarianteModal = 'default' | 'warning' | 'info' | 'danger';

interface RaisonPredefinie {
  label: string;
  value: string;
}

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
  raisonsPredefinis?: RaisonPredefinie[];
  conseil?: string;
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
  raisonsPredefinis,
  conseil,
}: ModalInputProps) {
  const [value, setValue] = useState('');

  const config = CONFIG_VARIANTE[variante];
  const Icone = config.icone;

  const handleSelectRaison = (raison: RaisonPredefinie) => {
    setValue(prev => {
      if (prev.includes(raison.value)) return prev;
      return prev ? `${prev}\n${raison.value}` : raison.value;
    });
  };

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
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg max-w-xs w-full shadow-xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header compact */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded-md ${config.classeFond}`}>
              <Icone size={14} className={config.classeIcone} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-xs">{title}</h3>
              {description && (
                <p className="text-[10px] text-gray-500">{description}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-0.5 hover:bg-slate-100 rounded transition-colors"
          >
            <X size={14} className="text-gray-400" />
          </button>
        </div>

        {/* Content compact */}
        <div className="px-3 py-2">
          {/* Raisons prédéfinies */}
          {raisonsPredefinis && raisonsPredefinis.length > 0 && (
            <div className="mb-2">
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Raisons rapides</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {raisonsPredefinis.map((raison, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectRaison(raison)}
                    className={`px-2 py-0.5 text-[10px] rounded-full border transition-colors ${
                      value.includes(raison.value)
                        ? 'bg-primary/10 border-primary/30 text-primary'
                        : 'bg-slate-50 border-slate-200 text-gray-600 hover:bg-slate-100'
                    }`}
                  >
                    {raison.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <label className="block text-[10px] font-medium text-gray-600 mb-1">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>

          {type === 'textarea' ? (
            <textarea
              className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs resize-none focus:ring-1 focus:ring-primary/30 focus:border-primary transition-colors"
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={maxLength}
              rows={2}
              autoFocus
            />
          ) : (
            <input
              type="text"
              className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-primary/30 focus:border-primary transition-colors"
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={maxLength}
              autoFocus
            />
          )}

          <div className="flex items-center justify-between mt-1">
            {conseil && (
              <div className="flex items-center gap-1 text-[10px] text-amber-600">
                <Lightbulb size={10} />
                <span>{conseil}</span>
              </div>
            )}
            <span className="text-[10px] text-gray-400 ml-auto">
              {value.length}/{maxLength}
            </span>
          </div>
        </div>

        {/* Footer compact */}
        <div className="flex items-center justify-end gap-1.5 px-3 py-2 border-t border-slate-200 bg-slate-50 rounded-b-lg">
          <button
            onClick={handleClose}
            className="px-2 py-1 text-gray-600 hover:bg-slate-200 rounded transition-colors text-xs font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={required && !value.trim()}
            className={`px-2.5 py-1 text-white rounded transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 ${config.classeBouton}`}
          >
            <Send size={10} />
            {confirmText} 
          </button>
        </div>
      </div>
    </div>
  );
}
