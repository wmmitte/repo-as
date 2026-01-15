import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Briefcase, Edit3, ClipboardList, Award, Upload } from 'lucide-react';
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
import Toast from '@/components/ui/Toast';
import { obtenirNiveauAvecSignification } from '@/utils/badgeUtils';

export default function ExpertisePage() {
  const navigate = useNavigate();
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
  const [error, setError] = useState<string | null>(null);
  const [showAnnulerModal, setShowAnnulerModal] = useState(false);
  const [demandeToAnnuler, setDemandeToAnnuler] = useState<number | null>(null);
  const [showComplementModal, setShowComplementModal] = useState(false);
  const [demandeComplement, setDemandeComplement] = useState<DemandeReconnaissanceDTO | null>(null);
  const [commentaireComplement, setCommentaireComplement] = useState('');
  const [fichiers, setFichiers] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    isOpen: false,
    message: '',
    type: 'success'
  });

  // États pour les badges
  const [badges, setBadges] = useState<BadgeCompetenceDTO[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(false);

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
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
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
      setToast({
        isOpen: true,
        message: '✓ Demande annulée avec succès',
        type: 'success'
      });
    } catch (err) {
      setShowAnnulerModal(false);
      setToast({
        isOpen: true,
        message: err instanceof Error ? err.message : 'Erreur lors de l\'annulation',
        type: 'error'
      });
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

      setToast({
        isOpen: true,
        message: '✅ Complément fourni ! Votre demande a été resoumise.',
        type: 'success'
      });

      setShowComplementModal(false);
      setDemandeComplement(null);
      setCommentaireComplement('');
      setFichiers([]);
      chargerDemandes();
    } catch (err) {
      setToast({
        isOpen: true,
        message: err instanceof Error ? err.message : 'Erreur lors de la soumission',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const chargerBadges = async () => {
    try {
      setLoadingBadges(true);
      const data = await reconnaissanceService.getMesBadges(true);
      setBadges(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoadingBadges(false);
    }
  };

  const handleToggleVisibilite = async (badgeId: number, currentState: boolean) => {
    try {
      await reconnaissanceService.toggleVisibiliteBadge(badgeId);
      await chargerBadges();
      
      setToast({
        isOpen: true,
        message: currentState 
          ? '🔒 Badge masqué sur votre profil public'
          : '👁️ Badge visible sur votre profil public',
        type: 'success'
      });
    } catch (err) {
      setToast({
        isOpen: true,
        message: err instanceof Error ? err.message : 'Erreur',
        type: 'error'
      });
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

  const NIVEAU_BADGES: Record<NiveauCertification, string> = {
    [NiveauCertification.BRONZE]: '🥉 Bronze',
    [NiveauCertification.ARGENT]: '🥈 Argent',
    [NiveauCertification.OR]: '🥇 Or',
    [NiveauCertification.PLATINE]: '💎 Platine',
  };

  // Obtenir les propositions pour une compétence
  const obtenirPropositionsPourCompetence = (compId: string) => {
    return propositions.filter(p => p.competenceId === compId);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Onglets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {/* Onglet Éditer et publier */}
          <button
            onClick={() => setOngletActif('editer')}
            className={`flex-1 px-6 py-4 font-medium transition-all relative ${
              ongletActif === 'editer'
                ? 'text-primary bg-primary/5'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Edit3 size={20} />
              Éditer et publier votre expertise
            </span>
            {ongletActif === 'editer' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>

          {/* Onglet Mes demandes */}
          <button
            onClick={() => setOngletActif('demandes')}
            className={`flex-1 px-6 py-4 font-medium transition-all relative ${
              ongletActif === 'demandes'
                ? 'text-primary bg-primary/5'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <ClipboardList size={20} />
              Mes demandes
              {demandes.length > 0 && (
                <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                  {demandes.length}
                </span>
              )}
            </span>
            {ongletActif === 'demandes' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>

          {/* Onglet Mes badges */}
          <button
            onClick={() => setOngletActif('badges')}
            className={`flex-1 px-6 py-4 font-medium transition-all relative ${
              ongletActif === 'badges'
                ? 'text-primary bg-primary/5'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Award size={20} />
              Mes badges
              {badges.length > 0 && (
                <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                  {badges.length}
                </span>
              )}
            </span>
            {ongletActif === 'badges' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>

          {/* Onglet Compétences */}
          <button
            onClick={() => setOngletActif('competences')}
            className={`flex-1 px-6 py-4 font-medium transition-all relative ${
              ongletActif === 'competences'
                ? 'text-primary bg-primary/5'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Briefcase size={20} />
              Compétences
              {competencesUtilisateur.length > 0 && (
                <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                  {competencesUtilisateur.length}
                </span>
              )}
            </span>
            {ongletActif === 'competences' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary"></div>
            )}
          </button>
        </div>

        <div className="p-8">
          {/* Onglet Éditer et publier */}
          {ongletActif === 'editer' && (
            <EditerExpertise />
          )}

          {/* Onglet Mes demandes */}
          {ongletActif === 'demandes' && (
            loadingDemandes ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-xl">Chargement...</div>
              </div>
            ) : (
              <div>
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}

                {demandes.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-500 mb-4">Vous n'avez pas encore soumis de demande de reconnaissance</p>
                    <button
                      onClick={() => setOngletActif('editer')}
                      className="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                    >
                      Gérer mes compétences
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {demandes.map((demande) => (
                      <div
                        key={demande.id}
                        className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2">{demande.competenceNom}</h3>
                            <div className="flex gap-2 flex-wrap">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUT_COLORS[getStatutSynthetiqueExpert(demande.statut)]}`}>
                                {STATUT_LABELS[getStatutSynthetiqueExpert(demande.statut)]}
                              </span>
                              {demande.niveauVise && (
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                  {NIVEAU_BADGES[demande.niveauVise]}
                                </span>
                              )}
                            </div>
                          </div>
                          {demande.badge && (
                            <div className="ml-4 text-4xl">
                              {demande.badge.niveauCertification === NiveauCertification.BRONZE && '🥉'}
                              {demande.badge.niveauCertification === NiveauCertification.ARGENT && '🥈'}
                              {demande.badge.niveauCertification === NiveauCertification.OR && '🥇'}
                              {demande.badge.niveauCertification === NiveauCertification.PLATINE && '💎'}
                            </div>
                          )}
                        </div>

                        <div className="text-sm text-gray-600 space-y-1 mb-4">
                          <p>📅 Soumise le {formatDate(demande.dateCreation)}</p>
                          <p>📎 {demande.nombrePieces} pièce(s) justificative(s)</p>
                          {demande.dateTraitement && (
                            <p>✅ Traitée le {formatDate(demande.dateTraitement)}</p>
                          )}
                        </div>

                        {demande.commentaireTraitant && (
                          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                            <p className="text-sm font-semibold mb-1">💬 Observations de l'Administration :</p>
                            <p className="text-sm">{demande.commentaireTraitant}</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedDemande(demande)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Voir détails
                          </button>

                          {demande.statut === StatutDemande.COMPLEMENT_REQUIS && (
                            <button
                              onClick={() => handleFournirComplement(demande)}
                              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-medium"
                            >
                              📋 Fournir le complément
                            </button>
                          )}

                          {/* Bouton Annuler seulement pour EN_ATTENTE et COMPLEMENT_REQUIS */}
                          {(demande.statut === StatutDemande.EN_ATTENTE ||
                            demande.statut === StatutDemande.COMPLEMENT_REQUIS) && (
                            <button
                              onClick={() => handleAnnulerClick(demande.id)}
                              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              Annuler
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Modal de détails */}
                {selectedDemande && (
                  <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    onClick={() => setSelectedDemande(null)}
                  >
                    <div
                      className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h2 className="text-2xl font-bold mb-4">{selectedDemande.competenceNom}</h2>

                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">📝 Justification :</h3>
                          <p className="text-gray-700">{selectedDemande.commentaireExpert || 'Aucune justification fournie'}</p>
                        </div>

                        {selectedDemande.pieces && selectedDemande.pieces.length > 0 && (
                          <div>
                            <h3 className="font-semibold mb-2">📎 Pièces justificatives :</h3>
                            <ul className="space-y-2">
                              {selectedDemande.pieces.map((piece) => (
                                <li key={piece.id} className="flex items-center gap-2 text-sm">
                                  <span>{piece.estVerifie ? '✅' : '📄'}</span>
                                  <span>{piece.nom}</span>
                                  {piece.description && <span className="text-gray-500">- {piece.description}</span>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {selectedDemande.evaluation && (
                          <div>
                            <h3 className="font-semibold mb-2">⭐ Évaluation :</h3>
                            <div className="bg-gray-50 rounded p-4 space-y-2">
                              <p>Note globale : {selectedDemande.evaluation.noteGlobale}/100</p>
                              {/* Le commentaire de l'évaluation RH n'est pas affiché à l'expert */}
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedDemande(null)}
                        className="mt-6 w-full py-2 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Fermer
                      </button>
                    </div>
                  </div>
                )}

                {/* Modal de complément */}
                {showComplementModal && demandeComplement && (
                  <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    onClick={() => !submitting && setShowComplementModal(false)}
                  >
                    <div
                      className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h2 className="text-2xl font-bold mb-4 text-green-600">📋 Fournir le complément</h2>
                      <p className="text-gray-600 mb-6">
                        Compétence : <span className="font-semibold">{demandeComplement.competenceNom}</span>
                      </p>

                      {/* Demande du traitant */}
                      {demandeComplement.commentaireTraitant && (
                        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
                          <p className="text-sm font-semibold mb-2">💬 Ce que le Manager demande :</p>
                          <p className="text-sm text-gray-700">{demandeComplement.commentaireTraitant}</p>
                        </div>
                      )}

                      {/* Commentaire complémentaire */}
                      <div className="mb-6">
                        <label className="block font-medium mb-2">
                          Commentaire complémentaire <span className="text-gray-500 text-sm">(optionnel)</span>
                        </label>
                        <textarea
                          value={commentaireComplement}
                          onChange={(e) => setCommentaireComplement(e.target.value)}
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          rows={4}
                          placeholder="Expliquez les compléments que vous apportez..."
                          disabled={submitting}
                        />
                      </div>

                      {/* Upload de pièces */}
                      <div className="mb-6">
                        <label className="block font-medium mb-2">
                          Ajouter de nouvelles pièces justificatives <span className="text-gray-500 text-sm">(optionnel)</span>
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <input
                            type="file"
                            multiple
                            onChange={handleFichierChange}
                            className="hidden"
                            id="fichier-complement"
                            disabled={submitting}
                          />
                          <label
                            htmlFor="fichier-complement"
                            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            <Upload size={20} />
                            Sélectionner des fichiers
                          </label>
                          {fichiers.length > 0 && (
                            <div className="mt-4 text-left">
                              <p className="font-medium mb-2">Fichiers sélectionnés :</p>
                              <ul className="space-y-1">
                                {fichiers.map((f, idx) => (
                                  <li key={idx} className="text-sm text-gray-700">
                                    📎 {f.name} ({(f.size / 1024).toFixed(1)} KB)
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Boutons d'action */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowComplementModal(false)}
                          disabled={submitting}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={handleSoumettreComplement}
                          disabled={submitting}
                          className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 font-medium"
                        >
                          {submitting ? 'Soumission...' : 'Resoumettre la demande'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal d'annulation */}
                <ModalConfirm
                  isOpen={showAnnulerModal}
                  onClose={() => {
                    setShowAnnulerModal(false);
                    setDemandeToAnnuler(null);
                  }}
                  onConfirm={handleAnnulerConfirm}
                  title="Annuler la demande"
                  message="Êtes-vous sûr de vouloir annuler cette demande de certification ? Cette action est irréversible."
                  confirmText="Oui, annuler"
                  cancelText="Non, garder"
                  type="error"
                />

                {/* Toast de notification */}
                <Toast
                  message={toast.message}
                  type={toast.type}
                  isOpen={toast.isOpen}
                  onClose={() => setToast({ ...toast, isOpen: false })}
                  duration={3000}
                />
              </div>
            )
          )}

          {/* Onglet Mes badges */}
          {ongletActif === 'badges' && (
            loadingBadges ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-xl">Chargement...</div>
              </div>
            ) : (
              <div>
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}

                {badges.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="text-6xl mb-4">🎓</div>
                    <p className="text-gray-500 mb-4">Vous n'avez pas encore de badges</p>
                    <p className="text-sm text-gray-400 mb-6">
                      Soumettez des demandes de reconnaissance pour obtenir vos premiers badges
                    </p>
                    <button
                      onClick={() => setOngletActif('demandes')}
                      className="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                    >
                      Voir mes demandes
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {badges.map((badge) => (
                        <div
                          key={badge.id}
                          className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                        >
                          <div className={`h-32 bg-gradient-to-br ${BADGE_COLORS_BADGES[badge.niveauCertification]} flex items-center justify-center`}>
                            <div className="text-7xl">{BADGE_ICONS_BADGES[badge.niveauCertification]}</div>
                          </div>

                          <div className="p-6">
                            <h3 className="text-xl font-bold mb-2">{badge.competenceNom}</h3>
                            <div className="space-y-2 text-sm text-gray-600 mb-4">
                              <p className="flex items-center gap-2">
                                <span className="font-semibold">Niveau :</span>
                                <span>{obtenirNiveauAvecSignification(badge.niveauCertification)}</span>
                              </p>
                              <p className="flex items-center gap-2">
                                <span className="font-semibold">Obtenu le :</span>
                                <span>{formatDate(badge.dateObtention)}</span>
                              </p>
                              <p className="flex items-center gap-2">
                                {badge.validitePermanente ? (
                                  <span className="text-green-600">✓ Validité permanente</span>
                                ) : (
                                  <span className="text-orange-600">⏰ Expire le {badge.dateExpiration && formatDate(badge.dateExpiration)}</span>
                                )}
                              </p>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => handleToggleVisibilite(badge.id, badge.estPublic)}
                                  className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                                    badge.estPublic
                                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {badge.estPublic ? '👁️ Public' : '🔒 Privé'}
                                </button>
                                <span className="text-xs text-gray-500 text-center">
                                  {badge.estPublic ? 'Visible sur profil' : 'Masqué'}
                                </span>
                              </div>

                              <span className={`text-xs px-2 py-1 rounded ${badge.estValide ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {badge.estValide ? 'Valide' : 'Expiré'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Info box */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">ℹ️</span>
                        <div className="text-sm text-blue-800">
                          <p className="font-semibold mb-1">À propos de la visibilité des badges</p>
                          <p>Les badges <strong>Public</strong> 👁️ sont affichés sur votre profil public et visibles par tous.</p>
                          <p>Les badges <strong>Privé</strong> 🔒 sont masqués et visibles uniquement par vous.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
      </div>
    </div>
  );
}
