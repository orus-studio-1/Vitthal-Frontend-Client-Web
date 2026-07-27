import { Suspense } from "react";
import Link from "next/link";
import { Search, Wrench, ChevronRight } from "lucide-react";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ServiceRowCard } from "@/components/services/ServiceRowCard";
import { ServiceSortToggle } from "@/components/services/ServiceSortToggle";
import { ServiceFilters } from "@/components/services/ServiceFilters";
import { Pagination } from "@/components/Pagination";
import type { ServiceListItem } from "@/store/serviceStore";

export const metadata = {
  title: "Services | MTWO Groups",
  description: "Explore verified service providers for industrial operations — maintenance, installation, logistics, and more.",
};

export const revalidate = 0;

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/services`
  : "http://localhost:9000/api/services";

const SERVICES_PER_PAGE = 20;

type FetchResult = {
  services: ServiceListItem[];
  total: number;
};

async function fetchServices(
  page: number,
  search?: string,
  category?: string,
  subcategory?: string
): Promise<FetchResult> {
  try {
    const params = new URLSearchParams({ page: String(page), limit: String(SERVICES_PER_PAGE) });
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (subcategory) params.set("subcategory", subcategory);

    const res = await fetch(`${API_BASE}?${params.toString()}`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json", "x-request-from": "client" },
    });

    if (!res.ok) return { services: [], total: 0 };

    const json = await res.json();
    return {
      services: Array.isArray(json.data) ? json.data : [],
      total: json.pagination?.total ?? 0,
    };
  } catch {
    return { services: [], total: 0 };
  }
}

async function fetchSubcategories(categoryId: string): Promise<{ id: string; name: string }[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";
    const res = await fetch(`${baseUrl}/api/services/subcategories?categoryId=${categoryId}`, {
      cache: "no-store",
      headers: { "x-request-from": "client" },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

async function fetchCategories(): Promise<{ id: string; label: string }[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000"}/api/products/getCategories?type=service`,
      { cache: "no-store", headers: { "x-request-from": "client" } }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

function sortServices(services: ServiceListItem[], sortBy: string): ServiceListItem[] {
  const sorted = [...services];
  switch (sortBy) {
    case "all":
      return sorted;
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "price-asc":
      sorted.sort((a, b) => {
        const priceA = a.starting_price ? parseFloat(a.starting_price) : 0;
        const priceB = b.starting_price ? parseFloat(b.starting_price) : 0;
        return priceA - priceB;
      });
      break;
    case "price-desc":
      sorted.sort((a, b) => {
        const priceA = a.starting_price ? parseFloat(a.starting_price) : 0;
        const priceB = b.starting_price ? parseFloat(b.starting_price) : 0;
        return priceB - priceA;
      });
      break;
    case "rating":
      sorted.sort((a, b) => {
        const ratingA = a.rating ? parseFloat(a.rating) : 0;
        const ratingB = b.rating ? parseFloat(b.rating) : 0;
        return ratingB - ratingA;
      });
      break;
    default:
      sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
  return sorted;
}

interface ServicesPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    subcategory?: string;
    sort?: string;
    view?: string;
  }>;
}

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10));
  const search = params.search || "";
  const category = params.category || "";
  const subcategory = params.subcategory || "";
  const sort = params.sort || "all";
  const view = params.view || "cards";

  const [{ services, total }, categories, subcategories] = await Promise.all([
    fetchServices(currentPage, search || undefined, category || undefined, subcategory || undefined),
    fetchCategories(),
    category ? fetchSubcategories(category) : Promise.resolve([]),
  ]);

  const sortedServices = sortServices(services, sort);
  const totalPages = Math.max(1, Math.ceil(total / SERVICES_PER_PAGE));
  const startIndex = (currentPage - 1) * SERVICES_PER_PAGE;

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <main>
        <section className="border-b border-zinc-200 bg-zinc-50">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <nav className="text-sm text-zinc-500 mb-3" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2">
                <li>
                  <Link href="/" className="hover:text-zinc-800 transition-colors">Home</Link>
                </li>
                <li className="text-zinc-300"><ChevronRight size={14} /></li>
                <li className="text-zinc-800 font-medium">Services</li>
              </ol>
            </nav>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1d4ed8]/10">
                <Wrench size={20} className="text-[#1d4ed8]" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Browse Services</h1>
                <p className="mt-1 text-sm text-zinc-600 max-w-2xl leading-relaxed">
                  Discover verified service providers for industrial operations — maintenance, installation, fabrication, and more.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-zinc-100 bg-white sticky top-16 z-30">
          <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <Suspense fallback={<div className="h-10 animate-pulse bg-zinc-100 rounded-lg" />}>
              <ServiceFilters
                categories={categories}
                subcategories={subcategories}
                search={search}
                category={category}
                subcategory={subcategory}
              />
            </Suspense>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            {/* Sort & Grid/List Selector */}
            <ServiceSortToggle currentSort={sort} currentView={view} />

            {/* Results count & Pagination summary */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
              <p className="text-sm text-zinc-600">
                Showing{" "}
                <span className="font-semibold text-zinc-900">
                  {total > 0 ? startIndex + 1 : 0}
                </span>{" "}
                -{" "}
                <span className="font-semibold text-zinc-900">
                  {Math.min(startIndex + SERVICES_PER_PAGE, total)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-zinc-900">
                  {total}
                </span>{" "}
                services
              </p>
              <p className="text-sm text-zinc-500">
                Page{" "}
                <span className="font-semibold text-zinc-900">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-zinc-900">
                  {totalPages}
                </span>
              </p>
            </div>

            {sortedServices.length > 0 ? (
              view === "cards" ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {sortedServices.map((service) => (
                    <ServiceCard key={service.id} {...service} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedServices.map((service) => (
                    <ServiceRowCard key={service.id} {...service} />
                  ))}
                </div>
              )
            ) : (
              <div className="py-24 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
                  <Wrench size={28} className="text-zinc-400" strokeWidth={1.5} />
                </div>
                <p className="mt-4 text-lg font-medium text-zinc-700">No services found</p>
                <p className="mt-1 text-sm text-zinc-500">
                  {search || category
                    ? "Try adjusting your filters or search term."
                    : "Services will appear here once they are approved by our team."}
                </p>
                {(search || category) && (
                  <Link
                    href="/services"
                    className="mt-4 inline-block rounded-lg border border-[#1d4ed8] px-4 py-2 text-sm font-medium text-[#1d4ed8] hover:bg-[#1d4ed8] hover:text-white transition-colors"
                  >
                    Browse all services
                  </Link>
                )}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-12 border-t border-zinc-100 pt-10">
                <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/services" />
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

