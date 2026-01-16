import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { traitementService } from '@/services/traitementService';
import { useHeaderConfig } from '@/hooks/useHeaderConfig';
import { useIsManager, useIsRh } from '@/hooks/useHasRole';
import ModalSelectionRh from '@/components/reconnaissance/ModalSelectionRh';
import Loader from '@/components/ui/Loader';
import {
  Clock,
  UserCheck,
  CheckCircle,
  FileText,
  Calendar,
  Paperclip,
  User,
  ChevronRight,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import {
  DemandeReconnaissanceDTO,
  StatutDemande,
  NiveauCertification,
} from '@/types/reconnaissance.types';

const STATUT_CONFIG: Record<StatutDemande, { bg: string; text: string; icon: typeof Clock }> = {
  [StatutDemande.EN_ATTENTE]: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock },
  [StatutDemande.ASSIGNEE_RH]: { bg: 'bg-blue-50', text: 'text-blue-700', icon: UserCheck },
  [StatutDemande.EN_COURS_EVALUATION]: { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: FileText },
  [StatutDemande.EN_ATTENTE_VALIDATION]: { bg: 'bg-purple-50', text: 'text-purple-700', icon: CheckCircle },
  [StatutDemande.EN_COURS_TRAITEMENT]: { bg: 'bg-blue-50', text: 'text-blue-700', icon: Clock },
  [StatutDemande.COMPLEMENT_REQUIS]: { bg: 'bg-orange-50', text: 'text-orange-700', icon: AlertCircle },
  [StatutDemande.APPROUVEE]: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle },
  [StatutDemande.REJETEE]: { bg: 'bg-red-50', text: 'text-red-700', icon: AlertCircle },
  [StatutDemande.ANNULEE]: { bg: 'bg-gray-50', text: 'text-gray-700', icon: AlertCircle },
};

const NIVEAU_BADGES: Record<NiveauCertification, { emoji: string; label: string; color: string }> = {
  [NiveauCertification.BRONZE]: { emoji: '🥉', label: 'Bronze', color: 'bg-amber-100 text-amber-800' },
  [NiveauCertification.ARGENT]: { emoji: '🥈', label: 'Argent', color: 'bg-slate-100 text-slate-800' },
  [NiveauCertification.OR]: { emoji: '🥇', label: 'Or', color: 'bg-yellow-100 text-yellow-800' },
  [NiveauCertification.PLATINE]: { emoji: '💎', label: 'Platine', color: 'bg-cyan-100 text-cyan-800' },
};

export default function DemandeReconnaissance() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { hasRole: isManager, loading: loadingManager } = useIsManager();
  const { hasRole: isRh, loading: loadingRh } = useIsRh();

  const [demandes, setDemandes] = useState<DemandeReconnaissanceDTO[]>([]);
  const [demandesAssignees, setDemandesAssignees] = useState<DemandeReconnaissanceDTO[]>([]);
  const [demandesAValider, setDemandesAValider] = useState<DemandeReconnaissanceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('');
  const [modalSelectionRhOuvert, setModalSelectionRhOuvert] = useState(false);
  const [demandeSelectionne, setDemandeSelectionne] = useState<number | null>(null);
  const [donneesInitialesChargees, setDonneesInitialesChargees] = useState(false);

  const rolesLoaded = !loadingManager && !loadingRh;

  // Construire les tabs selon le rôle
  const tabs = useMemo(() => {
    if (!rolesLoaded) return [];

    const tabsList = [];
    if (isManager) {
      tabsList.push({ id: 'disponibles', label: `Nouvelles demandes (${demandes.length})` });
      tabsList.push({ id: 'assignees', label: `En cours de traitement (${demandesAssignees.length})` });
      tabsList.push({ id: 'a-valider', label: `Demandes à valider (${demandesAValider.length})` });
    }
    if (isRh) {
      tabsList.push({ id: 'demandes', label: `Demandes à évaluer (${demandesAssignees.length})` });
    }
    return tabsList;
  }, [rolesLoaded, isManager, isRh, demandes.length, demandesAssignees.length, demandesAValider.length]);

  // Configurer le Header avec les onglets
  useHeaderConfig({
    title: 'Demandes de reconnaissance',
    tabs,
    activeTab,
    onTabChange: setActiveTab,
  });

  // Charger les données ET définir l'onglet dès que les rôles sont chargés
  useEffect(() => {
    if (rolesLoaded && !donneesInitialesChargees) {
      // Définir l'onglet par défaut
      const tabParam = searchParams.get('tab');
      if (tabParam && ['disponibles', 'assignees', 'a-valider', 'demandes'].includes(tabParam)) {
        setActiveTab(tabParam);
      } else {
        setActiveTab(isManager ? 'disponibles' : 'demandes');
      }
      // Charger immédiatement les données
      chargerDonneesInitiales();
    }
  }, [rolesLoaded, isManager, donneesInitialesChargees, searchParams]);

  const chargerDonneesInitiales = async () => {
    try {
      setLoading(true);
      if (isManager) {
        const [disponiblesData, assigneesData, aValiderData] = await Promise.all([
          traitementService.getDemandesATraiter(StatutDemande.EN_ATTENTE),
          traitementService.getDemandesAssigneesParManager(),
          traitementService.getDemandesEnAttenteValidation(),
        ]);
        setDemandes(disponiblesData);
        setDemandesAssignees(assigneesData);
        setDemandesAValider(aValiderData);
      } else {
        const data = await traitementService.getDemandesAssignees();
        setDemandesAssignees(data);
      }
      setError(null);
      setDonneesInitialesChargees(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  // Détecter le retour depuis une page d'évaluation
  useEffect(() => {
    const state = location.state as { refresh?: boolean } | null;
    if (state?.refresh && activeTab && isManager) {
      rafraichirTousLesOngletsManager();
      navigate(location.pathname + location.search, { replace: true, state: {} });
    }
  }, [location.state]);

  const rafraichirTousLesOngletsManager = async () => {
    try {
      setLoading(true);
      const [disponiblesData, assigneesData, aValiderData] = await Promise.all([
        traitementService.getDemandesATraiter(StatutDemande.EN_ATTENTE),
        traitementService.getDemandesAssigneesParManager(),
        traitementService.getDemandesEnAttenteValidation(),
      ]);
      setDemandes(disponiblesData);
      setDemandesAssignees(assigneesData);
      setDemandesAValider(aValiderData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du rafraîchissement');
    } finally {
      setLoading(false);
    }
  };

  const rafraichirApresAction = async () => {
    if (isManager) {
      await rafraichirTousLesOngletsManager();
    } else {
      await chargerDonneesInitiales();
    }
  };

  const ouvrirModalAssignation = (demandeId: number) => {
    setDemandeSelectionne(demandeId);
    setModalSelectionRhOuvert(true);
  };

  const handleAssignerAuRh = async (rhId: string, commentaire?: string) => {
    if (!demandeSelectionne) return;
    try {
      await traitementService.assignerDemandeAuRh(demandeSelectionne, { rhId, commentaire });
      await rafraichirApresAction();
      setModalSelectionRhOuvert(false);
      setDemandeSelectionne(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de l\'assignation');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const demandesAffichees =
    activeTab === 'disponibles' ? demandes :
    activeTab === 'assignees' ? demandesAssignees :
    activeTab === 'a-valider' ? demandesAValider :
    activeTab === 'demandes' ? demandesAssignees :
    [];

  // Loader pendant le chargement des rôles
  if (!rolesLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Vérifier les permissions
  if (!isManager && !isRh) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-800 mb-2">Accès refusé</h2>
            <p className="text-red-600">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
            <p className="text-sm text-red-500 mt-2">Rôles requis : MANAGER ou RH</p>
          </div>
        </div>
      </div>
    );
  }

  const obtenirTitreOnglet = () => {
    switch (activeTab) {
      case 'disponibles': return 'Nouvelles demandes';
      case 'assignees': return 'Demandes en cours de traitement';
      case 'a-valider': return 'Demandes en attente de validation';
      case 'demandes': return 'Demandes à évaluer';
      default: return 'Demandes';
    }
  };

  const obtenirDescriptionOnglet = () => {
    switch (activeTab) {
      case 'disponibles': return 'Assignez ces demandes à un RH pour évaluation';
      case 'assignees': return 'Suivez l\'avancement des évaluations en cours';
      case 'a-valider': return 'Prenez une décision finale sur ces demandes évaluées';
      case 'demandes': return 'Évaluez les compétences des experts';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        {/* En-tête de section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{obtenirTitreOnglet()}</h2>
            <p className="text-gray-600 mt-1">{obtenirDescriptionOnglet()}</p>
          </div>
          <button
            onClick={rafraichirApresAction}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-colors border border-slate-200"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Contenu */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader />
          </div>
        ) : demandesAffichees.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune demande</h3>
            <p className="text-gray-500">
              {activeTab === 'disponibles'
                ? 'Aucune demande en attente d\'assignation'
                : activeTab === 'a-valider'
                ? 'Aucune demande en attente de validation'
                : 'Vous n\'avez pas de demandes assignées'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {demandesAffichees.map((demande) => {
              const statutConfig = STATUT_CONFIG[demande.statut];
              const StatutIcon = statutConfig.icon;

              return (
                <div
                  key={demande.id}
                  className="bg-white border border-slate-200 rounded-xl hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => navigate(`/demandes-reconnaissance/evaluer/${demande.id}`)}
                >
                  <div className="p-5">
                    {/* Header de la carte */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                          {demande.competenceNom}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Badge statut */}
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statutConfig.bg} ${statutConfig.text}`}>
                            <StatutIcon size={14} />
                            {demande.statut.replace(/_/g, ' ')}
                          </span>
                          {/* Badge niveau */}
                          {demande.niveauVise && (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium ${NIVEAU_BADGES[demande.niveauVise].color}`}>
                              {NIVEAU_BADGES[demande.niveauVise].emoji} {NIVEAU_BADGES[demande.niveauVise].label}
                            </span>
                          )}
                          {/* Badge priorité */}
                          {demande.priorite > 0 && (
                            <span className="inline-flex items-center px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                              PRIORITÉ {demande.priorite}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Flèche */}
                      <ChevronRight className="text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" size={24} />
                    </div>

                    {/* Métadonnées */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={16} className="text-gray-400" />
                        {formatDate(demande.dateCreation)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Paperclip size={16} className="text-gray-400" />
                        {demande.nombrePieces} pièce{demande.nombrePieces > 1 ? 's' : ''}
                      </span>
                      {demande.traitantId && (
                        <span className="inline-flex items-center gap-1.5">
                          |<User size={16} className="text-gray-400" />
                           Chez {demande.traitantNom || 'RH assigné'}
                        </span>
                      )}
                    </div>

                    {/* Commentaire expert */}
                    {demande.commentaireExpert && (
                      <div className="bg-slate-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          <span className="font-semibold text-gray-900">Motif / Justification Demande: </span>
                          {demande.commentaireExpert}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/demandes-reconnaissance/evaluer/${demande.id}`);
                        }}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                      >
                        {activeTab === 'demandes' ? 'Évaluer' : 'Voir détails'}
                      </button>

                      {activeTab === 'disponibles' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            ouvrirModalAssignation(demande.id);
                          }}
                          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
                        >
                          Assigner à un RH
                        </button>
                      )}

                      {(activeTab === 'assignees' || activeTab === 'a-valider') && isManager && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            ouvrirModalAssignation(demande.id);
                          }}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                        >
                          Réassigner
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de sélection RH */}
      <ModalSelectionRh
        isOpen={modalSelectionRhOuvert}
        onClose={() => {
          setModalSelectionRhOuvert(false);
          setDemandeSelectionne(null);
        }}
        onConfirm={handleAssignerAuRh}
      />
    </div>
  );
}
