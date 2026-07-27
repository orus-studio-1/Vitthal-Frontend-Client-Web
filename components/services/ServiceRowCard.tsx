"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";
import type { ServiceListItem } from "@/store/serviceStore";

const FALLBACK_IMAGE = "/placeholder-product.png";

type ServiceRowCardProps = ServiceListItem & {
  subcategory_name?: string | null;
};

export function ServiceRowCard({
  id,
  name,
  description,
  rating,
  review_count,
  category_label,
  subcategory_name,
  vendor_count,
  image_url,
}: ServiceRowCardProps) {
  const ratingValue = rating ? parseFloat(rating) : 0;
  return (
    <article className="group relative flex items-center gap-6 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:border-zinc-400 hover:shadow-md cursor-pointer">
      <Link href={`/services/${id}`} className="flex flex-1 items-center gap-6">
        {/* Image */}
        <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-zinc-100 rounded-md">
          <Image
            src={image_url || FALLBACK_IMAGE}
            alt={name}
            fill
            sizes="100px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized={!!image_url}
          />
          {Number(vendor_count) > 0 ? (
            <span className="absolute top-1 left-1 rounded bg-white/90 backdrop-blur-sm px-1.5 py-0.5 text-[9px] font-medium text-zinc-600 shadow-sm">
              {vendor_count} {Number(vendor_count) === 1 ? "Provider" : "Providers"}
            </span>
          ) : (
            <span className="absolute top-1 left-1 rounded bg-amber-100/95 backdrop-blur-sm px-1.5 py-0.5 text-[9px] font-medium text-amber-700 shadow-sm">
              Coming Soon
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Service Name & Category */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="line-clamp-1 text-sm font-semibold text-zinc-900">
              {name}
            </h3>
            {category_label && (
              <span className="inline-flex items-center rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600">
                {subcategory_name ? `${category_label} > ${subcategory_name}` : category_label}
              </span>
            )}
          </div>

          {/* Description */}
          {description && (
            <p className="text-xs text-zinc-500 line-clamp-1 mb-2 leading-relaxed">
              {description}
            </p>
          )}

          {/* Provider Stats */}
          <div className="mb-2">
            <div>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-0.5">Rating</p>
              <div className="flex items-center gap-1">
                <Star size={12} className={ratingValue > 0 ? "fill-amber-400 text-amber-400" : "text-zinc-200"} />
                <span className="text-sm font-semibold text-zinc-900">
                  {ratingValue > 0 ? ratingValue.toFixed(1) : "N/A"}
                </span>
                {review_count > 0 && (
                  <span className="text-xs text-zinc-400 font-normal">({review_count} reviews)</span>
                )}
              </div>
            </div>
          </div>

          {/* Status badge */}
          <div>
            {Number(vendor_count) > 0 ? (
              <span className="text-xs font-medium text-emerald-600">
                {Number(vendor_count) === 1 ? "1 Verified Service Provider" : `${vendor_count} Verified Service Providers`}
              </span>
            ) : (
              <span className="text-xs font-medium text-amber-600">
                Providers Coming Soon
              </span>
            )}
          </div>
        </div>

        {/* CTA Arrow */}
        <div className="shrink-0">
          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center transition-all group-hover:bg-[#1d4ed8] group-hover:text-white">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    </article>
  );
}
