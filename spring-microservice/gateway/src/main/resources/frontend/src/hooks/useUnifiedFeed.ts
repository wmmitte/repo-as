import { useState, useEffect, useCallback } from 'react';
import { Expert } from '@/types/expert.types';
import { ProjetResume } from '@/types/projet.types';
import { apiService } from '@/services/api.service';
import { projetService } from '@/services/projet.service';

// Type pour un élément du feed unifié
export type FeedItemType = 'expert' | 'projet';

export interface FeedItem {
  type: FeedItemType;
  id: string;
  data: Expert | ProjetResume;
  score?: number; // Pour le tri/ranking
}

export type FeedFilter = 'tous' | 'experts' | 'projets';

interface UseUnifiedFeedProps {
  visiteurId: string;
  batchSize?: number;
  filter?: FeedFilter;
}

interface FeedState {
  items: FeedItem[];
  expertCursor: string;
  projetPage: number;
  hasMoreExperts: boolean;
  hasMoreProjets: boolean;
}

export const useUnifiedFeed = ({
  visiteurId,
  batchSize = 5,
  filter = 'tous'
}: UseUnifiedFeedProps) => {
  const [state, setState] = useState<FeedState>({
    items: [],
    expertCursor: '0',
    projetPage: 0,
    hasMoreExperts: true,
    hasMoreProjets: true
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Convertir un expert en FeedItem
  const expertToFeedItem = (expert: Expert): FeedItem => ({
    type: 'expert',
    id: `expert-${expert.id}`,
    data: expert,
    score: expert.rating || 0
  });

  // Convertir un projet en FeedItem
  const projetToFeedItem = (projet: ProjetResume): FeedItem => ({
    type: 'projet',
    id: `projet-${projet.id}`,
    data: projet,
    score: projet.nombreTachesDisponibles || 0
  });

  // Mélanger les items de manière alternée
  const mergerItems = (experts: FeedItem[], projets: FeedItem[]): FeedItem[] => {
    const result: FeedItem[] = [];
    const maxLen = Math.max(experts.length, projets.length);

    for (let i = 0; i < maxLen; i++) {
      // Alterner : projet, expert, projet, expert...
      if (i < projets.length) {
        result.push(projets[i]);
      }
      if (i < experts.length) {
        result.push(experts[i]);
      }
    }

    return result;
  };

  // Charger le contenu initial
  const loadInitial = useCallback(async () => {
    if (!visiteurId) return;

    try {
      setLoading(true);

      const shouldLoadExperts = filter === 'tous' || filter === 'experts';
      const shouldLoadProjets = filter === 'tous' || filter === 'projets';

      let newExperts: FeedItem[] = [];
      let newProjets: FeedItem[] = [];
      let newExpertCursor = '0';
      let newProjetPage = 0;
      let hasMoreExperts = true;
      let hasMoreProjets = true;

      // Charger les experts
      if (shouldLoadExperts) {
        try {
          const expertData = await apiService.scrollNext(visiteurId, '0', batchSize);
          newExperts = (expertData.pileContenu || []).map(expertToFeedItem);
          newExpertCursor = expertData.nextCursor || '0';
          hasMoreExperts = newExperts.length === batchSize;
        } catch (error) {
          console.error('Erreur chargement experts:', error);
          hasMoreExperts = false;
        }
      } else {
        hasMoreExperts = false;
      }

      // Charger les projets publics
      if (shouldLoadProjets) {
        try {
          const projetData = await projetService.listerProjetsAvecTachesDisponibles(0, batchSize);
          newProjets = (projetData.content || []).map(projetToFeedItem);
          newProjetPage = 1;
          hasMoreProjets = !projetData.last;
        } catch (error) {
          console.error('Erreur chargement projets:', error);
          hasMoreProjets = false;
        }
      } else {
        hasMoreProjets = false;
      }

      // Mélanger les items
      const items = filter === 'tous'
        ? mergerItems(newExperts, newProjets)
        : [...newProjets, ...newExperts];

      setState({
        items,
        expertCursor: newExpertCursor,
        projetPage: newProjetPage,
        hasMoreExperts,
        hasMoreProjets
      });
    } catch (error) {
      console.error('Erreur chargement initial:', error);
    } finally {
      setLoading(false);
    }
  }, [visiteurId, batchSize, filter]);

  // Charger plus de contenu
  const loadMore = useCallback(async () => {
    if (!visiteurId || isLoadingMore) return;
    if (!state.hasMoreExperts && !state.hasMoreProjets) return;

    try {
      setIsLoadingMore(true);

      const shouldLoadExperts = (filter === 'tous' || filter === 'experts') && state.hasMoreExperts;
      const shouldLoadProjets = (filter === 'tous' || filter === 'projets') && state.hasMoreProjets;

      let newExperts: FeedItem[] = [];
      let newProjets: FeedItem[] = [];
      let newExpertCursor = state.expertCursor;
      let newProjetPage = state.projetPage;
      let hasMoreExperts = state.hasMoreExperts;
      let hasMoreProjets = state.hasMoreProjets;

      // Charger plus d'experts
      if (shouldLoadExperts) {
        try {
          const expertData = await apiService.scrollNext(visiteurId, state.expertCursor, batchSize);
          newExperts = (expertData.pileContenu || []).map(expertToFeedItem);
          newExpertCursor = expertData.nextCursor || state.expertCursor;
          hasMoreExperts = newExperts.length === batchSize;
        } catch (error) {
          console.error('Erreur chargement experts:', error);
          hasMoreExperts = false;
        }
      }

      // Charger plus de projets
      if (shouldLoadProjets) {
        try {
          const projetData = await projetService.listerProjetsAvecTachesDisponibles(state.projetPage, batchSize);
          newProjets = (projetData.content || []).map(projetToFeedItem);
          newProjetPage = state.projetPage + 1;
          hasMoreProjets = !projetData.last;
        } catch (error) {
          console.error('Erreur chargement projets:', error);
          hasMoreProjets = false;
        }
      }

      // Mélanger les nouveaux items
      const newItems = filter === 'tous'
        ? mergerItems(newExperts, newProjets)
        : [...newProjets, ...newExperts];

      setState(prev => ({
        items: [...prev.items, ...newItems],
        expertCursor: newExpertCursor,
        projetPage: newProjetPage,
        hasMoreExperts,
        hasMoreProjets
      }));
    } catch (error) {
      console.error('Erreur chargement supplémentaire:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [visiteurId, batchSize, filter, isLoadingMore, state]);

  // Charger au montage ou quand le filtre change
  useEffect(() => {
    // Réinitialiser l'état avant de charger
    setState({
      items: [],
      expertCursor: '0',
      projetPage: 0,
      hasMoreExperts: true,
      hasMoreProjets: true
    });
    loadInitial();
  }, [filter, visiteurId]); // Recharger quand filter ou visiteurId change

  return {
    items: state.items,
    loading,
    isLoadingMore,
    loadMore,
    hasMore: state.hasMoreExperts || state.hasMoreProjets
  };
};
