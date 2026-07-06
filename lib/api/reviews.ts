import type { ProductReview, ReviewStats } from "@/types";

const PRODUCTS_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/products`
  : "http://localhost:9000/api/products";

export interface ReviewsResponse {
  reviews: ProductReview[];
  stats: ReviewStats | null;
  pagination: { has_more: boolean };
}

export async function fetchProductReviews(
  productId: string,
  page: number = 0,
  limit: number = 5
): Promise<ReviewsResponse | null> {
  const url = `${PRODUCTS_BASE_URL}/getProductReviews/${productId}?page=${page}&limit=${limit}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.error("Error fetching product reviews:", err);
    return null;
  }
}
