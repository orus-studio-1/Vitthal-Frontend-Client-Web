export type ProductReview = {
  review_id: string;
  rating: number;
  review_title: string;
  review_text: string;
  images: string[];
  verified_purchase: boolean;
  helpful_count: number;
  review_date: string;
  customer_name: string;
  vendor_id: string;
  rating_label: string;
};

export type ReviewStats = {
  total_reviews: number;
  avg_rating: string;
  rating_distribution: Record<number, number>;
};
