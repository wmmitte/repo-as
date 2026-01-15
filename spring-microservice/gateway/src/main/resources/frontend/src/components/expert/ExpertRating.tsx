import { renderStars } from '@/utils/rating.utils';

interface ExpertRatingProps {
  rating: number;
  nombreProjets: number;
}

export default function ExpertRating({ rating, nombreProjets }: ExpertRatingProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-lg">{renderStars(rating)}</span>
      <span className="text-lg font-semibold text-gray-900">{rating}/5</span>
      <span className="text-sm text-gray-600">({nombreProjets} projets)</span>
    </div>
  );
}
