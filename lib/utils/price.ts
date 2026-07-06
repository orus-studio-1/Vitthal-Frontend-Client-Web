import type { Vendor } from "@/types";

/** Resolve the active (effective) price for a vendor, respecting discounted_price. */
export function getActivePrice(vendor: Pick<Vendor, "price" | "discounted_price">): number {
  const rawPrice =
    typeof vendor.price === "string" ? parseFloat(vendor.price) || 0 : vendor.price || 0;
  const discountedPrice =
    vendor.discounted_price !== null && vendor.discounted_price !== undefined
      ? typeof vendor.discounted_price === "string"
        ? parseFloat(vendor.discounted_price)
        : vendor.discounted_price
      : null;
  return discountedPrice !== null && discountedPrice < rawPrice ? discountedPrice : rawPrice;
}

/** Check if a vendor has a meaningful discount. */
export function hasDiscount(vendor: Pick<Vendor, "price" | "discounted_price">): boolean {
  const rawPrice =
    typeof vendor.price === "string" ? parseFloat(vendor.price) || 0 : vendor.price || 0;
  const discountedPrice =
    vendor.discounted_price !== null && vendor.discounted_price !== undefined
      ? typeof vendor.discounted_price === "string"
        ? parseFloat(vendor.discounted_price)
        : vendor.discounted_price
      : null;
  return discountedPrice !== null && discountedPrice < rawPrice;
}

/** Format an Indian rupee price label. */
export function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

/** Get a "min – max" price range string from a list of vendors. */
export function getPriceRangeLabel(vendors: Pick<Vendor, "price" | "discounted_price">[]): string | null {
  if (!vendors?.length) return null;
  const prices = vendors
    .map(getActivePrice)
    .filter((p): p is number => !!p && !isNaN(p));
  if (!prices.length) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatPrice(min) : `${formatPrice(min)} - ${formatPrice(max)}`;
}

/** Get a price range string for a specific product variant's vendors. */
export function getVariantPriceRange(variant: { vendors?: Pick<Vendor, "price" | "discounted_price">[] }): string {
  const vendors = variant?.vendors || [];
  if (!vendors.length) return "No suppliers";
  const label = getPriceRangeLabel(vendors);
  return label || "No suppliers";
}
