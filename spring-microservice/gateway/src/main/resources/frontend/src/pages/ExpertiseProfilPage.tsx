import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Mail, Briefcase, Award,
  ArrowLeft, User, Building2, CheckCircle2, XCircle, UserPlus, UserMinus,
  Share2, FileText
} from 'lucide-react';
import { useHeaderConfig } from '@/hooks/useHeaderConfig';
import { useAuth } from '@/context/AuthContext';
import { reconnaissanceService } from '@/services/reconnaissanceService';
import { BadgeCompetenceDTO, NiveauCertification } from '@/types/reconnaissance.types';
import { Expert } from '@/types/expert.types';
import ModalPartageExpert from '@/components/partage/ModalPartageExpert';
import ModalPropositionProjet from '@/components/proposition/ModalPropositionProjet';

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
    description?: string;
    niveauMaitrise?: number;
    anneesExperience?: number;
    thm?: number;
    nombreProjets?: number;
    certifications?: string;
    estFavorite?: boolean;
  }>;
}

interface UtilisateurPublic {
  id: string;
  nom: string;
  prenom: string;
  photoUrl?: string;
  typePersonne?: string;
  hasPhoto: boolean;
}

export default function ExpertiseProfilPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expertise, setExpertise] = useState<Expertise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estDansReseau, setEstDansReseau] = useState(false);
  const [loadingReseau, setLoadingReseau] = useState(false);
  const { isAuthenticated, openAuthModal } = useAuth();
  const [badgesPublics, setBadgesPublics] = useState<BadgeCompetenceDTO[]>([]);
  const [utilisateur, setUtilisateur] = useState<UtilisateurPublic | null>(null);
  const [photoError, setPhotoError] = useState(false);
  const [modalPartageOuvert, setModalPartageOuvert] = useState(false);
  const [modalPropositionOuvert, setModalPropositionOuvert] = useState(false);

  // Configurer le Header
  useHeaderConfig({});

  useEffect(() => {
    if (id) {
      chargerExpertise();
      chargerUtilisateur();
      verifierSiDansReseau();
      chargerBadgesPublics();
    }
  }, [id]);

  // Charger les informations publiques de l'utilisateur (nom, prénom, hasPhoto)
  const chargerUtilisateur = async () => {
    try {
      const response = await fetch(`/api/profil/public/${id}`);
      if (response.ok) {
        const data = await response.json();
        setUtilisateur(data);
      }
    } catch (err) {
      console.error('Erreur chargement utilisateur:', err);
    }
  };

  // Générer les initiales à partir du nom et prénom
  const genererInitiales = (): string => {
    if (utilisateur) {
      const initialeNom = utilisateur.nom?.charAt(0)?.toUpperCase() || '';
      const initialePrenom = utilisateur.prenom?.charAt(0)?.toUpperCase() || '';
      if (initialeNom || initialePrenom) {
        return `${initialePrenom}${initialeNom}`;
      }
    }
    // Fallback sur le titre de l'expertise
    return expertise?.titre?.charAt(0)?.toUpperCase() || '?';
  };

  // Convertir l'Expertise en Expert pour les modals
  const convertirEnExpert = (): Expert | null => {
    if (!expertise || !utilisateur) return null;

    return {
      id: expertise.utilisateurId,
      nom: utilisateur.nom || '',
      prenom: utilisateur.prenom || '',
      titre: expertise.titre,
      photoUrl: utilisateur.hasPhoto ? `/api/profil/public/${id}/photo` : '',
      rating: 0,
      nombreProjets: 0,
      description: expertise.description || '',
      competences: expertise.competences?.map(c => ({
        nom: c.nom,
        favorite: c.estFavorite || false,
        anneesExperience: c.anneesExperience,
        thm: c.thm,
        nombreProjets: c.nombreProjets,
        certifications: c.certifications,
        niveauMaitrise: c.niveauMaitrise
      })) || [],
      experienceAnnees: 0,
      tjmMin: 0,
      tjmMax: 0,
      localisation: expertise.localisation || '',
      disponible: expertise.disponible
    };
  };

  // Ouvrir le modal de partage
  const ouvrirModalPartage = () => {
    setModalPartageOuvert(true);
  };

  // Ouvrir le modal de proposition
  const ouvrirModalProposition = () => {
    if (!isAuthenticated) {
      const currentUrl = window.location.pathname + window.location.search;
      openAuthModal(currentUrl);
      return;
    }
    setModalPropositionOuvert(true);
  };

  // Re-vérifier le statut réseau quand l'authentification change
  useEffect(() => {
    if (isAuthenticated && id) {
      verifierSiDansReseau();
    }
  }, [isAuthenticated, id]);

  // Vérifier si l'expert est dans le réseau
  const verifierSiDansReseau = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch(`/api/expertise/reseau/${id}/est-dans-reseau`);
      if (response.ok) {
        const data = await response.json();
        setEstDansReseau(data.estDansReseau);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du réseau:', error);
    }
  };

  // Ajouter un expert au réseau
  const ajouterAuReseau = async () => {
    if (!isAuthenticated) {
      // Passer l'URL complète pour la redirection après connexion
      const currentUrl = window.location.pathname + window.location.search;
      console.log('🔒 [EXPERTISE PROFIL] Authentification requise, URL sauvegardée:', currentUrl);
      openAuthModal(currentUrl);
      return;
    }
    
    try {
      setLoadingReseau(true);
      const response = await fetch(`/api/expertise/reseau/${id}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setEstDansReseau(true);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout au réseau:', error);
    } finally {
      setLoadingReseau(false);
    }
  };

  // Retirer un expert du réseau
  const retirerDuReseau = async () => {
    try {
      setLoadingReseau(true);
      const response = await fetch(`/api/expertise/reseau/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setEstDansReseau(false);
      }
    } catch (error) {
      console.error('Erreur lors du retrait du réseau:', error);
    } finally {
      setLoadingReseau(false);
    }
  };

  // Toggle réseau
  const toggleReseau = () => {
    if (estDansReseau) {
      retirerDuReseau();
    } else {
      ajouterAuReseau();
    }
  };

  const chargerBadgesPublics = async () => {
    try {
      const badges = await reconnaissanceService.getBadgesExpert(id!);
      // Filtrer uniquement les badges publics
      setBadgesPublics(badges.filter((b: BadgeCompetenceDTO) => b.estPublic));
    } catch (err) {
      console.error('Erreur chargement badges:', err);
    }
  };

  // Trouver le badge associé à une compétence
  const getBadgeForCompetence = (competenceNom: string) => {
    return badgesPublics.find(b => b.competenceNom.toLowerCase() === competenceNom.toLowerCase());
  };

  const BADGE_ICONS: Record<NiveauCertification, string> = {
    [NiveauCertification.BRONZE]: '🥉',
    [NiveauCertification.ARGENT]: '🥈',
    [NiveauCertification.OR]: '🥇',
    [NiveauCertification.PLATINE]: '💎',
  };

  const BADGE_COLORS: Record<NiveauCertification, string> = {
    [NiveauCertification.BRONZE]: 'from-orange-300 to-orange-600',
    [NiveauCertification.ARGENT]: 'from-gray-300 to-gray-500',
    [NiveauCertification.OR]: 'from-yellow-400 to-yellow-600',
    [NiveauCertification.PLATINE]: 'from-purple-400 to-pink-600',
  };

  const chargerExpertise = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/expertise/public/experts`);
      const data = await response.json();
      
      // Trouver l'expertise correspondant à l'ID
      const expertiseTrouvee = Array.isArray(data) 
        ? data.find((exp: Expertise) => exp.utilisateurId === id)
        : null;
      
      if (expertiseTrouvee) {
        setExpertise(expertiseTrouvee);
      } else {
        setError('Expertise non trouvée');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'expertise:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error || !expertise) {
    return (
      <div className="p-8">
        <div className="alert alert-error">
          <span>{error || 'Expertise non trouvée'}</span>
        </div>
        <button 
          onClick={() => navigate('/rechercher')} 
          className="btn btn-primary mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la recherche
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Bouton retour */}
      <button 
        onClick={() => navigate('/rechercher')} 
        className="btn btn-ghost btn-sm mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour à la recherche
      </button>

      {/* En-tête du profil */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Photo/Avatar */}
            <div className="avatar">
              <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                {utilisateur?.hasPhoto && !photoError ? (
                  <img
                    src={`/api/profil/public/${id}/photo`}
                    alt={expertise.titre}
                    onError={() => setPhotoError(true)}
                  />
                ) : (
                  <div className="bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-4xl w-full h-full">
                    {genererInitiales()}
                  </div>
                )}
              </div>
            </div>

            {/* Informations principales */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{expertise.titre}</h1>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    {expertise.typePersonne === 'MORALE' ? (
                      <Building2 className="w-5 h-5" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                    <span className="text-sm">
                      {expertise.typePersonne === 'MORALE' ? 'Personne Morale' : 'Personne Physique'}
                    </span>
                  </div>
                  {expertise.localisation && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-5 h-5" />
                      <span>{expertise.localisation}</span>
                    </div>
                  )}
                </div>
                
                {/* Badge disponibilité */}
                <div>
                  {expertise.disponible ? (
                    <div className="badge badge-success badge-lg gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Disponible
                    </div>
                  ) : (
                    <div className="badge badge-ghost badge-lg gap-2">
                      <XCircle className="w-4 h-4" />
                      Non disponible
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {expertise.description && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">À propos</h3>
                  <p className="text-gray-700">{expertise.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-base-300">
            <button
              onClick={toggleReseau}
              className={`btn ${estDansReseau ? 'btn-outline btn-error' : 'btn-primary'} gap-2`}
              disabled={loadingReseau}
            >
              {loadingReseau ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : estDansReseau ? (
                <>
                  <UserMinus className="w-5 h-5" />
                  Retirer du réseau
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Ajouter au réseau
                </>
              )}
            </button>

            {/* Bouton Partager */}
            <button
              onClick={ouvrirModalPartage}
              className="btn btn-outline btn-info gap-2"
            >
              <Share2 className="w-5 h-5" />
              Partager
            </button>

            {/* Bouton Proposer un projet */}
            <button
              onClick={ouvrirModalProposition}
              className="btn btn-secondary gap-2"
            >
              <FileText className="w-5 h-5" />
              Proposer un projet
            </button>

            {expertise.disponible && (
              <button className="btn btn-success gap-2">
                <Mail className="w-5 h-5" />
                Contacter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Section Compétences */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-6">
            <Briefcase className="w-6 h-6" />
            Compétences & Expertises
          </h2>

          {expertise.competences && expertise.competences.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expertise.competences.map((comp, idx) => {
                const badge = getBadgeForCompetence(comp.nom);
                return (
                  <div 
                    key={`${comp.nom}-${idx}`}
                    className={`card bg-base-200 border-2 transition-all relative ${
                      badge ? 'border-primary/40 shadow-lg' : 'border-primary/20 hover:border-primary/40'
                    }`}
                  >
                    {/* Badge de certification en coin supérieur droit */}
                    {badge && (
                      <div className="absolute -top-3 -right-3 z-10">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${BADGE_COLORS[badge.niveauCertification]} flex items-center justify-center shadow-xl border-4 border-white`}>
                          <span className="text-3xl">{BADGE_ICONS[badge.niveauCertification]}</span>
                        </div>
                      </div>
                    )}

                    <div className="card-body p-4">
                      {/* Nom de la compétence */}
                      <div className="mb-3">
                        <h3 className="card-title text-lg text-primary mb-2">
                          {comp.nom}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {badge && (
                            <span className="badge badge-success badge-sm gap-1">
                              <Award className="w-3 h-3" />
                              Certifiée {badge.niveauCertification}
                            </span>
                          )}
                          {comp.estFavorite && (
                            <span className="badge badge-warning badge-sm">⭐ Favorite</span>
                          )}
                        </div>
                      </div>

                    {/* Description */}
                    {comp.description && (
                      <p className="text-sm text-gray-600 mb-3">{comp.description}</p>
                    )}

                    {/* Métriques en grille */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {comp.anneesExperience !== undefined && (
                        <div className="bg-base-100 p-3 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">Expérience</div>
                          <div className="text-lg font-bold text-primary">
                            {comp.anneesExperience} {comp.anneesExperience > 1 ? 'ans' : 'an'}
                          </div>
                        </div>
                      )}
                      
                      {comp.thm !== undefined && (
                        <div className="bg-base-100 p-3 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">THM</div>
                          <div className="text-lg font-bold text-success">
                            {comp.thm} <span className="text-sm">FCFA/h</span>
                          </div>
                        </div>
                      )}
                      
                      {comp.nombreProjets !== undefined && (
                        <div className="bg-base-100 p-3 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">Projets</div>
                          <div className="text-lg font-bold text-secondary">
                            {comp.nombreProjets}
                          </div>
                        </div>
                      )}
                      
                      {comp.niveauMaitrise !== undefined && (
                        <div className="bg-base-100 p-3 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">Maîtrise</div>
                          <div className="flex items-center gap-1">
                            <div className="text-lg font-bold text-accent">
                              {comp.niveauMaitrise}/5
                            </div>
                            <div className="rating rating-sm">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <input
                                  key={star}
                                  type="radio"
                                  className="mask mask-star-2 bg-accent"
                                  checked={star === comp.niveauMaitrise}
                                  readOnly
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Certifications */}
                    {comp.certifications && (
                      <div className="mt-3 pt-3 border-t border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-4 h-4 text-accent" />
                          <span className="text-sm font-semibold">Certification:</span>
                        </div>
                        <div className="bg-accent/10 p-2 rounded-lg">
                          <p className="text-sm text-accent-content break-words">{comp.certifications}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Aucune compétence renseignée</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Partage */}
      {convertirEnExpert() && (
        <ModalPartageExpert
          expert={convertirEnExpert()!}
          isOpen={modalPartageOuvert}
          onClose={() => setModalPartageOuvert(false)}
        />
      )}

      {/* Modal Proposition de projet */}
      {convertirEnExpert() && (
        <ModalPropositionProjet
          expert={convertirEnExpert()!}
          isOpen={modalPropositionOuvert}
          onClose={() => setModalPropositionOuvert(false)}
        />
      )}
    </div>
  );
}
