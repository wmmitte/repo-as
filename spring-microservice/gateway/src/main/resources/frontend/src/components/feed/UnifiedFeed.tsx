import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Expert } from '@/types/expert.types';
import { ProjetResume } from '@/types/projet.types';
import { FeedItem, FeedFilter } from '@/hooks/useUnifiedFeed';
import ExpertCard from '@/components/expert/ExpertCard';
import ProjetFeedCard from './ProjetFeedCard';
import ModalPartageExpert from '@/components/partage/ModalPartageExpert';
import ModalPropositionProjet from '@/components/proposition/ModalPropositionProjet';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useDwellTracking } from '@/hooks/useDwellTracking';
import { useAuth } from '@/context/AuthContext';
import { projetService } from '@/services/projet.service';
import { Users, Briefcase, LayoutGrid } from 'lucide-react';

interface UnifiedFeedProps {
  items: FeedItem[];
  visiteurId: string;
  onLoadMore: () => void;
  isLoadingMore: boolean;
  hasMore: boolean;
  filter: FeedFilter;
  onFilterChange: (filter: FeedFilter) => void;
}

// Configuration des filtres
const FILTRES = [
  { value: 'tous' as FeedFilter, label: 'Tous', icon: LayoutGrid },
  { value: 'projets' as FeedFilter, label: 'Projets', icon: Briefcase },
  { value: 'experts' as FeedFilter, label: 'Experts', icon: Users }
];

export default function UnifiedFeed({
  items,
  visiteurId,
  onLoadMore,
  isLoadingMore,
  hasMore,
  filter,
  onFilterChange
}: UnifiedFeedProps) {
  const navigate = useNavigate();
  const feedRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useInfiniteScroll({
    onLoadMore,
    threshold: 400,
    isLoading: isLoadingMore,
  });
  const { startDwell } = useDwellTracking(visiteurId);
  const [currentFocused, setCurrentFocused] = useState<string | null>(null);

  // Auth et candidatures
  const { user, isAuthenticated } = useAuth();
  const [projetsPostules, setProjetsPostules] = useState<Set<number>>(new Set());

  // Modals pour experts
  const [modalPartageOuvert, setModalPartageOuvert] = useState(false);
  const [modalPropositionOuverte, setModalPropositionOuverte] = useState(false);
  const [expertSelectionne, setExpertSelectionne] = useState<Expert | null>(null);

  // Charger les candidatures de l'utilisateur connecté
  useEffect(() => {
    const chargerMesCandidatures = async () => {
      if (!isAuthenticated || !user) {
        setProjetsPostules(new Set());
        return;
      }

      try {
        const candidatures = await projetService.listerMesCandidatures();
        // Créer un Set des IDs de projets auxquels l'utilisateur a postulé
        const projetsIds = new Set(candidatures.map(c => c.projetId));
        setProjetsPostules(projetsIds);
      } catch (error) {
        console.error('Erreur lors du chargement des candidatures:', error);
        setProjetsPostules(new Set());
      }
    };

    chargerMesCandidatures();
  }, [isAuthenticated, user]);

  // Détection de la carte visible
  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const cardElements: HTMLElement[] = Array.from(
            feed.querySelectorAll<HTMLElement>('[data-id]')
          );
          let bestCard: HTMLElement | null = null;
          let bestArea: number = 0;
          const viewTop: number = feed.scrollTop;
          const viewBottom: number = viewTop + feed.clientHeight;

          cardElements.forEach((card: HTMLElement) => {
            const rect: DOMRect = card.getBoundingClientRect();
            const top: number = rect.top + feed.scrollTop;
            const bottom: number = rect.bottom + feed.scrollTop;
            const visible: number = Math.max(
              0,
              Math.min(bottom, viewBottom) - Math.max(top, viewTop)
            );

            if (visible > bestArea) {
              bestArea = visible;
              bestCard = card;
            }
          });

          if (bestCard) {
            const focusedId: string | null = (bestCard as HTMLElement).getAttribute('data-id');
            if (focusedId && focusedId !== currentFocused) {
              setCurrentFocused(focusedId);
              startDwell(focusedId);
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    feed.addEventListener('scroll', onScroll, { passive: true });
    return () => feed.removeEventListener('scroll', onScroll);
  }, [currentFocused, startDwell]);

  // Handlers pour experts
  const handleProposeExpert = (expertId: string) => {
    const item = items.find(i => i.type === 'expert' && (i.data as Expert).id === expertId);
    if (item) {
      setExpertSelectionne(item.data as Expert);
      setModalPropositionOuverte(true);
    }
  };

  const handleViewExpertProfile = (expertId: string) => {
    navigate(`/expertise-profil/${expertId}`);
  };

  const handleShareExpert = (expert: Expert) => {
    setExpertSelectionne(expert);
    setModalPartageOuvert(true);
  };

  // Handlers pour projets
  const handleViewProjetDetails = (projetId: number) => {
    navigate(`/projets/${projetId}`);
  };

  const handlePostulerProjet = (projetId: number) => {
    navigate(`/projets/${projetId}?action=postuler`);
  };

  const fermerModals = () => {
    setModalPartageOuvert(false);
    setModalPropositionOuverte(false);
    setExpertSelectionne(null);
  };

  // Rendu d'un item selon son type
  const renderItem = (item: FeedItem) => {
    if (item.type === 'expert') {
      const expert = item.data as Expert;
      return (
        <ExpertCard
          expert={expert}
          onPropose={handleProposeExpert}
          onViewProfile={handleViewExpertProfile}
          onShare={handleShareExpert}
        />
      );
    } else {
      const projet = item.data as ProjetResume;
      const aDejaPostule = projetsPostules.has(projet.id);
      return (
        <ProjetFeedCard
          projet={projet}
          onViewDetails={handleViewProjetDetails}
          onPostuler={handlePostulerProjet}
          estConnecte={isAuthenticated}
          aDejaPostule={aDejaPostule}
        />
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-base-200">
      {/* Barre de filtres fixe */}
      <div className="flex-shrink-0 bg-base-100/95 backdrop-blur-sm border-b border-base-300 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            {FILTRES.map((f) => {
              const Icon = f.icon;
              const isActive = filter === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => onFilterChange(f.value)}
                  className={`btn btn-sm gap-2 ${
                    isActive
                      ? f.value === 'projets'
                        ? 'btn-success'
                        : f.value === 'experts'
                          ? 'btn-primary'
                          : 'btn-neutral'
                      : 'btn-ghost'
                  }`}
                >
                  <Icon size={16} />
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feed scrollable - Layout centré traditionnel */}
      <div
        ref={feedRef}
        className="flex-1 overflow-y-auto px-4 py-6"
      >
        {items && items.length > 0 ? (
          <div className="w-full max-w-[92%] sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                data-id={item.id}
              >
                {renderItem(item)}
              </div>
            ))}
          </div>
        ) : (
          <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <div className="text-center">
              {filter === 'experts' ? (
                <>
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-xl">Aucun expert à afficher</p>
                  <p className="text-gray-400 mt-2">Revenez plus tard pour découvrir de nouveaux talents</p>
                </>
              ) : filter === 'projets' ? (
                <>
                  <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-xl">Aucun projet disponible</p>
                  <p className="text-gray-400 mt-2">Revenez plus tard pour découvrir de nouvelles opportunités</p>
                </>
              ) : (
                <>
                  <LayoutGrid className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-xl">Aucun contenu à afficher</p>
                  <p className="text-gray-400 mt-2">Revenez plus tard pour découvrir experts et projets</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Sentinel pour infinite scroll */}
        {hasMore && <div ref={sentinelRef} className="h-10" />}

        {isLoadingMore && (
          <div className="py-8 flex items-center justify-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        )}

        {/* Message fin de feed */}
        {!hasMore && items.length > 0 && (
          <div className="py-8 flex items-center justify-center">
            <p className="text-gray-400 text-sm">Vous avez tout vu !</p>
          </div>
        )}
      </div>

      {/* Modals pour experts */}
      {expertSelectionne && (
        <>
          <ModalPartageExpert
            expert={expertSelectionne}
            isOpen={modalPartageOuvert}
            onClose={fermerModals}
          />
          <ModalPropositionProjet
            expert={expertSelectionne}
            isOpen={modalPropositionOuverte}
            onClose={fermerModals}
          />
        </>
      )}
    </div>
  );
}
