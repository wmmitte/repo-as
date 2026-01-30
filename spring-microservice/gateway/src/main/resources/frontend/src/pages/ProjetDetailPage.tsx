import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  ListTodo,
  FileText,
  ChevronDown,
  ChevronRight,
  Send,
  Package
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { projetService } from '@/services/projet.service';
import { candidatureService } from '@/services/candidatureService';
import {
  Projet,
  Tache,
  Candidature,
  StatutProjet,
  StatutTache,
  StatutCandidature
} from '@/types/projet.types';
import Loader from '@/components/ui/Loader';

const STATUTS_PROJET: Record<StatutProjet, { label: string; classe: string }> = {
  BROUILLON: { label: 'Brouillon', classe: 'badge-ghost' },
  PUBLIE: { label: 'Publié', classe: 'badge-info' },
  EN_COURS: { label: 'En cours', classe: 'badge-warning' },
  EN_PAUSE: { label: 'En pause', classe: 'badge-neutral' },
  TERMINE: { label: 'Terminé', classe: 'badge-success' },
  ANNULE: { label: 'Annulé', classe: 'badge-error' },
};

const STATUTS_TACHE: Record<StatutTache, { label: string; classe: string; icone: React.ReactNode }> = {
  A_FAIRE: { label: 'À faire', classe: 'badge-ghost', icone: <Clock size={12} /> },
  EN_COURS: { label: 'En cours', classe: 'badge-warning', icone: <Clock size={12} /> },
  EN_REVUE: { label: 'En revue', classe: 'badge-info', icone: <Eye size={12} /> },
  TERMINEE: { label: 'Terminée', classe: 'badge-success', icone: <CheckCircle size={12} /> },
  BLOQUEE: { label: 'Bloquée', classe: 'badge-error', icone: <AlertCircle size={12} /> },
  ANNULEE: { label: 'Annulée', classe: 'badge-neutral', icone: <Trash2 size={12} /> },
};

const STATUTS_CANDIDATURE: Record<StatutCandidature, { label: string; classe: string }> = {
  EN_ATTENTE: { label: 'En attente', classe: 'badge-warning' },
  EN_DISCUSSION: { label: 'En discussion', classe: 'badge-info' },
  ACCEPTEE: { label: 'Acceptée', classe: 'badge-success' },
  REFUSEE: { label: 'Refusée', classe: 'badge-error' },
  RETIREE: { label: 'Retirée', classe: 'badge-ghost' },
};

type OngletActif = 'apercu' | 'taches' | 'candidatures' | 'parametres';

export default function ProjetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [projet, setProjet] = useState<Projet | null>(null);
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [chargement, setChargement] = useState(true);
  const [ongletActif, setOngletActif] = useState<OngletActif>('apercu');
  const [etapesOuvertes, setEtapesOuvertes] = useState<Set<number>>(new Set());

  const estProprietaire = projet?.proprietaireId === user?.id;

  useEffect(() => {
    if (id) chargerProjet();
  }, [id]);

  const chargerProjet = async () => {
    if (!id) return;
    setChargement(true);
    try {
      const projetData = await projetService.obtenirProjet(parseInt(id));
      setProjet(projetData);

      if (estProprietaire || user) {
        try {
          const candidaturesData = await candidatureService.listerCandidaturesProjet(parseInt(id));
          setCandidatures(candidaturesData);
        } catch {
          // Ignorer si pas de permission
        }
      }
    } catch (error) {
      console.error('Erreur chargement projet:', error);
      navigate('/projets');
    } finally {
      setChargement(false);
    }
  };

  const toggleEtape = (etapeId: number) => {
    const newSet = new Set(etapesOuvertes);
    if (newSet.has(etapeId)) {
      newSet.delete(etapeId);
    } else {
      newSet.add(etapeId);
    }
    setEtapesOuvertes(newSet);
  };

  const publierProjet = async () => {
    if (!projet) return;
    try {
      const projetMaj = await projetService.publierProjet(projet.id);
      setProjet(projetMaj);
    } catch (error) {
      console.error('Erreur publication:', error);
    }
  };

  const depublierProjet = async () => {
    if (!projet) return;
    try {
      const projetMaj = await projetService.depublierProjet(projet.id);
      setProjet(projetMaj);
    } catch (error) {
      console.error('Erreur dépublication:', error);
    }
  };

  const formaterMontant = (montant: number, devise: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: devise === 'FCFA' ? 'XOF' : devise,
      maximumFractionDigits: 0
    }).format(montant);
  };

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

  if (!projet) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Projet non trouvé</h2>
          <button onClick={() => navigate('/projets')} className="btn btn-primary btn-sm">
            Retour aux projets
          </button>
        </div>
      </div>
    );
  }

  const toutesLesTaches = [
    ...projet.tachesIndependantes,
    ...projet.etapes.flatMap(e => e.taches)
  ];

  const statsProjet = {
    totalTaches: toutesLesTaches.length,
    tachesTerminees: toutesLesTaches.filter(t => t.statut === 'TERMINEE').length,
    tachesEnCours: toutesLesTaches.filter(t => t.statut === 'EN_COURS').length,
    candidaturesEnAttente: candidatures.filter(c => c.statut === 'EN_ATTENTE').length,
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header compact */}
      <div className="bg-base-100 border-b border-base-300 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 max-w-6xl">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/projets')} className="btn btn-ghost btn-sm btn-circle">
              <ArrowLeft size={20} />
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold truncate">{projet.nom}</h1>
                <span className={`badge badge-sm ${STATUTS_PROJET[projet.statut]?.classe}`}>
                  {STATUTS_PROJET[projet.statut]?.label}
                </span>
              </div>
              <div className="text-sm text-base-content/60 flex items-center gap-3">
                <span>{formaterMontant(projet.budget, projet.devise)}</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">{projet.nombreTaches} tâches</span>
              </div>
            </div>

            {/* Actions propriétaire */}
            {estProprietaire && (
              <div className="flex items-center gap-2">
                {projet.statut === 'BROUILLON' ? (
                  <button onClick={publierProjet} className="btn btn-primary btn-sm gap-1">
                    <Eye size={16} />
                    <span className="hidden sm:inline">Publier</span>
                  </button>
                ) : projet.statut === 'PUBLIE' && (
                  <button onClick={depublierProjet} className="btn btn-ghost btn-sm gap-1">
                    <EyeOff size={16} />
                    <span className="hidden sm:inline">Dépublier</span>
                  </button>
                )}
                <button className="btn btn-ghost btn-sm btn-circle">
                  <Edit size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Onglets */}
          <div className="tabs tabs-bordered mt-3 -mb-px">
            <button
              className={`tab tab-sm gap-1 ${ongletActif === 'apercu' ? 'tab-active' : ''}`}
              onClick={() => setOngletActif('apercu')}
            >
              <FileText size={14} />
              Aperçu
            </button>
            <button
              className={`tab tab-sm gap-1 ${ongletActif === 'taches' ? 'tab-active' : ''}`}
              onClick={() => setOngletActif('taches')}
            >
              <ListTodo size={14} />
              Tâches
              {statsProjet.totalTaches > 0 && (
                <span className="badge badge-xs">{statsProjet.totalTaches}</span>
              )}
            </button>
            {estProprietaire && (
              <button
                className={`tab tab-sm gap-1 ${ongletActif === 'candidatures' ? 'tab-active' : ''}`}
                onClick={() => setOngletActif('candidatures')}
              >
                <Users size={14} />
                Candidatures
                {statsProjet.candidaturesEnAttente > 0 && (
                  <span className="badge badge-warning badge-xs">{statsProjet.candidaturesEnAttente}</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Onglet Aperçu */}
        {ongletActif === 'apercu' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-4">
              {/* Description */}
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body p-4">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-base-content/70">
                    {projet.description || 'Aucune description'}
                  </p>
                </div>
              </div>

              {/* Progression */}
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Progression</h3>
                    <span className="text-xl font-bold text-primary">{projet.progression}%</span>
                  </div>
                  <progress className="progress progress-primary" value={projet.progression} max="100" />

                  <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{statsProjet.tachesTerminees}</div>
                      <div className="text-xs text-base-content/60">Terminées</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-warning">{statsProjet.tachesEnCours}</div>
                      <div className="text-xs text-base-content/60">En cours</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{statsProjet.totalTaches - statsProjet.tachesTerminees - statsProjet.tachesEnCours}</div>
                      <div className="text-xs text-base-content/60">À faire</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exigences */}
              {projet.exigences.length > 0 && (
                <div className="card bg-base-100 shadow-sm">
                  <div className="card-body p-4">
                    <h3 className="font-semibold mb-2">Exigences du projet</h3>
                    <ul className="space-y-2">
                      {projet.exigences.map((exigence) => (
                        <li key={exigence.id} className="flex items-start gap-2 text-sm">
                          <CheckCircle size={16} className="text-success mt-0.5 flex-shrink-0" />
                          <span>{exigence.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Infos projet */}
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body p-4">
                  <h3 className="font-semibold mb-3">Détails</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-base-content/60">Budget</span>
                      <span className="font-medium">{formaterMontant(projet.budget, projet.devise)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/60">Visibilité</span>
                      <span className="badge badge-sm">
                        {projet.visibilite === 'PUBLIC' ? 'Public' : 'Privé'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/60">Étapes</span>
                      <span>{projet.etapes.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/60">Candidatures</span>
                      <span>{projet.nombreCandidatures}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/60">Vues</span>
                      <span>{projet.nombreVues}</span>
                    </div>
                    <div className="divider my-2"></div>
                    <div className="flex justify-between">
                      <span className="text-base-content/60">Début prévu</span>
                      <span>{formaterDate(projet.dateDebutPrevue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/60">Fin prévue</span>
                      <span>{formaterDate(projet.dateFinPrevue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/60">Créé le</span>
                      <span>{formaterDate(projet.dateCreation)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions rapides pour non-propriétaire */}
              {!estProprietaire && projet.visibilite === 'PUBLIC' && (
                <div className="card bg-primary/5 border border-primary/20">
                  <div className="card-body p-4">
                    <h3 className="font-semibold mb-2">Intéressé par ce projet ?</h3>
                    <p className="text-sm text-base-content/70 mb-3">
                      Proposez vos services en candidatant à ce projet ou à une tâche spécifique.
                    </p>
                    <button className="btn btn-primary btn-sm w-full gap-1">
                      <Send size={16} />
                      Candidater
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Onglet Tâches */}
        {ongletActif === 'taches' && (
          <div className="space-y-4">
            {/* Actions */}
            {estProprietaire && (
              <div className="flex gap-2 justify-end">
                <button
                  className="btn btn-ghost btn-sm gap-1"
                >
                  <Plus size={16} />
                  Ajouter une étape
                </button>
                <button
                  className="btn btn-primary btn-sm gap-1"
                >
                  <Plus size={16} />
                  Ajouter une tâche
                </button>
              </div>
            )}

            {/* Tâches indépendantes */}
            {projet.tachesIndependantes.length > 0 && (
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Package size={18} />
                    Tâches indépendantes
                    <span className="badge badge-sm">{projet.tachesIndependantes.length}</span>
                  </h3>
                  <div className="space-y-2">
                    {projet.tachesIndependantes.map((tache) => (
                      <TacheCard key={tache.id} tache={tache} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Étapes avec tâches */}
            {projet.etapes.map((etape) => (
              <div key={etape.id} className="card bg-base-100 shadow-sm">
                <div
                  className="card-body p-4 cursor-pointer"
                  onClick={() => toggleEtape(etape.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {etapesOuvertes.has(etape.id) ? (
                        <ChevronDown size={18} />
                      ) : (
                        <ChevronRight size={18} />
                      )}
                      <h3 className="font-semibold">{etape.nom}</h3>
                      <span className="badge badge-sm">{etape.taches.length} tâches</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-base-content/60">{etape.progression}%</span>
                      <progress
                        className="progress progress-primary w-20 h-2"
                        value={etape.progression}
                        max="100"
                      />
                    </div>
                  </div>

                  {etape.description && (
                    <p className="text-sm text-base-content/60 mt-1 ml-6">
                      {etape.description}
                    </p>
                  )}
                </div>

                {etapesOuvertes.has(etape.id) && etape.taches.length > 0 && (
                  <div className="border-t border-base-200 p-4 space-y-2">
                    {etape.taches.map((tache) => (
                      <TacheCard key={tache.id} tache={tache} />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* État vide */}
            {projet.etapes.length === 0 && projet.tachesIndependantes.length === 0 && (
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body items-center text-center py-12">
                  <ListTodo size={48} className="text-base-content/30 mb-4" />
                  <h3 className="font-semibold text-lg">Aucune tâche</h3>
                  <p className="text-base-content/60 text-sm">
                    Commencez par créer des étapes et des tâches pour organiser votre projet.
                  </p>
                  {estProprietaire && (
                    <button
                      className="btn btn-primary btn-sm mt-4"
                    >
                      <Plus size={16} />
                      Créer la première tâche
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Onglet Candidatures */}
        {ongletActif === 'candidatures' && estProprietaire && (
          <div className="space-y-4">
            {candidatures.length === 0 ? (
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body items-center text-center py-12">
                  <Users size={48} className="text-base-content/30 mb-4" />
                  <h3 className="font-semibold text-lg">Aucune candidature</h3>
                  <p className="text-base-content/60 text-sm">
                    Les experts intéressés par votre projet apparaîtront ici.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {candidatures.map((candidature) => (
                  <div key={candidature.id} className="card bg-base-100 shadow-sm">
                    <div className="card-body p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold">Expert #{candidature.expertId.slice(0, 8)}</div>
                          {candidature.tacheNom && (
                            <div className="text-sm text-base-content/60">
                              Pour: {candidature.tacheNom}
                            </div>
                          )}
                        </div>
                        <span className={`badge badge-sm ${STATUTS_CANDIDATURE[candidature.statut]?.classe}`}>
                          {STATUTS_CANDIDATURE[candidature.statut]?.label}
                        </span>
                      </div>

                      {candidature.message && (
                        <p className="text-sm mt-2 bg-base-200 p-2 rounded">
                          "{candidature.message}"
                        </p>
                      )}

                      <div className="flex gap-4 text-xs text-base-content/60 mt-2">
                        {candidature.tarifPropose && (
                          <span>Tarif: {candidature.tarifPropose.toLocaleString()} FCFA</span>
                        )}
                        {candidature.delaiProposeJours && (
                          <span>Délai: {candidature.delaiProposeJours} jours</span>
                        )}
                      </div>

                      {candidature.statut === 'EN_ATTENTE' && (
                        <div className="flex gap-2 mt-3">
                          <button className="btn btn-success btn-xs flex-1">Accepter</button>
                          <button className="btn btn-ghost btn-xs flex-1">Discuter</button>
                          <button className="btn btn-error btn-xs btn-outline flex-1">Refuser</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Composant Tâche compact
function TacheCard({ tache }: { tache: Tache }) {
  const config = STATUTS_TACHE[tache.statut];

  return (
    <div className="flex items-center gap-3 p-3 bg-base-200/50 rounded-lg hover:bg-base-200 transition-colors">
      <div className={`badge badge-sm gap-1 ${config?.classe}`}>
        {config?.icone}
        {config?.label}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{tache.nom}</div>
        {tache.description && (
          <div className="text-xs text-base-content/60 truncate">{tache.description}</div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-base-content/60">
        {tache.budget > 0 && (
          <span>{tache.budget.toLocaleString()} FCFA</span>
        )}
        {tache.nombreLivrables > 0 && (
          <span className="badge badge-ghost badge-xs">
            {tache.nombreLivrablesValides}/{tache.nombreLivrables}
          </span>
        )}
        {tache.estDisponible && (
          <span className="badge badge-success badge-xs">Disponible</span>
        )}
      </div>
    </div>
  );
}
