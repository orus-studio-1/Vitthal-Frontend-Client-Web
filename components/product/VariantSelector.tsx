"use client";

import { Layers, Package } from "lucide-react";
import type { ProductDetail, ProductVariant } from "@/types";
import { getVariantThumbnail } from "@/lib/utils/product";
import { getVariantPriceRange } from "@/lib/utils/price";

interface VariantSelectorProps {
  product: ProductDetail;
  selectedVariant: ProductVariant | null;
  onSelectVariant: (variant: ProductVariant) => void;
}

export function VariantSelector({
  product,
  selectedVariant,
  onSelectVariant,
}: VariantSelectorProps) {
  if (!product.variants || product.variants.length === 0) return null;

  return (
    <div className="mb-6 p-5 bg-white rounded-2xl border border-zinc-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
        <label className="text-sm font-bold text-zinc-800 flex items-center gap-2">
          <Layers size={16} className="text-[#1d4ed8]" />
          Select Variant
        </label>
        <span className="text-[11px] text-zinc-400 font-medium bg-zinc-50 px-2 py-0.5 rounded border border-zinc-150">
          Swipe / Scroll
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 pt-1 -mx-2 px-2 snap-x scroll-smooth scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
        {product.variants.map((v) => {
          const isSelected = selectedVariant?.variant_id === v.variant_id;
          const thumbnail = getVariantThumbnail(v, product);
          const name =
            v.variant_name ||
            Object.entries(v.properties || {})
              .map(([, val]) => val)
              .join(" - ") ||
            `Variant ${v.sku || v.variant_id.slice(0, 8)}`;
          const priceStr = getVariantPriceRange(v);

          return (
            <button
              key={v.variant_id}
              onClick={() => onSelectVariant(v)}
              className={`flex-none w-48 p-3 rounded-xl border-2 text-left transition-all snap-start flex gap-3 ${
                isSelected
                  ? "border-[#1d4ed8] bg-blue-50/20 shadow-md ring-2 ring-blue-50/50"
                  : "border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50/50"
              }`}
            >
              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-lg bg-zinc-100 border border-zinc-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                {thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbnail} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <Package className="text-zinc-400" size={20} />
                )}
              </div>
              {/* Details */}
              <div className="min-w-0 flex-1 flex flex-col justify-between">
                <span className={`text-xs font-bold truncate block ${isSelected ? "text-blue-900" : "text-zinc-800"}`}>
                  {name}
                </span>
                <div>
                  <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    {priceStr.startsWith("₹") ? "Starting At" : ""}
                  </span>
                  <span className={`text-[11px] font-bold block truncate ${isSelected ? "text-[#1d4ed8]" : "text-zinc-650"}`}>
                    {priceStr}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
