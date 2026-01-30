import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ListTodo,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Trash2,
  Play,
  Pause,
  Package,
  ArrowRight,
  Calendar,
  FolderOpen
} from 'lucide-react';
import { tacheService } from '@/services/tacheService';
import { Tache, StatutTache, PrioriteTache } from '@/types/projet.types';
import Loader from '@/components/ui/Loader';

const STATUTS_CONFIG: Record<StatutTache, { label: string; classe: string; icone: React.ReactNode }> = {
  A_FAIRE: { label: 'À faire', classe: 'badge-ghost', icone: <Clock size={12} /> },
  EN_COURS: { label: 'En cours', classe: 'badge-warning', icone: <Play size={12} /> },
  EN_REVUE: { label: 'En revue', classe: 'badge-info', icone: <Eye size={12} /> },
  TERMINEE: { label: 'Terminée', classe: 'badge-success', icone: <CheckCircle size={12} /> },
  BLOQUEE: { label: 'Bloquée', classe: 'badge-error', icone: <AlertCircle size={12} /> },
  ANNULEE: { label: 'Annulée', classe: 'badge-neutral', icone: <Trash2 size={12} /> },
};

const PRIORITES_CONFIG: Record<PrioriteTache, { label: string; classe: string }> = {
  BASSE: { label: 'Basse', classe: 'text-base-content/50' },
  NORMALE: { label: 'Normale', classe: 'text-base-content' },
  HAUTE: { label: 'Haute', classe: 'text-warning' },
  URGENTE: { label: 'Urgente', classe: 'text-error' },
};

type FiltreVue = 'toutes' | 'en-cours' | 'a-faire' | 'terminees';

export default function MesTachesPage() {
  const navigate = useNavigate();
  const [taches, setTaches] = useState<Tache[]>([]);
  const [chargement, setChargement] = useState(true);
  const [filtreVue, setFiltreVue] = useState<FiltreVue>('toutes');

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
    } finally {
      setChargement(false);
    }
  };

  const changerStatut = async (tacheId: number, nouveauStatut: StatutTache) => {
    try {
      const tacheMaj = await tacheService.changerStatut(tacheId, nouveauStatut);
      setTaches(prev => prev.map(t => t.id === tacheId ? tacheMaj : t));
    } catch (error) {
      console.error('Erreur changement statut:', error);
    }
  };

  const tachesFiltrees = taches.filter(tache => {
    switch (filtreVue) {
      case 'en-cours':
        return tache.statut === 'EN_COURS';
      case 'a-faire':
        return tache.statut === 'A_FAIRE';
      case 'terminees':
        return tache.statut === 'TERMINEE';
      default:
        return true;
    }
  });

  const compteurs = {
    total: taches.length,
    enCours: taches.filter(t => t.statut === 'EN_COURS').length,
    aFaire: taches.filter(t => t.statut === 'A_FAIRE').length,
    terminees: taches.filter(t => t.statut === 'TERMINEE').length,
  };

  const formaterDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  const formaterMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA';
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ListTodo className="text-primary" size={28} />
              Mes tâches
            </h1>
            <p className="text-base-content/60 text-sm mt-1">
              Gérez vos tâches assignées et suivez votre progression
            </p>
          </div>

          {/* Stats rapides */}
          <div className="flex gap-3">
            <div className="stat bg-base-100 rounded-lg p-3">
              <div className="stat-title text-xs">En cours</div>
              <div className="stat-value text-warning text-xl">{compteurs.enCours}</div>
            </div>
            <div className="stat bg-base-100 rounded-lg p-3">
              <div className="stat-title text-xs">À faire</div>
              <div className="stat-value text-info text-xl">{compteurs.aFaire}</div>
            </div>
            <div className="stat bg-base-100 rounded-lg p-3">
              <div className="stat-title text-xs">Terminées</div>
              <div className="stat-value text-success text-xl">{compteurs.terminees}</div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="tabs tabs-boxed bg-base-100 p-1 mb-6 inline-flex">
          <button
            className={`tab ${filtreVue === 'toutes' ? 'tab-active' : ''}`}
            onClick={() => setFiltreVue('toutes')}
          >
            Toutes ({compteurs.total})
          </button>
          <button
            className={`tab ${filtreVue === 'en-cours' ? 'tab-active' : ''}`}
            onClick={() => setFiltreVue('en-cours')}
          >
            En cours
          </button>
          <button
            className={`tab ${filtreVue === 'a-faire' ? 'tab-active' : ''}`}
            onClick={() => setFiltreVue('a-faire')}
          >
            À faire
          </button>
          <button
            className={`tab ${filtreVue === 'terminees' ? 'tab-active' : ''}`}
            onClick={() => setFiltreVue('terminees')}
          >
            Terminées
          </button>
        </div>

        {/* Contenu */}
        {chargement ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : tachesFiltrees.length === 0 ? (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body items-center text-center py-12">
              <ListTodo size={48} className="text-base-content/30 mb-4" />
              <h3 className="font-semibold text-lg">
                {filtreVue === 'toutes' ? 'Aucune tâche assignée' : 'Aucune tâche dans cette catégorie'}
              </h3>
              <p className="text-base-content/60 text-sm max-w-md">
                {filtreVue === 'toutes'
                  ? 'Candidatez à des projets pour recevoir des tâches.'
                  : 'Changez de filtre pour voir d\'autres tâches.'}
              </p>
              {filtreVue === 'toutes' && (
                <button
                  onClick={() => navigate('/projets')}
                  className="btn btn-primary btn-sm mt-4"
                >
                  <FolderOpen size={16} />
                  Explorer les projets
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {tachesFiltrees.map((tache) => {
              const statutConfig = STATUTS_CONFIG[tache.statut];
              const prioriteConfig = PRIORITES_CONFIG[tache.priorite];

              return (
                <div key={tache.id} className="card bg-base-100 shadow-sm">
                  <div className="card-body p-4">
                    <div className="flex items-start gap-4">
                      {/* Statut */}
                      <div className={`badge ${statutConfig.classe} gap-1`}>
                        {statutConfig.icone}
                        <span className="hidden sm:inline">{statutConfig.label}</span>
                      </div>

                      {/* Contenu principal */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold truncate">{tache.nom}</h3>
                          {tache.priorite !== 'NORMALE' && (
                            <span className={`text-xs ${prioriteConfig.classe}`}>
                              {prioriteConfig.label}
                            </span>
                          )}
                        </div>

                        {/* Projet parent */}
                        <p className="text-xs text-base-content/60">
                          {tache.projetNom || `Projet #${tache.projetId}`}
                          {tache.etapeNom && ` > ${tache.etapeNom}`}
                        </p>

                        {/* Description */}
                        {tache.description && (
                          <p className="text-sm text-base-content/70 mt-1 line-clamp-2">
                            {tache.description}
                          </p>
                        )}

                        {/* Progression et livrables */}
                        {tache.nombreLivrables > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <Package size={14} className="text-base-content/60" />
                            <span className="text-xs text-base-content/60">
                              {tache.nombreLivrablesValides}/{tache.nombreLivrables} livrables validés
                            </span>
                            <progress
                              className="progress progress-success h-1.5 w-20"
                              value={tache.nombreLivrablesValides}
                              max={tache.nombreLivrables}
                            />
                          </div>
                        )}

                        {/* Métriques */}
                        <div className="flex gap-4 mt-2 text-xs text-base-content/60 flex-wrap">
                          {tache.budget > 0 && (
                            <span>{formaterMontant(tache.budget)}</span>
                          )}
                          {tache.delaiJours && (
                            <span>{tache.delaiJours} jours</span>
                          )}
                          {(tache.dateDebutPrevue || tache.dateFinPrevue) && (
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {formaterDate(tache.dateDebutPrevue)} → {formaterDate(tache.dateFinPrevue)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1">
                        {/* Actions selon le statut */}
                        {tache.statut === 'A_FAIRE' && (
                          <button
                            onClick={() => changerStatut(tache.id, 'EN_COURS')}
                            className="btn btn-primary btn-xs gap-1"
                            title="Démarrer"
                          >
                            <Play size={12} />
                            <span className="hidden sm:inline">Démarrer</span>
                          </button>
                        )}

                        {tache.statut === 'EN_COURS' && (
                          <>
                            <button
                              onClick={() => changerStatut(tache.id, 'EN_REVUE')}
                              className="btn btn-info btn-xs gap-1"
                              title="Soumettre"
                            >
                              <Eye size={12} />
                              <span className="hidden sm:inline">Soumettre</span>
                            </button>
                            <button
                              onClick={() => changerStatut(tache.id, 'BLOQUEE')}
                              className="btn btn-ghost btn-xs gap-1 text-error"
                              title="Bloquer"
                            >
                              <Pause size={12} />
                            </button>
                          </>
                        )}

                        {tache.statut === 'BLOQUEE' && (
                          <button
                            onClick={() => changerStatut(tache.id, 'EN_COURS')}
                            className="btn btn-warning btn-xs gap-1"
                            title="Reprendre"
                          >
                            <Play size={12} />
                            <span className="hidden sm:inline">Reprendre</span>
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/projets/${tache.projetId}`)}
                          className="btn btn-ghost btn-xs btn-circle"
                          title="Voir le projet"
                        >
                          <ArrowRight size={14} />
                        </button>
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
