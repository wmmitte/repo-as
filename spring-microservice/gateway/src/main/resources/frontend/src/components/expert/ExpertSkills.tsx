import { Competence } from '@/types/expert.types';
import CompetenceCard from './CompetenceCard';

interface ExpertSkillsProps {
  competences: Competence[];
}

export default function ExpertSkills({ competences }: ExpertSkillsProps) {
  return (
    <div className="mb-6">
      <h3 className="text-base font-semibold text-gray-900 mb-3">
        Compétences et expertise:
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {competences.map((comp, index) => (
          <CompetenceCard key={index} competence={comp} />
        ))}
      </div>
    </div>
  );
}
