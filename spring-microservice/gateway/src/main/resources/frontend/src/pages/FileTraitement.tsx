import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { traitementService } from '@/services/traitementService';
import { useHeaderConfig } from '@/hooks/useHeaderConfig';
import {
  DemandeReconnaissanceDTO,
  StatutDemande,
  NiveauCertification,
} from '@/types/reconnaissance.types';

const STATUT_COLORS: Record<StatutDemande, string> = {
  [StatutDemande.EN_ATTENTE]: 'bg-yellow-100 text-yellow-800',
  [StatutDemande.ASSIGNEE_RH]: 'bg-indigo-100 text-indigo-800',
  [StatutDemande.EN_COURS_EVALUATION]: 'bg-purple-100 text-purple-800',
  [StatutDemande.EN_ATTENTE_VALIDATION]: 'bg-cyan-100 text-cyan-800',
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

export default function FileTraitement() {
  const navigate = useNavigate();
  const [demandes, setDemandes] = useState<DemandeReconnaissanceDTO[]>([]);
  const [mesDemandes, setMesDemandes] = useState<DemandeReconnaissanceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'disponibles' | 'assignees'>('disponibles');

  // Configurer le Header
  useHeaderConfig({
    title: 'File de traitement'
  });

  useEffect(() => {
    loadDemandes();
  }, [activeTab]);

  /**
   * Charge uniquement les données de l'onglet actif
   * Utilisé lors du changement d'onglet
   */
  const loadDemandes = async () => {
    try {
      setLoading(true);
      if (activeTab === 'disponibles') {
        const data = await traitementService.getDemandesATraiter(StatutDemande.EN_ATTENTE);
        setDemandes(data);
      } else {
        const data = await traitementService.getDemandesAssignees();
        setMesDemandes(data);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Rafraîchit TOUS les onglets en parallèle
   * Utilisé après une action pour synchroniser tous les compteurs
   */
  const rafraichirTousLesOnglets = async () => {
    try {
      setLoading(true);

      // Charger tous les onglets en parallèle
      const [disponiblesData, assigneesData] = await Promise.all([
        traitementService.getDemandesATraiter(StatutDemande.EN_ATTENTE),
        traitementService.getDemandesAssignees(),
      ]);

      setDemandes(disponiblesData);
      setMesDemandes(assigneesData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du rafraîchissement');
    } finally {
      setLoading(false);
    }
  };

  const handleAssigner = async (demandeId: number) => {
    try {
      await traitementService.assignerDemande(demandeId);
      // Rafraîchir tous les onglets pour synchroniser les compteurs
      await rafraichirTousLesOnglets();
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

  const demandesAffichees = activeTab === 'disponibles' ? demandes : mesDemandes;

  return (
    <div className="container mx-auto px-4 py-8">

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('disponibles')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'disponibles'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          📋 Disponibles ({demandes.length})
        </button>
        <button
          onClick={() => setActiveTab('assignees')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'assignees'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          👤 Mes demandes ({mesDemandes.length})
        </button>
      </div>

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
                  <p>👤 Assigné à : {demande.traitantId}</p>
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
                      onClick={() => navigate(`/traitant/evaluer/${demande.id}`)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      🔍 Voir détails
                    </button>
                    <button
                      onClick={() => handleAssigner(demande.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      ✋ M'assigner
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate(`/traitant/evaluer/${demande.id}`)}
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
    </div>
  );
}
