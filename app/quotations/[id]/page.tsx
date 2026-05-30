"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Loader2, Send, CheckCircle2, XCircle, FileText, ArrowLeft,
  Package, User, ShieldCheck, Clock, Users, ChevronRight,
  ExternalLink, Truck, IndianRupee, Receipt, Calendar, Percent,
  AlertTriangle, Info
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

// ─── Types ───────────────────────────────────────────────────────────
type QuotationMessage = {
  id: string;
  quotation_id: string;
  sender_role: string;
  action: string;
  offer_price: number | null;
  offer_quantity: number | null;
  note: string | null;
  reason: string | null;
  created_at: string;
  vendor_name?: string;
};

type VendorQuotation = {
  id: string;
  status: string;
  vendor_id: string;
  vendor_name: string;
  product_name: string;
  requested_quantity: number;
  requested_price: number | null;
  current_offer_price: number | null;
  current_offer_quantity: number | null;
  current_offer_by: string | null;
  accepted_price: number | null;
  accepted_quantity: number | null;
  rejection_reason: string | null;
  admin_confirmation_status: string | null;
  admin_confirmation_message: string | null;
  admin_confirmed_at: string | null;
  quotation_group_id: string | null;
  delivery_days: number | null;
  token_percentage: number | null;
  token_amount: number | null;
  vendor_document_url: string | null;
  created_at: string;
  updated_at: string;
  product_image?: string;
  messages: QuotationMessage[];
};

type QuotationDocument = {
  quotation_number: string;
  document_url: string;
  valid_until: string;
  created_at: string;
};

type QuotationGroupDetail = {
  product_id: string;
  product_name: string;
  product_image: string | null;
  quotation_limit: number | null;
  requested_quantity: number;
  requested_price: number | null;
  quotation_group_id: string;
  document: QuotationDocument | null;
  vendor_quotations: VendorQuotation[];
};

// ─── Helpers ─────────────────────────────────────────────────────────
function formatINR(v: number | null | undefined) {
  if (v == null) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(v);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function getStatusInfo(status: string) {
  switch (status) {
    case "pending_vendor":
      return { label: "Awaiting Vendor", bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-500", icon: Clock };
    case "vendor_offered":
    case "vendor_countered":
      return { label: "Vendor Offered", bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500", icon: IndianRupee };
    case "client_countered":
      return { label: "You Countered", bg: "bg-violet-100", text: "text-violet-800", dot: "bg-violet-500", icon: Send };
    case "client_accepted":
      return { label: "Accepted", bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500", icon: CheckCircle2 };
    case "admin_confirmation_pending":
      return { label: "Admin Review", bg: "bg-orange-100", text: "text-orange-800", dot: "bg-orange-500", icon: ShieldCheck };
    case "admin_confirmed":
      return { label: "Confirmed ✓", bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500", icon: CheckCircle2 };
    case "client_rejected":
    case "vendor_rejected":
    case "admin_confirmation_rejected":
      return { label: "Rejected", bg: "bg-rose-100", text: "text-rose-800", dot: "bg-rose-500", icon: XCircle };
    default:
      return { label: status.replace(/_/g, " "), bg: "bg-zinc-100", text: "text-zinc-800", dot: "bg-zinc-500", icon: Info };
  }
}

// ─── Component ───────────────────────────────────────────────────────
export default function QuotationDetailPage() {
  const params = useParams();
  const groupId = params.id as string;
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [groupData, setGroupData] = useState<QuotationGroupDetail | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"vendor" | "admin">("vendor");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerQuantity, setOfferQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedQuotation = groupData?.vendor_quotations.find(vq => vq.vendor_id === selectedVendorId) || null;
  const messages = selectedQuotation?.messages || [];

  const isClosed = selectedQuotation
    ? ["client_accepted", "client_rejected", "vendor_rejected", "cancelled", "expired", "admin_confirmation_pending", "admin_confirmed", "admin_confirmation_rejected"].includes(selectedQuotation.status)
    : false;

  const isWaitingForVendor = selectedQuotation ? selectedQuotation.current_offer_by !== "vendor" && !isClosed : true;
  const canReplyToVendor = selectedQuotation ? selectedQuotation.current_offer_by === "vendor" && !isClosed : false;

  const showAdminChat = selectedQuotation?.admin_confirmation_status !== null && selectedQuotation?.admin_confirmation_status !== undefined;
  const isAdminPending = selectedQuotation?.admin_confirmation_status === "pending";

  const hasAcceptedVendor = groupData?.vendor_quotations.some(vq => vq.status === "client_accepted" || vq.status === "admin_confirmed" || vq.status === "admin_confirmation_pending") || false;

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/quotations/${groupId}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", "x-request-from": "client" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load quotation");

      const gd = data.data as QuotationGroupDetail;
      setGroupData(gd);

      if (!selectedVendorId && gd.vendor_quotations.length > 0) {
        setSelectedVendorId(gd.vendor_quotations[0].vendor_id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load quotation";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeTab]);

  const handleVendorAction = async (action: string) => {
    if (!selectedQuotation) return;
    if (action === "counter" && (!offerPrice || !offerQuantity || !reason)) {
      toast.error("Please fill in price, quantity, and reason for your counter offer");
      return;
    }
    if (action === "reject" && !reason) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/quotations/${selectedQuotation.id}/respond`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "x-request-from": "client" },
        body: JSON.stringify({
          action,
          offerPrice: offerPrice ? Number(offerPrice) : undefined,
          offerQuantity: offerQuantity ? Number(offerQuantity) : undefined,
          reason: reason || undefined,
          note: note || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send response");

      toast.success(action === "accept" ? "Offer accepted!" : action === "reject" ? "Offer rejected" : "Counter offer sent");
      setOfferPrice("");
      setOfferQuantity("");
      setReason("");
      setNote("");
      await fetchData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send response";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminResponse = async (action: "accept" | "reject") => {
    if (!selectedQuotation) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/quotations/${selectedQuotation.id}/admin-response`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "x-request-from": "client" },
        body: JSON.stringify({ action, note: note || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to respond");
      toast.success(action === "accept" ? "Admin confirmation accepted!" : "Admin confirmation rejected");
      setNote("");
      await fetchData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to respond";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render: Message Card ──────────────────────────────────────────
  function renderMessageCard(msg: QuotationMessage) {
    const isClient = msg.sender_role === "client";
    const subtotal = msg.offer_price && msg.offer_quantity ? msg.offer_price * msg.offer_quantity : null;
    const gst = subtotal ? subtotal * 0.18 : null;
    const total = subtotal && gst ? subtotal + gst : null;

    return (
      <div key={msg.id} className={`flex ${isClient ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-[85%] w-full ${isClient ? "ml-8" : "mr-8"}`}>
          {/* Sender + Time */}
          <div className={`flex items-center gap-2 mb-1.5 ${isClient ? "justify-end" : "justify-start"}`}>
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${isClient ? "bg-blue-100 text-blue-700" : "bg-zinc-100 text-zinc-600"}`}>
              {isClient ? <User size={10} /> : <Package size={10} />}
              {isClient ? "You" : selectedQuotation?.vendor_name}
            </div>
            <span className="text-[10px] text-zinc-400">{formatTime(msg.created_at)}</span>
            <span className="text-[10px] text-zinc-300">{formatDate(msg.created_at)}</span>
          </div>

          {/* Main card */}
          <div className={`rounded-2xl overflow-hidden border ${isClient
              ? "bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500 text-white"
              : "bg-white border-zinc-200 text-zinc-900 shadow-sm"
            }`}>

            {/* Action Badge */}
            <div className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border-b ${isClient ? "border-blue-500/30 text-blue-100 bg-blue-700/50" : "border-zinc-100 text-zinc-500 bg-zinc-50"
              }`}>
              {msg.action === "request" && "📋 Quotation Request"}
              {msg.action === "offer" && "💰 Vendor Offer"}
              {msg.action === "counter" && (isClient ? "↩️ Your Counter Offer" : "↩️ Vendor Counter Offer")}
              {msg.action === "accept" && "✅ Offer Accepted"}
              {msg.action === "reject" && "❌ Rejected"}
              {msg.action === "note" && "📝 Note"}
            </div>

            <div className="p-4 space-y-3">
              {/* Pricing Breakdown — only for offer/counter/request actions */}
              {msg.offer_price != null && msg.offer_quantity != null && msg.action !== "request" && (
                <div className={`rounded-xl p-3 space-y-2 ${isClient ? "bg-blue-700/40" : "bg-zinc-50 border border-zinc-100"}`}>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className={`text-[10px] uppercase tracking-wider ${isClient ? "text-blue-200" : "text-zinc-400"}`}>Unit Price</p>
                      <p className="text-sm font-bold">{formatINR(msg.offer_price)}</p>
                    </div>
                    <div>
                      <p className={`text-[10px] uppercase tracking-wider ${isClient ? "text-blue-200" : "text-zinc-400"}`}>Quantity</p>
                      <p className="text-sm font-bold">{msg.offer_quantity?.toLocaleString("en-IN")} units</p>
                    </div>
                    <div>
                      <p className={`text-[10px] uppercase tracking-wider ${isClient ? "text-blue-200" : "text-zinc-400"}`}>Subtotal</p>
                      <p className="text-sm font-bold">{formatINR(subtotal)}</p>
                    </div>
                  </div>
                  {total != null && (
                    <div className={`flex items-center justify-between pt-2 mt-2 border-t ${isClient ? "border-blue-500/30" : "border-zinc-200"}`}>
                      <span className={`text-xs ${isClient ? "text-blue-200" : "text-zinc-500"}`}>GST (18%): {formatINR(gst)}</span>
                      <span className="text-sm font-extrabold">{formatINR(total)}</span>
                    </div>
                  )}
                </div>
              )}

              {msg.action === "request" && msg.offer_quantity != null && (
                <div className="rounded-xl p-3 bg-zinc-50 border border-zinc-100">
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-400">Requested Quantity</p>
                    <p className="text-base font-bold text-zinc-950 mt-1">{msg.offer_quantity?.toLocaleString("en-IN")} units</p>
                  </div>
                </div>
              )}

              {/* Reason */}
              {msg.reason && (
                <div className={`flex items-start gap-2 text-sm ${isClient ? "text-blue-100" : "text-zinc-600"}`}>
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span><strong>Reason:</strong> {msg.reason}</span>
                </div>
              )}

              {/* Note */}
              {msg.note && (
                <div className={`text-sm whitespace-pre-wrap ${isClient ? "text-blue-100" : "text-zinc-600"}`}>
                  {msg.note}
                </div>
              )}

              {/* Accept message */}
              {msg.action === "accept" && (
                <div className={`flex items-center gap-2 text-sm font-semibold ${isClient ? "text-emerald-200" : "text-emerald-700"}`}>
                  <CheckCircle2 size={16} />
                  Offer has been accepted. Awaiting admin confirmation.
                </div>
              )}

              {/* Reject message */}
              {msg.action === "reject" && (
                <div className={`flex items-center gap-2 text-sm font-semibold ${isClient ? "text-rose-200" : "text-rose-700"}`}>
                  <XCircle size={16} />
                  This quotation has been rejected.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: Vendor Terms Summary (shown above chat when vendor has offered) ───
  function renderVendorTermsSummary(vq: VendorQuotation) {
    if (!vq.current_offer_price) return null;
    const subtotal = vq.current_offer_price * (vq.current_offer_quantity || vq.requested_quantity);
    const gst = subtotal * 0.18;
    const total = subtotal + gst;
    const tokenAmount = vq.token_percentage != null ? (vq.token_percentage / 100) * total : null;

    return (
      <div className="mx-4 mt-3 mb-1 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Receipt size={16} className="text-blue-600" />
          <h4 className="text-sm font-bold text-blue-900">Current Offer Summary</h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-blue-100 p-2.5 text-center">
            <p className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">Price × Qty</p>
            <p className="text-sm font-bold text-zinc-900">{formatINR(vq.current_offer_price)} × {vq.current_offer_quantity}</p>
          </div>
          <div className="bg-white rounded-lg border border-blue-100 p-2.5 text-center">
            <p className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">Total (incl. GST)</p>
            <p className="text-sm font-bold text-emerald-700">{formatINR(total)}</p>
          </div>
          {vq.delivery_days != null && (
            <div className="bg-white rounded-lg border border-blue-100 p-2.5 text-center">
              <p className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider flex items-center justify-center gap-1"><Truck size={10} /> Delivery</p>
              <p className="text-sm font-bold text-zinc-900">{vq.delivery_days} Days</p>
            </div>
          )}
          {vq.token_percentage != null && (
            <div className="bg-white rounded-lg border border-blue-100 p-2.5 text-center">
              <p className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider flex items-center justify-center gap-1"><Percent size={10} /> Token Money</p>
              <p className="text-sm font-bold text-orange-700">{vq.token_percentage}% ({formatINR(tokenAmount)})</p>
            </div>
          )}
        </div>
        {vq.vendor_document_url && (
          <a
            href={vq.vendor_document_url.includes('?') ? vq.vendor_document_url : `${vq.vendor_document_url}?t=${new Date(vq.updated_at).getTime()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-2 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            <FileText size={14} /> View Vendor&apos;s Filled Quotation Document <ExternalLink size={12} />
          </a>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!groupData) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-zinc-900">Quotation Not Found</h1>
        <Link href="/quotations" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
          <ArrowLeft size={16} /> Back to Quotations
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50">
      {/* ─── Header ─── */}
      <div className="bg-white border-b border-zinc-200 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link href="/quotations" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 mb-4 transition-colors">
            <ArrowLeft size={16} /> Back to Quotations
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-zinc-100 overflow-hidden">
                {groupData.product_image ? (
                  <Image src={groupData.product_image} alt="Product" width={56} height={56} className="rounded-xl object-cover h-full w-full" />
                ) : (
                  <Package size={24} className="text-zinc-400" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-900">{groupData.product_name}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-zinc-500">
                  <span>Qty: <strong className="text-zinc-700">{groupData.requested_quantity.toLocaleString("en-IN")}</strong> units</span>
                  <span className="w-px h-3 bg-zinc-300" />
                  <span className="flex items-center gap-1"><Users size={14} /> {groupData.vendor_quotations.length} vendor{groupData.vendor_quotations.length > 1 ? "s" : ""} bidding</span>
                  {groupData.document && (
                    <>
                      <span className="w-px h-3 bg-zinc-300" />
                      <span className="text-xs text-zinc-400">#{groupData.document.quotation_number}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Document Link */}
            {(selectedQuotation?.vendor_document_url || groupData.document?.document_url) && (
              <a
                href={selectedQuotation?.vendor_document_url ? (selectedQuotation.vendor_document_url.includes('?') ? selectedQuotation.vendor_document_url : `${selectedQuotation.vendor_document_url}?t=${new Date(selectedQuotation.updated_at).getTime()}`) : (groupData.document?.document_url || "#")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors shrink-0"
              >
                <FileText size={16} /> View Agreement <ExternalLink size={14} />
              </a>
            )}
          </div>

          {/* Document Info Banner */}
          {groupData.document && (
            <div className="mt-3 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 text-xs text-emerald-800">
              <Calendar size={14} />
              <span>Quotation <strong>{groupData.document.quotation_number}</strong> • Created {formatDate(groupData.document.created_at)} • Valid until <strong>{formatDate(groupData.document.valid_until)}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Main 2-Panel Layout ─── */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">

          {/* LEFT COLUMN: Stack of Documents Card + Vendor List Card */}
          <div className="flex flex-col gap-6 h-[800px] lg:h-[850px]">

            {/* Premium S3 Documents Card */}
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden p-5 shrink-0 bg-gradient-to-br from-zinc-50 to-white">
              <h2 className="text-sm font-bold text-zinc-950 flex items-center gap-2 mb-3">
                <FileText size={16} className="text-emerald-600" />
                Official Agreements
              </h2>
              <div className="space-y-2">
                {/* 1. Base Request Agreement */}
                {groupData.document ? (
                  <a
                    href={groupData.document.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-colors text-xs font-semibold text-emerald-800"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <FileText size={16} className="text-emerald-600 shrink-0" />
                      View Base Agreement
                    </span>
                    <ExternalLink size={12} className="shrink-0" />
                  </a>
                ) : (
                  <div className="p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-xs text-zinc-400 text-center italic">
                    Base Agreement not generated
                  </div>
                )}

                {/* 2. Vendor Specific Filled Agreement */}
                {selectedQuotation?.vendor_document_url ? (
                  <a
                    href={selectedQuotation.vendor_document_url.includes('?') ? selectedQuotation.vendor_document_url : `${selectedQuotation.vendor_document_url}?t=${new Date(selectedQuotation.updated_at).getTime()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-colors text-xs font-semibold text-blue-800 animate-pulse"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <ShieldCheck size={16} className="text-blue-600 shrink-0" />
                      View Signed Vendor Quote
                    </span>
                    <ExternalLink size={12} className="shrink-0" />
                  </a>
                ) : (
                  <div className="p-2.5 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 text-[11px] text-zinc-400 text-center">
                    Awaiting Vendor Offer Signature
                  </div>
                )}
              </div>
            </div>

            {/* Vendor List Card */}
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col flex-1">
              <div className="px-5 py-4 border-b border-zinc-100 bg-gradient-to-r from-zinc-50 to-white shrink-0">
                <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <Users size={16} className="text-blue-600" />
                  Vendor Bids ({groupData.vendor_quotations.length})
                </h2>
              </div>
              <div className="divide-y divide-zinc-100 flex-1 overflow-y-auto">
                {groupData.vendor_quotations.map((vq) => {
                  const st = getStatusInfo(vq.status);
                  const isSelected = vq.vendor_id === selectedVendorId;
                  const subtotal = vq.current_offer_price && vq.current_offer_quantity ? vq.current_offer_price * vq.current_offer_quantity : null;
                  const total = subtotal ? subtotal + subtotal * 0.18 : null;

                  return (
                    <button
                      key={vq.id}
                      onClick={() => setSelectedVendorId(vq.vendor_id)}
                      className={`w-full text-left px-5 py-4 transition-all hover:bg-zinc-50 ${isSelected ? "bg-blue-50/60 border-l-4 border-l-blue-500" : "border-l-4 border-l-transparent"
                        }`}
                    >
                      {/* Vendor Name + Status */}
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`font-semibold text-sm truncate ${isSelected ? "text-blue-700" : "text-zinc-900"}`}>
                          {vq.vendor_name}
                        </h3>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${st.bg} ${st.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                      </div>

                      {/* Offer Details Grid */}
                      {vq.current_offer_price ? (
                        <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                          <div className="bg-zinc-50 rounded px-2 py-1.5">
                            <span className="text-zinc-400">Price</span>
                            <p className="font-bold text-zinc-800">{formatINR(vq.current_offer_price)}</p>
                          </div>
                          <div className="bg-zinc-50 rounded px-2 py-1.5">
                            <span className="text-zinc-400">Total</span>
                            <p className="font-bold text-emerald-700">{formatINR(total)}</p>
                          </div>
                          <div className="bg-zinc-50 rounded px-2 py-1.5">
                            <span className="text-zinc-400">Delivery</span>
                            <p className="font-bold text-zinc-800">{vq.delivery_days ? `${vq.delivery_days}d` : "—"}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-amber-600 italic">No offer yet</p>
                      )}

                      {/* Token info */}
                      {vq.token_percentage != null && (
                        <p className="text-[10px] text-orange-600 mt-1.5 font-medium">
                          Token: {vq.token_percentage}% upfront
                        </p>
                      )}

                      {/* Accepted */}
                      {vq.accepted_price && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-emerald-700 font-semibold">
                          <CheckCircle2 size={12} /> Accepted at {formatINR(vq.accepted_price)}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: Chat Panel */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col h-[800px] lg:h-[850px]">
            {selectedQuotation ? (
              <>
                {/* Chat Header */}
                <div className="px-5 py-3 border-b border-zinc-200 bg-gradient-to-r from-zinc-50 to-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-zinc-900">{selectedQuotation.vendor_name}</h3>
                      <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${getStatusInfo(selectedQuotation.status).bg} ${getStatusInfo(selectedQuotation.status).text}`}>
                          {getStatusInfo(selectedQuotation.status).label}
                        </span>
                        <span className="text-zinc-300">|</span>
                        <span>Started {formatDate(selectedQuotation.created_at)}</span>
                      </p>
                    </div>
                    {selectedQuotation.vendor_document_url && (
                      <a href={selectedQuotation.vendor_document_url.includes('?') ? selectedQuotation.vendor_document_url : `${selectedQuotation.vendor_document_url}?t=${new Date(selectedQuotation.updated_at).getTime()}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium">
                        <FileText size={14} /> Vendor Doc <ExternalLink size={10} />
                      </a>
                    )}
                  </div>

                  {/* Tab switcher */}
                  {showAdminChat && (
                    <div className="flex mt-3 gap-1 bg-zinc-100 rounded-lg p-1">
                      <button
                        onClick={() => setActiveTab("vendor")}
                        className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${activeTab === "vendor" ? "bg-white shadow text-zinc-900" : "text-zinc-500 hover:text-zinc-700"}`}
                      >
                        Vendor Negotiation
                      </button>
                      <button
                        onClick={() => setActiveTab("admin")}
                        className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${activeTab === "admin" ? "bg-white shadow text-zinc-900" : "text-zinc-500 hover:text-zinc-700"}`}
                      >
                        Admin Confirmation
                      </button>
                    </div>
                  )}
                </div>

                {/* Vendor Terms Summary Card */}
                {activeTab === "vendor" && renderVendorTermsSummary(selectedQuotation)}

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-5 py-4 bg-gradient-to-b from-zinc-50/50 to-white" style={{ minHeight: 200 }}>
                  <div className="max-w-4xl mx-auto w-full space-y-5">
                    {activeTab === "vendor" ? (
                      <>
                        {messages.filter(m => m.action !== "admin_confirm" && m.action !== "admin_reject" && m.sender_role !== "admin").length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
                            <Clock size={32} className="mb-3 text-zinc-300" />
                            <p className="text-sm font-medium">Waiting for vendor to respond...</p>
                            <p className="text-xs mt-1">The vendor will send their offer with pricing, delivery timeline, and terms.</p>
                          </div>
                        ) : (
                          messages
                            .filter(m => m.action !== "admin_confirm" && m.action !== "admin_reject" && m.sender_role !== "admin")
                            .map(renderMessageCard)
                        )}
                      </>
                    ) : (
                      <div className="space-y-4">
                        {selectedQuotation.admin_confirmation_message && (
                          <div className="flex justify-start">
                            <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white border border-zinc-200 shadow-sm rounded-bl-sm">
                              <div className="flex items-center gap-2 mb-1">
                                <ShieldCheck size={12} className="text-zinc-500" />
                                <span className="text-xs font-semibold text-zinc-600">Admin</span>
                              </div>
                              <p className="text-sm">{selectedQuotation.admin_confirmation_message}</p>
                            </div>
                          </div>
                        )}
                        {selectedQuotation.admin_confirmation_status === "accepted" && (
                          <div className="flex justify-end">
                            <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-emerald-600 text-white rounded-br-sm">
                              <p className="text-sm flex items-center gap-1"><CheckCircle2 size={14} /> Admin confirmation accepted</p>
                            </div>
                          </div>
                        )}
                        {selectedQuotation.admin_confirmation_status === "rejected" && (
                          <div className="flex justify-end">
                            <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-rose-600 text-white rounded-br-sm">
                              <p className="text-sm flex items-center gap-1"><XCircle size={14} /> Admin confirmation rejected</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Action Area */}
                <div className="bg-white border-t border-zinc-200 p-4 sm:p-5">
                  {activeTab === "vendor" && (
                    <>
                      {isClosed && selectedQuotation.admin_confirmation_status === null ? (
                        <div className="flex items-center gap-3 rounded-xl bg-zinc-50 border border-zinc-200 p-4 text-zinc-600">
                          <CheckCircle2 className="text-zinc-400 shrink-0" />
                          <p className="text-sm font-medium">This negotiation is closed.</p>
                        </div>
                      ) : isWaitingForVendor ? (
                        <div className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4 text-amber-800">
                          <Clock className="text-amber-500 animate-pulse shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Waiting for vendor to respond...</p>
                            <p className="text-xs text-amber-600 mt-0.5">You&apos;ll be notified when the vendor sends their offer with pricing, delivery timeline, and token terms.</p>
                          </div>
                        </div>
                      ) : canReplyToVendor ? (
                        <div className="space-y-4">
                          {/* Quick Accept/Reject */}
                          {!hasAcceptedVendor && (
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleVendorAction("accept")}
                                disabled={submitting}
                                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-700 disabled:opacity-50 shadow-sm"
                              >
                                <CheckCircle2 size={16} />
                                Accept This Offer
                              </button>
                              <button
                                onClick={() => reason ? handleVendorAction("reject") : toast.error("Enter a reason first")}
                                disabled={submitting}
                                className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-rose-200 py-3 text-sm font-semibold text-rose-700 transition-all hover:bg-rose-50 disabled:opacity-50"
                              >
                                <XCircle size={16} />
                                Reject
                              </button>
                            </div>
                          )}
                          {hasAcceptedVendor && (
                            <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-700">
                              <CheckCircle2 size={16} className="shrink-0" />
                              <p className="text-sm font-medium">You&apos;ve already accepted another vendor for this product.</p>
                            </div>
                          )}

                          {/* Counter Offer Form */}
                          <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-4 space-y-3">
                            <p className="text-xs font-bold text-zinc-600 uppercase tracking-wider">↩️ Counter Offer</p>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Your Price (₹)</label>
                                <input type="number" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)}
                                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="e.g. 250" />
                              </div>
                              <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Quantity</label>
                                <input type="number" value={offerQuantity} onChange={(e) => setOfferQuantity(e.target.value)}
                                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="e.g. 500" />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-zinc-500 mb-1 block">Reason *</label>
                              <input type="text" value={reason} onChange={(e) => setReason(e.target.value)}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Why are you countering?" />
                            </div>
                            <div>
                              <label className="text-xs text-zinc-500 mb-1 block">Note (optional)</label>
                              <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Additional details..." />
                            </div>
                            <button
                              onClick={() => handleVendorAction("counter")}
                              disabled={submitting || !offerPrice || !offerQuantity || !reason}
                              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                            >
                              {submitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                              Send Counter Offer
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </>
                  )}

                  {activeTab === "admin" && isAdminPending && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 rounded-xl bg-orange-50 border border-orange-200 p-4 text-orange-800">
                        <ShieldCheck className="text-orange-500 shrink-0" />
                        <p className="text-sm font-medium">Admin has confirmed this deal. Please review and respond.</p>
                      </div>
                      <div>
                        <label className="text-xs text-zinc-500 mb-1 block">Note (optional)</label>
                        <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
                          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => handleAdminResponse("accept")} disabled={submitting}
                          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 shadow-sm">
                          <CheckCircle2 size={16} /> Accept
                        </button>
                        <button onClick={() => handleAdminResponse("reject")} disabled={submitting}
                          className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-rose-200 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50">
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full py-20 text-zinc-400">
                <div className="text-center">
                  <Users size={32} className="mx-auto mb-3 text-zinc-300" />
                  <p className="text-sm font-medium">Select a vendor from the list</p>
                  <p className="text-xs mt-1 text-zinc-400">Click on a vendor to view their quotation details and chat</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
