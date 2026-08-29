"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wrench,
  ArrowLeft,
  RefreshCw,
  Plus,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Truck,
  Cog,
  Calendar,
  IndianRupee,
} from "lucide-react";
import { fetchMyTickets, type ServiceTicket } from "@/lib/api/serviceHub";
import { useAuthStore } from "@/store/authStore";

export default function MyServiceTicketsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    if (isAuthenticated) {
      loadTickets();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, selectedStatus]);

  async function loadTickets() {
    try {
      setLoading(true);
      const data = await fetchMyTickets(
        selectedStatus === "all" ? undefined : selectedStatus
      );
      setTickets(data);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "broadcasted":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
            <Clock className="h-3 w-3" /> Open for Bids
          </span>
        );
      case "quoted":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
            <AlertCircle className="h-3 w-3" /> Quotes Received
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
            <RefreshCw className="h-3 w-3 animate-spin" /> In Progress
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
            <CheckCircle2 className="h-3 w-3" /> Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700 capitalize">
            {status.replace(/_/g, " ")}
          </span>
        );
    }
  };

  const getVerticalIcon = (catName?: string) => {
    const name = (catName || "").toLowerCase();
    if (name.includes("logistics") || name.includes("freight") || name.includes("transport")) {
      return <Truck className="h-3.5 w-3.5 text-blue-600" />;
    }
    if (name.includes("job") || name.includes("machin") || name.includes("cnc") || name.includes("vmc")) {
      return <Cog className="h-3.5 w-3.5 text-blue-600" />;
    }
    return <Wrench className="h-3.5 w-3.5 text-blue-600" />;
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-white pb-24 pt-16">
        <div className="mx-auto max-w-md px-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Wrench className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-zinc-900">
            Sign In to View Your Tickets
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            Please log in or create an account to track your breakdown requests, machining bids, and freight trips.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/login?redirect=/services/tickets"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-medium text-white shadow-xs transition hover:bg-blue-700"
            >
              Log In
            </Link>
            <Link
              href="/register?redirect=/services/tickets"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-6 py-2.5 text-xs font-medium text-zinc-700 shadow-xs transition hover:bg-zinc-50"
            >
              Create Account
            </Link>
          </div>

          <div className="mt-8 border-t border-zinc-100 pt-6">
            <Link
              href="/services"
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition"
            >
              ← Return to Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24 pt-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Service Hub
            </Link>
            <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-zinc-900">
              Service Tickets & RFQs
            </h1>
            <p className="mt-1 text-xs text-zinc-500">
              Track real-time status of equipment maintenance, machining quotations, and freight trips.
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-blue-700 transition shrink-0"
          >
            <Plus className="h-3.5 w-3.5" /> New Service Request
          </Link>
        </div>

        {/* Minimal Filter Tabs */}
        <div className="mt-6 flex flex-wrap gap-1.5 border-b border-zinc-200 pb-3">
          {[
            { value: "all", label: "All Tickets" },
            { value: "broadcasted", label: "Open RFQs" },
            { value: "quoted", label: "Quoted" },
            { value: "in_progress", label: "In Progress" },
            { value: "completed", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                selectedStatus === tab.value
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tickets Grid with Fixed-Size Cards */}
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-zinc-400">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
            <p className="text-xs">Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="my-12 rounded-xl border border-zinc-200 bg-zinc-50/50 p-12 text-center">
            <Wrench className="mx-auto h-8 w-8 text-zinc-400" />
            <h3 className="mt-3 text-sm font-semibold text-zinc-800">No service tickets found</h3>
            <p className="mt-1 text-xs text-zinc-500">
              You haven't placed any service requests matching this filter.
            </p>
            <Link
              href="/services"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700"
            >
              Raise Request
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tickets.map((ticket) => {
              const cardTitle =
                ticket.ticket_payload?.machine_name ||
                ticket.ticket_payload?.job_title ||
                ticket.ticket_payload?.vehicle_type ||
                ticket.category_name ||
                "Service Request";

              const cardSubtitle =
                ticket.ticket_payload?.symptoms ||
                ticket.ticket_payload?.technical_notes ||
                ticket.ticket_payload?.cargo_type ||
                (ticket.asset_name ? `Asset: ${ticket.asset_name}` : "") ||
                `Ticket logged on ${new Date(ticket.created_at).toLocaleDateString()}`;

              return (
                <Link
                  key={ticket.id}
                  href={`/services/tickets/${ticket.id}`}
                  className="group flex h-[230px] min-h-[230px] max-h-[230px] flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs transition hover:border-blue-600 hover:shadow-xs"
                >
                  {/* Top Bar: Ticket # & Status */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 truncate">
                        {getVerticalIcon(ticket.category_name)}
                        <span className="font-mono text-[11px] font-semibold text-zinc-600 truncate">
                          {ticket.ticket_number}
                        </span>
                      </div>
                      <div className="shrink-0">{getStatusBadge(ticket.status)}</div>
                    </div>

                    {/* Card Title (Fixed 1-line with ellipsis) */}
                    <h3 className="mt-3 font-heading text-sm font-semibold text-zinc-900 group-hover:text-blue-600 transition truncate">
                      {cardTitle}
                    </h3>

                    {/* Category Pill / Priority */}
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-500">
                      <span className="truncate">{ticket.category_name || "General Service"}</span>
                      {ticket.priority === "emergency_breakdown" && (
                        <span className="shrink-0 font-semibold text-rose-600">• Urgent</span>
                      )}
                    </div>

                    {/* Description / Scope (Fixed 2-line clamp with ellipsis '...') */}
                    <p className="mt-2 line-clamp-2 text-xs text-zinc-500 leading-relaxed overflow-hidden text-ellipsis">
                      {cardSubtitle}
                    </p>
                  </div>

                  {/* Bottom Footer Bar */}
                  <div className="border-t border-zinc-100 pt-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-zinc-400">
                        {ticket.total_amount ? "Agreed Total" : "Quotations"}
                      </span>
                      <span className="font-heading font-semibold text-zinc-900 truncate">
                        {ticket.total_amount
                          ? `₹${Number(ticket.total_amount).toLocaleString("en-IN")}`
                          : `${ticket.quotes_count || 0} Bids Received`}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 group-hover:translate-x-0.5 transition-transform">
                      View Room <ChevronRight className="h-3.5 w-3.5" />
                    </div>
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
