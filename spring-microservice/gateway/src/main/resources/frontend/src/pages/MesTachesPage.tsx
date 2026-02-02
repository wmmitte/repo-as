import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ListTodo,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Play,
  Pause,
  Package,
  Calendar,
  FolderOpen,
  ChevronRight,
  Wallet
} from 'lucide-react';
import { tacheService } from '@/services/tacheService';
import { Tache, StatutTache, PrioriteTache } from '@/types/projet.types';
import Loader from '@/components/ui/Loader';
import { useHeaderConfig } from '@/hooks/useHeaderConfig';
import { useToast } from '@/contexts/ToastContext';

const STATUTS_CONFIG: Record<StatutTache, { label: string; classeBadge: string; couleur: string; icone: React.ReactNode }> = {
  A_FAIRE: { label: 'À faire', classeBadge: 'badge-ghost', couleur: 'bg-base-300', icone: <Clock size={12} /> },
  EN_COURS: { label: 'En cours', classeBadge: 'badge-warning', couleur: 'bg-warning', icone: <Play size={12} /> },
  EN_REVUE: { label: 'En revue', classeBadge: 'badge-info', couleur: 'bg-info', icone: <Eye size={12} /> },
  TERMINEE: { label: 'Terminée', classeBadge: 'badge-success', couleur: 'bg-success', icone: <CheckCircle size={12} /> },
  BLOQUEE: { label: 'Bloquée', classeBadge: 'badge-error', couleur: 'bg-error', icone: <AlertCircle size={12} /> },
  ANNULEE: { label: 'Annulée', classeBadge: 'badge-neutral', couleur: 'bg-neutral', icone: <AlertCircle size={12} /> },
};

const PRIORITES_CONFIG: Record<PrioriteTache, { label: string; classe: string }> = {
  BASSE: { label: 'Basse', classe: 'badge-ghost' },
  NORMALE: { label: 'Normale', classe: 'hidden' },
  HAUTE: { label: 'Haute', classe: 'badge-warning' },
  URGENTE: { label: 'Urgente', classe: 'badge-error' },
};

type OngletTache = 'toutes' | 'en_cours' | 'a_faire' | 'terminees';

export default function MesTachesPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [taches, setTaches] = useState<Tache[]>([]);
  const [chargement, setChargement] = useState(true);
  const [ongletActif, setOngletActif] = useState<OngletTache>('toutes');
  const [changementStatutEnCours, setChangementStatutEnCours] = useState<number | null>(null);

  // Compteurs pour les onglets
  const compteurs = {
    total: taches.length,
    enCours: taches.filter(t => t.statut === 'EN_COURS' || t.statut === 'EN_REVUE' || t.statut === 'BLOQUEE').length,
    aFaire: taches.filter(t => t.statut === 'A_FAIRE').length,
    terminees: taches.filter(t => t.statut === 'TERMINEE').length,
  };

  // Configuration du header avec onglets
  useHeaderConfig({
    title: 'Mes Tâches',
    tabs: [
      { id: 'toutes', label: `Toutes (${compteurs.total})` },
      { id: 'en_cours', label: `En cours (${compteurs.enCours})` },
      { id: 'a_faire', label: `À faire (${compteurs.aFaire})` },
      { id: 'terminees', label: `Terminées (${compteurs.terminees})` },
    ],
    activeTab: ongletActif,
    onTabChange: (tabId) => setOngletActif(tabId as OngletTache),
  });

  useEffect(() => {
    chargerTaches();
  }, []);

  const chargerTaches = async () => {
    setChargement(true);
    try {
      const data = await tacheService.listerMesTaches();
      setTaches(data);
    } catch (error) {
      console.error('Erreur chargement tâches:', error);
      toast.erreur('Erreur lors du chargement des tâches');
    } finally {
      setChargement(false);
    }
  };

  const changerStatut = async (tacheId: number, nouveauStatut: StatutTache) => {
    setChangementStatutEnCours(tacheId);
    try {
      const tacheMaj = await tacheService.changerStatut(tacheId, nouveauStatut);
      setTaches(prev => prev.map(t => t.id === tacheId ? tacheMaj : t));
      toast.succes(`Statut changé: ${STATUTS_CONFIG[nouveauStatut].label}`);
    } catch (error) {
      console.error('Erreur changement statut:', error);
      toast.erreur('Erreur lors du changement de statut');
    } finally {
      setChangementStatutEnCours(null);
    }
  };

  // Filtrage selon l'onglet actif
  const tachesFiltrees = taches.filter(tache => {
    switch (ongletActif) {
      case 'en_cours':
        return tache.statut === 'EN_COURS' || tache.statut === 'EN_REVUE' || tache.statut === 'BLOQUEE';
      case 'a_faire':
        return tache.statut === 'A_FAIRE';
      case 'terminees':
        return tache.statut === 'TERMINEE';
      default:
        return true;
    }
  });

  const formaterDate = (date?: string) => {
    if (!date) return null;
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
        {tachesFiltrees.length === 0 ? (
          /* État vide */
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-base-200 rounded-full flex items-center justify-center">
              <ListTodo className="w-8 h-8 text-base-content/30" />
            </div>
            <h3 className="text-lg font-semibold text-base-content mb-2">
              {ongletActif === 'toutes' ? 'Aucune tâche assignée' : 'Aucune tâche dans cette catégorie'}
            </h3>
            <p className="text-sm text-base-content/60 mb-4 max-w-sm mx-auto">
              {ongletActif === 'toutes'
                ? 'Candidatez à des projets pour recevoir des tâches à réaliser.'
                : 'Changez d\'onglet pour voir vos autres tâches.'}
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
          /* Liste des tâches */
          <div className="space-y-2">
            {tachesFiltrees.map((tache) => {
              const statutConfig = STATUTS_CONFIG[tache.statut];
              const prioriteConfig = PRIORITES_CONFIG[tache.priorite];
              const enChargement = changementStatutEnCours === tache.id;

              return (
                <div
                  key={tache.id}
                  className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/projets/${tache.projetId}/taches/${tache.id}`)}
                >
                  <div className="card-body p-3">
                    <div className="flex items-center gap-3">
                      {/* Indicateur statut */}
                      <div className={`w-1 h-14 rounded-full ${statutConfig.couleur}`} />

                      {/* Contenu principal */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm truncate">{tache.nom}</h3>
                          <span className={`badge badge-xs gap-1 ${statutConfig.classeBadge}`}>
                            {statutConfig.icone}
                            {statutConfig.label}
                          </span>
                          {prioriteConfig.classe !== 'hidden' && (
                            <span className={`badge badge-xs ${prioriteConfig.classe}`}>
                              {prioriteConfig.label}
                            </span>
                          )}
                        </div>

                        {/* Projet parent */}
                        <p className="text-xs text-base-content/60 truncate mt-0.5">
                          {tache.projetNom || `Projet #${tache.projetId}`}
                          {tache.etapeNom && ` › ${tache.etapeNom}`}
                        </p>

                        {/* Infos compactes */}
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-base-content/60 flex-wrap">
                          {tache.budget > 0 && (
                            <span className="flex items-center gap-1">
                              <Wallet size={11} />
                              {tache.budget.toLocaleString()} FCFA
                            </span>
                          )}
                          {tache.delaiJours && (
                            <span className="flex items-center gap-1">
                              <Clock size={11} />
                              {tache.delaiJours}j
                            </span>
                          )}
                          {(tache.dateDebutPrevue || tache.dateFinPrevue) && (
                            <span className="flex items-center gap-1">
                              <Calendar size={11} />
                              {formaterDate(tache.dateDebutPrevue)}
                              {tache.dateFinPrevue && ` → ${formaterDate(tache.dateFinPrevue)}`}
                            </span>
                          )}
                          {tache.nombreLivrables > 0 && (
                            <span className="flex items-center gap-1">
                              <Package size={11} />
                              {tache.nombreLivrablesValides}/{tache.nombreLivrables}
                            </span>
                          )}
                        </div>

                        {/* Progression livrables */}
                        {tache.nombreLivrables > 0 && (
                          <progress
                            className="progress progress-success h-1 w-full max-w-[120px] mt-1.5"
                            value={tache.nombreLivrablesValides}
                            max={tache.nombreLivrables}
                          />
                        )}
                      </div>

                      {/* Actions rapides */}
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {tache.statut === 'A_FAIRE' && (
                          <button
                            onClick={() => changerStatut(tache.id, 'EN_COURS')}
                            className="btn btn-primary btn-xs gap-1"
                            title="Démarrer"
                            disabled={enChargement}
                          >
                            {enChargement ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              <>
                                <Play size={12} />
                                <span className="hidden sm:inline">Démarrer</span>
                              </>
                            )}
                          </button>
                        )}

                        {tache.statut === 'EN_COURS' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => changerStatut(tache.id, 'EN_REVUE')}
                              className="btn btn-info btn-xs gap-1"
                              title="Soumettre pour revue"
                              disabled={enChargement}
                            >
                              {enChargement ? (
                                <span className="loading loading-spinner loading-xs"></span>
                              ) : (
                                <>
                                  <Eye size={12} />
                                  <span className="hidden sm:inline">Soumettre</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => changerStatut(tache.id, 'BLOQUEE')}
                              className="btn btn-ghost btn-xs text-error"
                              title="Signaler un blocage"
                              disabled={enChargement}
                            >
                              <Pause size={12} />
                            </button>
                          </div>
                        )}

                        {tache.statut === 'BLOQUEE' && (
                          <button
                            onClick={() => changerStatut(tache.id, 'EN_COURS')}
                            className="btn btn-warning btn-xs gap-1"
                            title="Reprendre"
                            disabled={enChargement}
                          >
                            {enChargement ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              <>
                                <Play size={12} />
                                <span className="hidden sm:inline">Reprendre</span>
                              </>
                            )}
                          </button>
                        )}

                        <ChevronRight size={16} className="text-base-content/30 ml-1" />
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
