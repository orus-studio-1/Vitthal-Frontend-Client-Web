"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Home, ShoppingBag, ArrowLeft, PhoneCall, AlertTriangle } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-zinc-50/50 px-4 py-16 sm:px-6 lg:px-8 font-body">
      <div className="max-w-xl w-full text-center">
        {/* Animated Visual representation: Industrial Gears */}
        <div className="relative flex justify-center items-center mb-8 h-40">
          {/* Big Gear */}
          <div className="absolute animate-[spin_12s_linear_infinite] text-zinc-300">
            <svg
              className="w-32 h-32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>

          {/* Medium Gear */}
          <div className="absolute translate-x-14 -translate-y-8 animate-[spin_8s_linear_infinite] [animation-direction:reverse] text-blue-500/30">
            <svg
              className="w-20 h-20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>

          {/* Small Gear */}
          <div className="absolute -translate-x-14 translate-y-8 animate-[spin_6s_linear_infinite] text-blue-600/40">
            <svg
              className="w-16 h-16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>

          {/* Floating warning icon in center */}
          <div className="absolute flex items-center justify-center bg-white shadow-lg border border-zinc-200 text-blue-700 w-16 h-16 rounded-2xl animate-bounce">
            <AlertTriangle size={30} strokeWidth={2.2} />
          </div>
        </div>

        {/* 404 Text */}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-blue-700">
          Error Code: 404
        </span>

        <h2 className="font-heading mt-6 text-3xl font-extrabold text-zinc-900 sm:text-4xl tracking-tight">
          Page Not Found
        </h2>

        <p className="mt-4 text-base font-light text-zinc-600 max-w-md mx-auto leading-relaxed">
          We couldn&apos;t find the industrial resource or page you are looking for. It might have been moved, deleted, or the address might be incorrect.
        </p>

        {/* Search Input Container */}
        <div className="mt-8 border border-zinc-200/80 bg-white p-4 rounded-2xl shadow-sm max-w-md mx-auto text-left">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2.5">
            Search our marketplace
          </p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input
                type="text"
                placeholder="Search products, materials, suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 pl-10 pr-4 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-blue-700 focus:bg-white focus:ring-2 focus:ring-blue-700/15"
              />
            </div>
            <button
              type="submit"
              className="h-10 whitespace-nowrap rounded-lg bg-[#1d4ed8] px-4 text-sm font-semibold text-white transition-all hover:bg-[#1e40af] shadow-xs active:scale-[0.98] cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* Action Button Controls */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4 max-w-sm sm:max-w-none mx-auto">
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto h-11 flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-5 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 hover:text-zinc-900 shadow-2xs active:scale-[0.98] cursor-pointer"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto h-11 flex items-center justify-center gap-2 rounded-lg bg-[#1d4ed8] px-5 text-sm font-semibold text-white transition-all hover:bg-[#1e40af] shadow-xs active:scale-[0.98]"
          >
            <Home size={16} />
            Marketplace Home
          </Link>
          <Link
            href="/products"
            className="w-full sm:w-auto h-11 flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-zinc-100/60 px-5 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-100 hover:text-zinc-900 active:scale-[0.98]"
          >
            <ShoppingBag size={16} />
            Browse Products
          </Link>
        </div>

        {/* Support Link */}
        <div className="mt-12 pt-6 border-t border-zinc-200/50 flex justify-center items-center gap-2 text-xs text-zinc-500">
          <PhoneCall size={14} />
          Need assistance?
          <Link href="/contacts" className="font-semibold text-blue-700 hover:underline">
            Contact support team
          </Link>
        </div>
      </div>
    </div>
  );
}
