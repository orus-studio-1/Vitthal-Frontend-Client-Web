"use client";

import Link from "next/link";
import { Heart, ShoppingCart, ArrowRight, Loader2 } from "lucide-react";

interface ProductActionsProps {
  onSaveToWishlist: () => void;
  isSaving: boolean;
}

export function ProductActions({ onSaveToWishlist, isSaving }: ProductActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-3 pt-5 border-t border-zinc-100 mt-auto">
      <a
        href="#vendors-list"
        className="flex-1 px-6 py-3.5 bg-[#1d4ed8] text-white text-sm font-bold rounded-xl hover:bg-blue-800 shadow-md hover:shadow-lg transition-all text-center flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
      >
        <ShoppingCart size={18} />
        Compare Suppliers &amp; Add to Cart
      </a>

      <button
        onClick={onSaveToWishlist}
        disabled={isSaving}
        className="px-5 py-3.5 border border-rose-200 bg-rose-50/80 text-rose-700 text-sm font-semibold rounded-xl hover:bg-rose-100 transition-all text-center flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        title="Add to Wishlist"
      >
        {isSaving ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Heart size={18} className="fill-rose-500/20 text-rose-600" />
        )}
        <span>{isSaving ? "Saving..." : "Wishlist"}</span>
      </button>

      <Link
        href="/cart"
        className="px-5 py-3.5 border border-zinc-200 bg-zinc-50/80 text-zinc-700 text-sm font-semibold rounded-xl hover:border-zinc-300 hover:bg-zinc-100 transition-all text-center flex items-center justify-center gap-1.5"
      >
        <span>Cart</span>
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}
