import { Header, Footer, ProductCard } from "@/components/Landing_Page";
import { ProductRowCard } from "@/components/ProductRowCard";
import { Pagination } from "@/components/Pagination";
import { ProductFilters } from "@/components/ProductFilters";
import { SortAndViewToggle } from "@/components/SortAndViewToggle";
import { Suspense } from "react";

type Product = {
  name: string;
  minPrice: number;
  maxPrice: number;
  minOriginalPrice?: number;
  maxOriginalPrice?: number;
  moq: number;
  sellerCount: number;
  image: string;
  id: string;
};

// Map backend response to the frontend Product shape
function mapBackendProduct(bp: any): Product {
  const vendorsCount = Number(bp.seller_count || bp.vendor_count || 0);
  const minPrice = Number(bp.min_price) || 0;
  const maxPrice = Number(bp.max_price) || 0;
  const minMoq = Number(bp.min_moq) || 1;
  const minOriginalPrice = bp.min_original_price ? Number(bp.min_original_price) : undefined;
  const maxOriginalPrice = bp.max_original_price ? Number(bp.max_original_price) : undefined;
  return {
    name: bp.product_name || "Unknown Product",
    minPrice,
    maxPrice,
    minOriginalPrice,
    maxOriginalPrice,
    moq: minMoq,
    sellerCount: vendorsCount,
    image:
      bp.primary_image ||
      "https://www.shutterstock.com/image-photo/neatly-stacked-light-green-gypsum-600nw-2690641841.jpg",
    id: bp.product_id || bp.id || "unknown",
  };
}

interface FetchResult {
  products: Product[];
  totalCount: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/products`
  : "http://localhost:9000/api/products";
const PRODUCTS_PER_PAGE = 20;

export const revalidate = 0;

async function fetchPaginatedProducts(
  offset: number,
  limit: number,
  search?: string,
  category?: string,
  productType?: string,
): Promise<FetchResult> {
  try {
    const params = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString(),
    });

    if (search) params.append("search", search);
    if (category) params.append("category", category);
    if (productType) params.append("productType", productType);

    const url = `${BASE_URL}/getAllProducts?${params.toString()}`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "x-request-from": "client",
      },
    });
    if (!res.ok) {
      console.error(
        `Failed to fetch products: ${res.status} ${res.statusText}`,
      );
      return { products: [], totalCount: 0 };
    }
    const json = await res.json();
    const products =
      json.data && Array.isArray(json.data)
        ? json.data.map(mapBackendProduct)
        : [];
    const totalCount =
      typeof json.totalCount === "number" ? json.totalCount : products.length;
    return { products, totalCount };
  } catch (error) {
    console.error("Fetch error for products:", error);
    return { products: [], totalCount: 0 };
  }
}

function sortProducts(products: Product[], sortBy: string): Product[] {
  const sorted = [...products];
  
  switch (sortBy) {
    case "all":
      // Return as-is without sorting
      return sorted;
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "price-asc":
      sorted.sort((a, b) => a.minPrice - b.minPrice);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.maxPrice - a.maxPrice);
      break;
    case "suppliers":
      sorted.sort((a, b) => b.sellerCount - a.sellerCount);
      break;
    default:
      sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
  
  return sorted;
}

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    productType?: string;
    sort?: string;
    view?: string;
  }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10));
  const search = params.search || "";
  const category = params.category || "";
  const productType = params.productType || "";
  const sort = params.sort || "all";
  const view = params.view || "cards";

  // Backend offset is page-based (0-indexed)
  const backendOffset = currentPage - 1;
  const { products: paginatedProducts, totalCount } =
    await fetchPaginatedProducts(
      backendOffset,
      PRODUCTS_PER_PAGE,
      search,
      category,
      productType,
    );

  const sortedProducts = sortProducts(paginatedProducts, sort);
  const totalPages = Math.max(1, Math.ceil(totalCount / PRODUCTS_PER_PAGE));
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <main>
        {/* Page Header */}
        <section className="border-b border-zinc-200 bg-zinc-50">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <nav className="text-sm text-zinc-500 mb-3" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2">
                <li>
                  <a href="/" className="hover:text-zinc-800 transition-colors">
                    Home
                  </a>
                </li>
                <li className="text-zinc-300">/</li>
                <li className="text-zinc-800 font-medium">All Products</li>
              </ol>
            </nav>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Browse All Products
            </h1>
            <p className="mt-2 text-sm text-zinc-600 max-w-2xl leading-relaxed">
              Explore our comprehensive catalog of industrial-grade plastics,
              metals, and raw materials sourced from verified suppliers across
              India.
            </p>
          </div>
        </section>

        {/* Product Grid */}
        <section className="border-t border-zinc-200 bg-white">
          <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            {/* Filters */}
            <Suspense
              fallback={
                <div className="h-16 bg-zinc-50 animate-pulse rounded-lg mb-8" />
              }
            >
              <ProductFilters />
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
                <span className="font-semibold text-zinc-900">
                  {totalCount}
                </span>{" "}
                products
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

            {sortedProducts.length > 0 ? (
              view === "cards" ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {sortedProducts.map((product, index) => (
                    <ProductCard key={`${product.id}-${index}`} {...product} />
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
              <div className="py-20 text-center">
                <p className="text-lg font-medium text-zinc-700">
                  No products found
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  Try adjusting your filters or check back later.
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 border-t border-zinc-100 pt-10">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  basePath="/products"
                />
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
