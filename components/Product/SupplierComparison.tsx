/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Link from "next/link";
import {
  MapPin,
  Navigation,
  Loader2,
  Crosshair,
  Building,
  Layers,
  Star,
  BadgeCheck,
  Minus,
  Plus,
  ShoppingCart,
  ArrowRight,
  Truck,
} from "lucide-react";

interface SupplierComparisonProps {
  product: any;
  selectedVariant: any;
  quantities: Record<string, number>;
  setQuantities: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  userLocation: any;
  setUserLocation: (loc: any) => void;
  savedAddress: any;
  isLocating: boolean;
  isRanking: boolean;
  rankedVendors: any[];
  displayVendors: any[];
  addingVendorId: string | null;
  totalItems: number;
  handleUseCurrentLocation: () => void;
  updateQuantity: (
    vendorId: string,
    moq: number,
    delta: number,
    stock: number,
    variantId?: string
  ) => void;
  handleAddToCart: (vendor: any, variantId?: string) => void;
}

export default function SupplierComparison({
  product,
  selectedVariant,
  quantities,
  setQuantities,
  userLocation,
  setUserLocation,
  savedAddress,
  isLocating,
  isRanking,
  rankedVendors,
  displayVendors,
  addingVendorId,
  totalItems,
  handleUseCurrentLocation,
  updateQuantity,
  handleAddToCart,
}: SupplierComparisonProps) {
  return (
    <div id="vendors-list" className="space-y-4 w-full">
      {/* Delivery Location Card */}
      <div className="border border-zinc-200 bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
          <MapPin size={18} className="text-blue-600" />
          <h3 className="text-lg font-semibold text-zinc-900">Delivery Location</h3>
        </div>
        <div className="p-5">
          {userLocation ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Navigation size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {savedAddress &&
                    userLocation.lat === savedAddress.latitude &&
                    userLocation.lng === savedAddress.longitude
                      ? "Deliver to your saved profile address"
                      : "Deliver to captured location"}
                  </p>
                  <p className="text-sm text-zinc-500 mt-0.5">{userLocation.label}</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
                {savedAddress &&
                  (userLocation.lat !== savedAddress.latitude ||
                    userLocation.lng !== savedAddress.longitude) && (
                    <button
                      onClick={() => {
                        setUserLocation({
                          lat: savedAddress.latitude,
                          lng: savedAddress.longitude,
                          label: `${savedAddress.address}, ${savedAddress.city}`,
                        });
                      }}
                      className="text-xs font-bold text-blue-600 hover:underline transition-colors mr-2"
                    >
                      Use Saved Address
                    </button>
                  )}
                <button
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors disabled:opacity-60 bg-white shadow-sm"
                >
                  {isLocating ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Crosshair size={14} />
                  )}
                  {isLocating ? "Detecting..." : "Use Current Location"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center py-4">
              <MapPin size={32} className="text-zinc-300 mb-3" />
              <p className="text-sm font-semibold text-zinc-900 mb-1">
                Set your delivery location
              </p>
              <p className="text-xs text-zinc-500 mb-4 max-w-sm">
                We&apos;ll rank suppliers based on your location to find the best prices,
                closest distances, and top-rated vendors.
              </p>
              <button
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 shadow-md shadow-blue-100"
              >
                {isLocating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Crosshair size={16} />
                )}
                {isLocating ? "Detecting Location..." : "Use Current Location"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Compare Suppliers Table */}
      {product.variants && product.variants.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
            <div className="flex items-center gap-2">
              <Building size={20} className="text-zinc-650" />
              <h3 className="text-xl font-bold text-zinc-900">
                Compare Suppliers for Selected Variant
              </h3>
            </div>
            {isRanking && (
              <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium bg-blue-50 px-2.5 py-1 rounded-full">
                <Loader2 size={12} className="animate-spin" />
                Updating Ranking...
              </div>
            )}
          </div>

          {(() => {
            const v = selectedVariant || product.variants[0];
            if (!v) return null;

            const variantLabel =
              v.variant_name ||
              Object.entries(v.properties || {})
                .map(([key, val]) => `${key}: ${val}`)
                .join(", ") ||
              "Standard";

            const variantVendors = displayVendors;

            return (
              <div
                key={v.variant_id}
                className="bg-white rounded-2xl border-2 border-blue-600 shadow-sm overflow-hidden ring-4 ring-blue-50"
              >
                {/* Variant Sub-header */}
                <div className="px-6 py-4 flex items-center justify-between bg-blue-50/30 border-b border-zinc-150">
                  <div className="flex items-center gap-2.5">
                    <Layers size={16} className="text-blue-600" />
                    <span className="text-md font-bold text-blue-600">
                      {variantLabel}
                    </span>
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider rounded-full border border-blue-200 shadow-2xs">
                      Active Selection
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-500 bg-white px-2.5 py-1 rounded-full border border-zinc-250 shadow-3xs">
                      {variantVendors.length}{" "}
                      {variantVendors.length === 1 ? "Supplier" : "Suppliers"}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-zinc-100">
                  {variantVendors.length > 0 ? (
                    variantVendors.map((vendor: any) => {
                      const qtyKey = `${v.variant_id}-${vendor.vendor_id}`;
                      const qty = quantities[qtyKey] || vendor.moq || 1;
                      const rawPrice =
                        typeof vendor.price === "string"
                          ? parseFloat(vendor.price) || 0
                          : vendor.price || 0;
                      const discountedPrice =
                        vendor.discounted_price !== null &&
                        vendor.discounted_price !== undefined
                          ? typeof vendor.discounted_price === "string"
                            ? parseFloat(vendor.discounted_price)
                            : vendor.discounted_price
                          : null;
                      const activePrice =
                        discountedPrice !== null && discountedPrice < rawPrice
                          ? discountedPrice
                          : rawPrice;
                      const hasDiscount =
                        discountedPrice !== null && discountedPrice < rawPrice;
                      const totalPrice = activePrice * qty;
                      const quotationLimit = product.quotation_limit
                        ? Number(product.quotation_limit)
                        : null;
                      const requiresQuotation =
                        quotationLimit !== null && qty >= quotationLimit;
                      const isRanked = rankedVendors.length > 0 && "rank" in vendor;

                      return (
                        <div
                          key={vendor.vendor_id}
                          className="p-5 hover:bg-zinc-50/10 transition-colors"
                        >
                          <div className="flex flex-col lg:flex-row gap-4">
                            {/* Supplier Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                {isRanked && (
                                  <span
                                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                      vendor.rank === 1
                                        ? "bg-amber-100 text-amber-700"
                                        : vendor.rank === 2
                                        ? "bg-zinc-200 text-zinc-700"
                                        : vendor.rank === 3
                                        ? "bg-orange-100 text-orange-700"
                                        : "bg-zinc-100 text-zinc-500"
                                    }`}
                                  >
                                    {vendor.rank}
                                  </span>
                                )}
                                <h4 className="font-semibold text-zinc-900">
                                  Vendor #{vendor.vendor_id.slice(0, 8)}
                                </h4>
                                {(vendor.city || vendor.state) && (
                                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                                    <MapPin size={12} />
                                    <span>
                                      {[vendor.city, vendor.state].filter(Boolean).join(", ")}
                                    </span>
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

                              <div
                                className={`grid gap-3 mb-3 ${
                                  isRanked ? "grid-cols-4" : "grid-cols-3"
                                }`}
                              >
                                <div className="bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg flex flex-col justify-between">
                                  <p className="text-xs text-zinc-500">Unit Price</p>
                                  <div className="flex flex-wrap items-baseline gap-1">
                                    <span className="text-sm font-bold text-blue-600">
                                      ₹{activePrice.toLocaleString()}
                                    </span>
                                    {hasDiscount && (
                                      <span className="text-[10px] text-zinc-400 line-through font-medium">
                                        ₹{rawPrice.toLocaleString()}
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
                                  <p className="text-sm font-semibold text-zinc-800">
                                    {vendor.moq || 1} units
                                  </p>
                                </div>
                                <div className="bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg">
                                  <p className="text-xs text-zinc-500">Stock</p>
                                  <p className="text-sm font-semibold text-zinc-800">
                                    {vendor.stock_quantity || "N/A"}
                                  </p>
                                </div>
                                {isRanked && vendor.distance !== null && (
                                  <div className="bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg">
                                    <p className="text-xs text-zinc-500">Distance</p>
                                    <p className="text-sm font-semibold text-zinc-800">
                                      {vendor.distance < 1
                                        ? `${Math.round(vendor.distance * 1000)} m`
                                        : `${vendor.distance.toFixed(1)} km`}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {product.quotation_limit && qty >= product.quotation_limit && (
                                <div className="mb-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                                  ⚡ Quotation mode — your request will be sent to all
                                  eligible suppliers
                                </div>
                              )}
                            </div>

                            {/* Quantity & Add to Cart */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:w-auto">
                              <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-lg px-2 py-1.5">
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      vendor.vendor_id,
                                      vendor.moq || 1,
                                      -1,
                                      vendor.stock_quantity,
                                      v.variant_id
                                    )
                                  }
                                  className="p-1.5 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors disabled:opacity-40"
                                  disabled={qty <= (vendor.moq || 1)}
                                >
                                  <Minus size={16} />
                                </button>
                                <div className="flex flex-col items-center min-w-[60px]">
                                  <input
                                    type="number"
                                    min={vendor.moq || 1}
                                    max={vendor.stock_quantity || undefined}
                                    value={qty}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value);
                                      if (!isNaN(val) && val >= (vendor.moq || 1)) {
                                        if (
                                          !vendor.stock_quantity ||
                                          val <= vendor.stock_quantity
                                        ) {
                                          setQuantities((prev) => ({
                                            ...prev,
                                            [`${v.variant_id}-${vendor.vendor_id}`]: val,
                                          }));
                                        } else {
                                          toast.error(
                                            `Maximum available stock is ${vendor.stock_quantity}`
                                          );
                                        }
                                      }
                                    }}
                                    onBlur={(e) => {
                                      const val = parseInt(e.target.value);
                                      if (isNaN(val) || val < (vendor.moq || 1)) {
                                        setQuantities((prev) => ({
                                          ...prev,
                                          [`${v.variant_id}-${vendor.vendor_id}`]:
                                            vendor.moq || 1,
                                        }));
                                      }
                                    }}
                                    className="w-[60px] text-center text-sm font-semibold text-zinc-900 bg-transparent outline-none border-b border-zinc-300 focus:border-blue-600 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                  <span className="text-[10px] text-zinc-400">units</span>
                                </div>
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      vendor.vendor_id,
                                      vendor.moq || 1,
                                      1,
                                      vendor.stock_quantity,
                                      v.variant_id
                                    )
                                  }
                                  className="p-1.5 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                {activePrice > 0 && (
                                  <p className="text-sm font-semibold text-zinc-900">
                                    Total: ₹{totalPrice.toLocaleString()}
                                  </p>
                                )}
                                <button
                                  onClick={() => handleAddToCart(vendor, v.variant_id)}
                                  disabled={addingVendorId === vendor.vendor_id}
                                  className={`px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed ${
                                    requiresQuotation
                                      ? "bg-amber-600 hover:bg-amber-700"
                                      : "bg-blue-600 hover:bg-blue-700"
                                  }`}
                                >
                                  {addingVendorId === vendor.vendor_id ? (
                                    <Loader2 size={16} className="animate-spin" />
                                  ) : (
                                    <ShoppingCart size={16} />
                                  )}
                                  {addingVendorId === vendor.vendor_id
                                    ? "Adding..."
                                    : requiresQuotation
                                    ? "Request Quote"
                                    : "Add to Cart"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center flex flex-col items-center justify-center">
                      <Truck size={36} className="text-zinc-200 mb-2" />
                      <p className="text-sm font-medium text-zinc-500">
                        No suppliers offering this variation
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        /* Flat fallback list if there are no variants */
        <div className="border border-zinc-200 bg-white rounded-2xl shadow-sm">
          <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building size={18} className="text-zinc-650" />
              <h3 className="text-lg font-semibold text-zinc-900">
                {rankedVendors.length > 0
                  ? "Ranked Suppliers"
                  : "Compare Suppliers & Order"}
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
              displayVendors.map((v: any) => {
                const qtyKey = `default-${v.vendor_id}`;
                const qty = quantities[qtyKey] || v.moq || 1;
                const rawPrice =
                  typeof v.price === "string" ? parseFloat(v.price) || 0 : v.price || 0;
                const discountedPrice =
                  v.discounted_price !== null && v.discounted_price !== undefined
                    ? typeof v.discounted_price === "string"
                      ? parseFloat(v.discounted_price)
                      : v.discounted_price
                    : null;
                const activePrice =
                  discountedPrice !== null && discountedPrice < rawPrice
                    ? discountedPrice
                    : rawPrice;
                const hasDiscount =
                  discountedPrice !== null && discountedPrice < rawPrice;
                const totalPrice = activePrice * qty;
                const quotationLimit = product.quotation_limit
                  ? Number(product.quotation_limit)
                  : null;
                const requiresQuotation =
                  quotationLimit !== null && qty >= quotationLimit;
                const isRanked = rankedVendors.length > 0 && "rank" in v;

                return (
                  <div
                    key={v.vendor_id}
                    className="p-5 hover:bg-zinc-50/10 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Supplier Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {isRanked && (
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                v.rank === 1
                                  ? "bg-amber-100 text-amber-700"
                                  : v.rank === 2
                                  ? "bg-zinc-200 text-zinc-700"
                                  : v.rank === 3
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-zinc-100 text-zinc-500"
                              }`}
                            >
                              {v.rank}
                            </span>
                          )}
                          <h4 className="font-semibold text-zinc-900">
                            Vendor #{v.vendor_id.slice(0, 8)}
                          </h4>
                          {(v.city || v.state) && (
                            <div className="flex items-center gap-1 text-xs text-zinc-500">
                              <MapPin size={12} />
                              <span>
                                {[v.city, v.state].filter(Boolean).join(", ")}
                              </span>
                            </div>
                          )}
                          {v.rating > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-full">
                              <Star size={10} fill="currentColor" />
                              {Number(v.rating).toFixed(1)}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs rounded-full">
                            <BadgeCheck size={10} />
                            Verified
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div className="bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg flex flex-col justify-between">
                            <p className="text-xs text-zinc-500">Unit Price</p>
                            <div className="flex flex-wrap items-baseline gap-1">
                              <span className="text-sm font-bold text-blue-600">
                                ₹{activePrice.toLocaleString()}
                              </span>
                              {hasDiscount && (
                                <span className="text-[10px] text-zinc-400 line-through font-medium">
                                  ₹{rawPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">
                              {v.gst_percentage && Number(v.gst_percentage) > 0
                                ? `+ ${v.gst_percentage}% GST`
                                : "GST Excl."}
                            </p>
                          </div>
                          <div className="bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg">
                            <p className="text-xs text-zinc-500">MOQ</p>
                            <p className="text-sm font-semibold text-zinc-800">
                              {v.moq || 1} units
                            </p>
                          </div>
                          <div className="bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg">
                            <p className="text-xs text-zinc-500">Stock</p>
                            <p className="text-sm font-semibold text-zinc-800">
                              {v.stock_quantity || "N/A"}
                            </p>
                          </div>
                        </div>

                        {product.quotation_limit && qty >= product.quotation_limit && (
                          <div className="mb-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                            ⚡ Quotation mode — your request will be sent to all eligible
                            suppliers
                          </div>
                        )}
                      </div>

                      {/* Quantity & Add to Cart */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:w-auto">
                        <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-lg px-2 py-1.5">
                          <button
                            onClick={() =>
                              updateQuantity(v.vendor_id, v.moq || 1, -1, v.stock_quantity)
                            }
                            className="p-1.5 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors disabled:opacity-40"
                            disabled={qty <= (v.moq || 1)}
                          >
                            <Minus size={16} />
                          </button>
                          <div className="flex flex-col items-center min-w-[60px]">
                            <input
                              type="number"
                              min={v.moq || 1}
                              max={v.stock_quantity || undefined}
                              value={qty}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val) && val >= (v.moq || 1)) {
                                  if (!v.stock_quantity || val <= v.stock_quantity) {
                                    setQuantities((prev) => ({
                                      ...prev,
                                      [`default-${v.vendor_id}`]: val,
                                    }));
                                  } else {
                                    toast.error(
                                      `Maximum available stock is ${v.stock_quantity}`
                                    );
                                  }
                                }
                              }}
                              onBlur={(e) => {
                                const val = parseInt(e.target.value);
                                if (isNaN(val) || val < (v.moq || 1)) {
                                  setQuantities((prev) => ({
                                    ...prev,
                                    [`default-${v.vendor_id}`]: v.moq || 1,
                                  }));
                                }
                              }}
                              className="w-[60px] text-center text-sm font-semibold text-zinc-900 bg-transparent outline-none border-b border-zinc-300 focus:border-blue-600 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="text-[10px] text-zinc-400">units</span>
                          </div>
                          <button
                            onClick={() =>
                              updateQuantity(v.vendor_id, v.moq || 1, 1, v.stock_quantity)
                            }
                            className="p-1.5 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {activePrice > 0 && (
                            <p className="text-sm font-semibold text-zinc-900">
                              Total: ₹{totalPrice.toLocaleString()}
                            </p>
                          )}
                          <button
                            onClick={() => handleAddToCart(v)}
                            disabled={addingVendorId === v.vendor_id}
                            className={`px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed ${
                              requiresQuotation
                                ? "bg-amber-600 hover:bg-amber-700"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                          >
                            {addingVendorId === v.vendor_id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <ShoppingCart size={16} />
                            )}
                            {addingVendorId === v.vendor_id
                              ? "Adding..."
                              : requiresQuotation
                              ? "Request Quote"
                              : "Add to Cart"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <Truck size={48} className="text-zinc-200 mb-4" />
                <h4 className="text-lg font-medium text-zinc-900 mb-1">
                  No suppliers available
                </h4>
                <p className="text-zinc-500 text-sm max-w-sm">
                  We&apos;re actively sourcing verified suppliers for this product. Check back
                  soon or contact our team.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Cart CTA Footer */}
      {totalItems > 0 && (
        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-between shadow-xs">
          <p className="text-sm text-zinc-650 font-medium">
            You have <strong className="text-zinc-900">{totalItems}</strong>{" "}
            {totalItems === 1 ? "item" : "items"} in your cart.
          </p>
          <Link
            href="/cart"
            className="px-5 py-2 bg-zinc-900 text-white text-sm font-bold rounded-lg hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-xs"
          >
            View Cart & Checkout
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
