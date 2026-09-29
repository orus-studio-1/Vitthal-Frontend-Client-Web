"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Loader2,
  MapPin,
  MessageSquare,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { useAuthStore } from "@/store/authStore";

import {
  cancelHireRequest,
  createHirePaymentOrder,
  fetchClientHireRequests,
  verifyHirePayment,
} from "@/lib/api/hiring";

import type { HireConversation } from "@/lib/api/hireConversation";

function getRequestDetail(
  request: HireConversation,
  key: string
): string {
  const value = request.request_details?.[key];

  return typeof value === "string" ? value : "";
}

function formatDate(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    dateStyle: "medium",
  });
}

function requestStatusClasses(status: string) {
  if (status === "accepted") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "rejected") {
    return "bg-red-50 text-red-700";
  }

  if (status === "cancelled") {
    return "bg-zinc-100 text-zinc-500";
  }

  return "bg-amber-50 text-amber-700";
}

function contractStatusClasses(status?: string | null) {
  if (status === "completed") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "active") {
    return "bg-blue-50 text-blue-700";
  }

  if (status === "payment_pending") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-zinc-100 text-zinc-600";
}

export default function ClientHiringRequestsPage() {
  const {
    user,
    isLoading: authLoading,
    fetchUser,
  } = useAuthStore();

  const [requests, setRequests] = useState<HireConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user?.role !== "client") return;

    async function loadRequests() {
      try {
        setLoading(true);

        const data = await fetchClientHireRequests();

        setRequests(data);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load requests."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadRequests();
  }, [user?.role]);

  async function refreshRequests() {
    try {
      const data = await fetchClientHireRequests();
      setRequests(data);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to refresh requests."
      );
    }
  }

  async function handleCancelRequest(
    request: HireConversation
  ) {
    if (request.status !== "pending") {
      toast.error(
        "Only pending hiring requests can be cancelled."
      );
      return;
    }

    const confirmed = window.confirm(
      `Cancel hiring request for ${
        request.candidate_name || "this worker"
      }?`
    );

    if (!confirmed) return;

    try {
      setCancellingId(request.id);

      await cancelHireRequest(request.id);

      setRequests((current) =>
        current.map((item) =>
          item.id === request.id
            ? {
                ...item,
                status: "cancelled",
              }
            : item
        )
      );

      toast.success("Hiring request cancelled.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to cancel hiring request."
      );
    } finally {
      setCancellingId(null);
    }
  }

  async function ensureRazorpayLoaded() {
    if ((window as any).Razorpay) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const existing =
        document.querySelector<HTMLScriptElement>(
          'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        );

      if (existing) {
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

      const script = document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

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

  async function handlePayment(
    request: HireConversation
  ) {
    const amount = Number(
      request.agreed_amount ||
        request.proposed_amount ||
        0
    );

    if (!amount) {
      toast.error(
        "No agreed amount is available yet."
      );
      return;
    }

    if (
      request.status !== "accepted" ||
      request.negotiation_status !== "agreed"
    ) {
      toast.error(
        "The hiring amount must be agreed before payment."
      );
      return;
    }

    try {
      setPayingId(request.id);

      await ensureRazorpayLoaded();

      const order = await createHirePaymentOrder(
        request.id
      );

      const checkout = new (window as any).Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,

        name: "MTWO Groups",

        description: `Worker hiring payment for ${
          request.candidate_name || "worker"
        }`,

        order_id: order.razorpayOrderId,

        handler: async (payment: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            setPayingId(request.id);

            await verifyHirePayment(
              request.id,
              payment
            );

            toast.success(
              "Payment completed successfully."
            );

            await refreshRequests();
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "Payment verification failed."
            );
          } finally {
            setPayingId(null);
          }
        },

        modal: {
          ondismiss: () => {
            setPayingId(null);
          },
        },

        theme: {
          color: "#2563eb",
        },
      });

      checkout.on(
        "payment.failed",
        (response: any) => {
          setPayingId(null);

          toast.error(
            response?.error?.description ||
              "Payment failed. Please try again."
          );
        }
      );

      checkout.open();
    } catch (error) {
      setPayingId(null);

      toast.error(
        error instanceof Error
          ? error.message
          : "Payment could not be started."
      );
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
      </div>
    );
  }

  if (user?.role !== "client") {
    return (
      <p className="mx-auto max-w-md px-4 py-20 text-center text-sm text-zinc-500">
        Only clients can view hiring requests.
      </p>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-zinc-900">
          My hiring requests
        </h1>

        <p className="mt-1 text-xs text-zinc-500">
          Track worker responses, review
          requirements and continue accepted
          conversations.
        </p>
      </div>

      <section className="mt-6 space-y-4">
        {requests.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white py-14 text-center shadow-xs">
            <h2 className="text-sm font-semibold text-zinc-900">
              No hiring requests yet
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Workers you request to hire will
              appear here.
            </p>

            <Link
              href="/hiring"
              className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700"
            >
              Browse workers
            </Link>
          </div>
        ) : (
          requests.map((request) => {
            const jobTitle = getRequestDetail(
              request,
              "job_title"
            );

            const startDate = getRequestDetail(
              request,
              "start_date"
            );

            const duration = getRequestDetail(
              request,
              "duration"
            );

            const location = getRequestDetail(
              request,
              "location"
            );

            const shift = getRequestDetail(
              request,
              "shift"
            );

            const note = getRequestDetail(
              request,
              "note"
            );

            const currentAmount =
              request.agreed_amount ||
              request.proposed_amount;

            const isCancelling =
              cancellingId === request.id;

            const isPaying =
              payingId === request.id;

            const canPay =
              request.status === "accepted" &&
              request.negotiation_status ===
                "agreed" &&
              Boolean(request.agreed_amount) &&
              ![
                "active",
                "completed",
              ].includes(
                request.contract_status || ""
              );

            return (
              <article
                key={request.id}
                className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs"
              >
                <div className="flex flex-col gap-4 border-b border-zinc-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      Worker
                    </p>

                    <h2 className="mt-1 text-lg font-semibold text-zinc-900">
                      {request.candidate_name ||
                        "Worker"}
                    </h2>

                    <p className="mt-1 text-xs text-zinc-500">
                      {request.candidate_designation ||
                        "Industrial worker"}

                      {request.candidate_city
                        ? ` · ${request.candidate_city}`
                        : ""}
                    </p>

                    <p className="mt-2 text-[11px] text-zinc-400">
                      Requested{" "}
                      {formatDate(
                        request.created_at
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase ${requestStatusClasses(
                        request.status
                      )}`}
                    >
                      Request: {request.status}
                    </span>

                    {request.status ===
                      "accepted" && (
                      <span
                        className={`rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase ${
                          request.negotiation_status ===
                          "paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : request.negotiation_status ===
                                "agreed"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {request.negotiation_status ===
                        "paid"
                          ? "Paid"
                          : request.negotiation_status?.replace(
                              /_/g,
                              " "
                            ) ||
                            "Negotiation open"}
                      </span>
                    )}

                    {request.contract_status &&
                      request.status ===
                        "accepted" && (
                        <span
                          className={`rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase ${contractStatusClasses(
                            request.contract_status
                          )}`}
                        >
                          Contract:{" "}
                          {request.contract_status.replace(
                            /_/g,
                            " "
                          )}
                        </span>
                      )}
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-zinc-100 bg-zinc-50/70 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    Work requirement
                  </p>

                  {jobTitle ? (
                    <h3 className="mt-2 text-sm font-semibold text-zinc-900">
                      {jobTitle}
                    </h3>
                  ) : (
                    <p className="mt-2 text-xs text-zinc-500">
                      No job title specified.
                    </p>
                  )}

                  {(startDate ||
                    duration ||
                    location ||
                    shift) && (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {startDate && (
                        <div className="flex items-start gap-2">
                          <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />

                          <div>
                            <p className="text-[10px] uppercase text-zinc-400">
                              Start
                            </p>

                            <p className="mt-0.5 text-xs font-medium text-zinc-700">
                              {formatDate(
                                startDate
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      {duration && (
                        <div className="flex items-start gap-2">
                          <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />

                          <div>
                            <p className="text-[10px] uppercase text-zinc-400">
                              Duration
                            </p>

                            <p className="mt-0.5 text-xs font-medium text-zinc-700">
                              {duration}
                            </p>
                          </div>
                        </div>
                      )}

                      {location && (
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />

                          <div>
                            <p className="text-[10px] uppercase text-zinc-400">
                              Location
                            </p>

                            <p className="mt-0.5 text-xs font-medium text-zinc-700">
                              {location}
                            </p>
                          </div>
                        </div>
                      )}

                      {shift && (
                        <div>
                          <p className="text-[10px] uppercase text-zinc-400">
                            Shift
                          </p>

                          <p className="mt-0.5 text-xs font-medium capitalize text-zinc-700">
                            {shift.replace(
                              /_/g,
                              " "
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {note && (
                    <div className="mt-4 border-t border-zinc-200 pt-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        Requirement note
                      </p>

                      <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-zinc-600">
                        {note}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] uppercase text-zinc-400">
                      Current amount
                    </p>

                    <p className="mt-1 text-sm font-semibold text-zinc-900">
                      {currentAmount
                        ? `₹${Number(
                            currentAmount
                          ).toLocaleString(
                            "en-IN"
                          )}`
                        : "Not negotiated"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase text-zinc-400">
                      Your completion
                    </p>

                    <p className="mt-1 text-xs font-medium text-zinc-700">
                      {request.client_completed_at
                        ? "Confirmed"
                        : request.contract_status ===
                              "active" ||
                            request.contract_status ===
                              "completed"
                          ? "Not confirmed"
                          : "Not available yet"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase text-zinc-400">
                      Worker completion
                    </p>

                    <p className="mt-1 text-xs font-medium text-zinc-700">
                      {request.worker_completed_at
                        ? "Confirmed"
                        : request.contract_status ===
                              "active" ||
                            request.contract_status ===
                              "completed"
                          ? "Waiting"
                          : "Not available yet"}
                    </p>
                  </div>
                </div>

                {request.admin_notes && (
                  <div className="mt-4 rounded-lg bg-amber-50 p-3">
                    <p className="text-[10px] font-semibold uppercase text-amber-700">
                      Admin note
                    </p>

                    <p className="mt-1 text-xs text-amber-800">
                      {request.admin_notes}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-zinc-100 pt-4">
                  {request.status ===
                    "pending" && (
                    <button
                      type="button"
                      onClick={() =>
                        void handleCancelRequest(
                          request
                        )
                      }
                      disabled={isCancelling}
                      className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isCancelling ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}

                      {isCancelling
                        ? "Cancelling..."
                        : "Cancel request"}
                    </button>
                  )}

                  {request.status ===
                    "accepted" && (
                    <Link
                      href={`/hiring/chat/${request.id}`}
                      className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />

                      {request.contract_status ===
                      "completed"
                        ? "View contract"
                        : "Chat & negotiate"}
                    </Link>
                  )}

                  {canPay && (
                    <button
                      type="button"
                      onClick={() =>
                        void handlePayment(
                          request
                        )
                      }
                      disabled={isPaying}
                      className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isPaying && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      )}

                      {isPaying
                        ? "Opening..."
                        : `Pay ₹${Number(
                            request.agreed_amount
                          ).toLocaleString(
                            "en-IN"
                          )}`}
                    </button>
                  )}

                  {request.negotiation_status ===
                    "paid" && (
                    <span className="text-xs font-medium text-emerald-700">
                      Payment completed
                    </span>
                  )}

                  {request.status ===
                    "rejected" && (
                    <span className="text-xs font-medium text-red-600">
                      Worker declined this
                      request
                    </span>
                  )}

                  {request.status ===
                    "cancelled" && (
                    <span className="text-xs font-medium text-zinc-500">
                      Request withdrawn
                    </span>
                  )}
                </div>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}