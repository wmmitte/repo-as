import { ProjetResume } from '@/types/projet.types';
import {
  Briefcase,
  Calendar,
  Users,
  DollarSign,
  ChevronRight,
  Share2,
  Eye,
  CheckCircle,
  Clock
} from 'lucide-react';

interface ProjetFeedCardProps {
  projet: ProjetResume;
  onViewDetails: (id: number) => void;
  onShare?: (projet: ProjetResume) => void;
  onPostuler?: (id: number) => void;
  estConnecte?: boolean;
  aDejaPostule?: boolean;
}

// Configuration des statuts
const STATUTS_CONFIG: Record<string, { label: string; classe: string }> = {
  BROUILLON: { label: 'Brouillon', classe: 'badge-ghost' },
  PUBLIE: { label: 'Publié', classe: 'badge-success' },
  EN_COURS: { label: 'En cours', classe: 'badge-info' },
  EN_PAUSE: { label: 'En pause', classe: 'badge-warning' },
  TERMINE: { label: 'Terminé', classe: 'badge-neutral' },
  ANNULE: { label: 'Annulé', classe: 'badge-error' }
};

export default function ProjetFeedCard({
  projet,
  onViewDetails,
  onShare,
  onPostuler,
  estConnecte = false,
  aDejaPostule = false
}: ProjetFeedCardProps) {
  const statutConfig = STATUTS_CONFIG[projet.statut] || STATUTS_CONFIG.BROUILLON;

  // Déterminer si on affiche le bouton Postuler
  // - Si pas connecté: afficher si tâches disponibles
  // - Si connecté: afficher si tâches disponibles ET pas déjà postulé
  const afficherBoutonPostuler = projet.nombreTachesDisponibles > 0 &&
    (!estConnecte || (estConnecte && !aDejaPostule));

  // Formater le budget
  const formaterBudget = (budget: number, devise: string) => {
    if (budget >= 1000000) {
      return `${(budget / 1000000).toFixed(1)}M ${devise}`;
    }
    if (budget >= 1000) {
      return `${(budget / 1000).toFixed(0)}K ${devise}`;
    }
    return `${budget.toLocaleString()} ${devise}`;
  };

  // Formater la date
  const formaterDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="relative w-full max-w-4xl">
      <article
        data-id={`projet-${projet.id}`}
        className="card bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 rounded-2xl p-6 w-full
                   shadow-2xl"
      >
        {/* Header compact */}
        <div className="flex items-start gap-4 mb-4">
          {/* Icône du projet */}
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <Briefcase className="w-7 h-7 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Badge type et statut */}
            <div className="flex items-center gap-1.5 mb-1">
              <span className="badge badge-xs bg-emerald-100 text-emerald-700 border-emerald-300">
                Projet
              </span>
              <span className={`badge badge-xs ${statutConfig.classe}`}>
                {statutConfig.label}
              </span>
            </div>

            {/* Nom du projet - cliquable */}
            <h2
              className="text-xl font-bold text-gray-900 mb-1 line-clamp-2 cursor-pointer hover:text-emerald-600 transition-colors"
              onClick={() => onViewDetails(projet.id)}
            >
              {projet.nom}
            </h2>

            {/* Indicateurs clés */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
              {projet.nombreTachesDisponibles > 0 && (
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle size={12} />
                  {projet.nombreTachesDisponibles} tâche{projet.nombreTachesDisponibles > 1 ? 's' : ''} dispo.
                </span>
              )}
              {projet.nombreTaches > 0 && (
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  {projet.nombreTaches} au total
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex flex-col">

          {/* Description - max 3 lignes */}
          {projet.description && (
            <p className="text-gray-700 leading-relaxed mb-4 text-sm line-clamp-3">
              {projet.description}
            </p>
          )}

          {/* Infos du projet - 2 lignes */}
          <div className="space-y-2 mb-4">
            {/* Ligne 1: Budget + Période */}
            <div className="flex gap-2">
              {/* Budget */}
              <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-white rounded-lg border border-gray-100">
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="min-w-0 flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">Budget:</span>
                  <span className="text-sm font-bold text-gray-900 truncate">
                    {projet.budget > 0 ? formaterBudget(projet.budget, projet.devise) : 'Non défini'}
                  </span>
                </div>
              </div>

              {/* Période */}
              <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-white rounded-lg border border-gray-100">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="min-w-0 flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">Période:</span>
                  <span className="text-xs font-medium text-gray-900 truncate">
                    {projet.dateDebutPrevue ? (
                      <>
                        {formaterDate(projet.dateDebutPrevue)}
                        {projet.dateFinPrevue && <> → {formaterDate(projet.dateFinPrevue)}</>}
                      </>
                    ) : 'Non définie'}
                  </span>
                </div>
              </div>
            </div>

            {/* Ligne 2: Avancement + Vues */}
            <div className="flex gap-2">
              {/* Progression */}
              <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-white rounded-lg border border-gray-100">
                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span className="text-xs text-gray-500">Avancement:</span>
                  <div className="flex-1 flex items-center gap-1.5">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${projet.progression}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-900">{projet.progression}%</span>
                  </div>
                </div>
              </div>

              {/* Vues */}
              <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-white rounded-lg border border-gray-100">
                <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <div className="min-w-0 flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">Vues:</span>
                  <span className="text-sm font-bold text-gray-900">
                    {projet.nombreVues || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Structure du projet - version compacte */}
          {(projet.nombreEtapes > 0 || projet.nombreCandidatures > 0) && (
            <div className="mb-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {projet.nombreEtapes > 0 && (
                  <span className="badge badge-outline badge-sm">
                    {projet.nombreEtapes} étape{projet.nombreEtapes > 1 ? 's' : ''}
                  </span>
                )}
                <span className="badge badge-outline badge-sm">
                  {projet.nombreTaches} tâche{projet.nombreTaches > 1 ? 's' : ''}
                </span>
                {projet.nombreLivrables > 0 && (
                  <span className="badge badge-outline badge-sm">
                    {projet.nombreLivrables} livrable{projet.nombreLivrables > 1 ? 's' : ''}
                  </span>
                )}
                {projet.nombreCandidatures > 0 && (
                  <span className="badge badge-primary badge-sm">
                    {projet.nombreCandidatures} candidature{projet.nombreCandidatures > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer compact */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Créé le {formaterDate(projet.dateCreation)}
            </div>

            <div className="flex items-center gap-2">
              {onPostuler && afficherBoutonPostuler && (
                <button
                  onClick={() => onPostuler(projet.id)}
                  className="btn btn-primary btn-sm gap-1"
                >
                  <Users size={14} />
                  Postuler
                </button>
              )}
              <button
                onClick={() => onViewDetails(projet.id)}
                className="btn btn-outline btn-primary btn-sm gap-1"
              >
                Détails
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Boutons positionnés à l'extérieur de la carte */}
      <div className="absolute bottom-0 -right-16 flex flex-col gap-3">
        {/* Bouton Partager */}
        {onShare && (
          <div className="flex flex-col items-center">
            <button
              onClick={() => onShare(projet)}
              className="w-10 h-10 bg-emerald-600 hover:bg-emerald-700 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm shadow-lg"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <span className="text-[10px] text-gray-600 mt-0.5 font-medium">Partager</span>
          </div>
        )}

        {/* Bouton Détails */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => onViewDetails(projet.id)}
            className="w-10 h-10 bg-emerald-600 hover:bg-emerald-700 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm shadow-lg"
          >
            <Eye className="w-4 h-4" />
          </button>
          <span className="text-[10px] text-gray-600 mt-0.5 font-medium">Détails</span>
        </div>

        {/* Bouton Postuler */}
        {onPostuler && afficherBoutonPostuler && (
          <div className="flex flex-col items-center">
            <button
              onClick={() => onPostuler(projet.id)}
              className="w-12 h-12 bg-emerald-600 hover:bg-emerald-700 rounded-full flex items-center justify-center text-white transition-colors shadow-lg"
            >
              <Briefcase className="w-5 h-5" />
            </button>
            <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">Postuler</span>
          </div>
        )}
      </div>
    </div>
  );
}
