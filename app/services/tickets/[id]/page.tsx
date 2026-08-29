"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Wrench,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Clock,
  Building2,
  Package,
  FileText,
  ExternalLink,
  Key,
  ChevronRight,
  Send,
  Loader2,
} from "lucide-react";
import {
  fetchServiceTicketDetail,
  acceptTicketQuote,
  verifyTicketOtp,
  type ServiceTicket,
} from "@/lib/api/serviceHub";
import { useAuthStore } from "@/store/authStore";

const STEPS = [
  { key: "broadcasted", label: "Request Placed" },
  { key: "quoted", label: "Quotes Received" },
  { key: "accepted", label: "Vendor Assigned" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

export default function SingleTicketRoomPage() {
  const params = useParams();
  const ticketId = String(params?.id || "");
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [ticket, setTicket] = useState<ServiceTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [acceptingQuoteId, setAcceptingQuoteId] = useState<string | null>(null);

  // OTP
  const [otpInput, setOtpInput] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/services/tickets/${ticketId}`);
      return;
    }
    if (ticketId && isAuthenticated) {
      loadTicket();
    }
  }, [ticketId, isAuthenticated, authLoading]);

  async function loadTicket() {
    try {
      setLoading(true);
      const data = await fetchServiceTicketDetail(ticketId);
      setTicket(data);
    } catch (err: any) {
      console.error("Failed to load ticket:", err);
      toast.error(err.message || "Failed to load ticket.");
    } finally {
      setLoading(false);
    }
  }

  const handleAcceptQuote = async (quoteId: string) => {
    try {
      setAcceptingQuoteId(quoteId);
      await acceptTicketQuote(ticketId, quoteId);
      toast.success("Quotation accepted.");
      loadTicket();
    } catch (err: any) {
      toast.error(err.message || "Failed to accept quote.");
    } finally {
      setAcceptingQuoteId(null);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput.trim()) return;

    try {
      setVerifyingOtp(true);
      await verifyTicketOtp(ticketId, otpInput.trim());
      toast.success("Service completion confirmed.");
      loadTicket();
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP code.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const getStepIndex = (status: string) => {
    if (status === "draft" || status === "broadcasted") return 0;
    if (status === "quote_pending" || status === "quoted") return 1;
    if (status === "accepted") return 2;
    if (status === "in_progress") return 3;
    if (status === "completed") return 4;
    return 0;
  };

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-2 text-zinc-400">
        <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
        <p className="text-xs">Loading ticket...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="mx-auto my-20 max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-xs">
        <p className="text-sm font-semibold text-zinc-900">Ticket Not Found</p>
        <Link
          href="/services/tickets"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Tickets
        </Link>
      </div>
    );
  }

  const currentStep = getStepIndex(ticket.status);

  return (
    <div className="min-h-screen bg-white pb-24 pt-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/services/tickets"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to My Tickets
        </Link>

        {/* Top Header */}
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-semibold text-zinc-500">
                {ticket.ticket_number}
              </span>
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-700">
                {ticket.category_name || "Service"}
              </span>
            </div>
            <h1 className="mt-1.5 font-heading text-2xl font-semibold text-zinc-900">
              {ticket.ticket_payload?.machine_name ||
                ticket.ticket_payload?.job_title ||
                ticket.ticket_payload?.vehicle_type ||
                "Service Request"}
            </h1>
            <p className="text-xs text-zinc-500">
              Created {new Date(ticket.created_at).toLocaleString()}
            </p>
          </div>

          {/* OTP Section */}
          {ticket.completion_otp && (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center">
              <span className="text-[10px] uppercase font-semibold text-zinc-500 flex items-center justify-center gap-1">
                <Key className="h-3 w-3 text-zinc-400" /> Completion PIN
              </span>
              <p className="mt-1 font-mono text-xl font-bold tracking-widest text-zinc-900">
                {ticket.completion_otp}
              </p>
              <p className="text-[10px] text-zinc-400 mt-0.5">Share with engineer upon job completion</p>
            </div>
          )}
        </div>

        {/* Progress Stepper */}
        <div className="my-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-xs">
          <div className="flex justify-between relative">
            {STEPS.map((s, idx) => {
              const isPast = idx <= currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div key={s.key} className="flex flex-col items-center flex-1 text-center relative z-10">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition ${
                      isPast
                        ? "bg-zinc-900 text-white"
                        : "border border-zinc-200 bg-white text-zinc-400"
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                  </div>
                  <span
                    className={`mt-2 text-[11px] font-medium ${
                      isCurrent ? "text-blue-600 font-semibold" : isPast ? "text-zinc-900" : "text-zinc-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
            <div className="absolute top-3.5 left-0 right-0 h-0.5 bg-zinc-100 -z-0" />
          </div>
        </div>

        {/* Main 2-Col Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Quotes & Specs */}
          <div className="space-y-6 lg:col-span-2">
            {/* Vendor Quotations */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4 shadow-xs">
              <div className="border-b border-zinc-100 pb-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                  Vendor Quotations ({ticket.quotations?.length || 0})
                </h2>
              </div>

              {ticket.quotations && ticket.quotations.length > 0 ? (
                <div className="space-y-3">
                  {ticket.quotations.map((q) => {
                    const isAccepted = q.status === "accepted";
                    return (
                      <div
                        key={q.id}
                        className={`rounded-lg border p-4 transition ${
                          isAccepted
                            ? "border-zinc-900 bg-zinc-50"
                            : "border-zinc-200 bg-white"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-heading text-sm font-semibold text-zinc-900">
                                {q.vendor_name}
                              </h3>
                              {isAccepted && (
                                <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-white">
                                  Assigned
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-500">
                              Quoted on {new Date(q.created_at).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4">
                            <span className="font-heading text-lg font-bold text-zinc-900">
                              ₹{Number(q.total_price).toLocaleString("en-IN")}
                            </span>

                            {!isAccepted && ticket.status !== "completed" && (
                              <button
                                onClick={() => handleAcceptQuote(q.id)}
                                disabled={acceptingQuoteId === q.id}
                                className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                              >
                                {acceptingQuoteId === q.id ? "Accepting..." : "Accept"}
                              </button>
                            )}
                          </div>
                        </div>

                        {q.quote_breakdown?.notes && (
                          <p className="mt-2.5 text-xs text-zinc-600 border-t border-zinc-100 pt-2 italic">
                            "{q.quote_breakdown.notes}"
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 py-4 text-center">
                  Broadcasting request to certified facilities. Quotations will appear here.
                </p>
              )}
            </div>

            {/* Specifications Details */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-3 shadow-xs">
              <div className="border-b border-zinc-100 pb-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                  Request Specifications
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Object.entries(ticket.ticket_payload || {}).map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-3">
                    <span className="text-[10px] uppercase font-semibold text-zinc-400">
                      {k.replace(/_/g, " ")}
                    </span>
                    <p className="mt-0.5 text-xs font-medium text-zinc-800">
                      {typeof v === "object" ? JSON.stringify(v) : String(v)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Attached Files */}
            {ticket.documents && ticket.documents.length > 0 && (
              <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-3 shadow-xs">
                <div className="border-b border-zinc-100 pb-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                    Attached Technical Documents ({ticket.documents.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {ticket.documents.map((d) => (
                    <div key={d.id} className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/50 p-3">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="h-4 w-4 text-zinc-500 shrink-0" />
                        <span className="text-xs font-medium text-zinc-800 truncate">{d.doc_name || d.doc_type}</span>
                      </div>
                      <a href={d.doc_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline shrink-0">
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: OTP Verification & Timeline */}
          <div className="space-y-6">
            {/* Completion OTP Card (For Customer) */}
            {ticket.status !== "completed" && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-6 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                    <Key className="h-4 w-4 text-blue-600" />
                    Your Completion OTP
                  </span>
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-800">
                    SECURE PIN
                  </span>
                </div>

                <div className="rounded-xl bg-white border border-blue-200 p-4 text-center">
                  <p className="font-mono text-3xl font-extrabold tracking-[0.3em] text-blue-950">
                    {ticket.completion_otp || "------"}
                  </p>
                </div>

                <p className="text-[11px] leading-relaxed text-zinc-600">
                  Share this 6-digit OTP with the visiting technician or driver <strong>only when the job is completed to your satisfaction</strong>. The technician enters this in their vendor app to finish the ticket.
                </p>

                {/* Optional: Manual Sign-off */}
                <div className="border-t border-blue-100 pt-3">
                  <details className="text-xs text-zinc-600">
                    <summary className="cursor-pointer font-semibold text-blue-700 hover:text-blue-900">
                      Or self-confirm completion
                    </summary>
                    <form onSubmit={handleVerifyOtp} className="space-y-2 pt-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit PIN"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 bg-white py-1.5 text-center font-mono text-sm tracking-widest text-zinc-900 focus:border-blue-600 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={verifyingOtp || !otpInput.trim()}
                        className="w-full rounded-lg bg-zinc-900 py-2 text-xs font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
                      >
                        {verifyingOtp ? "Verifying..." : "Confirm Completion"}
                      </button>
                    </form>
                  </details>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-3 shadow-xs">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                Activity Logs
              </h2>
              <div className="space-y-3 border-l border-zinc-100 pl-3.5 mt-3">
                {ticket.timeline_logs && ticket.timeline_logs.length > 0 ? (
                  ticket.timeline_logs.map((l, i) => (
                    <div key={i} className="relative">
                      <span className="absolute -left-[18px] top-1.5 h-1.5 w-1.5 rounded-full bg-blue-600" />
                      <p className="text-xs font-medium text-zinc-900 capitalize">{l.status}</p>
                      <p className="text-[11px] text-zinc-500">{l.note}</p>
                      <span className="text-[10px] text-zinc-400">{new Date(l.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-400">No activity logged.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
