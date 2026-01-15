import { Expert } from '@/types/expert.types';
import ExpertHeader from './ExpertHeader';
import ExpertSkills from './ExpertSkills';
import ExpertFooter from './ExpertFooter';

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
        className="card bg-white border border-slate-200 rounded-2xl p-8 w-full 
                   h-[75vh] flex flex-col 
                   shadow-2xl"
      >
        <div className="flex-1 flex flex-col overflow-y-auto pr-2" 
             style={{
               scrollbarWidth: 'thin',
               scrollbarColor: '#2a2f45 transparent'
             }}>
          <ExpertHeader expert={expert} />
          <p className="text-gray-700 leading-relaxed mb-6">{expert.description}</p>
          <ExpertSkills competences={expert.competences} />
        </div>
        <div className="mt-4 flex-shrink-0 h-24 relative">
          <ExpertFooter expert={expert} onPropose={onPropose} onViewProfile={onViewProfile} onShare={onShare} />
        </div>
      </article>
      
      {/* Boutons positionnés à l'extérieur de la carte */}
      <div className="absolute bottom-0 -right-20 flex flex-col gap-4">
        {/* Bouton Partager */}
        {onShare && (
          <div className="flex flex-col items-center">
            <button
              onClick={() => onShare(expert)}
              className="w-12 h-12 bg-primary hover:bg-primary-800 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
            <span className="text-xs text-gray-700 mt-1 font-medium">Partager</span>
          </div>
        )}

        {/* Bouton Profil */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => onViewProfile(expert.id)}
            className="w-12 h-12 bg-primary hover:bg-primary-800 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
          <span className="text-xs text-gray-700 mt-1 font-medium">Profil</span>
        </div>

        {/* Bouton Principal - Proposer */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => onPropose(expert.id)}
            className="w-14 h-14 bg-primary hover:bg-primary-800 rounded-full flex items-center justify-center text-white transition-colors shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
          </button>
          <span className="text-xs text-primary font-semibold mt-1">Proposer</span>
        </div>
      </div>
    </div>
  );
}
