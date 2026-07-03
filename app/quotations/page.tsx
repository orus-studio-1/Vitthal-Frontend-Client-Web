"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { Loader2, ArrowRight, FileText, Search, Clock, CheckCircle2, XCircle, AlertCircle, TrendingUp, Package, Users, Wrench, IndianRupee, MessageSquare, Send, X, ChevronRight, ChevronDown } from "lucide-react";
import { useServiceStore } from "@/store/serviceStore";
import type { ServiceQuotation } from "@/store/serviceStore";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import Image from "next/image";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

type QuotationGroup = {
  quotation_group_id: string;
  product_id: string;
  product_name: string;
  quotation_limit: number | null;
  product_image: string | null;
  requested_quantity: number;
  requested_price: number | null;
  created_at: string;
  updated_at: string;
  total_vendors: number;
  vendors_responded: number;
  accepted_count: number;
  rejected_count: number;
  best_offer_price: number | null;
  group_status: "pending" | "offers_received" | "accepted" | "closed";
};

type FilterTab = "All" | "Pending" | "Offers Received" | "Accepted" | "Closed";

function getGroupStatusInfo(status: string) {
  switch (status) {
    case "pending":
      return { label: "Awaiting Vendors", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: Clock };
    case "offers_received":
      return { label: "Offers Received", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: TrendingUp };
    case "accepted":
      return { label: "Accepted", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle2 };
    case "closed":
      return { label: "Closed", color: "text-zinc-500", bg: "bg-zinc-100 border-zinc-200", icon: XCircle };
    default:
      return { label: status.replace(/_/g, " "), color: "text-zinc-700", bg: "bg-zinc-50 border-zinc-200", icon: FileText };
  }
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending_vendor:   { label: "Awaiting Vendor",  color: "bg-amber-50 text-amber-700 border-amber-200" },
  vendor_offered:   { label: "Vendor Offered",   color: "bg-blue-50 text-blue-700 border-blue-200" },
  client_countered: { label: "Counter Sent",     color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  vendor_countered: { label: "Vendor Countered", color: "bg-purple-50 text-purple-700 border-purple-200" },
  client_accepted:  { label: "Accepted",         color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  client_rejected:  { label: "Rejected",         color: "bg-red-50 text-red-700 border-red-200" },
  vendor_rejected:  { label: "Vendor Rejected",  color: "bg-red-50 text-red-700 border-red-200" },
  cancelled:        { label: "Cancelled",        color: "bg-zinc-100 text-zinc-500 border-zinc-200" },
};

const ACTION_LABELS: Record<string, string> = {
  request: "Requested",
  offer:   "Vendor Offered",
  counter: "Counter Offered",
  accept:  "Accepted",
  reject:  "Rejected",
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "bg-zinc-100 text-zinc-600 border-zinc-200" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

const TERMINAL_STATUSES = new Set(["client_accepted", "client_rejected", "vendor_rejected", "cancelled"]);

type QuotationDetail = {
  quotation: ServiceQuotation;
  messages: {
    id: string;
    sender_role: string;
    action: string;
    offer_price?: string | null;
    note?: string | null;
    reason?: string | null;
    created_at: string;
  }[];
};

type ThreadDialogProps = {
  quotation: ServiceQuotation;
  onClose: () => void;
  onUpdate: () => void;
};

function ThreadDialog({ quotation, onClose, onUpdate }: ThreadDialogProps) {
  const respondQuotation = useServiceStore((s) => s.respondQuotation);
  const [detail, setDetail] = useState<QuotationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [note, setNote] = useState("");
  const [isResponding, setIsResponding] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/services/quotations/${quotation.id}`, {
          credentials: "include",
          headers: { "Content-Type": "application/json", "x-request-from": "client" },
        });
        if (!res.ok) { setLoading(false); return; }
        const json = await res.json();
        setDetail(json.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [quotation.id]);

  async function handleRespond(e: React.FormEvent) {
    e.preventDefault();
    if (!action) { toast.error("Select an action"); return; }
    if ((action === "counter") && !offerPrice) { toast.error("Enter your counter price"); return; }

    setIsResponding(true);
    const success = await respondQuotation(quotation.id, {
      action,
      offerPrice: offerPrice || undefined,
      note: note || undefined,
    });
    setIsResponding(false);

    if (success) {
      toast.success("Response submitted!");
      onUpdate();
      onClose();
    } else {
      toast.error("Failed to respond. Please try again.");
    }
  }

  const isTerminal = TERMINAL_STATUSES.has(quotation.status);
  const canRespond = quotation.status === "vendor_offered" || quotation.status === "vendor_countered";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="relative w-full sm:max-w-xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">{quotation.service_name}</h2>
            <p className="text-xs text-zinc-500 mt-0.5">with {quotation.vendor_name}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={quotation.status} />
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 transition-colors"><X size={18} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 size={20} className="animate-spin text-zinc-400" /></div>
          ) : detail?.messages?.length ? (
            detail.messages.map((msg) => {
              const isClient = msg.sender_role === "client";
              return (
                <div key={msg.id} className={`flex gap-3 ${isClient ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isClient ? "bg-[#1d4ed8] text-white" : "bg-zinc-200 text-zinc-700"}`}>
                    {isClient ? "Y" : "V"}
                  </div>
                  <div className={`max-w-xs rounded-xl px-4 py-3 text-xs space-y-1 ${isClient ? "bg-[#1d4ed8]/10 text-zinc-900" : "bg-zinc-100 text-zinc-800"}`}>
                    <p className="font-semibold text-[11px] text-zinc-500">{ACTION_LABELS[msg.action] ?? msg.action}</p>
                    {msg.offer_price && (
                      <p className="font-bold text-sm text-zinc-900">₹{parseFloat(msg.offer_price).toLocaleString("en-IN")}</p>
                    )}
                    {msg.note && <p className="text-zinc-600">{msg.note}</p>}
                    {msg.reason && <p className="text-zinc-400 italic">{msg.reason}</p>}
                    <p className="text-[10px] text-zinc-400 pt-1">{formatDate(msg.created_at)}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-xs text-zinc-400 py-8">No messages yet</p>
          )}
        </div>

        {canRespond && !isTerminal && (
          <form onSubmit={handleRespond} className="border-t border-zinc-100 px-6 py-4 space-y-3 shrink-0">
            <div className="flex gap-2">
              {["accept", "counter", "reject"].map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAction(a)}
                  className={`flex-1 rounded-lg border py-2 text-xs font-semibold capitalize transition-colors ${
                    action === a
                      ? a === "accept" ? "bg-emerald-600 border-emerald-600 text-white" : a === "reject" ? "bg-red-500 border-red-500 text-white" : "bg-[#1d4ed8] border-[#1d4ed8] text-white"
                      : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
            {action === "counter" && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">₹</span>
                <input
                  type="number"
                  min="0"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  placeholder="Your counter price"
                  className="w-full rounded-lg border border-zinc-300 pl-7 pr-3 py-2 text-sm focus:border-[#1d4ed8] focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]/30 transition-colors"
                />
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note (optional)"
                className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#1d4ed8] focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]/30 transition-colors"
              />
              <button
                type="submit"
                disabled={isResponding || !action}
                className="flex items-center gap-1.5 rounded-lg bg-[#1d4ed8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1e40af] disabled:opacity-60 transition-colors"
              >
                {isResponding ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Send
              </button>
            </div>
          </form>
        )}

        {isTerminal && (
          <div className="border-t border-zinc-100 px-6 py-4 text-center shrink-0">
            <p className="text-xs text-zinc-400">This quotation has been finalised.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuotationsPage() {
  const { isAuthenticated, isLoading: authLoading, fetchUser } = useAuthStore();
  const { quotations: serviceQuotations, isLoadingQuotations, fetchMyQuotations } = useServiceStore();

  const [quotationGroups, setQuotationGroups] = useState<QuotationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<"products" | "services">("products");
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [openQuotation, setOpenQuotation] = useState<ServiceQuotation | null>(null);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get("tab") || params.get("category");
      if (cat === "services") {
        setActiveCategory("services");
      }
    }
  }, []);

  useEffect(() => {
    const loadQuotations = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/quotations`, {
          credentials: "include",
          headers: { "Content-Type": "application/json", "x-request-from": "client" },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load product quotations");
        setQuotationGroups(data.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    if (isAuthenticated) {
      setLoading(true);
      Promise.all([loadQuotations(), fetchMyQuotations()]).finally(() => {
        setLoading(false);
      });
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, fetchMyQuotations]);

  const stats = useMemo(() => {
    return {
      total: quotationGroups.length,
      pending: quotationGroups.filter(q => q.group_status === "pending").length,
      offersReceived: quotationGroups.filter(q => q.group_status === "offers_received").length,
      accepted: quotationGroups.filter(q => q.group_status === "accepted").length,
    };
  }, [quotationGroups]);

  const filteredGroups = useMemo(() => {
    let filtered = quotationGroups;

    // Apply text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item => item.product_name.toLowerCase().includes(q)
      );
    }

    // Apply tab filter
    switch (activeTab) {
      case "Pending":
        filtered = filtered.filter(item => item.group_status === "pending");
        break;
      case "Offers Received":
        filtered = filtered.filter(item => item.group_status === "offers_received");
        break;
      case "Accepted":
        filtered = filtered.filter(item => item.group_status === "accepted");
        break;
      case "Closed":
        filtered = filtered.filter(item => item.group_status === "closed");
        break;
    }

    return filtered;
  }, [quotationGroups, activeTab, searchQuery]);

  const filteredServiceQuotations = useMemo(() => {
    let filtered = serviceQuotations;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item => item.service_name.toLowerCase().includes(q) || item.vendor_name.toLowerCase().includes(q)
      );
    }

    switch (activeTab) {
      case "Pending":
        filtered = filtered.filter(item => item.status === "pending_vendor" || item.status === "client_countered");
        break;
      case "Offers Received":
        filtered = filtered.filter(item => item.status === "vendor_offered" || item.status === "vendor_countered");
        break;
      case "Accepted":
        filtered = filtered.filter(item => item.status === "client_accepted");
        break;
      case "Closed":
        filtered = filtered.filter(item => item.status === "client_rejected" || item.status === "vendor_rejected" || item.status === "cancelled");
        break;
    }

    return filtered;
  }, [serviceQuotations, activeTab, searchQuery]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-zinc-50/50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (quotationGroups.length === 0 && serviceQuotations.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 mb-6">
          <FileText className="h-12 w-12 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">No Quotations Yet</h1>
        <p className="mt-3 text-lg text-zinc-500 max-w-xl mx-auto">
          You haven&apos;t requested any custom pricing yet. Start by browsing products or services and requesting a custom quotation.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-700"
          >
            Browse Products
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-6 py-3.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-all hover:-translate-y-0.5"
          >
            Browse Services
            <Wrench size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-zinc-200 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">My Quotations</h1>
          <p className="text-zinc-500">Track and manage your bulk order negotiations across multiple vendors.</p>

          {/* Category Toggle Tabs */}
          <div className="flex border-b border-zinc-200 mt-6 mb-2">
            <button
              onClick={() => { setActiveCategory("products"); setActiveTab("All"); setSearchQuery(""); }}
              className={`pb-3 px-6 text-sm font-semibold border-b-2 transition-all ${
                activeCategory === "products"
                  ? "border-blue-600 text-blue-600 font-bold"
                  : "border-transparent text-zinc-500 hover:text-zinc-800"
              }`}
            >
              Products ({quotationGroups.length})
            </button>
            <button
              onClick={() => { setActiveCategory("services"); setActiveTab("All"); setSearchQuery(""); }}
              className={`pb-3 px-6 text-sm font-semibold border-b-2 transition-all ${
                activeCategory === "services"
                  ? "border-blue-600 text-blue-600 font-bold"
                  : "border-transparent text-zinc-500 hover:text-zinc-800"
              }`}
            >
              Services ({serviceQuotations.length})
            </button>
          </div>

          {/* Stats Cards for Products */}
          {activeCategory === "products" && (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <p className="text-sm font-medium text-zinc-500">Total Products</p>
                <p className="mt-2 text-3xl font-bold text-zinc-900">{stats.total}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-amber-50 p-5">
                <p className="text-sm font-medium text-amber-700">Awaiting Vendors</p>
                <p className="mt-2 text-3xl font-bold text-amber-900">{stats.pending}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-blue-50 p-5">
                <p className="text-sm font-medium text-blue-700">Offers Received</p>
                <p className="mt-2 text-3xl font-bold text-blue-900">{stats.offersReceived}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-emerald-50 p-5">
                <p className="text-sm font-medium text-emerald-700">Accepted</p>
                <p className="mt-2 text-3xl font-bold text-emerald-900">{stats.accepted}</p>
              </div>
            </div>
          )}

          {/* Stats Cards for Services */}
          {activeCategory === "services" && (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <p className="text-sm font-medium text-zinc-500">Total Services</p>
                <p className="mt-2 text-3xl font-bold text-zinc-900">{serviceQuotations.length}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-amber-50 p-5">
                <p className="text-sm font-medium text-amber-700">Awaiting Vendor</p>
                <p className="mt-2 text-3xl font-bold text-amber-900">{serviceQuotations.filter(q => q.status === "pending_vendor" || q.status === "client_countered").length}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-blue-50 p-5">
                <p className="text-sm font-medium text-blue-700">Vendor Offered</p>
                <p className="mt-2 text-3xl font-bold text-blue-900">{serviceQuotations.filter(q => q.status === "vendor_offered" || q.status === "vendor_countered").length}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-emerald-50 p-5">
                <p className="text-sm font-medium text-emerald-700">Accepted</p>
                <p className="mt-2 text-3xl font-bold text-emerald-900">{serviceQuotations.filter(q => q.status === "client_accepted").length}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex w-full sm:w-auto items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {(["All", "Pending", "Offers Received", "Accepted", "Closed"] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-zinc-900 text-white"
                    : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder={activeCategory === "products" ? "Search products..." : "Search services..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-zinc-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Product Quotation Cards */}
        {activeCategory === "products" && (
          filteredGroups.length === 0 ? (
            <div className="rounded-3xl border border-zinc-200 bg-white py-20 text-center shadow-sm">
              <Search className="mx-auto h-10 w-10 text-zinc-300 mb-3" />
              <p className="text-zinc-500">No quotations found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid gap-5">
              {filteredGroups.map((group) => {
                const status = getGroupStatusInfo(group.group_status);
                const StatusIcon = status.icon;
                
                return (
                  <Link
                    key={group.quotation_group_id}
                    href={`/quotations/${group.quotation_group_id}`}
                    className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-5 rounded-3xl border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300 hover:shadow-lg"
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors overflow-hidden">
                      {group.product_image ? (
                        <Image src={group.product_image} alt="Product" width={64} height={64} className="rounded-2xl object-cover h-full w-full" />
                      ) : (
                        <Package size={28} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-1">
                        <h3 className="text-lg font-bold text-zinc-900 truncate">{group.product_name}</h3>
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${status.bg} ${status.color}`}>
                          <StatusIcon size={14} />
                          {status.label}
                        </span>
                      </div>
                      
                      {/* Vendor response summary */}
                      <div className="flex items-center gap-2 mb-3">
                        <Users size={14} className="text-zinc-400" />
                        <p className="text-sm text-zinc-500">
                          <span className="font-semibold text-zinc-700">{group.vendors_responded}</span> of{" "}
                          <span className="font-semibold text-zinc-700">{group.total_vendors}</span> vendor{group.total_vendors > 1 ? "s" : ""} responded
                          {group.accepted_count > 0 && (
                            <span className="ml-2 text-emerald-600 font-medium">• {group.accepted_count} accepted</span>
                          )}
                          {group.rejected_count > 0 && (
                            <span className="ml-2 text-rose-500 font-medium">• {group.rejected_count} rejected</span>
                          )}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex flex-col bg-zinc-50 rounded-lg px-3 py-1.5 border border-zinc-100">
                          <span className="text-xs text-zinc-400 font-medium">Requested</span>
                          <span className="font-semibold text-zinc-800">{group.requested_quantity} units</span>
                        </div>
                        
                        {group.best_offer_price && (
                          <div className="flex flex-col bg-blue-50/50 rounded-lg px-3 py-1.5 border border-blue-100">
                            <span className="text-xs text-blue-400 font-medium">Best Offer</span>
                            <span className="font-semibold text-blue-800">₹{group.best_offer_price} / unit</span>
                          </div>
                        )}

                        {group.quotation_limit && (
                          <div className="flex flex-col bg-violet-50 rounded-lg px-3 py-1.5 border border-violet-100">
                            <span className="text-xs text-violet-400 font-medium">Quotation Limit</span>
                            <span className="font-semibold text-violet-800">{group.quotation_limit}+ units</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-0 flex items-center justify-between w-full sm:w-auto">
                      <p className="text-xs font-medium text-zinc-400 sm:hidden">
                        {new Date(group.updated_at).toLocaleDateString()}
                      </p>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                    
                    {/* Desktop Date Badge */}
                    <div className="absolute right-5 top-5 hidden sm:block">
                      <p className="text-xs font-medium text-zinc-400">
                        {new Date(group.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )
        )}

        {/* Service Quotation Cards */}
        {activeCategory === "services" && (
          filteredServiceQuotations.length === 0 ? (
            <div className="rounded-3xl border border-zinc-200 bg-white py-20 text-center shadow-sm">
              <Search className="mx-auto h-10 w-10 text-zinc-300 mb-3" />
              <p className="text-zinc-500">No service quotations found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredServiceQuotations.map((quotation) => (
                <button
                  key={quotation.id}
                  onClick={() => setOpenQuotation(quotation)}
                  className="w-full text-left rounded-2xl border border-zinc-200 bg-white p-5 hover:border-zinc-300 hover:shadow-md transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-zinc-900 text-base">{quotation.service_name}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">with {quotation.vendor_name}</p>
                      </div>
                      <StatusBadge status={quotation.status} />
                    </div>
                    <p className="mt-2 text-xs text-zinc-500 line-clamp-1">{quotation.scope_of_work}</p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-zinc-400">
                      {quotation.requested_price && (
                        <span className="flex items-center gap-1 bg-zinc-50 px-2 py-1 rounded border border-zinc-100 font-medium text-zinc-700">
                          Budget: ₹{parseFloat(quotation.requested_price).toLocaleString("en-IN")}
                        </span>
                      )}
                      {quotation.agreed_price && (
                        <span className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 text-emerald-700 font-semibold">
                          Agreed: ₹{parseFloat(quotation.agreed_price).toLocaleString("en-IN")}
                        </span>
                      )}
                      <span>Updated: {formatDate(quotation.updated_at)}</span>
                    </div>
                  </div>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 hover:bg-blue-600 hover:text-white transition-colors">
                    <ArrowRight size={16} />
                  </div>
                </button>
              ))}
            </div>
          )
        )}
      </div>

      {openQuotation && (
        <ThreadDialog
          quotation={openQuotation}
          onClose={() => setOpenQuotation(null)}
          onUpdate={fetchMyQuotations}
        />
      )}
    </div>
  );
}
