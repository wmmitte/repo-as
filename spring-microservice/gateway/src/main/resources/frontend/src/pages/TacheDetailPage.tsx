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
  ChevronRight,
  Link as LinkIcon,
  Upload,
  FileText,
  UserMinus,
  AlertTriangle,
  Eye,
  Download
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { tacheService } from '@/services/tacheService';
import { projetService } from '@/services/projet.service';
import { livrableService } from '@/services/livrableService';
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
  const [typeSoumission, setTypeSoumission] = useState<'url' | 'fichier'>('url');
  const [fichierSelectionne, setFichierSelectionne] = useState<File | null>(null);
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const [formSoumission, setFormSoumission] = useState({
    fichierUrl: '',
    fichierNom: '',
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

  // Retrait expert
  const [afficherModalRetrait, setAfficherModalRetrait] = useState(false);
  const [motifRetrait, setMotifRetrait] = useState('');

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
    // Vérifier qu'on a soit une URL soit un fichier
    if (typeSoumission === 'url' && !formSoumission.fichierUrl.trim()) return;
    if (typeSoumission === 'fichier' && !fichierSelectionne) return;

    setEnregistrement(true);
    try {
      let fichierUrl = formSoumission.fichierUrl;
      let fichierNom = '';
      let fichierTaille: number | undefined;
      let fichierType: string | undefined;

      // Si c'est un fichier, uploader d'abord
      if (typeSoumission === 'fichier' && fichierSelectionne) {
        setUploadEnCours(true);
        try {
          const uploadResult = await livrableService.uploaderFichier(livrableId, fichierSelectionne);
          fichierUrl = uploadResult.fichierUrl;
          fichierNom = uploadResult.fichierNom;
          fichierTaille = uploadResult.fichierTaille;
          fichierType = uploadResult.fichierType;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'upload';
          alert(`Erreur upload: ${errorMessage}`);
          return;
        } finally {
          setUploadEnCours(false);
        }
      }

      // Soumettre le livrable
      const response = await fetch(`/api/livrables/${livrableId}/soumettre`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          fichierUrl: fichierUrl || undefined,
          fichierNom: fichierNom || undefined,
          fichierTaille: fichierTaille,
          fichierType: fichierType,
          commentaire: formSoumission.commentaire || undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la soumission du livrable');
      }

      setSoumissionLivrableId(null);
      setTypeSoumission('url');
      setFichierSelectionne(null);
      setFormSoumission({ fichierUrl: '', fichierNom: '', commentaire: '' });
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

  // Demander une révision d'un livrable (l'expert pourra resoumettre)
  const demanderRevisionLivrable = async (livrableId: number) => {
    setEnregistrement(true);
    try {
      const response = await fetch(`/api/livrables/${livrableId}/revision`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          commentaire: formValidation.commentaire || undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la demande de révision');
      }

      setValidationLivrableId(null);
      setFormValidation({ accepte: true, commentaire: '' });
      await chargerTache();
    } catch (error) {
      console.error('Erreur demande révision:', error);
    } finally {
      setEnregistrement(false);
    }
  };

  // Retirer l'expert de la tâche
  const retirerExpert = async () => {
    if (!tache) return;

    setEnregistrement(true);
    try {
      const params = motifRetrait ? `?motif=${encodeURIComponent(motifRetrait)}` : '';
      const response = await fetch(`/api/taches/${tache.id}/desassigner${params}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du retrait de l\'expert');
      }

      setAfficherModalRetrait(false);
      setMotifRetrait('');
      await chargerTache();
    } catch (error) {
      console.error('Erreur retrait expert:', error);
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

        {/* Section Expert Assigné */}
        {tache.expertAssigneId && (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar expert avec photo ou initiales */}
                  <div className="relative flex-shrink-0 w-12 h-12">
                    {/* Initiales en arrière-plan (toujours visibles) */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {tache.expertPrenom && tache.expertNom
                          ? `${tache.expertPrenom.charAt(0)}${tache.expertNom.charAt(0)}`.toUpperCase()
                          : tache.expertNom
                            ? tache.expertNom.substring(0, 2).toUpperCase()
                            : '?'}
                      </span>
                    </div>
                    {/* Photo par-dessus si elle existe */}
                    <img
                      src={`/api/profil/public/${tache.expertAssigneId}/photo`}
                      alt=""
                      className="absolute inset-0 w-12 h-12 rounded-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  <div>
                    <h2 className="font-semibold flex items-center gap-2">
                      <Target size={18} />
                      Expert assigné
                    </h2>
                    <p className="text-sm font-medium">
                      {tache.expertPrenom} {tache.expertNom}
                    </p>
                    <p className="text-xs text-base-content/60">
                      Assigné le {formaterDate(tache.dateAssignation)}
                    </p>
                  </div>
                </div>
                {estProprietaire && tache.statut !== 'TERMINEE' && (
                  <button
                    onClick={() => setAfficherModalRetrait(true)}
                    className="btn btn-error btn-sm btn-outline gap-1"
                  >
                    <UserMinus size={14} />
                    Retirer l'expert
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

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
                        {(livrable.fichierUrl || livrable.fichierNom) && (
                          <div className="bg-base-300/50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-xs font-medium text-base-content/70">Livrable soumis</div>
                              {livrable.dateSoumission && (
                                <div className="text-xs text-base-content/50 flex items-center gap-1">
                                  <Clock size={10} />
                                  {new Date(livrable.dateSoumission).toLocaleDateString('fr-FR', {
                                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                  })}
                                </div>
                              )}
                            </div>
                            {livrable.fichierUrl ? (
                              livrable.fichierUrl.startsWith('livrables/') ? (
                                // Fichier uploadé - afficher avec boutons de preview et téléchargement
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <FileText size={14} className="text-primary" />
                                    <span className="text-sm font-medium">
                                      {livrable.fichierNom || livrable.fichierUrl.split('/').pop()}
                                    </span>
                                    {livrable.fichierTaille && (
                                      <span className="badge badge-xs badge-ghost">
                                        {livrable.fichierTaille > 1024 * 1024
                                          ? `${(livrable.fichierTaille / (1024 * 1024)).toFixed(1)} Mo`
                                          : `${(livrable.fichierTaille / 1024).toFixed(1)} Ko`}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <a
                                      href={livrableService.getUrlPrevisualisation(livrable.fichierUrl)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn btn-xs btn-ghost gap-1"
                                    >
                                      <Eye size={12} />
                                      Prévisualiser
                                    </a>
                                    <a
                                      href={livrableService.getUrlTelechargement(livrable.fichierUrl)}
                                      className="btn btn-xs btn-ghost gap-1"
                                    >
                                      <Download size={12} />
                                      Télécharger
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                // URL externe
                                <a
                                  href={livrable.fichierUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline break-all flex items-center gap-1"
                                >
                                  <LinkIcon size={14} />
                                  {livrable.fichierUrl}
                                </a>
                              )
                            ) : livrable.fichierNom && (
                              <div className="text-sm flex items-center gap-1">
                                <FileText size={14} />
                                {livrable.fichierNom}
                              </div>
                            )}
                            {livrable.commentaireSoumission && (
                              <p className="text-xs text-base-content/60 mt-2 italic">
                                "{livrable.commentaireSoumission}"
                              </p>
                            )}
                          </div>
                        )}

                        {/* Date de validation (si livrable validé ou refusé) */}
                        {livrable.dateValidation && (livrable.statut === 'ACCEPTE' || livrable.statut === 'REFUSE' || livrable.statut === 'A_REVISER') && (
                          <div className={`rounded-lg p-3 ${livrable.statut === 'ACCEPTE' ? 'bg-success/10' : 'bg-error/10'}`}>
                            <div className="flex items-center justify-between mb-1">
                              <div className={`text-xs font-medium ${livrable.statut === 'ACCEPTE' ? 'text-success' : 'text-error'}`}>
                                {livrable.statut === 'ACCEPTE' ? 'Validé' : livrable.statut === 'REFUSE' ? 'Refusé' : 'Révision demandée'}
                              </div>
                              <div className="text-xs text-base-content/50 flex items-center gap-1">
                                <Clock size={10} />
                                {new Date(livrable.dateValidation).toLocaleDateString('fr-FR', {
                                  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                              </div>
                            </div>
                            {livrable.commentaireValidation && (
                              <p className="text-xs text-base-content/70 italic">
                                "{livrable.commentaireValidation}"
                              </p>
                            )}
                          </div>
                        )}

                        {/* Actions Expert - Soumettre livrable */}
                        {estExpertAssigne && (livrable.statut === 'A_FOURNIR' || livrable.statut === 'A_REVISER') && (
                          <div className="bg-primary/10 rounded-lg p-3">
                            {soumissionLivrableId === livrable.id ? (
                              <div className="space-y-3">
                                {/* Toggle URL / Fichier */}
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTypeSoumission('url');
                                      setFormSoumission({ ...formSoumission, fichierNom: '' });
                                    }}
                                    className={`btn btn-xs flex-1 gap-1 ${typeSoumission === 'url' ? 'btn-primary' : 'btn-ghost'}`}
                                  >
                                    <LinkIcon size={12} />
                                    Lien URL
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTypeSoumission('fichier');
                                      setFormSoumission({ ...formSoumission, fichierUrl: '' });
                                    }}
                                    className={`btn btn-xs flex-1 gap-1 ${typeSoumission === 'fichier' ? 'btn-primary' : 'btn-ghost'}`}
                                  >
                                    <Upload size={12} />
                                    Fichier
                                  </button>
                                </div>

                                {/* Champ selon le type */}
                                {typeSoumission === 'url' ? (
                                  <input
                                    type="text"
                                    placeholder="URL du livrable (lien Drive, Dropbox, Github, etc.)"
                                    className="input input-bordered input-sm w-full"
                                    value={formSoumission.fichierUrl}
                                    onChange={(e) => setFormSoumission({ ...formSoumission, fichierUrl: e.target.value })}
                                    autoFocus
                                  />
                                ) : (
                                  <div className="space-y-2">
                                    <input
                                      type="file"
                                      className="file-input file-input-bordered file-input-sm w-full"
                                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        setFichierSelectionne(file || null);
                                      }}
                                    />
                                    {fichierSelectionne && (
                                      <div className="text-xs text-base-content/60 flex items-center gap-2">
                                        <FileText size={12} />
                                        <span>{fichierSelectionne.name}</span>
                                        <span className="badge badge-xs">
                                          {(fichierSelectionne.size / 1024).toFixed(1)} Ko
                                        </span>
                                      </div>
                                    )}
                                    <p className="text-xs text-base-content/50">
                                      Formats acceptés: PDF, DOC, DOCX, JPG, PNG, GIF (max 10 Mo)
                                    </p>
                                  </div>
                                )}

                                <textarea
                                  placeholder="Commentaire (optionnel) - décrivez ce que vous soumettez"
                                  className="textarea textarea-bordered textarea-sm w-full h-16"
                                  value={formSoumission.commentaire}
                                  onChange={(e) => setFormSoumission({ ...formSoumission, commentaire: e.target.value })}
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setSoumissionLivrableId(null);
                                      setTypeSoumission('url');
                                      setFichierSelectionne(null);
                                      setFormSoumission({ fichierUrl: '', fichierNom: '', commentaire: '' });
                                    }}
                                    className="btn btn-ghost btn-xs"
                                    disabled={enregistrement || uploadEnCours}
                                  >
                                    Annuler
                                  </button>
                                  <button
                                    onClick={() => soumettreLivrable(livrable.id)}
                                    disabled={(typeSoumission === 'url' ? !formSoumission.fichierUrl.trim() : !fichierSelectionne) || enregistrement || uploadEnCours}
                                    className="btn btn-primary btn-xs gap-1"
                                  >
                                    {enregistrement || uploadEnCours ? (
                                      <>
                                        <span className="loading loading-spinner loading-xs"></span>
                                        {uploadEnCours ? 'Upload...' : 'Envoi...'}
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle size={12} />
                                        Soumettre
                                      </>
                                    )}
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
                              <div className="space-y-3">
                                <textarea
                                  placeholder="Commentaire (expliquez votre décision à l'expert)"
                                  className="textarea textarea-bordered textarea-sm w-full h-16"
                                  value={formValidation.commentaire}
                                  onChange={(e) => setFormValidation({ ...formValidation, commentaire: e.target.value })}
                                />
                                <div className="flex flex-wrap justify-end gap-2">
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
                                    onClick={() => demanderRevisionLivrable(livrable.id)}
                                    disabled={enregistrement}
                                    className="btn btn-warning btn-xs gap-1"
                                    title="L'expert pourra resoumettre"
                                  >
                                    <Edit size={12} />
                                    Révision
                                  </button>
                                  <button
                                    onClick={() => validerLivrable(livrable.id, false)}
                                    disabled={enregistrement}
                                    className="btn btn-error btn-xs gap-1"
                                    title="L'expert ne pourra pas resoumettre"
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
                                <p className="text-xs text-base-content/50">
                                  <strong>Révision</strong> : l'expert peut corriger et resoumettre.
                                  <strong> Refuser</strong> : définitif, envisagez de retirer l'expert.
                                </p>
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

      {/* Modal de confirmation de retrait d'expert */}
      {afficherModalRetrait && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <AlertTriangle size={20} className="text-warning" />
              Retirer l'expert de cette tâche ?
            </h3>
            <p className="py-4 text-sm text-base-content/70">
              L'expert sera notifié et tous les livrables non-acceptés seront réinitialisés.
              La tâche redeviendra disponible pour d'autres experts.
            </p>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Motif (optionnel)</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-20"
                placeholder="Expliquez pourquoi vous retirez l'expert..."
                value={motifRetrait}
                onChange={(e) => setMotifRetrait(e.target.value)}
              />
            </div>
            <div className="modal-action">
              <button
                onClick={() => {
                  setAfficherModalRetrait(false);
                  setMotifRetrait('');
                }}
                className="btn btn-ghost"
                disabled={enregistrement}
              >
                Annuler
              </button>
              <button
                onClick={retirerExpert}
                className="btn btn-error gap-1"
                disabled={enregistrement}
              >
                {enregistrement ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <UserMinus size={16} />
                )}
                Confirmer le retrait
              </button>
            </div>
          </div>
          <div className="modal-backdrop bg-black/50" onClick={() => setAfficherModalRetrait(false)} />
        </div>
      )}
    </div>
  );
}
