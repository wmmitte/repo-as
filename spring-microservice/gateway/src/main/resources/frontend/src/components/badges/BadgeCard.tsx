import { BadgeCompetence, NiveauCertification } from '../../services/badgeService';
import { Award, Calendar, Eye, EyeOff } from 'lucide-react';
import { obtenirNiveauAvecSignification } from '../../utils/badgeUtils';

interface BadgeCardProps {
  badge: BadgeCompetence;
  onToggleVisibilite?: (badgeId: number) => void;
  afficherActions?: boolean;
  compact?: boolean;
}

/**
 * Composant pour afficher une carte de badge de compétence
 */
export default function BadgeCard({
  badge,
  onToggleVisibilite,
  afficherActions = true,
  compact = false
}: BadgeCardProps) {

  const obtenirCouleurNiveau = (niveau: NiveauCertification): string => {
    const couleurs: Record<NiveauCertification, string> = {
      [NiveauCertification.BRONZE]: 'from-amber-700 to-amber-900',
      [NiveauCertification.ARGENT]: 'from-gray-400 to-gray-600',
      [NiveauCertification.OR]: 'from-yellow-400 to-yellow-600',
      [NiveauCertification.PLATINE]: 'from-slate-300 to-slate-500'
    };
    return couleurs[niveau] || 'from-gray-400 to-gray-600';
  };

  const obtenirIconeCouleur = (niveau: NiveauCertification): string => {
    const couleurs: Record<NiveauCertification, string> = {
      [NiveauCertification.BRONZE]: '#CD7F32',
      [NiveauCertification.ARGENT]: '#C0C0C0',
      [NiveauCertification.OR]: '#FFD700',
      [NiveauCertification.PLATINE]: '#E5E4E2'
    };
    return couleurs[niveau] || '#808080';
  };

  const formaterDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 bg-base-200 rounded-lg">
        <Award
          size={24}
          style={{ color: obtenirIconeCouleur(badge.niveauCertification) }}
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{badge.competenceNom}</p>
          <p className="text-xs text-base-content/70">{obtenirNiveauAvecSignification(badge.niveauCertification)}</p>
        </div>
        {!badge.estPublic && <EyeOff size={16} className="text-base-content/40" />}
      </div>
    );
  }

  return (
    <div
      className={`card bg-gradient-to-br ${obtenirCouleurNiveau(badge.niveauCertification)} shadow-xl text-white relative overflow-hidden`}
    >
      {/* Badge "Non valide" si expiré ou inactif */}
      {!badge.estValide && (
        <div className="absolute top-2 right-2 badge badge-error badge-sm">
          Expiré
        </div>
      )}

      {/* Indicateur de visibilité */}
      {!badge.estPublic && afficherActions && (
        <div className="absolute top-2 left-2 badge badge-ghost badge-sm">
          <EyeOff size={14} className="mr-1" />
          Privé
        </div>
      )}

      <div className="card-body p-6">
        {/* Icône et niveau */}
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <Award size={64} className="drop-shadow-lg" />
            <div className="absolute -bottom-2 -right-2 bg-white text-black rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shadow-md">
              {badge.niveauCertification === NiveauCertification.BRONZE && '🥉'}
              {badge.niveauCertification === NiveauCertification.ARGENT && '🥈'}
              {badge.niveauCertification === NiveauCertification.OR && '🥇'}
              {badge.niveauCertification === NiveauCertification.PLATINE && '💎'}
            </div>
          </div>
        </div>

        {/* Nom de la compétence */}
        <h3 className="card-title text-center justify-center mb-2">
          {badge.competenceNom}
        </h3>

        {/* Niveau */}
        <div className="text-center mb-4">
          <span className="badge badge-lg bg-white/20 border-white/40 text-white">
            {obtenirNiveauAvecSignification(badge.niveauCertification)}
          </span>
        </div>

        {/* Date d'obtention */}
        <div className="flex items-center justify-center gap-2 text-sm opacity-90 mb-2">
          <Calendar size={16} />
          <span>Obtenu le {formaterDate(badge.dateObtention)}</span>
        </div>

        {/* Validité */}
        <div className="text-center text-sm opacity-80">
          {badge.validitePermanente ? (
            <span>Validité permanente</span>
          ) : badge.dateExpiration ? (
            <span>
              Valide jusqu'au {formaterDate(badge.dateExpiration)}
            </span>
          ) : null}
        </div>

        {/* Actions */}
        {afficherActions && onToggleVisibilite && badge.estActif && (
          <div className="card-actions justify-center mt-4">
            <button
              onClick={() => onToggleVisibilite(badge.id)}
              className="btn btn-sm btn-ghost bg-white/10 hover:bg-white/20 border-white/20 text-white"
            >
              {badge.estPublic ? (
                <>
                  <Eye size={16} />
                  Rendre privé
                </>
              ) : (
                <>
                  <EyeOff size={16} />
                  Rendre public
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Motif révocation si révoqué */}
      {!badge.estActif && badge.motifRevocation && (
        <div className="bg-red-900/50 p-3 text-sm">
          <p className="font-semibold">Badge révoqué</p>
          <p className="opacity-90">{badge.motifRevocation}</p>
          {badge.dateRevocation && (
            <p className="opacity-70 text-xs mt-1">
              Le {formaterDate(badge.dateRevocation)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
