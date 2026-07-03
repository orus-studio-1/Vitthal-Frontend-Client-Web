"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronRight,
  MessageSquare,
  ChevronDown,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Send,
  Wrench,
  IndianRupee,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useServiceStore } from "@/store/serviceStore";
import type { ServiceQuotation, QuotationDetail } from "@/store/serviceStore";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

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

export default function MyServiceQuotationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { quotations, isLoadingQuotations, fetchMyQuotations } = useServiceStore();
  const [openQuotation, setOpenQuotation] = useState<ServiceQuotation | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyQuotations();
    }
  }, [isAuthenticated, fetchMyQuotations]);

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={24} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <main>
        <section className="border-b border-zinc-200 bg-zinc-50">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <nav className="text-sm text-zinc-500 mb-3" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2">
                <li><Link href="/" className="hover:text-zinc-800 transition-colors">Home</Link></li>
                <li className="text-zinc-300"><ChevronRight size={14} /></li>
                <li><Link href="/services" className="hover:text-zinc-800 transition-colors">Services</Link></li>
                <li className="text-zinc-300"><ChevronRight size={14} /></li>
                <li className="text-zinc-800 font-medium">My Quotations</li>
              </ol>
            </nav>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">My Service Quotations</h1>
            <p className="mt-1 text-sm text-zinc-600">Negotiate and track your service quotation requests.</p>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            {isLoadingQuotations ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-28 animate-pulse rounded-xl border border-zinc-100 bg-zinc-50" />
                ))}
              </div>
            ) : quotations.length === 0 ? (
              <div className="py-24 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
                  <MessageSquare size={28} className="text-zinc-400" strokeWidth={1.5} />
                </div>
                <p className="mt-4 text-lg font-medium text-zinc-700">No quotations yet</p>
                <p className="mt-1 text-sm text-zinc-500">Browse services and request a custom quote from a vendor.</p>
                <Link href="/services" className="mt-4 inline-block rounded-lg bg-[#1d4ed8] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1e40af] transition-colors">
                  Browse Services
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {quotations.map((quotation) => (
                  <button
                    key={quotation.id}
                    onClick={() => setOpenQuotation(quotation)}
                    className="w-full text-left rounded-xl border border-zinc-200 bg-white p-5 hover:border-zinc-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-zinc-900 text-sm">{quotation.service_name}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">with {quotation.vendor_name}</p>
                          </div>
                          <StatusBadge status={quotation.status} />
                        </div>
                        <p className="mt-2 text-xs text-zinc-500 line-clamp-1">{quotation.scope_of_work}</p>
                        <div className="mt-3 flex items-center gap-3 text-xs text-zinc-400">
                          {quotation.requested_price && (
                            <span className="flex items-center gap-1">
                              <IndianRupee size={11} />
                              Budget ₹{parseFloat(quotation.requested_price).toLocaleString("en-IN")}
                            </span>
                          )}
                          {quotation.agreed_price && (
                            <span className="flex items-center gap-1 text-emerald-600 font-medium">
                              <CheckCircle2 size={11} />
                              Agreed ₹{parseFloat(quotation.agreed_price).toLocaleString("en-IN")}
                            </span>
                          )}
                          <span>{formatDate(quotation.updated_at)}</span>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-zinc-400 shrink-0 self-center" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

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
