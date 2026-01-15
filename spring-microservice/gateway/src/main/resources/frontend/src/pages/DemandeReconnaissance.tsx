import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { traitementService } from '@/services/traitementService';
import { useHeaderConfig } from '@/hooks/useHeaderConfig';
import { useIsManager, useIsRh } from '@/hooks/useHasRole';
import ModalSelectionRh from '@/components/reconnaissance/ModalSelectionRh';
import {
  DemandeReconnaissanceDTO,
  StatutDemande,
  NiveauCertification,
} from '@/types/reconnaissance.types';

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

const NIVEAU_BADGES: Record<NiveauCertification, string> = {
  [NiveauCertification.BRONZE]: '🥉',
  [NiveauCertification.ARGENT]: '🥈',
  [NiveauCertification.OR]: '🥇',
  [NiveauCertification.PLATINE]: '💎',
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
  const [activeTab, setActiveTab] = useState<'disponibles' | 'assignees' | 'a-valider' | 'demandes' | null>(null);
  const [modalSelectionRhOuvert, setModalSelectionRhOuvert] = useState(false);
  const [demandeSelectionne, setDemandeSelectionne] = useState<number | null>(null);
  const [donneesInitialesChargees, setDonneesInitialesChargees] = useState(false);

  // Les rôles sont-ils chargés ?
  const rolesLoaded = !loadingManager && !loadingRh;

  // Configurer le Header
  useHeaderConfig({
    title: 'Demande de reconnaissance'
  });

  // Définir l'onglet par défaut une fois les rôles chargés
  useEffect(() => {
    if (rolesLoaded && activeTab === null) {
      // Vérifier si un onglet est spécifié dans l'URL
      const tabParam = searchParams.get('tab') as 'disponibles' | 'assignees' | 'a-valider' | 'demandes' | null;

      let defaultTab: 'disponibles' | 'assignees' | 'a-valider' | 'demandes';

      // Si un onglet valide est spécifié dans l'URL, l'utiliser
      if (tabParam && ['disponibles', 'assignees', 'a-valider', 'demandes'].includes(tabParam)) {
        defaultTab = tabParam;
      } else {
        // Sinon, utiliser l'onglet par défaut selon le rôle
        defaultTab = isManager ? 'disponibles' : 'demandes';
      }

      setActiveTab(defaultTab);
    }
  }, [rolesLoaded, isManager, activeTab, searchParams]);

  // Charger les demandes INITIALES (tous les onglets) une seule fois au démarrage
  useEffect(() => {
    if (activeTab !== null && !donneesInitialesChargees) {
      chargerDonneesInitiales();
    }
  }, [activeTab, donneesInitialesChargees]);

  /**
   * Charge toutes les données au démarrage
   * Pour Manager: charge les 3 onglets (disponibles, assignées, à valider)
   * Pour RH: charge uniquement ses demandes
   */
  const chargerDonneesInitiales = async () => {
    try {
      setLoading(true);

      if (isManager) {
        // Manager : charger tous les onglets en parallèle
        const [disponiblesData, assigneesData, aValiderData] = await Promise.all([
          traitementService.getDemandesATraiter(StatutDemande.EN_ATTENTE),
          traitementService.getDemandesAssigneesParManager(),
          traitementService.getDemandesEnAttenteValidation(),
        ]);

        setDemandes(disponiblesData);
        setDemandesAssignees(assigneesData);
        setDemandesAValider(aValiderData);
      } else {
        // RH : charger uniquement ses demandes
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

  // Détecter le retour depuis une page d'évaluation et rafraîchir automatiquement
  useEffect(() => {
    const state = location.state as { refresh?: boolean } | null;
    if (state?.refresh && activeTab !== null && isManager) {
      console.log('[DEMANDE RECONNAISSANCE] Rafraîchissement automatique détecté');
      rafraichirTousLesOngletsManager();
      // Nettoyer le state pour éviter des rafraîchissements multiples
      navigate(location.pathname + location.search, { replace: true, state: {} });
    }
  }, [location.state]);

  /**
   * Rafraîchit TOUS les onglets pour un Manager
   * Utilisé après une action (assignation, validation, etc.) pour synchroniser tous les compteurs
   */
  const rafraichirTousLesOngletsManager = async () => {
    try {
      setLoading(true);

      // Charger tous les onglets en parallèle
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

  /**
   * Rafraîchit les données après une action
   * - Si Manager : recharge tous les onglets
   * - Si RH : recharge ses demandes
   */
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
      await traitementService.assignerDemandeAuRh(demandeSelectionne, {
        rhId,
        commentaire,
      });
      // Rafraîchir tous les onglets pour synchroniser les compteurs
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
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const demandesAffichees =
    activeTab === 'disponibles' ? demandes :
    activeTab === 'assignees' ? demandesAssignees :
    activeTab === 'a-valider' ? demandesAValider :
    activeTab === 'demandes' ? demandesAssignees :
    [];

  // Afficher un loader pendant le chargement des rôles
  if (!rolesLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="text-xl">Vérification des permissions...</div>
        </div>
      </div>
    );
  }

  // Vérifier si l'utilisateur a au moins un des rôles requis
  if (!isManager && !isRh) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Accès refusé</p>
          <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          <p className="text-sm mt-2">Rôles requis : MANAGER ou RH</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b overflow-x-auto">
        {isManager && (
          <>
            <button
              onClick={() => setActiveTab('disponibles')}
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'disponibles'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              📋 Disponibles ({demandes.length})
            </button>
            <button
              onClick={() => setActiveTab('assignees')}
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'assignees'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              👥 Assignées ({demandesAssignees.length})
            </button>
            <button
              onClick={() => setActiveTab('a-valider')}
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'a-valider'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              ✅ À valider ({demandesAValider.length})
            </button>
          </>
        )}
        {isRh && (
          <button
            onClick={() => setActiveTab('demandes')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'demandes'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            👤 Mes demandes ({demandesAssignees.length})
          </button>
        )}
      </div>

      {/* Afficher un message si activeTab est null (ne devrait pas arriver) */}
      {activeTab === null && (
        <div className="flex justify-center items-center py-12">
          <div className="text-xl">Chargement...</div>
        </div>
      )}

      {/* Afficher le contenu uniquement si activeTab est défini */}
      {activeTab !== null && (
        <>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-xl">Chargement...</div>
        </div>
      ) : demandesAffichees.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">
            {activeTab === 'disponibles'
              ? 'Aucune demande disponible pour le moment'
              : 'Vous n\'avez pas de demandes assignées'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {demandesAffichees.map((demande) => (
            <div
              key={demande.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    {demande.competenceNom}
                  </h3>
                  <div className="flex gap-2 flex-wrap items-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUT_COLORS[demande.statut]}`}>
                      {demande.statut.replace(/_/g, ' ')}
                    </span>
                    {demande.niveauVise && (
                      <span className="text-2xl" title={demande.niveauVise}>
                        {NIVEAU_BADGES[demande.niveauVise]}
                      </span>
                    )}
                    {demande.priorite > 0 && (
                      <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded">
                        PRIORITÉ {demande.priorite}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-1 mb-4">
                <p>📅 Soumise le {formatDate(demande.dateCreation)}</p>
                <p>📎 {demande.nombrePieces} pièce(s) justificative(s)</p>
                {demande.traitantId && (
                  <p>👤 Assigné à : {demande.traitantNom || demande.traitantId}</p>
                )}
              </div>

              {demande.commentaireExpert && (
                <div className="bg-gray-50 border-l-4 border-gray-300 p-3 mb-4">
                  <p className="text-sm font-semibold mb-1">💬 Justification :</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{demande.commentaireExpert}</p>
                </div>
              )}

              <div className="flex gap-2">
                {activeTab === 'disponibles' ? (
                  <>
                    <button
                      onClick={() => navigate(`/demandes-reconnaissance/evaluer/${demande.id}`)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      🔍 Voir détails
                    </button>
                    <button
                      onClick={() => ouvrirModalAssignation(demande.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      👥 Assigner à un RH
                    </button>
                  </>
                ) : activeTab === 'assignees' ? (
                  <>
                    <button
                      onClick={() => navigate(`/demandes-reconnaissance/evaluer/${demande.id}`)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      🔍 Voir détails
                    </button>
                    {isManager && (
                      <button
                        onClick={() => ouvrirModalAssignation(demande.id)}
                        className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                      >
                        🔄 Réassigner
                      </button>
                    )}
                  </>
                ) : activeTab === 'a-valider' ? (
                  <>
                    <button
                      onClick={() => navigate(`/demandes-reconnaissance/evaluer/${demande.id}`)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      🔍 Voir détails
                    </button>
                    {isManager && (
                      <button
                        onClick={() => ouvrirModalAssignation(demande.id)}
                        className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                      >
                        🔄 Réassigner
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => navigate(`/demandes-reconnaissance/evaluer/${demande.id}`)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    📝 Évaluer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
        </>
      )}

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
