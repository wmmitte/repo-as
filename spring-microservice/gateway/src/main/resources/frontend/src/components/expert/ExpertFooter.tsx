import { Expert } from '@/types/expert.types';
import { Briefcase, ChevronRight, Users } from 'lucide-react';

interface ExpertFooterProps {
  expert: Expert;
  onPropose: (id: string) => void;
  onViewProfile: (id: string) => void;
}

export default function ExpertFooter({ expert, onPropose, onViewProfile }: ExpertFooterProps) {
  // Calculer quelques stats
  const totalProjets = expert.competences?.reduce((sum, c) => sum + (c.nombreProjets || 0), 0) || 0;
  const totalAnnees = expert.competences?.reduce((max, c) => Math.max(max, c.anneesExperience || 0), 0) || 0;

  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <div className="flex items-center justify-between">
        {/* Stats rapides */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {totalProjets > 0 && (
            <span className="flex items-center gap-1">
              <Briefcase size={12} />
              {totalProjets} projet{totalProjets > 1 ? 's' : ''}
            </span>
          )}
          {totalAnnees > 0 && (
            <span className="flex items-center gap-1">
              <Users size={12} />
              {totalAnnees}+ ans d'exp.
            </span>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPropose(expert.id)}
            className="btn btn-primary btn-sm gap-1"
          >
            <Briefcase size={14} />
            Proposer
          </button>
          <button
            onClick={() => onViewProfile(expert.id)}
            className="btn btn-outline btn-primary btn-sm gap-1"
          >
            Profil
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
