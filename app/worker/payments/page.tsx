// "use client";

// import { useEffect, useMemo, useState } from "react";
// import {
//   CreditCard,
//   IndianRupee,
//   Loader2,
//   ReceiptText,
//   Clock3,
// } from "lucide-react";
// import { toast } from "sonner";

// import {
//   fetchWorkerPaymentHistory,
//   type WorkerPayment,
// } from "@/lib/api/worker";

// import { useAuthStore } from "@/store/authStore";

// function formatAmount(value: string | number | null | undefined) {
//   return new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 2,
//   }).format(Number(value || 0));
// }

// function formatDate(value: string) {
//   return new Date(value).toLocaleString("en-IN", {
//     dateStyle: "medium",
//     timeStyle: "short",
//   });
// }

// function paymentStatusClasses(status: string) {
//   const normalized = status?.toLowerCase();

//   if (
//     normalized === "successful" ||
//     normalized === "paid" ||
//     normalized === "completed"
//   ) {
//     return "bg-emerald-50 text-emerald-700 border-emerald-100";
//   }

//   if (
//     normalized === "failed" ||
//     normalized === "cancelled" ||
//     normalized === "rejected"
//   ) {
//     return "bg-red-50 text-red-700 border-red-100";
//   }

//   return "bg-amber-50 text-amber-700 border-amber-100";
// }

// function isSuccessfulPayment(status: string) {
//   return ["successful", "paid", "completed"].includes(
//     String(status || "").toLowerCase()
//   );
// }

// export default function WorkerPaymentsPage() {
//   const {
//     user,
//     isLoading: authLoading,
//     fetchUser,
//   } = useAuthStore();

//   const [payments, setPayments] = useState<WorkerPayment[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     void fetchUser("worker");
//   }, [fetchUser]);

//   useEffect(() => {
//     if (user?.role !== "worker") return;

//     async function loadPayments() {
//       try {
//         setLoading(true);

//         const data = await fetchWorkerPaymentHistory();

//         setPayments(Array.isArray(data) ? data : []);
//       } catch (error) {
//         toast.error(
//           error instanceof Error
//             ? error.message
//             : "Unable to load payment history."
//         );
//       } finally {
//         setLoading(false);
//       }
//     }

//     void loadPayments();
//   }, [user?.role]);

//   const summary = useMemo(() => {
//     const totalReceived = payments
//       .filter((payment) => isSuccessfulPayment(payment.status))
//       .reduce(
//         (total, payment) =>
//           total + Number(payment.amount || 0),
//         0
//       );

//     const pendingAmount = payments
//       .filter((payment) => !isSuccessfulPayment(payment.status))
//       .reduce(
//         (total, payment) =>
//           total + Number(payment.amount || 0),
//         0
//       );

//     const successfulCount = payments.filter((payment) =>
//       isSuccessfulPayment(payment.status)
//     ).length;

//     return {
//       totalReceived,
//       pendingAmount,
//       successfulCount,
//     };
//   }, [payments]);

//   if (authLoading || loading) {
//     return (
//       <div className="flex min-h-[50vh] items-center justify-center">
//         <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
//       </div>
//     );
//   }

//   if (user?.role !== "worker") {
//     return (
//       <main className="mx-auto max-w-md px-4 py-20 text-center">
//         <CreditCard className="mx-auto h-8 w-8 text-zinc-300" />

//         <h1 className="mt-4 font-heading text-xl font-semibold text-zinc-900">
//           Worker account required
//         </h1>

//         <p className="mt-2 text-xs leading-relaxed text-zinc-500">
//           Sign in using your worker account to view hiring payments.
//         </p>
//       </main>
//     );
//   }

//   return (
//     <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
//       {/* Header */}
//       <div className="flex items-start gap-3">
//         <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
//           <CreditCard className="h-5 w-5 text-blue-600" />
//         </div>

//         <div>
//           <h1 className="font-heading text-2xl font-semibold text-zinc-900">
//             Hiring Payments
//           </h1>

//           <p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-500">
//             Track payments recorded against your hiring contracts.
//           </p>
//         </div>
//       </div>

//       {/* Summary */}
//       <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//         <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
//                 Payments received
//               </p>

//               <p className="mt-2 font-heading text-2xl font-semibold text-zinc-900">
//                 {formatAmount(summary.totalReceived)}
//               </p>
//             </div>

//             <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
//               <IndianRupee className="h-4 w-4 text-emerald-700" />
//             </div>
//           </div>

//           <p className="mt-3 text-[11px] text-zinc-500">
//             Total successful hiring payments.
//           </p>
//         </div>

//         <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
//                 Pending
//               </p>

//               <p className="mt-2 font-heading text-2xl font-semibold text-zinc-900">
//                 {formatAmount(summary.pendingAmount)}
//               </p>
//             </div>

//             <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
//               <Clock3 className="h-4 w-4 text-amber-700" />
//             </div>
//           </div>

//           <p className="mt-3 text-[11px] text-zinc-500">
//             Payments that have not been confirmed yet.
//           </p>
//         </div>

//         <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs sm:col-span-2 lg:col-span-1">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
//                 Successful contracts
//               </p>

//               <p className="mt-2 font-heading text-2xl font-semibold text-zinc-900">
//                 {summary.successfulCount}
//               </p>
//             </div>

//             <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100">
//               <ReceiptText className="h-4 w-4 text-zinc-700" />
//             </div>
//           </div>

//           <p className="mt-3 text-[11px] text-zinc-500">
//             Confirmed hiring payment records.
//           </p>
//         </div>
//       </section>

//       {/* Transactions */}
//       <section className="mt-8">
//         <div className="mb-4 flex items-end justify-between gap-4">
//           <div>
//             <h2 className="text-sm font-semibold text-zinc-900">
//               Transaction history
//             </h2>

//             <p className="mt-1 text-xs text-zinc-500">
//               {payments.length}{" "}
//               {payments.length === 1
//                 ? "payment record"
//                 : "payment records"}
//             </p>
//           </div>
//         </div>

//         {payments.length === 0 ? (
//           <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-14 text-center">
//             <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-xs">
//               <CreditCard className="h-5 w-5 text-zinc-300" />
//             </div>

//             <h3 className="mt-4 text-sm font-semibold text-zinc-900">
//               No hiring payments yet
//             </h3>

//             <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-zinc-500">
//               Payment records will appear here when a client completes
//               payment for an agreed hiring contract.
//             </p>
//           </div>
//         ) : (
//           <div className="space-y-3">
//             {payments.map((payment) => (
//               <article
//                 key={payment.id}
//                 className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs transition hover:border-zinc-300"
//               >
//                 <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
//                   {/* Client */}
//                   <div className="min-w-0">
//                     <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
//                       Hiring client
//                     </p>

//                     <h3 className="mt-1 truncate text-sm font-semibold text-zinc-900">
//                       {payment.client_name || "Client"}
//                     </h3>

//                     <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
//                       <span>{formatDate(payment.created_at)}</span>

//                       <span className="hidden sm:inline">•</span>

//                       <span className="capitalize">
//                         {payment.payment_method
//                           ? payment.payment_method.replace(/_/g, " ")
//                           : "Payment"}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Amount */}
//                   <div className="flex shrink-0 items-center justify-between gap-5 sm:block sm:text-right">
//                     <div>
//                       <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
//                         Amount
//                       </p>

//                       <p className="mt-1 font-heading text-lg font-semibold text-zinc-900">
//                         {formatAmount(payment.amount)}
//                       </p>
//                     </div>

//                     <span
//                       className={`mt-2 inline-flex rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${paymentStatusClasses(
//                         payment.status
//                       )}`}
//                     >
//                       {payment.status?.replace(/_/g, " ") || "Pending"}
//                     </span>
//                   </div>
//                 </div>
//               </article>
//             ))}
//           </div>
//         )}
//       </section>
//     </main>
//   );
// }

"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import type { FormEvent } from "react";

import Link from "next/link";

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  ExternalLink,
  IndianRupee,
  Landmark,
  Loader2,
  ReceiptText,
  Search,
  TrendingUp,
  Users,
  WalletCards,
  Upload,
} from "lucide-react";

import { toast } from "sonner";

import {
  fetchWorkerPayoutBankDetails,
  fetchWorkerPayoutEligibility,
  fetchWorkerPaymentHistory,
  requestWorkerPayout,
  saveWorkerPayoutBankDetails,
  type WorkerPayoutBankDetails,
  type WorkerPayoutEligibility,
  type WorkerPayment,
} from "@/lib/api/worker";

import { useAuthStore } from "@/store/authStore";

type PeriodFilter =
  | "all"
  | "30d"
  | "90d"
  | "year";

type StatusFilter =
  | "all"
  | "successful"
  | "pending"
  | "failed";

type SortFilter =
  | "newest"
  | "oldest"
  | "highest"
  | "lowest";

function formatAmount(
  value:
    | string
    | number
    | null
    | undefined
) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(
    Number(value || 0)
  );
}

function formatDate(
  value?:
    | string
    | null
) {
  if (!value) return "—";

  return new Date(
    value
  ).toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

function formatShortDate(
  value?:
    | string
    | null
) {
  if (!value) return "—";

  return new Date(
    value
  ).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function normalizeStatus(
  status?: string | null
) {
  return String(
    status || ""
  ).toLowerCase();
}

function isSuccessfulPayment(
  status?: string | null
) {
  return [
    "successful",
    "paid",
    "completed",
  ].includes(
    normalizeStatus(status)
  );
}

function isFailedPayment(
  status?: string | null
) {
  return [
    "failed",
    "cancelled",
    "rejected",
  ].includes(
    normalizeStatus(status)
  );
}

function paymentStatusClasses(
  status?: string | null
) {
  if (
    isSuccessfulPayment(status)
  ) {
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  }

  if (
    isFailedPayment(status)
  ) {
    return "border-red-100 bg-red-50 text-red-700";
  }

  return "border-amber-100 bg-amber-50 text-amber-700";
}

function contractStatusClasses(
  status?: string | null
) {
  const normalized =
    normalizeStatus(status);

  if (
    normalized ===
    "completed"
  ) {
    return "bg-zinc-100 text-zinc-600";
  }

  if (
    normalized ===
    "active"
  ) {
    return "bg-blue-50 text-blue-700";
  }

  if (
    normalized ===
      "payment_pending" ||
    normalized ===
      "pending_payment"
  ) {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-zinc-100 text-zinc-600";
}

function getJobTitle(
  payment: WorkerPayment
) {
  const value =
    payment
      .request_details
      ?.job_title;

  return typeof value ===
    "string" &&
    value.trim()
    ? value
    : "Hiring contract";
}

function getMonthKey(
  date: Date
) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

function getLastSixMonths() {
  const result: {
    key: string;
    label: string;
  }[] = [];

  const now = new Date();

  for (
    let offset = 5;
    offset >= 0;
    offset--
  ) {
    const date =
      new Date(
        now.getFullYear(),
        now.getMonth() -
          offset,
        1
      );

    result.push({
      key: getMonthKey(
        date
      ),

      label:
        date.toLocaleDateString(
          "en-IN",
          {
            month: "short",
          }
        ),
    });
  }

  return result;
}

function percentageChange(
  current: number,
  previous: number
) {
  if (
    previous === 0
  ) {
    return current > 0
      ? 100
      : 0;
  }

  return (
    ((current -
      previous) /
      previous) *
    100
  );
}

export default function WorkerPaymentsPage() {
  const {
    user,
    isLoading:
      authLoading,
    fetchUser,
  } = useAuthStore();

  const [
    payments,
    setPayments,
  ] =
    useState<
      WorkerPayment[]
    >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [payoutContracts, setPayoutContracts] = useState<WorkerPayoutEligibility[]>([]);
  const [payoutBankDetails, setPayoutBankDetails] = useState<WorkerPayoutBankDetails | null>(null);
  const [payoutBankForm, setPayoutBankForm] = useState({ bankName: "", accountHolderName: "", accountNumber: "", ifscCode: "", upiId: "" });
  const [cancelledCheque, setCancelledCheque] = useState<File | null>(null);
  const [bankFormOpen, setBankFormOpen] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(true);
  const [bankSaving, setBankSaving] = useState(false);
  const [payoutRequestingId, setPayoutRequestingId] = useState<string | null>(null);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<StatusFilter>(
      "all"
    );

  const [
    periodFilter,
    setPeriodFilter,
  ] =
    useState<PeriodFilter>(
      "all"
    );

  const [
    sortFilter,
    setSortFilter,
  ] =
    useState<SortFilter>(
      "newest"
    );

  useEffect(() => {
    void fetchUser(
      "worker"
    );
  }, [fetchUser]);

  useEffect(() => {
    if (
      user?.role !==
      "worker"
    ) {
      return;
    }

    async function loadPayments() {
      try {
        setLoading(true);

        const [data, completedContracts, bankDetails] = await Promise.all([
          fetchWorkerPaymentHistory(),
          fetchWorkerPayoutEligibility(),
          fetchWorkerPayoutBankDetails(),
        ]);
        setPayments(Array.isArray(data) ? data : []);
        setPayoutContracts(Array.isArray(completedContracts) ? completedContracts : []);
        setPayoutBankDetails(bankDetails);
      } catch (error) {
        toast.error(
          error instanceof
            Error
            ? error.message
            : "Unable to load payment history."
        );
      } finally {
        setLoading(false);
        setPayoutLoading(false);
      }
    }

    void loadPayments();
  }, [user?.role]);

  async function savePayoutBankDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cancelledCheque && !payoutBankDetails?.cheque_uploaded) {
      toast.error("Upload a cancelled cheque image or PDF to save payout details.");
      return;
    }
    const formData = new FormData();
    formData.append("bankName", payoutBankForm.bankName.trim());
    formData.append("accountHolderName", payoutBankForm.accountHolderName.trim());
    formData.append("accountNumber", payoutBankForm.accountNumber.trim());
    formData.append("ifscCode", payoutBankForm.ifscCode.trim().toUpperCase());
    formData.append("upiId", payoutBankForm.upiId.trim());
    if (cancelledCheque) formData.append("cancelledCheque", cancelledCheque);
    try {
      setBankSaving(true);
      await saveWorkerPayoutBankDetails(formData);
      const saved = await fetchWorkerPayoutBankDetails();
      setPayoutBankDetails(saved);
      setPayoutBankForm({ bankName: "", accountHolderName: "", accountNumber: "", ifscCode: "", upiId: "" });
      setCancelledCheque(null);
      setBankFormOpen(false);
      toast.success("Worker payout bank details saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save payout bank details.");
    } finally {
      setBankSaving(false);
    }
  }

  function togglePayoutBankForm() {
    if (!bankFormOpen && payoutBankDetails) {
      setPayoutBankForm({
        bankName: payoutBankDetails.bank_name || "",
        accountHolderName: payoutBankDetails.account_holder_name || "",
        accountNumber: payoutBankDetails.account_number || "",
        ifscCode: payoutBankDetails.ifsc_code || "",
        upiId: payoutBankDetails.upi_id || "",
      });
      setCancelledCheque(null);
    }
    setBankFormOpen((open) => !open);
  }

  async function submitWorkerPayout(contract: WorkerPayoutEligibility) {
    const jobTitle = typeof contract.request_details?.job_title === "string" && contract.request_details.job_title.trim() ? contract.request_details.job_title : "hiring contract";
    if (!window.confirm(`Request worker payout of ${formatAmount(contract.eligible_amount)} for ${jobTitle}?`)) return;
    try {
      setPayoutRequestingId(contract.hire_request_id);
      await requestWorkerPayout(contract.hire_request_id);
      setPayoutContracts(await fetchWorkerPayoutEligibility());
      toast.success("Payout request sent to admin.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to request payout.");
    } finally {
      setPayoutRequestingId(null);
    }
  }

  const analytics =
    useMemo(() => {
      const successful =
        payments.filter(
          (payment) =>
            isSuccessfulPayment(
              payment.status
            )
        );

      const pending =
        payments.filter(
          (payment) =>
            !isSuccessfulPayment(
              payment.status
            ) &&
            !isFailedPayment(
              payment.status
            )
        );

      const failed =
        payments.filter(
          (payment) =>
            isFailedPayment(
              payment.status
            )
        );

      const totalSuccessful =
        successful.reduce(
          (
            total,
            payment
          ) =>
            total +
            Number(
              payment.amount ||
                0
            ),
          0
        );

      const pendingAmount =
        pending.reduce(
          (
            total,
            payment
          ) =>
            total +
            Number(
              payment.amount ||
                0
            ),
          0
        );

      const average =
        successful.length
          ? totalSuccessful /
            successful.length
          : 0;

      const highest =
        successful.reduce(
          (
            highest,
            payment
          ) =>
            Math.max(
              highest,
              Number(
                payment.amount ||
                  0
              )
            ),
          0
        );

      const successRate =
        payments.length
          ? (successful.length /
              payments.length) *
            100
          : 0;

      const now =
        new Date();

      const thisMonth =
        successful
          .filter(
            (payment) => {
              const date =
                new Date(
                  payment.created_at
                );

              return (
                date.getMonth() ===
                  now.getMonth() &&
                date.getFullYear() ===
                  now.getFullYear()
              );
            }
          )
          .reduce(
            (
              total,
              payment
            ) =>
              total +
              Number(
                payment.amount ||
                  0
              ),
            0
          );

      const previousMonthDate =
        new Date(
          now.getFullYear(),
          now.getMonth() -
            1,
          1
        );

      const previousMonth =
        successful
          .filter(
            (payment) => {
              const date =
                new Date(
                  payment.created_at
                );

              return (
                date.getMonth() ===
                  previousMonthDate.getMonth() &&
                date.getFullYear() ===
                  previousMonthDate.getFullYear()
              );
            }
          )
          .reduce(
            (
              total,
              payment
            ) =>
              total +
              Number(
                payment.amount ||
                  0
              ),
            0
          );

      const monthChange =
        percentageChange(
          thisMonth,
          previousMonth
        );

      return {
        totalSuccessful,
        pendingAmount,
        average,
        highest,
        successRate,
        successfulCount:
          successful.length,
        pendingCount:
          pending.length,
        failedCount:
          failed.length,
        thisMonth,
        previousMonth,
        monthChange,
      };
    }, [payments]);

  const monthlyActivity =
    useMemo(() => {
      const months =
        getLastSixMonths();

      return months.map(
        (month) => {
          const successful =
            payments.filter(
              (payment) => {
                if (
                  !isSuccessfulPayment(
                    payment.status
                  )
                ) {
                  return false;
                }

                const date =
                  new Date(
                    payment.created_at
                  );

                return (
                  getMonthKey(
                    date
                  ) ===
                  month.key
                );
              }
            );

          return {
            ...month,

            amount:
              successful.reduce(
                (
                  total,
                  payment
                ) =>
                  total +
                  Number(
                    payment.amount ||
                      0
                  ),
                0
              ),

            count:
              successful.length,
          };
        }
      );
    }, [payments]);

  const maxMonthlyAmount =
    Math.max(
      1,
      ...monthlyActivity.map(
        (item) =>
          item.amount
      )
    );

  const topClients =
    useMemo(() => {
      const map =
        new Map<
          string,
          {
            clientName: string;
            total: number;
            contracts:
              Set<string>;
          }
        >();

      for (
        const payment of payments
      ) {
        if (
          !isSuccessfulPayment(
            payment.status
          )
        ) {
          continue;
        }

        const key =
          payment.client_id ||
          payment.client_email ||
          payment.client_name ||
          "unknown";

        const current =
          map.get(key) || {
            clientName:
              payment.client_name ||
              "Client",

            total: 0,

            contracts:
              new Set<string>(),
          };

        current.total +=
          Number(
            payment.amount ||
              0
          );

        if (
          payment.hire_request_id
        ) {
          current.contracts.add(
            payment.hire_request_id
          );
        }

        map.set(
          key,
          current
        );
      }

      return Array.from(
        map.values()
      )
        .sort(
          (a, b) =>
            b.total -
            a.total
        )
        .slice(0, 5);
    }, [payments]);

  const filteredPayments =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      let result =
        payments.filter(
          (payment) => {
            if (query) {
              const searchable =
                [
                  payment.client_name,
                  payment.client_email,
                  payment.razorpay_payment_id,
                  payment.hire_request_id,
                  getJobTitle(
                    payment
                  ),
                ]
                  .filter(
                    Boolean
                  )
                  .join(" ")
                  .toLowerCase();

              if (
                !searchable.includes(
                  query
                )
              ) {
                return false;
              }
            }

            if (
              statusFilter ===
              "successful" &&
              !isSuccessfulPayment(
                payment.status
              )
            ) {
              return false;
            }

            if (
              statusFilter ===
              "pending" &&
              (isSuccessfulPayment(
                payment.status
              ) ||
                isFailedPayment(
                  payment.status
                ))
            ) {
              return false;
            }

            if (
              statusFilter ===
                "failed" &&
              !isFailedPayment(
                payment.status
              )
            ) {
              return false;
            }

            if (
              periodFilter !==
              "all"
            ) {
              const date =
                new Date(
                  payment.created_at
                );

              const now =
                new Date();

              if (
                periodFilter ===
                "30d"
              ) {
                const cutoff =
                  new Date();

                cutoff.setDate(
                  now.getDate() -
                    30
                );

                if (
                  date <
                  cutoff
                ) {
                  return false;
                }
              }

              if (
                periodFilter ===
                "90d"
              ) {
                const cutoff =
                  new Date();

                cutoff.setDate(
                  now.getDate() -
                    90
                );

                if (
                  date <
                  cutoff
                ) {
                  return false;
                }
              }

              if (
                periodFilter ===
                "year" &&
                date.getFullYear() !==
                  now.getFullYear()
              ) {
                return false;
              }
            }

            return true;
          }
        );

      result = [
        ...result,
      ].sort(
        (a, b) => {
          if (
            sortFilter ===
            "highest"
          ) {
            return (
              Number(
                b.amount
              ) -
              Number(
                a.amount
              )
            );
          }

          if (
            sortFilter ===
            "lowest"
          ) {
            return (
              Number(
                a.amount
              ) -
              Number(
                b.amount
              )
            );
          }

          const aTime =
            new Date(
              a.created_at
            ).getTime();

          const bTime =
            new Date(
              b.created_at
            ).getTime();

          if (
            sortFilter ===
            "oldest"
          ) {
            return (
              aTime -
              bTime
            );
          }

          return (
            bTime -
            aTime
          );
        }
      );

      return result;
    }, [
      payments,
      search,
      statusFilter,
      periodFilter,
      sortFilter,
    ]);

  async function copyText(
    value?: string | null
  ) {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(
        value
      );

      toast.success(
        "Payment ID copied."
      );
    } catch {
      toast.error(
        "Unable to copy."
      );
    }
  }

  if (
    authLoading ||
    loading
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
      </div>
    );
  }

  if (
    user?.role !==
    "worker"
  ) {
    return (
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <CreditCard className="mx-auto h-8 w-8 text-zinc-300" />

        <h1 className="mt-4 font-heading text-xl font-semibold text-zinc-900">
          Worker account
          required
        </h1>

        <p className="mt-2 text-xs leading-relaxed text-zinc-500">
          Sign in using your
          worker account to
          view hiring
          payments.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-zinc-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>

          <div>
            <h1 className="font-heading text-2xl font-semibold text-zinc-900">
              Hiring Payments
            </h1>

            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-500">
              Payment analytics
              and records linked
              to your hiring
              contracts.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] text-zinc-500">
          {payments.length} total
          payment records
        </div>
      </div>

      {/* Main KPI cards */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Successful payments"
          value={formatAmount(
            analytics.totalSuccessful
          )}
          helper={`${analytics.successfulCount} confirmed payments`}
          icon={
            <IndianRupee className="h-4 w-4" />
          }
        />

        <MetricCard
          label="Pending payments"
          value={formatAmount(
            analytics.pendingAmount
          )}
          helper={`${analytics.pendingCount} awaiting confirmation`}
          icon={
            <Clock3 className="h-4 w-4" />
          }
        />

        <MetricCard
          label="Average payment"
          value={formatAmount(
            analytics.average
          )}
          helper="Across successful contracts"
          icon={
            <TrendingUp className="h-4 w-4" />
          }
        />

        <MetricCard
          label="Success rate"
          value={`${analytics.successRate.toFixed(
            0
          )}%`}
          helper={`${analytics.failedCount} failed or cancelled`}
          icon={
            <CheckCircle2 className="h-4 w-4" />
          }
        />
      </section>

      {/* Secondary stats */}
      <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            This month
          </p>

          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <p className="font-heading text-2xl font-semibold text-zinc-900">
                {formatAmount(
                  analytics.thisMonth
                )}
              </p>

              <p className="mt-1 text-[11px] text-zinc-500">
                Previous month{" "}
                {formatAmount(
                  analytics.previousMonth
                )}
              </p>
            </div>

            <div
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${
                analytics.monthChange >=
                0
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {analytics.monthChange >=
              0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}

              {Math.abs(
                analytics.monthChange
              ).toFixed(0)}
              %
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Highest payment
          </p>

          <p className="mt-2 font-heading text-2xl font-semibold text-zinc-900">
            {formatAmount(
              analytics.highest
            )}
          </p>

          <p className="mt-2 text-[11px] text-zinc-500">
            Largest successful
            hiring payment
            recorded.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 md:col-span-2 xl:col-span-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Contract payments
          </p>

          <div className="mt-3 flex items-center gap-5">
            <div>
              <p className="text-lg font-semibold text-emerald-700">
                {
                  analytics.successfulCount
                }
              </p>
              <p className="text-[10px] text-zinc-500">
                Successful
              </p>
            </div>

            <div>
              <p className="text-lg font-semibold text-amber-700">
                {
                  analytics.pendingCount
                }
              </p>
              <p className="text-[10px] text-zinc-500">
                Pending
              </p>
            </div>

            <div>
              <p className="text-lg font-semibold text-red-700">
                {
                  analytics.failedCount
                }
              </p>
              <p className="text-[10px] text-zinc-500">
                Failed
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Charts / clients */}
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* Activity chart */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">
              Payment activity
            </h2>

            <p className="mt-1 text-[11px] text-zinc-500">
              Successful
              contract payment
              value over the last
              six months.
            </p>
          </div>

          <div className="mt-8 flex h-56 items-end gap-3 sm:gap-5">
            {monthlyActivity.map(
              (item) => {
                const height =
                  item.amount ===
                  0
                    ? 4
                    : Math.max(
                        8,
                        (item.amount /
                          maxMonthlyAmount) *
                          100
                      );

                return (
                  <div
                    key={
                      item.key
                    }
                    className="flex h-full flex-1 flex-col justify-end"
                  >
                    <div className="mb-2 text-center text-[10px] font-medium text-zinc-500">
                      {item.amount >
                      0
                        ? formatAmount(
                            item.amount
                          )
                        : "—"}
                    </div>

                    <div className="flex h-40 items-end rounded-lg bg-zinc-50 px-2">
                      <div
                        className="w-full rounded-t-md bg-blue-600 transition-all"
                        style={{
                          height: `${height}%`,
                        }}
                      />
                    </div>

                    <div className="mt-2 text-center">
                      <p className="text-[11px] font-medium text-zinc-700">
                        {
                          item.label
                        }
                      </p>

                      <p className="text-[9px] text-zinc-400">
                        {
                          item.count
                        }{" "}
                        payments
                      </p>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Top clients */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-zinc-500" />

            <h2 className="text-sm font-semibold text-zinc-900">
              Top hiring
              clients
            </h2>
          </div>

          <p className="mt-1 text-[11px] text-zinc-500">
            Based on successful
            payment value.
          </p>

          <div className="mt-5 space-y-4">
            {topClients.length ===
            0 ? (
              <p className="py-8 text-center text-xs text-zinc-400">
                No successful
                client payments
                yet.
              </p>
            ) : (
              topClients.map(
                (
                  client,
                  index
                ) => (
                  <div
                    key={`${client.clientName}-${index}`}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-[11px] font-semibold text-zinc-600">
                        {index +
                          1}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-zinc-800">
                          {
                            client.clientName
                          }
                        </p>

                        <p className="text-[10px] text-zinc-400">
                          {
                            client
                              .contracts
                              .size
                          }{" "}
                          contract
                          {client
                            .contracts
                            .size !==
                          1
                            ? "s"
                            : ""}
                        </p>
                      </div>
                    </div>

                    <p className="shrink-0 text-xs font-semibold text-zinc-900">
                      {formatAmount(
                        client.total
                      )}
                    </p>
                  </div>
                )
              )
            )}
          </div>
        </div>
      </section>

      {/* Worker payout requests */}
      <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50"><Landmark className="h-5 w-5 text-emerald-700" /></div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900">Worker payouts</h2>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-500">After both you and the client confirm a paid contract is complete, request its payout from admin. The eligible amount reflects the admin commission on your worker profile.</p>
            </div>
          </div>
          {payoutBankDetails ? <button type="button" onClick={togglePayoutBankForm} className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50">{bankFormOpen ? "Close bank form" : "Update bank details"}</button> : null}
        </div>

        {payoutBankDetails && !bankFormOpen ? (
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-xs text-emerald-900">
            <span className="inline-flex items-center gap-2 font-semibold"><CheckCircle2 className="h-4 w-4" /> Payout account saved</span>
            <span>{payoutBankDetails.bank_name} · {payoutBankDetails.account_holder_name}</span>
            <span>Account ending {payoutBankDetails.account_last_four} · IFSC {payoutBankDetails.ifsc_code}</span>
            {payoutBankDetails.upi_id ? <span>UPI ID: {payoutBankDetails.upi_id}</span> : null}
            <span>{payoutBankDetails.cheque_uploaded ? "Cancelled cheque uploaded" : "Cancelled cheque required"}</span>
          </div>
        ) : (
          <form onSubmit={savePayoutBankDetails} className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
            <div className="mb-3 flex items-center gap-2"><Landmark className="h-4 w-4 text-zinc-500" /><h3 className="text-sm font-semibold text-zinc-900">Payout bank details</h3></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input required value={payoutBankForm.bankName} onChange={(event) => setPayoutBankForm((form) => ({ ...form, bankName: event.target.value }))} placeholder="Bank name" className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-500" />
              <input required value={payoutBankForm.accountHolderName} onChange={(event) => setPayoutBankForm((form) => ({ ...form, accountHolderName: event.target.value }))} placeholder="Account holder name" className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-500" />
              <input required inputMode="numeric" minLength={9} maxLength={18} value={payoutBankForm.accountNumber} onChange={(event) => setPayoutBankForm((form) => ({ ...form, accountNumber: event.target.value.replace(/\D/g, "") }))} placeholder="Bank account number" className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-500" />
              <input required maxLength={11} value={payoutBankForm.ifscCode} onChange={(event) => setPayoutBankForm((form) => ({ ...form, ifscCode: event.target.value.toUpperCase() }))} placeholder="IFSC code" className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-xs uppercase outline-none focus:border-blue-500" />
              <input maxLength={255} value={payoutBankForm.upiId} onChange={(event) => setPayoutBankForm((form) => ({ ...form, upiId: event.target.value }))} placeholder="UPI ID (optional, e.g. name@bank)" className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-500" />
              <label className="flex items-center gap-2 rounded-lg border border-dashed border-zinc-300 bg-white px-3 py-2.5 text-xs text-zinc-600 sm:col-span-2">
                <Upload className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{cancelledCheque?.name || "Upload cancelled cheque (PDF or image, max 5 MB)"}</span>
                <input required={!payoutBankDetails?.cheque_uploaded} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(event) => setCancelledCheque(event.target.files?.[0] || null)} className="max-w-[125px] text-[10px]" />
              </label>
              {payoutBankDetails?.cheque_uploaded ? <p className="text-[10px] text-zinc-500 sm:col-span-2">Existing cancelled cheque will be kept unless you choose a replacement.</p> : null}
            </div>
            <button disabled={bankSaving} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">
              {bankSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CreditCard className="h-3.5 w-3.5" />}{bankSaving ? "Saving…" : "Save payout account"}
            </button>
          </form>
        )}

        <div className="mt-5 border-t border-zinc-100 pt-4">
          <h3 className="text-sm font-semibold text-zinc-900">Completed contracts eligible for payout</h3>
          {payoutLoading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-blue-600" /></div> : payoutContracts.length ? (
            <div className="mt-3 divide-y divide-zinc-100">
              {payoutContracts.map((contract) => {
                const status = contract.request_status || "not_requested";
                const canRequest = (!contract.request_status || contract.request_status === "rejected") && Number(contract.eligible_amount) > 0;
                const remaining = Math.max(0, Number(contract.eligible_amount) - Number(contract.transferred_amount || contract.paid_amount || 0));
                const commissionDeduction = Math.max(0, Number(contract.agreed_amount) - Number(contract.eligible_amount));
                return (
                  <article key={contract.hire_request_id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="truncate text-sm font-semibold text-zinc-900">{typeof contract.request_details?.job_title === "string" ? contract.request_details.job_title : "Hiring contract"}</h4>
                        <span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase ${status === "paid" ? "bg-emerald-50 text-emerald-700" : status === "rejected" ? "bg-rose-50 text-rose-700" : status === "requested" || status === "partially_paid" ? "bg-amber-50 text-amber-800" : "bg-blue-50 text-blue-700"}`}>{status.replace(/_/g, " ")}</span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">Client: {contract.client_name} · Completed {formatShortDate(contract.completed_at)}</p>
                      <p className="mt-1 text-[11px] text-zinc-600">Contract {formatAmount(contract.agreed_amount)} · Admin commission {Number(contract.commission_percentage || 0)}%</p>
                      <p className="mt-1 text-[11px] text-zinc-500">Commission deduction: {formatAmount(commissionDeduction)}</p>
                      {contract.rejection_reason ? <p className="mt-1 text-xs text-rose-700">Admin note: {contract.rejection_reason}</p> : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <div className="text-right"><p className="text-[10px] uppercase text-zinc-400">Net payout</p><p className="text-sm font-bold text-zinc-900">{formatAmount(contract.eligible_amount)}</p>{status === "partially_paid" ? <p className="text-[10px] text-amber-700">Remaining {formatAmount(remaining)}</p> : null}</div>
                      {canRequest ? <button type="button" disabled={!payoutBankDetails?.cheque_uploaded || payoutRequestingId === contract.hire_request_id} onClick={() => void submitWorkerPayout(contract)} className="rounded-lg bg-blue-700 px-3 py-2.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{payoutRequestingId === contract.hire_request_id ? "Sending…" : status === "rejected" ? "Request again" : "Request payout"}</button> : status === "requested" ? <span className="text-xs font-semibold text-amber-700">Waiting for admin</span> : status === "partially_paid" ? <span className="text-xs font-semibold text-amber-700">Partial payment recorded</span> : status === "paid" ? <span className="text-xs font-semibold text-emerald-700">Paid</span> : null}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : <p className="py-7 text-center text-xs text-zinc-500">Completed, paid contracts will appear here after both you and the client confirm completion.</p>}
        </div>
      </section>

      {/* Transactions */}
      <section className="mt-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              Payment records
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Review individual
              hiring contract
              payments and their
              current status.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:flex">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />

              <input
                value={
                  search
                }
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search client, job or payment ID..."
                className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-blue-600 lg:w-64"
              />
            </div>

            <select
              value={
                statusFilter
              }
              onChange={(
                event
              ) =>
                setStatusFilter(
                  event.target
                    .value as StatusFilter
                )
              }
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700"
            >
              <option value="all">
                All statuses
              </option>

              <option value="successful">
                Successful
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="failed">
                Failed
              </option>
            </select>

            <select
              value={
                periodFilter
              }
              onChange={(
                event
              ) =>
                setPeriodFilter(
                  event.target
                    .value as PeriodFilter
                )
              }
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700"
            >
              <option value="all">
                All time
              </option>

              <option value="30d">
                Last 30 days
              </option>

              <option value="90d">
                Last 90 days
              </option>

              <option value="year">
                This year
              </option>
            </select>

            <select
              value={
                sortFilter
              }
              onChange={(
                event
              ) =>
                setSortFilter(
                  event.target
                    .value as SortFilter
                )
              }
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700"
            >
              <option value="newest">
                Newest
              </option>

              <option value="oldest">
                Oldest
              </option>

              <option value="highest">
                Highest amount
              </option>

              <option value="lowest">
                Lowest amount
              </option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          {filteredPayments.length ===
          0 ? (
            <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-14 text-center">
              <CreditCard className="mx-auto h-6 w-6 text-zinc-300" />

              <h3 className="mt-3 text-sm font-semibold text-zinc-900">
                No payment
                records found
              </h3>

              <p className="mt-1 text-xs text-zinc-500">
                Try changing your
                search or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
              <div className="hidden grid-cols-[1.4fr_1.5fr_1fr_1fr_120px] gap-4 border-b border-zinc-100 bg-zinc-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 lg:grid">
                <span>
                  Client
                </span>

                <span>
                  Contract
                </span>

                <span>
                  Payment
                </span>

                <span>
                  Amount
                </span>

                <span>
                  Status
                </span>
              </div>

              <div className="divide-y divide-zinc-100">
                {filteredPayments.map(
                  (
                    payment
                  ) => (
                    <article
                      key={
                        payment.id
                      }
                      className="p-5 transition hover:bg-zinc-50/60"
                    >
                      <div className="grid gap-5 lg:grid-cols-[1.4fr_1.5fr_1fr_1fr_120px] lg:items-center">
                        {/* Client */}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-zinc-900">
                            {payment.client_name ||
                              "Client"}
                          </p>

                          <p className="mt-1 truncate text-[11px] text-zinc-400">
                            {payment.client_email ||
                              "Client email unavailable"}
                          </p>
                        </div>

                        {/* Contract */}
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-zinc-800">
                            {getJobTitle(
                              payment
                            )}
                          </p>

                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded px-2 py-0.5 text-[9px] font-semibold uppercase ${contractStatusClasses(
                                payment.contract_status
                              )}`}
                            >
                              {payment.contract_status?.replace(
                                /_/g,
                                " "
                              ) ||
                                "contract"}
                            </span>

                            <span className="text-[10px] text-zinc-400">
                              {formatShortDate(
                                payment.contract_created_at
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Payment */}
                        <div>
                          <p className="text-[11px] capitalize text-zinc-600">
                            {payment.payment_method?.replace(
                              /_/g,
                              " "
                            ) ||
                              "Payment"}
                          </p>

                          {payment.razorpay_payment_id ? (
                            <button
                              type="button"
                              onClick={() =>
                                void copyText(
                                  payment.razorpay_payment_id
                                )
                              }
                              className="mt-1 inline-flex max-w-full items-center gap-1 text-[10px] text-zinc-400 hover:text-blue-600"
                            >
                              <span className="max-w-[120px] truncate">
                                {
                                  payment.razorpay_payment_id
                                }
                              </span>

                              <Copy className="h-3 w-3 shrink-0" />
                            </button>
                          ) : (
                            <p className="mt-1 text-[10px] text-zinc-400">
                              Payment ID
                              pending
                            </p>
                          )}
                        </div>

                        {/* Amount */}
                        <div>
                          <p className="font-heading text-base font-semibold text-zinc-900">
                            {formatAmount(
                              payment.amount
                            )}
                          </p>

                          <p className="mt-1 text-[10px] text-zinc-400">
                            {formatDate(
                              payment.payment_updated_at ||
                                payment.created_at
                            )}
                          </p>
                        </div>

                        {/* Status */}
                        <div className="flex flex-col items-start gap-2 lg:items-end">
                          <span
                            className={`inline-flex rounded-md border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide ${paymentStatusClasses(
                              payment.status
                            )}`}
                          >
                            {payment.status?.replace(
                              /_/g,
                              " "
                            ) ||
                              "pending"}
                          </span>

                          {payment.hire_request_id && (
                            <Link
                              href={`/worker/chat/${payment.hire_request_id}`}
                              className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 hover:text-blue-700"
                            >
                              View
                              contract

                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Extra contract details */}
                      {(payment
                        .request_details
                        ?.location ||
                        payment
                          .request_details
                          ?.duration ||
                        payment.completed_at) && (
                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-zinc-100 pt-3 text-[10px] text-zinc-500">
                          {typeof payment
                            .request_details
                            ?.location ===
                            "string" &&
                            payment
                              .request_details
                              .location && (
                              <span>
                                Location:{" "}
                                <strong className="font-medium text-zinc-700">
                                  {
                                    payment
                                      .request_details
                                      .location
                                  }
                                </strong>
                              </span>
                            )}

                          {typeof payment
                            .request_details
                            ?.duration ===
                            "string" &&
                            payment
                              .request_details
                              .duration && (
                              <span>
                                Duration:{" "}
                                <strong className="font-medium text-zinc-700">
                                  {
                                    payment
                                      .request_details
                                      .duration
                                  }
                                </strong>
                              </span>
                            )}

                          {payment.completed_at && (
                            <span>
                              Completed:{" "}
                              <strong className="font-medium text-zinc-700">
                                {formatShortDate(
                                  payment.completed_at
                                )}
                              </strong>
                            </span>
                          )}
                        </div>
                      )}
                    </article>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        <p className="mt-3 text-[10px] leading-relaxed text-zinc-400">
          Payment amounts shown
          here are payments
          recorded against hiring
          contracts. They do not
          represent worker payout
          or settlement status.
        </p>
      </section>
    </main>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            {label}
          </p>

          <p className="mt-2 font-heading text-2xl font-semibold text-zinc-900">
            {value}
          </p>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-[11px] text-zinc-500">
        {helper}
      </p>
    </div>
  );
}
