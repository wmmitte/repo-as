import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Clock,
  Calendar,
  Target,
  FileBox,
  CheckCircle,
  Package,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { tacheService } from '@/services/tacheService';
import { projetService } from '@/services/projet.service';
import {
  Tache,
  ModifierTacheRequest,
  PrioriteTache,
  StatutTache,
  StatutLivrable
} from '@/types/projet.types';
import Loader from '@/components/ui/Loader';

const STATUTS_TACHE: Record<StatutTache, { label: string; classe: string }> = {
  A_FAIRE: { label: 'À faire', classe: 'badge-ghost' },
  EN_COURS: { label: 'En cours', classe: 'badge-warning' },
  EN_REVUE: { label: 'En revue', classe: 'badge-info' },
  TERMINEE: { label: 'Terminée', classe: 'badge-success' },
  BLOQUEE: { label: 'Bloquée', classe: 'badge-error' },
  ANNULEE: { label: 'Annulée', classe: 'badge-neutral' },
};

const STATUTS_LIVRABLE: Record<StatutLivrable, { label: string; classe: string }> = {
  A_FOURNIR: { label: 'À fournir', classe: 'badge-ghost' },
  SOUMIS: { label: 'Soumis', classe: 'badge-info' },
  EN_REVUE: { label: 'En revue', classe: 'badge-warning' },
  ACCEPTE: { label: 'Accepté', classe: 'badge-success' },
  REFUSE: { label: 'Refusé', classe: 'badge-error' },
  A_REVISER: { label: 'À réviser', classe: 'badge-warning' },
};

const PRIORITES: Record<PrioriteTache, { label: string; classe: string }> = {
  BASSE: { label: 'Basse', classe: 'badge-ghost' },
  NORMALE: { label: 'Normale', classe: 'badge-info' },
  HAUTE: { label: 'Haute', classe: 'badge-warning' },
  URGENTE: { label: 'Urgente', classe: 'badge-error' },
};

export default function TacheDetailPage() {
  const { projetId, tacheId } = useParams<{ projetId: string; tacheId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tache, setTache] = useState<Tache | null>(null);
  const [projetNom, setProjetNom] = useState<string>('');
  const [proprietaireId, setProprietaireId] = useState<string>('');
  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);

  // Soumission livrable (expert)
  const [soumissionLivrableId, setSoumissionLivrableId] = useState<number | null>(null);
  const [formSoumission, setFormSoumission] = useState({
    fichierUrl: '',
    commentaire: ''
  });

  // Validation livrable (propriétaire)
  const [validationLivrableId, setValidationLivrableId] = useState<number | null>(null);
  const [formValidation, setFormValidation] = useState({
    accepte: true,
    commentaire: ''
  });

  // Mode édition
  const [modeEditionInfos, setModeEditionInfos] = useState(false);
  const [formInfos, setFormInfos] = useState<ModifierTacheRequest>({});

  // Livrables
  const [livrableOuvert, setLivrableOuvert] = useState<number | null>(null);
  const [nouveauLivrable, setNouveauLivrable] = useState({ nom: '', description: '' });
  const [ajoutLivrableActif, setAjoutLivrableActif] = useState(false);

  // Critères
  const [nouveauCritere, setNouveauCritere] = useState<Record<number, string>>({});

  const estProprietaire = proprietaireId === user?.id;
  const estExpertAssigne = tache?.expertAssigneId === user?.id;

  useEffect(() => {
    chargerTache();
  }, [projetId, tacheId]);

  const chargerTache = async () => {
    if (!projetId || !tacheId) return;
    setChargement(true);
    try {
      // Charger la tâche
      const tacheData = await tacheService.obtenirTache(parseInt(tacheId));
      setTache(tacheData);

      // Charger le projet pour avoir le nom et vérifier le propriétaire
      const projetData = await projetService.obtenirProjet(parseInt(projetId));
      setProjetNom(projetData.nom);
      setProprietaireId(projetData.proprietaireId);
    } catch (error) {
      console.error('Erreur chargement tâche:', error);
      navigate(`/projets/${projetId}`);
    } finally {
      setChargement(false);
    }
  };

  // Activer mode édition infos
  const activerEditionInfos = () => {
    if (!tache) return;
    setFormInfos({
      nom: tache.nom,
      description: tache.description || '',
      budget: tache.budget,
      delaiJours: tache.delaiJours,
      priorite: tache.priorite,
      dateDebutPrevue: tache.dateDebutPrevue,
      dateFinPrevue: tache.dateFinPrevue
    });
    setModeEditionInfos(true);
  };

  // Sauvegarder infos
  const sauvegarderInfos = async () => {
    if (!tache) return;
    setEnregistrement(true);
    try {
      const tacheMaj = await tacheService.modifierTache(tache.id, formInfos);
      setTache(tacheMaj);
      setModeEditionInfos(false);
    } catch (error) {
      console.error('Erreur modification tâche:', error);
    } finally {
      setEnregistrement(false);
    }
  };

  // Ajouter un livrable
  const ajouterLivrable = async () => {
    if (!tache || !nouveauLivrable.nom.trim()) return;
    setEnregistrement(true);
    try {
      await tacheService.ajouterLivrable(
        tache.id,
        nouveauLivrable.nom,
        nouveauLivrable.description || undefined
      );
      setNouveauLivrable({ nom: '', description: '' });
      setAjoutLivrableActif(false);
      await chargerTache();
    } catch (error) {
      console.error('Erreur ajout livrable:', error);
    } finally {
      setEnregistrement(false);
    }
  };

  // Ajouter un critère à un livrable
  const ajouterCritereAuLivrable = async (livrableId: number) => {
    const critere = nouveauCritere[livrableId]?.trim();
    if (!critere) return;

    setEnregistrement(true);
    try {
      // Appel API pour ajouter le critère
      const response = await fetch(`/api/livrables/${livrableId}/criteres`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ description: critere }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout du critère');
      }

      setNouveauCritere({ ...nouveauCritere, [livrableId]: '' });
      await chargerTache();
    } catch (error) {
      console.error('Erreur ajout critère:', error);
    } finally {
      setEnregistrement(false);
    }
  };

  // Supprimer un critère
  const supprimerCritere = async (critereId: number) => {
    setEnregistrement(true);
    try {
      const response = await fetch(`/api/livrables/criteres/${critereId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du critère');
      }

      await chargerTache();
    } catch (error) {
      console.error('Erreur suppression critère:', error);
    } finally {
      setEnregistrement(false);
    }
  };

  // Supprimer un livrable
  const supprimerLivrable = async (livrableId: number) => {
    if (!confirm('Supprimer ce livrable et tous ses critères ?')) return;

    setEnregistrement(true);
    try {
      const response = await fetch(`/api/livrables/${livrableId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du livrable');
      }

      await chargerTache();
    } catch (error) {
      console.error('Erreur suppression livrable:', error);
    } finally {
      setEnregistrement(false);
    }
  };

  // Toggle livrable ouvert
  const toggleLivrable = (livrableId: number) => {
    setLivrableOuvert(livrableOuvert === livrableId ? null : livrableId);
  };

  // Soumettre un livrable (expert)
  const soumettreLivrable = async (livrableId: number) => {
    if (!formSoumission.fichierUrl.trim()) return;

    setEnregistrement(true);
    try {
      const response = await fetch(`/api/livrables/${livrableId}/soumettre`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          fichierUrl: formSoumission.fichierUrl,
          commentaire: formSoumission.commentaire || undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la soumission du livrable');
      }

      setSoumissionLivrableId(null);
      setFormSoumission({ fichierUrl: '', commentaire: '' });
      await chargerTache();
    } catch (error) {
      console.error('Erreur soumission livrable:', error);
    } finally {
      setEnregistrement(false);
    }
  };

  // Valider un livrable (propriétaire)
  const validerLivrable = async (livrableId: number, accepte: boolean) => {
    setEnregistrement(true);
    try {
      const response = await fetch(`/api/livrables/${livrableId}/valider`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          accepte,
          commentaire: formValidation.commentaire || undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la validation du livrable');
      }

      setValidationLivrableId(null);
      setFormValidation({ accepte: true, commentaire: '' });
      await chargerTache();
    } catch (error) {
      console.error('Erreur validation livrable:', error);
    } finally {
      setEnregistrement(false);
    }
  };

  // Formater date
  const formaterDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (chargement) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!tache) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Tâche non trouvée</h2>
          <button onClick={() => navigate(`/projets/${projetId}`)} className="btn btn-primary btn-sm">
            Retour au projet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="bg-base-100 border-b border-base-300 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 max-w-4xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-base-content/60 mb-2">
            <button
              onClick={() => navigate('/projets')}
              className="hover:text-primary"
            >
              Projets
            </button>
            <span>/</span>
            <button
              onClick={() => navigate(`/projets/${projetId}`)}
              className="hover:text-primary truncate max-w-[150px]"
            >
              {projetNom}
            </button>
            <span>/</span>
            <span className="truncate">Tâche</span>
          </div>

          {/* Titre et actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/projets/${projetId}`)}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold truncate">{tache.nom}</h1>
                <span className={`badge badge-sm ${STATUTS_TACHE[tache.statut]?.classe}`}>
                  {STATUTS_TACHE[tache.statut]?.label}
                </span>
                <span className={`badge badge-sm ${PRIORITES[tache.priorite]?.classe}`}>
                  {PRIORITES[tache.priorite]?.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* Section Informations de base */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Package size={18} />
                Informations de base
              </h2>
              {estProprietaire && !modeEditionInfos && (
                <button
                  onClick={activerEditionInfos}
                  className="btn btn-ghost btn-sm gap-1"
                >
                  <Edit size={14} />
                  Modifier
                </button>
              )}
            </div>

            {modeEditionInfos ? (
              /* Formulaire édition */
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Nom de la tâche *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={formInfos.nom || ''}
                    onChange={(e) => setFormInfos({ ...formInfos, nom: e.target.value })}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Description</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full h-24"
                    value={formInfos.description || ''}
                    onChange={(e) => setFormInfos({ ...formInfos, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Budget (FCFA)</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered w-full"
                      value={formInfos.budget || ''}
                      onChange={(e) => setFormInfos({
                        ...formInfos,
                        budget: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Délai (jours)</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered w-full"
                      value={formInfos.delaiJours || ''}
                      onChange={(e) => setFormInfos({
                        ...formInfos,
                        delaiJours: parseInt(e.target.value) || undefined
                      })}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Priorité</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={formInfos.priorite || 'NORMALE'}
                      onChange={(e) => setFormInfos({
                        ...formInfos,
                        priorite: e.target.value as PrioriteTache
                      })}
                    >
                      <option value="BASSE">Basse</option>
                      <option value="NORMALE">Normale</option>
                      <option value="HAUTE">Haute</option>
                      <option value="URGENTE">Urgente</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Date début prévue</span>
                    </label>
                    <input
                      type="date"
                      className="input input-bordered w-full"
                      value={formInfos.dateDebutPrevue || ''}
                      onChange={(e) => setFormInfos({ ...formInfos, dateDebutPrevue: e.target.value })}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Date fin prévue</span>
                    </label>
                    <input
                      type="date"
                      className="input input-bordered w-full"
                      value={formInfos.dateFinPrevue || ''}
                      onChange={(e) => setFormInfos({ ...formInfos, dateFinPrevue: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setModeEditionInfos(false)}
                    className="btn btn-ghost btn-sm"
                    disabled={enregistrement}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={sauvegarderInfos}
                    disabled={!formInfos.nom?.trim() || enregistrement}
                    className="btn btn-primary btn-sm gap-1"
                  >
                    {enregistrement ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      <Save size={14} />
                    )}
                    Enregistrer
                  </button>
                </div>
              </div>
            ) : (
              /* Affichage */
              <div className="space-y-4">
                {tache.description && (
                  <p className="text-sm text-base-content/70">{tache.description}</p>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-base-content/60 text-xs mb-1">Budget</div>
                    <div className="font-medium">
                      {tache.budget > 0 ? `${tache.budget.toLocaleString()} FCFA` : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-base-content/60 text-xs mb-1">Délai</div>
                    <div className="font-medium flex items-center gap-1">
                      <Clock size={14} />
                      {tache.delaiJours ? `${tache.delaiJours} jours` : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-base-content/60 text-xs mb-1">Début prévu</div>
                    <div className="font-medium flex items-center gap-1">
                      <Calendar size={14} />
                      {formaterDate(tache.dateDebutPrevue)}
                    </div>
                  </div>
                  <div>
                    <div className="text-base-content/60 text-xs mb-1">Fin prévue</div>
                    <div className="font-medium flex items-center gap-1">
                      <Calendar size={14} />
                      {formaterDate(tache.dateFinPrevue)}
                    </div>
                  </div>
                </div>

                {/* Progression */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-base-content/60">Progression</span>
                    <span className="font-medium">{tache.progression}%</span>
                  </div>
                  <progress
                    className="progress progress-primary w-full"
                    value={tache.progression}
                    max="100"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section Livrables */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <FileBox size={18} />
                Livrables attendus
                <span className="badge badge-sm">{tache.livrables?.length || 0}</span>
              </h2>
              {estProprietaire && (
                <button
                  onClick={() => setAjoutLivrableActif(true)}
                  className="btn btn-ghost btn-sm gap-1"
                  disabled={ajoutLivrableActif}
                >
                  <Plus size={14} />
                  Ajouter
                </button>
              )}
            </div>

            <div className="space-y-3">
              {/* Formulaire ajout livrable */}
              {ajoutLivrableActif && (
                <div className="card bg-base-200 p-3">
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Nom du livrable (ex: Maquettes Figma)"
                      className="input input-bordered input-sm w-full"
                      value={nouveauLivrable.nom}
                      onChange={(e) => setNouveauLivrable({ ...nouveauLivrable, nom: e.target.value })}
                      autoFocus
                    />
                    <input
                      type="text"
                      placeholder="Description (optionnel)"
                      className="input input-bordered input-sm w-full"
                      value={nouveauLivrable.description}
                      onChange={(e) => setNouveauLivrable({ ...nouveauLivrable, description: e.target.value })}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setAjoutLivrableActif(false);
                          setNouveauLivrable({ nom: '', description: '' });
                        }}
                        className="btn btn-ghost btn-xs"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={ajouterLivrable}
                        disabled={!nouveauLivrable.nom.trim() || enregistrement}
                        className="btn btn-primary btn-xs gap-1"
                      >
                        {enregistrement ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          <Plus size={12} />
                        )}
                        Ajouter
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Liste des livrables */}
              {tache.livrables && tache.livrables.length > 0 ? (
                tache.livrables.map((livrable) => (
                  <div key={livrable.id} className="card bg-base-200">
                    {/* En-tête livrable */}
                    <div
                      className="p-3 cursor-pointer hover:bg-base-300/50 transition-colors"
                      onClick={() => toggleLivrable(livrable.id)}
                    >
                      <div className="flex items-center gap-3">
                        {livrableOuvert === livrable.id ? (
                          <ChevronDown size={16} className="flex-shrink-0" />
                        ) : (
                          <ChevronRight size={16} className="flex-shrink-0" />
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{livrable.nom}</span>
                            <span className={`badge badge-xs ${STATUTS_LIVRABLE[livrable.statut]?.classe}`}>
                              {STATUTS_LIVRABLE[livrable.statut]?.label}
                            </span>
                          </div>
                          {livrable.description && (
                            <p className="text-xs text-base-content/60 truncate mt-0.5">
                              {livrable.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {livrable.criteres && livrable.criteres.length > 0 && (
                            <span className="text-xs text-base-content/60">
                              {livrable.criteres.filter(c => c.estValide).length}/{livrable.criteres.length} critères
                            </span>
                          )}
                          {estProprietaire && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                supprimerLivrable(livrable.id);
                              }}
                              className="btn btn-ghost btn-xs btn-circle text-error"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contenu expandé - Critères */}
                    {livrableOuvert === livrable.id && (
                      <div className="border-t border-base-300 p-3 space-y-4">
                        {/* Fichier soumis (si livrable soumis) */}
                        {livrable.fichierUrl && (
                          <div className="bg-base-300/50 rounded-lg p-3">
                            <div className="text-xs font-medium text-base-content/70 mb-2">Livrable soumis</div>
                            <a
                              href={livrable.fichierUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline break-all"
                            >
                              {livrable.fichierUrl}
                            </a>
                            {livrable.commentaireSoumission && (
                              <p className="text-xs text-base-content/60 mt-1">
                                {livrable.commentaireSoumission}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Actions Expert - Soumettre livrable */}
                        {estExpertAssigne && (livrable.statut === 'A_FOURNIR' || livrable.statut === 'A_REVISER') && (
                          <div className="bg-primary/10 rounded-lg p-3">
                            {soumissionLivrableId === livrable.id ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  placeholder="URL du livrable (lien Drive, Dropbox, Github, etc.)"
                                  className="input input-bordered input-sm w-full"
                                  value={formSoumission.fichierUrl}
                                  onChange={(e) => setFormSoumission({ ...formSoumission, fichierUrl: e.target.value })}
                                  autoFocus
                                />
                                <textarea
                                  placeholder="Commentaire (optionnel)"
                                  className="textarea textarea-bordered textarea-sm w-full h-16"
                                  value={formSoumission.commentaire}
                                  onChange={(e) => setFormSoumission({ ...formSoumission, commentaire: e.target.value })}
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setSoumissionLivrableId(null);
                                      setFormSoumission({ fichierUrl: '', commentaire: '' });
                                    }}
                                    className="btn btn-ghost btn-xs"
                                    disabled={enregistrement}
                                  >
                                    Annuler
                                  </button>
                                  <button
                                    onClick={() => soumettreLivrable(livrable.id)}
                                    disabled={!formSoumission.fichierUrl.trim() || enregistrement}
                                    className="btn btn-primary btn-xs gap-1"
                                  >
                                    {enregistrement ? (
                                      <span className="loading loading-spinner loading-xs"></span>
                                    ) : (
                                      <CheckCircle size={12} />
                                    )}
                                    Soumettre
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setSoumissionLivrableId(livrable.id)}
                                className="btn btn-primary btn-sm w-full gap-1"
                              >
                                <CheckCircle size={14} />
                                Soumettre ce livrable
                              </button>
                            )}
                          </div>
                        )}

                        {/* Actions Propriétaire - Valider/Refuser livrable */}
                        {estProprietaire && (livrable.statut === 'SOUMIS' || livrable.statut === 'EN_REVUE') && (
                          <div className="bg-warning/10 rounded-lg p-3">
                            {validationLivrableId === livrable.id ? (
                              <div className="space-y-2">
                                <textarea
                                  placeholder="Commentaire de validation (optionnel)"
                                  className="textarea textarea-bordered textarea-sm w-full h-16"
                                  value={formValidation.commentaire}
                                  onChange={(e) => setFormValidation({ ...formValidation, commentaire: e.target.value })}
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setValidationLivrableId(null);
                                      setFormValidation({ accepte: true, commentaire: '' });
                                    }}
                                    className="btn btn-ghost btn-xs"
                                    disabled={enregistrement}
                                  >
                                    Annuler
                                  </button>
                                  <button
                                    onClick={() => validerLivrable(livrable.id, false)}
                                    disabled={enregistrement}
                                    className="btn btn-error btn-xs gap-1"
                                  >
                                    <X size={12} />
                                    Refuser
                                  </button>
                                  <button
                                    onClick={() => validerLivrable(livrable.id, true)}
                                    disabled={enregistrement}
                                    className="btn btn-success btn-xs gap-1"
                                  >
                                    {enregistrement ? (
                                      <span className="loading loading-spinner loading-xs"></span>
                                    ) : (
                                      <CheckCircle size={12} />
                                    )}
                                    Accepter
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setValidationLivrableId(livrable.id)}
                                className="btn btn-warning btn-sm w-full gap-1"
                              >
                                <Target size={14} />
                                Valider ce livrable
                              </button>
                            )}
                          </div>
                        )}

                        {/* Critères */}
                        <div className="text-xs font-medium text-base-content/70 flex items-center gap-1 mb-2">
                          <Target size={12} />
                          Critères de validation
                        </div>

                        {/* Liste des critères */}
                        {livrable.criteres && livrable.criteres.length > 0 ? (
                          <div className="space-y-1">
                            {livrable.criteres.map((critere) => (
                              <div
                                key={critere.id}
                                className="flex items-center gap-2 text-sm p-2 rounded hover:bg-base-300/50"
                              >
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                  critere.estValide
                                    ? 'border-success bg-success text-success-content'
                                    : 'border-base-content/30'
                                }`}>
                                  {critere.estValide && <CheckCircle size={10} />}
                                </div>
                                <span className={`flex-1 ${critere.estValide ? 'line-through text-base-content/50' : ''}`}>
                                  {critere.description}
                                </span>
                                {estProprietaire && (
                                  <button
                                    onClick={() => supprimerCritere(critere.id)}
                                    className="btn btn-ghost btn-xs btn-circle text-error opacity-50 hover:opacity-100"
                                  >
                                    <X size={12} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-base-content/50 italic">
                            Aucun critère défini
                          </p>
                        )}

                        {/* Ajouter critère */}
                        {estProprietaire && (
                          <div className="flex gap-2 mt-2">
                            <input
                              type="text"
                              placeholder="Ajouter un critère de validation..."
                              className="input input-bordered input-xs flex-1"
                              value={nouveauCritere[livrable.id] || ''}
                              onChange={(e) => setNouveauCritere({
                                ...nouveauCritere,
                                [livrable.id]: e.target.value
                              })}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  ajouterCritereAuLivrable(livrable.id);
                                }
                              }}
                            />
                            <button
                              onClick={() => ajouterCritereAuLivrable(livrable.id)}
                              disabled={!nouveauCritere[livrable.id]?.trim() || enregistrement}
                              className="btn btn-primary btn-xs"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                !ajoutLivrableActif && (
                  <div className="text-center py-8 text-base-content/50">
                    <FileBox size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucun livrable défini</p>
                    {estProprietaire && (
                      <button
                        onClick={() => setAjoutLivrableActif(true)}
                        className="btn btn-ghost btn-sm mt-2 gap-1"
                      >
                        <Plus size={14} />
                        Ajouter un livrable
                      </button>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Section Compétences requises (si existantes) */}
        {tache.competencesRequises && tache.competencesRequises.length > 0 && (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-4">
              <h2 className="font-semibold flex items-center gap-2 mb-4">
                <Target size={18} />
                Compétences requises
              </h2>
              <div className="flex flex-wrap gap-2">
                {tache.competencesRequises.map((comp) => (
                  <div
                    key={comp.id}
                    className="badge badge-outline gap-1"
                  >
                    {comp.competenceLibelle}
                    <span className="badge badge-xs badge-primary">
                      Niv. {comp.niveauRequis}
                    </span>
                    {comp.estObligatoire && (
                      <span className="text-error">*</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Informations supplémentaires */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-4">
            <h2 className="font-semibold mb-4">Informations</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-base-content/60">Créée le</span>
                <div>{formaterDate(tache.dateCreation)}</div>
              </div>
              {tache.dateModification && (
                <div>
                  <span className="text-base-content/60">Modifiée le</span>
                  <div>{formaterDate(tache.dateModification)}</div>
                </div>
              )}
              <div>
                <span className="text-base-content/60">Candidatures</span>
                <div>{tache.nombreCandidatures}</div>
              </div>
              <div>
                <span className="text-base-content/60">Disponible</span>
                <div>
                  {tache.estDisponible ? (
                    <span className="badge badge-success badge-sm">Oui</span>
                  ) : (
                    <span className="badge badge-ghost badge-sm">Non</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
