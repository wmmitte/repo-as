import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Briefcase,
  ClipboardList,
  Award,
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Calendar,
  Paperclip,
  Eye,
  EyeOff,
  Send,
  ChevronRight,
} from 'lucide-react';
import {
  COMPETENCES_PREDEFINIES,
  type CompetenceUtilisateur,
  type PropositionProjet,
  type CompetencePredefinie
} from '@/types/competence.types';
import EditerExpertise from '@/components/expertise/EditerExpertise';
import { reconnaissanceService } from '@/services/reconnaissanceService';
import { DemandeReconnaissanceDTO, StatutDemande, NiveauCertification, BadgeCompetenceDTO, TypePiece } from '@/types/reconnaissance.types';
import ModalConfirm from '@/components/ui/ModalConfirm';
import { useToast } from '@/contexts/ToastContext';
import { useHeaderConfig } from '@/hooks/useHeaderConfig';
import { obtenirNiveauAvecSignification } from '@/utils/badgeUtils';

export default function ExpertisePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [ongletActif, setOngletActif] = useState<'editer' | 'demandes' | 'badges' | 'competences'>('editer');

  // États pour les compétences
  const [recherche, setRecherche] = useState('');
  const [competencesUtilisateur, setCompetencesUtilisateur] = useState<CompetenceUtilisateur[]>([]);
  const [afficherSuggestions, setAfficherSuggestions] = useState(false);
  const [propositions, setPropositions] = useState<PropositionProjet[]>([]);

  // États pour les demandes de reconnaissance
  const [demandes, setDemandes] = useState<DemandeReconnaissanceDTO[]>([]);
  const [loadingDemandes, setLoadingDemandes] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState<DemandeReconnaissanceDTO | null>(null);
  const [showAnnulerModal, setShowAnnulerModal] = useState(false);
  const [demandeToAnnuler, setDemandeToAnnuler] = useState<number | null>(null);
  const [showComplementModal, setShowComplementModal] = useState(false);
  const [demandeComplement, setDemandeComplement] = useState<DemandeReconnaissanceDTO | null>(null);
  const [commentaireComplement, setCommentaireComplement] = useState('');
  const [fichiers, setFichiers] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // États pour les badges
  const [badges, setBadges] = useState<BadgeCompetenceDTO[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(false);

  // Configuration du header avec onglets
  useHeaderConfig({
    title: 'Mon Expertise',
    tabs: [
      { id: 'editer', label: 'Éditer' },
      { id: 'demandes', label: `Mes demandes (${demandes.length})` },
      { id: 'badges', label: `Mes badges (${badges.length})` },
      { id: 'competences', label: `Compétences (${competencesUtilisateur.length})` },
    ],
    activeTab: ongletActif,
    onTabChange: (tabId) => setOngletActif(tabId as typeof ongletActif),
  });

  const BADGE_ICONS_BADGES: Record<NiveauCertification, string> = {
    [NiveauCertification.BRONZE]: '🥉',
    [NiveauCertification.ARGENT]: '🥈',
    [NiveauCertification.OR]: '🥇',
    [NiveauCertification.PLATINE]: '💎',
  };

  const BADGE_COLORS_BADGES: Record<NiveauCertification, string> = {
    [NiveauCertification.BRONZE]: 'from-orange-400 to-orange-600',
    [NiveauCertification.ARGENT]: 'from-gray-300 to-gray-500',
    [NiveauCertification.OR]: 'from-yellow-400 to-yellow-600',
    [NiveauCertification.PLATINE]: 'from-purple-400 to-pink-600',
  };

  // Couleurs de fond/bordure des cartes selon le niveau
  const BADGE_CARD_STYLES: Record<NiveauCertification, { bg: string; border: string; accent: string }> = {
    [NiveauCertification.BRONZE]: {
      bg: 'bg-gradient-to-br from-orange-50 to-amber-50',
      border: 'border-orange-200 hover:border-orange-300',
      accent: 'text-orange-700',
    },
    [NiveauCertification.ARGENT]: {
      bg: 'bg-gradient-to-br from-slate-50 to-gray-100',
      border: 'border-slate-300 hover:border-slate-400',
      accent: 'text-slate-600',
    },
    [NiveauCertification.OR]: {
      bg: 'bg-gradient-to-br from-yellow-50 to-amber-50',
      border: 'border-yellow-300 hover:border-yellow-400',
      accent: 'text-yellow-700',
    },
    [NiveauCertification.PLATINE]: {
      bg: 'bg-gradient-to-br from-purple-50 to-pink-50',
      border: 'border-purple-200 hover:border-purple-300',
      accent: 'text-purple-700',
    },
  };

  // Charger les données au montage
  useEffect(() => {
    chargerDonneesUtilisateur();
    genererPropositionsFactices();
    chargerDemandes();
    chargerBadges();
  }, []);

  const chargerDonneesUtilisateur = () => {
    // Charger depuis localStorage ou API
    const utilisateur = JSON.parse(localStorage.getItem('pitm_utilisateur') || '{}');

    // Charger les compétences existantes
    const competences = utilisateur.competences || [];
    const competencesAvecDetails: CompetenceUtilisateur[] = competences.map((nomComp: string) => {
      const compPredef = COMPETENCES_PREDEFINIES.find(c => c.nom === nomComp);
      return {
        id: `user_comp_${nomComp}`,
        competenceId: compPredef?.id || nomComp,
        nom: nomComp,
        description: compPredef?.description || 'Compétence ajoutée',
        nombreDemandes: Math.floor(Math.random() * 15) + 1, // Fictif
        dateAjout: new Date().toISOString()
      };
    });
    setCompetencesUtilisateur(competencesAvecDetails);

  };

  const chargerDemandes = async () => {
    try {
      setLoadingDemandes(true);
      const data = await reconnaissanceService.getMesDemandes();
      setDemandes(data);
    } catch (err) {
      toast.erreur(err);
      console.error('Erreur chargement demandes:', err);
    } finally {
      setLoadingDemandes(false);
    }
  };

  const handleAnnulerClick = (demandeId: number) => {
    setDemandeToAnnuler(demandeId);
    setShowAnnulerModal(true);
  };

  const handleAnnulerConfirm = async () => {
    if (!demandeToAnnuler) return;

    try {
      await reconnaissanceService.annulerDemande(demandeToAnnuler);
      await chargerDemandes();
      setShowAnnulerModal(false);
      setDemandeToAnnuler(null);
      toast.succes('Demande annulée avec succès');
    } catch (err) {
      setShowAnnulerModal(false);
      toast.erreur(err);
    }
  };

  const handleFournirComplement = (demande: DemandeReconnaissanceDTO) => {
    setDemandeComplement(demande);
    setCommentaireComplement('');
    setFichiers([]);
    setShowComplementModal(true);
  };

  const handleFichierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFichiers(Array.from(e.target.files));
    }
  };

  const handleSoumettreComplement = async () => {
    if (!demandeComplement) return;

    try {
      setSubmitting(true);

      // Upload des nouvelles pièces si présentes
      if (fichiers.length > 0) {
        for (const fichier of fichiers) {
          await reconnaissanceService.ajouterPieceJustificative(
            demandeComplement.id,
            fichier,
            TypePiece.AUTRE
          );
        }
      }

      // Resoumettre la demande avec le commentaire
      await reconnaissanceService.resoumettreApresComplement(
        demandeComplement.id,
        commentaireComplement || undefined
      );

      toast.succes('Complément fourni ! Votre demande a été resoumise.');

      setShowComplementModal(false);
      setDemandeComplement(null);
      setCommentaireComplement('');
      setFichiers([]);
      chargerDemandes();
    } catch (err) {
      toast.erreur(err);
    } finally {
      setSubmitting(false);
    }
  };

  const chargerBadges = async () => {
    try {
      setLoadingBadges(true);
      const data = await reconnaissanceService.getMesBadges(true);
      setBadges(data);
    } catch (err) {
      toast.erreur(err);
    } finally {
      setLoadingBadges(false);
    }
  };

  // Fonction pour rafraîchir toutes les données des onglets
  const rafraichirToutesDonnees = async () => {
    await Promise.all([
      chargerDemandes(),
      chargerBadges(),
    ]);
    // Recharger aussi les compétences utilisateur
    chargerDonneesUtilisateur();
  };

  const handleToggleVisibilite = async (badgeId: number, currentState: boolean) => {
    try {
      await reconnaissanceService.toggleVisibiliteBadge(badgeId);
      await chargerBadges();
      toast.succes(currentState ? 'Badge masqué sur votre profil public' : 'Badge visible sur votre profil public');
    } catch (err) {
      toast.erreur(err);
    }
  };

  const genererPropositionsFactices = () => {
    // Générer des propositions fictives pour démonstration
    const propositionsFactices: PropositionProjet[] = [
      {
        id: 'prop_1',
        competenceId: 'comp_react',
        nomProjet: 'Développement d\'une plateforme e-commerce',
        descriptionProjet: 'Création d\'une boutique en ligne moderne avec panier, paiement et gestion des commandes. Interface responsive et performante.',
        nomClient: 'Sarah Ouedraogo',
        emailClient: 'sarah.o@entreprise.bf',
        avatarClient: 'https://i.pravatar.cc/200?u=sarah',
        entrepriseClient: 'TechStore BF',
        budget: 2500000,
        devise: 'FCFA',
        dureeEstimee: '6 semaines',
        dateProposition: '2025-01-28',
        statut: 'en_attente',
        priorite: 'haute',
        type: 'projet'
      },
      {
        id: 'prop_2',
        competenceId: 'comp_react',
        nomProjet: 'Correction de bugs sur application React',
        descriptionProjet: 'Résoudre 5 bugs identifiés dans notre application de gestion. Liste détaillée fournie.',
        nomClient: 'Moussa Traoré',
        emailClient: 'moussa.t@startup.bf',
        entrepriseClient: 'StartupHub',
        budget: 150000,
        devise: 'FCFA',
        dureeEstimee: '1 semaine',
        dateProposition: '2025-01-27',
        statut: 'en_attente',
        priorite: 'normale',
        type: 'tache'
      },
      {
        id: 'prop_3',
        competenceId: 'comp_nodejs',
        nomProjet: 'API REST pour application mobile',
        descriptionProjet: 'Développement d\'une API backend complète avec authentification, gestion utilisateurs et base de données MongoDB.',
        nomClient: 'Aminata Kaboré',
        emailClient: 'aminata.k@mobile.bf',
        entrepriseClient: 'MobileFirst',
        budget: 1800000,
        devise: 'FCFA',
        dureeEstimee: '4 semaines',
        dateProposition: '2025-01-26',
        statut: 'en_attente',
        priorite: 'haute',
        type: 'projet'
      },
      {
        id: 'prop_4',
        competenceId: 'comp_figma',
        nomProjet: 'Maquettes UI pour application bancaire',
        descriptionProjet: 'Création de 15 écrans pour une application bancaire moderne. Respect de la charte graphique fournie.',
        nomClient: 'Ibrahim Sawadogo',
        emailClient: 'ibrahim.s@banque.bf',
        entrepriseClient: 'Banque Digitale',
        budget: 800000,
        devise: 'FCFA',
        dureeEstimee: '3 semaines',
        dateProposition: '2025-01-25',
        statut: 'en_attente',
        priorite: 'normale',
        type: 'projet'
      }
    ];
    setPropositions(propositionsFactices);
  };

  // Filtrer les suggestions basées sur la recherche
  const suggestionsFiltrees = COMPETENCES_PREDEFINIES.filter(comp => {
    const rechercheMin = recherche.toLowerCase();
    const dejaAjoutee = competencesUtilisateur.some(c => c.nom === comp.nom);
    return !dejaAjoutee && (
      comp.nom.toLowerCase().includes(rechercheMin) ||
      comp.description.toLowerCase().includes(rechercheMin) ||
      comp.categorie.toLowerCase().includes(rechercheMin)
    );
  }).slice(0, 6); // Limiter à 6 suggestions

  const ajouterCompetence = (comp: CompetencePredefinie) => {
    const nouvelleComp: CompetenceUtilisateur = {
      id: `user_${comp.id}`,
      competenceId: comp.id,
      nom: comp.nom,
      description: comp.description,
      nombreDemandes: 0, // Commence à 0
      dateAjout: new Date().toISOString()
    };

    setCompetencesUtilisateur(prev => [...prev, nouvelleComp]);
    setRecherche('');
    setAfficherSuggestions(false);

    // Sauvegarder dans localStorage
    const utilisateur = JSON.parse(localStorage.getItem('pitm_utilisateur') || '{}');
    const competences = [...(utilisateur.competences || []), comp.nom];
    localStorage.setItem('pitm_utilisateur', JSON.stringify({
      ...utilisateur,
      competences
    }));
  };

  const retirerCompetence = (compId: string) => {
    const comp = competencesUtilisateur.find(c => c.id === compId);
    if (!comp) return;

    setCompetencesUtilisateur(prev => prev.filter(c => c.id !== compId));

    // Mettre à jour localStorage
    const utilisateur = JSON.parse(localStorage.getItem('pitm_utilisateur') || '{}');
    const competences = (utilisateur.competences || []).filter((c: string) => c !== comp.nom);
    localStorage.setItem('pitm_utilisateur', JSON.stringify({
      ...utilisateur,
      competences
    }));
  };

  const ouvrirDetailsCompetence = (comp: CompetenceUtilisateur) => {
    // Naviguer vers la page de détails avec le nom de la compétence comme paramètre
    navigate(`/expertise/${comp.nom}`);
  };

  // Fonction pour mapper les statuts backend vers les statuts synthétiques affichés à l'expert
  const getStatutSynthetiqueExpert = (statut: StatutDemande): StatutDemande => {
    // Regrouper les statuts intermédiaires en EN_COURS_TRAITEMENT
    if (
      statut === StatutDemande.ASSIGNEE_RH ||
      statut === StatutDemande.EN_COURS_EVALUATION ||
      statut === StatutDemande.EN_ATTENTE_VALIDATION ||
      statut === StatutDemande.EN_COURS_TRAITEMENT
    ) {
      return StatutDemande.EN_COURS_TRAITEMENT;
    }
    // Les autres statuts restent inchangés
    return statut;
  };

  const STATUT_COLORS: Record<StatutDemande, string> = {
    [StatutDemande.EN_ATTENTE]: 'bg-yellow-100 text-yellow-800',
    [StatutDemande.ASSIGNEE_RH]: 'bg-blue-100 text-blue-800',
    [StatutDemande.EN_COURS_EVALUATION]: 'bg-indigo-100 text-indigo-800',
    [StatutDemande.EN_ATTENTE_VALIDATION]: 'bg-purple-100 text-purple-800',
    [StatutDemande.EN_COURS_TRAITEMENT]: 'bg-blue-100 text-blue-800',
    [StatutDemande.COMPLEMENT_REQUIS]: 'bg-orange-100 text-orange-800',
    [StatutDemande.APPROUVEE]: 'bg-green-100 text-green-800',
    [StatutDemande.REJETEE]: 'bg-red-100 text-red-800',
    [StatutDemande.ANNULEE]: 'bg-gray-100 text-gray-800',
  };

  const STATUT_LABELS: Record<StatutDemande, string> = {
    [StatutDemande.EN_ATTENTE]: 'En attente',
    [StatutDemande.ASSIGNEE_RH]: 'En cours de traitement',
    [StatutDemande.EN_COURS_EVALUATION]: 'En cours de traitement',
    [StatutDemande.EN_ATTENTE_VALIDATION]: 'En cours de traitement',
    [StatutDemande.EN_COURS_TRAITEMENT]: 'En cours de traitement',
    [StatutDemande.COMPLEMENT_REQUIS]: 'Complément requis',
    [StatutDemande.APPROUVEE]: 'Approuvée',
    [StatutDemande.REJETEE]: 'Rejetée',
    [StatutDemande.ANNULEE]: 'Annulée',
  };

  // Obtenir les propositions pour une compétence
  const obtenirPropositionsPourCompetence = (compId: string) => {
    return propositions.filter(p => p.competenceId === compId);
  };

  // Générer un message user-friendly selon le statut de la demande
  const genererMessageStatut = (demande: DemandeReconnaissanceDTO): { message: string; type: 'succes' | 'erreur' | 'info' | 'avertissement' } => {
    const statutSynthetique = getStatutSynthetiqueExpert(demande.statut);
    const commentaire = demande.commentaireTraitant;

    if (statutSynthetique === StatutDemande.APPROUVEE) {
      let message = `Félicitations ! Votre demande de reconnaissance pour la compétence "${demande.competenceNom}" a été approuvée. Vous avez obtenu un badge qui valorise votre expertise.`;
      if (commentaire) {
        message += ` Observations : ${commentaire}`;
      }
      return { message, type: 'succes' };
    }

    if (statutSynthetique === StatutDemande.REJETEE) {
      let message = `Nous sommes désolés, votre demande de reconnaissance pour la compétence "${demande.competenceNom}" n'a pas pu être approuvée.`;
      if (commentaire) {
        message += ` Raison : ${commentaire}`;
      } else {
        message += ` N'hésitez pas à soumettre une nouvelle demande avec des justificatifs plus complets.`;
      }
      return { message, type: 'erreur' };
    }

    if (statutSynthetique === StatutDemande.COMPLEMENT_REQUIS) {
      let message = `Des informations complémentaires sont nécessaires pour traiter votre demande.`;
      if (commentaire) {
        message += ` Ce qui est demandé : ${commentaire}`;
      }
      return { message, type: 'avertissement' };
    }

    if (statutSynthetique === StatutDemande.ANNULEE) {
      return {
        message: `Cette demande a été annulée.`,
        type: 'info'
      };
    }

    if (statutSynthetique === StatutDemande.EN_ATTENTE) {
      return {
        message: `Votre demande est en attente d'assignation à un évaluateur. Vous serez notifié dès qu'elle sera prise en charge.`,
        type: 'info'
      };
    }

    // EN_COURS_TRAITEMENT (inclut ASSIGNEE_RH, EN_COURS_EVALUATION, EN_ATTENTE_VALIDATION)
    return {
      message: `Votre demande est en cours de traitement par nos équipes. Vous serez notifié dès qu'une décision sera prise.`,
      type: 'info'
    };
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Onglet Éditer et publier */}
          {ongletActif === 'editer' && (
            <EditerExpertise onDemandeSubmitted={rafraichirToutesDonnees} />
          )}

          {/* Onglet Mes demandes */}
          {ongletActif === 'demandes' && (
            loadingDemandes ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : demandes.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">Aucune demande de reconnaissance</p>
                <button
                  onClick={() => setOngletActif('editer')}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium"
                >
                  Gérer mes compétences
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {demandes.map((demande) => {
                  const statutSynthetique = getStatutSynthetiqueExpert(demande.statut);
                  const StatutIcon = statutSynthetique === StatutDemande.APPROUVEE ? CheckCircle :
                                     statutSynthetique === StatutDemande.REJETEE ? XCircle :
                                     statutSynthetique === StatutDemande.COMPLEMENT_REQUIS ? AlertCircle :
                                     Clock;

                  return (
                    <div
                      key={demande.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {/* Icône statut */}
                        <div className={`p-2 rounded-lg flex-shrink-0 ${
                          statutSynthetique === StatutDemande.APPROUVEE ? 'bg-emerald-100 text-emerald-600' :
                          statutSynthetique === StatutDemande.REJETEE ? 'bg-red-100 text-red-600' :
                          statutSynthetique === StatutDemande.COMPLEMENT_REQUIS ? 'bg-orange-100 text-orange-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          <StatutIcon size={20} />
                        </div>

                        {/* Infos principales */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 truncate">{demande.competenceNom}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUT_COLORS[statutSynthetique]}`}>
                              {STATUT_LABELS[statutSynthetique]}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(demande.dateCreation).toLocaleDateString('fr-FR')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Paperclip size={12} />
                              {demande.nombrePieces} pièce(s)
                            </span>
                            {demande.badge && (
                              <span className="font-medium text-emerald-600">
                                Badge obtenu
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {demande.statut === StatutDemande.COMPLEMENT_REQUIS && (
                            <button
                              onClick={() => handleFournirComplement(demande)}
                              className="px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-xs font-medium flex items-center gap-1"
                            >
                              <Upload size={14} />
                              Compléter
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedDemande(demande)}
                            className="p-1.5 text-gray-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                            title="Voir détails"
                          >
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Message du traitant si complément requis */}
                      {demande.statut === StatutDemande.COMPLEMENT_REQUIS && demande.commentaireTraitant && (
                        <div className="mt-3 p-2.5 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-xs text-orange-800">
                            <span className="font-medium">Demande :</span> {demande.commentaireTraitant}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* Modal de détails demande */}
          {selectedDemande && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedDemande(null)}>
              <div className="bg-white rounded-xl max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedDemande.competenceNom}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded ${STATUT_COLORS[getStatutSynthetiqueExpert(selectedDemande.statut)]}`}>
                        {STATUT_LABELS[getStatutSynthetiqueExpert(selectedDemande.statut)]}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedDemande(null)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                    <X size={18} className="text-gray-400" />
                  </button>
                </div>

                <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                  {/* Message user-friendly selon le statut */}
                  {(() => {
                    const messageStatut = genererMessageStatut(selectedDemande);
                    const styleConfig = {
                      succes: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', icon: <CheckCircle size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" /> },
                      erreur: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: <XCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" /> },
                      avertissement: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', icon: <AlertCircle size={18} className="text-orange-500 flex-shrink-0 mt-0.5" /> },
                      info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: <Clock size={18} className="text-blue-500 flex-shrink-0 mt-0.5" /> },
                    };
                    const style = styleConfig[messageStatut.type];

                    return (
                      <div className={`p-3 ${style.bg} border ${style.border} rounded-lg flex gap-2.5`}>
                        {style.icon}
                        <p className={`text-sm ${style.text} text-justify`}>{messageStatut.message}</p>
                      </div>
                    );
                  })()}

                  {selectedDemande.commentaireExpert && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-1">Motif / Justification Demande</p>
                      <p className="text-sm text-gray-700 text-justify">{selectedDemande.commentaireExpert}</p>
                    </div>
                  )}

                  {selectedDemande.pieces && selectedDemande.pieces.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">Pièces jointes ({selectedDemande.pieces.length})</p>
                      <div className="space-y-1">
                        {selectedDemande.pieces.map((piece) => (
                          <div key={piece.id} className="flex items-center gap-2 text-sm p-2 bg-slate-50 rounded-lg">
                            {piece.estVerifie ? <CheckCircle size={14} className="text-emerald-500" /> : <Paperclip size={14} className="text-gray-400" />}
                            <span className="truncate flex-1">{piece.nom}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDemande.evaluation && (
                    <div className="p-3 bg-primary/5 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 mb-1">Note d'évaluation</p>
                      <p className="text-2xl font-bold text-primary">{selectedDemande.evaluation.noteGlobale}/100</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 px-5 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
                  {(selectedDemande.statut === StatutDemande.EN_ATTENTE || selectedDemande.statut === StatutDemande.COMPLEMENT_REQUIS) && (
                    <button
                      onClick={() => { setSelectedDemande(null); handleAnnulerClick(selectedDemande.id); }}
                      className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"
                    >
                      Annuler
                    </button>
                  )}
                  <div className="flex-1" />
                  <button
                    onClick={() => setSelectedDemande(null)}
                    className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm font-medium"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal de complément */}
          {showComplementModal && demandeComplement && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => !submitting && setShowComplementModal(false)}>
              <div className="bg-white rounded-xl max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-orange-100">
                      <Upload size={18} className="text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Fournir le complément</h3>
                      <p className="text-xs text-gray-500">{demandeComplement.competenceNom}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowComplementModal(false)} disabled={submitting} className="p-1 hover:bg-slate-100 rounded-lg">
                    <X size={16} className="text-gray-400" />
                  </button>
                </div>

                <div className="px-4 py-3 space-y-3">
                  {demandeComplement.commentaireTraitant && (
                    <div className="p-2.5 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-xs font-medium text-orange-700 mb-1">Ce qui est demandé :</p>
                      <p className="text-sm text-orange-800">{demandeComplement.commentaireTraitant}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Commentaires <span className="text-gray-400">(optionnel)</span>
                    </label>
                    <textarea
                      value={commentaireComplement}
                      onChange={(e) => setCommentaireComplement(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      rows={2}
                      placeholder="Expliquez les compléments apportés..."
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Pièces justificatives <span className="text-gray-400">(optionnel)</span>
                    </label>
                    <div className="border border-dashed border-slate-300 rounded-lg p-3 text-center">
                      <input type="file" multiple onChange={handleFichierChange} className="hidden" id="fichier-complement" disabled={submitting} />
                      <label htmlFor="fichier-complement" className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-gray-700">
                        <Upload size={14} />
                        Ajouter des fichiers
                      </label>
                      {fichiers.length > 0 && (
                        <div className="mt-2 text-left space-y-1">
                          {fichiers.map((f, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-gray-600 p-1.5 bg-slate-50 rounded">
                              <Paperclip size={12} />
                              <span className="truncate">{f.name}</span>
                              <span className="text-gray-400">({(f.size / 1024).toFixed(0)} Ko)</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-200 bg-slate-50 rounded-b-xl">
                  <button onClick={() => setShowComplementModal(false)} disabled={submitting} className="px-3 py-1.5 text-gray-600 hover:bg-slate-200 rounded-lg text-sm font-medium">
                    Annuler
                  </button>
                  <button onClick={handleSoumettreComplement} disabled={submitting} className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-50">
                    <Send size={14} />
                    {submitting ? 'Envoi...' : 'Resoumettre'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal d'annulation */}
          <ModalConfirm
            isOpen={showAnnulerModal}
            onClose={() => { setShowAnnulerModal(false); setDemandeToAnnuler(null); }}
            onConfirm={handleAnnulerConfirm}
            title="Annuler la demande"
            message="Êtes-vous sûr de vouloir annuler cette demande ? Cette action est irréversible."
            confirmText="Oui, annuler"
            cancelText="Non, garder"
            type="error"
          />

          {/* Onglet Mes badges */}
          {ongletActif === 'badges' && (
            loadingBadges ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : badges.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">Aucun badge obtenu</p>
                <p className="text-sm text-gray-400 mb-4">
                  Soumettez des demandes de reconnaissance pour obtenir vos premiers badges
                </p>
                <button
                  onClick={() => setOngletActif('demandes')}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium"
                >
                  Voir mes demandes
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((badge) => {
                  const cardStyle = BADGE_CARD_STYLES[badge.niveauCertification];
                  return (
                  <div
                    key={badge.id}
                    className={`${cardStyle.bg} border ${cardStyle.border} rounded-xl p-4 hover:shadow-md transition-all group`}
                  >
                    {/* Header avec icône et statut */}
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${BADGE_COLORS_BADGES[badge.niveauCertification]} flex items-center justify-center shadow-md`}>
                        <span className="text-2xl">{BADGE_ICONS_BADGES[badge.niveauCertification]}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${badge.estValide ? 'bg-emerald-100/80 text-emerald-700' : 'bg-red-100/80 text-red-700'}`}>
                          {badge.estValide ? 'Valide' : 'Expiré'}
                        </span>
                        <button
                          onClick={() => handleToggleVisibilite(badge.id, badge.estPublic)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            badge.estPublic
                              ? 'text-emerald-600 hover:bg-white/50'
                              : 'text-gray-400 hover:bg-white/50'
                          }`}
                          title={badge.estPublic ? 'Visible publiquement' : 'Masqué'}
                        >
                          {badge.estPublic ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Nom de la compétence */}
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2" title={badge.competenceNom}>
                      {badge.competenceNom}
                    </h3>

                    {/* Niveau */}
                    <p className={`text-xs font-medium mb-3 ${cardStyle.accent}`}>
                      {obtenirNiveauAvecSignification(badge.niveauCertification)}
                    </p>

                    {/* Infos en bas */}
                    <div className="pt-3 border-t border-white/50 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Obtenu le</span>
                        <span className="text-gray-700 font-medium">
                          {new Date(badge.dateObtention).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Validité</span>
                        {badge.validitePermanente ? (
                          <span className="text-emerald-600 font-medium flex items-center gap-1">
                            <CheckCircle size={12} />
                            Permanente
                          </span>
                        ) : badge.dateExpiration ? (
                          <span className="text-orange-600 font-medium">
                            Jusqu'au {new Date(badge.dateExpiration).toLocaleDateString('fr-FR')}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )
          )}

          {/* Onglet Compétences */}
          {ongletActif === 'competences' && (
            <div className="space-y-6">
              {/* Recherche */}
              <div className="relative">
                <label className="block text-gray-900 font-medium mb-3">
                  Rechercher et ajouter des compétences
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Ex: React, Python, Design..."
                    value={recherche}
                    onChange={(e) => {
                      setRecherche(e.target.value);
                      setAfficherSuggestions(true);
                    }}
                    onFocus={() => setAfficherSuggestions(true)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Suggestions autosuggest */}
                {afficherSuggestions && recherche && suggestionsFiltrees.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                    {suggestionsFiltrees.map((comp) => (
                      <button
                        key={comp.id}
                        onClick={() => ajouterCompetence(comp)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{comp.icone}</span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{comp.nom}</p>
                            <p className="text-sm text-gray-600">{comp.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              <span className="px-2 py-0.5 bg-gray-100 rounded">
                                {comp.categorie}
                              </span>
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Liste des compétences de l'utilisateur */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">
                  Mes compétences ({competencesUtilisateur.length})
                </h3>

                {competencesUtilisateur.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Briefcase size={48} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">Aucune compétence ajoutée</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Utilisez la barre de recherche ci-dessus pour ajouter vos compétences
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {competencesUtilisateur.map((comp) => {
                      const propositionsComp = obtenirPropositionsPourCompetence(comp.competenceId);
                      const propositionsEnAttente = propositionsComp.filter(p => p.statut === 'en_attente').length;

                      return (
                        <div
                          key={comp.id}
                          className="relative bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-primary hover:shadow-md transition-all cursor-pointer group"
                          onClick={() => ouvrirDetailsCompetence(comp)}
                        >
                          {/* Badge nombre de demandes */}
                          {propositionsEnAttente > 0 && (
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg animate-pulse">
                              {propositionsEnAttente}
                            </div>
                          )}

                          {/* Bouton retirer */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              retirerCompetence(comp.id);
                            }}
                            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Retirer cette compétence"
                          >
                            <X size={18} />
                          </button>

                          <div>
                            <h4 className="font-bold text-gray-900 text-lg mb-1">{comp.nom}</h4>
                            <p className="text-sm text-gray-600 mb-3">{comp.description}</p>

                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>
                                {propositionsComp.length} {propositionsComp.length > 1 ? 'propositions' : 'proposition'}
                              </span>
                              {propositionsEnAttente > 0 && (
                                <span className="text-red-600 font-medium">
                                  {propositionsEnAttente} en attente
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
    </div>
  );
}
