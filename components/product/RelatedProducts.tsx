import Link from "next/link";
import { Package, ArrowRight } from "lucide-react";
import { RelatedProductCard } from "./RelatedProductCard";
import { ProductCardSkeleton } from "@/components/ui";
import type { RelatedProduct } from "@/types";

interface RelatedProductsProps {
  category: string;
  products: RelatedProduct[];
  isLoading: boolean;
}

export function RelatedProducts({ category, products, isLoading }: RelatedProductsProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Related Products</h2>
        <p className="text-zinc-600">Similar products in the {category} category</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((related) => (
            <RelatedProductCard key={related.product_id} product={related} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package size={48} className="text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 mb-2">No related products found</h3>
          <p className="text-zinc-500">Check out our other products in different categories</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#1d4ed8] text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors"
          >
            Browse All Products
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </section>
  );
}
