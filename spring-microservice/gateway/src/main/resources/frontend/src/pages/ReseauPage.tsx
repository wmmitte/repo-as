import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, CheckCircle2, XCircle, UserMinus, Users, Search, ExternalLink, Briefcase, Filter, UserCheck, UserX } from 'lucide-react';
import { useHeaderConfig } from '@/hooks/useHeaderConfig';

interface Expertise {
  utilisateurId: string;
  titre: string;
  description: string;
  photoUrl?: string;
  localisation?: string;
  disponible: boolean;
  typePersonne?: string;
  competences?: Array<{
    nom: string;
    niveauMaitrise?: number;
  }>;
}

type FiltreDisponibilite = 'tous' | 'disponibles' | 'indisponibles';

export default function ReseauPage() {
  const [expertsReseau, setExpertsReseau] = useState<Expertise[]>([]);
  const [loading, setLoading] = useState(true);
  const [retirantId, setRetirantId] = useState<string | null>(null);
  const [recherche, setRecherche] = useState('');
  const [filtreDisponibilite, setFiltreDisponibilite] = useState<FiltreDisponibilite>('tous');

  useHeaderConfig({
    title: "Mon réseau",
  });

  useEffect(() => {
    chargerExpertsReseau();
  }, []);

  const chargerExpertsReseau = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/expertise/reseau');

      if (response.ok) {
        const data = await response.json();
        setExpertsReseau(Array.isArray(data) ? data : []);
      } else {
        setExpertsReseau([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des experts du réseau:', error);
      setExpertsReseau([]);
    } finally {
      setLoading(false);
    }
  };

  const retirerDuReseau = async (utilisateurId: string) => {
    try {
      setRetirantId(utilisateurId);
      const response = await fetch(`/api/expertise/reseau/${utilisateurId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setExpertsReseau(prev => prev.filter(exp => exp.utilisateurId !== utilisateurId));
      }
    } catch (error) {
      console.error('Erreur lors du retrait de l\'expert du réseau:', error);
    } finally {
      setRetirantId(null);
    }
  };

  // Statistiques
  const stats = useMemo(() => {
    const disponibles = expertsReseau.filter(e => e.disponible).length;
    return {
      total: expertsReseau.length,
      disponibles,
      indisponibles: expertsReseau.length - disponibles
    };
  }, [expertsReseau]);

  // Filtrage des experts
  const expertsFiltres = useMemo(() => {
    return expertsReseau.filter(expert => {
      // Filtre par recherche
      const matchRecherche = recherche === '' ||
        expert.titre.toLowerCase().includes(recherche.toLowerCase()) ||
        expert.description?.toLowerCase().includes(recherche.toLowerCase()) ||
        expert.localisation?.toLowerCase().includes(recherche.toLowerCase()) ||
        expert.competences?.some(c => c.nom.toLowerCase().includes(recherche.toLowerCase()));

      // Filtre par disponibilité
      const matchDisponibilite =
        filtreDisponibilite === 'tous' ||
        (filtreDisponibilite === 'disponibles' && expert.disponible) ||
        (filtreDisponibilite === 'indisponibles' && !expert.disponible);

      return matchRecherche && matchDisponibilite;
    });
  }, [expertsReseau, recherche, filtreDisponibilite]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 flex justify-center items-center min-h-96">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Header compact */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg px-4 py-2.5 border border-primary/20">
          <div className="flex items-center justify-between gap-3">
            {/* Titre et description */}
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-base font-bold text-base-content">Mon Réseau</h1>
                <p className="text-[11px] text-base-content/60">
                  {expertsReseau.length === 0
                    ? 'Construisez votre réseau d\'experts'
                    : 'Vos experts favoris'}
                </p>
              </div>
            </div>

            {/* Statistiques compactes */}
            {expertsReseau.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1 bg-base-100 rounded-md border border-base-200">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold">{stats.total}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-success/10 rounded-md border border-success/20">
                  <UserCheck className="w-3.5 h-3.5 text-success" />
                  <span className="text-xs font-semibold text-success">{stats.disponibles}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {expertsReseau.length === 0 ? (
          /* État vide amélioré */
          <div className="text-center py-12 px-4">
            <div className="w-20 h-20 mx-auto mb-4 bg-base-200 rounded-full flex items-center justify-center">
              <Users className="w-10 h-10 text-base-content/30" />
            </div>
            <h3 className="text-lg font-semibold text-base-content mb-2">
              Votre réseau est vide
            </h3>
            <p className="text-sm text-base-content/60 mb-6 max-w-sm mx-auto">
              Ajoutez des experts à votre réseau pour les retrouver facilement et suivre leur activité
            </p>
            <Link to="/rechercher" className="btn btn-primary btn-sm gap-2">
              <Search className="w-4 h-4" />
              Découvrir des experts
            </Link>
          </div>
        ) : (
          <>
            {/* Barre de filtres */}
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              {/* Recherche */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, compétence, lieu..."
                  className="input input-bordered input-sm w-full pl-9 pr-4"
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                />
                {recherche && (
                  <button
                    onClick={() => setRecherche('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filtres de disponibilité */}
              <div className="flex items-center gap-1 bg-base-200/50 p-1 rounded-lg">
                <button
                  onClick={() => setFiltreDisponibilite('tous')}
                  className={`btn btn-xs gap-1 ${filtreDisponibilite === 'tous' ? 'btn-primary' : 'btn-ghost'}`}
                >
                  <Filter className="w-3 h-3" />
                  Tous
                </button>
                <button
                  onClick={() => setFiltreDisponibilite('disponibles')}
                  className={`btn btn-xs gap-1 ${filtreDisponibilite === 'disponibles' ? 'btn-success' : 'btn-ghost'}`}
                >
                  <UserCheck className="w-3 h-3" />
                  <span className="hidden sm:inline">Disponibles</span>
                  <span className="sm:hidden">Dispo</span>
                </button>
                <button
                  onClick={() => setFiltreDisponibilite('indisponibles')}
                  className={`btn btn-xs gap-1 ${filtreDisponibilite === 'indisponibles' ? 'btn-neutral' : 'btn-ghost'}`}
                >
                  <UserX className="w-3 h-3" />
                  <span className="hidden sm:inline">Indisponibles</span>
                  <span className="sm:hidden">Indispo</span>
                </button>
              </div>
            </div>

            {/* Résultats du filtre */}
            {expertsFiltres.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-10 h-10 text-base-content/20 mx-auto mb-3" />
                <p className="text-sm text-base-content/60">
                  Aucun expert ne correspond à vos critères
                </p>
                <button
                  onClick={() => { setRecherche(''); setFiltreDisponibilite('tous'); }}
                  className="btn btn-ghost btn-sm mt-2"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <>
                {/* Indicateur de résultats filtrés */}
                {(recherche || filtreDisponibilite !== 'tous') && (
                  <p className="text-xs text-base-content/60">
                    {expertsFiltres.length} résultat{expertsFiltres.length > 1 ? 's' : ''} sur {expertsReseau.length}
                  </p>
                )}

                {/* Liste des experts - 4 colonnes sur grand écran */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {expertsFiltres.map((expert) => (
                    <div
                      key={expert.utilisateurId}
                      className="group bg-primary/5 rounded-xl border border-primary/20 shadow-sm hover:shadow-lg hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                    >
                      {/* Contenu de la card */}
                      <div className="p-4">
                        {/* En-tête avec avatar et infos */}
                        <div className="flex gap-3">
                          {/* Avatar */}
                          <Link
                            to={`/expertise-profil/${expert.utilisateurId}`}
                            className="flex-shrink-0"
                          >
                            <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                              {expert.photoUrl ? (
                                <img
                                  src={expert.photoUrl}
                                  alt={expert.titre}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                                  {expert.titre.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                          </Link>

                          {/* Infos principales */}
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/expertise-profil/${expert.utilisateurId}`}
                              className="block font-semibold text-sm text-base-content hover:text-primary transition-colors truncate"
                              title={expert.titre}
                            >
                              {expert.titre}
                            </Link>

                            {/* Localisation */}
                            {expert.localisation && (
                              <p className="flex items-center gap-1 text-xs text-base-content/70 mt-0.5 truncate">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{expert.localisation}</span>
                              </p>
                            )}

                            {/* Badge disponibilité */}
                            <div className="mt-1.5">
                              {expert.disponible ? (
                                <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Disponible
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-base-content/60">
                                  <XCircle className="w-3 h-3" />
                                  Indisponible
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Description courte */}
                        {expert.description && (
                          <p className="text-xs text-base-content/70 mt-3 line-clamp-2">
                            {expert.description}
                          </p>
                        )}

                        {/* Compétences */}
                        {expert.competences && expert.competences.length > 0 && (
                          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                            <Briefcase className="w-3 h-3 text-primary/60 flex-shrink-0" />
                            {expert.competences.slice(0, 2).map((comp, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-base-100/80 border border-base-300 text-base-content text-xs rounded-full truncate max-w-[100px]"
                                title={comp.nom}
                              >
                                {comp.nom}
                              </span>
                            ))}
                            {expert.competences.length > 2 && (
                              <span className="text-xs text-primary font-medium">
                                +{expert.competences.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="px-4 py-2.5 bg-base-100/60 border-t border-primary/10 flex items-center gap-2">
                        <Link
                          to={`/expertise-profil/${expert.utilisateurId}`}
                          className="btn btn-sm btn-ghost flex-1 gap-1 text-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Voir le profil
                        </Link>
                        <div className="tooltip tooltip-left" data-tip="Retirer du réseau">
                          <button
                            onClick={() => retirerDuReseau(expert.utilisateurId)}
                            className="btn btn-sm btn-ghost text-error hover:bg-error/10"
                            disabled={retirantId === expert.utilisateurId}
                          >
                            {retirantId === expert.utilisateurId ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              <UserMinus className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
