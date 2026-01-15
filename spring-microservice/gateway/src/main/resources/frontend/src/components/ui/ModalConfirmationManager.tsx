import { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';

type ActionType = 'approuver' | 'rejeter' | 'complement';

export interface ApprobationData {
  commentaire: string;
  validitePermanente?: boolean;
  dateExpiration?: string;
}

interface ModalConfirmationManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: ApprobationData) => Promise<void>;
  actionType: ActionType;
  commentaireRh?: string;
}

const TITLES: Record<ActionType, string> = {
  approuver: '✅ Approuver la demande',
  rejeter: '❌ Rejeter la demande',
  complement: '💬 Demander un complément'
};

const CONFIRM_LABELS: Record<ActionType, string> = {
  approuver: 'Approuver',
  rejeter: 'Rejeter',
  complement: 'Demander complément'
};

const BUTTON_COLORS: Record<ActionType, string> = {
  approuver: 'bg-green-500 hover:bg-green-600',
  rejeter: 'bg-red-500 hover:bg-red-600',
  complement: 'bg-orange-500 hover:bg-orange-600'
};

export default function ModalConfirmationManager({
  isOpen,
  onClose,
  onConfirm,
  actionType,
  commentaireRh = ''
}: ModalConfirmationManagerProps) {
  const [commentaire, setCommentaire] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validitePermanente, setValiditePermanente] = useState(true);
  const [dateExpiration, setDateExpiration] = useState('');

  // Pré-remplir avec le commentaire du RH quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setCommentaire(commentaireRh);
      setValiditePermanente(true);
      setDateExpiration('');
    }
  }, [isOpen, commentaireRh]);

  // Calculer la date minimale (aujourd'hui + 1 jour)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleConfirm = async () => {
    // Validation pour badge temporaire
    if (actionType === 'approuver' && !validitePermanente && !dateExpiration) {
      alert('Veuillez sélectionner une date d\'expiration pour le badge temporaire');
      return;
    }

    try {
      setSubmitting(true);

      const data: ApprobationData = {
        commentaire
      };

      // Ajouter les données de validité uniquement pour l'approbation
      if (actionType === 'approuver') {
        data.validitePermanente = validitePermanente;
        if (!validitePermanente && dateExpiration) {
          data.dateExpiration = dateExpiration;
        }
      }

      await onConfirm(data);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la confirmation:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{TITLES[actionType]}</h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block font-semibold mb-2">
              Commentaire du RH (modifiable)
            </label>
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              rows={8}
              className="w-full border rounded-lg p-3"
              placeholder="Ajoutez ou modifiez le commentaire du RH..."
              disabled={submitting}
            />
            <p className="text-sm text-gray-500 mt-1">
              Le commentaire du RH est pré-rempli. Vous pouvez le modifier avant de confirmer votre décision.
            </p>
          </div>

          {actionType === 'approuver' && (
            <>
              {/* Type de badge */}
              <div className="space-y-3">
                <label className="block font-semibold">
                  Type de badge
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="validite"
                      checked={validitePermanente}
                      onChange={() => setValiditePermanente(true)}
                      disabled={submitting}
                      className="radio radio-primary"
                    />
                    <span className="text-sm">
                      ♾️ Badge permanent
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="validite"
                      checked={!validitePermanente}
                      onChange={() => setValiditePermanente(false)}
                      disabled={submitting}
                      className="radio radio-warning"
                    />
                    <span className="text-sm">
                      ⏱️ Badge temporaire
                    </span>
                  </label>
                </div>
              </div>

              {/* Date d'expiration (si temporaire) */}
              {!validitePermanente && (
                <div className="space-y-2">
                  <label className="block font-semibold flex items-center gap-2">
                    <Calendar size={18} />
                    Date d'expiration
                  </label>
                  <input
                    type="date"
                    value={dateExpiration}
                    onChange={(e) => setDateExpiration(e.target.value)}
                    min={getMinDate()}
                    disabled={submitting}
                    className="input input-bordered w-full"
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Le badge sera automatiquement désactivé à cette date
                  </p>
                </div>
              )}

              {/* Message d'avertissement */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">
                  ⚠️ Cette action va approuver définitivement la demande et attribuer un badge {validitePermanente ? 'permanent' : 'temporaire'} à l'expert.
                </p>
                {!validitePermanente && dateExpiration && (
                  <p className="text-green-700 text-sm mt-2">
                    Le badge expirera le {new Date(dateExpiration).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                )}
              </div>
            </>
          )}

          {actionType === 'rejeter' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">
                ⚠️ Cette action va rejeter définitivement la demande. L'expert sera notifié.
              </p>
            </div>
          )}

          {actionType === 'complement' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-orange-800 font-medium">
                ⚠️ Cette action va demander à l'expert de fournir des informations complémentaires.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className={`px-6 py-2 text-white rounded-lg disabled:opacity-50 ${BUTTON_COLORS[actionType]}`}
          >
            {submitting ? 'Traitement...' : CONFIRM_LABELS[actionType]}
          </button>
        </div>
      </div>
    </div>
  );
}
