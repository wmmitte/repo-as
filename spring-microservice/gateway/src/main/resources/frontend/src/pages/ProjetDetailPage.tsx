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
  Package,
  X,
  Layers,
  Calendar,
  Target,
  FileBox,
  GripVertical,
  Settings,
  Save,
  Mail
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { projetService } from '@/services/projet.service';
import { tacheService } from '@/services/tacheService';
import { candidatureService } from '@/services/candidatureService';
import {
  Projet,
  Tache,
  Candidature,
  StatutProjet,
  StatutTache,
  StatutCandidature,
  CreerEtapeRequest,
  CreerTacheRequest,
  ModifierProjetRequest,
  PrioriteTache,
  LivrableRequest,
  VisibiliteProjet
} from '@/types/projet.types';
import Loader from '@/components/ui/Loader';
import ModalSelectionTaches from '@/components/candidature/ModalSelectionTaches';
import ModalContact from '@/components/contact/ModalContact';

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

  // Modals
  const [modalEtapeOuverte, setModalEtapeOuverte] = useState(false);
  const [modalTacheOuverte, setModalTacheOuverte] = useState(false);
  const [etapeSelectionnee, setEtapeSelectionnee] = useState<number | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);

  // Formulaire étape
  const [nouvelleEtape, setNouvelleEtape] = useState<CreerEtapeRequest>({
    projetId: 0,
    nom: '',
    description: ''
  });

  // Formulaire tâche
  const [nouvelleTache, setNouvelleTache] = useState<CreerTacheRequest>({
    projetId: 0,
    nom: '',
    description: '',
    budget: 0,
    priorite: 'NORMALE',
    livrables: []
  });

  // État pour les livrables dans le formulaire
  interface LivrableFormulaire {
    nom: string;
    description: string;
    criteres: string[];
  }
  const [livrablesFormulaire, setLivrablesFormulaire] = useState<LivrableFormulaire[]>([]);
  const [nouveauCritere, setNouveauCritere] = useState<Record<number, string>>({});

  // Formulaire modification projet
  const [modificationProjet, setModificationProjet] = useState<ModifierProjetRequest>({});

  // État pour les paramètres
  const [modeEditionProjet, setModeEditionProjet] = useState(false);
  const [nouvelleExigence, setNouvelleExigence] = useState('');

  // Modal candidature
  const [modalCandidatureOuverte, setModalCandidatureOuverte] = useState(false);
  const [tacheIdCandidature, setTacheIdCandidature] = useState<number | null>(null);
  const [candidatureForm, setCandidatureForm] = useState({
    message: '',
    tarifPropose: '',
    delaiProposeJours: ''
  });
  const [maCandidature, setMaCandidature] = useState<Candidature | null>(null);

  // Modal sélection tâches pour assignation
  const [modalSelectionTachesOuverte, setModalSelectionTachesOuverte] = useState(false);
  const [candidatureEnCoursAcceptation, setCandidatureEnCoursAcceptation] = useState<Candidature | null>(null);

  // Modal contact pour discussion avec l'expert
  const [modalContactOuvert, setModalContactOuvert] = useState(false);
  const [candidaturePourContact, setCandidaturePourContact] = useState<Candidature | null>(null);

  const estProprietaire = projet?.proprietaireId === user?.id;

  useEffect(() => {
    if (id) chargerProjet();
  }, [id]);

  // Vérifier si l'utilisateur a déjà candidaté
  useEffect(() => {
    const verifierCandidature = async () => {
      if (!user || estProprietaire) return;
      try {
        const mesCandidatures = await candidatureService.listerMesCandidatures();
        const candidatureSurProjet = mesCandidatures.find(c => c.projetId === parseInt(id!) && c.statut !== 'RETIREE');
        setMaCandidature(candidatureSurProjet || null);
      } catch {
        // Ignorer
      }
    };
    if (projet) verifierCandidature();
  }, [projet, user, id, estProprietaire]);

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

  // Ouvrir modal création étape
  const ouvrirModalEtape = () => {
    if (!projet) return;
    setNouvelleEtape({
      projetId: projet.id,
      nom: '',
      description: ''
    });
    setModalEtapeOuverte(true);
  };

  // Ouvrir modal création tâche
  const ouvrirModalTache = (etapeId?: number) => {
    if (!projet) return;
    setEtapeSelectionnee(etapeId ?? null);
    setNouvelleTache({
      projetId: projet.id,
      etapeId: etapeId,
      nom: '',
      description: '',
      budget: 0,
      priorite: 'NORMALE',
      livrables: []
    });
    setLivrablesFormulaire([]);
    setNouveauCritere({});
    setModalTacheOuverte(true);
  };

  // Créer une étape
  const creerEtape = async () => {
    if (!nouvelleEtape.nom.trim()) return;
    setEnregistrement(true);
    try {
      await projetService.creerEtape(nouvelleEtape);
      setModalEtapeOuverte(false);
      await chargerProjet();
    } catch (error) {
      console.error('Erreur création étape:', error);
    } finally {
      setEnregistrement(false);
    }
  };

  // Créer une tâche
  const creerTache = async () => {
    if (!nouvelleTache.nom.trim()) return;
    setEnregistrement(true);
    try {
      // Convertir les livrables du formulaire au format API
      const livrablesAPI: LivrableRequest[] = livrablesFormulaire.map(liv => ({
        nom: liv.nom,
        description: liv.description || undefined,
        criteresAcceptation: liv.criteres.length > 0 ? liv.criteres : undefined
      }));

      const tacheACreer: CreerTacheRequest = {
        ...nouvelleTache,
        livrables: livrablesAPI.length > 0 ? livrablesAPI : undefined
      };

      await tacheService.creerTache(tacheACreer);
      setModalTacheOuverte(false);
      await chargerProjet();
    } catch (error) {
      console.error('Erreur création tâche:', error);
    } finally {
      setEnregistrement(false);
    }
  };

  // Ajouter un livrable au formulaire
  const ajouterLivrable = () => {
    setLivrablesFormulaire([
      ...livrablesFormulaire,
      { nom: '', description: '', criteres: [] }
    ]);
  };

  // Supprimer un livrable du formulaire
  const supprimerLivrable = (index: number) => {
    setLivrablesFormulaire(livrablesFormulaire.filter((_, i) => i !== index));
  };

  // Mettre à jour un livrable
  const mettreAJourLivrable = (index: number, champ: 'nom' | 'description', valeur: string) => {
    const nouveauxLivrables = [...livrablesFormulaire];
    nouveauxLivrables[index] = { ...nouveauxLivrables[index], [champ]: valeur };
    setLivrablesFormulaire(nouveauxLivrables);
  };

  // Ajouter un critère à un livrable
  const ajouterCritere = (indexLivrable: number) => {
    const critere = nouveauCritere[indexLivrable]?.trim();
    if (!critere) return;

    const nouveauxLivrables = [...livrablesFormulaire];
    nouveauxLivrables[indexLivrable] = {
      ...nouveauxLivrables[indexLivrable],
      criteres: [...nouveauxLivrables[indexLivrable].criteres, critere]
    };
    setLivrablesFormulaire(nouveauxLivrables);
    setNouveauCritere({ ...nouveauCritere, [indexLivrable]: '' });
  };

  // Supprimer un critère d'un livrable
  const supprimerCritere = (indexLivrable: number, indexCritere: number) => {
    const nouveauxLivrables = [...livrablesFormulaire];
    nouveauxLivrables[indexLivrable] = {
      ...nouveauxLivrables[indexLivrable],
      criteres: nouveauxLivrables[indexLivrable].criteres.filter((_, i) => i !== indexCritere)
    };
    setLivrablesFormulaire(nouveauxLivrables);
  };

  // Modifier le projet
  const modifierProjet = async () => {
    if (!projet) return;
    setEnregistrement(true);
    try {
      const projetMaj = await projetService.modifierProjet(projet.id, modificationProjet);
      setProjet(projetMaj);
      setModeEditionProjet(false);
    } catch (error) {
      console.error('Erreur modification projet:', error);
    } finally {
      setEnregistrement(false);
    }
  };

  // Activer mode édition projet dans l'onglet paramètres
  const activerEditionProjet = () => {
    if (!projet) return;
    setModificationProjet({
      nom: projet.nom,
      description: projet.description || '',
      budget: projet.budget,
      devise: projet.devise,
      visibilite: projet.visibilite,
      dateDebutPrevue: projet.dateDebutPrevue,
      dateFinPrevue: projet.dateFinPrevue
    });
    setModeEditionProjet(true);
  };

  // Ajouter une exigence
  const ajouterExigence = async () => {
    if (!projet || !nouvelleExigence.trim()) return;
    setEnregistrement(true);
    try {
      await projetService.ajouterExigence(projet.id, nouvelleExigence.trim());
      setNouvelleExigence('');
      await chargerProjet();
    } catch (error) {
      console.error('Erreur ajout exigence:', error);
    } finally {
      setEnregistrement(false);
    }
  };

  // Supprimer une exigence
  const supprimerExigence = async (exigenceId: number) => {
    if (!confirm('Supprimer cette exigence ?')) return;
    setEnregistrement(true);
    try {
      await projetService.supprimerExigence(exigenceId);
      await chargerProjet();
    } catch (error) {
      console.error('Erreur suppression exigence:', error);
    } finally {
      setEnregistrement(false);
    }
  };

  // Naviguer vers le détail d'une tâche
  const allerVersTache = (tacheId: number) => {
    navigate(`/projets/${projet?.id}/taches/${tacheId}`);
  };

  // Répondre à une candidature
  const repondreCandidature = async (candidatureId: number, action: 'ACCEPTER' | 'REFUSER' | 'EN_DISCUSSION', reponse?: string) => {
    const candidature = candidatures.find(c => c.id === candidatureId);
    if (!candidature) return;

    // Si c'est une acceptation d'une candidature sur le projet (pas sur une tâche),
    // ouvrir le modal de sélection des tâches
    if (action === 'ACCEPTER' && !candidature.estSurTache) {
      setCandidatureEnCoursAcceptation(candidature);
      setModalSelectionTachesOuverte(true);
      return;
    }

    // Si c'est une mise en discussion, ouvrir le modal de contact
    if (action === 'EN_DISCUSSION') {
      setCandidaturePourContact(candidature);
      setModalContactOuvert(true);
      return;
    }

    setEnregistrement(true);
    try {
      await candidatureService.repondreCandidature(candidatureId, { action, reponse });
      // Recharger les candidatures
      const candidaturesData = await candidatureService.listerCandidaturesProjet(parseInt(id!));
      setCandidatures(candidaturesData);
      // Recharger le projet pour MAJ les compteurs
      await chargerProjet();
    } catch (error) {
      console.error('Erreur réponse candidature:', error);
    } finally {
      setEnregistrement(false);
    }
  };

  // Callback après envoi du message de contact - mettre à jour le statut en EN_DISCUSSION
  const onContactEnvoye = async () => {
    if (!candidaturePourContact) return;

    try {
      // Mettre à jour le statut de la candidature
      await candidatureService.repondreCandidature(candidaturePourContact.id, { action: 'EN_DISCUSSION' });
      // Recharger les candidatures
      const candidaturesData = await candidatureService.listerCandidaturesProjet(parseInt(id!));
      setCandidatures(candidaturesData);
    } catch (error) {
      console.error('Erreur mise à jour candidature:', error);
    }

    setCandidaturePourContact(null);
  };

  // Confirmer l'acceptation avec les tâches sélectionnées
  const confirmerAcceptationAvecTaches = async (tachesIds: number[]) => {
    if (!candidatureEnCoursAcceptation) return;

    setEnregistrement(true);
    try {
      // D'abord accepter la candidature
      await candidatureService.repondreCandidature(candidatureEnCoursAcceptation.id, { action: 'ACCEPTER' });

      // Puis assigner l'expert aux tâches sélectionnées
      for (const tacheId of tachesIds) {
        await tacheService.assignerExpert(tacheId, candidatureEnCoursAcceptation.expertId);
      }

      // Fermer le modal et recharger
      setModalSelectionTachesOuverte(false);
      setCandidatureEnCoursAcceptation(null);

      // Recharger les données
      const candidaturesData = await candidatureService.listerCandidaturesProjet(parseInt(id!));
      setCandidatures(candidaturesData);
      await chargerProjet();
    } catch (error) {
      console.error('Erreur acceptation candidature:', error);
    } finally {
      setEnregistrement(false);
    }
  };

  // Assigner un expert à toutes les tâches disponibles du projet
  const assignerExpertAuxTaches = async (expertId: string) => {
    if (!projet) return;
    setEnregistrement(true);
    try {
      // Récupérer toutes les tâches du projet
      const toutesLesTaches: Tache[] = [
        ...(projet.tachesIndependantes || []),
        ...(projet.etapes?.flatMap(e => e.taches || []) || [])
      ];

      // Assigner l'expert aux tâches disponibles (sans expert assigné)
      const tachesDisponibles = toutesLesTaches.filter(t => !t.expertAssigneId && t.statut === 'A_FAIRE');

      for (const tache of tachesDisponibles) {
        await tacheService.assignerExpert(tache.id, expertId);
      }

      // Recharger le projet
      await chargerProjet();
      alert(`Expert assigné à ${tachesDisponibles.length} tâche(s)`);
    } catch (error) {
      console.error('Erreur assignation expert:', error);
      alert('Erreur lors de l\'assignation');
    } finally {
      setEnregistrement(false);
    }
  };

  // Ouvrir modal candidature
  const ouvrirModalCandidature = (tacheId?: number) => {
    setTacheIdCandidature(tacheId || null);
    setCandidatureForm({ message: '', tarifPropose: '', delaiProposeJours: '' });
    setModalCandidatureOuverte(true);
  };

  // Soumettre candidature
  const soumettreCandidate = async () => {
    if (!projet) return;
    setEnregistrement(true);
    try {
      const nouvelleCandidature = await candidatureService.creerCandidature({
        projetId: projet.id,
        tacheId: tacheIdCandidature || undefined,
        message: candidatureForm.message || undefined,
        tarifPropose: candidatureForm.tarifPropose ? parseInt(candidatureForm.tarifPropose) : undefined,
        delaiProposeJours: candidatureForm.delaiProposeJours ? parseInt(candidatureForm.delaiProposeJours) : undefined
      });
      setModalCandidatureOuverte(false);
      setMaCandidature(nouvelleCandidature);
    } catch (error) {
      console.error('Erreur candidature:', error);
    } finally {
      setEnregistrement(false);
    }
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
                <button
                  onClick={() => setOngletActif('parametres')}
                  className="btn btn-ghost btn-sm btn-circle"
                  title="Paramètres du projet"
                >
                  <Settings size={16} />
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
              <>
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
                <button
                  className={`tab tab-sm gap-1 ${ongletActif === 'parametres' ? 'tab-active' : ''}`}
                  onClick={() => setOngletActif('parametres')}
                >
                  <Settings size={14} />
                  Paramètres
                </button>
              </>
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
              {!estProprietaire && projet.visibilite === 'PUBLIC' && user && (
                <div className={`card ${
                  maCandidature?.statut === 'ACCEPTEE' ? 'bg-success/10 border border-success/30' :
                  maCandidature?.statut === 'REFUSEE' ? 'bg-error/10 border border-error/30' :
                  maCandidature ? 'bg-warning/10 border border-warning/30' :
                  'bg-primary/5 border border-primary/20'
                }`}>
                  <div className="card-body p-4">
                    {maCandidature ? (
                      <>
                        {maCandidature.statut === 'ACCEPTEE' && (
                          <>
                            <h3 className="font-semibold mb-2 flex items-center gap-2 text-success">
                              <CheckCircle size={18} />
                              Candidature acceptée
                            </h3>
                            <p className="text-sm text-base-content/70">
                              Félicitations ! Votre candidature a été acceptée. Consultez vos tâches assignées dans "Mes tâches".
                            </p>
                            <button
                              onClick={() => navigate('/mes-taches')}
                              className="btn btn-success btn-sm mt-2 gap-1"
                            >
                              <ListTodo size={16} />
                              Voir mes tâches
                            </button>
                          </>
                        )}
                        {maCandidature.statut === 'REFUSEE' && (
                          <>
                            <h3 className="font-semibold mb-2 flex items-center gap-2 text-error">
                              <AlertCircle size={18} />
                              Candidature refusée
                            </h3>
                            <p className="text-sm text-base-content/70">
                              Malheureusement, votre candidature n'a pas été retenue pour ce projet.
                            </p>
                          </>
                        )}
                        {maCandidature.statut === 'EN_ATTENTE' && (
                          <>
                            <h3 className="font-semibold mb-2 flex items-center gap-2 text-warning">
                              <Clock size={18} />
                              Candidature en attente
                            </h3>
                            <p className="text-sm text-base-content/70">
                              Votre candidature est en cours d'examen par le propriétaire du projet.
                            </p>
                          </>
                        )}
                        {maCandidature.statut === 'EN_DISCUSSION' && (
                          <>
                            <h3 className="font-semibold mb-2 flex items-center gap-2 text-info">
                              <Users size={18} />
                              En discussion
                            </h3>
                            <p className="text-sm text-base-content/70">
                              Le propriétaire souhaite échanger avec vous. Vérifiez vos messages.
                            </p>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <h3 className="font-semibold mb-2">Intéressé par ce projet ?</h3>
                        <p className="text-sm text-base-content/70 mb-3">
                          Proposez vos services en candidatant à ce projet ou à une tâche spécifique.
                        </p>
                        <button
                          onClick={() => ouvrirModalCandidature()}
                          className="btn btn-primary btn-sm w-full gap-1"
                        >
                          <Send size={16} />
                          Candidater
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
              {/* Invite à se connecter pour les visiteurs non connectés */}
              {!estProprietaire && projet.visibilite === 'PUBLIC' && !user && (
                <div className="card bg-base-200 border border-base-300">
                  <div className="card-body p-4">
                    <h3 className="font-semibold mb-2">Intéressé par ce projet ?</h3>
                    <p className="text-sm text-base-content/70 mb-3">
                      Connectez-vous pour proposer vos services.
                    </p>
                    <button
                      onClick={() => navigate('/profil')}
                      className="btn btn-outline btn-sm w-full gap-1"
                    >
                      Se connecter
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
                  onClick={ouvrirModalEtape}
                  className="btn btn-ghost btn-sm gap-1"
                >
                  <Layers size={16} />
                  Ajouter une étape
                </button>
                <button
                  onClick={() => ouvrirModalTache()}
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
                      <TacheCard
                        key={tache.id}
                        tache={tache}
                        onClick={() => allerVersTache(tache.id)}
                      />
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

                {etapesOuvertes.has(etape.id) && (
                  <div className="border-t border-base-200 p-4 space-y-2">
                    {etape.taches.map((tache) => (
                      <TacheCard
                        key={tache.id}
                        tache={tache}
                        onClick={() => allerVersTache(tache.id)}
                      />
                    ))}
                    {estProprietaire && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          ouvrirModalTache(etape.id);
                        }}
                        className="btn btn-ghost btn-sm btn-block gap-1 border-dashed border-2 border-base-300 hover:border-primary"
                      >
                        <Plus size={16} />
                        Ajouter une tâche à cette étape
                      </button>
                    )}
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
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={ouvrirModalEtape}
                        className="btn btn-outline btn-sm gap-1"
                      >
                        <Layers size={16} />
                        Créer une étape
                      </button>
                      <button
                        onClick={() => ouvrirModalTache()}
                        className="btn btn-primary btn-sm gap-1"
                      >
                        <Plus size={16} />
                        Créer une tâche
                      </button>
                    </div>
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
                      <div className="flex items-start gap-3">
                        {/* Photo de l'expert */}
                        <div className="avatar">
                          <div className="w-12 h-12 rounded-full bg-base-300">
                            {candidature.expertPhotoUrl ? (
                              <img src={candidature.expertPhotoUrl} alt="Expert" />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full text-lg font-bold text-base-content/50">
                                {candidature.expertPrenom?.charAt(0) || candidature.expertNom?.charAt(0) || '?'}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Infos expert */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-semibold">
                                {candidature.expertPrenom && candidature.expertNom
                                  ? `${candidature.expertPrenom} ${candidature.expertNom}`
                                  : `Expert #${candidature.expertId.slice(0, 8)}`
                                }
                              </div>
                              {candidature.expertTitre && (
                                <div className="text-xs text-base-content/60">{candidature.expertTitre}</div>
                              )}
                              {candidature.tacheNom && (
                                <div className="text-xs text-primary mt-1">
                                  Pour: {candidature.tacheNom}
                                </div>
                              )}
                            </div>
                            <span className={`badge badge-sm flex-shrink-0 ${STATUTS_CANDIDATURE[candidature.statut]?.classe}`}>
                              {STATUTS_CANDIDATURE[candidature.statut]?.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {candidature.message && (
                        <p className="text-sm mt-3 bg-base-200 p-2 rounded italic">
                          "{candidature.message}"
                        </p>
                      )}

                      <div className="flex gap-4 text-xs text-base-content/60 mt-2">
                        {candidature.tarifPropose && (
                          <span className="font-medium text-primary">
                            {candidature.tarifPropose.toLocaleString()} FCFA
                          </span>
                        )}
                        {candidature.delaiProposeJours && (
                          <span>Délai: {candidature.delaiProposeJours} jours</span>
                        )}
                        <span className="ml-auto">
                          {new Date(candidature.dateCreation).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      {candidature.statut === 'EN_ATTENTE' && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => repondreCandidature(candidature.id, 'ACCEPTER')}
                            disabled={enregistrement}
                            className="btn btn-success btn-xs flex-1"
                          >
                            {enregistrement ? <span className="loading loading-spinner loading-xs"></span> : 'Accepter'}
                          </button>
                          <button
                            onClick={() => repondreCandidature(candidature.id, 'EN_DISCUSSION')}
                            disabled={enregistrement}
                            className="btn btn-info btn-xs flex-1 gap-1"
                          >
                            <Mail size={12} />
                            Contacter
                          </button>
                          <button
                            onClick={() => repondreCandidature(candidature.id, 'REFUSER')}
                            disabled={enregistrement}
                            className="btn btn-error btn-xs btn-outline flex-1"
                          >
                            Refuser
                          </button>
                        </div>
                      )}
                      {candidature.statut === 'EN_DISCUSSION' && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => repondreCandidature(candidature.id, 'ACCEPTER')}
                            disabled={enregistrement}
                            className="btn btn-success btn-xs flex-1"
                          >
                            Accepter
                          </button>
                          <button
                            onClick={() => repondreCandidature(candidature.id, 'REFUSER')}
                            disabled={enregistrement}
                            className="btn btn-error btn-xs btn-outline flex-1"
                          >
                            Refuser
                          </button>
                        </div>
                      )}
                      {candidature.statut === 'ACCEPTEE' && !candidature.estSurTache && projet && (() => {
                        // Vérifier s'il y a des tâches non assignées
                        const toutesLesTaches = [
                          ...(projet.tachesIndependantes || []),
                          ...(projet.etapes?.flatMap(e => e.taches || []) || [])
                        ];
                        const tachesNonAssignees = toutesLesTaches.filter(t => !t.expertAssigneId && t.statut === 'A_FAIRE');
                        return tachesNonAssignees.length > 0 ? (
                          <div className="mt-3">
                            <button
                              onClick={() => assignerExpertAuxTaches(candidature.expertId)}
                              disabled={enregistrement}
                              className="btn btn-primary btn-xs w-full gap-1"
                            >
                              <Users size={12} />
                              Assigner aux {tachesNonAssignees.length} tâche(s) disponible(s)
                            </button>
                          </div>
                        ) : (
                          <div className="mt-3 text-xs text-success flex items-center gap-1">
                            <CheckCircle size={12} />
                            Déjà assigné aux tâches
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Onglet Paramètres */}
        {ongletActif === 'parametres' && estProprietaire && (
          <div className="space-y-6">
            {/* Informations du projet */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold flex items-center gap-2">
                    <FileText size={18} />
                    Informations du projet
                  </h2>
                  {!modeEditionProjet && (
                    <button
                      onClick={activerEditionProjet}
                      className="btn btn-ghost btn-sm gap-1"
                    >
                      <Edit size={14} />
                      Modifier
                    </button>
                  )}
                </div>

                {modeEditionProjet ? (
                  /* Formulaire édition */
                  <div className="space-y-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Nom du projet *</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        value={modificationProjet.nom || ''}
                        onChange={(e) => setModificationProjet({ ...modificationProjet, nom: e.target.value })}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Description</span>
                      </label>
                      <textarea
                        className="textarea textarea-bordered w-full h-24"
                        value={modificationProjet.description || ''}
                        onChange={(e) => setModificationProjet({ ...modificationProjet, description: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Budget</span>
                        </label>
                        <input
                          type="number"
                          className="input input-bordered w-full"
                          value={modificationProjet.budget || ''}
                          onChange={(e) => setModificationProjet({
                            ...modificationProjet,
                            budget: parseInt(e.target.value) || 0
                          })}
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Devise</span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          value={modificationProjet.devise || 'FCFA'}
                          onChange={(e) => setModificationProjet({
                            ...modificationProjet,
                            devise: e.target.value
                          })}
                        >
                          <option value="FCFA">FCFA</option>
                          <option value="EUR">EUR</option>
                          <option value="USD">USD</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Visibilité</span>
                      </label>
                      <select
                        className="select select-bordered w-full"
                        value={modificationProjet.visibilite || 'PRIVE'}
                        onChange={(e) => setModificationProjet({
                          ...modificationProjet,
                          visibilite: e.target.value as VisibiliteProjet
                        })}
                      >
                        <option value="PRIVE">Privé - Seul vous pouvez voir ce projet</option>
                        <option value="PUBLIC">Public - Visible par tous les experts</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Date début prévue</span>
                        </label>
                        <input
                          type="date"
                          className="input input-bordered w-full"
                          value={modificationProjet.dateDebutPrevue || ''}
                          onChange={(e) => setModificationProjet({ ...modificationProjet, dateDebutPrevue: e.target.value })}
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Date fin prévue</span>
                        </label>
                        <input
                          type="date"
                          className="input input-bordered w-full"
                          value={modificationProjet.dateFinPrevue || ''}
                          onChange={(e) => setModificationProjet({ ...modificationProjet, dateFinPrevue: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setModeEditionProjet(false)}
                        className="btn btn-ghost btn-sm"
                        disabled={enregistrement}
                      >
                        Annuler
                      </button>
                      <button
                        onClick={modifierProjet}
                        disabled={!modificationProjet.nom?.trim() || enregistrement}
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
                  /* Affichage lecture seule */
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-base-content/60 mb-1">Nom</div>
                      <div className="font-medium">{projet.nom}</div>
                    </div>
                    {projet.description && (
                      <div>
                        <div className="text-xs text-base-content/60 mb-1">Description</div>
                        <div className="text-sm">{projet.description}</div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-base-content/60 mb-1">Budget</div>
                        <div className="font-medium">{formaterMontant(projet.budget, projet.devise)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-base-content/60 mb-1">Visibilité</div>
                        <div className="badge badge-sm">
                          {projet.visibilite === 'PUBLIC' ? 'Public' : 'Privé'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-base-content/60 mb-1">Début prévu</div>
                        <div>{formaterDate(projet.dateDebutPrevue)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-base-content/60 mb-1">Fin prévue</div>
                        <div>{formaterDate(projet.dateFinPrevue)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Exigences du projet */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold flex items-center gap-2">
                    <Target size={18} />
                    Exigences du projet
                    <span className="badge badge-sm">{projet.exigences.length}</span>
                  </h2>
                </div>

                <div className="space-y-2">
                  {/* Liste des exigences */}
                  {projet.exigences.map((exigence) => (
                    <div
                      key={exigence.id}
                      className="flex items-center gap-3 p-2 rounded hover:bg-base-200 group"
                    >
                      <CheckCircle size={16} className="text-success flex-shrink-0" />
                      <span className="flex-1 text-sm">{exigence.description}</span>
                      <button
                        onClick={() => supprimerExigence(exigence.id)}
                        className="btn btn-ghost btn-xs btn-circle text-error opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={enregistrement}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}

                  {projet.exigences.length === 0 && (
                    <p className="text-sm text-base-content/50 text-center py-4">
                      Aucune exigence définie
                    </p>
                  )}

                  {/* Ajouter exigence */}
                  <div className="flex gap-2 mt-4">
                    <input
                      type="text"
                      placeholder="Ajouter une exigence..."
                      className="input input-bordered input-sm flex-1"
                      value={nouvelleExigence}
                      onChange={(e) => setNouvelleExigence(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          ajouterExigence();
                        }
                      }}
                    />
                    <button
                      onClick={ajouterExigence}
                      disabled={!nouvelleExigence.trim() || enregistrement}
                      className="btn btn-primary btn-sm gap-1"
                    >
                      {enregistrement ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        <Plus size={14} />
                      )}
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Gestion des étapes */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold flex items-center gap-2">
                    <Layers size={18} />
                    Étapes du projet
                    <span className="badge badge-sm">{projet.etapes.length}</span>
                  </h2>
                  <button
                    onClick={ouvrirModalEtape}
                    className="btn btn-ghost btn-sm gap-1"
                  >
                    <Plus size={14} />
                    Ajouter
                  </button>
                </div>

                <div className="space-y-2">
                  {projet.etapes.map((etape) => (
                    <div
                      key={etape.id}
                      className="flex items-center gap-3 p-3 rounded bg-base-200"
                    >
                      <GripVertical size={16} className="text-base-content/40" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{etape.nom}</div>
                        {etape.description && (
                          <div className="text-xs text-base-content/60">{etape.description}</div>
                        )}
                      </div>
                      <span className="badge badge-sm">{etape.taches.length} tâches</span>
                    </div>
                  ))}

                  {projet.etapes.length === 0 && (
                    <p className="text-sm text-base-content/50 text-center py-4">
                      Aucune étape définie
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Zone de danger */}
            <div className="card bg-error/5 border border-error/20">
              <div className="card-body p-4">
                <h2 className="font-semibold text-error flex items-center gap-2 mb-4">
                  <AlertCircle size={18} />
                  Zone de danger
                </h2>
                <p className="text-sm text-base-content/70 mb-4">
                  Ces actions sont irréversibles. Procédez avec précaution.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button className="btn btn-error btn-sm btn-outline gap-1">
                    <Trash2 size={14} />
                    Supprimer le projet
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Créer Étape */}
      {modalEtapeOuverte && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <button
              onClick={() => setModalEtapeOuverte(false)}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              <X size={18} />
            </button>

            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Layers size={20} />
              Nouvelle étape
            </h3>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Nom de l'étape *</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Phase de conception"
                  className="input input-bordered w-full"
                  value={nouvelleEtape.nom}
                  onChange={(e) => setNouvelleEtape({ ...nouvelleEtape, nom: e.target.value })}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  placeholder="Décrivez cette étape..."
                  className="textarea textarea-bordered w-full h-24"
                  value={nouvelleEtape.description || ''}
                  onChange={(e) => setNouvelleEtape({ ...nouvelleEtape, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Date début</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={nouvelleEtape.dateDebutPrevue || ''}
                    onChange={(e) => setNouvelleEtape({ ...nouvelleEtape, dateDebutPrevue: e.target.value })}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Date fin</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={nouvelleEtape.dateFinPrevue || ''}
                    onChange={(e) => setNouvelleEtape({ ...nouvelleEtape, dateFinPrevue: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="modal-action">
              <button
                onClick={() => setModalEtapeOuverte(false)}
                className="btn btn-ghost"
              >
                Annuler
              </button>
              <button
                onClick={creerEtape}
                disabled={!nouvelleEtape.nom.trim() || enregistrement}
                className="btn btn-primary gap-1"
              >
                {enregistrement ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <Plus size={16} />
                )}
                Créer l'étape
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setModalEtapeOuverte(false)}></div>
        </div>
      )}

      {/* Modal Créer Tâche */}
      {modalTacheOuverte && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalTacheOuverte(false)}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              <X size={18} />
            </button>

            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <ListTodo size={20} />
              Nouvelle tâche
              {etapeSelectionnee && projet?.etapes && (
                <span className="badge badge-ghost">
                  {projet.etapes.find(e => e.id === etapeSelectionnee)?.nom || 'Étape'}
                </span>
              )}
            </h3>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Nom de la tâche *</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Créer les maquettes UI"
                  className="input input-bordered w-full"
                  value={nouvelleTache.nom}
                  onChange={(e) => setNouvelleTache({ ...nouvelleTache, nom: e.target.value })}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  placeholder="Décrivez cette tâche en détail..."
                  className="textarea textarea-bordered w-full h-24"
                  value={nouvelleTache.description || ''}
                  onChange={(e) => setNouvelleTache({ ...nouvelleTache, description: e.target.value })}
                />
              </div>

              {/* Étape (si pas déjà sélectionnée) */}
              {!etapeSelectionnee && projet && projet.etapes.length > 0 && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Rattacher à une étape</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={nouvelleTache.etapeId || ''}
                    onChange={(e) => setNouvelleTache({
                      ...nouvelleTache,
                      etapeId: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                  >
                    <option value="">Tâche indépendante</option>
                    {projet.etapes.map((etape) => (
                      <option key={etape.id} value={etape.id}>
                        {etape.nom}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Budget (FCFA)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="input input-bordered w-full"
                    value={nouvelleTache.budget || ''}
                    onChange={(e) => setNouvelleTache({
                      ...nouvelleTache,
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
                    placeholder="7"
                    className="input input-bordered w-full"
                    value={nouvelleTache.delaiJours || ''}
                    onChange={(e) => setNouvelleTache({
                      ...nouvelleTache,
                      delaiJours: parseInt(e.target.value) || undefined
                    })}
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Priorité</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={nouvelleTache.priorite || 'NORMALE'}
                  onChange={(e) => setNouvelleTache({
                    ...nouvelleTache,
                    priorite: e.target.value as PrioriteTache
                  })}
                >
                  <option value="BASSE">Basse</option>
                  <option value="NORMALE">Normale</option>
                  <option value="HAUTE">Haute</option>
                  <option value="URGENTE">Urgente</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Date début</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={nouvelleTache.dateDebutPrevue || ''}
                    onChange={(e) => setNouvelleTache({ ...nouvelleTache, dateDebutPrevue: e.target.value })}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Date fin</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={nouvelleTache.dateFinPrevue || ''}
                    onChange={(e) => setNouvelleTache({ ...nouvelleTache, dateFinPrevue: e.target.value })}
                  />
                </div>
              </div>

              {/* Section Livrables */}
              <div className="divider text-sm">
                <FileBox size={16} className="mr-1" />
                Livrables attendus
              </div>

              <div className="space-y-3">
                {livrablesFormulaire.map((livrable, indexLivrable) => (
                  <div key={indexLivrable} className="card bg-base-200 p-3">
                    <div className="flex items-start gap-2">
                      <GripVertical size={16} className="text-base-content/40 mt-2 flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        {/* Nom du livrable */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Nom du livrable (ex: Maquettes Figma)"
                            className="input input-bordered input-sm flex-1"
                            value={livrable.nom}
                            onChange={(e) => mettreAJourLivrable(indexLivrable, 'nom', e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => supprimerLivrable(indexLivrable)}
                            className="btn btn-ghost btn-sm btn-square text-error"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Description du livrable */}
                        <input
                          type="text"
                          placeholder="Description (optionnel)"
                          className="input input-bordered input-sm w-full"
                          value={livrable.description}
                          onChange={(e) => mettreAJourLivrable(indexLivrable, 'description', e.target.value)}
                        />

                        {/* Critères d'acceptation */}
                        <div className="pl-2 border-l-2 border-primary/30 space-y-1">
                          <div className="text-xs font-medium text-base-content/70 flex items-center gap-1">
                            <Target size={12} />
                            Critères de validation
                          </div>

                          {livrable.criteres.map((critere, indexCritere) => (
                            <div key={indexCritere} className="flex items-center gap-2 text-sm">
                              <CheckCircle size={12} className="text-success flex-shrink-0" />
                              <span className="flex-1">{critere}</span>
                              <button
                                type="button"
                                onClick={() => supprimerCritere(indexLivrable, indexCritere)}
                                className="btn btn-ghost btn-xs btn-circle text-error"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}

                          {/* Ajouter un critère */}
                          <div className="flex gap-1">
                            <input
                              type="text"
                              placeholder="Ajouter un critère..."
                              className="input input-bordered input-xs flex-1"
                              value={nouveauCritere[indexLivrable] || ''}
                              onChange={(e) => setNouveauCritere({
                                ...nouveauCritere,
                                [indexLivrable]: e.target.value
                              })}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  ajouterCritere(indexLivrable);
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => ajouterCritere(indexLivrable)}
                              className="btn btn-primary btn-xs"
                              disabled={!nouveauCritere[indexLivrable]?.trim()}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Bouton ajouter livrable */}
                <button
                  type="button"
                  onClick={ajouterLivrable}
                  className="btn btn-ghost btn-sm btn-block border-dashed border-2 gap-1"
                >
                  <Plus size={16} />
                  Ajouter un livrable
                </button>

                {livrablesFormulaire.length === 0 && (
                  <p className="text-xs text-base-content/50 text-center">
                    Définissez les livrables que l'expert devra fournir et leurs critères de validation
                  </p>
                )}
              </div>
            </div>

            <div className="modal-action">
              <button
                onClick={() => setModalTacheOuverte(false)}
                className="btn btn-ghost"
              >
                Annuler
              </button>
              <button
                onClick={creerTache}
                disabled={!nouvelleTache.nom.trim() || enregistrement}
                className="btn btn-primary gap-1"
              >
                {enregistrement ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <Plus size={16} />
                )}
                Créer la tâche
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setModalTacheOuverte(false)}></div>
        </div>
      )}

      {/* Modal Candidature */}
      {modalCandidatureOuverte && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <button
              onClick={() => setModalCandidatureOuverte(false)}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              <X size={18} />
            </button>

            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Send size={20} />
              Candidater
              {tacheIdCandidature && (
                <span className="badge badge-ghost text-xs">pour une tâche</span>
              )}
            </h3>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Message de motivation</span>
                </label>
                <textarea
                  placeholder="Présentez-vous et expliquez pourquoi vous êtes le bon expert pour ce projet..."
                  className="textarea textarea-bordered w-full h-32"
                  value={candidatureForm.message}
                  onChange={(e) => setCandidatureForm({ ...candidatureForm, message: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Tarif proposé (FCFA)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 150000"
                    className="input input-bordered w-full"
                    value={candidatureForm.tarifPropose}
                    onChange={(e) => setCandidatureForm({ ...candidatureForm, tarifPropose: e.target.value })}
                  />
                  <label className="label">
                    <span className="label-text-alt">Optionnel</span>
                  </label>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Délai (jours)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 14"
                    className="input input-bordered w-full"
                    value={candidatureForm.delaiProposeJours}
                    onChange={(e) => setCandidatureForm({ ...candidatureForm, delaiProposeJours: e.target.value })}
                  />
                  <label className="label">
                    <span className="label-text-alt">Optionnel</span>
                  </label>
                </div>
              </div>

              <div className="alert alert-info py-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="text-xs">
                  Le propriétaire du projet pourra voir votre profil et vos compétences.
                </span>
              </div>
            </div>

            <div className="modal-action">
              <button
                onClick={() => setModalCandidatureOuverte(false)}
                className="btn btn-ghost"
              >
                Annuler
              </button>
              <button
                onClick={soumettreCandidate}
                disabled={enregistrement}
                className="btn btn-primary gap-1"
              >
                {enregistrement ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <Send size={16} />
                )}
                Envoyer ma candidature
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setModalCandidatureOuverte(false)}></div>
        </div>
      )}

      {/* Modal Sélection Tâches pour assignation */}
      {projet && candidatureEnCoursAcceptation && (
        <ModalSelectionTaches
          isOpen={modalSelectionTachesOuverte}
          onClose={() => {
            setModalSelectionTachesOuverte(false);
            setCandidatureEnCoursAcceptation(null);
          }}
          projet={projet}
          candidature={candidatureEnCoursAcceptation}
          onConfirmer={confirmerAcceptationAvecTaches}
          enregistrement={enregistrement}
        />
      )}

      {/* Modal Contact pour discussion avec l'expert */}
      {candidaturePourContact && (
        <ModalContact
          isOpen={modalContactOuvert}
          onClose={() => {
            setModalContactOuvert(false);
            setCandidaturePourContact(null);
          }}
          expert={{
            id: candidaturePourContact.expertId,
            nom: candidaturePourContact.expertNom || '',
            prenom: candidaturePourContact.expertPrenom || '',
            titre: candidaturePourContact.expertTitre || '',
            photoUrl: candidaturePourContact.expertPhotoUrl || '',
            rating: 0,
            nombreProjets: 0,
            description: '',
            competences: [],
            experienceAnnees: 0,
            tjmMin: 0,
            tjmMax: 0,
            localisation: '',
            disponible: true
          }}
          onSuccess={onContactEnvoye}
        />
      )}

    </div>
  );
}

// Composant Tâche amélioré avec durée et livrables
function TacheCard({ tache, onClick }: { tache: Tache; onClick?: () => void }) {
  const config = STATUTS_TACHE[tache.statut];

  // Formater la durée
  const formaterDuree = () => {
    if (tache.delaiJours) {
      return `${tache.delaiJours} jour${tache.delaiJours > 1 ? 's' : ''}`;
    }
    if (tache.dateDebutPrevue && tache.dateFinPrevue) {
      const debut = new Date(tache.dateDebutPrevue);
      const fin = new Date(tache.dateFinPrevue);
      const jours = Math.ceil((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24));
      return `${jours} jour${jours > 1 ? 's' : ''}`;
    }
    return null;
  };

  const duree = formaterDuree();

  return (
    <div
      className={`card bg-base-200/50 hover:bg-base-200 transition-colors ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="card-body p-3">
        {/* Ligne principale */}
        <div className="flex items-start gap-3">
          {/* Avatar expert assigné */}
          {tache.expertAssigneId ? (
            <div className="flex-shrink-0 tooltip tooltip-right" data-tip={`${tache.expertPrenom || ''} ${tache.expertNom || ''}`}>
              {tache.expertPhotoUrl ? (
                <img
                  src={`/api/photos/${tache.expertAssigneId}`}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center font-semibold text-xs ${tache.expertPhotoUrl ? 'hidden' : ''}`}>
                {tache.expertPrenom?.charAt(0).toUpperCase() || tache.expertNom?.charAt(0).toUpperCase() || '?'}
                {tache.expertNom?.charAt(0).toUpperCase() || ''}
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-base-content/40">?</span>
            </div>
          )}

          <div className={`badge badge-sm gap-1 flex-shrink-0 ${config?.classe}`}>
            {config?.icone}
            {config?.label}
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">{tache.nom}</div>
            {tache.description && (
              <div className="text-xs text-base-content/60 line-clamp-2 mt-0.5">{tache.description}</div>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {tache.estDisponible && (
              <span className="badge badge-success badge-xs">Disponible</span>
            )}
            {onClick && (
              <ChevronRight size={14} className="text-base-content/40" />
            )}
          </div>
        </div>

        {/* Ligne d'infos */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-base-content/60">
          {/* Durée */}
          {duree && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {duree}
            </span>
          )}

          {/* Dates */}
          {tache.dateDebutPrevue && (
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(tache.dateDebutPrevue).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              {tache.dateFinPrevue && (
                <> → {new Date(tache.dateFinPrevue).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</>
              )}
            </span>
          )}

          {/* Budget */}
          {tache.budget > 0 && (
            <span className="font-medium text-primary">
              {tache.budget.toLocaleString()} FCFA
            </span>
          )}
        </div>

        {/* Livrables */}
        {tache.nombreLivrables > 0 && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-base-300">
            <FileBox size={14} className="text-base-content/50" />
            <div className="flex-1">
              <span className="text-xs">
                {tache.nombreLivrables} livrable{tache.nombreLivrables > 1 ? 's' : ''}
              </span>
              {tache.nombreLivrablesValides > 0 && (
                <span className="text-xs text-success ml-2">
                  ({tache.nombreLivrablesValides} validé{tache.nombreLivrablesValides > 1 ? 's' : ''})
                </span>
              )}
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: tache.nombreLivrables }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < tache.nombreLivrablesValides ? 'bg-success' : 'bg-base-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Livrables détaillés si disponibles */}
        {tache.livrables && tache.livrables.length > 0 && (
          <div className="mt-2 pt-2 border-t border-base-300 space-y-1">
            {tache.livrables.slice(0, 3).map((livrable) => (
              <div key={livrable.id} className="flex items-center gap-2 text-xs">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  livrable.statut === 'ACCEPTE' ? 'bg-success' :
                  livrable.statut === 'SOUMIS' || livrable.statut === 'EN_REVUE' ? 'bg-warning' :
                  livrable.statut === 'REFUSE' ? 'bg-error' : 'bg-base-300'
                }`} />
                <span className="truncate">{livrable.nom}</span>
                {livrable.criteres && livrable.criteres.length > 0 && (
                  <span className="text-base-content/40 flex-shrink-0">
                    ({livrable.criteres.filter(c => c.estValide).length}/{livrable.criteres.length} critères)
                  </span>
                )}
              </div>
            ))}
            {tache.livrables.length > 3 && (
              <div className="text-xs text-base-content/40">
                +{tache.livrables.length - 3} autre{tache.livrables.length - 3 > 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
