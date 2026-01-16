import { useState, useEffect } from 'react';
import { UserCheck, CheckCircle, X, AlertCircle, Clock, TrendingUp, Users } from 'lucide-react';
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
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!rhSelectionne) {
      setError('Veuillez sélectionner un RH');
      return;
    }
    onConfirm(rhSelectionne, commentaire || undefined);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Assigner à un RH</h3>
              <p className="text-sm text-gray-500">Sélectionnez un évaluateur</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[calc(85vh-180px)]">
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm text-gray-500">Chargement des RH...</p>
            </div>
          ) : utilisateursRh.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucun RH disponible</p>
            </div>
          ) : (
            <div className="space-y-2">
              {utilisateursRh.map((rh) => {
                const isSelected = rhSelectionne === rh.userId;
                const tauxColor = rh.tauxApprobation >= 70 ? 'text-emerald-600' :
                                  rh.tauxApprobation >= 50 ? 'text-amber-600' : 'text-red-600';

                return (
                  <div
                    key={rh.userId}
                    onClick={() => setRhSelectionne(rh.userId)}
                    className={`relative flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-primary/5 ring-2 ring-primary'
                        : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                      isSelected ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {rh.nom.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{rh.nom}</span>
                        {isSelected && <CheckCircle size={16} className="text-primary" />}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{rh.email}</p>
                    </div>

                    {/* Stats compactes */}
                    <div className="flex items-center gap-3 text-xs">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-amber-600">
                          <Clock size={12} />
                          <span className="font-semibold">{rh.nombreDemandesEnCours}</span>
                        </div>
                        <span className="text-gray-400">en cours</span>
                      </div>
                      <div className="w-px h-8 bg-slate-200" />
                      <div className="text-center">
                        <div className={`flex items-center gap-1 ${tauxColor}`}>
                          <TrendingUp size={12} />
                          <span className="font-semibold">{rh.tauxApprobation.toFixed(0)}%</span>
                        </div>
                        <span className="text-gray-400">approb.</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Commentaire */}
          {!isLoading && utilisateursRh.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions (optionnel)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                rows={2}
                placeholder="Ajoutez des instructions pour le RH..."
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-slate-200 rounded-lg transition-colors text-sm font-medium"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={!rhSelectionne}
            className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <UserCheck size={16} />
            Assigner
          </button>
        </div>
      </div>
    </div>
  );
}
