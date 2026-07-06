"use client";

import Link from "next/link";
import { MessageSquare, Loader2 } from "lucide-react";
import { ReviewCard } from "./ReviewCard";
import { ReviewCardSkeleton } from "@/components/ui";
import type { ProductReview } from "@/types";

interface ReviewsListProps {
  reviews: ProductReview[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onViewImage: (url: string) => void;
}

export function ReviewsList({
  reviews,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  onViewImage,
}: ReviewsListProps) {
  if (isLoading && reviews.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <ReviewCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-zinc-200 rounded-2xl bg-white text-center">
        <div className="p-4 bg-zinc-50 rounded-full text-zinc-400 mb-4">
          <MessageSquare size={32} />
        </div>
        <h4 className="text-lg font-semibold text-zinc-900 mb-1">No reviews yet</h4>
        <p className="text-zinc-500 text-sm max-w-sm mb-6">
          Be the first to share your thoughts on this product! Submit reviews for your recent
          purchases to help other buyers.
        </p>
        <Link
          href="/orders"
          className="px-5 py-2.5 bg-[#1d4ed8] text-white text-sm font-semibold rounded-lg hover:bg-blue-800 shadow-md transition-colors"
        >
          View My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((rev) => (
        <ReviewCard key={rev.review_id} review={rev} onViewImage={onViewImage} />
      ))}

      {hasMore && (
        <div className="pt-4 flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="flex items-center gap-2 px-6 py-3 border border-zinc-200 bg-white text-zinc-700 text-sm font-semibold rounded-xl hover:bg-zinc-50 shadow-sm transition-all disabled:opacity-60"
          >
            {isLoadingMore && <Loader2 size={16} className="animate-spin text-blue-600" />}
            {isLoadingMore ? "Loading reviews..." : "Load More Reviews"}
          </button>
        </div>
      )}
    </div>
  );
}
