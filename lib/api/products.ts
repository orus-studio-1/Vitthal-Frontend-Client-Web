import type { ProductDetail, Product, RelatedProduct, Category, RankedVendor } from "@/types";
import { mapBackendProduct } from "../utils/product";

const PRODUCTS_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/products`
  : "http://localhost:9000/api/products";

export async function fetchProduct(id: string): Promise<ProductDetail | null> {
  const url = `${PRODUCTS_BASE_URL}/getProductById/${id}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.error("Error fetching individual product:", err);
    return null;
  }
}

export async function fetchRankedVendors(
  productId: string,
  lat: number,
  lng: number,
  variantId?: string
): Promise<RankedVendor[]> {
  let url = `${PRODUCTS_BASE_URL}/getRankedVendors/${productId}?userLat=${lat}&userLng=${lng}`;
  if (variantId) {
    url += `&variantId=${variantId}`;
  }
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error("Error fetching ranked vendors:", err);
    return [];
  }
}

export async function fetchRelatedProducts(productId: string): Promise<RelatedProduct[]> {
  const url = `${PRODUCTS_BASE_URL}/getRelatedProducts/${productId}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error("Error fetching related products:", err);
    return [];
  }
}

interface FetchByCategoryResult {
  products: Product[];
  totalCount: number;
}

export async function fetchProductsByCategory(
  category: string,
  offset: number,
  limit: number,
  search?: string,
  productType?: string,
  subcategory?: string
): Promise<FetchByCategoryResult> {
  try {
    const params = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString(),
    });
    if (search) params.append("search", search);
    if (productType) params.append("productType", productType);
    if (subcategory) params.append("subcategory", subcategory);

    const url = `${PRODUCTS_BASE_URL}/getProductsByCategory/${encodeURIComponent(category)}?${params.toString()}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.error(`Failed to fetch category products: ${res.status} ${res.statusText}`);
      return { products: [], totalCount: 0 };
    }
    const json = await res.json();
    const products =
      json.data && Array.isArray(json.data) ? json.data.map(mapBackendProduct) : [];
    const totalCount =
      typeof json.totalCount === "number" ? json.totalCount : products.length;
    return { products, totalCount };
  } catch (error) {
    console.error("Fetch error for category products:", error);
    return { products: [], totalCount: 0 };
  }
}

export async function fetchSubcategoriesByCategory(category: string): Promise<any[]> {
  try {
    const url = `${PRODUCTS_BASE_URL}/subcategories?categoryId=${encodeURIComponent(category)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error("Error fetching subcategories:", err);
    return [];
  }
}

export async function fetchAllProducts(offset: number, limit: number): Promise<Product[]> {
  try {
    const res = await fetch(
      `${PRODUCTS_BASE_URL}/getAllProducts?offset=${offset}&limit=${limit}`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const json = await res.json();
    if (json.data && Array.isArray(json.data)) {
      return json.data.map(mapBackendProduct);
    }
    return [];
  } catch (error) {
    console.error("Fetch error for all products:", error);
    return [];
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${PRODUCTS_BASE_URL}/getCategories`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    if (json.data && Array.isArray(json.data)) {
      return json.data;
    }
    return [];
  } catch (error) {
    console.error("Fetch categories error:", error);
    return [];
  }
}
