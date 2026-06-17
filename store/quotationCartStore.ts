import { create } from "zustand";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

export type QuotationCartItem = {
  productId: string;
  productVariantId?: string;
  variantProperties?: any;
  productName: string;
  image: string;
  price: number;
  moq: number;
  quotationMinQty?: number | null;
  quotationEnabled?: boolean;
  quantity: number;
  vendorId: string;
  vendorName: string;
  gstPercentage?: number;
};

type QuotationCartApiRow = {
  product_id: string;
  product_variant_id?: string | null;
  variant_properties?: any;
  product_name?: string | null;
  image_url?: string | null;
  price_at_added: string | number;
  moq?: number | null;
  quotation_enabled?: boolean | null;
  quotation_limit?: number | null;
  quantity: number;
  vendor_id: string;
  vendor_name?: string | null;
  gst_percentage?: string | number | null;
};

type QuotationCartState = {
  items: QuotationCartItem[];
  isLoading: boolean;
  error: string | null;
  fetchCart: (silent?: boolean) => Promise<void>;
  addItem: (item: QuotationCartItem) => Promise<boolean>;
  removeItem: (productId: string, vendorId: string, productVariantId?: string) => Promise<boolean>;
  updateQuantity: (productId: string, vendorId: string, quantity: number, productVariantId?: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  totalItems: () => number;
};

export const useQuotationCartStore = create<QuotationCartState>((set, get) => ({
  items: [],
  isLoading: true,
  error: null,

  fetchCart: async (silent = false) => {
    if (!silent) set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/api/cart?type=quotation`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-request-from": "client",
        },
      });
      if (!res.ok) {
        if (res.status === 401) {
          set({ items: [], isLoading: false });
          return;
        }
        throw new Error("Failed to fetch quotation cart");
      }
      const data = await res.json();
      const items: QuotationCartItem[] = ((data.data as QuotationCartApiRow[] | undefined) || []).map((row) => ({
        productId: row.product_id,
        productVariantId: row.product_variant_id || undefined,
        variantProperties: row.variant_properties || undefined,
        productName: row.product_name || "Unknown Product",
        image: row.image_url || "",
        price: Number(row.price_at_added) || 0,
        moq: row.moq || 1,
        quotationEnabled: Boolean(row.quotation_enabled),
        quotationMinQty: row.quotation_limit ?? null,
        quantity: row.quantity,
        vendorId: row.vendor_id,
        vendorName: row.vendor_name || "Unknown Vendor",
        gstPercentage: row.gst_percentage !== null && row.gst_percentage !== undefined ? Number(row.gst_percentage) : 0,
      }));
      set({ items, isLoading: false });
    } catch (err) {
      console.error("fetch quotation cart error:", err);
      set({ error: "Failed to load quotation cart", isLoading: false });
    }
  },

  addItem: async (item) => {
    try {
      const res = await fetch(`${API_BASE}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-request-from": "client",
        },
        credentials: "include",
        body: JSON.stringify({
          product_id: item.productId,
          product_variant_id: item.productVariantId || null,
          vendor_id: item.vendorId,
          quantity: item.quantity,
          cart_type: "quotation",
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to add item");
      }
      await get().fetchCart(true);
      return true;
    } catch (err) {
      console.error("addItem error:", err);
      set({ error: err instanceof Error ? err.message : "Failed to add item", isLoading: false });
      return false;
    }
  },

  removeItem: async (productId, vendorId, productVariantId) => {
    try {
      const res = await fetch(`${API_BASE}/api/cart/item`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-request-from": "client",
        },
        credentials: "include",
        body: JSON.stringify({ product_id: productId, product_variant_id: productVariantId || null, vendor_id: vendorId, cart_type: "quotation" }),
      });
      if (!res.ok) throw new Error("Failed to remove item");
      await get().fetchCart(true);
      return true;
    } catch (err) {
      console.error("removeItem error:", err);
      set({ error: "Failed to remove item", isLoading: false });
      return false;
    }
  },

  updateQuantity: async (productId, vendorId, quantity, productVariantId) => {
    if (quantity < 1) return false;
    try {
      const res = await fetch(`${API_BASE}/api/cart/item`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-request-from": "client",
        },
        credentials: "include",
        body: JSON.stringify({ product_id: productId, product_variant_id: productVariantId || null, vendor_id: vendorId, quantity, cart_type: "quotation" }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update quantity");
      }
      await get().fetchCart(true);
      return true;
    } catch (err) {
      console.error("updateQuantity error:", err);
      set({ error: "Failed to update quantity", isLoading: false });
      return false;
    }
  },

  clearCart: async () => {
    try {
      const res = await fetch(`${API_BASE}/api/cart?type=quotation`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-request-from": "client",
        },
      });
      if (!res.ok) throw new Error("Failed to clear cart");
      set({ items: [], isLoading: false });
      return true;
    } catch (err) {
      console.error("clearCart error:", err);
      set({ error: "Failed to clear cart", isLoading: false });
      return false;
    }
  },

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
