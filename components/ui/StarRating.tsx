import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  size?: number;
  maxStars?: number;
  className?: string;
}

export function StarRating({ rating, size = 16, maxStars = 5, className = "" }: StarRatingProps) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[...Array(maxStars)].map((_, i) => (
        <Star
          key={i}
          size={size}
          className={`shrink-0 ${
            i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-zinc-200"
          }`}
        />
      ))}
    </div>
  );
}

interface RatingBadgeProps {
  rating: number;
  reviewCount?: number;
  size?: number;
}

export function RatingBadge({ rating, reviewCount, size = 10 }: RatingBadgeProps) {
  if (!rating || rating <= 0) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-full">
      <Star size={size} fill="currentColor" />
      {Number(rating).toFixed(1)}
      {reviewCount !== undefined && (
        <span className="text-zinc-500 ml-0.5">({reviewCount})</span>
      )}
    </span>
  );
}
