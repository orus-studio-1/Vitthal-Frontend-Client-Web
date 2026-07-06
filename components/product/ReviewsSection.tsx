"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RatingBreakdown } from "./RatingBreakdown";
import { ReviewsList } from "./ReviewsList";
import type { ProductReview, ReviewStats } from "@/types";

interface ReviewsSectionProps {
  productRating: number;
  productReviewCount: number;
  reviews: ProductReview[];
  stats: ReviewStats | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onViewImage: (url: string) => void;
}

export function ReviewsSection({
  productRating,
  productReviewCount,
  reviews,
  stats,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  onViewImage,
}: ReviewsSectionProps) {
  return (
    <section id="reviews" className="max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Customer Reviews</h2>
          <p className="text-zinc-600">Feedback from verified buyers and suppliers</p>
        </div>
        <Link
          href="/orders"
          className="text-sm font-semibold text-[#1d4ed8] hover:underline flex items-center gap-1.5"
        >
          Write a Review
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <RatingBreakdown
          stats={stats}
          productRating={productRating}
          productReviewCount={productReviewCount}
        />
        <div className="lg:col-span-2">
          <ReviewsList
            reviews={reviews}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            onLoadMore={onLoadMore}
            onViewImage={onViewImage}
          />
        </div>
      </div>
    </section>
  );
}
