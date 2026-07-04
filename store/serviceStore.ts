import { create } from "zustand";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

export type ServiceCategory = {
  id: string;
  label: string;
};

export type ServiceListItem = {
  id: string;
  name: string;
  description: string | null;
  rating: string | null;
  review_count: number;
  category_id: string | null;
  category_label: string | null;
  vendor_count: number;
  starting_price: string | null;
  image_url?: string | null;
};

export type ServiceMedia = {
  id: string;
  media_url: string;
  media_type: string;
  is_primary: boolean;
  display_order: number;
};

export type ServiceReview = {
  id: string;
  rating: number;
  review_title: string | null;
  review_text: string | null;
  images: string[];
  created_at: string;
  reviewer_name: string;
};

export type VendorOffering = {
  vendor_service_id: string;
  pricing_type: string;
  price: string;
  moq: number | null;
  is_active: boolean;
  vendor_id: string;
  company_name: string;
  vendor_rating: string | null;
  vendor_review_count: number;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  state: string | null;
  distance: number | null;
};

export type ServiceDetail = {
  id: string;
  name: string;
  description: string | null;
  rating: string | null;
  review_count: number;
  status: string;
  category_id: string | null;
  category_label: string | null;
  category_code?: string | null;
  category_image?: string | null;
  media: ServiceMedia[];
  vendor_offerings: VendorOffering[];
  specifications?: Record<string, string> | null;
  reviews?: ServiceReview[];
};

export type ServiceBooking = {
  id: string;
  status: string;
  payment_status: string;
  total_amount: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  booking_notes: string | null;
  created_at: string;
  service_name: string;
  service_description: string | null;
  vendor_name: string;
  pricing_type: string;
  has_review: boolean;
};

export type ServiceQuotation = {
  id: string;
  status: string;
  scope_of_work: string;
  requested_price: string | null;
  agreed_price: string | null;
  created_at: string;
  updated_at: string;
  service_name: string;
  vendor_name: string;
  service_id: string;
  vendor_id: string;
  service_image?: string | null;
};

export type QuotationMessage = {
  id: string;
  sender_role: string;
  action: string;
  offer_price: string | null;
  note: string | null;
  reason: string | null;
  created_at: string;
  sender_name: string;
};

export type QuotationDetail = {
  quotation: ServiceQuotation & {
    service_id: string;
    vendor_id: string;
    user_id: string;
    client_name?: string;
    client_email?: string;
  };
  messages: QuotationMessage[];
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
};

type ServiceState = {
  services: ServiceListItem[];
  pagination: Pagination | null;
  isLoadingList: boolean;
  listError: string | null;

  bookings: ServiceBooking[];
  isLoadingBookings: boolean;
  bookingsError: string | null;

  quotations: ServiceQuotation[];
  isLoadingQuotations: boolean;
  quotationsError: string | null;

  browseServices: (params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }) => Promise<void>;


  fetchMyBookings: () => Promise<void>;

  generateOtp: (bookingId: string) => Promise<boolean>;

  createQuotation: (payload: {
    vendorId: string;
    serviceId: string;
    scopeOfWork: string;
    requestedPrice?: string;
  }) => Promise<boolean>;

  fetchMyQuotations: () => Promise<void>;

  respondQuotation: (
    quotationId: string,
    payload: {
      action: string;
      offerPrice?: string;
      note?: string;
      reason?: string;
    }
  ) => Promise<boolean>;

  submitReview: (payload: {
    bookingId: string;
    rating: number;
    reviewTitle?: string;
    reviewText?: string;
  }) => Promise<boolean>;
};

export const useServiceStore = create<ServiceState>((set) => ({
  services: [],
  pagination: null,
  isLoadingList: false,
  listError: null,

  bookings: [],
  isLoadingBookings: false,
  bookingsError: null,

  quotations: [],
  isLoadingQuotations: false,
  quotationsError: null,

  browseServices: async ({ page = 1, limit = 20, search, category } = {}) => {
    set({ isLoadingList: true, listError: null });
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set("search", search);
      if (category) params.set("category", category);

      const res = await fetch(`${API_BASE}/api/services?${params.toString()}`, {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "x-request-from": "client",
        },
      });

      if (!res.ok) {
        set({ services: [], pagination: null, isLoadingList: false, listError: "Failed to load services" });
        return;
      }

      const json = await res.json();
      set({
        services: Array.isArray(json.data) ? json.data : [],
        pagination: json.pagination ?? null,
        isLoadingList: false,
        listError: null,
      });
    } catch {
      set({ services: [], pagination: null, isLoadingList: false, listError: "Network error" });
    }
  },


  fetchMyBookings: async () => {
    set({ isLoadingBookings: true, bookingsError: null });
    try {
      const res = await fetch(`${API_BASE}/api/services/client/bookings`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-request-from": "client",
        },
      });

      if (res.status === 401) {
        set({ bookings: [], isLoadingBookings: false });
        return;
      }

      if (!res.ok) {
        set({ bookings: [], isLoadingBookings: false, bookingsError: "Failed to load bookings" });
        return;
      }

      const json = await res.json();
      set({ bookings: Array.isArray(json.data) ? json.data : [], isLoadingBookings: false });
    } catch {
      set({ bookings: [], isLoadingBookings: false, bookingsError: "Network error" });
    }
  },

  generateOtp: async (bookingId) => {
    try {
      const res = await fetch(`${API_BASE}/api/services/client/bookings/${bookingId}/otp`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-request-from": "client",
        },
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  createQuotation: async ({ vendorId, serviceId, scopeOfWork, requestedPrice }) => {
    try {
      const res = await fetch(`${API_BASE}/api/services/quotations`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-request-from": "client",
        },
        body: JSON.stringify({ vendorId, serviceId, scopeOfWork, requestedPrice }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  fetchMyQuotations: async () => {
    set({ isLoadingQuotations: true, quotationsError: null });
    try {
      const res = await fetch(`${API_BASE}/api/services/client/quotations`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-request-from": "client",
        },
      });

      if (res.status === 401) {
        set({ quotations: [], isLoadingQuotations: false });
        return;
      }

      if (!res.ok) {
        set({ quotations: [], isLoadingQuotations: false, quotationsError: "Failed to load quotations" });
        return;
      }

      const json = await res.json();
      set({ quotations: Array.isArray(json.data) ? json.data : [], isLoadingQuotations: false });
    } catch {
      set({ quotations: [], isLoadingQuotations: false, quotationsError: "Network error" });
    }
  },

  respondQuotation: async (quotationId, { action, offerPrice, note, reason }) => {
    try {
      const res = await fetch(`${API_BASE}/api/services/quotations/${quotationId}/respond`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-request-from": "client",
        },
        body: JSON.stringify({ action, offerPrice, note, reason }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  submitReview: async ({ bookingId, rating, reviewTitle, reviewText }) => {
    try {
      const res = await fetch(`${API_BASE}/api/services/reviews`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-request-from": "client",
        },
        body: JSON.stringify({ bookingId, rating, reviewTitle, reviewText }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
}));
