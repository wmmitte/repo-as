import { useSession } from '@/hooks/useSession';
import { useExpertFeed } from '@/hooks/useExpertFeed';
import { useHeaderConfig } from '@/hooks/useHeaderConfig';
import ExpertFeed from '@/components/feed/ExpertFeed';
import Loader from '@/components/ui/Loader';

export default function HomePage() {
  const { visiteurId, isInitialized } = useSession();
  const { experts, loading, isLoadingMore, loadMore } = useExpertFeed({
    visiteurId,
    batchSize: 5,
  });

  // Configurer le Header pour cette page
  useHeaderConfig({});

  if (!isInitialized || loading) {
    return <Loader />;
  }

  return (
      <ExpertFeed
        experts={experts}
        visiteurId={visiteurId}
        onLoadMore={loadMore}
        isLoadingMore={isLoadingMore}
      />
  );
}
