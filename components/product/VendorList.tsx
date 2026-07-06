"use client";

import Link from "next/link";
import { Building, Layers, Loader2, Truck, ArrowRight } from "lucide-react";
import { VendorCard } from "./VendorCard";
import type { Vendor, RankedVendor, ProductDetail, ProductVariant } from "@/types";
import { useCartStore } from "@/store/cartStore";

interface VendorListProps {
  product: ProductDetail;
  selectedVariant: ProductVariant | null;
  displayVendors: (Vendor | RankedVendor)[];
  rankedVendors: RankedVendor[];
  isRanking: boolean;
  quantities: Record<string, number>;
  addingVendorId: string | null;
  onAddToCart: (vendor: Vendor, variantId?: string) => void;
  onUpdateQuantity: (vendorId: string, moq: number, delta: number, stock: number, variantId?: string) => void;
  onQuantityChange: (vendorId: string, newQty: number, variantId?: string) => void;
}

export function VendorList({
  product,
  selectedVariant,
  displayVendors,
  rankedVendors,
  isRanking,
  quantities,
  addingVendorId,
  onAddToCart,
  onUpdateQuantity,
  onQuantityChange,
}: VendorListProps) {
  const totalItems = useCartStore((s) => s.items.length);
  const quotationLimit = product.quotation_limit ? Number(product.quotation_limit) : null;
  const hasVariants = product.variants && product.variants.length > 0;

  return (
    <div id="vendors-list" className="space-y-4">
      {/* Delivery Location sits above — rendered by parent */}

      {hasVariants ? (
        /* Grouped variant vendor display */
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
            <div className="flex items-center gap-2">
              <Building size={20} className="text-zinc-600" />
              <h3 className="text-xl font-bold text-zinc-900">Compare Suppliers for Selected Variant</h3>
            </div>
            {isRanking && (
              <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium bg-blue-50 px-2.5 py-1 rounded-full">
                <Loader2 size={12} className="animate-spin" />
                Updating Ranking...
              </div>
            )}
          </div>

          {(() => {
            const v = selectedVariant || product.variants![0];
            if (!v) return null;
            const variantLabel =
              v.variant_name ||
              Object.entries(v.properties || {})
                .map(([key, val]) => `${key}: ${val}`)
                .join(", ") ||
              "Standard";

            return (
              <div
                key={v.variant_id}
                className="bg-white rounded-2xl border-2 border-[#1d4ed8] shadow-sm overflow-hidden ring-4 ring-blue-50"
              >
                {/* Variant Sub-header */}
                <div className="px-6 py-4 flex items-center justify-between bg-blue-50/30 border-b border-zinc-150">
                  <div className="flex items-center gap-2.5">
                    <Layers size={16} className="text-[#1d4ed8]" />
                    <span className="text-md font-bold text-[#1d4ed8]">{variantLabel}</span>
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider rounded-full border border-blue-200 shadow-2xs">
                      Active Selection
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-zinc-500 bg-white px-2.5 py-1 rounded-full border border-zinc-250 shadow-3xs">
                    {displayVendors.length} {displayVendors.length === 1 ? "Supplier" : "Suppliers"}
                  </span>
                </div>

                <div className="divide-y divide-zinc-100">
                  {displayVendors.length > 0 ? (
                    displayVendors.map((vendor, idx) => {
                      const qtyKey = `${v.variant_id}-${vendor.vendor_id}`;
                      const qty = quantities[qtyKey] || vendor.moq || 1;
                      return (
                        <VendorCard
                          key={`${vendor.vendor_id || idx}-${idx}`}
                          vendor={vendor}
                          quantity={qty}
                          quotationLimit={quotationLimit}
                          isAdding={addingVendorId === vendor.vendor_id}
                          variantId={v.variant_id}
                          onUpdateQuantity={onUpdateQuantity}
                          onAddToCart={onAddToCart}
                          onQuantityChange={onQuantityChange}
                        />
                      );
                    })
                  ) : (
                    <div className="p-8 text-center flex flex-col items-center justify-center">
                      <Truck size={36} className="text-zinc-200 mb-2" />
                      <p className="text-sm font-medium text-zinc-500">No suppliers offering this variation</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {totalItems > 0 && (
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-between shadow-xs">
              <p className="text-sm text-zinc-600 font-medium">
                You have <strong className="text-zinc-900">{totalItems}</strong>{" "}
                {totalItems === 1 ? "item" : "items"} in your cart.
              </p>
              <Link
                href="/cart"
                className="px-5 py-2 bg-zinc-900 text-white text-sm font-bold rounded-lg hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-xs"
              >
                View Cart &amp; Checkout
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      ) : (
        /* Flat list fallback for products without variants */
        <div className="border border-zinc-200 bg-white rounded-2xl shadow-sm">
          <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building size={18} className="text-zinc-500" />
              <h3 className="text-lg font-semibold text-zinc-900">
                {rankedVendors.length > 0 ? "Ranked Suppliers" : "Compare Suppliers & Order"}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {isRanking && <Loader2 size={14} className="animate-spin text-blue-600" />}
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                {displayVendors.length} suppliers
              </span>
            </div>
          </div>

          <div className="divide-y divide-zinc-100">
            {displayVendors.length > 0 ? (
              displayVendors.map((vendor, idx) => {
                const qty = quantities[`default-${vendor.vendor_id}`] || vendor.moq || 1;
                return (
                  <VendorCard
                    key={`${vendor.vendor_id || idx}-${idx}`}
                    vendor={vendor}
                    quantity={qty}
                    quotationLimit={quotationLimit}
                    isAdding={addingVendorId === vendor.vendor_id}
                    onUpdateQuantity={onUpdateQuantity}
                    onAddToCart={onAddToCart}
                    onQuantityChange={onQuantityChange}
                  />
                );
              })
            ) : (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <Truck size={48} className="text-zinc-200 mb-4" />
                <h4 className="text-lg font-medium text-zinc-900 mb-1">No suppliers available</h4>
                <p className="text-zinc-500 text-sm max-w-sm">
                  We&apos;re actively sourcing verified suppliers for this product. Check back soon or
                  contact our team.
                </p>
              </div>
            )}
          </div>

          {displayVendors.length > 0 && (
            <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <p className="text-sm text-zinc-500">
                {totalItems > 0 ? `${totalItems} items in your cart` : "Add items to proceed"}
              </p>
              <Link
                href="/cart"
                className="px-5 py-2 bg-zinc-900 text-white text-sm font-semibold rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-2"
              >
                View Cart &amp; Checkout
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
