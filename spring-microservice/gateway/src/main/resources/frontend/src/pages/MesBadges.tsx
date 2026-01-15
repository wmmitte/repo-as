import { Link } from 'react-router-dom';
import { Award, ArrowLeft } from 'lucide-react';
import ListeBadges from '../components/badges/ListeBadges';

/**
 * Page pour afficher les badges de compétence de l'utilisateur connecté
 */
export default function MesBadges() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard" className="btn btn-ghost btn-circle">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Award size={40} className="text-primary" />
              Mes Badges de Compétence
            </h1>
            <p className="text-base-content/70 mt-2">
              Consultez tous vos badges de compétence obtenus suite aux reconnaissances validées
            </p>
          </div>
        </div>

        {/* Information */}
        <div className="alert alert-info mb-6">
          <Award size={24} />
          <div>
            <h3 className="font-bold">À propos des badges</h3>
            <div className="text-sm">
              Les badges attestent de vos compétences reconnues par l'organisation.
              Ils sont classés en 4 niveaux : Bronze (débutant), Argent (intermédiaire), Or (avancé), et Platine (expert).
            </div>
          </div>
        </div>

        {/* Liste des badges */}
        <ListeBadges afficherActions={true} />

        {/* Actions rapides */}
        <div className="card bg-base-100 shadow-xl mt-8">
          <div className="card-body">
            <h2 className="card-title">
              Obtenir plus de badges
            </h2>
            <p className="text-base-content/70">
              Pour obtenir de nouveaux badges ou faire progresser vos badges existants,
              demandez une reconnaissance de compétence sur vos expertises.
            </p>
            <div className="card-actions justify-end mt-4">
              <Link
                to="/expertises"
                className="btn btn-primary"
              >
                <Award size={20} />
                Gérer mes expertises
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
