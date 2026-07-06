import { Star } from "lucide-react";

interface ProductRatingProps {
  rating: number;
  reviewCount: number;
}

export function ProductRating({ rating, reviewCount }: ProductRatingProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200 mb-4">
      <div className="flex items-center gap-1">
        <Star className="fill-amber-400 text-amber-400" size={16} />
        <span className="font-bold text-amber-900">{rating || 0}</span>
      </div>
      <span className="text-sm text-amber-700">
        {reviewCount || 0} {reviewCount === 1 ? "review" : "reviews"}
      </span>
      <span className="text-xs text-amber-600">• Verified by our quality team</span>
    </div>
  );
}
