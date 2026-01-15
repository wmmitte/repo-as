import { useEffect, useRef } from 'react';

interface UseInfiniteScrollProps {
  onLoadMore: () => void;
  threshold?: number;
  isLoading?: boolean;
}

export const useInfiniteScroll = ({
  onLoadMore,
  threshold = 400,
  isLoading = false,
}: UseInfiniteScrollProps) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0.1,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !isLoading) {
        onLoadMore();
      }
    }, options);

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observerRef.current.observe(currentSentinel);
    }

    return () => {
      if (observerRef.current && currentSentinel) {
        observerRef.current.unobserve(currentSentinel);
      }
    };
  }, [onLoadMore, threshold, isLoading]);

  return sentinelRef;
};
