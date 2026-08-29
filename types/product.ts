import type { Vendor } from "@/types/vendor";
// Refreshed import to clear TS compiler cache
export type ProductImage = {
  image_url: string;
  is_primary: boolean;
  display_order: number;
  media_type?: "image" | "video" | null;
  product_variant_id?: string | null;
};

export type ProductVariant = {
  variant_id: string;
  sku: string | null;
  variant_name?: string | null;
  properties: Record<string, string>;
  approval_status: string;
  vendors: Vendor[];
};

export type Subcategory = {
  id: string;
  category_id: string;
  name: string;
  description?: string | null;
  category_code?: string;
  category_label?: string;
};

export type ProductDetail = {
  product_id: string;
  product_name: string;
  description: string;
  category: string;
  category_label?: string;
  subcategory_id?: string;
  subcategory_name?: string;
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
  variants?: ProductVariant[];
};

/** Lightweight product shape used in listing pages */
export type Product = {
  id: string;
  name: string;
  category?: string;
  category_label?: string;
  subcategory_id?: string;
  subcategory_name?: string;
  minPrice: number;
  maxPrice: number;
  minOriginalPrice?: number;
  maxOriginalPrice?: number;
  moq: number;
  sellerCount: number;
  image: string;
};

export type RelatedProduct = {
  product_id: string;
  product_name: string;
  category?: string;
  category_label?: string;
  subcategory_id?: string;
  subcategory_name?: string;
  primary_image?: string | null;
  seller_count: number;
  rating: number;
  review_count?: number;
  min_price?: number;
  max_price?: number;
  min_moq?: number;
};

export type Category = {
  id: string;
  code: string;
  label: string;
  description: string;
  image: string;
  min_commision_percentage: number;
  max_commision_percentage: number;
  sort_order: number;
  category_type?: 'product' | 'service' | 'both';
  subcategories?: Subcategory[];
  subcategory_count?: number;
};
