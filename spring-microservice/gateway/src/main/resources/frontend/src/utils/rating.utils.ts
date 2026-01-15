export const renderStars = (rating: number): string => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let stars = '';
  for (let i = 0; i < fullStars; i++) {
    stars += '⭐';
  }
  if (hasHalfStar) {
    stars += '⭐';
  }
  return stars;
};

export const getStarsArray = (rating: number): boolean[] => {
  const stars: boolean[] = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(i <= rating);
  }
  return stars;
};
