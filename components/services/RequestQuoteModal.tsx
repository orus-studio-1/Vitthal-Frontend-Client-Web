"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle, MessageSquare, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import { useServiceStore } from "@/store/serviceStore";
import type { VendorOffering } from "@/store/serviceStore";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceName: string;
  offering: VendorOffering;
};

export function RequestQuoteModal({ isOpen, onClose, serviceId, serviceName, offering }: Props) {
  const createQuotation = useServiceStore((s) => s.createQuotation);
  const [scopeOfWork, setScopeOfWork] = useState("");
  const [requestedPrice, setRequestedPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!scopeOfWork.trim()) {
      toast.error("Please describe the scope of work");
      return;
    }

    setIsSubmitting(true);

    const success = await createQuotation({
      vendorId: offering.vendor_id,
      serviceId,
      scopeOfWork: scopeOfWork.trim(),
      requestedPrice: requestedPrice.trim() || undefined,
    });

    setIsSubmitting(false);

    if (success) {
      setSubmitted(true);
      toast.success("Quotation request sent!");
    } else {
      toast.error("Failed to send quotation. Please try again.");
    }
  }

  function handleClose() {
    setSubmitted(false);
    setScopeOfWork("");
    setRequestedPrice("");
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
            <h2 className="text-base font-semibold text-zinc-900">Request a Quote</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{serviceName} · {offering.company_name}</p>
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
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <CheckCircle size={32} className="text-[#1d4ed8]" />
            </div>
            <div>
              <p className="text-base font-semibold text-zinc-900">Quotation Sent!</p>
              <p className="mt-1 text-sm text-zinc-500">
                The vendor will respond to your request. Track it in{" "}
                <a href="/services/quotations" className="text-[#1d4ed8] underline underline-offset-2">
                  My Quotations
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
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-3.5 text-xs text-blue-700">
              <p className="font-medium">How quotations work</p>
              <p className="mt-1 text-blue-600">Describe your requirements and optionally suggest a budget. The vendor will respond with their offer and you can negotiate.</p>
            </div>

            <div>
              <label htmlFor="scopeOfWork" className="block text-xs font-medium text-zinc-700 mb-1.5">
                <span className="flex items-center gap-1.5"><MessageSquare size={13} /> Scope of Work <span className="text-red-500">*</span></span>
              </label>
              <textarea
                id="scopeOfWork"
                rows={4}
                required
                value={scopeOfWork}
                onChange={(e) => setScopeOfWork(e.target.value)}
                placeholder="Describe what you need: location, timeline, quantity, quality requirements, any specific standards..."
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#1d4ed8] focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]/30 transition-colors resize-none"
              />
            </div>

            <div>
              <label htmlFor="requestedPrice" className="block text-xs font-medium text-zinc-700 mb-1.5">
                <span className="flex items-center gap-1.5"><IndianRupee size={13} /> Your Budget <span className="text-zinc-400">(optional)</span></span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">₹</span>
                <input
                  id="requestedPrice"
                  type="number"
                  min="0"
                  step="1"
                  value={requestedPrice}
                  onChange={(e) => setRequestedPrice(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border border-zinc-300 bg-white pl-7 pr-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#1d4ed8] focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]/30 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#1d4ed8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1e40af] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : "Send Quotation Request"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
