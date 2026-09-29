import { Check, LockKeyhole } from "lucide-react";
import type { HireConversation } from "@/lib/api/hireConversation";

export function hireAmount(value: string | number | null | undefined) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value || 0));
}

export function hireStage(request: HireConversation) {
  if (request.status === "rejected") return "Request declined";
  if (request.status === "cancelled") return "Request cancelled";
  if (request.contract_status === "completed") return "Completed";
  if (request.client_completed_at || request.worker_completed_at) return "Awaiting completion confirmation";
  if (request.contract_status === "active" || request.negotiation_status === "paid") return "Hire locked · Work in progress";
  if (request.contract_status === "payment_pending") return "Payment pending";
  if (request.negotiation_status === "agreed") return "Amount locked · Awaiting payment";
  if (request.negotiation_status === "proposed") return "Offer awaiting acceptance";
  if (request.status === "accepted") return "Ready to negotiate";
  return "Awaiting worker response";
}

function dateLabel(value?: string | null) {
  return value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "";
}

export default function HireProgress({ request, compact = false }: { request: HireConversation; compact?: boolean }) {
  const completed = request.contract_status === "completed";
  const paid = completed || request.negotiation_status === "paid" || request.contract_status === "active";
  const agreed = paid || request.negotiation_status === "agreed";
  const closed = ["rejected", "cancelled"].includes(request.status);
  const steps = [
    { label: "Requested", done: true, at: request.created_at },
    { label: "Worker accepted", done: request.status === "accepted" || paid, at: request.reviewed_at },
    { label: "Amount agreed", done: agreed, at: request.agreed_at },
    { label: "Paid · Hire locked", done: paid, at: request.paid_at || request.payment?.paid_at },
    { label: "Completed", done: completed, at: request.completed_at },
  ];

  return (
    <div className={compact ? "space-y-3" : "rounded-xl border border-zinc-200 bg-white p-5 shadow-xs"}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={`text-xs font-semibold ${closed ? "text-red-700" : completed ? "text-emerald-700" : "text-blue-700"}`}>{hireStage(request)}</p>
        {agreed && <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-800"><LockKeyhole className="h-3.5 w-3.5" /> {hireAmount(request.agreed_amount)}</span>}
      </div>
      {!closed && <ol aria-label="Hiring progress" className={`grid gap-3 ${compact ? "grid-cols-2 sm:grid-cols-5" : "mt-5 grid-cols-2 sm:grid-cols-5"}`}>
        {steps.map((step) => (
          <li key={step.label} className={`border-t-2 pt-2 ${step.done ? "border-emerald-500" : "border-zinc-200"}`}>
            <span className={`flex items-center gap-1 text-[11px] font-medium ${step.done ? "text-emerald-800" : "text-zinc-500"}`}>{step.done && <Check aria-hidden="true" className="h-3 w-3 shrink-0" />}{step.label}</span>
            {!compact && step.done && step.at && <p className="mt-1 text-[10px] text-zinc-500">{dateLabel(step.at)}</p>}
          </li>
        ))}
      </ol>}
      {!compact && <div className="mt-4 space-y-2 text-xs leading-relaxed text-zinc-600">
        {closed ? <p>{request.admin_notes || "This request is closed. You can send a new request from the talent directory."}</p>
          : completed ? <p>Both parties confirmed that the work is complete.</p>
          : paid ? <p>Your hire is locked at the agreed amount. When the work is finished, both client and worker must confirm completion.</p>
          : request.contract_status === "payment_pending" ? <p>Checkout has started and this worker is reserved for this request. Resume payment or check its status to confirm the hire.</p>
          : agreed ? <p>Both parties agreed to this amount. The client must pay {hireAmount(request.agreed_amount)} to lock the hire and start the contract.</p>
          : request.status === "accepted" ? <p>Discuss the work, schedule and terms in chat. Either party can make an offer; the other party accepts to lock the amount.</p>
          : <p>The worker needs to accept your request before you can chat and agree on an amount.</p>}
        {paid && <div className="grid gap-2 rounded-lg bg-zinc-50 p-3 sm:grid-cols-2">
          <p>Client completion: <strong>{request.client_completed_at ? dateLabel(request.client_completed_at) : "Awaiting confirmation"}</strong></p>
          <p>Worker completion: <strong>{request.worker_completed_at ? dateLabel(request.worker_completed_at) : "Awaiting confirmation"}</strong></p>
        </div>}
        {request.payment?.razorpay_payment_id && <p className="break-all text-[11px] text-zinc-500">Payment reference: {request.payment.razorpay_payment_id}</p>}
      </div>}
    </div>
  );
}
