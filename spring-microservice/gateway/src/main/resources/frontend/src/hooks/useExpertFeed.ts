import { useState, useEffect, useCallback } from 'react';
import { Expert } from '@/types/expert.types';
import { apiService } from '@/services/api.service';

interface UseExpertFeedProps {
  visiteurId: string;
  batchSize?: number;
}

export const useExpertFeed = ({ visiteurId, batchSize = 5 }: UseExpertFeedProps) => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [nextCursor, setNextCursor] = useState<string>('0');
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Charge le premier lot
  useEffect(() => {
    if (!visiteurId) return;

    const loadInitial = async () => {
      try {
        setLoading(true);
        const data = await apiService.scrollNext(visiteurId, '0', batchSize);
        setExperts(data.pileContenu || []);
        setNextCursor(data.nextCursor || '0');
      } catch (error) {
        console.error('Failed to load initial experts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitial();
  }, [visiteurId, batchSize]);

  // Charge plus d'experts
  const loadMore = useCallback(async () => {
    if (!visiteurId || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      const data = await apiService.scrollNext(visiteurId, nextCursor, batchSize);
      setExperts((prev) => [...prev, ...(data.pileContenu || [])]);
      setNextCursor(data.nextCursor || nextCursor);
    } catch (error) {
      console.error('Failed to load more experts:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [visiteurId, nextCursor, batchSize, isLoadingMore]);

  return {
    experts,
    loading,
    isLoadingMore,
    loadMore,
  };
};
