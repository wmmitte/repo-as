import { useState } from 'react';
import { Projet, Livrable } from '@/types/projet.types';
import Button from '@/components/ui/Button';
import { projetService } from '@/services/projet.service';

interface OngletExecutionProps {
  projet: Projet;
  onProjetUpdate: (projet: Projet) => void;
}

export default function OngletExecution({ projet, onProjetUpdate }: OngletExecutionProps) {
  const [tacheSelectionnee, setTacheSelectionnee] = useState<string | null>(null);
  const [livrableEnSoumission, setLivrableEnSoumission] = useState<string | null>(null);
  const [fichierSelectionne, setFichierSelectionne] = useState<File | null>(null);
  const [commentaireLivrable, setCommentaireLivrable] = useState('');
  const [chargement, setChargement] = useState(false);

  const tachesAvecLivrables = projet.taches.filter(tache => tache.livrables.length > 0);

  const gererSelectionFichier = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fichier = event.target.files?.[0];
    if (fichier) {
      // Vérifier la taille (limite à 10MB pour l'exemple)
      if (fichier.size > 10 * 1024 * 1024) {
        alert('Le fichier ne peut pas dépasser 10MB');
        return;
      }
      setFichierSelectionne(fichier);
    }
  };

  const soumettrelivrable = async (livrable: Livrable) => {
    if (!fichierSelectionne) {
      alert('Veuillez sélectionner un fichier');
      return;
    }

    setChargement(true);
    setLivrableEnSoumission(livrable.id);

    try {
      // Simuler l'upload du fichier
      const fichierUrl = `uploads/${fichierSelectionne.name}`;
      
      const livrableMisAJour = await projetService.soumettrelivrable(
        livrable.id,
        fichierUrl,
        commentaireLivrable.trim() || undefined
      );

      // Mettre à jour le projet local
      const tachesMAJ = projet.taches.map(tache => ({
        ...tache,
        livrables: tache.livrables.map(liv => 
          liv.id === livrable.id ? livrableMisAJour : liv
        )
      }));

      onProjetUpdate({ ...projet, taches: tachesMAJ });

      // Réinitialiser le formulaire
      setFichierSelectionne(null);
      setCommentaireLivrable('');
      setLivrableEnSoumission(null);
      
      // Réinitialiser l'input file
      const fileInput = document.getElementById(`file-${livrable.id}`) as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Erreur lors de la soumission du livrable:', error);
      alert('Erreur lors de la soumission du livrable');
    } finally {
      setChargement(false);
    }
  };

  const obtenirCouleurStatut = (statut: string) => {
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

  const obtenirLibelleStatut = (statut: string) => {
    switch (statut) {
      case 'non_fourni':
        return 'Non fourni';
      case 'fourni':
        return 'En attente de validation';
      case 'accepte':
        return 'Accepté';
      case 'rejete':
        return 'Rejeté';
      default:
        return 'Inconnu';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête de l'onglet */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Exécution du projet</h3>
        <p className="text-gray-600">
          Soumettez les livrables et documents requis pour chaque tâche du projet.
        </p>
      </div>

      {tachesAvecLivrables.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <div className="text-gray-600 mb-4">📋</div>
          <h4 className="text-lg font-semibold text-gray-700 mb-2">Aucune tâche avec livrables</h4>
          <p className="text-gray-600">
            Ajoutez des tâches avec des livrables dans l'onglet Planification pour commencer l'exécution.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Sélection de tâche */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h4 className="font-semibold text-gray-800 mb-4">Sélectionner une tâche</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tachesAvecLivrables.map((tache) => (
                <button
                  key={tache.id}
                  onClick={() => setTacheSelectionnee(tache.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    tacheSelectionnee === tache.id
                      ? 'border-primary bg-primary/10'
                      : 'border-slate-200 bg-slate-100 hover:border-primary/50'
                  }`}
                >
                  <h5 className="font-semibold text-gray-800 mb-2">{tache.nom}</h5>
                  <div className="text-sm text-gray-600">
                    {tache.livrables.length} livrable{tache.livrables.length > 1 ? 's' : ''}
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-slate-50 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all" 
                        style={{ width: `${tache.progression}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{tache.progression}% complété</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Livrables de la tâche sélectionnée */}
          {tacheSelectionnee && (
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              {(() => {
                const tache = tachesAvecLivrables.find(t => t.id === tacheSelectionnee);
                if (!tache) return null;

                return (
                  <>
                    <h4 className="font-semibold text-gray-800 mb-6">
                      Livrables pour : {tache.nom}
                    </h4>

                    <div className="space-y-6">
                      {tache.livrables.map((livrable) => (
                        <div key={livrable.id} className="bg-slate-100 border border-slate-200 rounded-lg p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-800 mb-2">{livrable.nom}</h5>
                              <p className="text-gray-600 text-sm mb-3">{livrable.description}</p>
                              
                              {/* Critères d'acceptation */}
                              {livrable.criteres.length > 0 && (
                                <div className="mb-4">
                                  <h6 className="text-sm font-medium text-gray-700 mb-2">Critères d'acceptation :</h6>
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
                            </div>
                            
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${obtenirCouleurStatut(livrable.statut)}`}>
                              {obtenirLibelleStatut(livrable.statut)}
                            </span>
                          </div>

                          {/* Informations du livrable déjà soumis */}
                          {livrable.statut !== 'non_fourni' && (
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                              <h6 className="font-medium text-gray-700 mb-2">Livrable soumis</h6>
                              <div className="space-y-2 text-sm">
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
                          )}

                          {/* Formulaire de soumission */}
                          {(livrable.statut === 'non_fourni' || livrable.statut === 'rejete') && (
                            <div className="space-y-4">
                              <div>
                                <label htmlFor={`file-${livrable.id}`} className="block text-sm font-medium text-gray-800 mb-2">
                                  Fichier du livrable *
                                </label>
                                <input
                                  id={`file-${livrable.id}`}
                                  type="file"
                                  onChange={gererSelectionFichier}
                                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg 
                                           text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full 
                                           file:border-0 file:text-sm file:font-semibold file:bg-primary 
                                           file:text-gray-900 hover:file:bg-primary/80"
                                  accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                                  disabled={chargement}
                                />
                                <p className="text-xs text-gray-600 mt-1">
                                  Formats acceptés : PDF, DOC, DOCX, TXT, ZIP, RAR (max 10MB)
                                </p>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-800 mb-2">
                                  Commentaire (optionnel)
                                </label>
                                <textarea
                                  value={commentaireLivrable}
                                  onChange={(e) => setCommentaireLivrable(e.target.value)}
                                  rows={3}
                                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg 
                                           text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 
                                           focus:ring-primary focus:border-transparent resize-none"
                                  placeholder="Ajoutez des informations complémentaires sur ce livrable..."
                                  disabled={chargement}
                                />
                              </div>

                              <div className="flex justify-end">
                                <Button
                                  onClick={() => soumettrelivrable(livrable)}
                                  disabled={!fichierSelectionne || chargement}
                                  className="min-w-32"
                                >
                                  {livrableEnSoumission === livrable.id && chargement 
                                    ? 'Soumission...' 
                                    : 'Soumettre le livrable'
                                  }
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Message pour livrable déjà accepté */}
                          {livrable.statut === 'accepte' && (
                            <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                              <div className="flex items-center gap-2 text-success">
                                <span>✓</span>
                                <span className="font-medium">Livrable accepté</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                Ce livrable a été validé et accepté.
                              </p>
                            </div>
                          )}

                          {/* Message pour livrable en attente */}
                          {livrable.statut === 'fourni' && (
                            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                              <div className="flex items-center gap-2 text-warning">
                                <span>⏳</span>
                                <span className="font-medium">En attente de validation</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                Votre livrable est en cours de révision.
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}