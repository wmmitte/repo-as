import { useState, useEffect } from 'react';
import { Award, TrendingUp } from 'lucide-react';
import badgeService, { BadgeCompetence, StatistiquesBadges } from '../../services/badgeService';
import BadgeCard from './BadgeCard';

interface ListeBadgesProps {
  utilisateurId?: string; // Si fourni, affiche les badges publics de cet utilisateur (mode public)
  afficherActions?: boolean; // Afficher les actions (toggle visibilité, etc.)
}

/**
 * Composant pour afficher une liste de badges
 */
export default function ListeBadges({
  utilisateurId,
  afficherActions = true
}: ListeBadgesProps) {

  const [badges, setBadges] = useState<BadgeCompetence[]>([]);
  const [statistiques, setStatistiques] = useState<StatistiquesBadges | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [filtreActif, setFiltreActif] = useState<'tous' | 'actifs' | 'inactifs'>('actifs');

  const modePublic = !!utilisateurId;

  useEffect(() => {
    chargerBadges();
    if (!modePublic) {
      chargerStatistiques();
    }
  }, [utilisateurId, filtreActif]);

  const chargerBadges = async () => {
    try {
      setChargement(true);
      setErreur(null);

      let badgesRecuperes: BadgeCompetence[];

      if (modePublic && utilisateurId) {
        // Mode public: récupérer les badges publics d'un autre utilisateur
        badgesRecuperes = await badgeService.getBadgesPublics(utilisateurId);
      } else {
        // Mode privé: récupérer mes propres badges
        const actifSeulement = filtreActif === 'actifs';
        badgesRecuperes = await badgeService.getMesBadges(actifSeulement);

        if (filtreActif === 'inactifs') {
          badgesRecuperes = badgesRecuperes.filter(b => !b.estActif);
        }
      }

      setBadges(badgesRecuperes);
    } catch (err) {
      console.error('Erreur lors du chargement des badges:', err);
      setErreur('Impossible de charger les badges');
    } finally {
      setChargement(false);
    }
  };

  const chargerStatistiques = async () => {
    try {
      const stats = await badgeService.getStatistiques();
      setStatistiques(stats);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    }
  };

  const handleToggleVisibilite = async (badgeId: number) => {
    try {
      const badgeMisAJour = await badgeService.toggleVisibilite(badgeId);

      // Mettre à jour le badge dans la liste
      setBadges(prevBadges =>
        prevBadges.map(b => b.id === badgeId ? badgeMisAJour : b)
      );

      // Afficher un toast de confirmation
      console.log('Visibilité du badge modifiée');
    } catch (err) {
      console.error('Erreur lors du changement de visibilité:', err);
      alert('Erreur lors du changement de visibilité du badge');
    }
  };

  if (chargement) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="alert alert-error">
        <span>{erreur}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques (mode privé uniquement) */}
      {!modePublic && statistiques && (
        <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
          <div className="stat">
            <div className="stat-figure text-primary">
              <Award size={32} />
            </div>
            <div className="stat-title">Total de badges</div>
            <div className="stat-value text-primary">{statistiques.total}</div>
          </div>

          <div className="stat">
            <div className="stat-figure" style={{ color: '#CD7F32' }}>
              🥉
            </div>
            <div className="stat-title">Bronze</div>
            <div className="stat-value">{statistiques.bronze}</div>
          </div>

          <div className="stat">
            <div className="stat-figure" style={{ color: '#C0C0C0' }}>
              🥈
            </div>
            <div className="stat-title">Argent</div>
            <div className="stat-value">{statistiques.argent}</div>
          </div>

          <div className="stat">
            <div className="stat-figure" style={{ color: '#FFD700' }}>
              🥇
            </div>
            <div className="stat-title">Or</div>
            <div className="stat-value">{statistiques.or}</div>
          </div>

          <div className="stat">
            <div className="stat-figure">
              💎
            </div>
            <div className="stat-title">Platine</div>
            <div className="stat-value">{statistiques.platine}</div>
          </div>
        </div>
      )}

      {/* Filtres (mode privé uniquement) */}
      {!modePublic && (
        <div className="flex gap-2">
          <button
            onClick={() => setFiltreActif('actifs')}
            className={`btn btn-sm ${filtreActif === 'actifs' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Actifs ({badges.filter(b => b.estActif).length})
          </button>
          <button
            onClick={() => setFiltreActif('tous')}
            className={`btn btn-sm ${filtreActif === 'tous' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Tous ({badges.length})
          </button>
          <button
            onClick={() => setFiltreActif('inactifs')}
            className={`btn btn-sm ${filtreActif === 'inactifs' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Inactifs ({badges.filter(b => !b.estActif).length})
          </button>
        </div>
      )}

      {/* Liste des badges */}
      {badges.length === 0 ? (
        <div className="text-center py-12">
          <Award size={64} className="mx-auto mb-4 text-base-content/30" />
          <p className="text-lg font-semibold text-base-content/70">
            {modePublic
              ? 'Aucun badge public pour le moment'
              : 'Aucun badge obtenu pour le moment'}
          </p>
          {!modePublic && (
            <p className="text-sm text-base-content/50 mt-2">
              Demandez une reconnaissance de compétence pour obtenir votre premier badge!
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map(badge => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              onToggleVisibilite={afficherActions ? handleToggleVisibilite : undefined}
              afficherActions={afficherActions && !modePublic}
            />
          ))}
        </div>
      )}

      {/* Message d'encouragement */}
      {!modePublic && badges.length > 0 && badges.length < 5 && (
        <div className="alert alert-info">
          <TrendingUp size={24} />
          <div>
            <h3 className="font-bold">Continuez sur votre lancée!</h3>
            <div className="text-sm">
              Vous avez {badges.length} badge{badges.length > 1 ? 's' : ''}.
              Demandez des reconnaissances pour progresser vers le niveau supérieur!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
