import {
  Hero,
  MarketStats,
  CategoryBrowse,
  ProductSection,
  ServiceSection,
  WhyChooseUs,
  CTASection,
} from "@/components/Landing_Page";
import { fetchAllProducts, fetchCategories } from "@/lib/api/products";
import { fetchServices } from "@/lib/api/services";

export default async function Home() {
  // Fetch categories first to determine which sections to show
  const categories = await fetchCategories();

  // Prefer specific categories we have populated data for
  const cat1 = categories.find((c) => c.code === "metal_fabrication_parts") || categories[0];
  const cat2 = categories.find((c) => c.code === "plastic_polymer_components") || categories[1];

  const { fetchProductsByCategory } = await import("@/lib/api/products");

  // Fetch products and services concurrently
  const [featuredProducts, cat1Products, cat2Products, featuredServices] = await Promise.all([
    fetchAllProducts(0, 4),
    cat1 ? fetchProductsByCategory(cat1.code, 0, 4) : Promise.resolve({ products: [], totalCount: 0 }),
    cat2 ? fetchProductsByCategory(cat2.code, 0, 4) : Promise.resolve({ products: [], totalCount: 0 }),
    fetchServices(1, 4),
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
            products={cat1Products.products.length > 0 ? cat1Products.products : []}
            showViewAll
            viewAllHref={`/products/${cat1.code}`}
            bg="zinc"
          />
        )}

        {cat2 && (
          <ProductSection
            title={cat2.label}
            subtitle={cat2.description || "Resins, compounds, and industrial plastic components"}
            products={cat2Products.products.length > 0 ? cat2Products.products : []}
            showViewAll
            viewAllHref={`/products/${cat2.code}`}
            bg="white"
          />
        )}

        <ServiceSection
          id="featured-services"
          title="Featured Services"
          subtitle="Industrial installation, maintenance, logistics, and consulting from verified providers"
          services={featuredServices.services}
          showViewAll
          viewAllHref="/services"
          bg="zinc"
        />

        <CategoryBrowse />
        <WhyChooseUs />
        <CTASection />
      </main>
    </div>
  );
}
