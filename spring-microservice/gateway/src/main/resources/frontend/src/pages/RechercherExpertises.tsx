import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Users, MapPin, X, Filter, ChevronDown, ChevronUp,
  LayoutList, LayoutGrid, GitBranch, Award, Clock, DollarSign,
  Star, TrendingUp, Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHeaderConfig } from '@/hooks/useHeaderConfig';

/**
 * Extrait les initiales d'un nom (max 2 caractères)
 */
const getInitiales = (titre: string): string => {
  if (!titre) return '?';
  const mots = titre.trim().split(/\s+/);
  if (mots.length >= 2) {
    return (mots[0][0] + mots[1][0]).toUpperCase();
  }
  return titre.substring(0, 2).toUpperCase();
};

/**
 * Génère une couleur de fond basée sur le nom (pour les initiales)
 */
const getCouleurAvatar = (titre: string): string => {
  const couleurs = [
    'bg-primary', 'bg-secondary', 'bg-accent',
    'bg-info', 'bg-success', 'bg-warning'
  ];
  let hash = 0;
  for (let i = 0; i < titre.length; i++) {
    hash = titre.charCodeAt(i) + ((hash << 5) - hash);
  }
  return couleurs[Math.abs(hash) % couleurs.length];
};

// === TYPES ===

interface RechercheRequest {
  terme?: string;
  paysId?: number;
  villeId?: number;
  disponible?: boolean;
  anneesExperienceMin?: number;
  niveauMaitriseMin?: number;
  thmMin?: number;
  thmMax?: number;
  niveauBadgeMin?: string;
  nombreBadgesMin?: number;
  certifieUniquement?: boolean;
  nombreFollowersMin?: number;
  tri?: string;
  page?: number;
  taille?: number;
}

interface CompetenceResume {
  nom: string;
  niveauMaitrise?: number;
  anneesExperience?: number;
  thm?: number;
  estCertifiee: boolean;
  niveauBadge?: string;
}

interface ExpertResultat {
  utilisateurId: string;
  titre: string;
  description?: string;
  photoUrl?: string;
  villeNom?: string;
  paysNom?: string;
  disponible: boolean;
  scoreGlobal: number;
  nombreCompetences: number;
  niveauMaitriseMax: number;
  anneesExperienceMax: number;
  thmMin?: number;
  thmMax?: number;
  nombreProjets: number;
  nombreBadges: number;
  niveauBadgeMax?: string;
  nombreFollowers: number;
  competencesPrincipales?: CompetenceResume[];
  scoreRecherche?: number;
}

interface FacetteItem {
  code: string;
  libelle: string;
  count: number;
}

interface StatistiquesRecherche {
  totalExpertsDisponibles: number;
  totalExpertsCertifies: number;
  thmMoyen: number;
  experienceMoyenne: number;
  scoreMoyen: number;
}

interface RechercheResponse {
  resultats: ExpertResultat[];
  totalResultats: number;
  page: number;
  taille: number;
  totalPages: number;
  facettesPays?: FacetteItem[];
  facettesVilles?: FacetteItem[];
  facettesBadges?: FacetteItem[];
  statistiques?: StatistiquesRecherche;
}

// === COMPOSANTS ===

interface AvatarExpertProps {
  utilisateurId: string;
  titre: string;
  taille?: 'sm' | 'md' | 'lg';
}

const AvatarExpert: React.FC<AvatarExpertProps> = ({ utilisateurId, titre, taille = 'md' }) => {
  const [photoError, setPhotoError] = useState(false);

  const tailleClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const photoUrl = `/api/profil/public/${utilisateurId}/photo`;

  if (!photoError) {
    return (
      <div className={`${tailleClasses[taille]} rounded-full overflow-hidden ring-2 ring-base-200 flex-shrink-0`}>
        <img
          src={photoUrl}
          alt={titre}
          className="w-full h-full object-cover"
          onError={() => setPhotoError(true)}
        />
      </div>
    );
  }

  return (
    <div className={`${getCouleurAvatar(titre)} text-white rounded-full ${tailleClasses[taille]} flex items-center justify-center font-semibold flex-shrink-0`}>
      <span>{getInitiales(titre)}</span>
    </div>
  );
};

const BadgeNiveau: React.FC<{ niveau?: string }> = ({ niveau }) => {
  if (!niveau) return null;

  const couleurs: Record<string, string> = {
    'PLATINE': 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white',
    'OR': 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white',
    'ARGENT': 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800',
    'BRONZE': 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
  };

  return (
    <span className={`badge badge-sm ${couleurs[niveau] || 'badge-ghost'}`}>
      <Award className="w-3 h-3 mr-1" />
      {niveau}
    </span>
  );
};

type VueAffichage = 'liste' | 'cartes' | 'arbre';
type TriOption = 'SCORE' | 'PERTINENCE' | 'EXPERIENCE' | 'THM_ASC' | 'THM_DESC' | 'POPULARITE' | 'RECENT';

const RechercherExpertises: React.FC = () => {
  // États de recherche
  const [resultats, setResultats] = useState<ExpertResultat[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResultats, setTotalResultats] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Critères de recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPays, setSelectedPays] = useState<number | undefined>();
  const [selectedVille, setSelectedVille] = useState<number | undefined>();
  const [disponible, setDisponible] = useState<boolean | undefined>();
  const [experienceMin, setExperienceMin] = useState<number | undefined>();
  const [niveauMin, setNiveauMin] = useState<number | undefined>();
  const [thmMin, setThmMin] = useState<number | undefined>();
  const [thmMax, setThmMax] = useState<number | undefined>();
  const [certifieUniquement, setCertifieUniquement] = useState(false);
  const [niveauBadgeMin, setNiveauBadgeMin] = useState<string | undefined>();
  const [tri, setTri] = useState<TriOption>('SCORE');

  // Facettes et stats
  const [facettesPays, setFacettesPays] = useState<FacetteItem[]>([]);
  const [facettesVilles, setFacettesVilles] = useState<FacetteItem[]>([]);
  const [statistiques, setStatistiques] = useState<StatistiquesRecherche | null>(null);

  // UI
  const [vueAffichage, setVueAffichage] = useState<VueAffichage>('cartes');
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useHeaderConfig({});

  // Fonction de recherche
  const rechercherExperts = useCallback(async (nouvellePage = 0) => {
    try {
      setLoading(true);

      const request: RechercheRequest = {
        terme: searchTerm || undefined,
        paysId: selectedPays,
        villeId: selectedVille,
        disponible: disponible,
        anneesExperienceMin: experienceMin,
        niveauMaitriseMin: niveauMin,
        thmMin: thmMin,
        thmMax: thmMax,
        certifieUniquement: certifieUniquement || undefined,
        niveauBadgeMin: niveauBadgeMin,
        tri: tri,
        page: nouvellePage,
        taille: 20
      };

      // Nettoyer les undefined
      Object.keys(request).forEach(key => {
        if (request[key as keyof RechercheRequest] === undefined) {
          delete request[key as keyof RechercheRequest];
        }
      });

      const response = await fetch('/api/expertise/public/recherche-avancee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la recherche');
      }

      const data: RechercheResponse = await response.json();

      setResultats(data.resultats || []);
      setTotalResultats(data.totalResultats);
      setPage(data.page);
      setTotalPages(data.totalPages);

      if (data.facettesPays) setFacettesPays(data.facettesPays);
      if (data.facettesVilles) setFacettesVilles(data.facettesVilles);
      if (data.statistiques) setStatistiques(data.statistiques);

    } catch (error) {
      console.error('Erreur recherche:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la recherche' });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedPays, selectedVille, disponible, experienceMin, niveauMin, thmMin, thmMax, certifieUniquement, niveauBadgeMin, tri]);

  // Recherche initiale
  useEffect(() => {
    rechercherExperts(0);
  }, []);

  // Recherche avec debounce sur le terme
  useEffect(() => {
    const timer = setTimeout(() => {
      rechercherExperts(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedPays, selectedVille, disponible, experienceMin, niveauMin, thmMin, thmMax, certifieUniquement, niveauBadgeMin, tri]);

  // Réinitialiser les filtres
  const reinitialiserFiltres = () => {
    setSearchTerm('');
    setSelectedPays(undefined);
    setSelectedVille(undefined);
    setDisponible(undefined);
    setExperienceMin(undefined);
    setNiveauMin(undefined);
    setThmMin(undefined);
    setThmMax(undefined);
    setCertifieUniquement(false);
    setNiveauBadgeMin(undefined);
    setTri('SCORE');
  };

  // Compter les filtres actifs
  const nombreFiltresActifs = [
    selectedPays, selectedVille, disponible, experienceMin,
    niveauMin, thmMin, thmMax, certifieUniquement, niveauBadgeMin
  ].filter(v => v !== undefined && v !== false).length;

  // Grouper par compétence pour vue arbre
  const grouperParCompetence = (experts: ExpertResultat[]) => {
    const groupes: Record<string, ExpertResultat[]> = {};

    experts.forEach(expert => {
      const competences = expert.competencesPrincipales?.map(c => c.nom) || ['Sans compétence'];
      competences.forEach(competence => {
        if (!groupes[competence]) {
          groupes[competence] = [];
        }
        if (!groupes[competence].some(e => e.utilisateurId === expert.utilisateurId)) {
          groupes[competence].push(expert);
        }
      });
    });

    return groupes;
  };

  return (
    <div className="p-3 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Message de feedback */}
        {message && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-3 py-2`}>
            <span className="text-sm">{message.text}</span>
            <button onClick={() => setMessage(null)} className="btn btn-ghost btn-xs">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Barre de recherche principale */}
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-3 mb-4">
          <div className="flex flex-col gap-3">
            {/* Ligne 1: Recherche + Filtres + Vue */}
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Recherche textuelle */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                <input
                  type="text"
                  placeholder="Rechercher un expert, compétence, certification..."
                  className="input input-sm input-bordered w-full pl-9 h-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Bouton filtres avancés */}
              <button
                className={`btn btn-sm h-9 gap-1 ${filtresOuverts ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFiltresOuverts(!filtresOuverts)}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filtres</span>
                {nombreFiltresActifs > 0 && (
                  <span className="badge badge-sm badge-secondary">{nombreFiltresActifs}</span>
                )}
                {filtresOuverts ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {/* Tri */}
              <select
                className="select select-sm select-bordered h-9 w-full sm:w-44"
                value={tri}
                onChange={(e) => setTri(e.target.value as TriOption)}
              >
                <option value="SCORE">Meilleur score</option>
                <option value="PERTINENCE">Pertinence</option>
                <option value="EXPERIENCE">Expérience</option>
                <option value="THM_ASC">Tarif croissant</option>
                <option value="THM_DESC">Tarif décroissant</option>
                <option value="POPULARITE">Popularité</option>
                <option value="RECENT">Plus récents</option>
              </select>

              {/* Boutons de vue */}
              <div className="join hidden sm:flex">
                <button
                  className={`join-item btn btn-sm h-9 ${vueAffichage === 'liste' ? 'btn-active' : 'btn-ghost'}`}
                  onClick={() => setVueAffichage('liste')}
                  title="Vue liste"
                >
                  <LayoutList className="w-4 h-4" />
                </button>
                <button
                  className={`join-item btn btn-sm h-9 ${vueAffichage === 'cartes' ? 'btn-active' : 'btn-ghost'}`}
                  onClick={() => setVueAffichage('cartes')}
                  title="Vue cartes"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  className={`join-item btn btn-sm h-9 ${vueAffichage === 'arbre' ? 'btn-active' : 'btn-ghost'}`}
                  onClick={() => setVueAffichage('arbre')}
                  title="Vue par compétence"
                >
                  <GitBranch className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filtres avancés (dépliables) */}
            {filtresOuverts && (
              <div className="border-t border-base-200 pt-3 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {/* Pays */}
                  <select
                    className="select select-sm select-bordered w-full"
                    value={selectedPays || ''}
                    onChange={(e) => {
                      setSelectedPays(e.target.value ? Number(e.target.value) : undefined);
                      setSelectedVille(undefined);
                    }}
                  >
                    <option value="">Tous les pays</option>
                    {facettesPays.map(p => (
                      <option key={p.code} value={p.code}>
                        {p.libelle} ({p.count})
                      </option>
                    ))}
                  </select>

                  {/* Ville */}
                  <select
                    className="select select-sm select-bordered w-full"
                    value={selectedVille || ''}
                    onChange={(e) => setSelectedVille(e.target.value ? Number(e.target.value) : undefined)}
                  >
                    <option value="">Toutes les villes</option>
                    {facettesVilles.map(v => (
                      <option key={v.code} value={v.code}>
                        {v.libelle} ({v.count})
                      </option>
                    ))}
                  </select>

                  {/* Disponibilité */}
                  <select
                    className="select select-sm select-bordered w-full"
                    value={disponible === undefined ? '' : String(disponible)}
                    onChange={(e) => setDisponible(e.target.value === '' ? undefined : e.target.value === 'true')}
                  >
                    <option value="">Disponibilité</option>
                    <option value="true">Disponibles</option>
                    <option value="false">Indisponibles</option>
                  </select>

                  {/* Expérience min */}
                  <select
                    className="select select-sm select-bordered w-full"
                    value={experienceMin || ''}
                    onChange={(e) => setExperienceMin(e.target.value ? Number(e.target.value) : undefined)}
                  >
                    <option value="">Expérience</option>
                    <option value="1">1+ an</option>
                    <option value="3">3+ ans</option>
                    <option value="5">5+ ans</option>
                    <option value="10">10+ ans</option>
                  </select>

                  {/* Niveau maîtrise */}
                  <select
                    className="select select-sm select-bordered w-full"
                    value={niveauMin || ''}
                    onChange={(e) => setNiveauMin(e.target.value ? Number(e.target.value) : undefined)}
                  >
                    <option value="">Niveau</option>
                    <option value="3">Intermédiaire+</option>
                    <option value="4">Avancé+</option>
                    <option value="5">Expert</option>
                  </select>

                  {/* Badge minimum */}
                  <select
                    className="select select-sm select-bordered w-full"
                    value={niveauBadgeMin || ''}
                    onChange={(e) => setNiveauBadgeMin(e.target.value || undefined)}
                  >
                    <option value="">Certification</option>
                    <option value="BRONZE">Bronze+</option>
                    <option value="ARGENT">Argent+</option>
                    <option value="OR">Or+</option>
                    <option value="PLATINE">Platine</option>
                  </select>
                </div>

                {/* Ligne 2: Tarifs + Certifié uniquement + Reset */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-base-content/50" />
                    <input
                      type="number"
                      placeholder="THM min"
                      className="input input-sm input-bordered w-24"
                      value={thmMin || ''}
                      onChange={(e) => setThmMin(e.target.value ? Number(e.target.value) : undefined)}
                    />
                    <span className="text-xs text-base-content/50">-</span>
                    <input
                      type="number"
                      placeholder="THM max"
                      className="input input-sm input-bordered w-24"
                      value={thmMax || ''}
                      onChange={(e) => setThmMax(e.target.value ? Number(e.target.value) : undefined)}
                    />
                    <span className="text-xs text-base-content/50">FCFA/h</span>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm checkbox-primary"
                      checked={certifieUniquement}
                      onChange={(e) => setCertifieUniquement(e.target.checked)}
                    />
                    <span className="text-sm">Certifiés uniquement</span>
                  </label>

                  <button
                    className="btn btn-ghost btn-sm ml-auto"
                    onClick={reinitialiserFiltres}
                  >
                    <X className="w-3 h-3" />
                    Réinitialiser
                  </button>
                </div>
              </div>
            )}

            {/* Stats et compteur */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-base-content/60 border-t border-base-200 pt-2">
              <span className="font-medium text-base-content">
                {totalResultats} résultat{totalResultats > 1 ? 's' : ''}
              </span>
              {statistiques && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {statistiques.totalExpertsDisponibles} disponibles
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {statistiques.totalExpertsCertifies} certifiés
                  </span>
                  <span className="hidden lg:inline">•</span>
                  <span className="hidden lg:flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    THM moyen: {statistiques.thmMoyen.toLocaleString()} FCFA
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Résultats */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <span className="loading loading-spinner loading-md text-primary"></span>
          </div>
        ) : (
          <>
            {/* Vue Liste */}
            {vueAffichage === 'liste' && resultats.length > 0 && (
              <div className="bg-base-100 rounded-xl border border-base-200 overflow-hidden">
                <div className="divide-y divide-base-200">
                  {resultats.map((expert) => (
                    <Link
                      key={expert.utilisateurId}
                      to={`/expertise-profil/${expert.utilisateurId}`}
                      className="flex items-center gap-3 p-3 hover:bg-base-50 transition-colors"
                    >
                      <AvatarExpert utilisateurId={expert.utilisateurId} titre={expert.titre} taille="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{expert.titre}</span>
                          {expert.nombreBadges > 0 && (
                            <BadgeNiveau niveau={expert.niveauBadgeMax} />
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-base-content/60 mt-0.5">
                          {expert.villeNom && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {expert.villeNom}
                            </span>
                          )}
                          {expert.anneesExperienceMax > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {expert.anneesExperienceMax} ans
                            </span>
                          )}
                          {expert.nombreFollowers > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {expert.nombreFollowers}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                        {expert.thmMin && (
                          <span className="text-xs font-medium text-success">
                            {expert.thmMin.toLocaleString()}F/h
                          </span>
                        )}
                        <div className="flex items-center gap-1 text-xs text-base-content/50">
                          <Star className="w-3 h-3 text-warning" />
                          {expert.scoreGlobal?.toFixed(0) || 0}
                        </div>
                      </div>
                      {expert.disponible ? (
                        <span className="badge badge-success badge-xs flex-shrink-0">Dispo</span>
                      ) : (
                        <span className="badge badge-ghost badge-xs flex-shrink-0">Indispo</span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Vue Cartes */}
            {vueAffichage === 'cartes' && resultats.length > 0 && (
              <div
                className="gap-4"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gridAutoRows: 'auto auto auto',
                }}
              >
                {resultats.map((expert) => (
                  <Link
                    key={expert.utilisateurId}
                    to={`/expertise-profil/${expert.utilisateurId}`}
                    className="group bg-primary/5 rounded-xl border border-primary/20 shadow-sm hover:shadow-lg hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden p-4"
                    style={{
                      display: 'grid',
                      gridTemplateRows: 'subgrid',
                      gridRow: 'span 3',
                      gap: '12px',
                    }}
                  >
                    {/* Ligne 1: En-tête */}
                    <div className="flex gap-3 overflow-hidden">
                      <AvatarExpert utilisateurId={expert.utilisateurId} titre={expert.titre} taille="md" />
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-base-content line-clamp-1 group-hover:text-primary transition-colors">
                            {expert.titre}
                          </span>
                          {expert.nombreBadges > 0 && (
                            <BadgeNiveau niveau={expert.niveauBadgeMax} />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-base-content/70 mt-0.5">
                          {expert.villeNom && (
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              {expert.villeNom}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-warning flex-shrink-0" />
                            {expert.scoreGlobal?.toFixed(0) || 0}
                          </span>
                        </div>
                        <div className="mt-1">
                          {expert.disponible ? (
                            <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
                              <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span>
                              Disponible
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-base-content/60">
                              <span className="w-1.5 h-1.5 bg-base-content/40 rounded-full"></span>
                              Indisponible
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ligne 2: Stats */}
                    <div className="flex items-center gap-3 text-xs text-base-content/70">
                      {expert.anneesExperienceMax > 0 && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {expert.anneesExperienceMax} ans
                        </span>
                      )}
                      {expert.nombreProjets > 0 && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {expert.nombreProjets} projets
                        </span>
                      )}
                      {expert.nombreFollowers > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {expert.nombreFollowers}
                        </span>
                      )}
                      {expert.thmMin && (
                        <span className="ml-auto text-success font-semibold">
                          {expert.thmMin.toLocaleString()}F/h
                        </span>
                      )}
                    </div>

                    {/* Ligne 3: Compétences */}
                    <div className="space-y-1.5 overflow-hidden">
                      {expert.competencesPrincipales && expert.competencesPrincipales.length > 0 ? (
                        <>
                          {expert.competencesPrincipales.slice(0, 2).map((comp, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between bg-base-100/80 border border-base-300 rounded-lg px-2.5 py-1.5 min-w-0 overflow-hidden"
                            >
                              <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                                {comp.estCertifiee && (
                                  <Award className="w-3 h-3 text-warning flex-shrink-0" />
                                )}
                                <span className="text-xs font-medium text-base-content truncate">{comp.nom}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-base-content/70 flex-shrink-0 ml-2">
                                {comp.anneesExperience && <span>{comp.anneesExperience}a</span>}
                                {comp.thm && <span className="text-success font-semibold">{comp.thm.toLocaleString()}F/h</span>}
                              </div>
                            </div>
                          ))}
                          {expert.nombreCompetences > 2 && (
                            <div className="text-xs text-primary font-medium pl-1">
                              +{expert.nombreCompetences - 2} autre{expert.nombreCompetences > 3 ? 's' : ''}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-[52px] text-xs text-base-content/40 italic">
                          Aucune compétence listée
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Vue Arbre */}
            {vueAffichage === 'arbre' && resultats.length > 0 && (
              <div className="space-y-3">
                {Object.entries(grouperParCompetence(resultats)).map(([competence, experts]) => (
                  <div key={competence} className="bg-base-100 rounded-xl border border-base-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border-b border-base-200">
                      <GitBranch className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm text-base-content">{competence}</span>
                      <span className="ml-auto text-xs text-base-content/50">
                        {experts.length} expert{experts.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="divide-y divide-base-200">
                      {experts.map((expert) => (
                        <Link
                          key={expert.utilisateurId}
                          to={`/expertise-profil/${expert.utilisateurId}`}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-base-50 transition-colors"
                        >
                          <AvatarExpert utilisateurId={expert.utilisateurId} titre={expert.titre} taille="sm" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{expert.titre}</div>
                            {expert.villeNom && (
                              <div className="flex items-center gap-1 text-xs text-base-content/50">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{expert.villeNom}</span>
                              </div>
                            )}
                          </div>
                          {expert.disponible ? (
                            <span className="badge badge-success badge-xs flex-shrink-0">Dispo</span>
                          ) : (
                            <span className="badge badge-ghost badge-xs flex-shrink-0">Indispo</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* État vide */}
            {resultats.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-base-200 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-base-content/30" />
                </div>
                <p className="font-medium text-base-content/70 mb-1">Aucun expert trouvé</p>
                <p className="text-sm text-base-content/50">Essayez de modifier vos critères de recherche</p>
                {nombreFiltresActifs > 0 && (
                  <button
                    className="btn btn-primary btn-sm mt-4"
                    onClick={reinitialiserFiltres}
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="join">
                  <button
                    className="join-item btn btn-sm"
                    disabled={page === 0}
                    onClick={() => rechercherExperts(page - 1)}
                  >
                    «
                  </button>
                  <button className="join-item btn btn-sm">
                    Page {page + 1} / {totalPages}
                  </button>
                  <button
                    className="join-item btn btn-sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => rechercherExperts(page + 1)}
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
};

export default RechercherExpertises;
