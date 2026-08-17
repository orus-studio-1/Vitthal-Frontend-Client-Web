"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  Loader2,
  Truck,
  AlertCircle,
  Download,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { downloadPdfReport } from "@/lib/export-utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

interface OrderItem {
  product_id: string;
  product_name: string;
  image_url: string;
  quantity: number;
  price: number;
  original_price?: number | null;
  variant_properties?: Record<string, string>;
  variant_name?: string | null;
}

interface Order {
  order_id: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  vendor_name: string;
  vendor_id: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, fetchUser } = useAuthStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [fetchingOrders, setFetchingOrders] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/orders");
    }
  }, [isAuthenticated, authLoading, router]);

  async function fetchOrders() {
    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-request-from": "client",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.data || []);
      } else {
        const data = await res.json();
        toast.error("Failed to load orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast.error("An error occurred while loading orders");
    } finally {
      setFetchingOrders(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      const timer = window.setTimeout(() => {
        void fetchOrders();
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [isAuthenticated]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="w-5 h-5 text-amber-500" />;
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case "shipped":
        return <Truck className="w-5 h-5 text-indigo-500" />;
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-zinc-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClass =
      "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit";
    switch (status.toLowerCase()) {
      case "pending":
        return (
          <span className={`${baseClass} bg-amber-100 text-amber-800`}>
            {getStatusIcon(status)} Pending
          </span>
        );
      case "confirmed":
        return (
          <span className={`${baseClass} bg-blue-100 text-blue-800`}>
            {getStatusIcon(status)} Confirmed
          </span>
        );
      case "shipped":
        return (
          <span className={`${baseClass} bg-indigo-100 text-indigo-800`}>
            {getStatusIcon(status)} Shipped
          </span>
        );
      case "delivered":
        return (
          <span className={`${baseClass} bg-green-100 text-green-800`}>
            {getStatusIcon(status)} Delivered
          </span>
        );
      case "cancelled":
        return (
          <span className={`${baseClass} bg-red-100 text-red-800`}>
            {getStatusIcon(status)} Cancelled
          </span>
        );
      default:
        return (
          <span className={`${baseClass} bg-zinc-100 text-zinc-800`}>
            {getStatusIcon(status)} {status}
          </span>
        );
    }
  };

  // Status Filter Counts & List
  const filterTabs = [
    { id: "all", label: "All Orders", count: orders.length },
    {
      id: "pending",
      label: "Pending",
      count: orders.filter((o) => o.status.toLowerCase() === "pending").length,
    },
    {
      id: "confirmed",
      label: "Confirmed",
      count: orders.filter(
        (o) =>
          o.status.toLowerCase() === "confirmed" ||
          o.status.toLowerCase() === "processing",
      ).length,
    },
    {
      id: "shipped",
      label: "Shipped",
      count: orders.filter((o) => o.status.toLowerCase() === "shipped").length,
    },
    {
      id: "delivered",
      label: "Delivered",
      count: orders.filter((o) => o.status.toLowerCase() === "delivered").length,
    },
    {
      id: "cancelled",
      label: "Cancelled",
      count: orders.filter((o) => o.status.toLowerCase() === "cancelled").length,
    },
  ];

  const filteredOrders = orders.filter((order) => {
    if (selectedStatus === "all") return true;
    if (selectedStatus === "confirmed") {
      return (
        order.status.toLowerCase() === "confirmed" ||
        order.status.toLowerCase() === "processing"
      );
    }
    return order.status.toLowerCase() === selectedStatus;
  });

  const handleExportOrdersPDF = () => {
    if (filteredOrders.length === 0) {
      toast.error("No orders to export.");
      return;
    }

    const rows = filteredOrders.map((o) => [
      `#${o.order_id.slice(0, 8).toUpperCase()}`,
      new Date(o.created_at).toLocaleDateString("en-IN"),
      o.vendor_name || "Direct Supplier",
      o.status.toUpperCase(),
      o.payment_status.toUpperCase(),
      (o.items || []).map((it) => `${it.product_name} (x${it.quantity})`).join(", "),
      `INR ${Number(o.total_amount).toLocaleString("en-IN")}`,
    ]);

    const sections = [
      {
        heading: `Client Orders Summary (${filteredOrders.length} Orders)`,
        headers: ["Order ID", "Date", "Vendor", "Status", "Payment", "Items", "Total"],
        rows,
      },
    ];

    downloadPdfReport("My Purchase Orders Report", sections, `MTWO_My_Orders_${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("Order summary PDF downloaded successfully!");
  };

  const handleDownloadInvoicePDF = (order: Order) => {
    const itemRows = (order.items || []).map((it) => [
      it.product_name + (it.variant_name ? ` (${it.variant_name})` : ""),
      it.quantity,
      `INR ${Number(it.price).toLocaleString("en-IN")}`,
      `INR ${(Number(it.price) * it.quantity).toLocaleString("en-IN")}`,
    ]);

    const sections = [
      {
        heading: `Order Details - #${order.order_id.slice(0, 8).toUpperCase()}`,
        rows: [
          ["Order Reference", `#${order.order_id.toUpperCase()}`],
          ["Order Date", new Date(order.created_at).toLocaleString("en-IN")],
          ["Fulfillment Vendor", order.vendor_name || "MTWO Direct Merchant"],
          ["Order Status", order.status.toUpperCase()],
          ["Payment Status", order.payment_status.toUpperCase()],
          ["Grand Total", `INR ${Number(order.total_amount).toLocaleString("en-IN")}`],
        ],
      },
      {
        heading: "Purchased Items",
        headers: ["Item Description", "Qty", "Unit Price", "Total"],
        rows: itemRows,
      },
    ];

    downloadPdfReport(
      `Order Receipt / Invoice - #${order.order_id.slice(0, 8).toUpperCase()}`,
      sections,
      `Invoice_${order.order_id.slice(0, 8).toUpperCase()}.pdf`
    );
    toast.success(`Invoice for #${order.order_id.slice(0, 8).toUpperCase()} downloaded!`);
  };

  if (authLoading || fetchingOrders) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 pt-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/profile")}
              className="p-2 hover:bg-zinc-200 rounded-full transition-colors cursor-pointer"
              title="Back to Profile"
            >
              <ChevronLeft className="w-5 h-5 text-zinc-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-zinc-900">My Orders</h1>
              <p className="text-xs text-zinc-500 mt-0.5">Manage and track your product orders</p>
            </div>
          </div>

          <button
            onClick={handleExportOrdersPDF}
            disabled={filteredOrders.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-white border border-zinc-200 px-4 py-2.5 text-xs font-semibold text-zinc-800 shadow-xs hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <Download size={14} className="text-blue-600" />
            Export Orders (PDF)
          </button>
        </div>

        {/* Status Filter Tabs */}
        {orders.length > 0 && (
          <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {filterTabs.map((tab) => {
              const isActive = selectedStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                      : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center shadow-sm">
            <Package className="mx-auto h-20 w-20 text-zinc-300 mb-6" />
            <h2 className="text-2xl font-semibold text-zinc-900 mb-2">
              No orders yet
            </h2>
            <p className="text-zinc-500 mb-8 max-w-md mx-auto">
              You haven&apos;t placed any orders. Browse our catalog to find the
              best industrial products for your needs.
            </p>
            <Link
              href="/products"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              Start Shopping
            </Link>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-200 p-10 text-center shadow-sm">
            <AlertCircle className="mx-auto h-12 w-12 text-zinc-300 mb-3" />
            <h3 className="text-lg font-semibold text-zinc-900 mb-1">
              No {selectedStatus} orders
            </h3>
            <p className="text-xs text-zinc-500 mb-5">
              There are currently no orders with status &ldquo;{selectedStatus}&rdquo;.
            </p>
            <button
              onClick={() => setSelectedStatus("all")}
              className="inline-flex items-center rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition"
            >
              View All Orders
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order.order_id}
                className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden transition-all hover:shadow-md"
              >
                <div className="border-b border-zinc-100 bg-zinc-50/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
                    <div>
                      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">
                        Order Placed
                      </p>
                      <p className="text-sm font-medium text-zinc-900">
                        {new Date(order.created_at).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">
                        Total Amount
                      </p>
                      <p className="text-sm font-bold text-zinc-900">
                        ₹{Number(order.total_amount).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">
                        Vendor
                      </p>
                      <p className="text-sm font-medium text-blue-600">
                        Vendor #{order.vendor_id?.slice(0, 8)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start sm:items-end gap-2">
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <span>Order ID:</span>
                      <span className="font-mono text-zinc-900">
                        #{order.order_id.split("-")[0]}
                      </span>
                    </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleDownloadInvoicePDF(order)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition shadow-2xs cursor-pointer"
                          title="Download Invoice PDF"
                        >
                          <FileText size={13} className="text-blue-600" />
                          Invoice PDF
                        </button>
                        <Link
                          href={`/orders/track-status/${order.order_id}`}
                          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
                        >
                          Track Order
                        </Link>
                      </div>
                      <Link
                        href={`/orders/review/${order.order_id}`}
                        className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                          order.status.toLowerCase() === "delivered"
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "bg-zinc-200 text-zinc-500 pointer-events-none"
                        }`}
                        aria-disabled={order.status.toLowerCase() !== "delivered"}
                        tabIndex={order.status.toLowerCase() !== "delivered" ? -1 : 0}
                      >
                        {order.status.toLowerCase() === "delivered"
                          ? "Review"
                          : "Available after delivery"}
                      </Link>
                    </div>
                  </div>

                <div className="p-6">
                  <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-4">
                    {getStatusBadge(order.status)}

                    <div className="text-sm">
                      <span className="text-zinc-500 mr-2">Payment:</span>
                      <span
                        className={`font-medium ${order.payment_status === "paid" ? "text-green-600" : "text-amber-600"}`}
                      >
                        {order.payment_status.charAt(0).toUpperCase() +
                          order.payment_status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, index) => (
                        <div
                          key={`${order.order_id}-item-${index}`}
                          className="flex items-start gap-4 p-3 hover:bg-zinc-50 rounded-xl transition-colors"
                        >
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.product_name}
                              className="w-16 h-16 rounded-lg object-cover border border-zinc-200"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-zinc-100 rounded-lg border border-zinc-200 flex items-center justify-center">
                              <Package className="w-6 h-6 text-zinc-400" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-zinc-900 hover:text-blue-600 cursor-pointer transition-colors truncate">
                              {item.product_name}
                            </p>
                            {item.variant_name && (
                              <p className="text-xs font-semibold text-zinc-500 mt-0.5">
                                Variant: {item.variant_name}
                              </p>
                            )}
                            {item.variant_properties && Object.keys(item.variant_properties).length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                {Object.entries(item.variant_properties).map(([key, val]) => (
                                  <span key={key} className="inline-flex items-center rounded-md bg-zinc-150 px-2 py-0.5 text-[11px] font-bold text-zinc-600 capitalize border border-zinc-200">
                                    {key}: {String(val)}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="mt-1 flex items-center gap-4 text-sm text-zinc-500">
                              <span>Qty: {item.quantity}</span>
                              <div className="flex flex-wrap items-baseline gap-1.5">
                                <span>₹{Number(item.price).toLocaleString()} each</span>
                                {item.original_price && (
                                  <span className="text-xs text-zinc-400 line-through">
                                    ₹{Number(item.original_price).toLocaleString()} each
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-sm font-bold text-zinc-900">
                            ₹
                            {(
                              Number(item.price) * item.quantity
                            ).toLocaleString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-zinc-500 text-center py-4">
                        No items found in this order.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
