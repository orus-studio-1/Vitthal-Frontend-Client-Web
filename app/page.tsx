import {
  Hero,
  MarketStats,
  CategoryBrowse,
  ProductSection,
  WhyChooseUs,
  CTASection,
} from "@/components/Landing_Page";

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

// Fetch helper
async function fetchProducts(url: string): Promise<Product[]> {
  try {
    const res = await fetch(url, {
      cache: "no-store", // Always fetch fresh data during development
    });
    if (!res.ok) {
      console.error(`Failed to fetch ${url}: ${res.statusText}`);
      return [];
    }
    const json = await res.json();
    if (json.data && Array.isArray(json.data)) {
      return json.data.map(mapBackendProduct);
    }
    return [];
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    return [];
  }
}

type Category = {
  id: string;
  code: string;
  label: string;
  description: string;
  image: string;
  min_commision_percentage: number;
  max_commision_percentage: number;
  sort_order: number;
};

// Fetch categories helper
async function fetchCategories(url: string): Promise<Category[]> {
  try {
    const res = await fetch(url, {
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`Failed to fetch categories: ${res.statusText}`);
      return [];
    }
    const json = await res.json();
    if (json.data && Array.isArray(json.data)) {
      return json.data;
    }
    return [];
  } catch (error) {
    console.error("Fetch categories error:", error);
    return [];
  }
}

export default async function Home() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/products`
    : "http://localhost:9000/api/products";

  // Fetch categories first to determine which ones we are showing
  const categories = await fetchCategories(`${BASE_URL}/getCategories`);

  // Pick any two categories. We prefer 'metal_fabrication_parts' and 'plastic_polymer_components'
  // because we have populated products for them. If not found, fall back to the first two.
  const cat1 = categories.find((c) => c.code === "metal_fabrication_parts") || categories[0];
  const cat2 = categories.find((c) => c.code === "plastic_polymer_components") || categories[1];

  // Fetch products concurrently
  const [featuredProducts, cat1Products, cat2Products] = await Promise.all([
    fetchProducts(`${BASE_URL}/getAllProducts?offset=0&limit=4`),
    cat1
      ? fetchProducts(`${BASE_URL}/getProductsByCategory/${cat1.code}?offset=0&limit=4`)
      : Promise.resolve([]),
    cat2
      ? fetchProducts(`${BASE_URL}/getProductsByCategory/${cat2.code}?offset=0&limit=4`)
      : Promise.resolve([]),
  ]);

  return (
    <div className="min-h-screen bg-white text-zinc-900">

      <main>
        <Hero />
        <MarketStats />

        <ProductSection
          id="featured-products"
          title="Featured Products"
          subtitle="High-demand SKUs from consistently rated suppliers"
          products={featuredProducts.length > 0 ? featuredProducts : []}
          showMore
          viewAllHref="/products"
          bg="white"
        />

        {cat1 && (
          <ProductSection
            title={cat1.label}
            subtitle={cat1.description || "High-quality inputs and fabricated components"}
            products={cat1Products.length > 0 ? cat1Products : []}
            showViewAll
            viewAllHref={`/products/${cat1.code}`}
            bg="zinc"
          />
        )}

        {cat2 && (
          <ProductSection
            title={cat2.label}
            subtitle={cat2.description || "Resins, compounds, and industrial plastic components"}
            products={cat2Products.length > 0 ? cat2Products : []}
            showViewAll
            viewAllHref={`/products/${cat2.code}`}
            bg="white"
          />
        )}
        <CategoryBrowse />

        <WhyChooseUs />
        <CTASection />
      </main>

    </div>
  );
}

