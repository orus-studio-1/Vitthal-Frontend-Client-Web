import { create } from "zustand";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

export type WishlistItem = {
  productId: string;
  productVariantId?: string;
  variantProperties?: any;
  productName: string;
  description?: string;
  image: string;
  vendorId: string | null;
  vendorName: string;
  price: number;
  moq: number;
  stockQuantity: number;
};

type WishlistApiRow = {
  product_id: string;
  product_variant_id?: string | null;
  variant_properties?: any;
  product_name?: string | null;
  description?: string | null;
  image_url?: string | null;
  vendor_id?: string | null;
  vendor_name?: string | null;
  current_price?: string | number | null;
  moq?: number | null;
  stock_quantity?: number | null;
};

type WishlistState = {
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;
  fetchWishlist: (silent?: boolean) => Promise<void>;
  addItem: (item: WishlistItem) => Promise<boolean>;
  removeItem: (productId: string, productVariantId?: string) => Promise<boolean>;
  clearWishlist: () => Promise<boolean>;
  totalItems: () => number;
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: true,
  error: null,

  fetchWishlist: async (silent = false) => {
    if (!silent) set({ isLoading: true, error: null });

    try {
      const res = await fetch(`${API_BASE}/api/wishlist`, {
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
        throw new Error("Failed to fetch wishlist");
      }

      const data = await res.json();
      const items: WishlistItem[] = ((data.data as WishlistApiRow[] | undefined) || []).map((row) => ({
        productId: row.product_id,
        productVariantId: row.product_variant_id || undefined,
        variantProperties: row.variant_properties || undefined,
        productName: row.product_name || "Unknown Product",
        description: row.description || "",
        image: row.image_url || "",
        vendorId: row.vendor_id || null,
        vendorName: row.vendor_name || "Unknown Vendor",
        price: Number(row.current_price) || 0,
        moq: row.moq || 1,
        stockQuantity: row.stock_quantity || 0,
      }));

      set({ items, isLoading: false });
    } catch (error) {
      console.error("fetchWishlist error:", error);
      set({ error: "Failed to load wishlist", isLoading: false });
    }
  },

  addItem: async (item) => {
    try {
      const res = await fetch(`${API_BASE}/api/wishlist`, {
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
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Please login to save items");
        }
        throw new Error("Failed to add item to wishlist");
      }

      await get().fetchWishlist(true);
      return true;
    } catch (error) {
      console.error("addWishlistItem error:", error);
      set({ error: error instanceof Error ? error.message : "Failed to add item", isLoading: false });
      return false;
    }
  },

  removeItem: async (productId, productVariantId) => {
    try {
      const res = await fetch(`${API_BASE}/api/wishlist/item`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-request-from": "client",
        },
        credentials: "include",
        body: JSON.stringify({ product_id: productId, product_variant_id: productVariantId || null }),
      });

      if (!res.ok) {
        throw new Error("Failed to remove item");
      }

      await get().fetchWishlist(true);
      return true;
    } catch (error) {
      console.error("removeWishlistItem error:", error);
      set({ error: "Failed to remove item", isLoading: false });
      return false;
    }
  },

  clearWishlist: async () => {
    try {
      const res = await fetch(`${API_BASE}/api/wishlist`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-request-from": "client",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to clear wishlist");
      }

      set({ items: [], isLoading: false });
      return true;
    } catch (error) {
      console.error("clearWishlist error:", error);
      set({ error: "Failed to clear wishlist", isLoading: false });
      return false;
    }
  },

  totalItems: () => get().items.length,
}));