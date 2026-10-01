// "use client";

// import { useEffect, useState } from "react";
// import { CreditCard, Loader2 } from "lucide-react";
// import { fetchWorkerPaymentHistory, type WorkerPayment } from "@/lib/api/worker";
// import { useAuthStore } from "@/store/authStore";

// export default function WorkerPaymentsPage() {
//   const { user, isLoading: authLoading, fetchUser } = useAuthStore();
//   const [payments, setPayments] = useState<WorkerPayment[]>([]);
//   const [loading, setLoading] = useState(true);
//   useEffect(() => { void fetchUser("worker"); }, [fetchUser]);
//   useEffect(() => { if (user?.role === "worker") fetchWorkerPaymentHistory().then(setPayments).finally(() => setLoading(false)); }, [user?.role]);
//   if (authLoading || loading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-blue-600" /></div>;
//   return (
//     <main className="mx-auto w-full max-w-5xl overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
//       <div className="flex items-start gap-3"><CreditCard className="mt-1 h-5 w-5 shrink-0 text-blue-600" /><div className="min-w-0"><h2 className="font-heading text-2xl font-semibold text-zinc-900">Payments</h2><p className="mt-1 max-w-xl text-xs leading-relaxed text-zinc-500">Review earnings and transaction history from your contracts.</p></div></div>
//       <section className="mt-6 divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white px-5 shadow-xs">{payments.length === 0 ? <div className="p-10 text-center"><CreditCard className="mx-auto h-8 w-8 text-zinc-300" /><h3 className="mt-3 text-sm font-semibold text-zinc-900">No transactions yet</h3><p className="mt-1 text-xs text-zinc-500">Payment history will appear here after a completed worker contract.</p></div> : payments.map((payment) => <div key={payment.id} className="flex items-center justify-between gap-4 py-5"><div><p className="text-sm font-medium text-zinc-900">{payment.client_name || "Client payment"}</p><p className="mt-1 text-xs text-zinc-500">{new Date(payment.created_at).toLocaleDateString()} · {payment.payment_method}</p></div><div className="text-right"><p className="text-sm font-semibold text-zinc-900">₹{Number(payment.amount).toLocaleString("en-IN")}</p><span className="text-[10px] font-semibold uppercase text-emerald-700">{payment.status}</span></div></div>)}</section>
//     </main>
//   );
// }

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  IndianRupee,
  Loader2,
  ReceiptText,
  Clock3,
} from "lucide-react";
import { toast } from "sonner";

import {
  fetchWorkerPaymentHistory,
  type WorkerPayment,
} from "@/lib/api/worker";

import { useAuthStore } from "@/store/authStore";

function formatAmount(value: string | number | null | undefined) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function paymentStatusClasses(status: string) {
  const normalized = status?.toLowerCase();

  if (
    normalized === "successful" ||
    normalized === "paid" ||
    normalized === "completed"
  ) {
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  }

  if (
    normalized === "failed" ||
    normalized === "cancelled" ||
    normalized === "rejected"
  ) {
    return "bg-red-50 text-red-700 border-red-100";
  }

  return "bg-amber-50 text-amber-700 border-amber-100";
}

function isSuccessfulPayment(status: string) {
  return ["successful", "paid", "completed"].includes(
    String(status || "").toLowerCase()
  );
}

export default function WorkerPaymentsPage() {
  const {
    user,
    isLoading: authLoading,
    fetchUser,
  } = useAuthStore();

  const [payments, setPayments] = useState<WorkerPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchUser("worker");
  }, [fetchUser]);

  useEffect(() => {
    if (user?.role !== "worker") return;

    async function loadPayments() {
      try {
        setLoading(true);

        const data = await fetchWorkerPaymentHistory();

        setPayments(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load payment history."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadPayments();
  }, [user?.role]);

  const summary = useMemo(() => {
    const totalReceived = payments
      .filter((payment) => isSuccessfulPayment(payment.status))
      .reduce(
        (total, payment) =>
          total + Number(payment.amount || 0),
        0
      );

    const pendingAmount = payments
      .filter((payment) => !isSuccessfulPayment(payment.status))
      .reduce(
        (total, payment) =>
          total + Number(payment.amount || 0),
        0
      );

    const successfulCount = payments.filter((payment) =>
      isSuccessfulPayment(payment.status)
    ).length;

    return {
      totalReceived,
      pendingAmount,
      successfulCount,
    };
  }, [payments]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
      </div>
    );
  }

  if (user?.role !== "worker") {
    return (
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <CreditCard className="mx-auto h-8 w-8 text-zinc-300" />

        <h1 className="mt-4 font-heading text-xl font-semibold text-zinc-900">
          Worker account required
        </h1>

        <p className="mt-2 text-xs leading-relaxed text-zinc-500">
          Sign in using your worker account to view hiring payments.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
          <CreditCard className="h-5 w-5 text-blue-600" />
        </div>

        <div>
          <h1 className="font-heading text-2xl font-semibold text-zinc-900">
            Hiring Payments
          </h1>

          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-500">
            Track payments recorded against your hiring contracts.
          </p>
        </div>
      </div>

      {/* Summary */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Payments received
              </p>

              <p className="mt-2 font-heading text-2xl font-semibold text-zinc-900">
                {formatAmount(summary.totalReceived)}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <IndianRupee className="h-4 w-4 text-emerald-700" />
            </div>
          </div>

          <p className="mt-3 text-[11px] text-zinc-500">
            Total successful hiring payments.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Pending
              </p>

              <p className="mt-2 font-heading text-2xl font-semibold text-zinc-900">
                {formatAmount(summary.pendingAmount)}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <Clock3 className="h-4 w-4 text-amber-700" />
            </div>
          </div>

          <p className="mt-3 text-[11px] text-zinc-500">
            Payments that have not been confirmed yet.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Successful contracts
              </p>

              <p className="mt-2 font-heading text-2xl font-semibold text-zinc-900">
                {summary.successfulCount}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100">
              <ReceiptText className="h-4 w-4 text-zinc-700" />
            </div>
          </div>

          <p className="mt-3 text-[11px] text-zinc-500">
            Confirmed hiring payment records.
          </p>
        </div>
      </section>

      {/* Transactions */}
      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">
              Transaction history
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              {payments.length}{" "}
              {payments.length === 1
                ? "payment record"
                : "payment records"}
            </p>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-xs">
              <CreditCard className="h-5 w-5 text-zinc-300" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-zinc-900">
              No hiring payments yet
            </h3>

            <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-zinc-500">
              Payment records will appear here when a client completes
              payment for an agreed hiring contract.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <article
                key={payment.id}
                className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs transition hover:border-zinc-300"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  {/* Client */}
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      Hiring client
                    </p>

                    <h3 className="mt-1 truncate text-sm font-semibold text-zinc-900">
                      {payment.client_name || "Client"}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
                      <span>{formatDate(payment.created_at)}</span>

                      <span className="hidden sm:inline">•</span>

                      <span className="capitalize">
                        {payment.payment_method
                          ? payment.payment_method.replace(/_/g, " ")
                          : "Payment"}
                      </span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex shrink-0 items-center justify-between gap-5 sm:block sm:text-right">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        Amount
                      </p>

                      <p className="mt-1 font-heading text-lg font-semibold text-zinc-900">
                        {formatAmount(payment.amount)}
                      </p>
                    </div>

                    <span
                      className={`mt-2 inline-flex rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${paymentStatusClasses(
                        payment.status
                      )}`}
                    >
                      {payment.status?.replace(/_/g, " ") || "Pending"}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}