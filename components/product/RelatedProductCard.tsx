import Link from "next/link";
import { Package, Star } from "lucide-react";
import type { RelatedProduct } from "@/types";

interface RelatedProductCardProps {
  product: RelatedProduct;
}

export function RelatedProductCard({ product: related }: RelatedProductCardProps) {
  const priceLabel =
    related.min_price === related.max_price
      ? `₹${related.min_price?.toLocaleString() || "Contact"}`
      : `₹${related.min_price?.toLocaleString() || 0} – ₹${related.max_price?.toLocaleString() || 0}`;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:border-zinc-300 hover:shadow-md h-full">
      <Link href={`/product/${related.product_id}`} className="flex h-full flex-col">
        {/* Image */}
        <div className="relative h-48 w-full overflow-hidden bg-zinc-100">
          {related.primary_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={related.primary_image}
              alt={related.product_name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-100">
              <Package size={32} className="text-zinc-300" />
            </div>
          )}
          {related.seller_count > 0 ? (
            <span className="absolute top-2.5 left-2.5 rounded bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-zinc-600 shadow-sm">
              {related.seller_count} {related.seller_count === 1 ? "Supplier" : "Suppliers"}
            </span>
          ) : (
            <span className="absolute top-2.5 left-2.5 rounded bg-amber-100/95 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-amber-700 shadow-sm">
              Coming Soon
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900">
            {related.product_name}
          </h3>

          {related.rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="fill-amber-400 text-amber-400" size={12} />
                <span className="text-sm font-medium text-zinc-900">{related.rating}</span>
              </div>
              <span className="text-xs text-zinc-500">({related.review_count || 0})</span>
            </div>
          )}

          <div className="pt-2 border-t border-zinc-100">
            <p className="text-sm text-zinc-500">Price Range</p>
            <p className="text-lg font-bold text-zinc-900">{priceLabel}</p>
          </div>

          <div className="pt-2 border-t border-zinc-100 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500">Minimum Order</span>
              <span className="font-medium text-zinc-700">{related.min_moq || 1} pieces</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500">Suppliers</span>
              {related.seller_count > 0 ? (
                <span className="font-medium text-emerald-600">
                  {related.seller_count === 1 ? "1 Verified" : `${related.seller_count} Verified`}
                </span>
              ) : (
                <span className="font-medium text-amber-600">Coming Soon</span>
              )}
            </div>
          </div>

          <div
            className={`mt-auto pt-2 w-full rounded-lg px-3 py-2.5 text-center text-xs font-semibold transition-colors ${
              related.seller_count > 0
                ? "border border-[#1d4ed8] text-[#1d4ed8] group-hover:bg-[#1d4ed8] group-hover:text-white"
                : "border border-zinc-300 text-zinc-400 bg-zinc-50 cursor-not-allowed"
            }`}
          >
            {related.seller_count > 0 ? "Order Now" : "No Vendors Yet"}
          </div>
        </div>
      </Link>
    </div>
  );
}
