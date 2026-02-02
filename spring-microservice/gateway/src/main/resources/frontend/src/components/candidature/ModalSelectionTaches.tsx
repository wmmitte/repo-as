import { useState, useEffect } from 'react';
import { Projet, Tache, Candidature } from '@/types/projet.types';
import { CheckCircle, Clock, Package } from 'lucide-react';

interface ModalSelectionTachesProps {
  isOpen: boolean;
  onClose: () => void;
  projet: Projet;
  candidature: Candidature;
  onConfirmer: (tachesSelectionnees: number[]) => void;
  enregistrement: boolean;
}

export default function ModalSelectionTaches({
  isOpen,
  onClose,
  projet,
  candidature,
  onConfirmer,
  enregistrement
}: ModalSelectionTachesProps) {
  const [tachesSelectionnees, setTachesSelectionnees] = useState<Set<number>>(new Set());

  // Récupérer toutes les tâches disponibles (non terminées et sans expert assigné)
  const toutesLesTaches: Tache[] = [
    ...(projet.tachesIndependantes || []),
    ...(projet.etapes?.flatMap(e => e.taches || []) || [])
  ];
  const tachesDisponibles = toutesLesTaches.filter(t =>
    !t.expertAssigneId && t.statut !== 'TERMINEE'
  );

  // Réinitialiser la sélection quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setTachesSelectionnees(new Set());
    }
  }, [isOpen]);

  const toggleTache = (tacheId: number) => {
    const nouvelleSélection = new Set(tachesSelectionnees);
    if (nouvelleSélection.has(tacheId)) {
      nouvelleSélection.delete(tacheId);
    } else {
      nouvelleSélection.add(tacheId);
    }
    setTachesSelectionnees(nouvelleSélection);
  };

  const toggleToutesLesTaches = () => {
    if (tachesSelectionnees.size === tachesDisponibles.length) {
      setTachesSelectionnees(new Set());
    } else {
      setTachesSelectionnees(new Set(tachesDisponibles.map(t => t.id)));
    }
  };

  const handleConfirmer = () => {
    onConfirmer(Array.from(tachesSelectionnees));
  };

  if (!isOpen) return null;

  const toutSelectionne = tachesSelectionnees.size === tachesDisponibles.length && tachesDisponibles.length > 0;

  // Générer les initiales
  const getInitiales = () => {
    if (candidature.expertPrenom && candidature.expertNom) {
      return `${candidature.expertPrenom.charAt(0)}${candidature.expertNom.charAt(0)}`.toUpperCase();
    }
    if (candidature.expertNom) {
      return candidature.expertNom.substring(0, 2).toUpperCase();
    }
    return '?';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-xl max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-xl">
        {/* En-tête compact */}
        <div className="p-4 border-b border-base-300">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-semibold">Accepter la candidature</h3>
              <p className="text-xs text-base-content/60 line-clamp-1">{projet.nom}</p>
            </div>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-xs btn-circle"
              disabled={enregistrement}
            >
              ✕
            </button>
          </div>

          {/* Info candidat compact */}
          <div className="flex items-center gap-2 bg-base-200 rounded-lg p-2">
            {/* Photo ou initiales */}
            <div className="relative flex-shrink-0 w-9 h-9">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">{getInitiales()}</span>
              </div>
              <img
                src={`/api/profil/public/${candidature.expertId}/photo`}
                alt="Expert"
                className="absolute inset-0 w-9 h-9 rounded-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm line-clamp-1">
                {candidature.expertPrenom} {candidature.expertNom}
              </h4>
              {candidature.expertTitre && (
                <p className="text-xs text-base-content/60 line-clamp-1">{candidature.expertTitre}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contenu compact */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs text-base-content/70 mb-3">
            Sélectionnez les tâches à assigner. Vous pourrez assigner d'autres experts aux tâches restantes.
          </p>

          {tachesDisponibles.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle size={36} className="mx-auto text-success mb-3" />
              <h4 className="font-semibold text-sm mb-1">Toutes les tâches sont assignées</h4>
              <p className="text-xs text-base-content/60">
                Il n'y a plus de tâches disponibles.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Sélectionner tout */}
              <label className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors">
                <input
                  type="checkbox"
                  checked={toutSelectionne}
                  onChange={toggleToutesLesTaches}
                  className="checkbox checkbox-primary checkbox-xs"
                  disabled={enregistrement}
                />
                <span className="font-medium text-sm">
                  Tout sélectionner ({tachesDisponibles.length})
                </span>
              </label>

              {/* Liste des tâches */}
              <div className="space-y-1.5">
                {tachesDisponibles.map((tache) => (
                  <label
                    key={tache.id}
                    className={`flex items-start gap-2 p-2.5 rounded-lg cursor-pointer transition-colors border ${
                      tachesSelectionnees.has(tache.id)
                        ? 'bg-primary/5 border-primary'
                        : 'bg-base-200 border-transparent hover:border-base-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={tachesSelectionnees.has(tache.id)}
                      onChange={() => toggleTache(tache.id)}
                      className="checkbox checkbox-primary checkbox-xs mt-0.5"
                      disabled={enregistrement}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm line-clamp-1">{tache.nom}</div>
                      {tache.description && (
                        <div className="text-xs text-base-content/60 line-clamp-1 mt-0.5">
                          {tache.description}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 text-[10px] text-base-content/60 mt-1">
                        {tache.budget > 0 && (
                          <span className="font-medium">{tache.budget.toLocaleString('fr-FR')} FCFA</span>
                        )}
                        {tache.delaiJours && (
                          <span className="flex items-center gap-0.5">
                            <Clock size={10} />
                            {tache.delaiJours}j
                          </span>
                        )}
                        {tache.nombreLivrables > 0 && (
                          <span className="flex items-center gap-0.5">
                            <Package size={10} />
                            {tache.nombreLivrables}
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pied de page compact */}
        <div className="p-3 border-t border-base-300">
          <div className="flex items-center justify-between">
            <span className="text-xs text-base-content/60">
              {tachesSelectionnees.size} tâche{tachesSelectionnees.size > 1 ? 's' : ''} sélectionnée{tachesSelectionnees.size > 1 ? 's' : ''}
            </span>
            <div className="flex gap-2">
              <button
                className="btn btn-ghost btn-sm"
                onClick={onClose}
                disabled={enregistrement}
              >
                Annuler
              </button>
              <button
                className="btn btn-success btn-sm gap-1 text-white"
                onClick={handleConfirmer}
                disabled={enregistrement || tachesSelectionnees.size === 0}
              >
                {enregistrement ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <CheckCircle size={14} />
                )}
                Accepter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
