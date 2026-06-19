"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Loader2 } from "lucide-react";
import { useState } from "react";
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

type ProductCardProps = {
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

export function ProductCard(product: ProductCardProps) {
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

  const handleSaveToWishlist = async () => {
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
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:border-zinc-300 hover:shadow-md h-full">
      <button
        type="button"
        onClick={handleSaveToWishlist}
        disabled={isSaving}
        className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/95 text-zinc-500 shadow-sm transition-colors hover:text-rose-600 hover:bg-rose-50 disabled:opacity-70"
        aria-label="Save product to wishlist"
      >
        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} />}
      </button>

      <Link href={`/product/${product.id}`} className="flex h-full flex-col">
        {/* Image */}
        <div className="relative h-48 w-full overflow-hidden bg-zinc-100">
          <Image
            src={isValidUrl(product.image) ? product.image : FALLBACK_IMAGE}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {product.sellerCount > 0 ? (
            <span className="absolute top-2.5 left-2.5 rounded bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-zinc-600 shadow-sm">
              {product.sellerCount} {product.sellerCount === 1 ? "Supplier" : "Suppliers"}
            </span>
          ) : (
            <span className="absolute top-2.5 left-2.5 rounded bg-amber-100/95 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-amber-700 shadow-sm">
              Coming Soon
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          {/* Product Name */}
          <div>
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900">
              {product.name}
            </h3>
          </div>

          {/* Price Section */}
          <div className="pt-2 border-t border-zinc-100">
            <p className="text-sm text-zinc-500">Price Range</p>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-lg font-bold text-zinc-900">{priceLabel}</span>
              {originalPriceLabel && (
                <span className="text-xs text-zinc-400 line-through font-medium">
                  {originalPriceLabel}
                </span>
              )}
            </div>
          </div>

          {/* Order Details */}
          <div className="pt-2 border-t border-zinc-100 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500">Minimum Order</span>
              <span className="font-medium text-zinc-700">{product.moq} pieces</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500">Suppliers</span>
              {product.sellerCount > 0 ? (
                <span className="font-medium text-emerald-600">
                  {product.sellerCount === 1 ? "1 Verified" : `${product.sellerCount} Verified`}
                </span>
              ) : (
                <span className="font-medium text-amber-600">
                  Coming Soon
                </span>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className={`mt-auto pt-2 w-full rounded-lg px-3 py-2.5 text-center text-xs font-semibold transition-colors ${
            product.sellerCount > 0
              ? "border border-[#1d4ed8] text-[#1d4ed8] group-hover:bg-[#1d4ed8] group-hover:text-white"
              : "border border-zinc-300 text-zinc-400 bg-zinc-50 cursor-not-allowed"
          }`}>
            {product.sellerCount > 0 ? "Order Now" : "No Vendors Yet"}
          </div>
        </div>
      </Link>
    </article>
  );
}

