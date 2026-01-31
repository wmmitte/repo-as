import { useState, useEffect } from 'react';
import { Projet, Tache, Candidature } from '@/types/projet.types';
import { CheckCircle, Clock, User, Package } from 'lucide-react';

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

  // Récupérer toutes les tâches disponibles (sans expert assigné)
  const toutesLesTaches: Tache[] = [
    ...(projet.tachesIndependantes || []),
    ...(projet.etapes?.flatMap(e => e.taches || []) || [])
  ];
  const tachesDisponibles = toutesLesTaches.filter(t => !t.expertAssigneId && t.statut === 'A_FAIRE');

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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
        {/* En-tête */}
        <div className="p-5 border-b border-base-300">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Accepter la candidature</h3>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle"
              disabled={enregistrement}
            >
              ✕
            </button>
          </div>

          {/* Info candidat */}
          <div className="mt-3 flex items-center gap-3 bg-base-200 rounded-lg p-3">
            {candidature.expertPhotoUrl ? (
              <img
                src={candidature.expertPhotoUrl}
                alt={`${candidature.expertPrenom} ${candidature.expertNom}`}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <User size={20} className="text-primary" />
              </div>
            )}
            <div>
              <h4 className="font-medium">
                {candidature.expertPrenom} {candidature.expertNom}
              </h4>
              {candidature.expertTitre && (
                <p className="text-sm text-base-content/60">{candidature.expertTitre}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-4">
            <p className="text-sm text-base-content/70">
              Sélectionnez les tâches à assigner à cet expert. Vous pourrez assigner d'autres experts aux tâches restantes.
            </p>
          </div>

          {tachesDisponibles.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle size={48} className="mx-auto text-success mb-4" />
              <h4 className="font-semibold mb-2">Toutes les tâches sont déjà assignées</h4>
              <p className="text-sm text-base-content/60">
                Il n'y a plus de tâches disponibles dans ce projet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Sélectionner tout */}
              <label className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors">
                <input
                  type="checkbox"
                  checked={toutSelectionne}
                  onChange={toggleToutesLesTaches}
                  className="checkbox checkbox-primary checkbox-sm"
                  disabled={enregistrement}
                />
                <span className="font-medium">
                  Sélectionner toutes les tâches ({tachesDisponibles.length})
                </span>
              </label>

              {/* Liste des tâches */}
              <div className="space-y-2">
                {tachesDisponibles.map((tache) => (
                  <label
                    key={tache.id}
                    className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-colors border-2 ${
                      tachesSelectionnees.has(tache.id)
                        ? 'bg-primary/5 border-primary'
                        : 'bg-base-200 border-transparent hover:border-base-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={tachesSelectionnees.has(tache.id)}
                      onChange={() => toggleTache(tache.id)}
                      className="checkbox checkbox-primary checkbox-sm mt-0.5"
                      disabled={enregistrement}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium mb-1">{tache.nom}</div>
                      {tache.description && (
                        <div className="text-sm text-base-content/60 line-clamp-2 mb-2">
                          {tache.description}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-3 text-xs text-base-content/60">
                        {tache.budget > 0 && (
                          <span className="flex items-center gap-1">
                            <span className="font-medium">{tache.budget.toLocaleString('fr-FR')}</span> FCFA
                          </span>
                        )}
                        {tache.delaiJours && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {tache.delaiJours} jours
                          </span>
                        )}
                        {tache.nombreLivrables > 0 && (
                          <span className="flex items-center gap-1">
                            <Package size={12} />
                            {tache.nombreLivrables} livrable{tache.nombreLivrables > 1 ? 's' : ''}
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

        {/* Pied de page */}
        <div className="p-5 border-t border-base-300">
          <div className="flex items-center justify-between">
            <div className="text-sm text-base-content/60">
              {tachesSelectionnees.size} tâche{tachesSelectionnees.size > 1 ? 's' : ''} sélectionnée{tachesSelectionnees.size > 1 ? 's' : ''}
            </div>
            <div className="flex gap-3">
              <button
                className="btn btn-ghost"
                onClick={onClose}
                disabled={enregistrement}
              >
                Annuler
              </button>
              <button
                className="btn btn-success gap-2"
                onClick={handleConfirmer}
                disabled={enregistrement || tachesSelectionnees.size === 0}
              >
                {enregistrement ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <CheckCircle size={18} />
                )}
                Accepter et assigner
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
