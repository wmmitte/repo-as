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
import ModalContact from '@/components/contact/ModalContact';
import ModalDetailsCompetence, { CompetencePublic } from '@/components/competence/ModalDetailsCompetence';

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
  const [modalContactOuvert, setModalContactOuvert] = useState(false);
  const [modalCompetenceOuvert, setModalCompetenceOuvert] = useState(false);
  const [competenceSelectionnee, setCompetenceSelectionnee] = useState<CompetencePublic | null>(null);

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
      const response = await fetch(`/api/profil/public/${id}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUtilisateur(data);
      } else {
        console.warn('Utilisateur public non trouvé:', response.status);
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
    if (!expertise) return null;

    return {
      id: expertise.utilisateurId,
      nom: utilisateur?.nom || '',
      prenom: utilisateur?.prenom || '',
      titre: expertise.titre,
      photoUrl: utilisateur?.hasPhoto ? `/api/profil/public/${id}/photo` : '',
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

  // Ouvrir le modal de contact
  const ouvrirModalContact = () => {
    if (!isAuthenticated) {
      const currentUrl = window.location.pathname + window.location.search;
      openAuthModal(currentUrl);
      return;
    }
    setModalContactOuvert(true);
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
      const response = await fetch(`/api/expertise/reseau/${id}/est-dans-reseau`, {
        credentials: 'include'
      });
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
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setEstDansReseau(true);
      } else if (response.status === 403) {
        console.error('Accès refusé - vérifiez vos permissions');
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
        method: 'DELETE',
        credentials: 'include'
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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Bouton retour - Compact */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm text-base-content/60 hover:text-primary mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Retour</span>
      </button>

      {/* En-tête du profil - Design compact */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body p-4 sm:p-6">
          <div className="flex gap-4">
            {/* Photo/Avatar - Taille réduite */}
            <div className="avatar flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full ring-2 ring-primary ring-offset-base-100 ring-offset-1">
                {utilisateur?.hasPhoto === false || photoError ? (
                  <div className="bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl sm:text-2xl w-full h-full rounded-full">
                    {genererInitiales()}
                  </div>
                ) : (
                  <img
                    src={`/api/profil/public/${id}/photo`}
                    alt={expertise.titre}
                    onError={() => setPhotoError(true)}
                    className="rounded-full object-cover"
                  />
                )}
              </div>
            </div>

            {/* Informations principales - Layout optimisé */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold truncate">{expertise.titre}</h1>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-base-content/70 mt-1">
                    <span className="inline-flex items-center gap-1">
                      {expertise.typePersonne === 'MORALE' ? (
                        <Building2 className="w-3.5 h-3.5" />
                      ) : (
                        <User className="w-3.5 h-3.5" />
                      )}
                      {expertise.typePersonne === 'MORALE' ? 'Entreprise' : 'Indépendant'}
                    </span>
                    {expertise.localisation && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[150px]">{expertise.localisation}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Badge disponibilité - Plus compact */}
                <div className="flex-shrink-0">
                  {expertise.disponible ? (
                    <span className="badge badge-success badge-sm gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Disponible
                    </span>
                  ) : (
                    <span className="badge badge-ghost badge-sm gap-1">
                      <XCircle className="w-3 h-3" />
                      Indisponible
                    </span>
                  )}
                </div>
              </div>

              {/* Description - Plus compacte */}
              {expertise.description && (
                <p className="text-sm text-base-content/80 mt-3 line-clamp-2 sm:line-clamp-3">
                  {expertise.description}
                </p>
              )}
            </div>
          </div>

          {/* Barre d'actions compacte */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-base-300">
            {/* Actions disponibles pour tous */}
            <div className="tooltip tooltip-bottom" data-tip="Partager le profil">
              <button
                onClick={ouvrirModalPartage}
                className="btn btn-circle btn-sm btn-ghost hover:bg-info/20 hover:text-info"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Actions nécessitant une authentification */}
            {isAuthenticated ? (
              <>
                {/* Ajouter/Retirer du réseau */}
                <div className="tooltip tooltip-bottom" data-tip={estDansReseau ? "Retirer du réseau" : "Ajouter au réseau"}>
                  <button
                    onClick={toggleReseau}
                    className={`btn btn-circle btn-sm ${
                      estDansReseau
                        ? 'btn-error btn-outline hover:bg-error hover:text-white'
                        : 'btn-ghost hover:bg-primary/20 hover:text-primary'
                    }`}
                    disabled={loadingReseau}
                  >
                    {loadingReseau ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : estDansReseau ? (
                      <UserMinus className="w-4 h-4" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Proposer un projet */}
                <div className="tooltip tooltip-bottom" data-tip="Proposer un projet">
                  <button
                    onClick={ouvrirModalProposition}
                    className="btn btn-circle btn-sm btn-ghost hover:bg-secondary/20 hover:text-secondary"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>

                {/* Contacter - seulement si disponible */}
                {expertise.disponible && (
                  <div className="tooltip tooltip-bottom" data-tip="Contacter">
                    <button
                      onClick={ouvrirModalContact}
                      className="btn btn-circle btn-sm btn-ghost hover:bg-success/20 hover:text-success"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Indicateur pour les visiteurs non connectés */
              <div className="text-xs text-base-content/50 ml-2">
                <span className="hidden sm:inline">Connectez-vous pour plus d'actions</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section Compétences - Design compact */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-base sm:text-lg font-semibold mb-4">
            <Briefcase className="w-5 h-5 text-primary" />
            Compétences
            {expertise.competences && expertise.competences.length > 0 && (
              <span className="badge badge-primary badge-sm">{expertise.competences.length}</span>
            )}
          </h2>

          {expertise.competences && expertise.competences.length > 0 ? (
            /* Grid parent avec subgrid - 3 lignes par card alignées */
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gridAutoRows: 'auto auto auto',
              }}
            >
              {expertise.competences.map((comp, idx) => {
                const badge = getBadgeForCompetence(comp.nom);
                return (
                  /* Card avec subgrid pour aligner les 3 lignes */
                  <div
                    key={`${comp.nom}-${idx}`}
                    className={`relative rounded-xl p-4 border transition-all hover:shadow-lg ${
                      badge ? 'border-primary/30 bg-primary/5' : 'border-base-300 bg-base-200/50 hover:border-primary/30'
                    }`}
                    style={{
                      display: 'grid',
                      gridTemplateRows: 'subgrid',
                      gridRow: 'span 3',
                      gap: '12px',
                    }}
                  >
                    {/* Badge de certification en position absolue */}
                    {badge && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${BADGE_COLORS[badge.niveauCertification]} flex items-center justify-center shadow-lg border-2 border-white`}>
                          <span className="text-base">{BADGE_ICONS[badge.niveauCertification]}</span>
                        </div>
                      </div>
                    )}

                    {/* LIGNE 1: Titre + Niveau */}
                    <div className="space-y-1.5 pr-6">
                      <div className="flex items-start gap-2">
                        <h3
                          className="text-sm font-bold text-base-content leading-tight cursor-pointer hover:text-primary transition-colors"
                          onClick={() => {
                            setCompetenceSelectionnee(comp);
                            setModalCompetenceOuvert(true);
                          }}
                          title="Cliquez pour voir les détails"
                        >
                          {comp.nom}
                        </h3>
                        {comp.estFavorite && (
                          <span className="text-warning text-sm flex-shrink-0">⭐</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {comp.niveauMaitrise !== undefined && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-base-content/50">Niveau</span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((level) => (
                                <span
                                  key={level}
                                  className={`w-2 h-2 rounded-full ${
                                    level <= comp.niveauMaitrise! ? 'bg-warning' : 'bg-base-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {badge && (
                          <span className="badge badge-success badge-sm gap-1">
                            <Award className="w-3 h-3" />
                            {badge.niveauCertification}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* LIGNE 2: Description + Métriques */}
                    <div className="space-y-2">
                      <p className={`text-xs leading-relaxed ${comp.description ? 'text-base-content/70' : 'text-base-content/30 italic'}`}>
                        {comp.description || 'Aucune description'}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        {comp.thm !== undefined && comp.thm > 0 && (
                          <span className="badge badge-outline badge-success badge-sm">
                            {comp.thm.toLocaleString()} FCFA/h
                          </span>
                        )}
                        {comp.nombreProjets !== undefined && comp.nombreProjets > 0 && (
                          <span className="badge badge-ghost badge-sm">
                            {comp.nombreProjets} projet{comp.nombreProjets > 1 ? 's' : ''}
                          </span>
                        )}
                        {comp.anneesExperience !== undefined && comp.anneesExperience > 0 && (
                          <span className="badge badge-ghost badge-sm">
                            {comp.anneesExperience} an{comp.anneesExperience > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* LIGNE 3: Certifications */}
                    <div className="pt-2 border-t border-base-300/50">
                      {comp.certifications ? (
                        <p className="text-xs text-accent line-clamp-1" title={comp.certifications}>
                          📜 {comp.certifications}
                        </p>
                      ) : (
                        <p className="text-xs text-base-content/25 italic">Aucune certification</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-base-content/40">
              <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune compétence renseignée</p>
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

      {/* Modal Contact */}
      {convertirEnExpert() && (
        <ModalContact
          expert={convertirEnExpert()!}
          isOpen={modalContactOuvert}
          onClose={() => setModalContactOuvert(false)}
        />
      )}

      {/* Modal Détails Compétence */}
      <ModalDetailsCompetence
        isOpen={modalCompetenceOuvert}
        onClose={() => {
          setModalCompetenceOuvert(false);
          setCompetenceSelectionnee(null);
        }}
        competence={competenceSelectionnee}
        badge={competenceSelectionnee ? getBadgeForCompetence(competenceSelectionnee.nom) : null}
      />
    </div>
  );
}
