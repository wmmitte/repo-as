import { Competence } from '@/types/expert.types';
import { Star, Award } from 'lucide-react';

interface CompetenceCardProps {
  competence: Competence;
}

export default function CompetenceCard({ competence }: CompetenceCardProps) {
  return (
    <div className={`bg-white border ${competence.favorite ? 'border-amber-300 bg-amber-50/50' : 'border-gray-100'} rounded-lg px-3 py-2`}>
      {/* Nom et étoile favorite */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <h4 className="font-medium text-gray-900 text-xs line-clamp-1 flex items-center gap-1">
          {competence.favorite && (
            <Star className="w-3 h-3 fill-amber-500 text-amber-500 flex-shrink-0" />
          )}
          {competence.nom}
        </h4>
        {/* Niveau de maîtrise - mini étoiles */}
        {competence.niveauMaitrise && (
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-2.5 h-2.5 ${
                  i < competence.niveauMaitrise!
                    ? 'fill-amber-500 text-amber-500'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Infos compactes */}
      <div className="flex flex-wrap items-center gap-1.5">
        {competence.anneesExperience !== undefined && competence.anneesExperience > 0 && (
          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
            {competence.anneesExperience} an{competence.anneesExperience > 1 ? 's' : ''}
          </span>
        )}
        {competence.thm && (
          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
            {competence.thm >= 1000
              ? `${(competence.thm / 1000).toFixed(0)}K`
              : competence.thm.toLocaleString()}/h
          </span>
        )}
        {competence.nombreProjets !== undefined && competence.nombreProjets > 0 && (
          <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
            {competence.nombreProjets} projet{competence.nombreProjets > 1 ? 's' : ''}
          </span>
        )}
        {competence.certifications && (
          <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded flex items-center gap-0.5">
            <Award className="w-2.5 h-2.5" />
            Certifié
          </span>
        )}
      </div>
    </div>
  );
}
