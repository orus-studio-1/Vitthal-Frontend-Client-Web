"use client";

import { useState, useEffect } from "react";
import { X, Copy, Check, Send, Mail } from "lucide-react";

interface ShareCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareId: string | null;
  cartType: "direct" | "quotation";
}

export default function ShareCartModal({
  isOpen,
  onClose,
  shareId,
  cartType,
}: ShareCartModalProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && shareId) {
      setShareUrl(`${window.location.origin}/cart/share/${shareId}`);
    }
  }, [shareId]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const isQuotation = cartType === "quotation";
  const themeColor = isQuotation ? "amber" : "blue";

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Check out this procurement cart on MTWO Groups:\n${shareUrl}`
  )}`;

  const emailUrl = `mailto:?subject=${encodeURIComponent(
    "Shared Procurement Cart - MTWO"
  )}&body=${encodeURIComponent(
    `Hello,\n\nPlease find the shared procurement cart list on MTWO here:\n${shareUrl}\n\nThank you.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${isQuotation
                  ? "bg-amber-100 text-amber-800"
                  : "bg-blue-100 text-blue-800"
                }`}
            >
              {isQuotation ? "Quotation Cart" : "Direct Order"}
            </span>
            <h3 className="mt-2 text-lg font-bold text-zinc-950">
              Share Shopping Cart
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Anyone with this link can view the items and import them into their cart.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Link Input Section */}
        <div className="mt-6">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Share Link
          </label>
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-1 pl-3 focus-within:border-zinc-400 transition-colors">
            <input
              type="text"
              readOnly
              value={shareId ? shareUrl : "Generating link..."}
              className="w-full bg-transparent text-sm text-zinc-800 outline-none select-all"
            />
            <button
              onClick={handleCopy}
              disabled={!shareId}
              className={`flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-semibold transition-all ${copied
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : isQuotation
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-700 animate-in zoom-in" />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Social Shares */}
        <div className="mt-6 border-t border-zinc-100 pt-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Quick Send
          </span>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <a
              href={shareId ? whatsappUrl : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white p-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-all active:scale-[0.98] ${!shareId ? "pointer-events-none opacity-40" : ""
                }`}
            >
              <Send size={16} className="text-emerald-500" />
              WhatsApp
            </a>
            <a
              href={shareId ? emailUrl : undefined}
              className={`flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white p-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-all active:scale-[0.98] ${!shareId ? "pointer-events-none opacity-40" : ""
                }`}
            >
              <Mail size={16} className="text-zinc-500" />
              Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
