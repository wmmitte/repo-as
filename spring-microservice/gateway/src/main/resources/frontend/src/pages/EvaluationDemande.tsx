import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { traitementService } from '@/services/traitementService';
import { expertiseService } from '@/services/expertiseService';
import { referentielService } from '@/services/referentielService';
import { Competence } from '@/types/expertise.types';
import { CritereEvaluationDTO } from '@/types/referentiel.types';
import Toast from '@/components/ui/Toast';
import ModalInput from '@/components/ui/ModalInput';
import ModalConfirmationManager, { ApprobationData } from '@/components/ui/ModalConfirmationManager';
import ModalSelectionRh from '@/components/reconnaissance/ModalSelectionRh';
import {
  Star,
  Award,
  Eye,
  FileText,
  GraduationCap,
  FolderOpen,
  MessageSquare,
  Briefcase,
  BookOpen,
  CheckCircle2,
  Download
} from 'lucide-react';
import {
  DemandeReconnaissanceDTO,
  EvaluationRequest,
  Recommandation,
  StatutDemande,
  TypePiece,
} from '@/types/reconnaissance.types';
import { useHeader } from '@/contexts/HeaderContext';
import { obtenirNiveauViseDepuisDomaine } from '@/utils/badgeUtils';
import { useIsManager, useIsRh } from '@/hooks/useHasRole';

// Configuration des types de pièces avec labels, icônes et couleurs
const TYPE_PIECE_CONFIG: Record<TypePiece, {
  label: string;
  icon: typeof FileText;
  bgColor: string;
  borderColor: string;
  iconColor: string;
}> = {
  [TypePiece.CERTIFICAT]: {
    label: 'Certificat professionnel',
    icon: Award,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600'
  },
  [TypePiece.DIPLOME]: {
    label: 'Diplôme ou attestation',
    icon: GraduationCap,
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    iconColor: 'text-purple-600'
  },
  [TypePiece.PROJET]: {
    label: 'Projet ou portfolio',
    icon: FolderOpen,
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    iconColor: 'text-orange-600'
  },
  [TypePiece.RECOMMANDATION]: {
    label: 'Lettre de recommandation',
    icon: MessageSquare,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600'
  },
  [TypePiece.EXPERIENCE]: {
    label: 'Preuve d\'expérience',
    icon: Briefcase,
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    iconColor: 'text-teal-600'
  },
  [TypePiece.PUBLICATION]: {
    label: 'Publication ou article',
    icon: BookOpen,
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    iconColor: 'text-indigo-600'
  },
  [TypePiece.AUTRE]: {
    label: 'Autre document',
    icon: FileText,
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    iconColor: 'text-gray-600'
  }
};

export default function EvaluationDemande() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setConfig, resetConfig } = useHeader();
  const { hasRole: isManager } = useIsManager();
  const { hasRole: isRh } = useIsRh();
  const [demande, setDemande] = useState<DemandeReconnaissanceDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // État de l'évaluation
  const [criteres, setCriteres] = useState<CritereEvaluationDTO[]>([]);
  const [notesCriteres, setNotesCriteres] = useState<Record<number, number>>({});
  const [loadingCriteres, setLoadingCriteres] = useState(false);
  const [recommandation, setRecommandation] = useState<Recommandation>(Recommandation.EN_COURS);
  const [commentaire, setCommentaire] = useState('');
  const [tempsEvaluation, setTempsEvaluation] = useState(30);

  // État pour les méthodes d'évaluation
  const [methodesEvaluation, setMethodesEvaluation] = useState<Record<number, string>>({});

  // État pour le toast
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    isOpen: false,
    message: '',
    type: 'success'
  });

  // États pour les modaux
  const [showApprouverModal, setShowApprouverModal] = useState(false);
  const [showRejetModal, setShowRejetModal] = useState(false);
  const [showComplementModal, setShowComplementModal] = useState(false);
  const [showCompetenceModal, setShowCompetenceModal] = useState(false);

  // États pour les actions Manager
  const [showModalManager, setShowModalManager] = useState(false);
  const [actionManager, setActionManager] = useState<'approuver' | 'rejeter' | 'complement'>('approuver');

  // États pour la réassignation
  const [modalReassignationOuvert, setModalReassignationOuvert] = useState(false);

  // États pour la validité du badge
  const [validitePermanente, setValiditePermanente] = useState(true);
  const [dateExpiration, setDateExpiration] = useState('');

  // État pour les informations de la compétence
  const [competenceInfo, setCompetenceInfo] = useState<Competence | null>(null);
  const [loadingCompetence, setLoadingCompetence] = useState(false);

  // État pour le code du domaine de compétence (SAVOIR, SAVOIR_FAIRE, etc.)
  const [codeDomaine, setCodeDomaine] = useState<string>('');

  // Déterminer si l'utilisateur actuel consulte en tant que Manager
  // Un Manager a une vue en lecture seule sauf quand la demande est EN_ATTENTE_VALIDATION
  const isManagerView = isManager && demande?.statut === StatutDemande.EN_ATTENTE_VALIDATION;

  // Un RH peut modifier seulement si ce n'est pas une vue Manager et que le statut permet l'édition
  const canEditAsRh = isRh && !isManagerView &&
    (demande?.statut === StatutDemande.ASSIGNEE_RH ||
     demande?.statut === StatutDemande.EN_COURS_EVALUATION ||
     demande?.statut === StatutDemande.COMPLEMENT_REQUIS);

  // Définir le titre du header
  useEffect(() => {
    setConfig({
      title: 'Demande de reconnaissance'
    });

    return () => {
      resetConfig();
    };
  }, [setConfig, resetConfig]);

  useEffect(() => {
    if (id) {
      loadDemande(parseInt(id));
      chargerMethodesEvaluation();
    }
  }, [id]);

  const chargerMethodesEvaluation = async () => {
    try {
      const methodes = await referentielService.getMethodesEvaluation();
      const methodesMap: Record<number, string> = {};
      methodes.forEach(methode => {
        methodesMap[methode.id] = methode.libelle;
      });
      setMethodesEvaluation(methodesMap);
    } catch (err) {
      console.error('Erreur lors du chargement des méthodes d\'évaluation:', err);
    }
  };

  const loadDemande = async (demandeId: number) => {
    try {
      setLoading(true);
      const data = await traitementService.getDemandeDetails(demandeId);
      setDemande(data);

      // Récupérer les notes existantes si évaluation présente
      let notesExistantes: Record<number, number> | undefined;
      if (data.evaluation?.criteres) {
        try {
          notesExistantes = JSON.parse(data.evaluation.criteres);
        } catch (parseError) {
          console.error('Erreur lors du parsing des critères:', parseError);
        }
      }

      // Vérifier que la compétence a un competenceReferenceId
      if (!data.competenceReferenceId) {
        setError('La compétence n\'est pas liée à une compétence de référence. Impossible de charger les critères d\'évaluation.');
        return;
      }

      // Charger les critères d'évaluation basés sur le domaine de compétence
      await chargerCriteresPourCompetence(data.competenceReferenceId, notesExistantes);

      // Pré-remplir si évaluation existante
      if (data.evaluation) {
        setRecommandation(data.evaluation.recommandation);
        setCommentaire(data.evaluation.commentaire || '');
        setTempsEvaluation(data.evaluation.tempsEvaluationMinutes || 30);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const chargerCriteresPourCompetence = async (
    competenceReferenceId: number,
    notesExistantes?: Record<number, number>
  ) => {
    try {
      setLoadingCriteres(true);

      // Charger la compétence de référence pour obtenir le domaine
      const response = await fetch(`/api/competences-reference/${competenceReferenceId}`);
      if (!response.ok) {
        const errorMsg = `Compétence de référence ${competenceReferenceId} non trouvée (${response.status})`;
        console.error(errorMsg);
        setError(errorMsg);
        return;
      }

      const competenceRef = await response.json();
      const domaineId = competenceRef.domaineCompetenceId;

      if (!domaineId) {
        const warnMsg = `Aucun domaine de compétence défini pour la compétence "${competenceRef.libelle}". Veuillez configurer un domaine de compétence dans la page de gestion des compétences.`;
        console.warn(warnMsg);
        setError(warnMsg);
        return;
      }

      // Récupérer le code du domaine de compétence (SAVOIR, SAVOIR_FAIRE, etc.)
      console.log('🔍 Récupération du domaine de compétence, ID:', domaineId);
      const domaineResponse = await fetch(`/api/referentiels/domaines-competence/${domaineId}`);
      console.log('📡 Réponse API domaine:', domaineResponse.status);
      if (domaineResponse.ok) {
        const domaineData = await domaineResponse.json();
        console.log('✅ Données du domaine récupérées:', domaineData);
        setCodeDomaine(domaineData.code || '');
        console.log('💾 Code domaine défini:', domaineData.code);
      } else {
        console.error('❌ Erreur lors de la récupération du domaine:', domaineResponse.status);
      }

      // Charger les critères d'évaluation du domaine
      const criteresData = await referentielService.getCriteresEvaluation(domaineId);

      if (!criteresData || criteresData.length === 0) {
        const warnMsg = `Aucun critère d'évaluation défini pour le domaine de compétence. Veuillez configurer les critères dans la page de gestion des critères.`;
        console.warn(warnMsg);
        setError(warnMsg);
        return;
      }

      setCriteres(criteresData);

      // Utiliser les notes existantes ou initialiser à 0
      const notes: Record<number, number> = {};
      criteresData.forEach((critere: CritereEvaluationDTO) => {
        notes[critere.id] = notesExistantes?.[critere.id] ?? 0;
      });
      setNotesCriteres(notes);

    } catch (err) {
      const errorMsg = `Erreur lors du chargement des critères: ${err instanceof Error ? err.message : 'Erreur inconnue'}`;
      console.error(errorMsg, err);
      setError(errorMsg);
    } finally {
      setLoadingCriteres(false);
    }
  };

  // Calculer la note globale en fonction des critères dynamiques
  const noteGlobale = Object.values(notesCriteres).reduce((sum, note) => sum + note, 0);

  const handleEvaluer = async () => {
    if (!demande) return;

    // Convertir les notes des critères en JSON pour sauvegarde
    const criteresJSON = JSON.stringify(notesCriteres);

    const evaluation: EvaluationRequest = {
      recommandation,
      commentaire,
      tempsEvaluationMinutes: tempsEvaluation,
      criteres: criteresJSON,
      noteGlobale: noteGlobale,
    };

    try {
      setSubmitting(true);
      await traitementService.evaluerDemande(demande.id, evaluation);
      // Recharger la demande pour afficher le bouton de soumission
      await loadDemande(demande.id);
      setToast({
        isOpen: true,
        message: '✅ Évaluation enregistrée avec succès',
        type: 'success'
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'évaluation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSoumettreAuManager = async () => {
    if (!demande) return;

    try {
      setSubmitting(true);

      // 1. D'abord enregistrer l'évaluation avec les dernières modifications
      const criteresJSON = JSON.stringify(notesCriteres);
      const evaluation: EvaluationRequest = {
        recommandation,
        commentaire,
        tempsEvaluationMinutes: tempsEvaluation,
        criteres: criteresJSON,
        noteGlobale: noteGlobale,
      };

      await traitementService.evaluerDemande(demande.id, evaluation);
      console.log('✅ Évaluation enregistrée avant soumission');

      // 2. Ensuite soumettre au Manager
      await traitementService.soumettreEvaluationAuManager(demande.id);

      setToast({
        isOpen: true,
        message: '✅ Évaluation enregistrée et soumise au Manager avec succès',
        type: 'success'
      });
      setTimeout(() => navigate('/demandes-reconnaissance', { state: { refresh: true } }), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la soumission');
      setSubmitting(false);
    }
  };

  const handleApprouverConfirmed = async () => {
    if (!demande) return;

    // Validation de la date d'expiration si validité limitée
    if (!validitePermanente && !dateExpiration) {
      setError('La date d\'expiration est obligatoire pour une validité limitée');
      return;
    }

    try {
      setSubmitting(true);
      
      // Convertir la date en LocalDateTime (ajouter l'heure de fin de journée)
      let dateExpirationISO: string | undefined = undefined;
      if (!validitePermanente && dateExpiration) {
        // Ajouter l'heure 23:59:59 à la date sélectionnée
        dateExpirationISO = `${dateExpiration}T23:59:59`;
      }
      
      await traitementService.approuverDemande(demande.id, {
        commentaire,
        validitePermanente,
        dateExpiration: dateExpirationISO,
      });
      setToast({
        isOpen: true,
        message: '🎉 Demande approuvée ! Badge attribué.',
        type: 'success'
      });
      setTimeout(() => navigate('/demandes-reconnaissance', { state: { refresh: true } }), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      setSubmitting(false);
    }
  };

  const handleRejetWithMotif = async (motif: string) => {
    if (!demande) return;

    try {
      setSubmitting(true);
      await traitementService.rejeterDemande(demande.id, motif);
      setToast({
        isOpen: true,
        message: '❌ Demande rejetée',
        type: 'info'
      });
      setTimeout(() => navigate('/demandes-reconnaissance', { state: { refresh: true } }), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      setSubmitting(false);
    }
  };

  const handleComplementWithMessage = async (message: string) => {
    if (!demande) return;

    try {
      setSubmitting(true);
      await traitementService.demanderComplement(demande.id, message);
      setToast({
        isOpen: true,
        message: '💬 Complément d\'information demandé',
        type: 'info'
      });
      setTimeout(() => navigate('/demandes-reconnaissance', { state: { refresh: true } }), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      setSubmitting(false);
    }
  };

  const handleVoirCompetence = async () => {
    if (!demande) return;

    try {
      setLoadingCompetence(true);
      const info = await expertiseService.getCompetenceUtilisateur(
        demande.utilisateurId,
        demande.competenceId
      );
      setCompetenceInfo(info);
      setShowCompetenceModal(true);
    } catch (err) {
      setToast({
        isOpen: true,
        message: 'Erreur lors du chargement des informations',
        type: 'error'
      });
    } finally {
      setLoadingCompetence(false);
    }
  };

  // Handlers pour les actions Manager
  const handleOpenModalManager = (action: 'approuver' | 'rejeter' | 'complement') => {
    setActionManager(action);
    setShowModalManager(true);
  };

  // Handler pour ouvrir le modal de réassignation
  const ouvrirModalReassignation = () => {
    setModalReassignationOuvert(true);
  };

  // Handler pour réassigner la demande
  const handleReassigner = async (rhId: string, commentaire?: string) => {
    if (!demande) return;

    try {
      await traitementService.assignerDemandeAuRh(demande.id, {
        rhId,
        commentaire,
      });
      setToast({
        isOpen: true,
        message: '✅ Demande réassignée avec succès',
        type: 'success'
      });
      setModalReassignationOuvert(false);
      // Recharger la demande pour afficher les nouvelles infos
      await loadDemande(demande.id);
    } catch (err) {
      setToast({
        isOpen: true,
        message: err instanceof Error ? err.message : 'Erreur lors de la réassignation',
        type: 'error'
      });
    }
  };

  const handleConfirmActionManager = async (data: ApprobationData) => {
    if (!demande) return;

    try {
      setSubmitting(true);

      if (actionManager === 'approuver') {
        // Convertir la date si fournie (format YYYY-MM-DD vers ISO avec heure)
        let dateExpirationISO: string | undefined = undefined;
        if (data.validitePermanente === false && data.dateExpiration) {
          // Ajouter l'heure 23:59:59 à la date sélectionnée
          dateExpirationISO = `${data.dateExpiration}T23:59:59`;
        }

        const request = {
          commentaire: data.commentaire,
          validitePermanente: data.validitePermanente ?? true,
          dateExpiration: dateExpirationISO
        };
        await traitementService.approuverDemandeManager(demande.id, request);
        setToast({
          isOpen: true,
          message: '✅ Demande approuvée avec succès',
          type: 'success'
        });
      } else if (actionManager === 'rejeter') {
        await traitementService.rejeterDemandeManager(demande.id, data.commentaire);
        setToast({
          isOpen: true,
          message: '❌ Demande rejetée',
          type: 'info'
        });
      } else if (actionManager === 'complement') {
        await traitementService.demanderComplementManager(demande.id, data.commentaire);
        setToast({
          isOpen: true,
          message: '💬 Complément demandé au RH',
          type: 'info'
        });
      }

      setTimeout(() => navigate('/demandes-reconnaissance?tab=a-valider', { state: { refresh: true } }), 2000);
    } catch (err) {
      setToast({
        isOpen: true,
        message: err instanceof Error ? err.message : 'Erreur lors de l\'action',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={20}
            className={star <= rating ? 'fill-blue-500 text-blue-500' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  if (!demande) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Demande non trouvée
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button
        onClick={() => navigate('/demandes-reconnaissance')}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Retour à la file
      </button>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">📂 Dossier de certification</h1>
          <div className="flex gap-2">
            <button
              onClick={handleVoirCompetence}
              disabled={loadingCompetence}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              <Eye size={18} />
              {loadingCompetence ? 'Chargement...' : 'Voir la compétence'}
            </button>
            {isManager && (demande?.statut === StatutDemande.ASSIGNEE_RH ||
                          demande?.statut === StatutDemande.EN_COURS_EVALUATION ||
                          demande?.statut === StatutDemande.EN_ATTENTE_VALIDATION) && (
              <button
                onClick={ouvrirModalReassignation}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
              >
                🔄 Réassigner
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Compétence</p>
            <p className="font-semibold text-lg">{demande.competenceNom}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Niveau visé</p>
            <p className="font-semibold text-lg">
              {(() => {
                console.log('🎯 Affichage niveau visé - codeDomaine:', codeDomaine);
                const niveau = codeDomaine ? obtenirNiveauViseDepuisDomaine(codeDomaine) : 'Non spécifié';
                console.log('🎯 Niveau affiché:', niveau);
                return niveau;
              })()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Statut</p>
            <p className="font-semibold">{demande.statut.replace(/_/g, ' ')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date soumission</p>
            <p className="font-semibold">
              {new Date(demande.dateCreation).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        {demande.commentaireExpert && (
          <div className="bg-gray-50 rounded p-4 mb-6">
            <h3 className="font-semibold mb-2">📝 Justification de l'expert</h3>
            <p className="text-gray-700">{demande.commentaireExpert}</p>
          </div>
        )}

        {demande.commentaireManagerAssignation && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <h3 className="font-semibold mb-2">👔 Instructions du Manager</h3>
            <p className="text-gray-700">{demande.commentaireManagerAssignation}</p>
          </div>
        )}

        {demande.pieces && demande.pieces.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <FileText className="text-gray-600" size={20} />
              Pièces justificatives ({demande.pieces.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {demande.pieces.map((piece) => {
                const config = TYPE_PIECE_CONFIG[piece.typePiece as TypePiece] || TYPE_PIECE_CONFIG[TypePiece.AUTRE];
                const IconComponent = config.icon;
                const tailleKo = (piece.tailleOctets / 1024).toFixed(1);

                return (
                  <div
                    key={piece.id}
                    className={`relative flex flex-col border-2 ${config.borderColor} ${config.bgColor} rounded-lg p-4 hover:shadow-md transition-shadow`}
                  >
                    {/* Badge de vérification */}
                    {piece.estVerifie && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="text-green-500" size={20} />
                      </div>
                    )}

                    {/* En-tête avec icône et type */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-2 ${config.bgColor} rounded-lg border ${config.borderColor}`}>
                        <IconComponent className={config.iconColor} size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 mb-1">
                          {config.label}
                        </h4>
                        {piece.description ? (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {piece.description}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500 italic">
                            {piece.nomOriginal}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Métadonnées */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3 mt-auto">
                      <span className="flex items-center gap-1">
                        <FileText size={12} />
                        {piece.typeMime.split('/')[1]?.toUpperCase() || 'FILE'}
                      </span>
                      <span>•</span>
                      <span>{tailleKo} Ko</span>
                    </div>

                    {/* Bouton de téléchargement */}
                    <a
                      href={`/api/files/download/${piece.urlFichier}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center gap-2 px-4 py-2 ${config.iconColor.replace('text-', 'bg-').replace('600', '500')} text-white rounded-lg hover:opacity-90 transition-opacity font-medium`}
                    >
                      <Download size={16} />
                      Télécharger
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Formulaire d'évaluation */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-6">✍️ Évaluation</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {loadingCriteres ? (
            <div className="text-center py-4">
              <span className="loading loading-spinner loading-md"></span>
              <p className="text-sm text-gray-500 mt-2">Chargement des critères d'évaluation...</p>
            </div>
          ) : criteres.length > 0 ? (
            /* Critères dynamiques basés sur le domaine de compétence */
            <>
              {criteres.map((critere) => {
                const noteMax = Math.round(100 / criteres.length);
                const methodesAssociees = critere.methodeIds?.map(id => methodesEvaluation[id]).filter(Boolean) || [];

                return (
                  <div key={critere.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <label className="block font-medium mb-2">
                      {critere.libelle} ({notesCriteres[critere.id] || 0}/{noteMax})
                    </label>
                    {critere.description && (
                      <p className="text-sm text-gray-600 mb-2">{critere.description}</p>
                    )}

                    {/* Méthodes d'évaluation associées */}
                    {methodesAssociees.length > 0 && (
                      <div className="mb-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                        <p className="text-xs font-semibold text-blue-800 mb-1 flex items-center gap-1">
                          <span>🔬</span>
                          <span>Méthodes d'évaluation à appliquer:</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {methodesAssociees.map((methode, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full border border-blue-200"
                            >
                              {methode}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <input
                      type="range"
                      min="0"
                      max={noteMax}
                      value={notesCriteres[critere.id] || 0}
                      onChange={(e) => setNotesCriteres({
                        ...notesCriteres,
                        [critere.id]: parseInt(e.target.value)
                      })}
                      disabled={!canEditAsRh}
                      className="w-full"
                    />
                  </div>
                );
              })}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun critère d'évaluation défini pour cette compétence.</p>
              <p className="text-sm text-gray-400 mt-2">Veuillez configurer les critères d'évaluation pour le domaine de compétence.</p>
            </div>
          )}

          {/* Note globale */}
          {criteres.length > 0 && (
            <div className="bg-blue-50 rounded p-4">
              <p className="text-lg font-bold">
                Note globale : <span className="text-blue-600">{noteGlobale}/100</span> 🎯
              </p>
            </div>
          )}

          {/* Recommandation */}
          <div>
            <label className="block font-medium mb-2">Recommandation</label>
            <div className="space-y-2">
              {[
                { value: Recommandation.APPROUVER, label: '✅ Approuver', color: 'green' },
                { value: Recommandation.REJETER, label: '❌ Rejeter', color: 'red' },
                { value: Recommandation.DEMANDER_COMPLEMENT, label: '💬 Demander complément', color: 'orange' },
              ].map(({ value, label, color }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="recommandation"
                    value={value}
                    checked={recommandation === value}
                    onChange={() => setRecommandation(value)}
                    disabled={!canEditAsRh}
                    className="w-4 h-4"
                  />
                  <span className={`text-${color}-700`}>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Commentaire */}
          <div>
            <label className="block font-medium mb-2">💬 Commentaire {isManagerView && '(RH)'}</label>
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              rows={4}
              className="w-full border rounded p-2"
              placeholder="Votre évaluation détaillée..."
              disabled={!canEditAsRh}
              readOnly={!canEditAsRh}
            />
          </div>

          {/* Temps d'évaluation */}
          <div>
            <label className="block font-medium mb-2">
              ⏱ Temps d'évaluation : {tempsEvaluation} minutes
            </label>
            <input
              type="number"
              value={tempsEvaluation}
              onChange={(e) => setTempsEvaluation(parseInt(e.target.value) || 0)}
              className="border rounded px-3 py-2"
              min="1"
              disabled={!canEditAsRh}
              readOnly={!canEditAsRh}
            />
          </div>
        </div>

        {/* Boutons d'action RH - affichage uniquement pour les RH en mode édition */}
        {canEditAsRh && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleEvaluer}
              disabled={submitting}
              className="flex-1 bg-blue-500 text-white py-3 rounded font-medium hover:bg-blue-600 disabled:opacity-50"
            >
              💾 Enregistrer l'évaluation
            </button>
          </div>
        )}
      </div>

      {/* Bouton de soumission au Manager (RH uniquement) */}
      {canEditAsRh && demande.evaluation &&
       (demande.statut === StatutDemande.ASSIGNEE_RH || demande.statut === StatutDemande.EN_COURS_EVALUATION) && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-lg p-6 mb-6 border-2 border-purple-200">
          <h3 className="font-bold mb-2 text-lg text-purple-800">📤 Soumettre l'évaluation au Manager</h3>
          <p className="text-sm text-gray-700 mb-4">
            Votre évaluation sera automatiquement enregistrée avant d'être soumise au Manager pour validation finale.
          </p>
          <button
            onClick={handleSoumettreAuManager}
            disabled={submitting}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-md"
          >
            {submitting ? 'Enregistrement et soumission...' : '💾 Enregistrer et soumettre au Manager'}
          </button>
        </div>
      )}

      {/* Actions Manager - Validation de l'évaluation du RH */}
      {isManagerView && demande.evaluation && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-lg p-6 mb-6 border-2 border-blue-200">
          <h3 className="font-bold mb-2 text-lg text-blue-800">👔 Décision du Manager</h3>
          <p className="text-sm text-gray-700 mb-4">
            L'évaluation du RH est complète. Veuillez prendre une décision finale sur cette demande de reconnaissance.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleOpenModalManager('approuver')}
              disabled={submitting}
              className="flex-1 bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 transition-colors shadow-md"
            >
              ✅ Approuver
            </button>
            <button
              onClick={() => handleOpenModalManager('rejeter')}
              disabled={submitting}
              className="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 transition-colors shadow-md"
            >
              ❌ Rejeter
            </button>
            <button
              onClick={() => handleOpenModalManager('complement')}
              disabled={submitting}
              className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-md"
            >
              💬 Demander complément
            </button>
          </div>
        </div>
      )}

      {/* Actions finales */}
      {!isManagerView && demande.evaluation && demande.statut === StatutDemande.EN_COURS_TRAITEMENT && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-bold mb-4">Décision finale</h3>
          <div className="flex gap-3">
            <button
              onClick={() => setShowApprouverModal(true)}
              disabled={submitting}
              className="flex-1 bg-green-500 text-white py-3 rounded font-medium hover:bg-green-600 disabled:opacity-50"
            >
              ✅ Approuver définitivement
            </button>
            <button
              onClick={() => setShowRejetModal(true)}
              disabled={submitting}
              className="flex-1 bg-red-500 text-white py-3 rounded font-medium hover:bg-red-600 disabled:opacity-50"
            >
              ❌ Rejeter
            </button>
            <button
              onClick={() => setShowComplementModal(true)}
              disabled={submitting}
              className="flex-1 bg-orange-500 text-white py-3 rounded font-medium hover:bg-orange-600 disabled:opacity-50"
            >
              💬 Demander complément
            </button>
          </div>
        </div>
      )}

      {/* Modal d'approbation avec validité du badge */}
      {showApprouverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-green-600">✅ Approuver la demande</h3>
            
            <p className="text-gray-600 mb-6">
              Un badge sera automatiquement attribué à l'expert. Définissez la validité du badge ci-dessous.
            </p>

            {/* Type de validité */}
            <div className="mb-6">
              <label className="block font-medium mb-3">Type de validité</label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="validite"
                    checked={validitePermanente}
                    onChange={() => {
                      setValiditePermanente(true);
                      setDateExpiration('');
                    }}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">✓ Validité permanente</div>
                    <div className="text-sm text-gray-500">Le badge n'expirera jamais</div>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="validite"
                    checked={!validitePermanente}
                    onChange={() => setValiditePermanente(false)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">⏰ Validité limitée</div>
                    <div className="text-sm text-gray-500">Le badge expirera à une date définie</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Date d'expiration (si validité limitée) */}
            {!validitePermanente && (
              <div className="mb-6">
                <label className="block font-medium mb-2">Date d'expiration *</label>
                <input
                  type="date"
                  value={dateExpiration}
                  onChange={(e) => setDateExpiration(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Le badge sera automatiquement désactivé à cette date
                </p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
                {error}
              </div>
            )}

            {/* Commentaire */}
            <div className="mb-6">
              <label className="block font-medium mb-2">Commentaire (optionnel)</label>
              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                placeholder="Ajoutez un commentaire pour l'expert..."
              />
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowApprouverModal(false);
                  setError(null);
                }}
                disabled={submitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleApprouverConfirmed}
                disabled={submitting || (!validitePermanente && !dateExpiration)}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 font-medium"
              >
                {submitting ? 'Approbation...' : 'Approuver définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast de notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        duration={4000}
      />

      {/* Modal de confirmation Manager */}
      <ModalConfirmationManager
        isOpen={showModalManager}
        onClose={() => setShowModalManager(false)}
        onConfirm={handleConfirmActionManager}
        actionType={actionManager}
        commentaireRh={demande?.evaluation?.commentaire || ''}
      />

      {/* Modal de rejet */}
      <ModalInput
        isOpen={showRejetModal}
        onClose={() => setShowRejetModal(false)}
        onConfirm={(motif) => {
          setShowRejetModal(false);
          handleRejetWithMotif(motif);
        }}
        title="Rejeter la demande"
        label="Motif du rejet"
        placeholder="Expliquez les raisons du rejet de la demande..."
        confirmText="Rejeter"
        maxLength={500}
      />

      {/* Modal de demande de complément */}
      <ModalInput
        isOpen={showComplementModal}
        onClose={() => setShowComplementModal(false)}
        onConfirm={(message) => {
          setShowComplementModal(false);
          handleComplementWithMessage(message);
        }}
        title="Demander un complément d'information"
        label="Message pour l'expert"
        placeholder="Précisez les informations ou documents supplémentaires requis..."
        confirmText="Envoyer"
        maxLength={500}
      />

      {/* Modal d'informations de la compétence */}
      {showCompetenceModal && competenceInfo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowCompetenceModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              {/* En-tête avec titre et badge favorite */}
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-3">
                  {competenceInfo.nom}
                </h2>
                {competenceInfo.estFavorite && (
                  <span className="inline-flex items-center gap-1 px-4 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    <Star size={16} className="fill-yellow-500 text-yellow-500" />
                    Favorite
                  </span>
                )}
              </div>

              {/* Description */}
              {competenceInfo.description && (
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {competenceInfo.description}
                </p>
              )}

              {/* Grille d'indicateurs */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                {/* Expérience */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Expérience</p>
                  <p className="text-3xl font-bold text-teal-700">
                    {competenceInfo.anneesExperience || 0} ans
                  </p>
                </div>

                {/* THM */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">THM</p>
                  <p className="text-3xl font-bold text-green-600">
                    {competenceInfo.thm ? `${competenceInfo.thm} FCFA/h` : 'Non renseigné'}
                  </p>
                </div>

                {/* Projets */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Projets</p>
                  <p className="text-3xl font-bold text-gray-700">
                    {competenceInfo.nombreProjets || 0}
                  </p>
                </div>

                {/* Maîtrise */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Maîtrise</p>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-blue-600">
                      {competenceInfo.niveauMaitrise || 0}/5
                    </span>
                    {renderStars(competenceInfo.niveauMaitrise || 0)}
                  </div>
                </div>
              </div>

              {/* Section Certification */}
              {competenceInfo.certifications && (
                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Award size={20} className="text-blue-600" />
                    <h3 className="font-bold text-lg">Certification:</h3>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-gray-800">{competenceInfo.certifications}</p>
                  </div>
                </div>
              )}

              {/* Bouton de fermeture */}
              <button
                onClick={() => setShowCompetenceModal(false)}
                className="mt-6 w-full py-3 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de réassignation */}
      <ModalSelectionRh
        isOpen={modalReassignationOuvert}
        onClose={() => setModalReassignationOuvert(false)}
        onConfirm={handleReassigner}
      />
    </div>
  );
}
