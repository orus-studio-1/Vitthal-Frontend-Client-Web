"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { Loader2, ArrowRight, FileText, Search, Clock, CheckCircle2, XCircle, TrendingUp, Package, Users, Wrench, Download } from "lucide-react";
import { useServiceStore } from "@/store/serviceStore";
import type { ServiceQuotation } from "@/store/serviceStore";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";
import { downloadPdfReport } from "@/lib/export-utils";

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

function StatusBadge({ status }: { status: string }) {
  const cfg = { label: status, color: "bg-zinc-100 text-zinc-600 border-zinc-200" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

type ServiceQuotationGroup = {
  service_id: string;
  service_name: string;
  scope_of_work: string;
  created_at: string;
  updated_at: string;
  total_vendors: number;
  vendors_responded: number;
  accepted_count: number;
  group_status: "pending" | "offers_received" | "accepted" | "closed";
  vendor_quotations: ServiceQuotation[];
  service_image?: string | null;
};

export default function QuotationsPage() {
  const { isAuthenticated, isLoading: authLoading, fetchUser } = useAuthStore();
  const { quotations: serviceQuotations, fetchMyQuotations } = useServiceStore();

  const [quotationGroups, setQuotationGroups] = useState<QuotationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<"products" | "services">("products");
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [searchQuery, setSearchQuery] = useState("");

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

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item => item.product_name.toLowerCase().includes(q)
      );
    }

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

  const serviceQuotationGroups = useMemo(() => {
    const groups: ServiceQuotationGroup[] = [];

    const sorted = [...serviceQuotations].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    for (const sq of sorted) {
      const sqTime = new Date(sq.created_at).getTime();
      const existingGroup = groups.find(
        (g) =>
          g.service_id === sq.service_id &&
          Math.abs(new Date(g.created_at).getTime() - sqTime) < 15000
      );

      if (existingGroup) {
        existingGroup.vendor_quotations.push(sq);
        existingGroup.total_vendors += 1;
        if (sq.status !== "pending_vendor") {
          existingGroup.vendors_responded += 1;
        }
        if (sq.status === "client_accepted") {
          existingGroup.accepted_count += 1;
        }
      } else {
        groups.push({
          service_id: sq.service_id || "",
          service_name: sq.service_name,
          scope_of_work: sq.scope_of_work,
          created_at: sq.created_at,
          updated_at: sq.updated_at,
          total_vendors: 1,
          vendors_responded: sq.status !== "pending_vendor" ? 1 : 0,
          accepted_count: sq.status === "client_accepted" ? 1 : 0,
          group_status: "pending",
          vendor_quotations: [sq],
          service_image: sq.service_image || null,
        });
      }
    }

    for (const g of groups) {
      const statuses = g.vendor_quotations.map(q => q.status);
      if (statuses.some(s => s === "client_accepted")) {
        g.group_status = "accepted";
      } else if (statuses.some(s => s === "vendor_offered" || s === "vendor_countered")) {
        g.group_status = "offers_received";
      } else if (statuses.every(s => s === "client_rejected" || s === "vendor_rejected" || s === "cancelled")) {
        g.group_status = "closed";
      } else {
        g.group_status = "pending";
      }
    }

    return groups;
  }, [serviceQuotations]);

  const filteredServiceGroups = useMemo(() => {
    let filtered = serviceQuotationGroups;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item => item.service_name.toLowerCase().includes(q)
      );
    }

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
  }, [serviceQuotationGroups, activeTab, searchQuery]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-zinc-50/50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (quotationGroups.length === 0 && serviceQuotationGroups.length === 0) {
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

  const handleExportQuotationsPDF = () => {
    if (activeCategory === "products") {
      if (filteredGroups.length === 0) return;
      const rows = filteredGroups.map((g) => [
        g.product_name,
        g.requested_quantity?.toLocaleString("en-IN") || "—",
        g.requested_price ? `INR ${g.requested_price}` : "Open",
        g.best_offer_price ? `INR ${g.best_offer_price}` : "Pending",
        `${g.vendors_responded} / ${g.total_vendors}`,
        g.group_status.toUpperCase(),
        new Date(g.created_at).toLocaleDateString("en-IN"),
      ]);

      downloadPdfReport(
        "Client Quotation Requests (Products)",
        [
          {
            heading: `Quotation Inquiries (${filteredGroups.length} Products)`,
            headers: ["Product Name", "Qty", "Target Price", "Best Offer", "Bids", "Status", "Date"],
            rows,
          },
        ],
        `MTWO_Product_Quotations_${new Date().toISOString().split("T")[0]}.pdf`
      );
    } else {
      if (filteredServiceGroups.length === 0) return;
      const rows = filteredServiceGroups.map((g) => [
        g.service_name,
        `${g.vendors_responded} / ${g.total_vendors}`,
        g.group_status.toUpperCase(),
        new Date(g.created_at).toLocaleDateString("en-IN"),
      ]);

      downloadPdfReport(
        "Client Quotation Requests (Services)",
        [
          {
            heading: `Service Inquiries (${filteredServiceGroups.length} Services)`,
            headers: ["Service Name", "Bids Received", "Status", "Date"],
            rows,
          },
        ],
        `MTWO_Service_Quotations_${new Date().toISOString().split("T")[0]}.pdf`
      );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-zinc-200 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-1">My Quotations</h1>
              <p className="text-zinc-500 text-sm">Track and manage your bulk order negotiations across multiple vendors.</p>
            </div>
            <button
              onClick={handleExportQuotationsPDF}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-zinc-200 px-4 py-2.5 text-xs font-semibold text-zinc-800 shadow-xs hover:bg-zinc-50 transition cursor-pointer self-start sm:self-auto"
            >
              <Download size={14} className="text-blue-600" />
              Export Quotations (PDF)
            </button>
          </div>

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
              Services ({serviceQuotationGroups.length})
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
                <p className="mt-2 text-3xl font-bold text-zinc-900">{serviceQuotationGroups.length}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-amber-50 p-5">
                <p className="text-sm font-medium text-amber-700">Awaiting Vendor</p>
                <p className="mt-2 text-3xl font-bold text-amber-900">{serviceQuotationGroups.filter(q => q.group_status === "pending").length}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-blue-50 p-5">
                <p className="text-sm font-medium text-blue-700">Vendor Offered</p>
                <p className="mt-2 text-3xl font-bold text-blue-900">{serviceQuotationGroups.filter(q => q.group_status === "offers_received").length}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-emerald-50 p-5">
                <p className="text-sm font-medium text-emerald-700">Accepted</p>
                <p className="mt-2 text-3xl font-bold text-emerald-900">{serviceQuotationGroups.filter(q => q.group_status === "accepted").length}</p>
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
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                    
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
          filteredServiceGroups.length === 0 ? (
            <div className="rounded-3xl border border-zinc-200 bg-white py-20 text-center shadow-sm">
              <Search className="mx-auto h-10 w-10 text-zinc-300 mb-3" />
              <p className="text-zinc-500">No service quotations found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid gap-5">
              {filteredServiceGroups.map((group) => {
                const status = getGroupStatusInfo(group.group_status);
                const StatusIcon = status.icon;

                return (
                  <Link
                    key={`${group.service_id}-${group.created_at}`}
                    href={`/quotations/${group.vendor_quotations[0]?.id}`}
                    className="group relative w-full text-left rounded-3xl border border-zinc-200 bg-white p-5 hover:border-zinc-300 hover:shadow-lg transition-all flex items-center justify-between gap-5"
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors overflow-hidden relative">
                      {group.service_image ? (
                        <Image
                          src={group.service_image}
                          alt="Service"
                          width={64}
                          height={64}
                          className="rounded-2xl object-cover h-full w-full"
                        />
                      ) : (
                        <Wrench size={28} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-1">
                        <h3 className="text-lg font-bold text-zinc-900 truncate">{group.service_name}</h3>
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${status.bg} ${status.color}`}>
                          <StatusIcon size={14} />
                          {status.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <Users size={14} className="text-zinc-400" />
                        <p className="text-sm text-zinc-500">
                          <span className="font-semibold text-zinc-700">{group.vendors_responded}</span> of{" "}
                          <span className="font-semibold text-zinc-700">{group.total_vendors}</span> vendor{group.total_vendors > 1 ? "s" : ""} responded
                          {group.accepted_count > 0 && (
                            <span className="ml-2 text-emerald-600 font-medium">• {group.accepted_count} accepted</span>
                          )}
                        </p>
                      </div>

                      <p className="text-xs text-zinc-500 line-clamp-1">{group.scope_of_work}</p>
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                      <ArrowRight size={20} />
                    </div>

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
      </div>
    </div>
  );
}
