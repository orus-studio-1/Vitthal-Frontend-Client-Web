import { Star } from "lucide-react";
import type { ReviewStats } from "@/types";

interface RatingBreakdownProps {
  stats: ReviewStats | null;
  productRating: number;
  productReviewCount: number;
}

export function RatingBreakdown({ stats, productRating, productReviewCount }: RatingBreakdownProps) {
  const avgRating = stats ? Number(stats.avg_rating) : Number(productRating || 0);
  const totalReviews = stats ? stats.total_reviews : productReviewCount || 0;

  return (
    <div className="lg:col-span-1 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-zinc-900 mb-4">Rating Breakdown</h3>

      <div className="flex items-center gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50/50 rounded-2xl border border-blue-100/30 min-w-[90px]">
          <span className="text-4xl font-extrabold text-zinc-900">{avgRating.toFixed(1)}</span>
          <p className="text-[11px] text-zinc-500 font-medium mt-1">out of 5</p>
        </div>
        <div>
          <div className="flex items-center gap-0.5 mb-1.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`${i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-zinc-200"} shrink-0`}
                size={18}
              />
            ))}
          </div>
          <p className="text-sm text-zinc-500 font-medium">{totalReviews} customer reviews</p>
        </div>
      </div>

      {/* Bar Chart Breakdown */}
      <div className="space-y-3 pt-4 border-t border-zinc-100">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = stats?.rating_distribution?.[stars] || 0;
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          return (
            <div key={stars} className="flex items-center gap-3 text-sm">
              <span className="w-3 text-zinc-600 font-semibold text-xs">{stars}</span>
              <Star className="fill-amber-400 text-amber-400 shrink-0" size={13} />
              <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-right text-zinc-400 text-xs font-medium">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
