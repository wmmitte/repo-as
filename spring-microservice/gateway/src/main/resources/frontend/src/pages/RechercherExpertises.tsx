import React, { useState, useEffect } from 'react';
import {
  Search, Users, MapPin, X,
  LayoutList, LayoutGrid, GitBranch, Award
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

  // URL de la photo via le service profil
  const photoUrl = `/api/profil/public/${utilisateurId}/photo`;

  if (!photoError) {
    return (
      <div className="avatar">
        <div className={`${tailleClasses[taille]} rounded-full ring ring-primary ring-offset-base-100 ring-offset-1`}>
          <img
            src={photoUrl}
            alt={titre}
            className="object-cover"
            onError={() => setPhotoError(true)}
          />
        </div>
      </div>
    );
  }

  // Afficher les initiales si la photo n'est pas disponible
  return (
    <div className="avatar placeholder">
      <div className={`${getCouleurAvatar(titre)} text-white rounded-full ${tailleClasses[taille]} flex items-center justify-center font-semibold`}>
        <span>{getInitiales(titre)}</span>
      </div>
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
      <div key={competence} className="mb-4">
        <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg font-semibold text-primary-900 mb-2">
          <GitBranch className="w-5 h-5" />
          <span>{competence}</span>
          <span className="badge badge-primary badge-sm ml-auto">{exps.length}</span>
        </div>
        <div className="ml-6 space-y-2">
          {exps.map((exp, index) => (
            <Link
              key={`${exp.utilisateurId}-${index}`}
              to={`/expertise-profil/${exp.utilisateurId}`}
              className="flex items-center gap-3 p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
            >
              <AvatarExpert utilisateurId={exp.utilisateurId} titre={exp.titre} taille="sm" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{exp.titre}</div>
                {exp.localisation && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{exp.localisation}</span>
                  </div>
                )}
              </div>
              {exp.disponible && (
                <span className="badge badge-success badge-sm flex-shrink-0">Disponible</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Message de feedback */}
        {message && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-4`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="btn btn-ghost btn-sm">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Barre de recherche et filtres */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
              <div className="flex flex-col md:flex-row gap-4">
              {/* Recherche */}
              <div className="flex-1">
                <div className="form-control">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Rechercher par titre, compétence, certification, localisation..."
                      className="input input-bordered w-full pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Filtre Disponibilité */}
              <div className="form-control w-full md:w-48">
                <select
                  className="select select-bordered"
                  value={selectedDisponibilite}
                  onChange={(e) => setSelectedDisponibilite(e.target.value)}
                >
                  <option value="">Toutes</option>
                  <option value="true">Disponibles</option>
                  <option value="false">Non disponibles</option>
                </select>
              </div>

              {/* Boutons de vue */}
              <div className="btn-group">
                <button
                  className={`btn ${vueAffichage === 'liste' ? 'btn-active' : ''}`}
                  onClick={() => setVueAffichage('liste')}
                  title="Vue liste"
                >
                  <LayoutList className="w-5 h-5" />
                </button>
                <button
                  className={`btn ${vueAffichage === 'cartes' ? 'btn-active' : ''}`}
                  onClick={() => setVueAffichage('cartes')}
                  title="Vue cartes"
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  className={`btn ${vueAffichage === 'arbre' ? 'btn-active' : ''}`}
                  onClick={() => setVueAffichage('arbre')}
                  title="Vue par domaine"
                >
                  <GitBranch className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Affichage des expertises */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              {vueAffichage === 'liste' && (
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr>
                        <th>Expertise</th>
                        <th>Localisation</th>
                        <th>Compétences</th>
                        <th>Disponibilité</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expertises.map((exp, index) => (
                        <tr key={`${exp.utilisateurId}-${index}`}>
                          <td>
                            <Link to={`/expertise-profil/${exp.utilisateurId}`} className="hover:text-primary">
                              <div className="flex items-center gap-3">
                                <AvatarExpert utilisateurId={exp.utilisateurId} titre={exp.titre} taille="md" />
                                <div>
                                  <div className="font-bold">{exp.titre}</div>
                                  <div className="text-sm text-gray-500">{exp.typePersonne || 'Expert'}</div>
                                </div>
                              </div>
                            </Link>
                          </td>
                          <td>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span>{exp.localisation || 'Non spécifiée'}</span>
                            </div>
                          </td>
                          <td>
                            <div className="flex flex-wrap gap-1">
                              {exp.competences?.slice(0, 2).map((comp, idx) => (
                                <span 
                                  key={`${comp.nom}-${idx}`} 
                                  className="badge badge-primary badge-sm gap-1 whitespace-nowrap max-w-[200px]"
                                  title={comp.nom + (comp.anneesExperience ? ` (Exp.: ${comp.anneesExperience} ans)` : '')}
                                >
                                  <span className="truncate">{comp.nom}</span>
                                  {comp.anneesExperience && (
                                    <span className="opacity-75 flex-shrink-0">(Exp.: {comp.anneesExperience} ans)</span>
                                  )}
                                </span>
                              ))}
                              {(exp.competences?.length || 0) > 2 && (
                                <span className="badge badge-ghost badge-sm">
                                  +{(exp.competences?.length || 0) - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            {exp.disponible ? (
                              <span className="badge badge-success">Disponible</span>
                            ) : (
                              <span className="badge badge-ghost">Non disponible</span>
                            )}
                          </td>
                          <td>
                            <Link to={`/expertise-profil/${exp.utilisateurId}`} className="btn btn-primary btn-sm">
                              Voir profil
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {vueAffichage === 'cartes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {expertises.map((exp, index) => (
                    <div
                      key={`${exp.utilisateurId}-${index}`}
                      className="card bg-base-100 shadow-lg hover:shadow-xl transition-all border border-base-300"
                    >
                      <div className="card-body p-4">
                        {/* En-tête avec avatar, titre et localisation */}
                        <div className="flex items-start gap-3 mb-3 pb-3 border-b border-base-300">
                          <AvatarExpert utilisateurId={exp.utilisateurId} titre={exp.titre} taille="lg" />
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/expertise-profil/${exp.utilisateurId}`}
                              className="card-title text-base font-bold hover:text-primary transition-colors truncate block"
                            >
                              {exp.titre}
                            </Link>
                            {exp.localisation && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{exp.localisation}</span>
                              </div>
                            )}
                          </div>
                          {exp.disponible && (
                            <span className="badge badge-success badge-sm flex-shrink-0">
                              Disponible
                            </span>
                          )}
                        </div>

                        {/* Liste des compétences avec détails */}
                        <div className="space-y-3">
                          <div className="text-xs font-semibold text-gray-600 uppercase">Compétences</div>
                          {exp.competences && exp.competences.length > 0 ? (
                            <div className="space-y-2">
                              {exp.competences.slice(0, 3).map((comp, idx) => (
                                <div 
                                  key={`${comp.nom}-${idx}`}
                                  className="bg-base-200 p-3 rounded-lg border-2 border-primary/20 hover:border-primary/40 transition-colors"
                                >
                                  <div className="font-medium text-sm text-primary mb-2">{comp.nom}</div>
                                  <div className="grid grid-cols-3 gap-2 text-xs">
                                    {comp.anneesExperience && (
                                      <div className="flex flex-col">
                                        <span className="text-gray-500">Expérience</span>
                                        <span className="font-semibold">{comp.anneesExperience} ans</span>
                                      </div>
                                    )}
                                    {comp.thm && (
                                      <div className="flex flex-col">
                                        <span className="text-gray-500">THM</span>
                                        <span className="font-semibold">{comp.thm} FCFA/h</span>
                                      </div>
                                    )}
                                    {comp.nombreProjets && (
                                      <div className="flex flex-col">
                                        <span className="text-gray-500">Projets</span>
                                        <span className="font-semibold">{comp.nombreProjets}</span>
                                      </div>
                                    )}
                                  </div>
                                  {comp.certifications && (
                                    <div className="mt-2 pt-2 border-t border-primary/20">
                                      <div className="flex items-center gap-1">
                                        <Award className="w-3 h-3 text-accent" />
                                        <span className="text-xs text-gray-600">{comp.certifications}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                              {exp.competences.length > 3 && (
                                <Link
                                  to={`/expertise-profil/${exp.utilisateurId}`}
                                  className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                                >
                                  Voir {exp.competences.length - 3} compétence(s) supplémentaire(s)
                                </Link>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 italic">Aucune compétence renseignée</p>
                          )}
                        </div>

                        {/* Footer avec bouton */}
                        <div className="mt-4 pt-3 border-t border-base-300">
                          <Link
                            to={`/expertise-profil/${exp.utilisateurId}`}
                            className="btn btn-primary btn-sm w-full"
                          >
                            Voir le profil complet
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {vueAffichage === 'arbre' && (
                <div className="space-y-4">
                  {renderArborescence()}
                </div>
              )}

              {expertises.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Aucune expertise trouvée</p>
                  <p className="text-sm">Essayez de modifier vos critères de recherche</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RechercherExpertises;
