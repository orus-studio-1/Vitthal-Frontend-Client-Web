export type Vendor = {
  vendor_id: string;
  price: number | string;
  discounted_price?: number | string | null;
  moq: number;
  stock_quantity: number;
  quotation_enabled?: boolean;
  rating: number;
  review_count: number;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  state: string | null;
  gst_percentage?: number | string;
};

export type RankedVendor = Vendor & {
  distance: number | null;
  price_score: number;
  distance_score: number;
  review_score: number;
  total_score: number;
  rank: number;
};
