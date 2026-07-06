/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @next/next/no-img-element */
import React from "react";
import { Package, Layers } from "lucide-react";

export type Vendor = {
  vendor_id: string;
  price: number | string;
  discounted_price?: number | string | null;
  moq: number;
  stock_quantity: number;
  quotation_enabled?: boolean;
  rating: number;
  review_count: number;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  state: string | null;
  gst_percentage?: number | string;
};

export type ProductImage = {
  image_url: string;
  is_primary: boolean;
  display_order: number;
  media_type?: "image" | "video" | null;
  product_variant_id?: string | null;
};

export type ProductDetail = {
  product_id: string;
  product_name: string;
  description: string;
  category: string;
  product_type: string;
  grade?: string;
  material?: string;
  application?: string;
  standard?: string;
  rating: number;
  review_count: number;
  quotation_limit?: number | null;
  specifications: Record<string, string | number>;
  attributes?: Record<string, string | number>;
  images: ProductImage[];
  vendors: Vendor[];
  variants?: Array<{
    variant_id: string;
    sku: string | null;
    variant_name?: string | null;
    properties: Record<string, string>;
    approval_status: string;
    vendors: Vendor[];
  }>;
};

interface VariantSelectorProps {
  product: ProductDetail;
  selectedVariant: any;
  selectedSpecs: Record<string, string>;
  onSelectVariant: (variant: any) => void;
  onSpecChange: (key: string, value: string) => void;
}

export default function VariantSelector({
  product,
  selectedVariant,
  selectedSpecs,
  onSelectVariant,
  onSpecChange,
}: VariantSelectorProps) {
  if (!product.variants || product.variants.length === 0) {
    return null;
  }

  // Helper to get thumbnail image url for a variant
  const getVariantThumbnail = (variant: any) => {
    if (!product || !product.images) return null;
    const variantImg = product.images.find(
      (img: any) => img.product_variant_id === variant.variant_id
    );
    if (variantImg) return variantImg.image_url;

    const primaryImg = product.images.find(
      (img: any) => img.is_primary && !img.product_variant_id
    );
    if (primaryImg) return primaryImg.image_url;

    const firstGlobal = product.images.find((img: any) => !img.product_variant_id);
    if (firstGlobal) return firstGlobal.image_url;

    return product.images[0]?.image_url || null;
  };

  // Helper to get price range string for a variant
  const getVariantPriceRange = (variant: any) => {
    const vendors = variant?.vendors || [];
    if (!vendors.length) return "No suppliers";
    const prices = vendors
      .map((v: any) => {
        const rawPrice = typeof v.price === "string" ? parseFloat(v.price) : v.price;
        const discountedPrice =
          v.discounted_price !== null && v.discounted_price !== undefined
            ? typeof v.discounted_price === "string"
              ? parseFloat(v.discounted_price)
              : v.discounted_price
            : null;
        return discountedPrice !== null && discountedPrice < rawPrice
          ? discountedPrice
          : rawPrice;
      })
      .filter((p: number | undefined | null): p is number => !!p && !isNaN(p));
    if (!prices.length) return "No suppliers";
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max
      ? `₹${min.toLocaleString()}`
      : `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
  };

  const getVariantAttributes = (
    variantsList: Array<{ properties: Record<string, string> }>
  ) => {
    const attributes: Record<string, Set<string>> = {};
    variantsList.forEach((v) => {
      if (v.properties) {
        Object.entries(v.properties).forEach(([key, val]) => {
          if (!attributes[key]) {
            attributes[key] = new Set<string>();
          }
          attributes[key].add(val);
        });
      }
    });

    const result: Record<string, string[]> = {};
    Object.entries(attributes).forEach(([key, valSet]) => {
      result[key] = Array.from(valSet).sort();
    });
    return result;
  };

  const variantAttributes = getVariantAttributes(product.variants);

  return (
    <div className="space-y-6 w-full">
      {/* Horizontal Scroller Carousel */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-5">
          <div className="flex items-center gap-2">
            <Layers className="text-blue-600" size={20} />
            <h3 className="text-base font-bold text-zinc-900">Select Variant</h3>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded">
            Swipe / Scroll
          </span>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scroll-smooth scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
          {product.variants.map((v) => {
            const isSelected = selectedVariant?.variant_id === v.variant_id;
            const thumbnail = getVariantThumbnail(v);
            const name =
              v.variant_name ||
              Object.entries(v.properties || {})
                .map(([_, val]) => val)
                .join(" - ") ||
              `Variant ${v.sku || v.variant_id.slice(0, 8)}`;
            const priceStr = getVariantPriceRange(v);

            return (
              <button
                key={v.variant_id}
                onClick={() => onSelectVariant(v)}
                className={`flex-none w-56 p-4 rounded-xl border-2 text-left transition-all snap-start flex gap-4 ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/10 shadow-md ring-4 ring-blue-50"
                    : "border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50/40"
                }`}
              >
                {/* Variant Image */}
                <div className="w-16 h-16 rounded-xl bg-zinc-100 border border-zinc-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="text-zinc-400" size={24} />
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1 flex flex-col justify-between">
                  <span
                    className={`text-sm font-bold truncate block ${
                      isSelected ? "text-blue-900" : "text-zinc-800"
                    }`}
                  >
                    {name}
                  </span>
                  <div>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">
                      {priceStr.startsWith("₹") ? "Starting At" : ""}
                    </span>
                    <span
                      className={`text-sm font-bold block truncate mt-0.5 ${
                        isSelected ? "text-blue-600" : "text-zinc-700"
                      }`}
                    >
                      {priceStr}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of properties (e.g. Size, Color) */}
      {Object.keys(variantAttributes).length > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 mb-4">
            <Layers className="text-blue-600" size={18} />
            <h4 className="text-sm font-bold text-zinc-900">
              Configure Attributes
            </h4>
          </div>

          <div className="space-y-4">
            {Object.entries(variantAttributes).map(([specKey, values]) => {
              const activeValue = selectedSpecs[specKey];
              return (
                <div key={specKey} className="space-y-2">
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    {specKey}:{" "}
                    <span className="text-zinc-800 font-bold capitalize">
                      {activeValue || "None"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {values.map((val) => {
                      const isSelected = activeValue === val;
                      return (
                        <button
                          key={val}
                          onClick={() => onSpecChange(specKey, val)}
                          className={`px-4 py-2.5 text-xs font-bold rounded-lg border transition-all ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600 shadow-md"
                              : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
