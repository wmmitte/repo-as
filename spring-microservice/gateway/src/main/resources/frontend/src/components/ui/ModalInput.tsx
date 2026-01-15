import { useState } from 'react';
import { X } from 'lucide-react';

interface ModalInputProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'textarea';
  required?: boolean;
  confirmText?: string;
  cancelText?: string;
  maxLength?: number;
}

export default function ModalInput({
  isOpen,
  onClose,
  onConfirm,
  title,
  label,
  placeholder,
  type = 'textarea',
  required = true,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  maxLength = 500,
}: ModalInputProps) {
  const [value, setValue] = useState('');

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
    <div className="modal modal-open">
      <div className="modal-box relative">
        {/* Header */}
        <button
          onClick={handleClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          <X size={18} />
        </button>
        
        <h3 className="font-bold text-lg mb-4">{title}</h3>

        {/* Input */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">{label}</span>
            {required && <span className="label-text-alt text-error">*</span>}
          </label>
          
          {type === 'textarea' ? (
            <textarea
              className="textarea textarea-bordered h-32"
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={maxLength}
              autoFocus
            />
          ) : (
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={maxLength}
              autoFocus
            />
          )}
          
          <label className="label">
            <span className="label-text-alt"></span>
            <span className="label-text-alt">
              {value.length}/{maxLength}
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="modal-action">
          <button onClick={handleClose} className="btn btn-ghost">
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className="btn btn-primary"
            disabled={required && !value.trim()}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
