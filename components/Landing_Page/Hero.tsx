"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function Hero() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleQuickSearch = (term: string) => {
    router.push(`/products?search=${encodeURIComponent(term)}`);
  };

  return (
    <section
      className="relative flex items-center bg-zinc-50"
      style={{ minHeight: "calc(100vh - 73px)" }}
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-20">
        {/* ── Left column ── */}
        <div>
          {/* Badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#1d4ed8]">
            <span className="h-1.5 w-1.5 font-body font-extrabold rounded-full bg-[#1d4ed8]" />
            B2B Industrial Marketplace
          </span>

          <h1 className="mt-5 max-w-xl text-4xl font-bold leading-[1.2] tracking-tight text-zinc-900 sm:text-5xl lg:text-[3.25rem] font-heading">
            Source Industrial&nbsp;Products from <span className="text-[#1d4ed8]">Verified Vendors</span>
          </h1>

          <p className="mt-5 max-w-lg text-base font-light leading-relaxed text-zinc-600 sm:text-lg">
            Compare pricing, MOQ, lead times, and delivery commitments in one place.
            Connect with trusted suppliers across India.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mt-8 flex w-full flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-2.5 shadow-sm sm:flex-row">
            <input
              type="text"
              placeholder="Search for plastic granules, metal sheets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full rounded-lg border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/20"
            />
            <button
              type="submit"
              className="h-12 whitespace-nowrap rounded-lg bg-[#1d4ed8] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#1e40af]"
            >
              Search
            </button>
          </form>

          {/* Quick-search chips */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-600">
            <span className="text-zinc-400">Popular:</span>
            {["PP Granules", "Stainless Sheets", "Aluminium Ingots", "Copper Rods"].map(
              (label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleQuickSearch(label)}
                  className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 transition-colors hover:border-[#1d4ed8] hover:text-[#1d4ed8] cursor-pointer"
                >
                  {label}
                </button>
              )
            )}
          </div>

          {/* Trusted-by strip */}
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-zinc-100 pt-6 text-xs text-zinc-500">
            <span className="font-medium text-zinc-400 uppercase tracking-wider">Trusted by teams at</span>
            {["Reliance Industries", "Tata Group", "ONGC", "L&T"].map((co) => (
              <span key={co} className="font-semibold text-zinc-600">{co}</span>
            ))}
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-5">
          {/* Main image */}
          <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 shadow-md">
            <Image
              src="/hero_image.avif"
              alt="Industrial supply chain — logistics and manufacturing warehouse"
              width={1000}
              height={720}
              className="h-80 w-full object-cover"
              priority
            />
            {/* Subtle overlay label */}
            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/40 to-transparent px-5 py-4">
              <p className="text-xs font-medium text-white/90">
                Warehouse & Logistics Operations
              </p>
            </div>
          </div>

          {/* Mini-stat cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "2,300+", label: "Verified Vendors" },
              { value: "24 hrs", label: "Quote Turnaround" },
              { value: "180+", label: "Cities Served" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-zinc-200 bg-white p-4 text-center shadow-sm"
              >
                <p className="text-lg font-bold text-zinc-900">{stat.value}</p>
                <p className="mt-1 text-xs text-zinc-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

