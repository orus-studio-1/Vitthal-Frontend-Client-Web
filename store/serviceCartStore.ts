import { create } from "zustand";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

export type ServiceCartItem = {
  serviceCartItemId: string;
  cartId: string;
  serviceId: string;
  vendorServiceId: string;
  vendorId: string;
  quantity: number;
  priceAtAdded: number;
  pricingType: string;
  serviceName: string;
  vendorName: string;
  vendorRating: number;
  moq: number;
  image: string;
};

type ApiRow = {
  service_cart_item_id: string;
  cart_id: string;
  service_id: string;
  vendor_service_id: string;
  vendor_id: string;
  quantity: number;
  price_at_added: string | number;
  pricing_type: string;
  service_name?: string | null;
  vendor_name?: string | null;
  vendor_rating?: string | number | null;
  moq?: number | null;
  image_url?: string | null;
};

type ServiceCartState = {
  items: ServiceCartItem[];
  isLoading: boolean;
  error: string | null;
  fetchCart: (cartType?: "direct" | "quotation", silent?: boolean) => Promise<void>;
  addItem: (vendorServiceId: string, quantity: number, cartType?: "direct" | "quotation") => Promise<boolean>;
  removeItem: (serviceCartItemId: string) => Promise<boolean>;
  updateQuantity: (serviceCartItemId: string, quantity: number) => Promise<boolean>;
  clearCart: (cartType?: "direct" | "quotation") => Promise<boolean>;
  totalItems: () => number;
  totalPrice: () => number;
};

export const useServiceCartStore = create<ServiceCartState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchCart: async (cartType = "direct", silent = false) => {
    if (!silent) set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/api/service-cart?type=${cartType}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", "x-request-from": "client" },
      });
      if (!res.ok) {
        if (res.status === 401) { set({ items: [], isLoading: false }); return; }
        throw new Error("Failed to fetch service cart");
      }
      const data = await res.json();
      const items: ServiceCartItem[] = ((data.data as ApiRow[] | undefined) || []).map((row) => ({
        serviceCartItemId: row.service_cart_item_id,
        cartId: row.cart_id,
        serviceId: row.service_id,
        vendorServiceId: row.vendor_service_id,
        vendorId: row.vendor_id,
        quantity: row.quantity,
        priceAtAdded: Number(row.price_at_added) || 0,
        pricingType: row.pricing_type || "flat",
        serviceName: row.service_name || "Unknown Service",
        vendorName: row.vendor_name || "Unknown Vendor",
        vendorRating: row.vendor_rating ? Number(row.vendor_rating) : 0,
        moq: row.moq || 1,
        image: row.image_url || "",
      }));
      set({ items, isLoading: false });
    } catch (err) {
      console.error("serviceCartStore.fetchCart error:", err);
      set({ error: "Failed to load service cart", isLoading: false });
    }
  },

  addItem: async (vendorServiceId, quantity, cartType = "direct") => {
    try {
      const res = await fetch(`${API_BASE}/api/service-cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-request-from": "client" },
        credentials: "include",
        body: JSON.stringify({ vendor_service_id: vendorServiceId, quantity, cart_type: cartType }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) throw new Error("Please login to add services");
        throw new Error(data.message || "Failed to add service to cart");
      }
      await get().fetchCart(cartType, true);
      return true;
    } catch (err) {
      console.error("serviceCartStore.addItem error:", err);
      set({ error: err instanceof Error ? err.message : "Failed to add service" });
      return false;
    }
  },

  removeItem: async (serviceCartItemId) => {
    try {
      const res = await fetch(`${API_BASE}/api/service-cart/item/${serviceCartItemId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-request-from": "client" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to remove service cart item");
      set((state) => ({ items: state.items.filter((i) => i.serviceCartItemId !== serviceCartItemId) }));
      return true;
    } catch (err) {
      console.error("serviceCartStore.removeItem error:", err);
      return false;
    }
  },

  updateQuantity: async (serviceCartItemId, quantity) => {
    if (quantity < 1) return false;
    try {
      const res = await fetch(`${API_BASE}/api/service-cart/item/${serviceCartItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-request-from": "client" },
        credentials: "include",
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error("Failed to update quantity");
      set((state) => ({
        items: state.items.map((i) =>
          i.serviceCartItemId === serviceCartItemId ? { ...i, quantity } : i
        ),
      }));
      return true;
    } catch (err) {
      console.error("serviceCartStore.updateQuantity error:", err);
      return false;
    }
  },

  clearCart: async (cartType = "direct") => {
    try {
      const res = await fetch(`${API_BASE}/api/service-cart?type=${cartType}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-request-from": "client" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to clear service cart");
      set({ items: [] });
      return true;
    } catch (err) {
      console.error("serviceCartStore.clearCart error:", err);
      return false;
    }
  },

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  totalPrice: () => get().items.reduce((sum, i) => sum + i.priceAtAdded * i.quantity, 0),
}));
