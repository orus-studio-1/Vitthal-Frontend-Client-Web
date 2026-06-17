import { create } from "zustand";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

export type CartItem = {
  productId: string;
  productVariantId?: string;
  variantProperties?: any;
  productName: string;
  image: string;
  price: number;
  moq: number;
  quantity: number;
  vendorId: string;
  vendorName: string;
  gstPercentage?: number;
};

type CartApiRow = {
  product_id: string;
  product_variant_id?: string | null;
  variant_properties?: any;
  product_name?: string | null;
  image_url?: string | null;
  price_at_added: string | number;
  moq?: number | null;
  quantity: number;
  vendor_id: string;
  vendor_name?: string | null;
  gst_percentage?: string | number | null;
};

type CartState = {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  fetchCart: (silent?: boolean) => Promise<void>;
  addItem: (item: CartItem) => Promise<boolean>;
  removeItem: (productId: string, vendorId: string, productVariantId?: string) => Promise<boolean>;
  updateQuantity: (productId: string, vendorId: string, quantity: number, productVariantId?: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  totalItems: () => number;
  totalPrice: () => number;
  shareCart: (cartType: "direct" | "quotation") => Promise<string | null>;
  fetchSharedCart: (id: string) => Promise<{ items: CartItem[]; cartType: "direct" | "quotation"; senderName: string } | null>;
  importSharedCart: (items: CartItem[], cartType: "direct" | "quotation", mode: "merge" | "overwrite") => Promise<boolean>;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: true,
  error: null,

  fetchCart: async (silent = false) => {
    if (!silent) set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/api/cart`, {
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
        throw new Error("Failed to fetch cart");
      }
      const data = await res.json();
      // Transform backend data to frontend format
      const items: CartItem[] = ((data.data as CartApiRow[] | undefined) || []).map((row) => ({
        productId: row.product_id,
        productVariantId: row.product_variant_id || undefined,
        variantProperties: row.variant_properties || undefined,
        productName: row.product_name || "Unknown Product",
        image: row.image_url || "",
        price: Number(row.price_at_added) || 0,
        moq: row.moq || 1,
        quantity: row.quantity,
        vendorId: row.vendor_id,
        vendorName: row.vendor_name || "Unknown Vendor",
        gstPercentage: row.gst_percentage !== null && row.gst_percentage !== undefined ? Number(row.gst_percentage) : 0,
      }));
      set({ items, isLoading: false });
    } catch (err) {
      console.error("fetchCart error:", err);
      set({ error: "Failed to load cart", isLoading: false });
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
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) throw new Error("Please login to add items");
        throw new Error(data.message || "Failed to add item");
      }
      // Refresh cart to get updated data
      await get().fetchCart();
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
        body: JSON.stringify({ product_id: productId, product_variant_id: productVariantId || null, vendor_id: vendorId }),
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
        body: JSON.stringify({ product_id: productId, product_variant_id: productVariantId || null, vendor_id: vendorId, quantity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update quantity");
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
      const res = await fetch(`${API_BASE}/api/cart`, {
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

  totalPrice: () =>
    get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

  shareCart: async (cartType) => {
    try {
      const res = await fetch(`${API_BASE}/api/cart/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-request-from": "client",
        },
        credentials: "include",
        body: JSON.stringify({ cart_type: cartType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to share cart");
      return data.shared_cart_id;
    } catch (err) {
      console.error("shareCart error:", err);
      return null;
    }
  },

  fetchSharedCart: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/cart/share/${id}`, {
        headers: {
          "Content-Type": "application/json",
          "x-request-from": "client",
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch shared cart");
      
      const items: CartItem[] = (data.items || []).map((row: CartApiRow) => ({
        productId: row.product_id,
        productVariantId: row.product_variant_id || undefined,
        variantProperties: row.variant_properties || undefined,
        productName: row.product_name || "Unknown Product",
        image: row.image_url || "",
        price: Number(row.price_at_added) || 0,
        moq: row.moq || 1,
        quantity: row.quantity,
        vendorId: row.vendor_id,
        vendorName: row.vendor_name || "Unknown Vendor",
        gstPercentage: row.gst_percentage !== null && row.gst_percentage !== undefined ? Number(row.gst_percentage) : 0,
      }));

      return {
        items,
        cartType: data.cart_type,
        senderName: data.sender_name || "A user",
      };
    } catch (err) {
      console.error("fetchSharedCart error:", err);
      return null;
    }
  },

  importSharedCart: async (items, cartType, mode) => {
    try {
      if (mode === "overwrite") {
        const deleteUrl = cartType === "quotation" ? `${API_BASE}/api/cart?type=quotation` : `${API_BASE}/api/cart`;
        const clearRes = await fetch(deleteUrl, {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "x-request-from": "client",
          },
        });
        if (!clearRes.ok) throw new Error("Failed to clear existing cart");
      }

      // Add items sequentially
      for (const item of items) {
        const addRes = await fetch(`${API_BASE}/api/cart`, {
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
            cart_type: cartType,
          }),
        });
        if (!addRes.ok) {
          const data = await addRes.json();
          console.warn(`Failed to add item ${item.productId}:`, data.message);
        }
      }

      // Proactively fetch updated cart data depending on type
      if (cartType === "quotation") {
        const { useQuotationCartStore } = await import("./quotationCartStore");
        await useQuotationCartStore.getState().fetchCart();
      } else {
        await get().fetchCart();
      }

      return true;
    } catch (err) {
      console.error("importSharedCart error:", err);
      return false;
    }
  },
}));
