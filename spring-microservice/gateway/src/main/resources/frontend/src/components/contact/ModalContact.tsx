import { useState } from 'react';
import { Mail, Send, X, User, AlertCircle, CheckCircle } from 'lucide-react';
import { Expert } from '@/types/expert.types';
import { contactService, CreerDemandeContactRequest } from '@/services/contactService';
import { useToast } from '@/contexts/ToastContext';

interface ModalContactProps {
  expert: Expert;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ModalContact({ expert, isOpen, onClose, onSuccess }: ModalContactProps) {
  const toast = useToast();
  const [objet, setObjet] = useState('');
  const [message, setMessage] = useState('');
  const [emailReponse, setEmailReponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ objet?: string; message?: string }>({});

  if (!isOpen) return null;

  const validerFormulaire = (): boolean => {
    const newErrors: { objet?: string; message?: string } = {};

    if (!objet.trim()) {
      newErrors.objet = 'L\'objet est obligatoire';
    } else if (objet.length > 255) {
      newErrors.objet = 'L\'objet ne peut pas dépasser 255 caractères';
    }

    if (!message.trim()) {
      newErrors.message = 'Le message est obligatoire';
    } else if (message.length > 5000) {
      newErrors.message = 'Le message ne peut pas dépasser 5000 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validerFormulaire()) return;

    try {
      setLoading(true);
      const request: CreerDemandeContactRequest = {
        objet: objet.trim(),
        message: message.trim(),
        emailReponse: emailReponse.trim() || undefined,
      };

      await contactService.envoyerDemandeContact(expert.id, request);

      toast.succes('Message envoyé avec succès ! L\'expert sera notifié.');

      // Réinitialiser le formulaire
      setObjet('');
      setMessage('');
      setEmailReponse('');
      setErrors({});

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message:', error);
      // Le service fetch lance une Error avec le message directement
      const errorMessage = error?.message || 'Erreur lors de l\'envoi du message';
      toast.erreur(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setObjet('');
      setMessage('');
      setEmailReponse('');
      setErrors({});
      onClose();
    }
  };

  // Générer les initiales
  const genererInitiales = (): string => {
    const initialePrenom = expert.prenom?.charAt(0)?.toUpperCase() || '';
    const initialeNom = expert.nom?.charAt(0)?.toUpperCase() || '';
    return `${initialePrenom}${initialeNom}` || '?';
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl max-w-lg w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <Mail size={20} className="text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Contacter</h3>
              <p className="text-xs text-gray-500">{expert.prenom} {expert.nom}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Carte expert (compacte) */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            {expert.photoUrl ? (
              <img
                src={expert.photoUrl}
                alt={`${expert.prenom} ${expert.nom}`}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-sm">
                {genererInitiales()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">{expert.titre}</p>
              {expert.localisation && (
                <p className="text-xs text-gray-500 truncate">{expert.localisation}</p>
              )}
            </div>
            {expert.disponible && (
              <span className="badge badge-success badge-sm gap-1">
                <CheckCircle size={10} />
                Disponible
              </span>
            )}
          </div>
        </div>

        {/* Formulaire */}
        <div className="px-5 py-4 space-y-4">
          {/* Objet */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-medium text-gray-700">
                Objet du message <span className="text-error">*</span>
              </span>
              <span className="label-text-alt text-gray-400">
                {objet.length}/255
              </span>
            </label>
            <input
              type="text"
              value={objet}
              onChange={(e) => {
                setObjet(e.target.value);
                if (errors.objet) setErrors({ ...errors, objet: undefined });
              }}
              placeholder="Ex: Demande de collaboration, Question sur vos services..."
              className={`input input-bordered input-sm w-full ${errors.objet ? 'input-error' : ''}`}
              disabled={loading}
              maxLength={255}
            />
            {errors.objet && (
              <label className="label py-1">
                <span className="label-text-alt text-error flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.objet}
                </span>
              </label>
            )}
          </div>

          {/* Message */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-medium text-gray-700">
                Votre message <span className="text-error">*</span>
              </span>
              <span className="label-text-alt text-gray-400">
                {message.length}/5000
              </span>
            </label>
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (errors.message) setErrors({ ...errors, message: undefined });
              }}
              placeholder="Décrivez votre demande, votre projet ou posez vos questions..."
              className={`textarea textarea-bordered w-full text-sm resize-none ${errors.message ? 'textarea-error' : ''}`}
              rows={4}
              disabled={loading}
              maxLength={5000}
            />
            {errors.message && (
              <label className="label py-1">
                <span className="label-text-alt text-error flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.message}
                </span>
              </label>
            )}
          </div>

          {/* Email de réponse */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-medium text-gray-700">
                Email de réponse <span className="text-gray-400 font-normal">(optionnel)</span>
              </span>
            </label>
            <input
              type="email"
              value={emailReponse}
              onChange={(e) => setEmailReponse(e.target.value)}
              placeholder="votre.email@exemple.com"
              className="input input-bordered input-sm w-full"
              disabled={loading}
            />
            <label className="label py-1">
              <span className="label-text-alt text-gray-400">
                Si vous souhaitez recevoir la réponse sur un email spécifique
              </span>
            </label>
          </div>

          {/* Info */}
          <div className="bg-info/10 border border-info/20 rounded-lg p-3">
            <p className="text-xs text-info flex items-start gap-2">
              <User size={14} className="flex-shrink-0 mt-0.5" />
              <span>
                L'expert sera notifié de votre message et pourra vous répondre directement
                via la plateforme ou par email.
              </span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          <button
            onClick={handleClose}
            disabled={loading}
            className="btn btn-ghost btn-sm"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !objet.trim() || !message.trim()}
            className="btn btn-success btn-sm gap-2"
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Envoi...
              </>
            ) : (
              <>
                <Send size={14} />
                Envoyer le message
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
