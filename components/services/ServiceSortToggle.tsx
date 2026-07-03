"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Grid, List } from "lucide-react";

interface ServiceSortToggleProps {
  currentSort?: string;
  currentView?: string;
}

export function ServiceSortToggle({ currentSort = "all", currentView = "cards" }: ServiceSortToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    params.set("page", "1"); // Reset to page 1
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleViewChange = (view: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
      {/* Sort Dropdown */}
      <div className="flex items-center gap-2">
        <label htmlFor="sort" className="text-sm font-medium text-zinc-700">
          Sort by:
        </label>
        <select
          id="sort"
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="border border-zinc-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#1d4ed8] focus:border-[#1d4ed8] text-zinc-700 text-sm transition-colors cursor-pointer"
        >
          <option value="all">All Services</option>
          <option value="name">Service Name (A - Z)</option>
          <option value="name-desc">Service Name (Z - A)</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2 border border-zinc-200 rounded-lg p-1 bg-white">
        <button
          onClick={() => handleViewChange("cards")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all text-sm font-medium ${
            currentView === "cards"
              ? "bg-zinc-900 text-white"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
          title="Grid View"
        >
          <Grid className="w-4 h-4" />
          <span className="hidden sm:inline">Grid</span>
        </button>
        <button
          onClick={() => handleViewChange("list")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all text-sm font-medium ${
            currentView === "list"
              ? "bg-zinc-900 text-white"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
          title="List View"
        >
          <List className="w-4 h-4" />
          <span className="hidden sm:inline">List</span>
        </button>
      </div>
    </div>
  );
}
