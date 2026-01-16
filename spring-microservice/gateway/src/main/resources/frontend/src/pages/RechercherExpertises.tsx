import React, { useState, useEffect } from 'react';
import {
  Search, Users, MapPin, X,
  LayoutList, LayoutGrid, GitBranch
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

/**
 * Composant Avatar pour afficher la photo ou les initiales
 */
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

interface Expertise {
  utilisateurId: string;
  titre: string;
  description: string;
  photoUrl?: string;
  localisation?: string; // "Paris, France"
  disponible: boolean;
  typePersonne?: string;
  competences?: Array<{
    nom: string;
    description?: string;
    niveauMaitrise?: number;
    anneesExperience?: number;
    thm?: number;
    nombreProjets?: number;
    certifications?: string;
    estFavorite?: boolean;
  }>;
}

type VueAffichage = 'liste' | 'cartes' | 'arbre';

const RechercherExpertises: React.FC = () => {
  const [toutesLesExpertises, setToutesLesExpertises] = useState<Expertise[]>([]);
  const [expertises, setExpertises] = useState<Expertise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDisponibilite, setSelectedDisponibilite] = useState<string>('');
  const [vueAffichage, setVueAffichage] = useState<VueAffichage>('cartes');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Configurer le Header pour cette page
  useHeaderConfig({});

  // Charger les données initiales
  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      
      // Charger toutes les expertises publiées avec le endpoint public/experts
      const expertisesResponse = await fetch('/api/expertise/public/experts');
      const expertisesData = await expertisesResponse.json();
      
      const data = Array.isArray(expertisesData) ? expertisesData : [];
      setToutesLesExpertises(data);
      setExpertises(data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setToutesLesExpertises([]);
      setExpertises([]);
    } finally {
      setLoading(false);
    }
  };

  // Recherche et filtrage côté client
  const rechercherExpertises = () => {
    try {
      // Filtrer côté client car on a déjà toutes les données
      let resultats = [...toutesLesExpertises];
      
      // Filtre par terme de recherche
      if (searchTerm && searchTerm.trim()) {
        const terme = searchTerm.toLowerCase();
        resultats = resultats.filter(exp => {
          // Recherche dans titre, description, localisation
          const matchBasicFields = 
            exp.titre?.toLowerCase().includes(terme) ||
            exp.description?.toLowerCase().includes(terme) ||
            exp.localisation?.toLowerCase().includes(terme);
          
          // Recherche dans les compétences
          const matchCompetences = exp.competences?.some(comp => 
            comp.nom?.toLowerCase().includes(terme)
          );
          
          // Recherche dans les certifications
          const matchCertifications = exp.competences?.some(comp => 
            comp.certifications?.toLowerCase().includes(terme)
          );
          
          return matchBasicFields || matchCompetences || matchCertifications;
        });
      }
      
      // Filtre par disponibilité
      if (selectedDisponibilite) {
        const disponible = selectedDisponibilite === 'true';
        resultats = resultats.filter(exp => exp.disponible === disponible);
      }
      
      setExpertises(resultats);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    }
  };

  useEffect(() => {
    // Ne filtrer que si un filtre est actif (searchTerm ou selectedDisponibilite)
    if (searchTerm || selectedDisponibilite) {
      const timer = setTimeout(() => {
        rechercherExpertises();
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      // Si aucun filtre n'est actif, afficher toutes les expertises
      setExpertises(toutesLesExpertises);
    }
  }, [searchTerm, selectedDisponibilite, toutesLesExpertises]);

  // Grouper par compétence pour la vue arbre
  const grouperParCompetence = (expertises: Expertise[]) => {
    const groupes: Record<string, Expertise[]> = {};
    
    expertises.forEach(expertise => {
      const competences = expertise.competences?.map(c => c.nom) || ['Sans compétence'];
      competences.forEach(competence => {
        if (!groupes[competence]) {
          groupes[competence] = [];
        }
        if (!groupes[competence].some(e => e.utilisateurId === expertise.utilisateurId)) {
          groupes[competence].push(expertise);
        }
      });
    });
    
    return groupes;
  };

  // Rendu de l'arborescence par compétence
  const renderArborescence = () => {
    const groupes = grouperParCompetence(expertises);

    return Object.entries(groupes).map(([competence, exps]) => (
      <div key={competence} className="bg-base-100 rounded-xl border border-base-200 overflow-hidden">
        {/* En-tête du groupe */}
        <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border-b border-base-200">
          <GitBranch className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm text-base-content">{competence}</span>
          <span className="ml-auto text-xs text-base-content/50">{exps.length} expert{exps.length > 1 ? 's' : ''}</span>
        </div>
        {/* Liste des experts */}
        <div className="divide-y divide-base-200">
          {exps.map((exp, index) => (
            <Link
              key={`${exp.utilisateurId}-${index}`}
              to={`/expertise-profil/${exp.utilisateurId}`}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-base-50 transition-colors"
            >
              <AvatarExpert utilisateurId={exp.utilisateurId} titre={exp.titre} taille="sm" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{exp.titre}</div>
                {exp.localisation && (
                  <div className="flex items-center gap-1 text-xs text-base-content/50">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{exp.localisation}</span>
                  </div>
                )}
              </div>
              {exp.disponible ? (
                <span className="badge badge-success badge-xs flex-shrink-0">Dispo</span>
              ) : (
                <span className="badge badge-ghost badge-xs flex-shrink-0">Indispo</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    ));
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

        {/* Barre de recherche compacte */}
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-3 mb-4">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <input
                type="text"
                placeholder="Rechercher un expert, compétence, localisation..."
                className="input input-sm input-bordered w-full pl-9 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtre Disponibilité */}
            <select
              className="select select-sm select-bordered h-9 w-full sm:w-40"
              value={selectedDisponibilite}
              onChange={(e) => setSelectedDisponibilite(e.target.value)}
            >
              <option value="">Disponibilité</option>
              <option value="true">Disponibles</option>
              <option value="false">Indisponibles</option>
            </select>

            {/* Boutons de vue */}
            <div className="join">
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

          {/* Compteur de résultats */}
          {!loading && (
            <div className="mt-2 text-xs text-base-content/50">
              {expertises.length} résultat{expertises.length > 1 ? 's' : ''}
              {searchTerm && <span> pour "<span className="font-medium text-base-content/70">{searchTerm}</span>"</span>}
            </div>
          )}
        </div>

        {/* Affichage des expertises */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <span className="loading loading-spinner loading-md text-primary"></span>
          </div>
        ) : (
          <>
            {/* Vue Liste */}
            {vueAffichage === 'liste' && expertises.length > 0 && (
              <div className="bg-base-100 rounded-xl border border-base-200 overflow-hidden">
                <div className="divide-y divide-base-200">
                  {expertises.map((exp, index) => (
                    <Link
                      key={`${exp.utilisateurId}-${index}`}
                      to={`/expertise-profil/${exp.utilisateurId}`}
                      className="flex items-center gap-3 p-3 hover:bg-base-50 transition-colors"
                    >
                      <AvatarExpert utilisateurId={exp.utilisateurId} titre={exp.titre} taille="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{exp.titre}</div>
                        {exp.localisation && (
                          <div className="flex items-center gap-1 text-xs text-base-content/50">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{exp.localisation}</span>
                          </div>
                        )}
                      </div>
                      <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                        {exp.competences?.slice(0, 2).map((comp, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full truncate max-w-[80px]">
                            {comp.nom}
                          </span>
                        ))}
                        {(exp.competences?.length || 0) > 2 && (
                          <span className="text-xs text-base-content/40">+{(exp.competences?.length || 0) - 2}</span>
                        )}
                      </div>
                      {exp.disponible ? (
                        <span className="badge badge-success badge-xs flex-shrink-0">Dispo</span>
                      ) : (
                        <span className="badge badge-ghost badge-xs flex-shrink-0">Indispo</span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Vue Cartes avec Subgrid */}
            {vueAffichage === 'cartes' && expertises.length > 0 && (
              <div
                className="gap-4"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gridAutoRows: 'auto auto auto',
                }}
              >
                {expertises.map((exp, index) => (
                  <Link
                    key={`${exp.utilisateurId}-${index}`}
                    to={`/expertise-profil/${exp.utilisateurId}`}
                    className="group bg-primary/5 rounded-xl border border-primary/20 shadow-sm hover:shadow-lg hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden p-4"
                    style={{
                      display: 'grid',
                      gridTemplateRows: 'subgrid',
                      gridRow: 'span 3',
                      gap: '12px',
                    }}
                  >
                    {/* Ligne 1: En-tête (avatar, nom, localisation, disponibilité) */}
                    <div className="flex gap-3 overflow-hidden">
                      <AvatarExpert utilisateurId={exp.utilisateurId} titre={exp.titre} taille="md" />
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="font-semibold text-sm text-base-content line-clamp-2 group-hover:text-primary transition-colors">
                          {exp.titre}
                        </div>
                        {exp.localisation && (
                          <div className="flex items-center gap-1 text-xs text-base-content/70 mt-0.5 overflow-hidden">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{exp.localisation}</span>
                          </div>
                        )}
                        <div className="mt-1">
                          {exp.disponible ? (
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

                    {/* Ligne 2: Description */}
                    <div className="min-h-[40px]">
                      {exp.description ? (
                        <p className="text-xs text-base-content/70 line-clamp-2">{exp.description}</p>
                      ) : (
                        <p className="text-xs text-base-content/40 italic">Aucune description</p>
                      )}
                    </div>

                    {/* Ligne 3: Compétences */}
                    <div className="space-y-1.5 overflow-hidden">
                      {exp.competences && exp.competences.length > 0 ? (
                        <>
                          {exp.competences.slice(0, 2).map((comp, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between bg-base-100/80 border border-base-300 rounded-lg px-2.5 py-1.5 min-w-0 overflow-hidden"
                            >
                              <span className="text-xs font-medium text-base-content truncate min-w-0 flex-1">{comp.nom}</span>
                              <div className="flex items-center gap-2 text-xs text-base-content/70 flex-shrink-0 ml-2">
                                {comp.anneesExperience && <span>{comp.anneesExperience}a</span>}
                                {comp.thm && <span className="text-success font-semibold">{comp.thm.toLocaleString()}F/h</span>}
                              </div>
                            </div>
                          ))}
                          {exp.competences.length > 2 && (
                            <div className="text-xs text-primary font-medium pl-1">
                              +{exp.competences.length - 2} autre{exp.competences.length > 3 ? 's' : ''}
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

            {/* Vue Arborescence */}
            {vueAffichage === 'arbre' && expertises.length > 0 && (
              <div className="space-y-3">
                {renderArborescence()}
              </div>
            )}

            {/* État vide */}
            {expertises.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-base-200 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-base-content/30" />
                </div>
                <p className="font-medium text-base-content/70 mb-1">Aucun expert trouvé</p>
                <p className="text-sm text-base-content/50">Essayez de modifier vos critères de recherche</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RechercherExpertises;
