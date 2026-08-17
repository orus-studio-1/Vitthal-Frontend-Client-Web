/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
import React from "react";
import Link from "next/link";
import { Package, Star, ArrowRight } from "lucide-react";

interface RelatedProductsProps {
  relatedProducts: any[];
  isLoadingRelated: boolean;
  category: string;
}

export default function RelatedProducts({
  relatedProducts,
  isLoadingRelated,
  category,
}: RelatedProductsProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Related Products</h2>
        <p className="text-zinc-500">Similar products in the {category} category</p>
      </div>

      {isLoadingRelated ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-zinc-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-zinc-200 rounded mb-2"></div>
              <div className="h-4 bg-zinc-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : relatedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((related) => {
            const priceLabel =
              related.min_price === related.max_price
                ? `₹${related.min_price?.toLocaleString() || "Contact"}`
                : `₹${related.min_price?.toLocaleString() || 0} – ₹${
                    related.max_price?.toLocaleString() || 0
                  }`;

            return (
              <div
                key={related.product_id}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:border-zinc-300 hover:shadow-md h-full"
              >
                <Link href={`/product/${related.product_id}`} className="flex h-full flex-col">
                  {/* Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-zinc-150">
                    {related.primary_image ? (
                      <img
                        src={related.primary_image}
                        alt={related.product_name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-zinc-100">
                        <Package size={32} className="text-zinc-300" />
                      </div>
                    )}
                    {related.seller_count > 0 ? (
                      <span className="absolute top-2.5 left-2.5 rounded bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-zinc-650 shadow-sm">
                        {related.seller_count}{" "}
                        {related.seller_count === 1 ? "Supplier" : "Suppliers"}
                      </span>
                    ) : (
                      <span className="absolute top-2.5 left-2.5 rounded bg-amber-100/95 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-amber-700 shadow-sm">
                        Coming Soon
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    {/* Product Name */}
                    <div>
                      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900">
                        {related.product_name}
                      </h3>
                    </div>

                    {/* Rating */}
                    {related.rating > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="fill-amber-400 text-amber-400" size={12} />
                          <span className="text-sm font-medium text-zinc-900">
                            {related.rating}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-400">
                          ({related.review_count || 0})
                        </span>
                      </div>
                    )}

                    {/* Price Section */}
                    <div className="pt-2 border-t border-zinc-100">
                      <p className="text-xs text-zinc-400">Price Range</p>
                      <p className="text-lg font-bold text-zinc-900">{priceLabel}</p>
                    </div>

                    {/* Order Details */}
                    <div className="pt-2 border-t border-zinc-100 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500">Minimum Order</span>
                        <span className="font-medium text-zinc-700">
                          {related.min_moq || 1} pieces
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500">Suppliers</span>
                        {related.seller_count > 0 ? (
                          <span className="font-medium text-emerald-600">
                            {related.seller_count === 1
                              ? "1 Verified"
                              : `${related.seller_count} Verified`}
                          </span>
                        ) : (
                          <span className="font-medium text-amber-600">Coming Soon</span>
                        )}
                      </div>
                    </div>

                    {/* CTA */}
                    <div
                      className={`mt-auto pt-2 w-full rounded-lg px-3 py-2.5 text-center text-xs font-semibold transition-colors ${
                        related.seller_count > 0
                          ? "border border-blue-600 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                          : "border border-zinc-300 text-zinc-400 bg-zinc-50 cursor-not-allowed"
                      }`}
                    >
                      {related.seller_count > 0 ? "Order Now" : "No Vendors Yet"}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package size={48} className="text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 mb-2">No related products found</h3>
          <p className="text-zinc-500">Check out our other products in different categories</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse All Products
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </section>
  );
}
