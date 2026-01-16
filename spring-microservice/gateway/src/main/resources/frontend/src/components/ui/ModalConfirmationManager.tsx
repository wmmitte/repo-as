import { useState, useEffect } from 'react';
import { X, Calendar, Lightbulb } from 'lucide-react';

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
  approuver: 'Approuver la demande',
  rejeter: 'Rejeter la demande',
  complement: 'Demander un complément'
};

const CONFIRM_LABELS: Record<ActionType, string> = {
  approuver: 'Approuver',
  rejeter: 'Rejeter',
  complement: 'Demander'
};

const BUTTON_COLORS: Record<ActionType, string> = {
  approuver: 'bg-green-500 hover:bg-green-600',
  rejeter: 'bg-red-500 hover:bg-red-600',
  complement: 'bg-orange-500 hover:bg-orange-600'
};

const HEADER_COLORS: Record<ActionType, string> = {
  approuver: 'bg-green-50 border-green-200',
  rejeter: 'bg-red-50 border-red-200',
  complement: 'bg-orange-50 border-orange-200'
};

const ICON_COLORS: Record<ActionType, string> = {
  approuver: 'text-green-600',
  rejeter: 'text-red-600',
  complement: 'text-orange-600'
};

// Raisons prédéfinies par type d'action
const RAISONS_PREDEFINIES: Record<ActionType, { label: string; value: string }[]> = {
  approuver: [],
  rejeter: [
    { label: "Niveau insuffisant", value: "Le niveau de maîtrise démontré ne correspond pas aux critères requis." },
    { label: "Preuves manquantes", value: "Les pièces justificatives fournies sont insuffisantes." },
    { label: "Expérience limitée", value: "L'expérience professionnelle ne justifie pas le niveau demandé." },
    { label: "Hors périmètre", value: "La compétence ne correspond pas au référentiel." }
  ],
  complement: [
    { label: "Certificat requis", value: "Merci de fournir un certificat ou attestation de formation." },
    { label: "Références projets", value: "Veuillez ajouter des références de projets réalisés." },
    { label: "Portfolio", value: "Un portfolio ou des exemples de travaux seraient appréciés." },
    { label: "Préciser durée", value: "Précisez la durée d'expérience dans ce domaine." }
  ]
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

  const handleSelectRaison = (raison: { label: string; value: string }) => {
    setCommentaire(prev => {
      if (prev.includes(raison.value)) return prev;
      return prev ? `${prev}\n${raison.value}` : raison.value;
    });
  };

  const raisons = RAISONS_PREDEFINIES[actionType];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-sm w-full max-h-[85vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header compact */}
        <div className={`sticky top-0 border-b px-3 py-2 flex justify-between items-center ${HEADER_COLORS[actionType]}`}>
          <h2 className={`text-sm font-bold ${ICON_COLORS[actionType]}`}>{TITLES[actionType]}</h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1 hover:bg-white/50 rounded disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content compact */}
        <div className="p-3 space-y-3">
          {/* Raisons prédéfinies */}
          {raisons.length > 0 && (
            <div>
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Raisons rapides</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {raisons.map((raison, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectRaison(raison)}
                    disabled={submitting}
                    className={`px-2 py-0.5 text-[10px] rounded-full border transition-colors disabled:opacity-50 ${
                      commentaire.includes(raison.value)
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

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Commentaire {commentaireRh ? '(pré-rempli)' : ''}
            </label>
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              rows={3}
              className="w-full border border-slate-200 rounded text-xs p-2 focus:ring-1 focus:ring-primary/30 focus:border-primary"
              placeholder="Votre commentaire..."
              disabled={submitting}
            />
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-1 text-[10px] text-amber-600">
                <Lightbulb size={10} />
                <span>Soyez clair et constructif</span>
              </div>
              <span className="text-[10px] text-gray-400">{commentaire.length}/500</span>
            </div>
          </div>

          {actionType === 'approuver' && (
            <>
              {/* Type de badge compact */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Type de badge</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="validite"
                      checked={validitePermanente}
                      onChange={() => setValiditePermanente(true)}
                      disabled={submitting}
                      className="radio radio-primary radio-xs"
                    />
                    <span className="text-xs">Permanent</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="validite"
                      checked={!validitePermanente}
                      onChange={() => setValiditePermanente(false)}
                      disabled={submitting}
                      className="radio radio-warning radio-xs"
                    />
                    <span className="text-xs">Temporaire</span>
                  </label>
                </div>
              </div>

              {/* Date d'expiration compact */}
              {!validitePermanente && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Calendar size={12} />
                    Expiration
                  </label>
                  <input
                    type="date"
                    value={dateExpiration}
                    onChange={(e) => setDateExpiration(e.target.value)}
                    min={getMinDate()}
                    disabled={submitting}
                    className="input input-bordered input-xs w-full text-xs"
                    required
                  />
                </div>
              )}

              {/* Message compact */}
              <div className="bg-green-50 border border-green-200 rounded p-2 text-[11px] text-green-800">
                Badge {validitePermanente ? 'permanent' : 'temporaire'} attribué à l'expert.
                {!validitePermanente && dateExpiration && (
                  <span className="block mt-0.5 text-green-700">
                    Expire le {new Date(dateExpiration).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </div>
            </>
          )}

          {actionType === 'rejeter' && (
            <div className="bg-red-50 border border-red-200 rounded p-2 text-[11px] text-red-800">
              Action définitive. L'expert sera notifié du rejet.
            </div>
          )}

          {actionType === 'complement' && (
            <div className="bg-orange-50 border border-orange-200 rounded p-2 text-[11px] text-orange-800">
              L'expert recevra une notification pour compléter sa demande.
            </div>
          )}
        </div>

        {/* Footer compact */}
        <div className="sticky bottom-0 bg-slate-50 border-t px-3 py-2 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-3 py-1 text-xs border rounded hover:bg-white disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className={`px-3 py-1 text-xs text-white rounded disabled:opacity-50 ${BUTTON_COLORS[actionType]}`}
          >
            {submitting ? '...' : CONFIRM_LABELS[actionType]}
          </button>
        </div>
      </div>
    </div>
  );
}
