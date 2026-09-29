"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { createHirePaymentOrder, reconcileHirePayment, verifyHirePayment } from "@/lib/api/hiring";
import type { HireConversation } from "@/lib/api/hireConversation";
import { hireAmount } from "./HireProgress";

type PaymentResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type Checkout = { open: () => void; on: (event: string, callback: (event: { error?: { description?: string } }) => void) => void };
type CheckoutOptions = {
  key: string; amount: number; currency: string; name: string; description: string; order_id: string;
  handler: (payment: PaymentResponse) => Promise<void>;
  modal: { ondismiss: () => void }; theme: { color: string };
};
type PaymentWindow = Window & { Razorpay?: new (options: CheckoutOptions) => Checkout };
let checkoutScript: Promise<void> | null = null;

function loadCheckout() {
  if ((window as PaymentWindow).Razorpay) return Promise.resolve();
  if (checkoutScript) return checkoutScript;
  checkoutScript = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => fail(), 20000);
    function fail() {
      window.clearTimeout(timeout);
      script.remove();
      checkoutScript = null;
      reject(new Error("Unable to load payment checkout. Please try again."));
    }
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => { window.clearTimeout(timeout); resolve(); };
    script.onerror = fail;
    document.body.appendChild(script);
  });
  return checkoutScript;
}

export default function HirePaymentActions({ request, onUpdated }: { request: HireConversation; onUpdated: () => Promise<void> }) {
  const [busy, setBusy] = useState<"checkout" | "check" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const verifying = useRef(false);
  const canPay = request.status === "accepted" && request.negotiation_status === "agreed" && Number(request.agreed_amount) > 0 && !["active", "completed"].includes(request.contract_status || "");
  if (!canPay) return null;

  function finish() { inFlight.current = false; setBusy(null); }
  function showError(cause: unknown) {
    const message = cause instanceof Error ? cause.message : "Unable to process payment.";
    setError(message);
    toast.error(message);
  }

  async function checkPayment() {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy("check");
    setError(null);
    try {
      const result = await reconcileHirePayment(request.id);
      await onUpdated();
      if (result.status === "paid") toast.success("Payment confirmed. Your hire is locked.");
      else toast.info("Payment has not been confirmed yet. If your account was debited, check again shortly.");
    } catch (cause) { showError(cause); }
    finally { finish(); }
  }

  async function pay() {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy("checkout");
    setError(null);
    try {
      if (request.contract_status === "payment_pending") {
        const result = await reconcileHirePayment(request.id);
        if (result.status === "paid") {
          toast.success("Payment confirmed. Your hire is locked.");
          await onUpdated();
          finish();
          return;
        }
      }
      await loadCheckout();
      const order = await createHirePaymentOrder(request.id);
      const Razorpay = (window as PaymentWindow).Razorpay;
      if (!Razorpay) throw new Error("Payment checkout could not be loaded.");
      const checkout = new Razorpay({
        key: order.keyId, amount: order.amount, currency: order.currency,
        name: "MTWO Groups", description: `Hire ${request.candidate_name || "worker"} at the agreed amount`,
        order_id: order.razorpayOrderId,
        handler: async (payment) => {
          verifying.current = true;
          try {
            await verifyHirePayment(request.id, payment);
            toast.success("Payment confirmed. Your hire is locked.");
            await onUpdated();
          } catch (cause) {
            showError(cause);
            setError("Payment confirmation is pending. Use Check payment status before trying another payment.");
          } finally { verifying.current = false; finish(); }
        },
        modal: { ondismiss: () => { if (!verifying.current) finish(); void onUpdated().catch(showError); } },
        theme: { color: "#2563eb" },
      });
      checkout.on("payment.failed", (event) => {
        showError(new Error(event.error?.description || "Payment failed. Retry in checkout or close it to try later."));
      });
      checkout.open();
      void onUpdated().catch(showError);
    } catch (cause) { showError(cause); finish(); }
  }

  return <div className="space-y-2">
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => void pay()} disabled={!!busy} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white disabled:opacity-50">{busy === "checkout" ? "Payment in progress…" : `${request.contract_status === "payment_pending" ? "Resume payment" : "Pay & lock hire"} · ${hireAmount(request.agreed_amount)}`}</button>
      <button type="button" onClick={() => void checkPayment()} disabled={!!busy} className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 disabled:opacity-50">{busy === "check" ? "Checking…" : "Check payment status"}</button>
    </div>
    {error && <p role="alert" className="max-w-xl text-xs text-red-700">{error}</p>}
  </div>;
}
