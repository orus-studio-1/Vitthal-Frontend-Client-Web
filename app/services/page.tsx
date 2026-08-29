"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wrench,
  Cog,
  Truck,
  ArrowRight,
  ShieldCheck,
  Package,
  FileText,
  Check,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  Layers,
  Tag,
  Plus,
  Loader2,
  Sliders,
} from "lucide-react";
import {
  fetchMyTickets,
  fetchServiceCategories,
  type ServiceTicket,
  type ServiceCategory,
} from "@/lib/api/serviceHub";
import { useAuthStore } from "@/store/authStore";

export default function ServiceHubPage() {
  const { isAuthenticated } = useAuthStore();
  const [recentTickets, setRecentTickets] = useState<ServiceTicket[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(false);

  useEffect(() => {
    loadDynamicCategories();
    if (isAuthenticated) {
      setLoadingTickets(true);
      fetchMyTickets()
        .then((data) => setRecentTickets(data.slice(0, 3)))
        .catch(() => {})
        .finally(() => setLoadingTickets(false));
    }
  }, [isAuthenticated]);

  async function loadDynamicCategories() {
    try {
      setLoadingCategories(true);
      const data = await fetchServiceCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load service categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "broadcasted":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
            <Clock className="h-3 w-3" /> Open
          </span>
        );
      case "quoted":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
            <AlertCircle className="h-3 w-3" /> Quoted
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
            In Progress
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
            <CheckCircle2 className="h-3 w-3" /> Done
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-700 capitalize">
            {status.replace(/_/g, " ")}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-zinc-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-mono text-[11px] font-bold text-blue-700">
                <Layers className="h-3.5 w-3.5" /> B2B Industrial Service Network
              </span>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                Dynamic Industrial Services Hub
              </h1>
              <p className="text-sm leading-relaxed text-zinc-600">
                On-demand breakdown maintenance, precision CNC job-work RFQs, plant automation, and commercial transport. All requests are broadcasted exclusively to verified service vendors.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/services/request"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Raise Service Request
              </Link>
              <Link
                href="/services/tickets"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-xs transition hover:bg-zinc-50"
              >
                <FileText className="h-4 w-4" />
                My Service Tickets
              </Link>
              <Link
                href="/services/assets"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-xs transition hover:bg-zinc-50"
              >
                <Package className="h-4 w-4" />
                Machinery Registry
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Active Tickets Quick-Access (Fixed-Size Cards) */}
      {isAuthenticated && recentTickets.length > 0 && (
        <section className="border-b border-zinc-200 bg-zinc-50/30 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-sm font-semibold text-zinc-900">Your Active Service Tickets</h2>
                <p className="text-xs text-zinc-500">Track and respond to incoming bids from technicians and machining centers</p>
              </div>
              <Link
                href="/services/tickets"
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                View All ({recentTickets.length}) <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentTickets.map((ticket) => {
                const title =
                  ticket.ticket_payload?.machine_name ||
                  ticket.ticket_payload?.job_title ||
                  ticket.ticket_payload?.vehicle_type ||
                  ticket.category_name ||
                  "Service Request";

                const desc =
                  ticket.ticket_payload?.symptoms ||
                  ticket.ticket_payload?.technical_notes ||
                  ticket.ticket_payload?.cargo_type ||
                  ticket.ticket_payload?.general_notes ||
                  "Request in progress";

                return (
                  <Link
                    key={ticket.id}
                    href={`/services/tickets/${ticket.id}`}
                    className="group flex h-[180px] min-h-[180px] max-h-[180px] flex-col justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs transition hover:border-blue-600 hover:shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] font-medium text-zinc-500 truncate">
                          {ticket.ticket_number}
                        </span>
                        {getStatusBadge(ticket.status)}
                      </div>

                      <h3 className="mt-2 font-heading text-xs font-semibold text-zinc-900 group-hover:text-blue-600 transition truncate">
                        {title}
                      </h3>

                      <p className="mt-1 line-clamp-2 text-xs text-zinc-500 overflow-hidden text-ellipsis leading-relaxed">
                        {desc}
                      </p>
                    </div>

                    <div className="border-t border-zinc-100 pt-2.5 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-medium text-zinc-600">
                        {ticket.status === "in_progress"
                          ? "Technician Assigned"
                          : `${ticket.quotes_count || 0} Quotes Received`}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 group-hover:translate-x-0.5 transition-transform">
                        Open Room <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Dynamic Service Categories Configured by Admin */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-zinc-900">
                Available Service Verticals ({categories.length})
              </h2>
              <p className="text-xs text-zinc-500">
                Browse real-time service categories and subcategories configured by administration.
              </p>
            </div>
            <Link
              href="/services/request"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Custom Intake Form <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loadingCategories ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 p-12 text-center text-xs text-zinc-400">
              No service categories registered yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="group flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs transition hover:border-blue-500 hover:shadow-md"
                >
                  <div>
                    {/* Header Image or Banner */}
                    {category.image ? (
                      <div className="mb-4 h-36 w-full overflow-hidden rounded-xl bg-zinc-100 border border-zinc-100">
                        <img
                          src={category.image}
                          alt={category.label}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : null}

                    {/* Category Title & Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-heading text-base font-bold text-zinc-900 group-hover:text-blue-600 transition">
                          {category.label}
                        </h3>
                        <span className="mt-0.5 inline-block rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600">
                          {category.code}
                        </span>
                      </div>
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                        {category.subcategories?.length || 0} Subcategories
                      </span>
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-zinc-600 line-clamp-2 min-h-[32px]">
                      {category.description || "Specialized industrial service solutions."}
                    </p>

                    {/* Subcategories Chips */}
                    {category.subcategories && category.subcategories.length > 0 && (
                      <div className="mt-4 border-t border-zinc-100 pt-3">
                        <span className="block text-[11px] font-semibold text-zinc-700 mb-2">
                          Available Specializations:
                        </span>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                          {category.subcategories.map((sub) => (
                            <Link
                              key={sub.id}
                              href={`/services/request?category=${category.id}&subcategory=${sub.id}`}
                              className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] font-medium text-zinc-700 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-700 transition"
                            >
                              <Tag className="h-2.5 w-2.5 text-blue-600" />
                              <span>{sub.name}</span>
                              {sub.form_schema && sub.form_schema.length > 0 && (
                                <span className="rounded bg-blue-100 px-1 text-[9px] font-bold text-blue-800">
                                  {sub.form_schema.length} fields
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action CTA */}
                  <div className="mt-6 border-t border-zinc-100 pt-4">
                    <Link
                      href={`/services/request?category=${category.id}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-600"
                    >
                      Book Service / Request Quote
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust & Guarantee Banner */}
      <section className="border-t border-zinc-200/80 bg-zinc-50/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                  Verified Service Vendors
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                  All repair technicians, machining job shops, and transport drivers undergo strict KYC and qualification vetting.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                  Transparent Itemized Quotations
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Receive detailed breakdowns for labor charges, spare parts, transit miles, and turnaround times before accepting.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                  Secure OTP Job Completion
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Jobs are marked complete and payouts released only when you verify the work on-site via secure 6-digit OTP.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
