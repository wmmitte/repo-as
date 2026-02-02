import { useState } from 'react';

interface AvatarUtilisateurProps {
  utilisateurId?: string;
  nom?: string;
  prenom?: string;
  photoUrl?: string;
  hasPhoto?: boolean; // Si défini à false, n'essaie pas de charger la photo
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  indicateur?: 'online' | 'offline' | 'busy' | 'none';
  onClick?: () => void;
}

const SIZES = {
  xs: { container: 'w-6 h-6', text: 'text-[10px]' },
  sm: { container: 'w-8 h-8', text: 'text-xs' },
  md: { container: 'w-10 h-10', text: 'text-sm' },
  lg: { container: 'w-12 h-12', text: 'text-sm' },
  xl: { container: 'w-16 h-16', text: 'text-lg' },
};

const INDICATEUR_COLORS = {
  online: 'bg-success',
  offline: 'bg-gray-400',
  busy: 'bg-warning',
  none: '',
};

/**
 * Composant Avatar réutilisable
 * Affiche la photo de l'utilisateur par-dessus ses initiales (approche en couches)
 * Les initiales sont toujours visibles en arrière-plan pour un affichage immédiat
 */
export default function AvatarUtilisateur({
  utilisateurId,
  nom,
  prenom,
  photoUrl,
  hasPhoto,
  size = 'md',
  className = '',
  indicateur = 'none',
  onClick,
}: AvatarUtilisateurProps) {
  const [photoError, setPhotoError] = useState(false);

  // Générer les initiales
  const genererInitiales = (): string => {
    const i1 = prenom?.charAt(0)?.toUpperCase() || '';
    const i2 = nom?.charAt(0)?.toUpperCase() || '';
    return `${i1}${i2}` || '?';
  };

  // Générer une couleur de fond basée sur l'ID ou le nom
  const genererCouleurFond = (): string => {
    const gradients = [
      'from-primary to-secondary',
      'from-blue-500 to-purple-500',
      'from-green-500 to-teal-500',
      'from-orange-500 to-red-500',
      'from-pink-500 to-rose-500',
      'from-indigo-500 to-blue-500',
      'from-cyan-500 to-blue-500',
      'from-emerald-500 to-green-500',
    ];

    // Utiliser l'ID ou le nom pour générer un index stable
    const seed = utilisateurId || `${prenom}${nom}` || 'default';
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  // Construire l'URL de la photo
  const getPhotoUrl = (): string | null => {
    // Si hasPhoto est explicitement false, ne pas essayer de charger
    if (hasPhoto === false) return null;
    if (photoUrl) return photoUrl;
    // Si hasPhoto est true ou undefined, essayer de charger
    if (utilisateurId) return `/api/profil/public/${utilisateurId}/photo`;
    return null;
  };

  const urlPhoto = getPhotoUrl();
  const doitTenterChargerPhoto = urlPhoto && !photoError;
  const sizeConfig = SIZES[size];

  return (
    <div
      className={`
        ${sizeConfig.container}
        rounded-full
        flex-shrink-0
        relative
        ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Couche 1: Initiales (toujours visibles en arrière-plan) */}
      <div
        className={`
          w-full h-full rounded-full
          bg-gradient-to-br ${genererCouleurFond()}
          flex items-center justify-center
          text-white font-semibold ${sizeConfig.text}
        `}
      >
        {genererInitiales()}
      </div>

      {/* Couche 2: Photo par-dessus (si disponible et chargée avec succès) */}
      {doitTenterChargerPhoto && (
        <img
          src={urlPhoto}
          alt={`${prenom} ${nom}`}
          className="absolute inset-0 w-full h-full rounded-full object-cover"
          onError={() => setPhotoError(true)}
        />
      )}

      {/* Indicateur de statut */}
      {indicateur !== 'none' && (
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 ${INDICATEUR_COLORS[indicateur]} rounded-full border-2 border-white`}
        />
      )}
    </div>
  );
}
