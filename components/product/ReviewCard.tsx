"use client";

import { BadgeCheck, Calendar, ThumbsUp, Star } from "lucide-react";
import type { ProductReview } from "@/types";
import { toast } from "sonner";

interface ReviewCardProps {
  review: ProductReview;
  onViewImage: (url: string) => void;
}

export function ReviewCard({ review: rev, onViewImage }: ReviewCardProps) {
  return (
    <div className="p-6 border border-zinc-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        {/* Customer Name & Verified Badge */}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-zinc-900">{rev.customer_name}</span>
            {rev.verified_purchase && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
                <BadgeCheck size={12} className="text-emerald-600" />
                Verified Buyer
              </span>
            )}
          </div>
          {rev.vendor_id && (
            <p className="text-[11px] text-zinc-400 mt-0.5">
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
              className={`${i < rev.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200"} shrink-0`}
              size={16}
            />
          ))}
        </div>
        {rev.review_title && (
          <h4 className="font-bold text-zinc-900 text-sm leading-snug">{rev.review_title}</h4>
        )}
      </div>

      {/* Review Text */}
      {rev.review_text && (
        <p className="text-zinc-700 text-sm leading-relaxed mb-4 whitespace-pre-wrap">{rev.review_text}</p>
      )}

      {/* Attached photo gallery */}
      {rev.images && rev.images.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {rev.images.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => onViewImage(imgUrl)}
                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50 hover:opacity-90 hover:border-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
                aria-label={`View review photo ${idx + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgUrl} alt={`Review Photo ${idx + 1}`} className="w-full h-full object-cover" />
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
            onClick={() => toast.success("Thanks for your feedback!")}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-800 transition-colors"
          >
            <ThumbsUp size={12} />
            <span>Helpful</span>
          </button>
        </div>
        <span>Rating: {rev.rating_label || "Verified"}</span>
      </div>
    </div>
  );
}
