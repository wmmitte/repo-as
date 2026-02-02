import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Clock,
  MessageSquare,
  CheckCircle,
  XCircle,
  Trash2,
  FolderOpen,
  ChevronRight,
  Calendar,
  Wallet
} from 'lucide-react';
import { candidatureService } from '@/services/candidatureService';
import { Candidature, StatutCandidature } from '@/types/projet.types';
import Loader from '@/components/ui/Loader';
import { useHeaderConfig } from '@/hooks/useHeaderConfig';
import { useToast } from '@/contexts/ToastContext';

const STATUTS_CONFIG: Record<StatutCandidature, { label: string; classe: string; classeBadge: string; icone: React.ReactNode }> = {
  EN_ATTENTE: { label: 'En attente', classe: 'text-warning', classeBadge: 'badge-warning', icone: <Clock size={12} /> },
  EN_DISCUSSION: { label: 'En discussion', classe: 'text-info', classeBadge: 'badge-info', icone: <MessageSquare size={12} /> },
  ACCEPTEE: { label: 'Acceptée', classe: 'text-success', classeBadge: 'badge-success', icone: <CheckCircle size={12} /> },
  REFUSEE: { label: 'Refusée', classe: 'text-error', classeBadge: 'badge-error', icone: <XCircle size={12} /> },
  RETIREE: { label: 'Retirée', classe: 'text-base-content/50', classeBadge: 'badge-ghost', icone: <Trash2 size={12} /> },
};

type OngletCandidature = 'toutes' | 'en_attente' | 'acceptees' | 'refusees';

export default function MesCandidaturesPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [chargement, setChargement] = useState(true);
  const [ongletActif, setOngletActif] = useState<OngletCandidature>('toutes');
  const [retraitEnCours, setRetraitEnCours] = useState<number | null>(null);

  // Compteurs pour les onglets
  const compteurs = {
    total: candidatures.length,
    enAttente: candidatures.filter(c => c.statut === 'EN_ATTENTE' || c.statut === 'EN_DISCUSSION').length,
    acceptees: candidatures.filter(c => c.statut === 'ACCEPTEE').length,
    refusees: candidatures.filter(c => c.statut === 'REFUSEE' || c.statut === 'RETIREE').length,
  };

  // Configuration du header avec onglets
  useHeaderConfig({
    title: 'Mes Candidatures',
    tabs: [
      { id: 'toutes', label: `Toutes (${compteurs.total})` },
      { id: 'en_attente', label: `En attente (${compteurs.enAttente})` },
      { id: 'acceptees', label: `Acceptées (${compteurs.acceptees})` },
      { id: 'refusees', label: `Refusées (${compteurs.refusees})` },
    ],
    activeTab: ongletActif,
    onTabChange: (tabId) => setOngletActif(tabId as OngletCandidature),
  });

  useEffect(() => {
    chargerCandidatures();
  }, []);

  const chargerCandidatures = async () => {
    setChargement(true);
    try {
      const data = await candidatureService.listerMesCandidatures();
      setCandidatures(data);
    } catch (error) {
      console.error('Erreur chargement candidatures:', error);
      toast.erreur('Erreur lors du chargement des candidatures');
    } finally {
      setChargement(false);
    }
  };

  const retirerCandidature = async (candidatureId: number) => {
    setRetraitEnCours(candidatureId);
    try {
      await candidatureService.retirerCandidature(candidatureId);
      setCandidatures(prev => prev.filter(c => c.id !== candidatureId));
      toast.succes('Candidature retirée');
    } catch (error) {
      console.error('Erreur retrait candidature:', error);
      toast.erreur('Erreur lors du retrait de la candidature');
    } finally {
      setRetraitEnCours(null);
    }
  };

  // Filtrage selon l'onglet actif
  const candidaturesFiltrees = candidatures.filter(c => {
    switch (ongletActif) {
      case 'en_attente':
        return c.statut === 'EN_ATTENTE' || c.statut === 'EN_DISCUSSION';
      case 'acceptees':
        return c.statut === 'ACCEPTEE';
      case 'refusees':
        return c.statut === 'REFUSEE' || c.statut === 'RETIREE';
      default:
        return true;
    }
  });

  const formaterDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  if (chargement) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4">
      <div className="max-w-4xl mx-auto">
        {candidaturesFiltrees.length === 0 ? (
          /* État vide */
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-base-200 rounded-full flex items-center justify-center">
              <Send className="w-8 h-8 text-base-content/30" />
            </div>
            <h3 className="text-lg font-semibold text-base-content mb-2">
              {ongletActif === 'toutes' ? 'Aucune candidature' : 'Aucune candidature dans cette catégorie'}
            </h3>
            <p className="text-sm text-base-content/60 mb-4 max-w-sm mx-auto">
              {ongletActif === 'toutes'
                ? 'Explorez les projets disponibles et proposez vos services aux clients.'
                : 'Changez d\'onglet pour voir vos autres candidatures.'}
            </p>
            {ongletActif === 'toutes' && (
              <button
                onClick={() => navigate('/')}
                className="btn btn-primary btn-sm gap-2"
              >
                <FolderOpen size={16} />
                Découvrir les projets
              </button>
            )}
          </div>
        ) : (
          /* Liste des candidatures */
          <div className="space-y-2">
            {candidaturesFiltrees.map((candidature) => {
              const config = STATUTS_CONFIG[candidature.statut];
              return (
                <div
                  key={candidature.id}
                  className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/projets/${candidature.projetId}`)}
                >
                  <div className="card-body p-3">
                    <div className="flex items-center gap-3">
                      {/* Indicateur statut */}
                      <div className={`w-1 h-12 rounded-full ${
                        candidature.statut === 'EN_ATTENTE' || candidature.statut === 'EN_DISCUSSION' ? 'bg-warning' :
                        candidature.statut === 'ACCEPTEE' ? 'bg-success' :
                        candidature.statut === 'REFUSEE' ? 'bg-error' : 'bg-base-300'
                      }`} />

                      {/* Contenu principal */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm truncate">
                            {candidature.projetNom || `Projet #${candidature.projetId}`}
                          </h3>
                          <span className={`badge badge-xs gap-1 ${config.classeBadge}`}>
                            {config.icone}
                            {config.label}
                          </span>
                        </div>

                        {candidature.estSurTache && candidature.tacheNom && (
                          <p className="text-xs text-base-content/60 truncate mt-0.5">
                            Tâche: {candidature.tacheNom}
                          </p>
                        )}

                        {/* Infos compactes */}
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-base-content/60 flex-wrap">
                          {candidature.tarifPropose && candidature.tarifPropose > 0 && (
                            <span className="flex items-center gap-1">
                              <Wallet size={11} />
                              {candidature.tarifPropose.toLocaleString()} FCFA
                            </span>
                          )}
                          {candidature.delaiProposeJours && (
                            <span className="flex items-center gap-1">
                              <Clock size={11} />
                              {candidature.delaiProposeJours}j
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {formaterDate(candidature.dateCreation)}
                          </span>
                        </div>

                        {/* Réponse du client */}
                        {candidature.reponseClient && (
                          <div className="mt-2 p-2 bg-base-200 rounded text-xs line-clamp-1">
                            <span className="font-medium">Réponse: </span>
                            {candidature.reponseClient}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {candidature.statut === 'EN_ATTENTE' && (
                          <button
                            onClick={() => retirerCandidature(candidature.id)}
                            className="btn btn-ghost btn-xs btn-square text-error"
                            title="Retirer"
                            disabled={retraitEnCours === candidature.id}
                          >
                            {retraitEnCours === candidature.id ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        )}
                        <ChevronRight size={16} className="text-base-content/30" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
