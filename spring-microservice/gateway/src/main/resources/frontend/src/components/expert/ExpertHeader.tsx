import { Expert } from '@/types/expert.types';

interface ExpertHeaderProps {
  expert: Expert;
}

export default function ExpertHeader({ expert }: ExpertHeaderProps) {
  // Gérer l'affichage du nom : personne physique (prénom + nom) ou personne morale (nom uniquement)
  const fullName = expert.prenom && expert.prenom.trim() !== ''
    ? `${expert.prenom} ${expert.nom}`
    : expert.nom;
  
  const disponibiliteClass = expert.disponible
    ? 'bg-success/20 text-success'
    : 'bg-error/20 text-error';

  return (
    <div className="flex gap-6 mb-6">
      <img
        src={expert.photoUrl}
        alt={fullName}
        className="w-40 h-40 rounded-full object-cover border-4 border-slate-200 flex-shrink-0"
      />
      <div className="flex-1">
        <div className="flex justify-between items-start mb-3">
          <h2 className="text-2xl font-bold text-gray-900">{fullName}</h2>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm ${disponibiliteClass}`}>
            <span
              className={`w-2 h-2 rounded-full ${
                expert.disponible ? 'bg-success' : 'bg-error'
              }`}
            ></span>
            <span>{expert.disponible ? 'Disponible' : 'Occupé'}</span>
          </div>
        </div>
        <p className="text-lg text-primary font-medium mb-4">{expert.titre}</p>
      </div>
    </div>
  );
}
