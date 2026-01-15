import { useState, useEffect } from 'react';
import { UserCheck, TrendingUp, CheckCircle, Star, X } from 'lucide-react';
import { UtilisateurRhDTO } from '@/types/reconnaissance.types';
import { traitementService } from '@/services/traitementService';

interface ModalSelectionRhProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (rhId: string, commentaire?: string) => void;
}

export default function ModalSelectionRh({
  isOpen,
  onClose,
  onConfirm,
}: ModalSelectionRhProps) {
  const [utilisateursRh, setUtilisateursRh] = useState<UtilisateurRhDTO[]>([]);
  const [rhSelectionne, setRhSelectionne] = useState<string | null>(null);
  const [commentaire, setCommentaire] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      chargerUtilisateursRh();
      setRhSelectionne(null);
      setCommentaire('');
      setError(null);
    }
  }, [isOpen]);

  const chargerUtilisateursRh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const rh = await traitementService.getUtilisateursRh();
      setUtilisateursRh(rh);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des RH');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!rhSelectionne) {
      setError('Veuillez sélectionner un utilisateur RH');
      return;
    }
    onConfirm(rhSelectionne, commentaire || undefined);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Assigner la demande à un RH</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-sm text-base-content/70 mb-4">
                Sélectionnez un utilisateur RH pour évaluer cette demande de reconnaissance
              </p>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {utilisateursRh.length === 0 ? (
                  <div className="alert alert-info">
                    <span>Aucun utilisateur RH disponible</span>
                  </div>
                ) : (
                  utilisateursRh.map((rh) => (
                    <div
                      key={rh.userId}
                      onClick={() => setRhSelectionne(rh.userId)}
                      className={`card border-2 cursor-pointer transition-all hover:shadow-md ${
                        rhSelectionne === rh.userId
                          ? 'border-primary bg-primary/5'
                          : 'border-base-300 hover:border-primary/50'
                      }`}
                    >
                      <div className="card-body p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <UserCheck
                                size={20}
                                className={rhSelectionne === rh.userId ? 'text-primary' : ''}
                              />
                              <h4 className="font-semibold">{rh.nom}</h4>
                              {rhSelectionne === rh.userId && (
                                <CheckCircle size={20} className="text-primary" />
                              )}
                            </div>
                            <p className="text-sm text-base-content/70">{rh.email}</p>
                          </div>
                        </div>

                        <div className="divider my-2"></div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="stat p-2 bg-base-200/50 rounded-lg">
                            <div className="stat-title text-xs">En cours</div>
                            <div className="stat-value text-lg text-warning">
                              {rh.nombreDemandesEnCours}
                            </div>
                          </div>

                          <div className="stat p-2 bg-base-200/50 rounded-lg">
                            <div className="stat-title text-xs">Traitées</div>
                            <div className="stat-value text-lg text-info">
                              {rh.nombreDemandesTraitees}
                            </div>
                          </div>

                          <div className="stat p-2 bg-base-200/50 rounded-lg">
                            <div className="stat-title text-xs flex items-center gap-1">
                              <TrendingUp size={12} />
                              Taux approbation
                            </div>
                            <div
                              className={`stat-value text-lg ${
                                rh.tauxApprobation >= 70
                                  ? 'text-success'
                                  : rh.tauxApprobation >= 50
                                  ? 'text-warning'
                                  : 'text-error'
                              }`}
                            >
                              {rh.tauxApprobation.toFixed(0)}%
                            </div>
                          </div>

                          <div className="stat p-2 bg-base-200/50 rounded-lg">
                            <div className="stat-title text-xs flex items-center gap-1">
                              <Star size={12} />
                              Note moyenne
                            </div>
                            <div className="stat-value text-lg text-accent">
                              {rh.noteMoyenne.toFixed(1)}
                              <span className="text-sm">/100</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text">Commentaire (optionnel)</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                placeholder="Ajoutez un commentaire ou des instructions pour le RH..."
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
              ></textarea>
            </div>

            <div className="modal-action">
              <button onClick={onClose} className="btn btn-ghost">
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                disabled={!rhSelectionne}
                className="btn btn-primary"
              >
                Assigner
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
