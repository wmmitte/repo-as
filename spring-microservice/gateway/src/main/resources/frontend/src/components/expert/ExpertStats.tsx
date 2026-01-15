import { Expert } from '@/types/expert.types';

interface ExpertStatsProps {
  expert: Expert;
}

export default function ExpertStats({ expert }: ExpertStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-2 text-center">
        <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">
          Expérience
        </div>
        <div className="text-lg font-bold text-gray-900">{expert.experienceAnnees}</div>
        <div className="text-sm text-gray-600">ans</div>
      </div>

      <div className="bg-slate-100 border border-slate-200 rounded-xl p-2 text-center">
        <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">
          Projets
        </div>
        <div className="text-lg font-bold text-gray-900">{expert.nombreProjets}</div>
      </div>

      <div className="bg-slate-100 border border-slate-200 rounded-xl p-2 text-center">
        <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">TJM</div>
        <div className="text-lg font-bold text-gray-900">
          {expert.tjmMin}-{expert.tjmMax}€
        </div>
      </div>
    </div>
  );
}
