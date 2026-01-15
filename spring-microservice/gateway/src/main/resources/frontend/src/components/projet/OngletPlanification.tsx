import { useState } from 'react';
import { Projet, Tache, Livrable } from '@/types/projet.types';
import Button from '@/components/ui/Button';
import { projetService } from '@/services/projet.service';

interface OngletPlanificationProps {
  projet: Projet;
  onProjetUpdate: (projet: Projet) => void;
}

interface FormulaireTache {
  nom: string;
  description: string;
  budget: number;
  expertsRequis: string[];
  duree: number;
  livrables: FormulaireLivrable[];
}

interface FormulaireLivrable {
  nom: string;
  description: string;
  criteres: string[];
}

export default function OngletPlanification({ projet, onProjetUpdate }: OngletPlanificationProps) {
  const [afficherFormulaireTache, setAfficherFormulaireTache] = useState(false);
  const [tacheEnEdition, setTacheEnEdition] = useState<Tache | null>(null);
  const [chargement, setChargement] = useState(false);

  const [formulaireTache, setFormulaireTache] = useState<FormulaireTache>({
    nom: '',
    description: '',
    budget: 2000,
    expertsRequis: [],
    duree: 5,
    livrables: [{ nom: '', description: '', criteres: [''] }]
  });

  const reinitialiserFormulaire = () => {
    setFormulaireTache({
      nom: '',
      description: '',
      budget: 2000,
      expertsRequis: [],
      duree: 5,
      livrables: [{ nom: '', description: '', criteres: [''] }]
    });
    setTacheEnEdition(null);
    setAfficherFormulaireTache(false);
  };

  const ajouterLivrable = () => {
    setFormulaireTache({
      ...formulaireTache,
      livrables: [...formulaireTache.livrables, { nom: '', description: '', criteres: [''] }]
    });
  };

  const supprimerLivrable = (index: number) => {
    if (formulaireTache.livrables.length > 1) {
      const nouveauxLivrables = formulaireTache.livrables.filter((_, i) => i !== index);
      setFormulaireTache({ ...formulaireTache, livrables: nouveauxLivrables });
    }
  };

  const mettreAJourLivrable = (index: number, champ: keyof FormulaireLivrable, valeur: any) => {
    const nouveauxLivrables = [...formulaireTache.livrables];
    nouveauxLivrables[index] = { ...nouveauxLivrables[index], [champ]: valeur };
    setFormulaireTache({ ...formulaireTache, livrables: nouveauxLivrables });
  };

  const ajouterCritereAcceptation = (livrableIndex: number) => {
    const nouveauxLivrables = [...formulaireTache.livrables];
    nouveauxLivrables[livrableIndex].criteres.push('');
    setFormulaireTache({ ...formulaireTache, livrables: nouveauxLivrables });
  };

  const mettreAJourCritere = (livrableIndex: number, critereIndex: number, valeur: string) => {
    const nouveauxLivrables = [...formulaireTache.livrables];
    nouveauxLivrables[livrableIndex].criteres[critereIndex] = valeur;
    setFormulaireTache({ ...formulaireTache, livrables: nouveauxLivrables });
  };

  const supprimerCritere = (livrableIndex: number, critereIndex: number) => {
    const nouveauxLivrables = [...formulaireTache.livrables];
    if (nouveauxLivrables[livrableIndex].criteres.length > 1) {
      nouveauxLivrables[livrableIndex].criteres.splice(critereIndex, 1);
      setFormulaireTache({ ...formulaireTache, livrables: nouveauxLivrables });
    }
  };

  const soumettreFormulaireTache = async (e: React.FormEvent) => {
    e.preventDefault();
    setChargement(true);

    try {
      const livrables: Livrable[] = formulaireTache.livrables
        .filter(liv => liv.nom.trim() && liv.description.trim())
        .map(liv => ({
          id: `livrable_${Date.now()}_${Math.random()}`,
          nom: liv.nom.trim(),
          description: liv.description.trim(),
          criteres: liv.criteres
            .filter(c => c.trim())
            .map(c => ({
              id: `critere_${Date.now()}_${Math.random()}`,
              description: c.trim(),
              statut: 'en_attente' as const
            })),
          statut: 'non_fourni' as const
        }));

      const nouvelleTache: Omit<Tache, 'id'> = {
        nom: formulaireTache.nom.trim(),
        description: formulaireTache.description.trim(),
        ressources: {
          budget: formulaireTache.budget,
          expertsRequis: formulaireTache.expertsRequis,
          duree: formulaireTache.duree
        },
        livrables,
        statut: 'non_commencee',
        progression: 0
      };

      if (tacheEnEdition) {
        // Mise à jour d'une tâche existante
        const tacheMiseAJour = await projetService.mettreAJourTache(tacheEnEdition.id, nouvelleTache);
        const tachesMAJ = projet.taches.map(t => t.id === tacheEnEdition.id ? tacheMiseAJour : t);
        onProjetUpdate({ ...projet, taches: tachesMAJ });
      } else {
        // Création d'une nouvelle tâche
        const tacheCreee = await projetService.ajouterTache(projet.id, nouvelleTache);
        onProjetUpdate({ ...projet, taches: [...projet.taches, tacheCreee] });
      }

      reinitialiserFormulaire();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la tâche:', error);
    } finally {
      setChargement(false);
    }
  };

  const modifierTache = (tache: Tache) => {
    setFormulaireTache({
      nom: tache.nom,
      description: tache.description,
      budget: tache.ressources.budget,
      expertsRequis: tache.ressources.expertsRequis,
      duree: tache.ressources.duree,
      livrables: tache.livrables.map(liv => ({
        nom: liv.nom,
        description: liv.description,
        criteres: liv.criteres.map(c => c.description)
      }))
    });
    setTacheEnEdition(tache);
    setAfficherFormulaireTache(true);
  };

  return (
    <div className="space-y-8">
      {/* Section 1: Détails du projet */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Détails du projet</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
            <p className="text-gray-600">{projet.description}</p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Budget total:</span>
              <span className="text-gray-800 font-semibold">{projet.budget.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Durée prévue:</span>
              <span className="text-gray-800 font-semibold">{projet.duree} jours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Statut:</span>
              <span className="text-primary font-semibold">{projet.statut}</span>
            </div>
          </div>
        </div>
        
        {projet.exigences.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold text-gray-800 mb-3">Exigences du projet</h4>
            <ul className="space-y-2">
              {projet.exigences.map((exigence) => (
                <li key={exigence.id} className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-600">{exigence.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Section 2: Planification du projet */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Planification du projet</h3>
          <Button 
            onClick={() => setAfficherFormulaireTache(true)}
            disabled={chargement}
          >
            + Ajouter une tâche
          </Button>
        </div>

        {/* Liste des tâches existantes */}
        {projet.taches.length > 0 && (
          <div className="space-y-4 mb-6">
            <h4 className="font-semibold text-gray-800">Tâches du projet</h4>
            {projet.taches.map((tache) => (
              <div key={tache.id} className="bg-slate-100 border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-800 mb-2">{tache.nom}</h5>
                    <p className="text-gray-600 text-sm mb-3">{tache.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Budget: </span>
                        <span className="text-gray-700">{tache.ressources.budget.toLocaleString('fr-FR')} €</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Durée: </span>
                        <span className="text-gray-700">{tache.ressources.duree} jours</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Livrables: </span>
                        <span className="text-gray-700">{tache.livrables.length}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => modifierTache(tache)}
                  >
                    Modifier
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Formulaire d'ajout/modification de tâche */}
        {afficherFormulaireTache && (
          <div className="border-t border-slate-200 pt-6">
            <h4 className="font-semibold text-gray-800 mb-4">
              {tacheEnEdition ? 'Modifier la tâche' : 'Nouvelle tâche'}
            </h4>
            
            <form onSubmit={soumettreFormulaireTache} className="space-y-6">
              {/* Nom et description de la tâche */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Nom de la tâche *
                  </label>
                  <input
                    type="text"
                    value={formulaireTache.nom}
                    onChange={(e) => setFormulaireTache({...formulaireTache, nom: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-lg 
                             text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 
                             focus:ring-primary focus:border-transparent"
                    placeholder="Ex: Développement de l'interface"
                    required
                    disabled={chargement}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Description du besoin *
                  </label>
                  <textarea
                    value={formulaireTache.description}
                    onChange={(e) => setFormulaireTache({...formulaireTache, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-lg 
                             text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 
                             focus:ring-primary focus:border-transparent resize-none"
                    placeholder="Décrivez le besoin et les objectifs..."
                    required
                    disabled={chargement}
                  />
                </div>
              </div>

              {/* Ressources de la tâche */}
              <div>
                <h5 className="font-semibold text-gray-800 mb-4">Ressources de la tâche</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Budget (€)
                    </label>
                    <input
                      type="number"
                      value={formulaireTache.budget}
                      onChange={(e) => setFormulaireTache({...formulaireTache, budget: parseInt(e.target.value) || 0})}
                      min="0"
                      className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-lg 
                               text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary 
                               focus:border-transparent"
                      disabled={chargement}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Durée (jours)
                    </label>
                    <input
                      type="number"
                      value={formulaireTache.duree}
                      onChange={(e) => setFormulaireTache({...formulaireTache, duree: parseInt(e.target.value) || 1})}
                      min="1"
                      className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-lg 
                               text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary 
                               focus:border-transparent"
                      disabled={chargement}
                    />
                  </div>
                </div>
              </div>

              {/* Livrables */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-semibold text-gray-800">Livrables</h5>
                  <button
                    type="button"
                    onClick={ajouterLivrable}
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                    disabled={chargement}
                  >
                    + Ajouter un livrable
                  </button>
                </div>
                
                {formulaireTache.livrables.map((livrable, livrableIndex) => (
                  <div key={livrableIndex} className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h6 className="font-medium text-gray-700">Livrable {livrableIndex + 1}</h6>
                      {formulaireTache.livrables.length > 1 && (
                        <button
                          type="button"
                          onClick={() => supprimerLivrable(livrableIndex)}
                          className="text-red-400 hover:text-red-300 text-sm"
                          disabled={chargement}
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Nom du livrable</label>
                        <input
                          type="text"
                          value={livrable.nom}
                          onChange={(e) => mettreAJourLivrable(livrableIndex, 'nom', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded 
                                   text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="Ex: Documentation technique"
                          disabled={chargement}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Description</label>
                        <input
                          type="text"
                          value={livrable.description}
                          onChange={(e) => mettreAJourLivrable(livrableIndex, 'description', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded 
                                   text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="Description du livrable"
                          disabled={chargement}
                        />
                      </div>
                    </div>
                    
                    {/* Critères d'acceptation */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm text-gray-600">Critères d'acceptation</label>
                        <button
                          type="button"
                          onClick={() => ajouterCritereAcceptation(livrableIndex)}
                          className="text-primary hover:text-primary/80 text-xs"
                          disabled={chargement}
                        >
                          + Critère
                        </button>
                      </div>
                      
                      {livrable.criteres.map((critere, critereIndex) => (
                        <div key={critereIndex} className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={critere}
                            onChange={(e) => mettreAJourCritere(livrableIndex, critereIndex, e.target.value)}
                            className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded 
                                     text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Critère d'acceptation"
                            disabled={chargement}
                          />
                          {livrable.criteres.length > 1 && (
                            <button
                              type="button"
                              onClick={() => supprimerCritere(livrableIndex, critereIndex)}
                              className="text-red-400 hover:text-red-300 p-1"
                              disabled={chargement}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={reinitialiserFormulaire}
                  disabled={chargement}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={chargement || !formulaireTache.nom.trim() || !formulaireTache.description.trim()}
                >
                  {chargement ? 'Enregistrement...' : (tacheEnEdition ? 'Mettre à jour' : 'Ajouter la tâche')}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}