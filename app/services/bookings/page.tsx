"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronRight,
  Package,
  Star,
  Clock,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Key,
  Wrench,
  X,
  MessageSquare,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useServiceStore } from "@/store/serviceStore";
import type { ServiceBooking, ServiceQuotation } from "@/store/serviceStore";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle2 },
  in_progress: { label: "In Progress", color: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: Loader2 },
  completed: { label: "Completed", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-zinc-100 text-zinc-500 border-zinc-200", icon: X },
};

const QUOTATION_STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending_vendor:   { label: "Proposal Negotiation - Awaiting Vendor", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  vendor_offered:   { label: "Proposal Negotiation - Offer Received",  color: "bg-blue-50 text-blue-700 border-blue-200", icon: ChevronRight },
  client_countered: { label: "Proposal Negotiation - Counter Sent",    color: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: Loader2 },
  vendor_countered: { label: "Proposal Negotiation - Vendor Countered", color: "bg-purple-55 text-purple-700 border-purple-200", icon: ChevronRight },
  client_rejected:  { label: "Proposal Negotiation - Rejected by Client", color: "bg-red-50 text-red-750 border-red-250", icon: X },
  vendor_rejected:  { label: "Proposal Negotiation - Rejected by Vendor", color: "bg-red-50 text-red-750 border-red-250", icon: X },
  cancelled:        { label: "Proposal Negotiation - Cancelled",        color: "bg-zinc-100 text-zinc-500 border-zinc-200", icon: X },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "bg-zinc-100 text-zinc-600 border-zinc-200", icon: Package };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.color}`}>
      <Icon size={12} />
      {cfg.label}
    </span>
  );
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type OtpDialogProps = {
  bookingId: string;
  onClose: () => void;
};

function OtpDialog({ bookingId, onClose }: OtpDialogProps) {
  const generateOtp = useServiceStore((s) => s.generateOtp);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleGenerate() {
    setSending(true);
    const success = await generateOtp(bookingId);
    setSending(false);
    if (success) {
      setSent(true);
      toast.success("OTP sent to your registered email");
    } else {
      toast.error("Failed to generate OTP. Try again.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-zinc-900">Generate Completion OTP</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {sent ? (
            <div className="flex flex-col items-center gap-3 text-center py-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                <Key size={24} className="text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-zinc-900">OTP Sent!</p>
              <p className="text-xs text-zinc-500">Check your registered email. Share the OTP with your vendor to confirm service completion. It expires in 10 minutes.</p>
              <button onClick={onClose} className="mt-2 w-full rounded-lg bg-[#1d4ed8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1e40af] transition-colors">Close</button>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-3.5 text-xs text-amber-700">
                <p className="font-medium">How it works</p>
                <p className="mt-1 text-amber-600">An OTP will be sent to your registered email. Share it with the vendor once you are satisfied with the service to confirm completion.</p>
              </div>
              <button
                onClick={handleGenerate}
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#1d4ed8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1e40af] disabled:opacity-60 transition-colors"
              >
                {sending ? <><Loader2 size={15} className="animate-spin" /> Sending...</> : <><Key size={15} /> Generate & Send OTP</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

type ReviewDialogProps = {
  bookingId: string;
  serviceName: string;
  onClose: () => void;
  onSubmitted: () => void;
};

function ReviewDialog({ bookingId, serviceName, onClose, onSubmitted }: ReviewDialogProps) {
  const submitReview = useServiceStore((s) => s.submitReview);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { toast.error("Please select a rating"); return; }
    setIsSubmitting(true);
    const success = await submitReview({ bookingId, rating, reviewTitle: reviewTitle || undefined, reviewText: reviewText || undefined });
    setIsSubmitting(false);
    if (success) {
      toast.success("Review submitted!");
      onSubmitted();
    } else {
      toast.error("Failed to submit review. You may have already reviewed this booking.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">Leave a Review</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{serviceName}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-zinc-600">How was your experience?</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1"
                >
                  <Star
                    size={28}
                    className={star <= (hoverRating || rating) ? "fill-amber-400 text-amber-400" : "text-zinc-200"}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="reviewTitle" className="block text-xs font-medium text-zinc-700 mb-1.5">Title <span className="text-zinc-400">(optional)</span></label>
            <input id="reviewTitle" type="text" value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} placeholder="Summarise your experience" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#1d4ed8] focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]/30 transition-colors" />
          </div>
          <div>
            <label htmlFor="reviewText" className="block text-xs font-medium text-zinc-700 mb-1.5">Review <span className="text-zinc-400">(optional)</span></label>
            <textarea id="reviewText" rows={3} value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Tell others about the quality, timeliness, and professionalism..." className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#1d4ed8] focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]/30 transition-colors resize-none" />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#1d4ed8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1e40af] disabled:opacity-60 transition-colors">
            {isSubmitting ? <><Loader2 size={15} className="animate-spin" /> Submitting...</> : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
}

function BookingCard({ booking }: { booking: ServiceBooking }) {
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [hasReview, setHasReview] = useState(booking.has_review);

  const showOtpButton = booking.status === "in_progress";
  const showReviewButton = booking.status === "completed" && !hasReview;

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4 hover:border-zinc-300 hover:shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-zinc-900 text-sm">{booking.service_name}</h3>
          <p className="text-xs text-zinc-500 mt-0.5">by {booking.vendor_name}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-zinc-400 mb-0.5">Amount</p>
          <p className="font-semibold text-zinc-900">₹{parseFloat(booking.total_amount).toLocaleString("en-IN")}</p>
        </div>
        <div>
          <p className="text-zinc-400 mb-0.5">Pricing</p>
          <p className="font-medium text-zinc-700 capitalize">{booking.pricing_type}</p>
        </div>
        {booking.scheduled_start && (
          <div>
            <p className="text-zinc-400 mb-0.5 flex items-center gap-1"><CalendarDays size={10} /> Scheduled Start</p>
            <p className="font-medium text-zinc-700">{formatDate(booking.scheduled_start)}</p>
          </div>
        )}
        {booking.scheduled_end && (
          <div>
            <p className="text-zinc-400 mb-0.5 flex items-center gap-1"><CalendarDays size={10} /> Scheduled End</p>
            <p className="font-medium text-zinc-700">{formatDate(booking.scheduled_end)}</p>
          </div>
        )}
      </div>

      {booking.booking_notes && (
        <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2">
          <p className="text-xs text-zinc-500 italic">"{booking.booking_notes}"</p>
        </div>
      )}

      {(showOtpButton || showReviewButton) && (
        <div className="flex gap-2 pt-1">
          {showOtpButton && (
            <button
              onClick={() => setOtpDialogOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-[#1d4ed8] px-3 py-2 text-xs font-semibold text-[#1d4ed8] hover:bg-[#1d4ed8] hover:text-white transition-colors"
            >
              <Key size={13} /> Generate OTP
            </button>
          )}
          {showReviewButton && (
            <button
              onClick={() => setReviewDialogOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <Star size={13} /> Leave Review
            </button>
          )}
        </div>
      )}

      <p className="text-xs text-zinc-400">Booked {formatDate(booking.created_at)}</p>

      {otpDialogOpen && (
        <OtpDialog bookingId={booking.id} onClose={() => setOtpDialogOpen(false)} />
      )}
      {reviewDialogOpen && (
        <ReviewDialog
          bookingId={booking.id}
          serviceName={booking.service_name}
          onClose={() => setReviewDialogOpen(false)}
          onSubmitted={() => { setReviewDialogOpen(false); setHasReview(true); }}
        />
      )}
    </article>
  );
}

function QuotationCard({ quotation }: { quotation: ServiceQuotation }) {
  const cfg = QUOTATION_STATUS_CONFIG[quotation.status] ?? {
    label: "Proposal Negotiation",
    color: "bg-zinc-50 text-zinc-700 border-zinc-200",
    icon: Clock,
  };
  const Icon = cfg.icon;

  const price = quotation.agreed_price || quotation.requested_price;

  return (
    <article className="rounded-xl border border-dashed border-blue-200 bg-blue-50/20 p-5 space-y-4 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-zinc-900 text-sm">{quotation.service_name}</h3>
            <p className="text-xs text-zinc-500 mt-0.5">by {quotation.vendor_name}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.color}`}>
            <Icon size={12} />
            {cfg.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-zinc-400 mb-0.5">Offer Price</p>
            <p className="font-semibold text-zinc-900">
              {price ? `₹${parseFloat(price).toLocaleString("en-IN")}` : "Negotiable"}
            </p>
          </div>
          <div>
            <p className="text-zinc-400 mb-0.5">Stage</p>
            <p className="font-medium text-zinc-700">Proposal & Negotiation</p>
          </div>
        </div>

        {quotation.scope_of_work && (
          <div className="rounded-lg border border-zinc-100 bg-white/80 px-3 py-2">
            <p className="text-xs text-zinc-500 italic line-clamp-3">"{quotation.scope_of_work}"</p>
          </div>
        )}
      </div>

      <div className="space-y-3 pt-3">
        <div className="flex gap-2">
          <Link
            href="/services/quotations"
            className="flex items-center gap-1.5 rounded-lg border border-blue-600 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-600 hover:text-white transition-colors bg-white"
          >
            <MessageSquare size={13} /> View Discussion / Negotiate
          </Link>
        </div>
        <p className="text-xs text-zinc-400">Requested {formatDate(quotation.created_at)}</p>
      </div>
    </article>
  );
}

export default function MyServiceBookingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { bookings, isLoadingBookings, fetchMyBookings, quotations, isLoadingQuotations, fetchMyQuotations } = useServiceStore();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyBookings();
      fetchMyQuotations();
    }
  }, [isAuthenticated, fetchMyBookings, fetchMyQuotations]);

  const unifiedItems = [
    ...bookings.map((b) => ({
      type: "booking" as const,
      id: b.id,
      date: b.created_at,
      item: b,
    })),
    ...quotations
      .filter((q) => q.status !== "client_accepted") // skip accepted ones as they are now confirmed bookings
      .map((q) => ({
        type: "quotation" as const,
        id: q.id,
        date: q.created_at,
        item: q,
      })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
                <li className="text-zinc-800 font-medium">My Bookings</li>
              </ol>
            </nav>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">My Service Bookings</h1>
            <p className="mt-1 text-sm text-zinc-600">Track and manage your service booking requests.</p>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            {isLoadingBookings || isLoadingQuotations ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-44 animate-pulse rounded-xl border border-zinc-100 bg-zinc-50" />
                ))}
              </div>
            ) : unifiedItems.length === 0 ? (
              <div className="py-24 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
                  <Wrench size={28} className="text-zinc-400" strokeWidth={1.5} />
                </div>
                <p className="mt-4 text-lg font-medium text-zinc-700">No bookings yet</p>
                <p className="mt-1 text-sm text-zinc-500">Browse services and make your first booking.</p>
                <Link href="/services" className="mt-4 inline-block rounded-lg bg-[#1d4ed8] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1e40af] transition-colors">
                  Browse Services
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {unifiedItems.map((ui) => {
                  if (ui.type === "booking") {
                    return <BookingCard key={ui.id} booking={ui.item} />;
                  } else {
                    return <QuotationCard key={ui.id} quotation={ui.item} />;
                  }
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
