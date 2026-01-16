import { X, Star, Award, Briefcase, Clock, BadgeCheck, FileText, TrendingUp } from 'lucide-react';
import { Competence } from '@/types/expertise.types';
import { BadgeCompetenceDTO, NiveauCertification } from '@/types/reconnaissance.types';

interface ModalDetailsCompetenceProps {
  isOpen: boolean;
  onClose: () => void;
  competence: Competence | CompetencePublic | null;
  badge?: BadgeCompetenceDTO | null;
  onDemanderCertification?: () => void;
  montrerBoutonCertification?: boolean;
}

// Type pour les compétences affichées sur les profils publics
export interface CompetencePublic {
  nom: string;
  description?: string;
  niveauMaitrise?: number;
  anneesExperience?: number;
  thm?: number;
  nombreProjets?: number;
  certifications?: string;
  estFavorite?: boolean;
}

const BADGE_COLORS: Record<NiveauCertification, string> = {
  [NiveauCertification.BRONZE]: 'from-orange-300 to-orange-600',
  [NiveauCertification.ARGENT]: 'from-gray-300 to-gray-500',
  [NiveauCertification.OR]: 'from-yellow-400 to-yellow-600',
  [NiveauCertification.PLATINE]: 'from-purple-400 to-pink-600',
};

const BADGE_ICONS: Record<NiveauCertification, string> = {
  [NiveauCertification.BRONZE]: '🥉',
  [NiveauCertification.ARGENT]: '🥈',
  [NiveauCertification.OR]: '🥇',
  [NiveauCertification.PLATINE]: '💎',
};

const NIVEAU_LABELS: Record<number, string> = {
  1: 'Débutant',
  2: 'Junior',
  3: 'Intermédiaire',
  4: 'Senior',
  5: 'Expert',
};

export default function ModalDetailsCompetence({
  isOpen,
  onClose,
  competence,
  badge,
  onDemanderCertification,
  montrerBoutonCertification = false,
}: ModalDetailsCompetenceProps) {
  if (!isOpen || !competence) return null;

  // Parser les certifications
  const certificationsList = competence.certifications
    ? competence.certifications.split(',').map(c => c.trim()).filter(c => c)
    : [];

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg relative">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3"
        >
          <X className="w-4 h-4" />
        </button>

        {/* En-tête avec titre et badge */}
        <div className="flex items-start gap-4 mb-6 pr-8">
          {/* Icône compétence */}
          <div className={`p-3 rounded-xl ${badge ? 'bg-primary/10' : 'bg-base-200'}`}>
            <Briefcase className={`w-6 h-6 ${badge ? 'text-primary' : 'text-base-content/50'}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-base-content">
                {competence.nom}
              </h3>
              {competence.estFavorite && (
                <Star className="w-5 h-5 fill-warning text-warning flex-shrink-0" />
              )}
            </div>

            {/* Badge de certification */}
            {badge && (
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${BADGE_COLORS[badge.niveauCertification]} flex items-center justify-center shadow-md`}>
                  <span className="text-sm">{BADGE_ICONS[badge.niveauCertification]}</span>
                </div>
                <div>
                  <span className="badge badge-success badge-sm gap-1">
                    <BadgeCheck className="w-3 h-3" />
                    Certifié {badge.niveauCertification}
                  </span>
                  {badge.dateObtention && (
                    <p className="text-xs text-base-content/50 mt-0.5">
                      Obtenu le {new Date(badge.dateObtention).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Niveau de maîtrise */}
        {competence.niveauMaitrise !== undefined && (
          <div className="mb-4 p-3 bg-base-200/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-base-content/70">Niveau de maîtrise</span>
              <span className="text-sm font-semibold text-primary">
                {NIVEAU_LABELS[competence.niveauMaitrise] || `Niveau ${competence.niveauMaitrise}`}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`flex-1 h-2 rounded-full ${
                    level <= competence.niveauMaitrise! ? 'bg-warning' : 'bg-base-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-base-content mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Description
          </h4>
          {competence.description ? (
            <p className="text-sm text-base-content/70 leading-relaxed whitespace-pre-wrap">
              {competence.description}
            </p>
          ) : (
            <p className="text-sm text-base-content/40 italic">Aucune description fournie</p>
          )}
        </div>

        {/* Métriques */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* THM */}
          <div className="bg-success/10 rounded-lg p-3 text-center">
            <TrendingUp className="w-5 h-5 text-success mx-auto mb-1" />
            <p className="text-xs text-base-content/60">Taux horaire</p>
            {competence.thm !== undefined && competence.thm > 0 ? (
              <p className="text-sm font-bold text-success">{competence.thm.toLocaleString()} F/h</p>
            ) : (
              <p className="text-xs text-base-content/40">Non renseigné</p>
            )}
          </div>

          {/* Projets */}
          <div className="bg-info/10 rounded-lg p-3 text-center">
            <Briefcase className="w-5 h-5 text-info mx-auto mb-1" />
            <p className="text-xs text-base-content/60">Projets</p>
            {competence.nombreProjets !== undefined && competence.nombreProjets > 0 ? (
              <p className="text-sm font-bold text-info">{competence.nombreProjets}</p>
            ) : (
              <p className="text-xs text-base-content/40">0</p>
            )}
          </div>

          {/* Expérience */}
          <div className="bg-secondary/10 rounded-lg p-3 text-center">
            <Clock className="w-5 h-5 text-secondary mx-auto mb-1" />
            <p className="text-xs text-base-content/60">Expérience</p>
            {competence.anneesExperience !== undefined && competence.anneesExperience > 0 ? (
              <p className="text-sm font-bold text-secondary">
                {competence.anneesExperience} an{competence.anneesExperience > 1 ? 's' : ''}
              </p>
            ) : (
              <p className="text-xs text-base-content/40">Non renseigné</p>
            )}
          </div>
        </div>

        {/* Certifications */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-base-content mb-2 flex items-center gap-2">
            <Award className="w-4 h-4 text-accent" />
            Certifications
          </h4>
          {certificationsList.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {certificationsList.map((cert, idx) => (
                <span key={idx} className="badge badge-accent badge-outline">
                  📜 {cert}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-base-content/40 italic">Aucune certification</p>
          )}
        </div>

        {/* Actions */}
        <div className="modal-action mt-0 pt-4 border-t border-base-300">
          {montrerBoutonCertification && onDemanderCertification && !badge && (
            <button
              onClick={() => {
                onDemanderCertification();
                onClose();
              }}
              className="btn btn-primary btn-sm gap-2"
            >
              <Award className="w-4 h-4" />
              Demander la certification
            </button>
          )}
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            Fermer
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
