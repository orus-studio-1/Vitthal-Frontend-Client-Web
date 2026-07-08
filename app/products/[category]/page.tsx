import { Suspense } from "react";
import { ProductCard } from "@/components/Landing_Page";
import { ProductRowCard } from "@/components/ProductRowCard";
import { Pagination } from "@/components/Pagination";
import { ProductFilters } from "@/components/ProductFilters";
import { SortAndViewToggle } from "@/components/SortAndViewToggle";
import { Breadcrumb } from "@/components/ui";
import { EmptyState } from "@/components/ui";
import { fetchProductsByCategory } from "@/lib/api/products";
import { sortProducts } from "@/lib/utils/product";
import { Package } from "lucide-react";

const PRODUCTS_PER_PAGE = 20;

export const revalidate = 0;

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
    productType?: string;
    sort?: string;
    view?: string;
  }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category } = await params;
  const paramsAwaited = await searchParams;
  const currentPage = Math.max(1, parseInt(paramsAwaited.page ?? "1", 10));
  const search = paramsAwaited.search || "";
  const productType = paramsAwaited.productType || "";
  const sort = paramsAwaited.sort || "all";
  const view = paramsAwaited.view || "cards";

  const backendOffset = currentPage - 1;
  const { products: paginatedProducts, totalCount } = await fetchProductsByCategory(
    category,
    backendOffset,
    PRODUCTS_PER_PAGE,
    search,
    productType,
  );

  const sortedProducts = sortProducts(paginatedProducts, sort);
  const totalPages = Math.max(1, Math.ceil(totalCount / PRODUCTS_PER_PAGE));
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const categoryTitle = category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <main>
        {/* Page Header */}
        <section className="border-b border-zinc-200 bg-zinc-50">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "All Products", href: "/products" },
                { label: categoryTitle },
              ]}
            />
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 mt-3">
              {categoryTitle} Products
            </h1>
            <p className="mt-2 text-sm text-zinc-600 max-w-2xl leading-relaxed">
              Browse industrial-grade {category.toLowerCase().replace(/_/g, " ")} materials from
              verified suppliers across India.
            </p>
          </div>
        </section>

        {/* Product Grid */}
        <section className="border-t border-zinc-200 bg-white">
          <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            {/* Filters */}
            <Suspense
              fallback={<div className="h-16 bg-zinc-50 animate-pulse rounded-lg mb-8" />}
            >
              <ProductFilters hideCategory />
            </Suspense>

            {/* Sort and View Toggle */}
            <SortAndViewToggle currentSort={sort} currentView={view} />

            {/* Results summary */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
              <p className="text-sm text-zinc-600">
                Showing{" "}
                <span className="font-semibold text-zinc-900">
                  {totalCount > 0 ? startIndex + 1 : 0}
                </span>{" "}
                -{" "}
                <span className="font-semibold text-zinc-900">
                  {Math.min(startIndex + PRODUCTS_PER_PAGE, totalCount)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-zinc-900">{totalCount}</span> products
              </p>
              <p className="text-sm text-zinc-500">
                Page{" "}
                <span className="font-semibold text-zinc-900">{currentPage}</span>{" "}
                of{" "}
                <span className="font-semibold text-zinc-900">{totalPages}</span>
              </p>
            </div>

            {sortedProducts.length > 0 ? (
              view === "cards" ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {sortedProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedProducts.map((product) => (
                    <ProductRowCard key={product.id} {...product} />
                  ))}
                </div>
              )
            ) : (
              <EmptyState
                icon={Package}
                title="No products found"
                description={`No ${categoryTitle.toLowerCase()} products match your search or filters. Check back later.`}
                actionLabel="Browse All Products"
                actionHref="/products"
              />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 border-t border-zinc-100 pt-10">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  basePath={`/products/${category}`}
                />
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
