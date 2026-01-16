import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { traitementService } from '@/services/traitementService';
import { expertiseService } from '@/services/expertiseService';
import { referentielService } from '@/services/referentielService';
import { Competence } from '@/types/expertise.types';
import { CritereEvaluationDTO } from '@/types/referentiel.types';
import { useToast } from '@/contexts/ToastContext';
import ModalInput from '@/components/ui/ModalInput';
import ModalConfirmationManager, { ApprobationData } from '@/components/ui/ModalConfirmationManager';
import ModalSelectionRh from '@/components/reconnaissance/ModalSelectionRh';
import Loader from '@/components/ui/Loader';
import {
  Star,
  Award,
  FileText,
  GraduationCap,
  FolderOpen,
  MessageSquare,
  Briefcase,
  BookOpen,
  CheckCircle2,
  Download,
  ArrowLeft,
  Clock,
  UserCheck,
  CheckCircle,
  AlertCircle,
  Paperclip,
  RefreshCw,
  Send,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import {
  DemandeReconnaissanceDTO,
  EvaluationRequest,
  Recommandation,
  StatutDemande,
  TypePiece,
} from '@/types/reconnaissance.types';
import { useHeaderConfig } from '@/hooks/useHeaderConfig';
import { obtenirNiveauViseDepuisDomaine } from '@/utils/badgeUtils';
import { useIsManager, useIsRh } from '@/hooks/useHasRole';

// Types MIME prévisualisables dans le navigateur
const TYPES_MIME_PREVISUALISABLES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'text/plain',
  'text/html',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
];

const estPrevisualisable = (typeMime: string): boolean => {
  return TYPES_MIME_PREVISUALISABLES.includes(typeMime.toLowerCase());
};

// Configuration des types de pièces
const TYPE_PIECE_CONFIG: Record<TypePiece, {
  label: string;
  icon: typeof FileText;
  color: string;
}> = {
  [TypePiece.CERTIFICAT]: { label: 'Certificat', icon: Award, color: 'text-blue-600 bg-blue-50' },
  [TypePiece.DIPLOME]: { label: 'Diplôme', icon: GraduationCap, color: 'text-purple-600 bg-purple-50' },
  [TypePiece.PROJET]: { label: 'Projet', icon: FolderOpen, color: 'text-orange-600 bg-orange-50' },
  [TypePiece.RECOMMANDATION]: { label: 'Recommandation', icon: MessageSquare, color: 'text-green-600 bg-green-50' },
  [TypePiece.EXPERIENCE]: { label: 'Expérience', icon: Briefcase, color: 'text-teal-600 bg-teal-50' },
  [TypePiece.PUBLICATION]: { label: 'Publication', icon: BookOpen, color: 'text-indigo-600 bg-indigo-50' },
  [TypePiece.AUTRE]: { label: 'Autre', icon: FileText, color: 'text-gray-600 bg-gray-50' }
};

// Configuration des statuts pour la timeline
const STATUT_TIMELINE = [
  { statut: StatutDemande.EN_ATTENTE, label: 'Soumise', icon: Clock },
  { statut: StatutDemande.ASSIGNEE_RH, label: 'Assignée', icon: UserCheck },
  { statut: StatutDemande.EN_COURS_EVALUATION, label: 'En évaluation', icon: FileText },
  { statut: StatutDemande.EN_ATTENTE_VALIDATION, label: 'À valider', icon: CheckCircle },
  { statut: StatutDemande.APPROUVEE, label: 'Approuvée', icon: CheckCircle2 },
];

export default function EvaluationDemande() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole: isManager } = useIsManager();
  const { hasRole: isRh } = useIsRh();
  const toast = useToast();

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
  const [methodesEvaluation, setMethodesEvaluation] = useState<Record<number, string>>({});
  const [codeDomaine, setCodeDomaine] = useState<string>('');

  // Modaux
  const [showApprouverModal, setShowApprouverModal] = useState(false);
  const [showRejetModal, setShowRejetModal] = useState(false);
  const [showComplementModal, setShowComplementModal] = useState(false);
  const [showCompetenceModal, setShowCompetenceModal] = useState(false);
  const [showModalManager, setShowModalManager] = useState(false);
  const [actionManager, setActionManager] = useState<'approuver' | 'rejeter' | 'complement'>('approuver');
  const [modalReassignationOuvert, setModalReassignationOuvert] = useState(false);
  const [validitePermanente, setValiditePermanente] = useState(true);
  const [dateExpiration, setDateExpiration] = useState('');
  const [competenceInfo, setCompetenceInfo] = useState<Competence | null>(null);
  const [loadingCompetence, setLoadingCompetence] = useState(false);

  // Permissions
  const isManagerView = isManager && demande?.statut === StatutDemande.EN_ATTENTE_VALIDATION;
  const canEditAsRh = isRh && !isManagerView &&
    (demande?.statut === StatutDemande.ASSIGNEE_RH ||
     demande?.statut === StatutDemande.EN_COURS_EVALUATION ||
     demande?.statut === StatutDemande.COMPLEMENT_REQUIS);

  // Header config
  useHeaderConfig({ title: 'Évaluation de demande' });

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
      methodes.forEach(m => { methodesMap[m.id] = m.libelle; });
      setMethodesEvaluation(methodesMap);
    } catch (err) {
      console.error('Erreur chargement méthodes:', err);
    }
  };

  const loadDemande = async (demandeId: number) => {
    try {
      setLoading(true);
      const data = await traitementService.getDemandeDetails(demandeId);
      setDemande(data);

      let notesExistantes: Record<number, number> | undefined;
      if (data.evaluation?.criteres) {
        try { notesExistantes = JSON.parse(data.evaluation.criteres); } catch {}
      }

      if (!data.competenceReferenceId) {
        setError('La compétence n\'est pas liée à une compétence de référence.');
        return;
      }

      await chargerCriteresPourCompetence(data.competenceReferenceId, notesExistantes);

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

  const chargerCriteresPourCompetence = async (competenceReferenceId: number, notesExistantes?: Record<number, number>) => {
    try {
      setLoadingCriteres(true);
      const response = await fetch(`/api/competences-reference/${competenceReferenceId}`);
      if (!response.ok) { setError('Compétence de référence non trouvée'); return; }

      const competenceRef = await response.json();
      const domaineId = competenceRef.domaineCompetenceId;
      if (!domaineId) { setError('Aucun domaine de compétence défini'); return; }

      const domaineResponse = await fetch(`/api/referentiels/domaines-competence/${domaineId}`);
      if (domaineResponse.ok) {
        const domaineData = await domaineResponse.json();
        setCodeDomaine(domaineData.code || '');
      }

      const criteresData = await referentielService.getCriteresEvaluation(domaineId);
      if (!criteresData?.length) { setError('Aucun critère d\'évaluation défini'); return; }

      setCriteres(criteresData);
      const notes: Record<number, number> = {};
      criteresData.forEach((c: CritereEvaluationDTO) => { notes[c.id] = notesExistantes?.[c.id] ?? 0; });
      setNotesCriteres(notes);
    } catch (err) {
      setError('Erreur lors du chargement des critères');
    } finally {
      setLoadingCriteres(false);
    }
  };

  const noteGlobale = Object.values(notesCriteres).reduce((sum, note) => sum + note, 0);

  // Handlers
  const handleEvaluer = async () => {
    if (!demande) return;
    const evaluation: EvaluationRequest = {
      recommandation, commentaire, tempsEvaluationMinutes: tempsEvaluation,
      criteres: JSON.stringify(notesCriteres), noteGlobale,
    };
    try {
      setSubmitting(true);
      await traitementService.evaluerDemande(demande.id, evaluation);
      await loadDemande(demande.id);
      toast.succes('Évaluation enregistrée');
    } catch (err) {
      toast.erreur(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSoumettreAuManager = async () => {
    if (!demande) return;
    try {
      setSubmitting(true);
      const evaluation: EvaluationRequest = {
        recommandation, commentaire, tempsEvaluationMinutes: tempsEvaluation,
        criteres: JSON.stringify(notesCriteres), noteGlobale,
      };
      await traitementService.evaluerDemande(demande.id, evaluation);
      await traitementService.soumettreEvaluationAuManager(demande.id);
      toast.succes('Soumise au Manager');
      setTimeout(() => navigate('/demandes-reconnaissance', { state: { refresh: true } }), 2000);
    } catch (err) {
      toast.erreur(err);
      setSubmitting(false);
    }
  };

  const handleApprouverConfirmed = async () => {
    if (!demande) return;
    if (!validitePermanente && !dateExpiration) {
      toast.avertissement('Date d\'expiration requise'); return;
    }
    try {
      setSubmitting(true);
      const dateExpirationISO = !validitePermanente && dateExpiration ? `${dateExpiration}T23:59:59` : undefined;
      await traitementService.approuverDemande(demande.id, { commentaire, validitePermanente, dateExpiration: dateExpirationISO });
      toast.succes('Demande approuvée ! Badge attribué.');
      setTimeout(() => navigate('/demandes-reconnaissance', { state: { refresh: true } }), 2000);
    } catch (err) {
      toast.erreur(err);
      setSubmitting(false);
    }
  };

  const handleRejetWithMotif = async (motif: string) => {
    if (!demande) return;
    try {
      setSubmitting(true);
      await traitementService.rejeterDemande(demande.id, motif);
      toast.info('Demande rejetée');
      setTimeout(() => navigate('/demandes-reconnaissance', { state: { refresh: true } }), 2000);
    } catch (err) {
      toast.erreur(err);
      setSubmitting(false);
    }
  };

  const handleComplementWithMessage = async (message: string) => {
    if (!demande) return;
    try {
      setSubmitting(true);
      await traitementService.demanderComplement(demande.id, message);
      toast.info('Complément demandé');
      setTimeout(() => navigate('/demandes-reconnaissance', { state: { refresh: true } }), 2000);
    } catch (err) {
      toast.erreur(err);
      setSubmitting(false);
    }
  };

  const handleVoirCompetence = async () => {
    if (!demande) return;
    try {
      setLoadingCompetence(true);
      const info = await expertiseService.getCompetenceUtilisateur(demande.utilisateurId, demande.competenceId);
      setCompetenceInfo(info);
      setShowCompetenceModal(true);
    } catch {
      toast.erreur('Erreur lors du chargement de la compétence');
    } finally {
      setLoadingCompetence(false);
    }
  };

  const handleOpenModalManager = (action: 'approuver' | 'rejeter' | 'complement') => {
    setActionManager(action);
    setShowModalManager(true);
  };

  const handleConfirmActionManager = async (data: ApprobationData) => {
    if (!demande) return;
    try {
      setSubmitting(true);
      if (actionManager === 'approuver') {
        const dateExpirationISO = data.validitePermanente === false && data.dateExpiration ? `${data.dateExpiration}T23:59:59` : undefined;
        await traitementService.approuverDemandeManager(demande.id, {
          commentaire: data.commentaire, validitePermanente: data.validitePermanente ?? true, dateExpiration: dateExpirationISO
        });
        toast.succes('Demande approuvée');
      } else if (actionManager === 'rejeter') {
        await traitementService.rejeterDemandeManager(demande.id, data.commentaire);
        toast.info('Demande rejetée');
      } else {
        await traitementService.demanderComplementManager(demande.id, data.commentaire);
        toast.info('Complément demandé');
      }
      setTimeout(() => navigate('/demandes-reconnaissance?tab=a-valider', { state: { refresh: true } }), 2000);
    } catch (err) {
      toast.erreur(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReassigner = async (rhId: string, commentaire?: string) => {
    if (!demande) return;
    try {
      await traitementService.assignerDemandeAuRh(demande.id, { rhId, commentaire });
      toast.succes('Demande réassignée');
      setModalReassignationOuvert(false);
      await loadDemande(demande.id);
    } catch (err) {
      toast.erreur(err);
    }
  };

  // Calcul de l'étape actuelle pour la timeline
  const getEtapeActuelle = () => {
    if (!demande) return 0;
    const idx = STATUT_TIMELINE.findIndex(s => s.statut === demande.statut);
    return idx >= 0 ? idx : STATUT_TIMELINE.length - 1;
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} size={16} className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!demande) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-800">Demande non trouvée</h2>
          </div>
        </div>
      </div>
    );
  }

  const etapeActuelle = getEtapeActuelle();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header sticky avec infos clés */}
      <div className="sticky top-16 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/demandes-reconnaissance')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <button
                  onClick={handleVoirCompetence}
                  disabled={loadingCompetence}
                  className="text-xl font-bold text-gray-900 hover:text-primary transition-colors text-left"
                >
                  {demande.competenceNom}
                </button>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-sm text-gray-500">
                    Niveau visé : <span className="font-medium text-gray-700">
                      {codeDomaine ? obtenirNiveauViseDepuisDomaine(codeDomaine) : '-'}
                    </span>
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm text-gray-500">
                    {new Date(demande.dateCreation).toLocaleDateString('fr-FR')}
                  </span>
                  {demande.traitantNom && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span className="text-sm text-gray-500">
                        Traité par : <span className="font-medium text-primary">{demande.traitantNom}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isManager && (demande.statut === StatutDemande.ASSIGNEE_RH ||
                            demande.statut === StatutDemande.EN_COURS_EVALUATION ||
                            demande.statut === StatutDemande.EN_ATTENTE_VALIDATION) && (
                <button
                  onClick={() => setModalReassignationOuvert(true)}
                  className="flex items-center gap-2 px-4 py-2 text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors text-sm font-medium"
                >
                  <RefreshCw size={16} />
                  Réassigner
                </button>
              )}
            </div>
          </div>

          {/* Timeline du workflow */}
          <div className="mt-4 flex items-center justify-between">
            {STATUT_TIMELINE.map((step, idx) => {
              const StepIcon = step.icon;
              const isCompleted = idx < etapeActuelle;
              const isCurrent = idx === etapeActuelle;
              const isRejected = demande.statut === StatutDemande.REJETEE;

              return (
                <div key={step.statut} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isRejected && isCurrent ? 'bg-red-100 text-red-600' :
                      isCompleted ? 'bg-emerald-100 text-emerald-600' :
                      isCurrent ? 'bg-primary/10 text-primary ring-2 ring-primary' :
                      'bg-slate-100 text-slate-400'
                    }`}>
                      {isRejected && isCurrent ? <XCircle size={20} /> : <StepIcon size={20} />}
                    </div>
                    <span className={`text-xs mt-1 font-medium ${
                      isRejected && isCurrent ? 'text-red-600' :
                      isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {isRejected && isCurrent ? 'Rejetée' : step.label}
                    </span>
                  </div>
                  {idx < STATUT_TIMELINE.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto p-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche - Dossier */}
          <div className="lg:col-span-2 space-y-6">
            {/* Justification expert */}
            {demande.commentaireExpert && (
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MessageSquare size={18} className="text-gray-400" />
                  Motif / Justification Demande :
                </h3>
                <p className="text-gray-700 text-justify">{demande.commentaireExpert}</p>
              </div>
            )}

            {/* Instructions Manager */}
            {demande.commentaireManagerAssignation && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <UserCheck size={18} className="text-blue-600" />
                  Instructions du Manager
                </h3>
                <p className="text-blue-800 text-justify">{demande.commentaireManagerAssignation}</p>
              </div>
            )}

            {/* Pièces justificatives */}
            {demande.pieces && demande.pieces.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Paperclip size={18} className="text-gray-400" />
                  Pièces justificatives ({demande.pieces.length})
                </h3>
                <div className="space-y-1.5">
                  {demande.pieces.map((piece) => {
                    const config = TYPE_PIECE_CONFIG[piece.typePiece as TypePiece] || TYPE_PIECE_CONFIG[TypePiece.AUTRE];
                    const IconComponent = config.icon;
                    const tailleKo = (piece.tailleOctets / 1024).toFixed(0);
                    const canPreview = estPrevisualisable(piece.typeMime);
                    const previewUrl = canPreview ? `/api/files/view/${piece.urlFichier}` : `/api/files/download/${piece.urlFichier}`;

                    return (
                      <div key={piece.id} className="flex items-center gap-2.5 py-2 px-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className={`p-1.5 rounded ${config.color}`}>
                          <IconComponent size={16} />
                        </div>
                        <a
                          href={previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 min-w-0 hover:text-primary transition-colors"
                        >
                          <span className="text-sm font-medium text-gray-900 truncate block hover:text-primary">
                            {piece.description || piece.nomOriginal}
                          </span>
                        </a>
                        <span className="text-xs text-gray-400">{tailleKo} Ko</span>
                        {piece.estVerifie && (
                          <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={14} />
                        )}
                        <a
                          href={`/api/files/download/${piece.urlFichier}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-gray-400 hover:text-primary transition-colors"
                          title="Télécharger"
                        >
                          <Download size={14} />
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section Évaluation */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-gray-400" />
                Évaluation
              </h3>

              {loadingCriteres ? (
                <div className="text-center py-8">
                  <Loader />
                </div>
              ) : criteres.length > 0 ? (
                <div className="space-y-4">
                  {criteres.map((critere) => {
                    const noteMax = Math.round(100 / criteres.length);
                    const methodesAssociees = critere.methodeIds?.map(id => methodesEvaluation[id]).filter(Boolean) || [];
                    const note = notesCriteres[critere.id] || 0;
                    const pourcentage = (note / noteMax) * 100;

                    return (
                      <div key={critere.id} className="p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{critere.libelle}</span>
                          <span className="text-sm font-semibold text-primary">{note}/{noteMax}</span>
                        </div>
                        {critere.description && (
                          <p className="text-sm text-gray-600 mb-3">{critere.description}</p>
                        )}
                        {methodesAssociees.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {methodesAssociees.map((m, i) => (
                              <span key={i} className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">{m}</span>
                            ))}
                          </div>
                        )}
                        <div className="relative">
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pourcentage}%` }} />
                          </div>
                          <input
                            type="range"
                            min="0"
                            max={noteMax}
                            value={note}
                            onChange={(e) => setNotesCriteres({ ...notesCriteres, [critere.id]: parseInt(e.target.value) })}
                            disabled={!canEditAsRh}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>
                    );
                  })}

                  {/* Note globale */}
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">Note globale</span>
                      <span className="text-2xl font-bold text-primary">{noteGlobale}/100</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <HelpCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Aucun critère d'évaluation défini</p>
                </div>
              )}
            </div>
          </div>

          {/* Colonne droite - Actions (sticky) */}
          <div className="lg:sticky lg:top-36 lg:self-start space-y-4">
            {/* Recommandation */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Recommandation</h3>
              <div className="space-y-2">
                {[
                  { value: Recommandation.APPROUVER, label: 'Approuver', icon: CheckCircle, color: 'text-emerald-600' },
                  { value: Recommandation.REJETER, label: 'Rejeter', icon: XCircle, color: 'text-red-600' },
                  { value: Recommandation.DEMANDER_COMPLEMENT, label: 'Demander complément', icon: HelpCircle, color: 'text-orange-600' },
                ].map(({ value, label, icon: Icon, color }) => (
                  <label key={value} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    recommandation === value ? 'bg-slate-100' : 'hover:bg-slate-50'
                  } ${!canEditAsRh ? 'opacity-60 cursor-not-allowed' : ''}`}>
                    <input
                      type="radio"
                      name="recommandation"
                      value={value}
                      checked={recommandation === value}
                      onChange={() => setRecommandation(value)}
                      disabled={!canEditAsRh}
                      className="sr-only"
                    />
                    <Icon size={20} className={color} />
                    <span className="font-medium text-gray-900">{label}</span>
                    {recommandation === value && <CheckCircle size={16} className="ml-auto text-primary" />}
                  </label>
                ))}
              </div>
            </div>

            {/* Commentaire */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Commentaire</h3>
              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                placeholder="Votre évaluation détaillée..."
                disabled={!canEditAsRh}
              />
            </div>

            {/* Temps d'évaluation - masqué pour le moment */}
            {false && (
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock size={18} className="text-gray-400" />
                  Temps d'évaluation
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={tempsEvaluation}
                    onChange={(e) => setTempsEvaluation(parseInt(e.target.value) || 0)}
                    className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-center"
                    min="1"
                    disabled={!canEditAsRh}
                  />
                  <span className="text-gray-600">minutes</span>
                </div>
              </div>
            )}

            {/* Actions RH */}
            {canEditAsRh && (
              <div className="space-y-3">
                <button
                  onClick={handleEvaluer}
                  disabled={submitting}
                  className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  Enregistrer l'évaluation
                </button>
                {demande.evaluation && (demande.statut === StatutDemande.ASSIGNEE_RH || demande.statut === StatutDemande.EN_COURS_EVALUATION) && (
                  <button
                    onClick={handleSoumettreAuManager}
                    disabled={submitting}
                    className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send size={18} />
                    Soumettre au Manager
                  </button>
                )}
              </div>
            )}

            {/* Actions Manager */}
            {isManagerView && demande.evaluation && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Décision finale</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleOpenModalManager('approuver')}
                    disabled={submitting}
                    className="w-full py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    Approuver
                  </button>
                  <button
                    onClick={() => handleOpenModalManager('rejeter')}
                    disabled={submitting}
                    className="w-full py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    Rejeter
                  </button>
                  <button
                    onClick={() => handleOpenModalManager('complement')}
                    disabled={submitting}
                    className="w-full py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    Demander complément
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modaux */}
      <ModalConfirmationManager isOpen={showModalManager} onClose={() => setShowModalManager(false)} onConfirm={handleConfirmActionManager} actionType={actionManager} commentaireRh={demande?.evaluation?.commentaire || ''} />

      <ModalInput
        isOpen={showRejetModal}
        onClose={() => setShowRejetModal(false)}
        onConfirm={(motif) => { setShowRejetModal(false); handleRejetWithMotif(motif); }}
        title="Rejeter la demande"
        description="Action définitive"
        label="Motif du rejet"
        placeholder="Détaillez les raisons..."
        confirmText="Rejeter"
        maxLength={500}
        variante="danger"
        raisonsPredefinis={[
          { label: "Niveau insuffisant", value: "Le niveau de maîtrise démontré ne correspond pas aux critères requis." },
          { label: "Preuves manquantes", value: "Les pièces justificatives fournies sont insuffisantes ou non conformes." },
          { label: "Expérience limitée", value: "L'expérience professionnelle ne justifie pas le niveau demandé." },
          { label: "Hors périmètre", value: "La compétence ne correspond pas au référentiel de certification." }
        ]}
        conseil="Soyez précis et constructif"
      />

      <ModalInput
        isOpen={showComplementModal}
        onClose={() => setShowComplementModal(false)}
        onConfirm={(msg) => { setShowComplementModal(false); handleComplementWithMessage(msg); }}
        title="Demander un complément"
        description="Expert notifié"
        label="Informations requises"
        placeholder="Précisez ce qui manque..."
        confirmText="Envoyer"
        maxLength={500}
        variante="info"
        raisonsPredefinis={[
          { label: "Certificat", value: "Merci de fournir un certificat ou attestation de formation." },
          { label: "Références", value: "Veuillez ajouter des références de projets réalisés." },
          { label: "Portfolio", value: "Un portfolio ou des exemples de travaux seraient appréciés." },
          { label: "Durée", value: "Précisez la durée d'expérience dans ce domaine." }
        ]}
        conseil="L'expert pourra compléter sa demande"
      />

      <ModalSelectionRh isOpen={modalReassignationOuvert} onClose={() => setModalReassignationOuvert(false)} onConfirm={handleReassigner} />

      {/* Modal compétence */}
      {showCompetenceModal && competenceInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowCompetenceModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            {/* Header compact */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Award size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{competenceInfo.nom}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    {renderStars(competenceInfo.niveauMaitrise || 0)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowCompetenceModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XCircle size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              {competenceInfo.description && (
                <p className="text-sm text-gray-600 mb-4">{competenceInfo.description}</p>
              )}

              {/* Stats en ligne compactes */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex-1 text-center py-2 px-3 bg-slate-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-900">{competenceInfo.anneesExperience || 0}</p>
                  <p className="text-xs text-gray-500">ans exp.</p>
                </div>
                <div className="flex-1 text-center py-2 px-3 bg-slate-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-900">{competenceInfo.nombreProjets || 0}</p>
                  <p className="text-xs text-gray-500">projets</p>
                </div>
                <div className="flex-1 text-center py-2 px-3 bg-slate-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-900">{competenceInfo.thm || '-'}</p>
                  <p className="text-xs text-gray-500">FCFA/h</p>
                </div>
              </div>

              {competenceInfo.certifications && (
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg text-sm">
                  <GraduationCap size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-blue-700">{competenceInfo.certifications}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal approbation */}
      {showApprouverModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-emerald-600 mb-4">Approuver la demande</h3>
            <p className="text-gray-600 mb-6">Un badge sera automatiquement attribué à l'expert.</p>
            <div className="space-y-4 mb-6">
              <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${validitePermanente ? 'border-primary bg-primary/5' : 'border-slate-200'}`}>
                <input type="radio" checked={validitePermanente} onChange={() => { setValiditePermanente(true); setDateExpiration(''); }} className="mr-3" />
                <div>
                  <div className="font-medium">Validité permanente</div>
                  <div className="text-sm text-gray-500">Le badge n'expirera jamais</div>
                </div>
              </label>
              <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${!validitePermanente ? 'border-primary bg-primary/5' : 'border-slate-200'}`}>
                <input type="radio" checked={!validitePermanente} onChange={() => setValiditePermanente(false)} className="mr-3" />
                <div>
                  <div className="font-medium">Validité limitée</div>
                  <div className="text-sm text-gray-500">Le badge expirera à une date définie</div>
                </div>
              </label>
            </div>
            {!validitePermanente && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date d'expiration</label>
                <input type="date" value={dateExpiration} onChange={(e) => setDateExpiration(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowApprouverModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg font-medium hover:bg-slate-50">Annuler</button>
              <button onClick={handleApprouverConfirmed} disabled={submitting || (!validitePermanente && !dateExpiration)} className="flex-1 py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 disabled:opacity-50">Approuver</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
