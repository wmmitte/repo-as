import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Clock,
  MessageSquare,
  CheckCircle,
  XCircle,
  ArrowRight,
  Trash2,
  FolderOpen
} from 'lucide-react';
import { candidatureService } from '@/services/candidatureService';
import { Candidature, StatutCandidature } from '@/types/projet.types';
import Loader from '@/components/ui/Loader';

const STATUTS_CONFIG: Record<StatutCandidature, { label: string; classe: string; icone: React.ReactNode }> = {
  EN_ATTENTE: { label: 'En attente', classe: 'badge-warning', icone: <Clock size={12} /> },
  EN_DISCUSSION: { label: 'En discussion', classe: 'badge-info', icone: <MessageSquare size={12} /> },
  ACCEPTEE: { label: 'Acceptée', classe: 'badge-success', icone: <CheckCircle size={12} /> },
  REFUSEE: { label: 'Refusée', classe: 'badge-error', icone: <XCircle size={12} /> },
  RETIREE: { label: 'Retirée', classe: 'badge-ghost', icone: <Trash2 size={12} /> },
};

export default function MesCandidaturesPage() {
  const navigate = useNavigate();
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [chargement, setChargement] = useState(true);
  const [filtreStatut, setFiltreStatut] = useState<StatutCandidature | 'TOUTES'>('TOUTES');

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
    } finally {
      setChargement(false);
    }
  };

  const retirerCandidature = async (candidatureId: number) => {
    if (!confirm('Voulez-vous vraiment retirer cette candidature ?')) return;
    try {
      await candidatureService.retirerCandidature(candidatureId);
      setCandidatures(prev => prev.filter(c => c.id !== candidatureId));
    } catch (error) {
      console.error('Erreur retrait candidature:', error);
    }
  };

  const candidaturesFiltrees = filtreStatut === 'TOUTES'
    ? candidatures
    : candidatures.filter(c => c.statut === filtreStatut);

  const compteurs = {
    total: candidatures.length,
    enAttente: candidatures.filter(c => c.statut === 'EN_ATTENTE').length,
    acceptees: candidatures.filter(c => c.statut === 'ACCEPTEE').length,
  };

  const formaterDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Send className="text-primary" size={28} />
              Mes candidatures
            </h1>
            <p className="text-base-content/60 text-sm mt-1">
              Suivez l'état de vos candidatures aux projets
            </p>
          </div>

          {/* Stats rapides */}
          <div className="flex gap-3">
            <div className="stat bg-base-100 rounded-lg p-3">
              <div className="stat-title text-xs">En attente</div>
              <div className="stat-value text-warning text-xl">{compteurs.enAttente}</div>
            </div>
            <div className="stat bg-base-100 rounded-lg p-3">
              <div className="stat-title text-xs">Acceptées</div>
              <div className="stat-value text-success text-xl">{compteurs.acceptees}</div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            className={`btn btn-sm ${filtreStatut === 'TOUTES' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFiltreStatut('TOUTES')}
          >
            Toutes ({compteurs.total})
          </button>
          {(Object.keys(STATUTS_CONFIG) as StatutCandidature[]).map(statut => {
            const count = candidatures.filter(c => c.statut === statut).length;
            if (count === 0) return null;
            return (
              <button
                key={statut}
                className={`btn btn-sm gap-1 ${filtreStatut === statut ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFiltreStatut(statut)}
              >
                {STATUTS_CONFIG[statut].icone}
                {STATUTS_CONFIG[statut].label} ({count})
              </button>
            );
          })}
        </div>

        {/* Contenu */}
        {chargement ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : candidaturesFiltrees.length === 0 ? (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body items-center text-center py-12">
              <Send size={48} className="text-base-content/30 mb-4" />
              <h3 className="font-semibold text-lg">
                {filtreStatut === 'TOUTES' ? 'Aucune candidature' : 'Aucun résultat'}
              </h3>
              <p className="text-base-content/60 text-sm max-w-md">
                {filtreStatut === 'TOUTES'
                  ? 'Explorez les projets disponibles et proposez vos services.'
                  : 'Aucune candidature avec ce statut.'}
              </p>
              {filtreStatut === 'TOUTES' && (
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
            {candidaturesFiltrees.map((candidature) => {
              const config = STATUTS_CONFIG[candidature.statut];
              return (
                <div key={candidature.id} className="card bg-base-100 shadow-sm">
                  <div className="card-body p-4">
                    <div className="flex items-start gap-4">
                      {/* Icône statut */}
                      <div className={`badge ${config.classe} gap-1`}>
                        {config.icone}
                        {config.label}
                      </div>

                      {/* Contenu principal */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">
                            {candidature.projetNom || `Projet #${candidature.projetId}`}
                          </h3>
                          {candidature.estSurTache && candidature.tacheNom && (
                            <span className="badge badge-ghost badge-sm">
                              Tâche: {candidature.tacheNom}
                            </span>
                          )}
                        </div>

                        {/* Message */}
                        {candidature.message && (
                          <p className="text-sm text-base-content/70 mt-1 line-clamp-2">
                            {candidature.message}
                          </p>
                        )}

                        {/* Métriques */}
                        <div className="flex gap-4 mt-2 text-xs text-base-content/60">
                          {candidature.tarifPropose && (
                            <span>Tarif: {candidature.tarifPropose.toLocaleString()} FCFA</span>
                          )}
                          {candidature.delaiProposeJours && (
                            <span>Délai: {candidature.delaiProposeJours} jours</span>
                          )}
                          <span>Envoyée le {formaterDate(candidature.dateCreation)}</span>
                        </div>

                        {/* Réponse du client */}
                        {candidature.reponseClient && (
                          <div className="mt-2 p-2 bg-base-200 rounded text-sm">
                            <span className="font-medium">Réponse: </span>
                            {candidature.reponseClient}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => navigate(`/projets/${candidature.projetId}`)}
                          className="btn btn-ghost btn-sm btn-circle"
                          title="Voir le projet"
                        >
                          <ArrowRight size={16} />
                        </button>

                        {candidature.statut === 'EN_ATTENTE' && (
                          <button
                            onClick={() => retirerCandidature(candidature.id)}
                            className="btn btn-ghost btn-sm btn-circle text-error"
                            title="Retirer la candidature"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
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
