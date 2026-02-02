import { useState } from 'react';
import { useSession } from '@/hooks/useSession';
import { useUnifiedFeed, FeedFilter } from '@/hooks/useUnifiedFeed';
import { useHeaderConfig } from '@/hooks/useHeaderConfig';
import UnifiedFeed from '@/components/feed/UnifiedFeed';
import Loader from '@/components/ui/Loader';

export default function HomePage() {
  const { visiteurId, isInitialized } = useSession();
  const [filter, setFilter] = useState<FeedFilter>('tous');

  const { items, loading, isLoadingMore, loadMore, hasMore } = useUnifiedFeed({
    visiteurId,
    batchSize: 5,
    filter
  });

  // Configurer le Header pour cette page
  useHeaderConfig({});

  // Handler pour le changement de filtre
  const handleFilterChange = (newFilter: FeedFilter) => {
    setFilter(newFilter);
  };

  if (!isInitialized || loading) {
    return <Loader />;
  }

  return (
    <UnifiedFeed
      items={items}
      visiteurId={visiteurId}
      onLoadMore={loadMore}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      filter={filter}
      onFilterChange={handleFilterChange}
    />
  );
}
