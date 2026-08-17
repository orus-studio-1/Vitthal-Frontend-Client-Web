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
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3`}>
            <div className="bg-zinc-50 border border-zinc-200/80 p-2.5 sm:px-3 sm:py-2 rounded-xl flex flex-col justify-between">
              <p className="text-[11px] text-zinc-500 font-medium">Unit Price</p>
              <div className="flex flex-wrap items-baseline gap-1.5 mt-0.5">
                <span className="text-sm sm:text-base font-bold text-[#1d4ed8]">{formatPrice(activePrice)}</span>
                {showDiscount && (
                  <span className="text-[11px] text-zinc-400 line-through font-medium">
                    {formatPrice(rawPrice)}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                {vendor.gst_percentage && Number(vendor.gst_percentage) > 0
                  ? `+ ${vendor.gst_percentage}% GST`
                  : "GST Excl."}
              </p>
            </div>

            <div className="bg-zinc-50 border border-zinc-200/80 p-2.5 sm:px-3 sm:py-2 rounded-xl flex flex-col justify-between">
              <p className="text-[11px] text-zinc-500 font-medium">Min Order (MOQ)</p>
              <p className="text-sm sm:text-base font-bold text-zinc-800 mt-0.5">{vendor.moq || 1} <span className="text-xs font-normal text-zinc-500">units</span></p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Ready to dispatch</p>
            </div>

            <div className="bg-zinc-50 border border-zinc-200/80 p-2.5 sm:px-3 sm:py-2 rounded-xl flex flex-col justify-between">
              <p className="text-[11px] text-zinc-500 font-medium">Available Stock</p>
              <p className="text-sm sm:text-base font-bold text-zinc-800 mt-0.5">
                {vendor.stock_quantity ? (
                  <span>{vendor.stock_quantity.toLocaleString()} <span className="text-xs font-normal text-zinc-500">units</span></span>
                ) : (
                  <span className="text-amber-600 text-xs font-medium">On Request</span>
                )}
              </p>
              <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Direct Inventory</p>
            </div>

            {ranked && ranked.distance !== null ? (
              <div className="bg-zinc-50 border border-zinc-200/80 p-2.5 sm:px-3 sm:py-2 rounded-xl flex flex-col justify-between">
                <p className="text-[11px] text-zinc-500 font-medium">Est. Distance</p>
                <p className="text-sm sm:text-base font-bold text-blue-700 mt-0.5">
                  {ranked.distance < 1
                    ? `${Math.round(ranked.distance * 1000)} m`
                    : `${ranked.distance.toFixed(1)} km`}
                </p>
                <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">From your location</p>
              </div>
            ) : (
              <div className="bg-zinc-50 border border-zinc-200/80 p-2.5 sm:px-3 sm:py-2 rounded-xl flex flex-col justify-between">
                <p className="text-[11px] text-zinc-500 font-medium">Fulfillment</p>
                <p className="text-sm font-bold text-zinc-800 mt-0.5">Standard</p>
                <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Pan India Express</p>
              </div>
            )}
          </div>

          {requiresQuotation && (
            <div className="mb-3 text-xs text-amber-800 bg-amber-50 border border-amber-200/90 rounded-xl p-3 flex items-center gap-2">
              <span className="text-base">⚡</span>
              <span><strong>Bulk Quotation Required:</strong> Order quantity meets quotation threshold. Request custom negotiated prices directly from suppliers.</span>
            </div>
          )}
        </div>

        {/* Quantity & Add to Cart */}
        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center lg:items-stretch xl:items-center justify-between lg:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-zinc-100">
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <span className="text-xs font-semibold text-zinc-500 sm:hidden">Quantity:</span>
            <QuantityStepper
              value={quantity}
              moq={vendor.moq || 1}
              stock={vendor.stock_quantity}
              onChange={(newQty) => onQuantityChange(vendor.vendor_id, newQty, variantId)}
            />
          </div>

          <div className="flex flex-row sm:flex-col xl:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
            {activePrice > 0 && (
              <div className="text-left sm:text-right">
                <span className="text-[11px] text-zinc-400 block font-medium">Subtotal</span>
                <p className="text-sm sm:text-base font-bold text-zinc-900 leading-tight">
                  {formatPrice(totalPrice)}
                </p>
              </div>
            )}
            <button
              onClick={() => onAddToCart(vendor, variantId)}
              disabled={isAdding}
              className={`w-full sm:w-auto px-5 py-2.5 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer ${
                requiresQuotation
                  ? "bg-amber-600 hover:bg-amber-700 active:scale-[0.99]"
                  : "bg-[#1d4ed8] hover:bg-blue-800 active:scale-[0.99]"
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
