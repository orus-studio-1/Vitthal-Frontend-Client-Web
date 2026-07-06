"use client";

import Link from "next/link";
import { Heart, ShoppingCart, ArrowRight, Loader2 } from "lucide-react";

interface ProductActionsProps {
  onSaveToWishlist: () => void;
  isSaving: boolean;
}

export function ProductActions({ onSaveToWishlist, isSaving }: ProductActionsProps) {
  return (
    <div className="flex flex-col lg:flex-row items-stretch gap-3 pt-4 border-t border-zinc-100 mt-auto">
      <button
        onClick={onSaveToWishlist}
        disabled={isSaving}
        className="flex-1 px-6 py-3.5 border border-rose-200 bg-rose-50 text-rose-700 text-sm font-semibold rounded-xl hover:bg-rose-100 hover:shadow-md transition-all text-center flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSaving ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Heart size={18} />
        )}
        {isSaving ? "Saving..." : "Save to Wishlist"}
      </button>

      <a
        href="#vendors-list"
        className="flex-1 px-6 py-3.5 bg-[#1d4ed8] text-white text-sm font-semibold rounded-xl hover:bg-blue-800 hover:shadow-lg transition-all text-center flex items-center justify-center gap-2"
      >
        <ShoppingCart size={18} />
        View Suppliers &amp; Add to Cart
      </a>

      <Link
        href="/cart"
        className="flex-1 px-6 py-3.5 border-2 border-zinc-200 text-zinc-700 text-sm font-semibold rounded-xl hover:border-zinc-300 hover:bg-zinc-50 transition-all text-center flex items-center justify-center gap-2"
      >
        Go to Cart
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
