"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Loader2 } from "lucide-react";
import { useState, type MouseEvent } from "react";
import { toast } from "sonner";
import { useWishlistStore } from "@/store/wishlistStore";

const FALLBACK_IMAGE = "/placeholder-product.png";

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

type ProductRowCardProps = {
  name: string;
  minPrice: number;
  maxPrice: number;
  minOriginalPrice?: number;
  maxOriginalPrice?: number;
  moq: number;
  sellerCount: number;
  image: string;
  id: string;
};

export function ProductRowCard(product: ProductRowCardProps) {
  const hasDiscount = product.minOriginalPrice !== undefined && product.minOriginalPrice > product.minPrice;
  const priceLabel = product.minPrice === product.maxPrice
    ? `₹${product.minPrice.toLocaleString()}`
    : `₹${product.minPrice.toLocaleString()} – ₹${product.maxPrice.toLocaleString()}`;
  const originalPriceLabel = hasDiscount
    ? (product.minOriginalPrice === product.maxOriginalPrice
        ? `₹${product.minOriginalPrice?.toLocaleString()}`
        : `₹${product.minOriginalPrice?.toLocaleString()} – ₹${product.maxOriginalPrice?.toLocaleString()}`)
    : null;
  const addToWishlist = useWishlistStore((state) => state.addItem);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveToWishlist = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    setIsSaving(true);
    const success = await addToWishlist({
      productId: product.id,
      productName: product.name,
      description: "",
      image: isValidUrl(product.image) ? product.image : FALLBACK_IMAGE,
      vendorId: null,
      vendorName: "",
      price: product.minPrice,
      moq: product.moq,
      stockQuantity: 0,
    });
    setIsSaving(false);

    if (success) {
      toast.success("Saved to wishlist");
    } else {
      toast.error("Failed to save to wishlist");
    }
  };

  return (
    <article className="group relative flex items-center gap-6 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:border-zinc-400 hover:shadow-md cursor-pointer">
      <button
        type="button"
        onClick={handleSaveToWishlist}
        disabled={isSaving}
        className="absolute right-4 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/80 bg-white/95 text-zinc-500 shadow-sm transition-colors hover:text-rose-600 hover:bg-rose-50 disabled:opacity-70"
        aria-label="Save product to wishlist"
      >
        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Heart size={14} />}
      </button>

      <Link href={`/product/${product.id}`} className="flex flex-1 items-center gap-6">
        {/* Image */}
        <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-zinc-100 rounded-md">
          <Image
            src={isValidUrl(product.image) ? product.image : FALLBACK_IMAGE}
            alt={product.name}
            fill
            sizes="100px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {product.sellerCount > 0 ? (
            <span className="absolute top-1 left-1 rounded bg-white/90 backdrop-blur-sm px-1.5 py-0.5 text-[9px] font-medium text-zinc-600 shadow-sm">
              {product.sellerCount} {product.sellerCount === 1 ? "Supplier" : "Suppliers"}
            </span>
          ) : (
            <span className="absolute top-1 left-1 rounded bg-amber-100/95 backdrop-blur-sm px-1.5 py-0.5 text-[9px] font-medium text-amber-700 shadow-sm">
              Coming Soon
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Product Name */}
          <h3 className="line-clamp-1 text-sm font-semibold text-zinc-900 mb-2">
            {product.name}
          </h3>

          {/* Price and MOQ */}
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">Price Range</p>
              <div className="flex flex-wrap items-baseline gap-1.5">
                <span className="text-sm font-bold text-zinc-900">{priceLabel}</span>
                {originalPriceLabel && (
                  <span className="text-[10px] text-zinc-400 line-through font-medium">
                    {originalPriceLabel}
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">Minimum Order</p>
              <p className="text-sm font-bold text-zinc-900">{product.moq} pieces</p>
            </div>
          </div>

          {/* Suppliers Info */}
          <div>
            {product.sellerCount > 0 ? (
              <span className="text-xs font-medium text-emerald-600">
                {product.sellerCount === 1 ? "1 Verified Supplier" : `${product.sellerCount} Verified Suppliers`}
              </span>
            ) : (
              <span className="text-xs font-medium text-amber-600">
                Vendors Coming Soon
              </span>
            )}
          </div>
        </div>

        {/* CTA Arrow */}
        <div className="shrink-0">
          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center transition-all group-hover:bg-[#1d4ed8] group-hover:text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    </article>
  );
}
