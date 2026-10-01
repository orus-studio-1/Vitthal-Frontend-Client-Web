"use client";

import { useState } from "react";
import {
  Check,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  createHiringAccessPaymentOrder,
  verifyHiringAccessPayment,
} from "@/lib/api/hiring";

type RazorpayPaymentResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type HiringAccessModalProps = {
  open: boolean;
  onClose: () => void;
  onUnlocked: () => void | Promise<void>;
};

function loadRazorpay() {
  return new Promise<void>((resolve, reject) => {
    if ((window as any).Razorpay) {
      resolve();
      return;
    }

    const existing =
      document.querySelector<HTMLScriptElement>(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );

    if (existing) {
      if ((window as any).Razorpay) {
        resolve();
        return;
      }

      existing.addEventListener(
        "load",
        () => resolve(),
        { once: true }
      );

      existing.addEventListener(
        "error",
        () =>
          reject(
            new Error(
              "Unable to load payment checkout."
            )
          ),
        { once: true }
      );

      return;
    }

    const script =
      document.createElement("script");

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.async = true;

    script.onload = () => resolve();

    script.onerror = () =>
      reject(
        new Error(
          "Unable to load payment checkout."
        )
      );

    document.body.appendChild(script);
  });
}

export default function HiringAccessModal({
  open,
  onClose,
  onUnlocked,
}: HiringAccessModalProps) {
  const [paying, setPaying] =
    useState(false);

  if (!open) {
    return null;
  }

  async function handlePayment() {
    if (paying) return;

    try {
      setPaying(true);

      await loadRazorpay();

      const order =
        await createHiringAccessPaymentOrder();

      /*
       * Backend may detect that this user
       * has already purchased access.
       */
      if (order.alreadyUnlocked) {
        toast.success(
          "Hiring Access is already unlocked."
        );

        await onUnlocked();
        return;
      }

      if (
        !order.keyId ||
        !order.razorpayOrderId
      ) {
        throw new Error(
          "Unable to create payment order."
        );
      }

      const checkout = new (
        window as any
      ).Razorpay({
        key: order.keyId,

        amount: order.amount,

        currency:
          order.currency || "INR",

        name: "MTWO Groups",

        description:
          "One-time Hiring Access Pass",

        order_id:
          order.razorpayOrderId,

        handler: async (
          payment: RazorpayPaymentResponse
        ) => {
          try {
            await verifyHiringAccessPayment(
              payment
            );

            toast.success(
              "Hiring Access unlocked successfully."
            );

            await onUnlocked();
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "Unable to verify payment."
            );
          } finally {
            setPaying(false);
          }
        },

        modal: {
          ondismiss: () => {
            setPaying(false);
          },
        },

        theme: {
          color: "#2563eb",
        },
      });

      checkout.on(
        "payment.failed",
        (response: any) => {
          setPaying(false);

          toast.error(
            response?.error?.description ||
              "Payment failed. Please try again."
          );
        }
      );

      checkout.open();
    } catch (error) {
      setPaying(false);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to start payment."
      );
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-[2px]">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-100 px-6 py-5">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
              <LockKeyhole className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h2 className="font-heading text-lg font-semibold text-zinc-900">
                Unlock Hiring Access
              </h2>

              <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                One payment unlocks the
                hiring portal for your
                account.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={paying}
            aria-label="Close"
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          {/* Price */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-5 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">
              One-time access fee
            </p>

            <p className="mt-2 font-heading text-3xl font-semibold text-zinc-900">
              ₹100
            </p>

            <p className="mt-1 text-[11px] text-zinc-500">
              No subscription · No recurring
              charge
            </p>
          </div>

          {/* Benefits */}
          <div className="mt-5 space-y-3">
            {[
              "View complete verified worker profiles",
              "Access worker skills and professional details",
              "Send hiring requests",
              "Chat and negotiate after worker acceptance",
              "Access applies to all available workers",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-2.5"
              >
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                  <Check className="h-3 w-3 text-emerald-600" />
                </div>

                <p className="text-xs leading-relaxed text-zinc-600">
                  {item}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-start gap-2 rounded-lg bg-zinc-50 p-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />

            <p className="text-[11px] leading-relaxed text-zinc-500">
              Payment is securely processed
              through Razorpay. Hiring Access
              is linked to your client
              account.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void handlePayment()
            }
            disabled={paying}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {paying && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}

            {paying
              ? "Opening secure payment..."
              : "Pay ₹100 & Unlock"}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={paying}
            className="mt-2 w-full rounded-lg px-4 py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-50 disabled:opacity-50"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}