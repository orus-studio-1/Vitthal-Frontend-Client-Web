"use client";

import { useState } from "react";
import { X, CalendarDays, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useServiceStore } from "@/store/serviceStore";
import type { VendorOffering } from "@/store/serviceStore";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  offering: VendorOffering;
  serviceName: string;
};

const PRICING_LABELS: Record<string, string> = {
  hourly: "per hour",
  flat: "flat fee",
  project: "per project",
  milestone: "milestone-based",
};

export function BookServiceModal({ isOpen, onClose, offering, serviceName }: Props) {
  const bookService = useServiceStore((s) => s.bookService);
  const [scheduledStart, setScheduledStart] = useState("");
  const [scheduledEnd, setScheduledEnd] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    const success = await bookService({
      vendorServiceId: offering.vendor_service_id,
      scheduledStart: scheduledStart || undefined,
      scheduledEnd: scheduledEnd || undefined,
      bookingNotes: bookingNotes || undefined,
    });

    setIsSubmitting(false);

    if (success) {
      setSubmitted(true);
      toast.success("Booking request submitted successfully!");
    } else {
      toast.error("Failed to create booking. Please try again.");
    }
  }

  function handleClose() {
    setSubmitted(false);
    setScheduledStart("");
    setScheduledEnd("");
    setBookingNotes("");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Book Service</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{serviceName}</p>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-base font-semibold text-zinc-900">Booking Requested!</p>
              <p className="mt-1 text-sm text-zinc-500">
                Your booking is pending confirmation from the vendor.
                You can track it in{" "}
                <a href="/services/bookings" className="text-[#1d4ed8] underline underline-offset-2">
                  My Bookings
                </a>.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="mt-2 w-full rounded-lg bg-[#1d4ed8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1e40af] transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Vendor</span>
                <span className="font-medium text-zinc-900">{offering.company_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Price</span>
                <span className="font-semibold text-zinc-900">
                  ₹{parseFloat(offering.price).toLocaleString("en-IN")}
                  {" "}
                  <span className="text-xs font-normal text-zinc-500">
                    {PRICING_LABELS[offering.pricing_type] ?? offering.pricing_type}
                  </span>
                </span>
              </div>
              {offering.moq && offering.moq > 1 && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Minimum</span>
                  <span className="font-medium text-zinc-900">{offering.moq} units</span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="scheduledStart" className="block text-xs font-medium text-zinc-700 mb-1.5">
                <span className="flex items-center gap-1.5"><CalendarDays size={13} /> Preferred Start Date</span>
              </label>
              <input
                id="scheduledStart"
                type="datetime-local"
                value={scheduledStart}
                onChange={(e) => setScheduledStart(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#1d4ed8] focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]/30 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="scheduledEnd" className="block text-xs font-medium text-zinc-700 mb-1.5">
                <span className="flex items-center gap-1.5"><CalendarDays size={13} /> Preferred End Date</span>
              </label>
              <input
                id="scheduledEnd"
                type="datetime-local"
                value={scheduledEnd}
                onChange={(e) => setScheduledEnd(e.target.value)}
                min={scheduledStart || undefined}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#1d4ed8] focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]/30 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="bookingNotes" className="block text-xs font-medium text-zinc-700 mb-1.5">
                Notes <span className="text-zinc-400">(optional)</span>
              </label>
              <textarea
                id="bookingNotes"
                rows={3}
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="Describe any specific requirements, site details, or instructions..."
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#1d4ed8] focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]/30 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#1d4ed8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1e40af] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : "Confirm Booking Request"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
