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
  createMaintenancePaymentOrder,
  verifyMaintenancePayment,
  createJobInquiryPaymentOrder,
  verifyJobInquiryPayment,
  verifyTicketOtp,
  type ServiceTicket,
} from "@/lib/api/serviceHub";
import { useAuthStore } from "@/store/authStore";

export const dynamic = "force-dynamic";

const STEPS = [
  { key: "broadcasted", label: "Request Placed" },
  { key: "quoted", label: "Quotes Received" },
  { key: "accepted", label: "Vendor Assigned" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

function TicketAttachment({ document }: { document: NonNullable<ServiceTicket["documents"]>[number] }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (/^https?:\/\//i.test(document.doc_url)) {
      setUrl(document.doc_url);
      return;
    }
    let active = true;
    void fetch(`${API_BASE_URL}/api/upload/file?fileName=${encodeURIComponent(document.doc_url)}`, { credentials: "include" })
      .then((response) => response.json())
      .then((result) => { if (active && result.url) setUrl(result.url); })
      .catch(() => {});
    return () => { active = false; };
  }, [document.doc_url]);

  const isVideo = /video/i.test(document.doc_type) || /\.(mp4|mov|webm)(?:\?|$)/i.test(document.doc_name || document.doc_url);
  const isImage = !isVideo && (/image|photo|machine_photos|goods_item_image/i.test(document.doc_type) || /\.(png|jpe?g|webp|gif)(?:\?|$)/i.test(document.doc_name || document.doc_url));
  const label = document.doc_name || document.doc_type.replace(/_/g, " ");
  return (
    <article className="min-w-0 overflow-hidden rounded-lg border border-zinc-100 bg-zinc-50/60">
      {url && isImage ? <a href={url} target="_blank" rel="noreferrer" className="block bg-white"><img src={url} alt={label} className="h-40 w-full object-contain" /></a> : null}
      {url && isVideo ? <video src={url} controls className="max-h-56 w-full bg-black" aria-label={label} /> : null}
      <div className="flex min-w-0 items-center justify-between gap-3 p-3">
        <span className="min-w-0 break-words text-xs font-medium capitalize text-zinc-800">{label}</span>
        {url ? <a href={url} target="_blank" rel="noreferrer" className="shrink-0 text-xs font-semibold text-blue-700 hover:underline">{isImage || isVideo ? "Open" : "View"}</a> : <span className="shrink-0 text-[11px] text-zinc-400">Loading file…</span>}
      </div>
    </article>
  );
}

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
      const order = await createMaintenancePaymentOrder(ticketId, quoteId);
      if (!(window as any).Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          script.onerror = () =>
            reject(new Error("Could not load Razorpay checkout."));
          document.body.appendChild(script);
        });
      }
      const Razorpay = (window as any).Razorpay;
      if (!Razorpay) throw new Error("Razorpay checkout is unavailable.");
      await new Promise<void>((resolve, reject) => {
        const checkout = new Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "Vitthal",
          description: `${ticket?.ticket_payload?.service_name || "Service"} quotation ${ticket?.ticket_number || ""}`,
          order_id: order.razorpayOrderId,
          theme: { color: "#2563eb" },
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              await verifyMaintenancePayment(ticketId, quoteId, response);
              toast.success(
                "Payment verified. Quotation accepted and vendor assigned.",
              );
              await loadTicket();
              resolve();
            } catch (err: any) {
              reject(err);
            }
          },
          modal: { ondismiss: () => resolve() },
        });
        checkout.on("payment.failed", (event: any) =>
          reject(new Error(event?.error?.description || "Payment failed.")),
        );
        checkout.open();
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to complete payment.");
    } finally {
      setAcceptingQuoteId(null);
    }
  };

  const handleJobInquiryPayment = async (
    quoteId: string,
    stage: "advance" | "final",
  ) => {
    try {
      setAcceptingQuoteId(quoteId);
      const order = await createJobInquiryPaymentOrder(
        ticketId,
        quoteId,
        stage,
      );
      if (!(window as any).Razorpay)
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          script.onerror = () =>
            reject(new Error("Could not load Razorpay checkout."));
          document.body.appendChild(script);
        });
      const Razorpay = (window as any).Razorpay;
      if (!Razorpay) throw new Error("Razorpay checkout is unavailable.");
      await new Promise<void>((resolve, reject) => {
        const checkout = new Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "Vitthal",
          description: `${stage === "advance" ? "25% confirmation" : "Remaining"} payment for job inquiry`,
          order_id: order.razorpayOrderId,
          theme: { color: "#2563eb" },
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              await verifyJobInquiryPayment(ticketId, quoteId, response);
              toast.success(
                stage === "advance"
                  ? "Confirmation payment received. Vendor assigned."
                  : "Remaining payment received.",
              );
              await loadTicket();
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          modal: { ondismiss: () => resolve() },
        });
        checkout.on("payment.failed", (event: any) =>
          reject(new Error(event?.error?.description || "Payment failed.")),
        );
        checkout.open();
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to complete payment.");
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
  const isJobInquiry =
    ticket.ticket_payload?.service_code === "job_inquiry" ||
    ticket.ticket_payload?.service_name === "Job Inquiry";
  const isLogistics = ticket.ticket_payload?.service_code === "logistics" || /logistic|freight|transport/i.test(String(ticket.ticket_payload?.service_name || ticket.category_name || ""));
  const isGoodsTicket = ticket.ticket_payload?.service_code === "goods_ticket_inquiry" || /goods[_\s-]*ticket|goods[_\s-]*inquiry/i.test(String(ticket.ticket_payload?.service_name || ticket.category_name || ""));
  const requestedJobItems = Array.isArray(ticket.ticket_payload?.job_work_items) ? ticket.ticket_payload.job_work_items as Array<Record<string, any>> : [];
  const displayPayloadEntries = Object.entries(ticket.ticket_payload || {}).filter(([key, value]) =>
    !/(^|_)id$/i.test(key) &&
    !["service_code", "service_name", "job_title", "job_work_items", "goods_items", "category_1", "category_2", "category_3", "machine_photos", "machine_video", "vehicle_image_key", "vehicle_class_key", "pickup_latitude", "pickup_longitude", "delivery_latitude", "delivery_longitude", "company_location_latitude", "company_location_longitude", "google_maps_url", "pickup_google_maps_url", "delivery_google_maps_url", "declaration_accepted"].includes(key) &&
    value !== null && value !== undefined && value !== "" && typeof value !== "object",
  );
  const successfulPrice = Number(ticket.total_amount || 0);
  const alreadyPaid = Number(ticket.advance_paid || 0);

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
            {ticket.service_subcategory_name || ticket.subcategory_name ? <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-800">{ticket.service_subcategory_name || ticket.subcategory_name}</span> : null}
            {ticket.service_sub_subcategory_name ? <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800">{ticket.service_sub_subcategory_name}</span> : null}
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
              <p className="text-[10px] text-zinc-400 mt-0.5">
                Share with engineer upon job completion
              </p>
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
                <div
                  key={s.key}
                  className="flex flex-col items-center flex-1 text-center relative z-10"
                >
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition ${
                      isPast
                        ? "bg-zinc-900 text-white"
                        : "border border-zinc-200 bg-white text-zinc-400"
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={`mt-2 text-[11px] font-medium ${
                      isCurrent
                        ? "text-blue-600 font-semibold"
                        : isPast
                          ? "text-zinc-900"
                          : "text-zinc-400"
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
            {(() => {
              const isTicketAssigned = Boolean(
                ticket.status === "accepted" ||
                ticket.status === "in_progress" ||
                ticket.status === "completed" ||
                ticket.quotations?.some((q) => q.status === "accepted"),
              );

              const visibleQuotations = isTicketAssigned
                ? (ticket.quotations?.filter((q) => q.status === "accepted")
                    .length
                    ? ticket.quotations.filter((q) => q.status === "accepted")
                    : ticket.quotations?.slice(0, 1)) || []
                : ticket.quotations || [];

              return (
                <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4 shadow-xs">
                  <div className="border-b border-zinc-100 pb-3">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                      {isTicketAssigned
                        ? "Assigned Vendor Quotation"
                        : `Vendor Quotations (${visibleQuotations.length})`}
                    </h2>
                  </div>

                  {visibleQuotations.length > 0 ? (
                    <div className="space-y-3">
                      {visibleQuotations.map((q) => {
                        const isAccepted =
                          q.status === "accepted" || isTicketAssigned;
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
                                  Quoted on{" "}
                                  {new Date(q.created_at).toLocaleDateString()}
                                </p>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-4">
                                <span className="font-heading text-lg font-bold text-zinc-900">
                                  ₹
                                  {Number(q.total_price).toLocaleString(
                                    "en-IN",
                                  )}
                                </span>

                                {!isTicketAssigned && !isAccepted && (
                                  <button
                                    onClick={() =>
                                      isJobInquiry
                                        ? handleJobInquiryPayment(
                                            q.id,
                                            "advance",
                                          )
                                        : handleAcceptQuote(q.id)
                                    }
                                    disabled={acceptingQuoteId === q.id}
                                    className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                                  >
                                    {acceptingQuoteId === q.id
                                      ? "Processing..."
                                      : isJobInquiry
                                        ? `Pay ₹${Math.round(Number(q.total_price) * 0.25).toLocaleString("en-IN")} to confirm`
                                      : isLogistics ? "Confirm and Pay" : isGoodsTicket ? "Confirm Order & Pay" : "Accept and Pay"}
                                  </button>
                                )}
                              </div>
                            </div>

                            {q.quote_breakdown?.notes && (
                              <p className="mt-2.5 text-xs text-zinc-600 border-t border-zinc-100 pt-2 italic">
                                "{q.quote_breakdown.notes}"
                              </p>
                            )}
                            {q.quote_breakdown?.required_project_datetime && (
                              <div className="mt-3 grid gap-3 border-t border-zinc-100 pt-3 text-xs sm:grid-cols-2">
                                <p className="text-zinc-600"><span className="font-semibold text-zinc-800">Project date and time: </span>{new Date(String(q.quote_breakdown.required_project_datetime)).toLocaleString()}</p>
                                {q.quote_breakdown.token_amount != null && <p className="text-zinc-600"><span className="font-semibold text-zinc-800">Token advance: </span>₹{Number(q.quote_breakdown.token_amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>}
                              </div>
                            )}
                            {q.quote_breakdown?.quote_attachment?.url && (
                              <a
                                href={q.quote_breakdown.quote_attachment.url}
                                target="_blank"
                                rel="noreferrer"
                                download={q.quote_breakdown.quote_attachment.name || true}
                                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                Download quotation / invoice attachment
                              </a>
                            )}
                            {Array.isArray(q.quote_breakdown?.items) &&
                              q.quote_breakdown.items.length > 0 && (
                                <div className="mt-3 border-t border-zinc-100 pt-3">
                                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                                    Itemized quotation
                                  </p>
                                  {q.quote_breakdown.distance_km != null && <p className="mb-2 text-xs text-zinc-600">Route distance: <strong>{Number(q.quote_breakdown.distance_km).toLocaleString("en-IN")} km</strong>{q.quote_breakdown.rate_of_trip != null && <> · Trip rate: <strong>₹{Number(q.quote_breakdown.rate_of_trip).toLocaleString("en-IN")}</strong></>}</p>}
                                  <div className="space-y-1.5">
                                    {q.quote_breakdown.items.map(
                                      (item: any, index: number) => (
                                        <div
                                          key={`${q.id}-item-${index}`}
                                          className="flex flex-wrap justify-between gap-2 text-xs text-zinc-700"
                                        >
                                          <span>
                                            {item.name}{" "}
                                            <span className="text-zinc-400">
                                              × {item.quantity}
                                              {item.unit ? ` ${item.unit}` : ""}
                                            </span>
                                            {(item.confirmed_delivery_date ||
                                              item.supplier_accepted_date ||
                                              item.remark) && (
                                              <span className="mt-1 block text-[10px] text-zinc-500">
                                                {item.confirmed_delivery_date &&
                                                  `Delivery: ${item.confirmed_delivery_date}`}
                                                {item.supplier_accepted_date &&
                                                  ` · Supplier accepted: ${item.supplier_accepted_date}`}
                                                {item.remark &&
                                                  ` · ${item.remark}`}
                                              </span>
                                            )}
                                          </span>
                                          <span className="font-medium">
                                            ₹
                                            {Number(
                                              item.amount ??
                                                Number(item.quantity) *
                                                  Number(
                                                    item.unit_price ??
                                                      item.rate,
                                                  ),
                                            ).toLocaleString("en-IN", {
                                              maximumFractionDigits: 2,
                                            })}
                                          </span>
                                        </div>
                                      ),
                                    )}
                                    {[
                                      [
                                        "Service charge",
                                        q.quote_breakdown.service_charge,
                                      ],
                                      [
                                        "Travel charge",
                                        q.quote_breakdown.travel_charge,
                                      ],
                                      [
                                        "Other charges",
                                        q.quote_breakdown.other_charge,
                                      ],
                                      [
                                        `GST (${q.quote_breakdown.gst_rate ?? 18}%)`,
                                        q.quote_breakdown.gst_amount,
                                      ],
                                    ]
                                      .filter(([, value]) => Number(value) > 0)
                                      .map(([label, value]) => (
                                        <div
                                          key={`${q.id}-${label}`}
                                          className="flex justify-between gap-2 text-xs text-zinc-500"
                                        >
                                          <span>{label}</span>
                                          <span>
                                            ₹
                                            {Number(value).toLocaleString(
                                              "en-IN",
                                              { maximumFractionDigits: 2 },
                                            )}
                                          </span>
                                        </div>
                                      ))}
                                    {q.quote_breakdown.total != null && (
                                      <div className="flex justify-between border-t border-zinc-100 pt-1.5 text-xs font-bold text-zinc-900">
                                        <span>Quotation total</span>
                                        <span>
                                          ₹
                                          {Number(
                                            q.quote_breakdown.total,
                                          ).toLocaleString("en-IN", {
                                            maximumFractionDigits: 2,
                                          })}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 py-4 text-center">
                      Broadcasting request to certified facilities. Quotations
                      will appear here.
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Specifications Details */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-3 shadow-xs">
              <div className="border-b border-zinc-100 pb-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                  Request Specifications
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {isGoodsTicket ? ([
                  ["Company / Google location", ticket.ticket_payload?.company_google_location],
                  ["Mobile number", ticket.ticket_payload?.mobile_number],
                  ["Required delivery date", ticket.ticket_payload?.delivery_date],
                  ["Order placed by", ticket.ticket_payload?.order_placed_by],
                  ["Order date and time", ticket.ticket_payload?.order_placed_at],
                ] as Array<[string, unknown]>).filter(([, value]) => value !== null && value !== undefined && value !== "").map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-3"><span className="text-[10px] uppercase font-semibold text-zinc-400">{label}</span><p className="mt-0.5 break-words text-xs font-medium text-zinc-800">{String(value)}</p></div>
                )) : isLogistics ? ([
                  ["Vehicle class", ticket.ticket_payload?.vehicle_class],
                  ["Vehicle name", ticket.ticket_payload?.vehicle_name],
                  ["Vehicle payload", ticket.ticket_payload?.vehicle_payload],
                  ["Vehicle dimensions", ticket.ticket_payload?.vehicle_dimensions],
                  ["Pickup location", ticket.ticket_payload?.pickup_address],
                  ["Pickup contact", [ticket.ticket_payload?.pickup_contact_name, ticket.ticket_payload?.pickup_contact_phone].filter(Boolean).join(" · ")],
                  ["Drop-off location", ticket.ticket_payload?.drop_address],
                  ["Drop-off contact", [ticket.ticket_payload?.drop_contact_name, ticket.ticket_payload?.drop_contact_phone].filter(Boolean).join(" · ")],
                  ["Delivery date", ticket.ticket_payload?.delivery_date],
                  ["Approximate distance", ticket.ticket_payload?.approximate_distance_km ? `${ticket.ticket_payload.approximate_distance_km} km (straight-line estimate)` : undefined],
                  ["Load description", ticket.ticket_payload?.cargo_type],
                  ["Approximate load weight", ticket.ticket_payload?.estimated_weight],
                  ["Load size", ticket.ticket_payload?.cargo_size],
                ] as Array<[string, unknown]>).filter(([, value]) => value !== null && value !== undefined && value !== "").map(([label, value]) => (
                  <div key={label} className="min-w-0 rounded-lg border border-zinc-100 bg-zinc-50/50 p-3"><span className="text-[10px] uppercase font-semibold text-zinc-400">{label}</span><p className="mt-0.5 break-words text-xs font-medium text-zinc-800 [overflow-wrap:anywhere]">{String(value)}</p></div>
                )) : displayPayloadEntries.map(([k, v]) => (
                  <div
                    key={k}
                    className={`min-w-0 rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 ${/problem|description|note|communication/i.test(k) ? "sm:col-span-2" : ""}`}
                  >
                    <span className="text-[10px] uppercase font-semibold text-zinc-400">
                      {k.replace(/_/g, " ")}
                    </span>
                    <p className="mt-0.5 break-words text-xs font-medium text-zinc-800 [overflow-wrap:anywhere]">
                      {String(v)}
                    </p>
                  </div>
                ))}
              </div>
              {isJobInquiry && requestedJobItems.length > 0 && <section className="mt-5 min-w-0 space-y-3"><h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Requested jobwork items</h3>{requestedJobItems.map((item, index) => <article key={`job-item-${index}`} className="min-w-0 rounded-lg border border-zinc-200 bg-zinc-50/60 p-4"><div className="flex min-w-0 flex-wrap items-start justify-between gap-2"><h4 className="min-w-0 break-words text-sm font-semibold text-zinc-900">{index + 1}. {String(item.item_name || `Item ${index + 1}`)}</h4><span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700">Qty {String(item.quantity ?? "—")} {String(item.unit || "")}</span></div>{item.notes ? <p className="mt-2 break-words whitespace-pre-wrap text-xs leading-relaxed text-zinc-600 [overflow-wrap:anywhere]">{String(item.notes)}</p> : null}<dl className="mt-3 grid min-w-0 gap-3 border-t border-zinc-200 pt-3 sm:grid-cols-3">{([["Material grade", item.material_grade], ["Last accepted delivery", item.last_accepted_delivery_date], ["Preferred delivery", item.preferred_delivery_date]] as Array<[string, unknown]>).map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-[10px] font-semibold uppercase text-zinc-500">{label}</dt><dd className="mt-1 break-words text-xs font-medium text-zinc-800 [overflow-wrap:anywhere]">{value ? String(value) : "—"}</dd></div>)}</dl></article>)}</section>}
              {isGoodsTicket && Array.isArray(ticket.ticket_payload?.goods_items) && ticket.ticket_payload.goods_items.length > 0 && (
                <div className="mt-5 space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Requested items</h3>
                  {ticket.ticket_payload.goods_items.map((item: Record<string, any>, index: number) => {
                    const itemId = String(item.id || `goods-item-${index}`);
                    const itemImage = ticket.documents?.find((document) => document.doc_type === "goods_item_image" && String(document.metadata?.item_id || "") === itemId);
                    return (
                      <article key={itemId} className="grid gap-4 rounded-lg border border-zinc-200 bg-zinc-50/60 p-4 sm:grid-cols-[minmax(0,1fr)_200px] sm:items-center">
                        <div><h3 className="text-sm font-semibold text-zinc-900">{index + 1}. {String(item.item_name || `Item ${index + 1}`)}</h3><p className="mt-1 text-xs text-zinc-600">Quantity: {String(item.quantity ?? "—")} {String(item.unit || "")}</p></div>
                        {itemImage ? <TicketAttachment document={itemImage} /> : <p className="text-xs text-zinc-500">No image attached to this item.</p>}
                      </article>
                    );
                  })}
                </div>
              )}
              {isLogistics && <div className="flex flex-wrap items-center gap-4">{typeof ticket.ticket_payload?.vehicle_image_url === "string" && <img src={ticket.ticket_payload.vehicle_image_url} alt={String(ticket.ticket_payload.vehicle_name || "Selected vehicle")} className="h-28 w-40 rounded-lg border border-zinc-200 bg-zinc-50 object-contain" />}{typeof ticket.ticket_payload?.pickup_google_maps_url === "string" && <a href={ticket.ticket_payload.pickup_google_maps_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-700 hover:underline">Open pickup in Google Maps</a>}{typeof ticket.ticket_payload?.delivery_google_maps_url === "string" && <a href={ticket.ticket_payload.delivery_google_maps_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-700 hover:underline">Open delivery in Google Maps</a>}</div>}
              {isGoodsTicket && ticket.ticket_payload?.google_maps_url && (
                <a
                  href={String(ticket.ticket_payload.google_maps_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-xs font-semibold text-blue-700 hover:underline"
                >
                  Open company location in Google Maps
                </a>
              )}
            </div>

            {/* Attached Files */}
            {ticket.documents?.some((document) => document.doc_type !== "goods_item_image") ? (
              <div className="min-w-0 rounded-xl border border-zinc-200 bg-white p-6 space-y-3 shadow-xs">
                <div className="border-b border-zinc-100 pb-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                    Photos and attachments ({ticket.documents.filter((document) => document.doc_type !== "goods_item_image").length})
                  </h2>
                </div>
                <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                  {ticket.documents.filter((document) => document.doc_type !== "goods_item_image").map((document) => <TicketAttachment key={document.id} document={document} />)}
                </div>
              </div>
            ) : null}
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
                  Share this 6-digit OTP with the visiting technician or driver{" "}
                  <strong>
                    only when the job is completed to your satisfaction
                  </strong>
                  . The technician enters this in their vendor app to finish the
                  ticket.
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
            {isJobInquiry &&
              ticket.status === "completed" &&
              alreadyPaid < successfulPrice * 0.99 &&
              ticket.quotations?.find((q) => q.status === "accepted") && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-emerald-950">
                    Service complete
                  </h3>
                  <p className="text-xs text-emerald-900">
                    Pay the remaining ₹
                    {Math.max(0, successfulPrice - alreadyPaid).toLocaleString(
                      "en-IN",
                    )}{" "}
                    to finish payment.
                  </p>
                  <button
                    onClick={() =>
                      handleJobInquiryPayment(
                        ticket.quotations!.find((q) => q.status === "accepted")!
                          .id,
                        "final",
                      )
                    }
                    disabled={Boolean(acceptingQuoteId)}
                    className="w-full rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    {acceptingQuoteId
                      ? "Processing..."
                      : "Pay remaining amount"}
                  </button>
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
                      <p className="text-xs font-medium text-zinc-900 capitalize">
                        {l.status}
                      </p>
                      <p className="text-[11px] text-zinc-500">{l.note}</p>
                      <span className="text-[10px] text-zinc-400">
                        {new Date(l.timestamp).toLocaleTimeString()}
                      </span>
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
