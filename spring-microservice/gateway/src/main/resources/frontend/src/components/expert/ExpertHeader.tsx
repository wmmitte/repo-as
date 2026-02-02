import { useState } from 'react';
import { Expert } from '@/types/expert.types';
import { Star, MapPin, CheckCircle } from 'lucide-react';

interface ExpertHeaderProps {
  expert: Expert;
  onViewProfile: (id: string) => void;
}

export default function ExpertHeader({ expert, onViewProfile }: ExpertHeaderProps) {
  const [photoError, setPhotoError] = useState(false);
  const [photoLoaded, setPhotoLoaded] = useState(false);

  // Gérer l'affichage du nom : personne physique (prénom + nom) ou personne morale (nom uniquement)
  const fullName = expert.prenom && expert.prenom.trim() !== ''
    ? `${expert.prenom} ${expert.nom}`
    : expert.nom;

  // Générer les initiales pour l'avatar par défaut
  const getInitiales = () => {
    if (expert.prenom && expert.prenom.trim() !== '') {
      return `${expert.prenom.charAt(0)}${expert.nom.charAt(0)}`.toUpperCase();
    }
    return expert.nom.substring(0, 2).toUpperCase();
  };

  // URL de la photo via l'API
  const photoApiUrl = `/api/profil/public/${expert.id}/photo`;

  // Vérifier si l'image est valide (dimensions > 0)
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      setPhotoLoaded(true);
    } else {
      setPhotoError(true);
    }
  };

  return (
    <div className="flex items-start gap-4 mb-4">
      {/* Photo ou Avatar avec initiales - toujours circulaire */}
      <div className="relative flex-shrink-0 w-16 h-16">
        {/* Initiales en arrière-plan (toujours présentes) */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border-2 border-blue-200 shadow-md">
          <span className="text-white font-bold text-lg">{getInitiales()}</span>
        </div>
        {/* Image par-dessus si elle existe et se charge correctement */}
        {!photoError && (
          <img
            src={photoApiUrl}
            alt={fullName}
            className={`absolute inset-0 w-16 h-16 rounded-full object-cover border-2 border-blue-200 shadow-md transition-opacity duration-200 ${photoLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={handleImageLoad}
            onError={() => setPhotoError(true)}
          />
        )}
        {/* Indicateur de disponibilité */}
        <div
          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
            expert.disponible ? 'bg-success' : 'bg-gray-400'
          }`}
        >
          {expert.disponible && <CheckCircle className="w-3 h-3 text-white" />}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        {/* Badges type et disponibilité */}
        <div className="flex items-center gap-1.5 mb-1">
          <span className="badge badge-xs bg-blue-100 text-blue-700 border-blue-300">
            Expert
          </span>
          <span className={`badge badge-xs ${expert.disponible ? 'badge-success' : 'badge-ghost'}`}>
            {expert.disponible ? 'Disponible' : 'Occupé'}
          </span>
        </div>

        {/* Nom - cliquable */}
        <h2
          className="text-xl font-bold text-gray-900 mb-1 line-clamp-1 cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => onViewProfile(expert.id)}
        >
          {fullName}
        </h2>

        {/* Titre professionnel */}
        {expert.titre && (
          <p className="text-sm text-blue-600 font-medium mb-1 line-clamp-1">
            {expert.titre}
          </p>
        )}

        {/* Infos rapides */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
          {expert.localisation && (
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              <span className="line-clamp-1">{expert.localisation}</span>
            </span>
          )}
          {expert.rating !== undefined && expert.rating > 0 && (
            <span className="flex items-center gap-1 text-amber-600 font-medium">
              <Star size={12} className="fill-amber-500" />
              {expert.rating.toFixed(1)}
            </span>
          )}
          {expert.competences && expert.competences.length > 0 && (
            <span className="text-gray-500">
              {expert.competences.length} compétence{expert.competences.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
