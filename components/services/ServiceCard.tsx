"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Heart, Loader2 } from "lucide-react";
import { useState, type MouseEvent } from "react";
import { toast } from "sonner";
import { useWishlistStore } from "@/store/wishlistStore";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import type { ServiceListItem } from "@/store/serviceStore";

const FALLBACK_IMAGE = "/placeholder-product.png";

type ServiceCardProps = ServiceListItem & {
  subcategory_name?: string | null;
};

export function ServiceCard({
  id,
  name,
  description,
  rating,
  review_count,
  category_label,
  subcategory_name,
  vendor_count,
  starting_price,
  image_url,
}: ServiceCardProps) {
  const ratingValue = rating ? parseFloat(rating) : 0;
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  
  const items = useWishlistStore((state) => state.items);
  const addItem = useWishlistStore((state) => state.addItem);
  const removeItem = useWishlistStore((state) => state.removeItem);
  
  const isSaved = items.some((item) => item.itemType === "service" && item.serviceId === id);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveToWishlist = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please sign in to save services to your wishlist");
      router.push("/login");
      return;
    }

    setIsSaving(true);
    try {
      if (isSaved) {
        const success = await removeItem(`service:${id}`);
        if (success) {
          toast.success("Removed from wishlist");
        } else {
          toast.error("Failed to remove from wishlist");
        }
      } else {
        const success = await addItem({
          itemType: "service",
          productId: `service:${id}`,
          serviceId: id,
          productName: name,
          description: description || "",
          image: image_url || FALLBACK_IMAGE,
          vendorId: null,
          vendorName: "",
          price: starting_price ? parseFloat(starting_price) : 0,
          moq: 1,
          stockQuantity: 1,
        });
        if (success) {
          toast.success("Saved to wishlist");
        } else {
          toast.error("Failed to save to wishlist");
        }
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:border-zinc-300 hover:shadow-md h-full">
      <button
        type="button"
        onClick={handleSaveToWishlist}
        disabled={isSaving}
        className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/95 text-zinc-500 shadow-sm transition-colors hover:text-rose-600 hover:bg-rose-50 disabled:opacity-70"
        aria-label="Save service to wishlist"
      >
        {isSaving ? (
          <Loader2 size={16} className="animate-spin text-zinc-500" />
        ) : (
          <Heart size={16} className={isSaved ? "fill-rose-500 text-rose-500" : ""} />
        )}
      </button>

      <Link href={`/services/${id}`} className="flex h-full flex-col">
        {/* Image */}

        <div className="relative h-48 w-full overflow-hidden bg-zinc-100">
          <Image
            src={image_url || FALLBACK_IMAGE}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized={!!image_url}
            onError={() => {}}
          />
          {Number(vendor_count) > 0 ? (
            <span className="absolute top-2.5 left-2.5 rounded bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-zinc-600 shadow-sm">
              {vendor_count} {Number(vendor_count) === 1 ? "Provider" : "Providers"}
            </span>
          ) : (
            <span className="absolute top-2.5 left-2.5 rounded bg-amber-100/95 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-amber-700 shadow-sm">
              Coming Soon
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-2.5 p-4">
          {/* Category & Subcategory Badges */}
          {(category_label || subcategory_name) && (
            <div className="flex flex-wrap items-center gap-1.5">
              {category_label && (
                <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100/80">
                  {category_label}
                </span>
              )}
              {subcategory_name && (
                <span className="inline-flex items-center text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                  {subcategory_name}
                </span>
              )}
            </div>
          )}

          {/* Service Name */}
          <div>
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 group-hover:text-blue-700 transition-colors">
              {name}
            </h3>
          </div>

          {/* Rating */}
          {ratingValue > 0 && (
            <div className="flex items-center gap-1">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-zinc-800">{ratingValue.toFixed(1)}</span>
              {review_count > 0 && <span className="text-xs text-zinc-400">({review_count})</span>}
            </div>
          )}

          {/* Service Details */}
          <div className="pt-2 border-t border-zinc-100 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500">Providers</span>
              {Number(vendor_count) > 0 ? (
                <span className="font-medium text-emerald-600">
                  {Number(vendor_count) === 1 ? "1 Verified" : `${vendor_count} Verified`}
                </span>
              ) : (
                <span className="font-medium text-amber-600">Coming Soon</span>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className={`mt-auto pt-2 w-full rounded-lg px-3 py-2.5 text-center text-xs font-semibold transition-colors ${
            Number(vendor_count) > 0
              ? "border border-[#1d4ed8] text-[#1d4ed8] group-hover:bg-[#1d4ed8] group-hover:text-white"
              : "border border-zinc-300 text-zinc-400 bg-zinc-50 cursor-not-allowed"
          }`}>
            {Number(vendor_count) > 0 ? "Book Now" : "No Providers Yet"}
          </div>
        </div>
      </Link>
    </article>
  );
}
