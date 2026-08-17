import { Star } from "lucide-react";

interface ProductRatingProps {
  rating: number;
  reviewCount: number;
}

export function ProductRating({ rating, reviewCount }: ProductRatingProps) {
  return (
    <a
      href="#reviews"
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50/80 hover:bg-amber-100/80 rounded-xl border border-amber-200/80 mb-4 transition-colors cursor-pointer w-fit"
    >
      <div className="flex items-center gap-1">
        <Star className="fill-amber-400 text-amber-400" size={14} />
        <span className="text-xs font-bold text-amber-900">{Number(rating || 0).toFixed(1)}</span>
      </div>
      <span className="text-xs text-amber-800 font-medium">
        ({reviewCount || 0} {reviewCount === 1 ? "review" : "reviews"})
      </span>
      <span className="text-[11px] text-amber-600 font-medium hidden sm:inline">• Verified Quality</span>
    </a>
  );
}
