"use client";

import { Search } from "lucide-react";

interface ServiceFiltersProps {
  categories: { id: string; label: string }[];
  subcategories: { id: string; name: string }[];
  search: string;
  category: string;
  subcategory: string;
}

export function ServiceFilters({
  categories,
  subcategories,
  search,
  category,
  subcategory,
}: ServiceFiltersProps) {
  return (
    <form method="get" action="/services" className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-48">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          name="search"
          type="search"
          defaultValue={search}
          placeholder="Search services..."
          className="w-full rounded-lg border border-zinc-300 bg-white pl-9 pr-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#1d4ed8] focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]/30 transition-colors"
        />
      </div>

      {categories.length > 0 && (
        <select
          name="category"
          defaultValue={category}
          onChange={(e) => {
            const form = e.target.form;
            if (form) {
              const subSelect = form.elements.namedItem("subcategory") as HTMLSelectElement | null;
              if (subSelect) subSelect.value = "";
              form.submit();
            }
          }}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 focus:border-[#1d4ed8] focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]/30 transition-colors"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.label}</option>
          ))}
        </select>
      )}

      {category && subcategories.length > 0 && (
        <select
          name="subcategory"
          defaultValue={subcategory}
          onChange={(e) => e.target.form?.submit()}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 focus:border-[#1d4ed8] focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]/30 transition-colors animate-in fade-in"
        >
          <option value="">All Subcategories</option>
          {subcategories.map((sub) => (
            <option key={sub.id} value={sub.id}>{sub.name}</option>
          ))}
        </select>
      )}

      <button
        type="submit"
        className="rounded-lg bg-[#1d4ed8] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e40af] transition-colors"
      >
        Search
      </button>
    </form>
  );
}
