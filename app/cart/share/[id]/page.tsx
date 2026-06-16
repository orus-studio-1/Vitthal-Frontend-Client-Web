"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Package, ArrowLeft, Loader2, ShoppingCart, User, Plus, RotateCcw, AlertTriangle } from "lucide-react";
import { useCartStore, CartItem } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export default function SharedCartPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { fetchSharedCart, importSharedCart, isLoading: storeLoading } = useCartStore();
  const { fetchUser, user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<"merge" | "overwrite" | null>(null);
  const [sharedCart, setSharedCart] = useState<{
    items: CartItem[];
    cartType: "direct" | "quotation";
    senderName: string;
  } | null>(null);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    async function loadSharedCart() {
      if (!id) return;
      setLoading(true);
      const data = await fetchSharedCart(id);
      if (data) {
        setSharedCart(data);
      } else {
        toast.error("Shared cart not found or expired");
      }
      setLoading(false);
    }
    loadSharedCart();
  }, [id, fetchSharedCart]);

  if (loading) {
    return (
      <main className="flex-1 bg-zinc-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-zinc-500 mx-auto" />
          <p className="mt-4 text-sm font-medium text-zinc-600">Loading shared cart...</p>
        </div>
      </main>
    );
  }

  if (!sharedCart || sharedCart.items.length === 0) {
    return (
      <main className="flex-1 bg-zinc-50 min-h-screen py-16">
        <div className="mx-auto max-w-md px-4 text-center bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
          <h1 className="text-xl font-bold text-zinc-900 mb-2">Cart Not Found</h1>
          <p className="text-sm text-zinc-500 mb-6">
            The link you followed may have expired, or the shared cart does not exist.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 px-6 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const { items, cartType, senderName } = sharedCart;
  const isQuotation = cartType === "quotation";
  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gstAmount = Math.round(totalPrice * 0.18);
  const grandTotal = isQuotation ? totalPrice : Math.round(totalPrice * 1.18);

  const handleImport = async (mode: "merge" | "overwrite") => {
    if (!user) {
      toast.error("Please login to import this cart");
      router.push(`/login?redirect=/cart/share/${id}`);
      return;
    }

    setImporting(mode);
    const success = await importSharedCart(items, cartType, mode);
    if (success) {
      toast.success(
        mode === "merge" ? "Cart merged successfully" : "Existing cart replaced successfully"
      );
      router.push(isQuotation ? "/quotation-cart" : "/cart");
    } else {
      toast.error("Failed to import shared cart");
    }
    setImporting(null);
  };

  return (
    <main className="flex-1 bg-zinc-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors mb-6 font-medium"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        {/* Sender Info Banner */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isQuotation ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}>
              <User size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Shared List</p>
              <h2 className="text-lg font-bold text-zinc-900">
                {senderName} shared a cart with you
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Contains {items.length} items configured as a{" "}
                <span className={`font-semibold ${isQuotation ? "text-amber-700" : "text-blue-700"}`}>
                  {isQuotation ? "Quotation Cart" : "Direct Order Cart"}
                </span>
              </p>
            </div>
          </div>
          
          {/* Status Label */}
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isQuotation ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
              {isQuotation ? "Quotation" : "Direct Checkout"}
            </span>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">Items to Import</h3>
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.vendorId}`}
                className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-sm transition-all hover:border-zinc-300"
              >
                <div className="flex gap-4">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 rounded-lg border border-zinc-200 bg-zinc-50 flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
                    ) : (
                      <Package size={24} className="text-zinc-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-bold text-zinc-900 truncate block">
                          {item.productName}
                        </span>
                        <span className="text-xs font-semibold text-zinc-500 ml-auto whitespace-nowrap bg-zinc-100 px-2 py-0.5 rounded">
                          Qty: {item.quantity}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">Vendor: {item.vendorName}</p>
                    </div>

                    <div className="mt-2 flex items-baseline justify-between">
                      <div className="text-xs text-zinc-500">
                        Price: ₹{item.price} • MOQ: {item.moq}
                      </div>
                      <div className="text-sm font-bold text-zinc-900">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Import Summary & Actions */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-zinc-900 mb-4">Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>Unique Items</span>
                  <span className="font-semibold text-zinc-900">{items.length}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Total Quantity</span>
                  <span className="font-semibold text-zinc-900">{itemsCount} units</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-900">₹{totalPrice.toLocaleString()}</span>
                </div>
                
                {!isQuotation && (
                  <div className="flex justify-between text-zinc-600">
                    <span>GST (18%)</span>
                    <span className="font-semibold text-zinc-900">₹{gstAmount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="border-t border-zinc-200 pt-3 flex justify-between font-bold text-lg text-zinc-900">
                  <span>{isQuotation ? "Estimated Cost" : "Total Cost"}</span>
                  <span className={isQuotation ? "text-amber-700" : "text-blue-700"}>
                    ₹{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => handleImport("merge")}
                  disabled={importing !== null}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all active:scale-[0.98] ${
                    isQuotation 
                      ? "bg-amber-600 hover:bg-amber-700" 
                      : "bg-blue-600 hover:bg-blue-700"
                  } disabled:opacity-60 disabled:pointer-events-none shadow-md`}
                >
                  {importing === "merge" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                  Merge into my Cart
                </button>

                <button
                  onClick={() => handleImport("overwrite")}
                  disabled={importing !== null}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-700 transition-all active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
                >
                  {importing === "overwrite" ? (
                    <Loader2 size={16} className="animate-spin text-zinc-700" />
                  ) : (
                    <RotateCcw size={16} />
                  )}
                  Overwrite my Cart
                </button>
              </div>

              <div className="mt-4 text-[11px] text-zinc-400 text-center leading-relaxed">
                * Merging adds items to your active cart. Overwriting replaces your current active cart items entirely.
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}
