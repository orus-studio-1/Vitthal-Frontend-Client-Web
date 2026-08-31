"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronRight,
  Package,
  Clock,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Key,
  Wrench,
  X,
  Lock,
  LogIn,
  UserPlus,
  ArrowLeft,
  Plus,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { fetchMyServiceTickets, type ServiceTicket } from "@/lib/api/serviceHub";

export const dynamic = "force-dynamic";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: "Draft", color: "bg-zinc-100 text-zinc-700 border-zinc-200", icon: Clock },
  broadcasted: { label: "Open RFQ", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Clock },
  quote_pending: { label: "Quote Pending", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  quoted: { label: "Quotes Received", color: "bg-purple-50 text-purple-700 border-purple-200", icon: ChevronRight },
  accepted: { label: "Accepted / Assigned", color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle2 },
  in_progress: { label: "In Progress", color: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: Loader2 },
  completed: { label: "Completed", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-zinc-100 text-zinc-500 border-zinc-200", icon: X },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status.replace(/_/g, " "),
    color: "bg-zinc-100 text-zinc-600 border-zinc-200",
    icon: Package,
  };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${cfg.color}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

export default function ServiceBookingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadTickets();
    }
  }, [isAuthenticated, activeTab]);

  async function loadTickets() {
    try {
      setLoading(true);
      const params: any = { limit: 50 };
      if (activeTab !== "all") {
        params.status = activeTab;
      }
      const res = await fetchMyServiceTickets(params);
      setTickets(res.data || []);
    } catch (err: any) {
      console.error("Failed to load service bookings:", err);
      toast.error(err.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }

  const handleCopyOtp = (e: React.MouseEvent, otp: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(otp);
    setCopiedOtp(otp);
    toast.success("Completion OTP copied to clipboard!");
    setTimeout(() => setCopiedOtp(null), 2000);
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-white pb-24 pt-16">
        <div className="mx-auto max-w-md px-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-zinc-900">
            Sign In to View Service Bookings
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            Please log in or create an account to track your breakdown repairs, machining RFQs, and secure completion OTPs.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/login?redirect=/services/bookings"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-medium text-white shadow-xs transition hover:bg-blue-700"
            >
              <LogIn className="h-4 w-4" /> Log In
            </Link>
            <Link
              href="/register?redirect=/services/bookings"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-6 py-2.5 text-xs font-medium text-zinc-700 shadow-xs transition hover:bg-zinc-50"
            >
              <UserPlus className="h-4 w-4" /> Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Services Hub
            </Link>
            <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-zinc-900">
              My Service Bookings & Active Tickets
            </h1>
            <p className="mt-0.5 text-xs text-zinc-500">
              Track live status, monitor multi-vendor bidding, and access your 6-digit completion OTPs.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadTickets}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition"
              title="Refresh bookings"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            <Link
              href="/services/request"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" /> Raise Service Request
            </Link>
          </div>
        </div>

        {/* Informative OTP Explainer Banner */}
        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-zinc-700 flex items-start gap-3">
          <div className="rounded-lg bg-blue-100 p-2 text-blue-700 shrink-0 mt-0.5">
            <Key className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900">How Job Completion OTP Works:</h3>
            <p className="mt-0.5 text-zinc-600 leading-relaxed text-[11px]">
              When your technician arrives on-site or completes work, they will request the <strong>6-digit Completion OTP</strong> shown on your ticket card below. 
              Share this OTP with the technician only after you have verified and tested the service on-site.
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-6 flex gap-2 border-b border-zinc-200 pb-2 overflow-x-auto">
          {[
            { id: "all", label: "All Bookings" },
            { id: "broadcasted", label: "Open RFQs" },
            { id: "quoted", label: "Quoted" },
            { id: "in_progress", label: "In Progress / Active" },
            { id: "completed", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? "bg-zinc-900 text-white shadow-xs"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cards Grid (Fixed-Size Cards with ... Truncation) */}
        <div className="mt-6">
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-zinc-400">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <p className="text-xs">Loading service bookings...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 p-12 text-center text-xs text-zinc-400">
              No service bookings found in this view.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {tickets.map((ticket) => {
                const title =
                  ticket.ticket_payload?.machine_name ||
                  ticket.ticket_payload?.job_title ||
                  ticket.ticket_payload?.vehicle_type ||
                  ticket.subcategory_name ||
                  ticket.category_name ||
                  "Service Request";

                const desc =
                  ticket.ticket_payload?.symptoms ||
                  ticket.ticket_payload?.technical_notes ||
                  ticket.ticket_payload?.cargo_type ||
                  ticket.ticket_payload?.general_notes ||
                  "Service ticket in progress";

                const showOtp =
                  ticket.completion_otp &&
                  (ticket.status === "in_progress" ||
                    ticket.status === "accepted" ||
                    ticket.status === "quoted" ||
                    ticket.status === "broadcasted");

                return (
                  <article
                    key={ticket.id}
                    className="group flex h-[255px] min-h-[255px] max-h-[255px] flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xs transition hover:border-blue-500 hover:shadow-md"
                  >
                    <div>
                      {/* Top Row: Ticket Number & Status */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-zinc-700 truncate">
                          {ticket.ticket_number}
                        </span>
                        <StatusBadge status={ticket.status} />
                      </div>

                      {/* Category & Date */}
                      <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
                        <span className="font-medium text-zinc-600 truncate max-w-[170px]">
                          {ticket.category_name || "Industrial Service"}
                        </span>
                        <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                      </div>

                      {/* Title (Truncated to 1 line) */}
                      <h2 className="mt-1 font-heading text-sm font-bold text-zinc-900 group-hover:text-blue-600 transition truncate">
                        {title}
                      </h2>

                      {/* Description (Clamped to 2 lines with ...) */}
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500 overflow-hidden text-ellipsis min-h-[32px]">
                        {desc}
                      </p>
                    </div>

                    {/* Bottom Area: Completion OTP or Status Details */}
                    <div className="border-t border-zinc-100 pt-3">
                      {showOtp ? (
                        <div className="mb-2 flex items-center justify-between rounded-xl bg-blue-50/80 border border-blue-200/70 px-3 py-1.5">
                          <div className="flex items-center gap-1.5">
                            <Key className="h-3.5 w-3.5 text-blue-700" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                              Completion OTP:
                            </span>
                            <span className="font-mono text-xs font-extrabold tracking-widest text-blue-950">
                              {ticket.completion_otp}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleCopyOtp(e, ticket.completion_otp!)}
                            className="text-[10px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-0.5"
                            title="Copy OTP"
                          >
                            {copiedOtp === ticket.completion_otp ? (
                              <>
                                <Check className="h-3 w-3" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" /> Copy
                              </>
                            )}
                          </button>
                        </div>
                      ) : ticket.status === "completed" ? (
                        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>Service Verified & Completed</span>
                        </div>
                      ) : (
                        <div className="mb-2 text-[11px] text-zinc-500">
                          <span>{ticket.quotes_count || 0} Quotations Received</span>
                        </div>
                      )}

                      {/* Action Link to Room */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[11px] text-zinc-400">
                          Priority: <strong className="text-zinc-700 capitalize">{ticket.priority?.replace(/_/g, " ") || "Medium"}</strong>
                        </span>
                        <Link
                          href={`/services/tickets/${ticket.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform"
                        >
                          Open Room <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
