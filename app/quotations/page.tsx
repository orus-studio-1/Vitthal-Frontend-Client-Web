"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { Loader2, ArrowRight, FileText, Search, Clock, CheckCircle2, XCircle, AlertCircle, TrendingUp, Package, Users } from "lucide-react";
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

export default function QuotationsPage() {
  const [quotationGroups, setQuotationGroups] = useState<QuotationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadQuotations = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/quotations`, {
          credentials: "include",
          headers: { "Content-Type": "application/json", "x-request-from": "client" },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load quotations");
        setQuotationGroups(data.data || []);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load quotations";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    void loadQuotations();
  }, []);

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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-zinc-50/50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (quotationGroups.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 mb-6">
          <FileText className="h-12 w-12 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">No Quotations Yet</h1>
        <p className="mt-3 text-lg text-zinc-500 max-w-xl mx-auto">
          You haven&apos;t requested any custom pricing yet. Start by browsing products and requesting a quote for bulk orders.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl"
        >
          Browse Products
          <ArrowRight size={18} />
        </Link>
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

          {/* Stats Cards */}
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
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-zinc-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Product Quotation Cards */}
        {filteredGroups.length === 0 ? (
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
        )}
      </div>
    </div>
  );
}
