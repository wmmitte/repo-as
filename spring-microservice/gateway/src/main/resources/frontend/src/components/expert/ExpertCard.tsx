import { Expert } from '@/types/expert.types';
import ExpertHeader from './ExpertHeader';
import ExpertSkills from './ExpertSkills';
import ExpertFooter from './ExpertFooter';
import { Share2, User, Briefcase } from 'lucide-react';

interface ExpertCardProps {
  expert: Expert;
  onPropose: (id: string) => void;
  onViewProfile: (id: string) => void;
  onShare?: (expert: Expert) => void;
}

export default function ExpertCard({ expert, onPropose, onViewProfile, onShare }: ExpertCardProps) {
  return (
    <div className="relative w-full max-w-4xl">
      <article
        data-id={expert.id}
        className="card bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl p-6 w-full shadow-2xl"
      >
        {/* Header */}
        <ExpertHeader expert={expert} onViewProfile={onViewProfile} />

        {/* Description - max 3 lignes */}
        {expert.description && (
          <p className="text-gray-700 leading-relaxed mb-4 text-sm line-clamp-3">
            {expert.description}
          </p>
        )}

        {/* Compétences */}
        <ExpertSkills competences={expert.competences} onViewProfile={() => onViewProfile(expert.id)} />

        {/* Footer */}
        <ExpertFooter expert={expert} onPropose={onPropose} onViewProfile={onViewProfile} />
      </article>

      {/* Boutons positionnés à l'extérieur de la carte */}
      <div className="absolute bottom-0 -right-16 flex flex-col gap-3">
        {/* Bouton Partager */}
        {onShare && (
          <div className="flex flex-col items-center">
            <button
              onClick={() => onShare(expert)}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm shadow-lg"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <span className="text-[10px] text-gray-600 mt-0.5 font-medium">Partager</span>
          </div>
        )}

        {/* Bouton Profil */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => onViewProfile(expert.id)}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm shadow-lg"
          >
            <User className="w-4 h-4" />
          </button>
          <span className="text-[10px] text-gray-600 mt-0.5 font-medium">Profil</span>
        </div>

        {/* Bouton Principal - Proposer */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => onPropose(expert.id)}
            className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition-colors shadow-lg"
          >
            <Briefcase className="w-5 h-5" />
          </button>
          <span className="text-[10px] text-blue-600 font-semibold mt-0.5">Proposer</span>
        </div>
      </div>
    </div>
  );
}
