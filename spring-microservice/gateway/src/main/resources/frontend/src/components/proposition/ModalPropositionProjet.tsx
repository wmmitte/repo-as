import { useState, useEffect } from 'react';
import { Expert } from '@/types/expert.types';
import { Projet } from '@/types/projet.types';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { projetService } from '@/services/projet.service';

interface ModalPropositionProjetProps {
  expert: Expert;
  isOpen: boolean;
  onClose: () => void;
}

interface ProjetAvecTaches extends Projet {
  tachesSelectionnees: Set<string>;
  toutSelectionne: boolean;
}

export default function ModalPropositionProjet({ expert, isOpen, onClose }: ModalPropositionProjetProps) {
  const [projets, setProjets] = useState<ProjetAvecTaches[]>([]);
  const [chargement, setChargement] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [messagePersonnalise, setMessagePersonnalise] = useState('');

  useEffect(() => {
    if (isOpen) {
      chargerProjets();
    }
  }, [isOpen]);

  const chargerProjets = async () => {
    setChargement(true);
    try {
      const projetsData = await projetService.obtenirProjets();
      const projetsAvecSelection = projetsData.map(projet => ({
        ...projet,
        tachesSelectionnees: new Set<string>(),
        toutSelectionne: false
      }));
      setProjets(projetsAvecSelection);
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
    } finally {
      setChargement(false);
    }
  };

  const toggleProjetComplet = (projetId: string) => {
    setProjets(projets.map(projet => {
      if (projet.id === projetId) {
        const toutSelectionne = !projet.toutSelectionne;
        const tachesSelectionnees = toutSelectionne 
          ? new Set(projet.taches.map(t => t.id))
          : new Set<string>();
        
        return {
          ...projet,
          toutSelectionne,
          tachesSelectionnees
        };
      }
      return projet;
    }));
  };

  const toggleTache = (projetId: string, tacheId: string) => {
    setProjets(projets.map(projet => {
      if (projet.id === projetId) {
        const nouvelleTachesSelectionnees = new Set(projet.tachesSelectionnees);
        
        if (nouvelleTachesSelectionnees.has(tacheId)) {
          nouvelleTachesSelectionnees.delete(tacheId);
        } else {
          nouvelleTachesSelectionnees.add(tacheId);
        }

        const toutSelectionne = nouvelleTachesSelectionnees.size === projet.taches.length;

        return {
          ...projet,
          tachesSelectionnees: nouvelleTachesSelectionnees,
          toutSelectionne
        };
      }
      return projet;
    }));
  };

  const obtenirTachesSelectionnees = () => {
    const tachesSelectionnees: string[] = [];
    projets.forEach(projet => {
      projet.tachesSelectionnees.forEach(tacheId => {
        tachesSelectionnees.push(tacheId);
      });
    });
    return tachesSelectionnees;
  };

  const obtenirProjetsAvecTaches = () => {
    return projets.filter(projet => projet.tachesSelectionnees.size > 0);
  };

  const envoyerProposition = async () => {
    const tachesSelectionnees = obtenirTachesSelectionnees();
    const projetsSelectionnes = obtenirProjetsAvecTaches();

    if (tachesSelectionnees.length === 0) {
      alert('Veuillez sélectionner au moins une tâche');
      return;
    }

    setEnvoi(true);
    try {
      // Envoyer une proposition pour chaque projet sélectionné
      for (const projet of projetsSelectionnes) {
        const tachesDuProjet = Array.from(projet.tachesSelectionnees);
        await projetService.proposerProjetAExpert(
          expert.id,
          projet.id,
          tachesDuProjet,
          messagePersonnalise.trim() || undefined
        );
      }

      console.log(`Proposition(s) envoyée(s) à ${expert.prenom} ${expert.nom}`);
      onClose();
      
      // Réinitialiser le formulaire
      setProjets(projets.map(projet => ({
        ...projet,
        tachesSelectionnees: new Set(),
        toutSelectionne: false
      })));
      setMessagePersonnalise('');

    } catch (error) {
      console.error('Erreur lors de l\'envoi de la proposition:', error);
      alert('Erreur lors de l\'envoi de la proposition');
    } finally {
      setEnvoi(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* En-tête */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Proposer un projet</h3>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 text-xl"
              disabled={envoi}
            >
              ✕
            </button>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <img
              src={expert.photoUrl}
              alt={`${expert.prenom} ${expert.nom}`}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h4 className="font-semibold text-gray-800">{expert.prenom} {expert.nom}</h4>
              <p className="text-sm text-gray-600">{expert.titre}</p>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-6">
          {chargement ? (
            <div className="flex justify-center items-center h-64">
              <Loader />
            </div>
          ) : projets.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-600 text-4xl mb-4">📋</div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">Aucun projet disponible</h4>
              <p className="text-gray-600">Créez d'abord des projets pour pouvoir les proposer à des experts</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Message personnalisé */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Message pour l'expert (optionnel)
                </label>
                <textarea
                  value={messagePersonnalise}
                  onChange={(e) => setMessagePersonnalise(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-lg 
                           text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 
                           focus:ring-primary focus:border-transparent resize-none"
                  placeholder={`Bonjour ${expert.prenom}, j'aimerais collaborer avec vous sur...`}
                  disabled={envoi}
                />
              </div>

              {/* Sélection des projets et tâches */}
              <div>
                <h5 className="font-medium text-gray-800 mb-4">
                  Sélectionnez les projets et tâches à proposer
                </h5>
                
                <div className="space-y-4">
                  {projets.map((projet) => (
                    <div key={projet.id} className="bg-slate-100 border border-slate-200 rounded-lg p-4">
                      {/* En-tête du projet */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={projet.toutSelectionne}
                              onChange={() => toggleProjetComplet(projet.id)}
                              className="w-4 h-4 text-primary bg-slate-50 border-slate-200 rounded 
                                       focus:ring-primary focus:ring-2"
                              disabled={envoi}
                            />
                            <span className="font-semibold text-gray-800">{projet.nom}</span>
                          </label>
                        </div>
                        <div className="text-sm text-gray-600">
                          {projet.taches.length} tâche{projet.taches.length > 1 ? 's' : ''}
                        </div>
                      </div>

                      {/* Description du projet */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{projet.description}</p>

                      {/* Informations du projet */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Budget:</span>
                          <span className="text-gray-700">{projet.budget.toLocaleString('fr-FR')} €</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Durée:</span>
                          <span className="text-gray-700">{projet.duree} jours</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Statut:</span>
                          <span className="text-primary capitalize">{projet.statut}</span>
                        </div>
                      </div>

                      {/* Liste des tâches */}
                      {projet.taches.length > 0 && (
                        <div>
                          <h6 className="font-medium text-gray-700 mb-3">Tâches du projet</h6>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {projet.taches.map((tache) => (
                              <label
                                key={tache.id}
                                className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-50/80 
                                         transition-colors cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={projet.tachesSelectionnees.has(tache.id)}
                                  onChange={() => toggleTache(projet.id, tache.id)}
                                  className="w-4 h-4 text-primary bg-slate-100 border-slate-200 rounded 
                                           focus:ring-primary focus:ring-2 mt-0.5"
                                  disabled={envoi}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-800 mb-1">{tache.nom}</div>
                                  <div className="text-sm text-gray-600 line-clamp-2">{tache.description}</div>
                                  <div className="flex gap-4 mt-2 text-xs text-gray-600">
                                    <span>Budget: {tache.ressources.budget.toLocaleString('fr-FR')} €</span>
                                    <span>Durée: {tache.ressources.duree} jours</span>
                                    <span>Livrables: {tache.livrables.length}</span>
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pied de page */}
        {!chargement && projets.length > 0 && (
          <div className="p-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {obtenirTachesSelectionnees().length} tâche{obtenirTachesSelectionnees().length > 1 ? 's' : ''} sélectionnée{obtenirTachesSelectionnees().length > 1 ? 's' : ''} 
                sur {obtenirProjetsAvecTaches().length} projet{obtenirProjetsAvecTaches().length > 1 ? 's' : ''}
              </div>
              <div className="flex gap-4">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  disabled={envoi}
                >
                  Annuler
                </Button>
                <Button
                  onClick={envoyerProposition}
                  disabled={envoi || obtenirTachesSelectionnees().length === 0}
                >
                  {envoi ? 'Envoi...' : 'Envoyer la proposition'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}