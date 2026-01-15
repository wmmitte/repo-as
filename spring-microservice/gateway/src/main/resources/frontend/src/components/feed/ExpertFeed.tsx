import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Expert } from '@/types/expert.types';
import ExpertCard from '@/components/expert/ExpertCard';
import ModalPartageExpert from '@/components/partage/ModalPartageExpert';
import ModalPropositionProjet from '@/components/proposition/ModalPropositionProjet';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useDwellTracking } from '@/hooks/useDwellTracking';

interface ExpertFeedProps {
  experts: Expert[];
  visiteurId: string;
  onLoadMore: () => void;
  isLoadingMore: boolean;
}

export default function ExpertFeed({
  experts,
  visiteurId,
  onLoadMore,
  isLoadingMore,
}: ExpertFeedProps) {
  const navigate = useNavigate();
  const feedRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useInfiniteScroll({
    onLoadMore,
    threshold: 400,
    isLoading: isLoadingMore,
  });
  const { startDwell } = useDwellTracking(visiteurId);
  const [currentFocused, setCurrentFocused] = useState<string | null>(null);
  const [modalPartageOuvert, setModalPartageOuvert] = useState(false);
  const [modalPropositionOuverte, setModalPropositionOuverte] = useState(false);
  const [expertSelectionne, setExpertSelectionne] = useState<Expert | null>(null);

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

  const handlePropose = (expertId: string) => {
    const expert = experts.find(exp => exp.id === expertId);
    if (expert) {
      setExpertSelectionne(expert);
      setModalPropositionOuverte(true);
    }
  };

  const handleViewProfile = (expertId: string) => {
    navigate(`/expert/${expertId}`);
  };

  const handleShare = (expert: Expert) => {
    setExpertSelectionne(expert);
    setModalPartageOuvert(true);
  };

  const fermerModals = () => {
    setModalPartageOuvert(false);
    setModalPropositionOuverte(false);
    setExpertSelectionne(null);
  };

  return ( 
    <div
      ref={feedRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory px-4"
      style={{ scrollBehavior: 'smooth' }}
    >
      {experts && experts.length > 0 ? (
        experts.map((expert) => (
          <div key={expert.id} className="h-screen flex items-center justify-center py-6 snap-start snap-always">
            <ExpertCard 
              expert={expert} 
              onPropose={handlePropose}
              onViewProfile={handleViewProfile}
              onShare={handleShare}
            />
          </div>
        ))
      ) : (
        <div className="h-screen flex items-center justify-center">
          <p className="text-gray-600 text-xl">Aucun expert à afficher</p>
        </div>
      )}
      
      {/* Sentinel pour infinite scroll */}
      <div ref={sentinelRef} className="h-10" />
      
      {isLoadingMore && (
        <div className="h-screen flex items-center justify-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      )}

      {/* Modals */}
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
