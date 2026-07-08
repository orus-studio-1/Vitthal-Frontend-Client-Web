"use client";

import { MapPin, Star, BadgeCheck, Loader2, ShoppingCart } from "lucide-react";
import { QuantityStepper } from "@/components/ui";
import type { Vendor, RankedVendor } from "@/types";
import { getActivePrice, hasDiscount, formatPrice } from "@/lib/utils/price";

interface VendorCardProps {
  vendor: Vendor | RankedVendor;
  quantity: number;
  quotationLimit: number | null;
  isAdding: boolean;
  variantId?: string;
  onUpdateQuantity: (vendorId: string, moq: number, delta: number, stock: number, variantId?: string) => void;
  onAddToCart: (vendor: Vendor, variantId?: string) => void;
  onQuantityChange: (vendorId: string, newQty: number, variantId?: string) => void;
}

function isRankedVendor(v: Vendor | RankedVendor): v is RankedVendor {
  return "rank" in v;
}

export function VendorCard({
  vendor,
  quantity,
  quotationLimit,
  isAdding,
  variantId,
  onUpdateQuantity,
  onAddToCart,
  onQuantityChange,
}: VendorCardProps) {
  const ranked = isRankedVendor(vendor) ? vendor : null;
  const activePrice = getActivePrice(vendor);
  const rawPrice = typeof vendor.price === "string" ? parseFloat(vendor.price) || 0 : vendor.price || 0;
  const showDiscount = hasDiscount(vendor);
  const totalPrice = activePrice * quantity;
  const requiresQuotation = quotationLimit !== null && quantity >= quotationLimit;

  return (
    <div className="p-5 hover:bg-zinc-50/30 transition-colors">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Supplier Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {ranked && (
              <span
                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                  ranked.rank === 1
                    ? "bg-amber-100 text-amber-700"
                    : ranked.rank === 2
                    ? "bg-zinc-200 text-zinc-700"
                    : ranked.rank === 3
                    ? "bg-orange-100 text-orange-700"
                    : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {ranked.rank}
              </span>
            )}
            <h4 className="font-semibold text-zinc-900">Vendor #{vendor.vendor_id.slice(0, 8)}</h4>
            {(vendor.city || vendor.state) && (
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <MapPin size={12} />
                <span>{[vendor.city, vendor.state].filter(Boolean).join(", ")}</span>
              </div>
            )}
            {vendor.rating > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-full">
                <Star size={10} fill="currentColor" />
                {Number(vendor.rating).toFixed(1)}
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs rounded-full">
              <BadgeCheck size={10} />
              Verified
            </span>
          </div>

          {/* Stats Grid */}
          <div className={`grid gap-3 mb-3 ${ranked ? "grid-cols-4" : "grid-cols-3"}`}>
            <div className="bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg flex flex-col justify-between">
              <p className="text-xs text-zinc-500">Unit Price</p>
              <div className="flex flex-wrap items-baseline gap-1">
                <span className="text-sm font-bold text-[#1d4ed8]">{formatPrice(activePrice)}</span>
                {showDiscount && (
                  <span className="text-[10px] text-zinc-400 line-through font-medium">
                    {formatPrice(rawPrice)}
                  </span>
                )}
              </div>
              <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">
                {vendor.gst_percentage && Number(vendor.gst_percentage) > 0
                  ? `+ ${vendor.gst_percentage}% GST`
                  : "GST Excl."}
              </p>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg">
              <p className="text-xs text-zinc-500">MOQ</p>
              <p className="text-sm font-semibold text-zinc-800">{vendor.moq || 1} units</p>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg">
              <p className="text-xs text-zinc-500">Stock</p>
              <p className="text-sm font-semibold text-zinc-800">{vendor.stock_quantity || "N/A"}</p>
            </div>
            {ranked && ranked.distance !== null && (
              <div className="bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg">
                <p className="text-xs text-zinc-500">Distance</p>
                <p className="text-sm font-semibold text-zinc-800">
                  {ranked.distance < 1
                    ? `${Math.round(ranked.distance * 1000)} m`
                    : `${ranked.distance.toFixed(1)} km`}
                </p>
              </div>
            )}
          </div>

          {requiresQuotation && (
            <div className="mb-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              ⚡ Quotation mode — your request will be sent to all eligible suppliers
            </div>
          )}
        </div>

        {/* Quantity & Add to Cart */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:w-auto">
          <QuantityStepper
            value={quantity}
            moq={vendor.moq || 1}
            stock={vendor.stock_quantity}
            onChange={(newQty) => onQuantityChange(vendor.vendor_id, newQty, variantId)}
          />

          <div className="flex flex-col items-end gap-2">
            {activePrice > 0 && (
              <p className="text-sm font-semibold text-zinc-900">
                Total: {formatPrice(totalPrice)}
              </p>
            )}
            <button
              onClick={() => onAddToCart(vendor, variantId)}
              disabled={isAdding}
              className={`px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed ${
                requiresQuotation ? "bg-amber-600 hover:bg-amber-700" : "bg-[#1d4ed8] hover:bg-blue-800"
              }`}
            >
              {isAdding ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
              {isAdding ? "Adding..." : requiresQuotation ? "Request Quote" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
