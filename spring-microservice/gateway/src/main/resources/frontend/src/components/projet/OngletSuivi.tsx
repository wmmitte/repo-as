import { useState } from 'react';
import { Projet, Livrable } from '@/types/projet.types';
import Button from '@/components/ui/Button';

interface OngletSuiviProps {
  projet: Projet;
  onProjetUpdate: (projet: Projet) => void;
}

export default function OngletSuivi({ projet, onProjetUpdate }: OngletSuiviProps) {
  const [livrableEnValidation, setLivrableEnValidation] = useState<string | null>(null);
  const [commentaireValidation, setCommentaireValidation] = useState('');
  const [chargement, setChargement] = useState(false);

  // Calculs pour le dashboard
  const totalTaches = projet.taches.length;
  const tachesCompletes = projet.taches.filter(t => t.statut === 'terminee').length;
  const tachesEnCours = projet.taches.filter(t => t.statut === 'en_cours').length;
  const tachesBloquees = projet.taches.filter(t => t.statut === 'bloquee').length;

  const totalLivrables = projet.taches.reduce((acc, tache) => acc + tache.livrables.length, 0);
  const livrablesAcceptes = projet.taches.reduce((acc, tache) => 
    acc + tache.livrables.filter(l => l.statut === 'accepte').length, 0
  );
  const livrablesEnAttente = projet.taches.reduce((acc, tache) => 
    acc + tache.livrables.filter(l => l.statut === 'fourni').length, 0
  );
  const livrablesRejetes = projet.taches.reduce((acc, tache) => 
    acc + tache.livrables.filter(l => l.statut === 'rejete').length, 0
  );

  const budgetUtilise = projet.taches.reduce((acc, tache) => acc + tache.ressources.budget, 0);
  const progressionMoyenne = projet.taches.length > 0 
    ? Math.round(projet.taches.reduce((acc, tache) => acc + tache.progression, 0) / projet.taches.length)
    : 0;

  const validerLivrable = async (livrable: Livrable, accepter: boolean) => {
    setChargement(true);
    setLivrableEnValidation(livrable.id);

    try {
      // Simuler la validation du livrable
      const nouveauStatut = accepter ? 'accepte' : 'rejete';
      
      // Mettre à jour les critères d'acceptation
      const criteresMAJ = livrable.criteres.map(critere => ({
        ...critere,
        statut: accepter ? 'accepte' as const : 'rejete' as const,
        commentaire: commentaireValidation.trim() || undefined
      }));

      const livrableMAJ: Livrable = {
        ...livrable,
        statut: nouveauStatut,
        criteres: criteresMAJ,
        commentaires: commentaireValidation.trim() || livrable.commentaires
      };

      // Mettre à jour le projet local
      const tachesMAJ = projet.taches.map(tache => ({
        ...tache,
        livrables: tache.livrables.map(liv => 
          liv.id === livrable.id ? livrableMAJ : liv
        )
      }));

      onProjetUpdate({ ...projet, taches: tachesMAJ });

      // Réinitialiser
      setCommentaireValidation('');
      setLivrableEnValidation(null);

      console.log(`Livrable ${accepter ? 'accepté' : 'rejeté'}:`, livrableMAJ);

    } catch (error) {
      console.error('Erreur lors de la validation du livrable:', error);
      alert('Erreur lors de la validation du livrable');
    } finally {
      setChargement(false);
    }
  };

  const obtenirCouleurStatutTache = (statut: string) => {
    switch (statut) {
      case 'non_commencee':
        return 'bg-gray-500/20 text-gray-600';
      case 'en_cours':
        return 'bg-primary/20 text-primary';
      case 'terminee':
        return 'bg-success/20 text-success';
      case 'bloquee':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-600';
    }
  };

  const obtenirCouleurStatutLivrable = (statut: string) => {
    switch (statut) {
      case 'non_fourni':
        return 'bg-gray-500/20 text-gray-600';
      case 'fourni':
        return 'bg-warning/20 text-warning';
      case 'accepte':
        return 'bg-success/20 text-success';
      case 'rejete':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-600';
    }
  };

  const livrablesEnAttenteValidation = projet.taches
    .flatMap(tache => tache.livrables.filter(l => l.statut === 'fourni'))
    .map(livrable => {
      const tache = projet.taches.find(t => t.livrables.some(l => l.id === livrable.id));
      return { livrable, tache };
    });

  return (
    <div className="space-y-8">
      {/* Dashboard d'évolution du projet */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Dashboard du projet</h3>
        
        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-slate-100 rounded-lg p-4">
            <div className="text-2xl font-bold text-primary mb-1">{progressionMoyenne}%</div>
            <div className="text-sm text-gray-600">Progression globale</div>
          </div>
          
          <div className="bg-slate-100 rounded-lg p-4">
            <div className="text-2xl font-bold text-success mb-1">{tachesCompletes}/{totalTaches}</div>
            <div className="text-sm text-gray-600">Tâches terminées</div>
          </div>
          
          <div className="bg-slate-100 rounded-lg p-4">
            <div className="text-2xl font-bold text-warning mb-1">{livrablesAcceptes}/{totalLivrables}</div>
            <div className="text-sm text-gray-600">Livrables acceptés</div>
          </div>
          
          <div className="bg-slate-100 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-700 mb-1">
              {((budgetUtilise / projet.budget) * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Budget utilisé</div>
          </div>
        </div>

        {/* Graphiques de statuts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Statuts des tâches */}
          <div className="bg-slate-100 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-4">Statut des tâches</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Non commencées</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">{projet.taches.filter(t => t.statut === 'non_commencee').length}</span>
                  <div className="w-16 bg-slate-50 rounded-full h-2">
                    <div 
                      className="bg-gray-500 h-2 rounded-full" 
                      style={{ width: `${totalTaches ? (projet.taches.filter(t => t.statut === 'non_commencee').length / totalTaches) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">En cours</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">{tachesEnCours}</span>
                  <div className="w-16 bg-slate-50 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${totalTaches ? (tachesEnCours / totalTaches) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Terminées</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">{tachesCompletes}</span>
                  <div className="w-16 bg-slate-50 rounded-full h-2">
                    <div 
                      className="bg-success h-2 rounded-full" 
                      style={{ width: `${totalTaches ? (tachesCompletes / totalTaches) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Bloquées</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">{tachesBloquees}</span>
                  <div className="w-16 bg-slate-50 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${totalTaches ? (tachesBloquees / totalTaches) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statuts des livrables */}
          <div className="bg-slate-100 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-4">Statut des livrables</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Acceptés</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">{livrablesAcceptes}</span>
                  <div className="w-16 bg-slate-50 rounded-full h-2">
                    <div 
                      className="bg-success h-2 rounded-full" 
                      style={{ width: `${totalLivrables ? (livrablesAcceptes / totalLivrables) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">En attente</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">{livrablesEnAttente}</span>
                  <div className="w-16 bg-slate-50 rounded-full h-2">
                    <div 
                      className="bg-warning h-2 rounded-full" 
                      style={{ width: `${totalLivrables ? (livrablesEnAttente / totalLivrables) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Rejetés</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">{livrablesRejetes}</span>
                  <div className="w-16 bg-slate-50 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${totalLivrables ? (livrablesRejetes / totalLivrables) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Non fournis</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">{totalLivrables - livrablesAcceptes - livrablesEnAttente - livrablesRejetes}</span>
                  <div className="w-16 bg-slate-50 rounded-full h-2">
                    <div 
                      className="bg-gray-500 h-2 rounded-full" 
                      style={{ width: `${totalLivrables ? ((totalLivrables - livrablesAcceptes - livrablesEnAttente - livrablesRejetes) / totalLivrables) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suivi des tâches */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Suivi des tâches</h3>
        
        {projet.taches.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-600 mb-2">📋</div>
            <p className="text-gray-600">Aucune tâche définie pour ce projet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projet.taches.map((tache) => (
              <div key={tache.id} className="bg-slate-100 border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">{tache.nom}</h4>
                    <p className="text-gray-600 text-sm">{tache.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${obtenirCouleurStatutTache(tache.statut)}`}>
                    {tache.statut.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progression</span>
                    <span>{tache.progression}%</span>
                  </div>
                  <div className="w-full bg-slate-50 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all" 
                      style={{ width: `${tache.progression}%` }}
                    ></div>
                  </div>
                </div>

                {/* Livrables de la tâche */}
                {tache.livrables.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Livrables ({tache.livrables.length})</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {tache.livrables.map((livrable) => (
                        <div key={livrable.id} className="flex items-center justify-between bg-slate-50 rounded p-2">
                          <span className="text-sm text-gray-600 truncate">{livrable.nom}</span>
                          <span className={`px-2 py-1 rounded text-xs ${obtenirCouleurStatutLivrable(livrable.statut)}`}>
                            {livrable.statut.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Validation des livrables en attente */}
      {livrablesEnAttenteValidation.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Livrables en attente de validation ({livrablesEnAttenteValidation.length})
          </h3>
          
          <div className="space-y-6">
            {livrablesEnAttenteValidation.map(({ livrable, tache }) => (
              <div key={livrable.id} className="bg-slate-100 border border-slate-200 rounded-lg p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{livrable.nom}</h4>
                    <span className="text-xs text-gray-600">Tâche: {tache?.nom}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{livrable.description}</p>
                  
                  {/* Informations de soumission */}
                  <div className="bg-slate-50 border border-slate-200 rounded p-3 mb-4">
                    <h5 className="font-medium text-gray-700 mb-2">Informations de soumission</h5>
                    <div className="space-y-1 text-sm">
                      {livrable.fichierUrl && (
                        <div>
                          <span className="text-gray-600">Fichier : </span>
                          <a href={livrable.fichierUrl} className="text-primary hover:text-primary/80">
                            {livrable.fichierUrl.split('/').pop()}
                          </a>
                        </div>
                      )}
                      {livrable.dateForniture && (
                        <div>
                          <span className="text-gray-600">Soumis le : </span>
                          <span className="text-gray-700">
                            {new Date(livrable.dateForniture).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                      {livrable.commentaires && (
                        <div>
                          <span className="text-gray-600">Commentaire : </span>
                          <span className="text-gray-700">{livrable.commentaires}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Critères d'acceptation */}
                  {livrable.criteres.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-2">Critères d'acceptation</h5>
                      <ul className="space-y-1">
                        {livrable.criteres.map((critere) => (
                          <li key={critere.id} className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                            {critere.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Formulaire de validation */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        Commentaire de validation
                      </label>
                      <textarea
                        value={commentaireValidation}
                        onChange={(e) => setCommentaireValidation(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg 
                                 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 
                                 focus:ring-primary focus:border-transparent resize-none"
                        placeholder="Ajoutez un commentaire sur la validation de ce livrable..."
                        disabled={chargement && livrableEnValidation === livrable.id}
                      />
                    </div>

                    <div className="flex justify-end gap-4">
                      <Button
                        variant="secondary"
                        onClick={() => validerLivrable(livrable, false)}
                        disabled={chargement}
                        className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                      >
                        {livrableEnValidation === livrable.id && chargement ? 'Rejet...' : 'Rejeter'}
                      </Button>
                      <Button
                        onClick={() => validerLivrable(livrable, true)}
                        disabled={chargement}
                        className="bg-success/10 border-success/20 text-success hover:bg-success/20"
                      >
                        {livrableEnValidation === livrable.id && chargement ? 'Acceptation...' : 'Accepter'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}