import { Competence } from '@/types/expert.types';
import CompetenceCard from './CompetenceCard';
import { ChevronRight } from 'lucide-react';

interface ExpertSkillsProps {
  competences: Competence[];
  onViewProfile: () => void;
  maxVisible?: number;
}

export default function ExpertSkills({ competences, onViewProfile, maxVisible = 4 }: ExpertSkillsProps) {
  // Trier pour mettre les favoris en premier
  const competencesTriees = [...competences].sort((a, b) => {
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;
    return 0;
  });

  const competencesVisibles = competencesTriees.slice(0, maxVisible);
  const nombreRestantes = competences.length - maxVisible;

  if (competences.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">
        Compétences clés
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {competencesVisibles.map((comp, index) => (
          <CompetenceCard key={index} competence={comp} />
        ))}
      </div>

      {/* Bouton voir plus */}
      {nombreRestantes > 0 && (
        <button
          onClick={onViewProfile}
          className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
        >
          Voir {nombreRestantes} autre{nombreRestantes > 1 ? 's' : ''} compétence{nombreRestantes > 1 ? 's' : ''}
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}
