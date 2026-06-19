"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Search } from "lucide-react";

interface ProductFiltersProps {
  hideCategory?: boolean;
}

type Category = {
  code: string;
  label: string;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/products`
  : "http://localhost:9000/api/products";

export function ProductFilters({ hideCategory = false }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [productType, setProductType] = useState(searchParams.get("productType") || "");
  const [categories, setCategories] = useState<Category[]>([]);
  const [productTypes, setProductTypes] = useState<string[]>([]);

  // Use a ref to hold the latest searchParams so updateUrl doesn't depend on searchParams directly
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  // Fetch product types dynamically
  useEffect(() => {
    fetch(`${BASE_URL}/getProductTypes`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data && Array.isArray(json.data)) {
          setProductTypes(json.data as string[]);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch categories dynamically from the API
  useEffect(() => {
    if (hideCategory) return;
    fetch(`${BASE_URL}/getCategories`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data && Array.isArray(json.data)) {
          setCategories(json.data as Category[]);
        }
      })
      .catch(() => {
        // fallback silently — dropdown will just show "All Categories"
      });
  }, [hideCategory]);

  const updateUrl = useCallback(
    (s: string, c: string, p: string) => {
      const params = new URLSearchParams(searchParamsRef.current.toString());
      if (s) params.set("search", s);
      else params.delete("search");

      // If hideCategory is true, we shouldn't modify the category query param because it's managed by the URL path
      if (!hideCategory) {
        if (c) params.set("category", c);
        else params.delete("category");
      }

      if (p) params.set("productType", p);
      else params.delete("productType");

      // Reset to page 1 when filtering
      params.set("page", "1");

      router.push(`${pathname}?${params.toString()}`);
    },
    [hideCategory, pathname, router],
  );

  // Debounced search-only update — only the search input triggers this
  useEffect(() => {
    const timer = setTimeout(() => {
      updateUrl(search, category, productType);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Dropdown changes update the URL immediately (no debounce needed)
  const handleCategoryChange = (val: string) => {
    setCategory(val);
    updateUrl(search, val, productType);
  };

  const handleTypeChange = (val: string) => {
    setProductType(val);
    updateUrl(search, category, val);
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by name..."
          className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-3 w-full md:w-auto">
        {!hideCategory && (
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="border border-zinc-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-700 min-w-[140px] transition-colors text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.code} value={cat.code}>
                {cat.label}
              </option>
            ))}
          </select>
        )}

        <select
          value={productType}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="border border-zinc-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-700 min-w-[140px] transition-colors text-sm capitalize"
        >
          <option value="">All Types</option>
          {productTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
