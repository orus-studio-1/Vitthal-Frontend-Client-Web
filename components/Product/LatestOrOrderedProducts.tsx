/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Star, Clock, Sparkles } from "lucide-react";

interface ProductCardProps {
  product: any;
}

function ProductSliderCard({ product }: ProductCardProps) {
  const priceLabel =
    product.min_price === product.max_price
      ? `₹${Number(product.min_price || 0).toLocaleString()}`
      : `₹${Number(product.min_price || 0).toLocaleString()} – ₹${Number(
          product.max_price || 0
        ).toLocaleString()}`;

  return (
    <div className="group flex-none w-64 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-zinc-300 transition-all flex flex-col h-full snap-start">
      <Link href={`/product/${product.product_id}`} className="flex flex-col h-full">
        {/* Product Image */}
        <div className="relative h-40 w-full overflow-hidden bg-zinc-100 flex items-center justify-center">
          {product.primary_image ? (
            <img
              src={product.primary_image}
              alt={product.product_name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <Package size={28} className="text-zinc-300" />
          )}

          {product.seller_count > 0 ? (
            <span className="absolute top-2 left-2 rounded bg-white/95 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold text-zinc-500 shadow-xs">
              {product.seller_count} {product.seller_count === 1 ? "Supplier" : "Suppliers"}
            </span>
          ) : (
            <span className="absolute top-2 left-2 rounded bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 shadow-xs">
              Sourcing...
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-3.5 flex flex-col flex-1 gap-2 justify-between">
          <div>
            <h4 className="text-xs font-bold text-zinc-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
              {product.product_name}
            </h4>
            {product.rating > 0 && (
              <div className="flex items-center gap-1 mt-1.5">
                <Star className="fill-amber-400 text-amber-400" size={10} />
                <span className="text-[11px] font-bold text-zinc-700">{product.rating}</span>
                <span className="text-[10px] text-zinc-400">({product.review_count})</span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-zinc-100">
            <span className="text-[10px] text-zinc-400 block font-medium">Price Range</span>
            <span className="text-sm font-black text-zinc-800">{priceLabel}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}

interface LatestOrOrderedProductsProps {
  productsApiUrl: string;
}

export default function LatestOrOrderedProducts({ productsApiUrl }: LatestOrOrderedProductsProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ latest: any[]; ordered: any[] }>({
    latest: [],
    ordered: [],
  });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`${productsApiUrl}/getLatestOrOrderedProducts`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = await res.json();
        if (json.data) {
          setData({
            latest: json.data.latest || [],
            ordered: json.data.ordered || [],
          });
        }
      } catch (err) {
        console.error("Error loading latest/ordered products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [productsApiUrl]);

  if (loading) {
    return (
      <div className="py-8 w-full">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-zinc-200 rounded"></div>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-64 h-56 bg-zinc-200 rounded-xl flex-shrink-0"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hasLatest = data.latest.length > 0;
  const hasOrdered = data.ordered.length > 0;

  if (!hasLatest && !hasOrdered) {
    return null;
  }

  return (
    <div className="space-y-12 py-8 w-full border-t border-zinc-200/80">
      {/* Recently Ordered Slider */}
      {hasOrdered && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="text-emerald-500" size={22} />
            <div>
              <h3 className="text-xl font-bold text-zinc-900 leading-none">Recently Ordered</h3>
              <p className="text-xs text-zinc-400 mt-1">Trending products bought by other buyers</p>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scroll-smooth scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
            {data.ordered.map((product) => (
              <ProductSliderCard key={`ord-${product.product_id}`} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Latest Products Slider */}
      {hasLatest && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-blue-500" size={22} />
            <div>
              <h3 className="text-xl font-bold text-zinc-900 leading-none">New Arrivals</h3>
              <p className="text-xs text-zinc-400 mt-1">Lately added products in the catalog</p>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scroll-smooth scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
            {data.latest.map((product) => (
              <ProductSliderCard key={`lat-${product.product_id}`} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
