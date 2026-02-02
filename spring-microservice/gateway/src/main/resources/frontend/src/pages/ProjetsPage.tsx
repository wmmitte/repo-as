import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  FolderOpen,
  Globe,
  Clock,
  Users,
  TrendingUp,
  Search,
  Eye,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { projetService } from '@/services/projet.service';
import { ProjetResume, StatutProjet } from '@/types/projet.types';
import Loader from '@/components/ui/Loader';

type OngletActif = 'mes-projets' | 'explorer';

const STATUTS_CONFIG: Record<StatutProjet, { label: string; classe: string }> = {
  BROUILLON: { label: 'Brouillon', classe: 'badge-ghost' },
  PUBLIE: { label: 'Publié', classe: 'badge-info text-white' },
  EN_COURS: { label: 'En cours', classe: 'badge-warning' },
  EN_PAUSE: { label: 'En pause', classe: 'badge-neutral' },
  TERMINE: { label: 'Terminé', classe: 'badge-success text-white' },
  ANNULE: { label: 'Annulé', classe: 'badge-error text-white' },
};

export default function ProjetsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [ongletActif, setOngletActif] = useState<OngletActif>('mes-projets');
  const [mesProjets, setMesProjets] = useState<ProjetResume[]>([]);
  const [projetsPublics, setProjetsPublics] = useState<ProjetResume[]>([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    chargerDonnees();
  }, [ongletActif, page, isAuthenticated]);

  const chargerDonnees = async () => {
    setChargement(true);
    try {
      if (ongletActif === 'mes-projets' && isAuthenticated) {
        const data = await projetService.listerMesProjets();
        setMesProjets(data);
      } else {
        const response = await projetService.listerProjetsPublics(page, 12);
        setProjetsPublics(response.content);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error('Erreur chargement projets:', error);
    } finally {
      setChargement(false);
    }
  };

  const rechercherProjets = async () => {
    if (!recherche.trim()) {
      chargerDonnees();
      return;
    }
    setChargement(true);
    try {
      const response = await projetService.rechercherProjetsPublics(recherche, 0, 20);
      setProjetsPublics(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Erreur recherche:', error);
    } finally {
      setChargement(false);
    }
  };

  const projetsAffiches = ongletActif === 'mes-projets' ? mesProjets : projetsPublics;

  const projetsFiltres = projetsAffiches.filter(p =>
    p.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    p.description?.toLowerCase().includes(recherche.toLowerCase())
  );

  const formaterMontant = (montant: number, devise: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: devise === 'FCFA' ? 'XOF' : devise,
      maximumFractionDigits: 0
    }).format(montant);
  };

  const formaterDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header compact */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FolderOpen className="text-primary" size={28} />
              Projets
            </h1>
            <p className="text-base-content/60 text-sm mt-1">
              {ongletActif === 'mes-projets'
                ? 'Gérez vos projets et suivez leur avancement'
                : 'Découvrez des projets et proposez vos services'}
            </p>
          </div>

          {isAuthenticated && ongletActif === 'mes-projets' && (
            <button
              onClick={() => navigate('/projets/creer')}
              className="btn btn-primary btn-sm gap-2"
            >
              <Plus size={18} />
              Nouveau projet
            </button>
          )}
        </div>

        {/* Onglets + Recherche */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="tabs tabs-boxed bg-base-100 p-1">
            <button
              className={`tab gap-2 ${ongletActif === 'mes-projets' ? 'tab-active' : ''}`}
              onClick={() => { setOngletActif('mes-projets'); setPage(0); }}
            >
              <FolderOpen size={16} />
              <span className="hidden sm:inline">Mes projets</span>
              <span className="sm:hidden">Mes</span>
            </button>
            <button
              className={`tab gap-2 ${ongletActif === 'explorer' ? 'tab-active' : ''}`}
              onClick={() => { setOngletActif('explorer'); setPage(0); }}
            >
              <Globe size={16} />
              Explorer
            </button>
          </div>

          {/* Barre de recherche */}
          <div className="flex-1 flex gap-2">
            <div className="join flex-1">
              <input
                type="text"
                placeholder="Rechercher un projet..."
                className="input input-bordered input-sm join-item w-full"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && rechercherProjets()}
              />
              <button
                className="btn btn-sm btn-ghost join-item"
                onClick={rechercherProjets}
              >
                <Search size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        {chargement ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : projetsFiltres.length === 0 ? (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body items-center text-center py-12">
              <FolderOpen size={48} className="text-base-content/30 mb-4" />
              <h3 className="font-semibold text-lg">
                {ongletActif === 'mes-projets'
                  ? 'Aucun projet créé'
                  : 'Aucun projet trouvé'}
              </h3>
              <p className="text-base-content/60 text-sm max-w-md">
                {ongletActif === 'mes-projets'
                  ? 'Créez votre premier projet pour commencer à collaborer avec des experts.'
                  : 'Essayez de modifier vos critères de recherche.'}
              </p>
              {isAuthenticated && ongletActif === 'mes-projets' && (
                <button
                  onClick={() => navigate('/projets/creer')}
                  className="btn btn-primary btn-sm mt-4"
                >
                  <Plus size={16} />
                  Créer mon premier projet
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Grille de projets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projetsFiltres.map((projet) => (
                <div
                  key={projet.id}
                  className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/projets/${projet.id}`)}
                >
                  <div className="card-body p-4">
                    {/* En-tête avec statut */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="card-title text-base line-clamp-1 flex-1">
                        {projet.nom}
                      </h3>
                      <span className={`badge badge-sm ${STATUTS_CONFIG[projet.statut]?.classe || 'badge-ghost'}`}>
                        {STATUTS_CONFIG[projet.statut]?.label || projet.statut}
                      </span>
                    </div>

                    {/* Description */}
                    {projet.description && (
                      <p className="text-sm text-base-content/60 line-clamp-2">
                        {projet.description}
                      </p>
                    )}

                    {/* Progression */}
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-base-content/60">Progression</span>
                        <span className="font-medium">{projet.progression}%</span>
                      </div>
                      <progress
                        className="progress progress-primary h-1.5"
                        value={projet.progression}
                        max="100"
                      />
                    </div>

                    {/* Métriques compactes */}
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-base-content/70">
                      <div className="flex items-center gap-1">
                        <TrendingUp size={14} />
                        <span>{formaterMontant(projet.budget, projet.devise)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{projet.nombreTaches} tâches</span>
                      </div>
                      {projet.nombreCandidatures > 0 && (
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          <span>{projet.nombreCandidatures} candidat{projet.nombreCandidatures > 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {ongletActif === 'explorer' && (
                        <div className="flex items-center gap-1">
                          <Eye size={14} />
                          <span>{projet.nombreVues}</span>
                        </div>
                      )}
                    </div>

                    {/* Dates */}
                    {(projet.dateDebutPrevue || projet.dateFinPrevue) && (
                      <div className="flex items-center gap-2 text-xs text-base-content/50 mt-2 pt-2 border-t border-base-200">
                        <Calendar size={12} />
                        <span>
                          {formaterDate(projet.dateDebutPrevue)} → {formaterDate(projet.dateFinPrevue)}
                        </span>
                      </div>
                    )}

                    {/* Badge tâches disponibles pour explorer */}
                    {ongletActif === 'explorer' && projet.nombreTachesDisponibles > 0 && (
                      <div className="mt-2">
                        <span className="badge badge-success badge-sm gap-1">
                          <Users size={12} />
                          {projet.nombreTachesDisponibles} tâche{projet.nombreTachesDisponibles > 1 ? 's' : ''} disponible{projet.nombreTachesDisponibles > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {ongletActif === 'explorer' && totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="join">
                  <button
                    className="join-item btn btn-sm"
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                  >
                    «
                  </button>
                  <button className="join-item btn btn-sm">
                    Page {page + 1} / {totalPages}
                  </button>
                  <button
                    className="join-item btn btn-sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
