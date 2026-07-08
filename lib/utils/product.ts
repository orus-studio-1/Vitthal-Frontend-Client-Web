import type { Product, ProductDetail, ProductVariant } from "@/types";

const FALLBACK_IMAGE =
  "https://www.shutterstock.com/image-photo/neatly-stacked-light-green-gypsum-600nw-2690641841.jpg";

/** Map a raw backend product payload to the frontend Product shape. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapBackendProduct(bp: any): Product {
  const vendorsCount = Number(bp.seller_count || bp.vendor_count || 0);
  const minPrice = Number(bp.min_price) || 0;
  const maxPrice = Number(bp.max_price) || 0;
  const minMoq = Number(bp.min_moq) || 1;
  const minOriginalPrice = bp.min_original_price ? Number(bp.min_original_price) : undefined;
  const maxOriginalPrice = bp.max_original_price ? Number(bp.max_original_price) : undefined;
  return {
    id: bp.product_id || bp.id || "unknown",
    name: bp.product_name || "Unknown Product",
    minPrice,
    maxPrice,
    minOriginalPrice,
    maxOriginalPrice,
    moq: minMoq,
    sellerCount: vendorsCount,
    image: bp.primary_image || FALLBACK_IMAGE,
  };
}

/** Sort an array of products by a given sort key. */
export function sortProducts(products: Product[], sortBy: string): Product[] {
  const sorted = [...products];
  switch (sortBy) {
    case "all":
      return sorted;
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "price-asc":
      sorted.sort((a, b) => a.minPrice - b.minPrice);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.maxPrice - a.maxPrice);
      break;
    case "suppliers":
      sorted.sort((a, b) => b.sellerCount - a.sellerCount);
      break;
    default:
      sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
  return sorted;
}

/** Check if a value is defined and non-empty (not null/undefined/empty/literal "null"). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isValidValue(val: any): boolean {
  if (val === null || val === undefined) return false;
  const str = String(val).trim();
  return str !== "" && str.toLowerCase() !== "null" && str.toLowerCase() !== "undefined";
}

/** Resolve a property key from variant properties first, then global specs/attributes. */
export function getResolvedProperty(
  key: string,
  product: ProductDetail,
  selectedVariant: ProductVariant | null
): string | number | undefined {
  let val: unknown = undefined;

  if (selectedVariant?.properties) {
    const foundKey = Object.keys(selectedVariant.properties).find(
      (k) => k.toLowerCase() === key.toLowerCase()
    );
    if (foundKey) val = selectedVariant.properties[foundKey];
  }

  if (!isValidValue(val)) {
    const globalSpecs = {
      ...(product.specifications || {}),
      ...(product.attributes || {}),
    };
    const foundKey = Object.keys(globalSpecs).find(
      (k) => k.toLowerCase() === key.toLowerCase()
    );
    if (foundKey) {
      val = globalSpecs[foundKey];
    } else if (key.toLowerCase() === "material") {
      val = product.material;
    } else if (key.toLowerCase() === "grade") {
      val = product.grade;
    } else if (key.toLowerCase() === "application") {
      val = product.application;
    } else if (key.toLowerCase() === "standard") {
      val = product.standard;
    }
  }

  return isValidValue(val) ? (val as string | number) : undefined;
}

/** Merge global + variant attributes for display, excluding standard top-level props. */
export function getKeyProperties(
  product: ProductDetail,
  selectedVariant: ProductVariant | null
): Record<string, string | number> {
  const attrs = { ...(product.attributes || {}) };
  if (selectedVariant?.properties) {
    Object.entries(selectedVariant.properties).forEach(([key, val]) => {
      attrs[key] = val as string | number;
    });
  }
  const result: Record<string, string | number> = {};
  Object.entries(attrs).forEach(([key, val]) => {
    if (["material", "grade", "application", "standard"].includes(key.toLowerCase())) return;
    if (isValidValue(val)) result[key] = val;
  });
  return result;
}

/** Get technical specifications from product. */
export function getTechnicalSpecifications(
  product: ProductDetail
): Record<string, string | number> {
  const specs = product.specifications || {};
  const result: Record<string, string | number> = {};
  Object.entries(specs).forEach(([key, val]) => {
    if (isValidValue(val)) result[key] = val;
  });
  return result;
}

/** Extract unique attribute values across all variants (for spec chips). */
export function getVariantAttributes(
  variants: Array<{ properties: Record<string, string> }>
): Record<string, string[]> {
  const attributes: Record<string, Set<string>> = {};
  variants.forEach((v) => {
    if (v.properties) {
      Object.entries(v.properties).forEach(([key, val]) => {
        if (!attributes[key]) attributes[key] = new Set<string>();
        attributes[key].add(val);
      });
    }
  });
  const result: Record<string, string[]> = {};
  Object.entries(attributes).forEach(([key, valSet]) => {
    result[key] = Array.from(valSet).sort();
  });
  return result;
}

/** Get the thumbnail image URL for a specific variant. */
export function getVariantThumbnail(
  variant: ProductVariant,
  product: ProductDetail
): string | null {
  if (!product.images) return null;
  const variantImg = product.images.find(
    (img) => img.product_variant_id === variant.variant_id
  );
  if (variantImg) return variantImg.image_url;

  const primaryImg = product.images.find((img) => img.is_primary && !img.product_variant_id);
  if (primaryImg) return primaryImg.image_url;

  const firstGlobal = product.images.find((img) => !img.product_variant_id);
  if (firstGlobal) return firstGlobal.image_url;

  return product.images[0]?.image_url || null;
}

/** Get images for the currently selected variant (fallback to global images). */
export function getActiveImages(
  product: ProductDetail,
  selectedVariant: ProductVariant | null
) {
  if (!selectedVariant) return product.images || [];

  const variantImages = (product.images || []).filter(
    (img) => img.product_variant_id === selectedVariant.variant_id
  );
  if (variantImages.length > 0) return variantImages;

  const globalImages = (product.images || []).filter((img) => !img.product_variant_id);
  if (globalImages.length > 0) return globalImages;

  return product.images || [];
}
