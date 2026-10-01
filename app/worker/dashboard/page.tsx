"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  MessageSquare,
  X,
} from "lucide-react";

import { toast } from "sonner";

import { useAuthStore } from "@/store/authStore";

import {
  fetchWorkerHireRequests,
  updateWorkerHireRequest,
  type WorkerHireRequest,
} from "@/lib/api/worker";

type DashboardFilter =
  | "all"
  | "new"
  | "active"
  | "completed"
  | "closed";

function getRequestDetail(
  request: WorkerHireRequest,
  key: string
): string {
  const value =
    request.request_details?.[key];

  return typeof value === "string"
    ? value
    : "";
}

function formatDate(
  value?: string | null
) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      dateStyle: "medium",
    }
  );
}

function formatDateTime(
  value?: string | null
) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

function statusClasses(
  status: string
) {
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

function contractStatusClasses(
  status?: string | null
) {
  if (status === "completed") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "active") {
    return "bg-blue-50 text-blue-700";
  }

  if (
    status === "payment_pending"
  ) {
    return "bg-amber-50 text-amber-700";
  }

  if (
    status === "pending_payment"
  ) {
    return "bg-zinc-100 text-zinc-600";
  }

  return "bg-zinc-100 text-zinc-600";
}

function getRequestGroup(
  request: WorkerHireRequest
):
  | "new"
  | "active"
  | "completed"
  | "closed" {
  if (
    request.status ===
      "cancelled" ||
    request.status === "rejected"
  ) {
    return "closed";
  }

  if (
    request.contract_status ===
    "completed"
  ) {
    return "completed";
  }

  if (
    request.status === "accepted"
  ) {
    return "active";
  }

  return "new";
}

export default function WorkerDashboardPage() {
  const {
    user,
    isLoading: authLoading,
    fetchUser,
  } = useAuthStore();

  const [
    requests,
    setRequests,
  ] = useState<
    WorkerHireRequest[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [
    respondingId,
    setRespondingId,
  ] = useState<string | null>(
    null
  );

  const [
    activeFilter,
    setActiveFilter,
  ] =
    useState<DashboardFilter>(
      "all"
    );

  useEffect(() => {
    void fetchUser("worker");
  }, [fetchUser]);

  useEffect(() => {
    if (
      user?.role !== "worker"
    ) {
      return;
    }

    async function loadRequests() {
      try {
        setLoading(true);

        const data =
          await fetchWorkerHireRequests();

        setRequests(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load hiring requests."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadRequests();
  }, [user?.role]);

  async function respond(
    id: string,
    status:
      | "accepted"
      | "rejected"
  ) {
    if (respondingId) {
      return;
    }

    try {
      setRespondingId(id);

      await updateWorkerHireRequest(
        id,
        status
      );

      setRequests(
        (current) =>
          current.map(
            (request) =>
              request.id === id
                ? {
                    ...request,
                    status,
                    reviewed_at:
                      new Date().toISOString(),
                  }
                : request
          )
      );

      toast.success(
        status === "accepted"
          ? "Contract request accepted."
          : "Contract request rejected."
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update request."
      );
    } finally {
      setRespondingId(
        null
      );
    }
  }

  const summary = useMemo(
    () => {
      let newRequests = 0;
      let active = 0;
      let completed = 0;
      let closed = 0;

      for (const request of requests) {
        const group =
          getRequestGroup(
            request
          );

        if (group === "new") {
          newRequests += 1;
        } else if (
          group === "active"
        ) {
          active += 1;
        } else if (
          group ===
          "completed"
        ) {
          completed += 1;
        } else {
          closed += 1;
        }
      }

      return {
        newRequests,
        active,
        completed,
        closed,
      };
    },
    [requests]
  );

  const visibleRequests =
    useMemo(() => {
      const filtered =
        activeFilter === "all"
          ? requests
          : requests.filter(
              (request) =>
                getRequestGroup(
                  request
                ) ===
                activeFilter
            );

      return [...filtered].sort(
        (a, b) => {
          const priority = (
            request:
              WorkerHireRequest
          ) => {
            if (
              request.status ===
              "pending"
            ) {
              return 0;
            }

            if (
              request.status ===
                "accepted" &&
              request.contract_status !==
                "completed"
            ) {
              return 1;
            }

            if (
              request.contract_status ===
              "completed"
            ) {
              return 2;
            }

            return 3;
          };

          const difference =
            priority(a) -
            priority(b);

          if (difference !== 0) {
            return difference;
          }

          return (
            new Date(
              b.created_at
            ).getTime() -
            new Date(
              a.created_at
            ).getTime()
          );
        }
      );
    }, [
      requests,
      activeFilter,
    ]);

  if (
    authLoading ||
    loading
  ) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
      </div>
    );
  }

  if (
    user?.role !== "worker"
  ) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h2 className="font-heading text-xl font-semibold text-zinc-900">
          Worker account
          required
        </h2>

        <p className="mt-2 text-xs text-zinc-500">
          Sign in with a
          worker account to
          access this portal.
        </p>

        <Link
          href="/login?role=worker&redirect=/worker/dashboard"
          className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white"
        >
          Worker sign in
        </Link>
      </div>
    );
  }

  const filters: Array<{
    key: DashboardFilter;
    label: string;
  }> = [
    {
      key: "all",
      label: `All (${requests.length})`,
    },
    {
      key: "new",
      label: `New (${summary.newRequests})`,
    },
    {
      key: "active",
      label: `Active (${summary.active})`,
    },
    {
      key: "completed",
      label: `Completed (${summary.completed})`,
    },
    {
      key: "closed",
      label: `Closed (${summary.closed})`,
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs text-zinc-500">
            Welcome,{" "}
            {user.username}
          </p>

          <h1 className="mt-1 font-heading text-2xl font-semibold text-zinc-900">
            Work requests
          </h1>

          <p className="mt-1 text-xs text-zinc-500">
            Review new
            requests and track
            your active hiring
            contracts.
          </p>
        </div>
      </div>

      {/* Summary */}
      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <button
          type="button"
          onClick={() =>
            setActiveFilter(
              "new"
            )
          }
          className="rounded-xl border border-zinc-200 bg-white p-4 text-left shadow-xs transition hover:border-zinc-300"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            New requests
          </p>

          <p className="mt-2 text-2xl font-semibold text-zinc-900">
            {
              summary.newRequests
            }
          </p>

          <p className="mt-1 text-[11px] text-zinc-500">
            Waiting for your
            response
          </p>
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveFilter(
              "active"
            )
          }
          className="rounded-xl border border-zinc-200 bg-white p-4 text-left shadow-xs transition hover:border-zinc-300"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Active
          </p>

          <p className="mt-2 text-2xl font-semibold text-zinc-900">
            {summary.active}
          </p>

          <p className="mt-1 text-[11px] text-zinc-500">
            Accepted or in
            progress
          </p>
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveFilter(
              "completed"
            )
          }
          className="rounded-xl border border-zinc-200 bg-white p-4 text-left shadow-xs transition hover:border-zinc-300"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Completed
          </p>

          <p className="mt-2 text-2xl font-semibold text-zinc-900">
            {
              summary.completed
            }
          </p>

          <p className="mt-1 text-[11px] text-zinc-500">
            Finished contracts
          </p>
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveFilter(
              "closed"
            )
          }
          className="rounded-xl border border-zinc-200 bg-white p-4 text-left shadow-xs transition hover:border-zinc-300"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Closed
          </p>

          <p className="mt-2 text-2xl font-semibold text-zinc-900">
            {summary.closed}
          </p>

          <p className="mt-1 text-[11px] text-zinc-500">
            Rejected or
            withdrawn
          </p>
        </button>
      </section>

      {/* Requests */}
      <section className="mt-7">
        <div className="flex flex-col gap-4 border-b border-zinc-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">
              Hiring requests
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Review job
              requirements before
              accepting.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map(
              (filter) => (
                <button
                  key={
                    filter.key
                  }
                  type="button"
                  onClick={() =>
                    setActiveFilter(
                      filter.key
                    )
                  }
                  className={`rounded-md px-3 py-1.5 text-[11px] font-medium transition ${
                    activeFilter ===
                    filter.key
                      ? "bg-zinc-900 text-white"
                      : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {filter.label}
                </button>
              )
            )}
          </div>
        </div>

        {visibleRequests.length ===
        0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/40 py-14 text-center">
            <BriefcaseBusiness className="mx-auto h-8 w-8 text-zinc-300" />

            <h3 className="mt-3 text-sm font-semibold text-zinc-900">
              No requests in
              this section
            </h3>

            <p className="mt-1 text-xs text-zinc-500">
              Requests matching
              this status will
              appear here.
            </p>

            {activeFilter !==
              "all" && (
              <button
                type="button"
                onClick={() =>
                  setActiveFilter(
                    "all"
                  )
                }
                className="mt-4 text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                View all requests
              </button>
            )}
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {visibleRequests.map(
              (request) => {
                const jobTitle =
                  getRequestDetail(
                    request,
                    "job_title"
                  );

                const startDate =
                  getRequestDetail(
                    request,
                    "start_date"
                  );

                const duration =
                  getRequestDetail(
                    request,
                    "duration"
                  );

                const location =
                  getRequestDetail(
                    request,
                    "location"
                  );

                const shift =
                  getRequestDetail(
                    request,
                    "shift"
                  );

                const note =
                  getRequestDetail(
                    request,
                    "note"
                  );

                const isResponding =
                  respondingId ===
                  request.id;

                const isCancelled =
                  request.status ===
                  "cancelled";

                const isRejected =
                  request.status ===
                  "rejected";

                const isCompleted =
                  request.contract_status ===
                  "completed";

                const isActive =
                  request.status ===
                    "accepted" &&
                  !isCompleted;

                const myCompletion =
                  Boolean(
                    request.worker_completed_at
                  );

                const clientCompletion =
                  Boolean(
                    request.client_completed_at
                  );

                return (
                  <article
                    key={
                      request.id
                    }
                    className={`rounded-xl border bg-white p-5 shadow-xs ${
                      isCancelled ||
                      isRejected
                        ? "border-zinc-200 opacity-80"
                        : isActive
                          ? "border-blue-100"
                          : "border-zinc-200"
                    }`}
                  >
                    {/* Top */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                          Hiring partner
                        </p>

                        <h3 className="mt-1 text-base font-semibold text-zinc-900">
                          {request.hirer_name ||
                            "Hiring partner"}
                        </h3>

                        <p className="mt-1 text-xs text-zinc-500">
                          {request.hirer_email ||
                            "Contact details protected"}
                        </p>

                        <p className="mt-2 text-[11px] text-zinc-400">
                          Received{" "}
                          {formatDateTime(
                            request.created_at
                          )}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase ${statusClasses(
                            request.status
                          )}`}
                        >
                          {
                            request.status
                          }
                        </span>

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

                    {/* Requirement */}
                    <div className="mt-5 rounded-lg border border-zinc-100 bg-zinc-50/70 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        Work requirement
                      </p>

                      {jobTitle ? (
                        <h4 className="mt-2 text-sm font-semibold text-zinc-900">
                          {
                            jobTitle
                          }
                        </h4>
                      ) : (
                        <p className="mt-2 text-xs text-zinc-500">
                          No job title
                          specified.
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
                                  Start date
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
                                  {
                                    duration
                                  }
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
                                  {
                                    location
                                  }
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
                            Client note
                          </p>

                          <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-zinc-600">
                            {note}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Completion */}
                    {(request.contract_status ===
                      "active" ||
                      isCompleted) && (
                      <div className="mt-4 grid gap-3 rounded-lg border border-zinc-100 bg-white sm:grid-cols-2">
                        <div className="p-3">
                          <p className="text-[10px] uppercase tracking-wider text-zinc-400">
                            Your completion
                          </p>

                          <div className="mt-1.5 flex items-center gap-1.5">
                            {myCompletion && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            )}

                            <p
                              className={`text-xs font-medium ${
                                myCompletion
                                  ? "text-emerald-700"
                                  : "text-zinc-600"
                              }`}
                            >
                              {myCompletion
                                ? "Confirmed"
                                : "Awaiting confirmation"}
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-zinc-100 p-3 sm:border-l sm:border-t-0">
                          <p className="text-[10px] uppercase tracking-wider text-zinc-400">
                            Client
                            completion
                          </p>

                          <div className="mt-1.5 flex items-center gap-1.5">
                            {clientCompletion && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            )}

                            <p
                              className={`text-xs font-medium ${
                                clientCompletion
                                  ? "text-emerald-700"
                                  : "text-zinc-600"
                              }`}
                            >
                              {clientCompletion
                                ? "Confirmed"
                                : "Awaiting confirmation"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reviewed */}
                    {request.reviewed_at && (
                      <p className="mt-3 text-[10px] text-zinc-400">
                        Reviewed{" "}
                        {formatDateTime(
                          request.reviewed_at
                        )}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-zinc-100 pt-4">
                      {request.status ===
                        "pending" && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              void respond(
                                request.id,
                                "accepted"
                              )
                            }
                            disabled={
                              isResponding
                            }
                            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isResponding ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}

                            Accept
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void respond(
                                request.id,
                                "rejected"
                              )
                            }
                            disabled={
                              isResponding
                            }
                            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </>
                      )}

                      {request.status ===
                        "accepted" && (
                        <Link
                          href={`/worker/chat/${request.id}`}
                          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />

                          {isCompleted
                            ? "View contract"
                            : "Open conversation"}
                        </Link>
                      )}

                      {isCancelled && (
                        <span className="text-xs font-medium text-zinc-500">
                          Client withdrew
                          this hiring
                          request.
                        </span>
                      )}

                      {isRejected && (
                        <span className="text-xs font-medium text-red-600">
                          You declined
                          this hiring
                          request.
                        </span>
                      )}

                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Contract
                          completed
                        </span>
                      )}
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>
    </main>
  );
}