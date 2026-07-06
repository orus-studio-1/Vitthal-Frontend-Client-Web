/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @next/next/no-img-element */
import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Star,
  MessageSquare,
  BadgeCheck,
  Calendar,
  ThumbsUp,
  Loader2,
} from "lucide-react";

interface ProductReviewsProps {
  reviews: any[];
  reviewsStats: any;
  rating: number;
  reviewCount: number;
  hasMoreReviews: boolean;
  loadingReviews: boolean;
  loadingMoreReviews: boolean;
  handleLoadMoreReviews: () => void;
  activeReviewImage: string | null;
  setActiveReviewImage: (img: string | null) => void;
}

export default function ProductReviews({
  reviews,
  reviewsStats,
  rating,
  reviewCount,
  hasMoreReviews,
  loadingReviews,
  loadingMoreReviews,
  handleLoadMoreReviews,
  activeReviewImage,
  setActiveReviewImage,
}: ProductReviewsProps) {
  return (
    <div id="reviews" className="w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Customer Reviews</h2>
          <p className="text-zinc-650">Feedback from verified buyers and suppliers</p>
        </div>
        <Link
          href="/orders"
          className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1.5"
        >
          Write a Review
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Ratings Summary & Distribution */}
        <div className="lg:col-span-1 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-900 mb-4">Rating Breakdown</h3>

          <div className="flex items-center gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50/50 rounded-2xl border border-blue-100/30 min-w-[90px]">
              <span className="text-4xl font-extrabold text-zinc-900">
                {reviewsStats
                  ? Number(reviewsStats.avg_rating).toFixed(1)
                  : Number(rating || 0).toFixed(1)}
              </span>
              <p className="text-[11px] text-zinc-500 font-medium mt-1">out of 5</p>
            </div>
            <div>
              <div className="flex items-center gap-0.5 mb-1.5">
                {[...Array(5)].map((_, i) => {
                  const avgVal = reviewsStats
                    ? Number(reviewsStats.avg_rating)
                    : Number(rating || 0);
                  return (
                    <Star
                      key={i}
                      className={`${
                        i < Math.round(avgVal)
                          ? "fill-amber-400 text-amber-400"
                          : "text-zinc-200"
                      } shrink-0`}
                      size={18}
                    />
                  );
                })}
              </div>
              <p className="text-sm text-zinc-500 font-medium">
                {reviewsStats ? reviewsStats.total_reviews : reviewCount || 0} customer reviews
              </p>
            </div>
          </div>

          {/* Bar Chart Breakdown */}
          <div className="space-y-3 pt-4 border-t border-zinc-100">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviewsStats?.rating_distribution?.[stars] || 0;
              const totalReviews = reviewsStats?.total_reviews || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-3 text-sm">
                  <span className="w-3 text-zinc-600 font-semibold text-xs">{stars}</span>
                  <Star className="fill-amber-400 text-amber-400 shrink-0" size={13} />
                  <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="w-8 text-right text-zinc-400 text-xs font-medium">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Reviews List */}
        <div className="lg:col-span-2">
          {loadingReviews && reviews.length === 0 ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="p-6 border border-zinc-200 rounded-2xl bg-white animate-pulse space-y-3"
                >
                  <div className="h-4 bg-zinc-200 rounded w-1/4"></div>
                  <div className="h-4 bg-zinc-200 rounded w-1/2"></div>
                  <div className="h-16 bg-zinc-100 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-zinc-200 rounded-2xl bg-white text-center">
              <div className="p-4 bg-zinc-50 rounded-full text-zinc-400 mb-4">
                <MessageSquare size={32} />
              </div>
              <h4 className="text-lg font-semibold text-zinc-900 mb-1">No reviews yet</h4>
              <p className="text-zinc-500 text-sm max-w-sm mb-6">
                Be the first to share your thoughts on this product! Submit reviews for your
                recent purchases to help other buyers.
              </p>
              <Link
                href="/orders"
                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-md transition-colors"
              >
                View My Orders
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((rev) => (
                <div
                  key={rev.review_id}
                  className="p-6 border border-zinc-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    {/* Customer Name & Verified Badge */}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-zinc-900">
                          {rev.customer_name}
                        </span>
                        {rev.verified_purchase && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
                            <BadgeCheck size={12} className="text-emerald-605" />
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      {rev.vendor_id && (
                        <p className="text-[11px] text-zinc-450 mt-0.5">
                          Purchased from Supplier #{rev.vendor_id.slice(0, 8)}
                        </p>
                      )}
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 sm:self-start">
                      <Calendar size={12} />
                      <span>
                        {new Date(rev.review_date).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Rating Stars & Title */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`${
                            i < rev.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200"
                          } shrink-0`}
                          size={16}
                        />
                      ))}
                    </div>
                    {rev.review_title && (
                      <h4 className="font-bold text-zinc-900 text-sm leading-snug">
                        {rev.review_title}
                      </h4>
                    )}
                  </div>

                  {/* Review Text */}
                  {rev.review_text && (
                    <p className="text-zinc-700 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                      {rev.review_text}
                    </p>
                  )}

                  {/* Attached photo gallery */}
                  {rev.images && rev.images.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {rev.images.map((imgUrl: string, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => setActiveReviewImage(imgUrl)}
                            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50 hover:opacity-90 hover:border-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
                          >
                            <img
                              src={imgUrl}
                              alt={`Review Photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Helpful CTA */}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-50 text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span>Was this review helpful?</span>
                      <button
                        onClick={() => {}}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-650 hover:bg-zinc-100 hover:text-zinc-800 transition-colors"
                      >
                        <ThumbsUp size={12} />
                        <span>Helpful</span>
                      </button>
                    </div>
                    <span>Rating: {rev.rating_label || "Verified"}</span>
                  </div>
                </div>
              ))}

              {/* Load More Button */}
              {hasMoreReviews && (
                <div className="pt-4 flex justify-center">
                  <button
                    onClick={handleLoadMoreReviews}
                    disabled={loadingMoreReviews}
                    className="flex items-center gap-2 px-6 py-3 border border-zinc-200 bg-white text-zinc-700 text-sm font-semibold rounded-xl hover:bg-zinc-50 shadow-sm transition-all disabled:opacity-60"
                  >
                    {loadingMoreReviews && (
                      <Loader2 size={16} className="animate-spin text-blue-600" />
                    )}
                    {loadingMoreReviews ? "Loading reviews..." : "Load More Reviews"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
