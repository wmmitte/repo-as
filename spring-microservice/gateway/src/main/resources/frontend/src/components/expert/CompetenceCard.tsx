import { Competence } from '@/types/expert.types';
import { Star } from 'lucide-react';

interface CompetenceCardProps {
  competence: Competence;
}

export default function CompetenceCard({ competence }: CompetenceCardProps) {
  return (
    <div className={`bg-slate-50 border ${competence.favorite ? 'border-warning' : 'border-slate-200'} rounded-lg p-3`}>
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 flex items-center gap-1">
          {competence.nom}
          {competence.favorite && (
            <Star className="w-4 h-4 fill-warning text-warning" />
          )}
        </h4>
        {competence.niveauMaitrise && (
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < competence.niveauMaitrise!
                    ? 'fill-warning text-warning'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 text-xs">
        {competence.anneesExperience !== undefined && competence.anneesExperience > 0 && (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Exp.: {competence.anneesExperience} an{competence.anneesExperience > 1 ? 's' : ''}
          </span>
        )}
        {competence.thm && (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
            THM: {competence.thm.toLocaleString()} FCFA/h
          </span>
        )}
        {competence.nombreProjets !== undefined && competence.nombreProjets > 0 && (
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
            Nbre projet: {competence.nombreProjets}
          </span>
        )}
      </div>
      
      {competence.certifications && (
        <div className="mt-2 text-xs text-gray-600">
          <span className="font-medium">Certifications: </span>
          {competence.certifications}
        </div>
      )}
    </div>
  );
}
