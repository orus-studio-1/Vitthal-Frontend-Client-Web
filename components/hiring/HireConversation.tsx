// "use client";

// import { useEffect, useState } from "react";
// import { io } from "socket.io-client";
// import { Loader2, Send } from "lucide-react";
// import { toast } from "sonner";
// import { useAuthStore } from "@/store/authStore";
// import { acceptHireOffer, confirmHireContractCompletion, fetchHireConversation, proposeHireAmount, sendHireMessage, type HireConversation, type HireMessage } from "@/lib/api/hireConversation";

// export default function HireConversation({ requestId }: { requestId: string }) {
//   const { user, isLoading: authLoading, fetchUser } = useAuthStore();
//   const [request, setRequest] = useState<HireConversation | null>(null);
//   const [messages, setMessages] = useState<HireMessage[]>([]);
//   const [message, setMessage] = useState("");
//   const [amount, setAmount] = useState("");
//   const [offerNote, setOfferNote] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [sending, setSending] = useState(false);

//   const role = user?.role === "worker" ? "worker" : user?.role === "client" ? "client" : null;

//   async function loadConversation(activeRole: "client" | "worker") {
//     try {
//       const data = await fetchHireConversation(requestId, activeRole);
//       setRequest(data.request);
//       setMessages(data.messages);
//     } catch (error) {
//       toast.error(error instanceof Error ? error.message : "Unable to load conversation.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     void fetchUser();
//   }, [fetchUser]);
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

//   useEffect(() => {
//     if (role) void loadConversation(role);
//   }, [role, requestId]);
  
//   useEffect(() => {
//     if (!role) return;
//     const socket = io(`${API_BASE_URL}/hire-chat`, { withCredentials: true, transports: ["websocket", "polling"] });
//     const handleLiveMessage = (incoming: HireMessage) => {
//       setMessages((current) => current.some((item) => item.id === incoming.id) ? current : [...current, incoming]);
//       if (incoming.message_type === "accept") {
//         setRequest((current) => current ? { ...current, agreed_amount: incoming.proposed_amount, negotiation_status: "agreed" } : current);
//       }
//       if (incoming.message_type === "offer") {
//         setRequest((current) => current ? { ...current, proposed_amount: incoming.proposed_amount, negotiation_status: "proposed", negotiation_proposed_by: incoming.sender_user_id } : current);
//       }
//       if (incoming.message_type === "completion_confirmation" || incoming.message_type === "contract_completion") {
//         setRequest((current) => current ? {
//           ...current,
//           contract_status: incoming.contract_status || current.contract_status,
//           client_completed_at: incoming.client_completed_at || current.client_completed_at,
//           worker_completed_at: incoming.worker_completed_at || current.worker_completed_at,
//           completed_at: incoming.completed_at || current.completed_at,
//         } : current);
//       }
//     };
//     socket.on("connect", () => socket.emit("join_request", requestId));
//     socket.on("hire_message", handleLiveMessage);
//     return () => { socket.off("hire_message", handleLiveMessage); socket.disconnect(); };
//   }, [role, requestId]);

//   async function submitMessage(event: React.FormEvent) {
//     event.preventDefault();
//     if (!role || !message.trim()) return;
//     try {
//       setSending(true);
//       const created = await sendHireMessage(requestId, role, message.trim());
//       setMessages((current) => [...current, created]);
//       setMessage("");
//     } catch (error) {
//       toast.error(error instanceof Error ? error.message : "Unable to send message.");
//     } finally {
//       setSending(false);
//     }
//   }

//   async function submitOffer(event: React.FormEvent) {
//     event.preventDefault();
//     if (!role || !Number(amount)) return;
//     try {
//       setSending(true);
//       const created = await proposeHireAmount(requestId, role, Number(amount), offerNote.trim());
//       setMessages((current) => [...current, created]);
//       setRequest((current) => current ? { ...current, proposed_amount: Number(amount), negotiation_status: "proposed" } : current);
//       setAmount("");
//       setOfferNote("");
//       toast.success("Negotiation offer sent.");
//     } catch (error) {
//       toast.error(error instanceof Error ? error.message : "Unable to submit offer.");
//     } finally {
//       setSending(false);
//     }
//   }

//   // async function acceptOffer() {
//   //   if (!role) return;
//   //   try {
//   //     setSending(true);
//   //     const created = await acceptHireOffer(requestId, role,request?.latest_offer_id);
//   //     setMessages((current) => [...current, created]);
//   //     setRequest((current) => current ? { ...current, agreed_amount: current.proposed_amount, negotiation_status: "agreed" } : current);
//   //     toast.success("Offer accepted. The client can now complete payment.");
//   //   } catch (error) {
//   //     toast.error(error instanceof Error ? error.message : "Unable to accept offer.");
//   //   } finally {
//   //     setSending(false);
//   //   }
//   // }

//   async function acceptOffer() {
//   if (!role || !request) return;

//   if (!request.latest_offer_id) {
//     toast.error("Latest offer not found. Please refresh the conversation.");
//     return;
//   }

//   try {
//     setSending(true);

//     const created = await acceptHireOffer(
//       requestId,
//       role,
//       request.latest_offer_id
//     );

//     setMessages((current) => [...current, created]);

//     setRequest((current) =>
//       current
//         ? {
//             ...current,
//             agreed_amount: current.proposed_amount,
//             negotiation_status: "agreed",
//           }
//         : current
//     );

//     toast.success("Offer accepted. The client can now complete payment.");
//   } catch (error) {
//     toast.error(
//       error instanceof Error
//         ? error.message
//         : "Unable to accept offer."
//     );
//   } finally {
//     setSending(false);
//   }
// }

//   async function confirmCompletion() {
//     if (!role) return;
//     try {
//       setSending(true);
//       const updated = await confirmHireContractCompletion(requestId, role);
//       setRequest((current) => current ? { ...current, ...updated } : current);
//       toast.success(updated.contract_status === "completed" ? "Contract completed. Worker is available for new requests." : "Completion confirmed. Waiting for the other party.");
//     } catch (error) {
//       toast.error(error instanceof Error ? error.message : "Unable to confirm completion.");
//     } finally {
//       setSending(false);
//     }
//   }

//   if (authLoading || loading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-blue-600" /></div>;
//   if (!role) return <p className="mx-auto max-w-md px-4 py-20 text-center text-sm text-zinc-500">Please sign in as a client or worker.</p>;

//   return (
//     <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
//       <div className="flex flex-col justify-between gap-3 border-b border-zinc-200 pb-5 sm:flex-row sm:items-end">
//         <div><p className="text-xs text-zinc-500">Hiring conversation</p><h1 className="mt-1 font-heading text-2xl font-semibold text-zinc-900">{role === "client" ? request?.candidate_name : request?.client_name}</h1><p className="mt-1 text-xs capitalize text-zinc-500">Contract: {request?.contract_status?.replace(/_/g, " ") || "pending payment"}</p></div>
//         <div className="text-left sm:text-right"><p className="text-[10px] uppercase text-zinc-400">Negotiation</p><p className="text-sm font-semibold text-zinc-900">{request?.proposed_amount ? `₹${Number(request.proposed_amount).toLocaleString("en-IN")}` : "No offer yet"}</p></div>
//       </div>

//       <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
//         {request?.contract_status === "active" && <div className="mb-4 flex flex-col gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold text-zinc-900">Contract completion</p><p className="mt-1 text-[11px] text-zinc-600">Your confirmation: {role === "client" ? request.client_completed_at ? "confirmed" : "not confirmed" : request.worker_completed_at ? "confirmed" : "not confirmed"}. Other party: {role === "client" ? request.worker_completed_at ? "confirmed" : "waiting" : request.client_completed_at ? "confirmed" : "waiting"}.</p></div>{!(role === "client" ? request.client_completed_at : request.worker_completed_at) && <button type="button" onClick={() => void confirmCompletion()} disabled={sending} className="shrink-0 rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-50">Confirm contract complete</button>}</div>}
//         {request?.contract_status === "completed" && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">Both parties confirmed completion. The worker is available for new hiring requests.</div>}
//         <div className="min-h-64 space-y-3">
//           {messages.length === 0 ? <p className="py-16 text-center text-xs text-zinc-500">Conversation started. Send a message or make an offer.</p> : messages.map((item) => (
//             <div key={item.id} className={`flex ${item.sender_role === role ? "justify-end" : "justify-start"}`}>
//               <div className={`max-w-[85%] rounded-xl px-4 py-3 text-xs ${item.sender_role === role ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-800"}`}>
//                 {item.message_type === "offer" && <p className="mb-1 font-semibold">Offer: ₹{Number(item.proposed_amount).toLocaleString("en-IN")}</p>}
//                 <p>{item.body}</p><p className={`mt-1 text-[10px] ${item.sender_role === role ? "text-blue-100" : "text-zinc-400"}`}>{new Date(item.created_at).toLocaleString()}</p>
//               </div>
//             </div>
//           ))}
//         </div>

//         {request?.negotiation_status === "proposed" && request.negotiation_proposed_by !== user?.userId && <div className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3"><p className="text-xs text-amber-800">Latest offer: ₹{Number(request.proposed_amount).toLocaleString("en-IN")}</p><button type="button" onClick={() => void acceptOffer()} disabled={sending} className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-50">Accept offer</button></div>}
//         <form onSubmit={submitOffer} className="mt-5 grid gap-2 border-t border-zinc-100 pt-4 sm:grid-cols-[150px_1fr_auto]">
//           <input type="number" min="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Amount (₹)" className="rounded-lg border border-zinc-200 px-3 py-2 text-xs outline-none focus:border-blue-600" />
//           <input value={offerNote} onChange={(event) => setOfferNote(event.target.value)} placeholder="Offer note, schedule, or terms" className="rounded-lg border border-zinc-200 px-3 py-2 text-xs outline-none focus:border-blue-600" />
//           <button type="submit" disabled={sending || !amount} className="rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-700 disabled:opacity-50">Make offer</button>
//         </form>
//         <form onSubmit={submitMessage} className="mt-2 flex gap-2">
//           <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write a message..." className="min-w-0 flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-xs outline-none focus:border-blue-600" />
//           <button type="submit" disabled={sending || !message.trim()} aria-label="Send message" className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white disabled:opacity-50"><Send className="h-3.5 w-3.5" /> Send</button>
//         </form>
//       </section>
//     </main>
//   );
// }

"use client";

import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { useAuthStore } from "@/store/authStore";

import {
  acceptHireOffer,
  confirmHireContractCompletion,
  fetchHireConversation,
  proposeHireAmount,
  sendHireMessage,
  type HireConversation,
  type HireMessage,
} from "@/lib/api/hireConversation";

import HireProgress from "@/components/hiring/HireProgress";
import HirePaymentActions from "@/components/hiring/HirePaymentActions";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

type Role = "client" | "worker";

function addMessageIfMissing(
  current: HireMessage[],
  incoming: HireMessage
) {
  return current.some((item) => item.id === incoming.id)
    ? current
    : [...current, incoming];
}

export default function HireConversation({
  requestId,
}: {
  requestId: string;
}) {
  const {
    user,
    isLoading: authLoading,
    fetchUser,
  } = useAuthStore();

  const [request, setRequest] =
    useState<HireConversation | null>(null);

  const [messages, setMessages] =
    useState<HireMessage[]>([]);

  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("");
  const [offerNote, setOfferNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const role: Role | null =
    user?.role === "worker"
      ? "worker"
      : user?.role === "client"
        ? "client"
        : null;

  /**
   * Reload the conversation from the backend.
   *
   * This is our authoritative source of truth for:
   * - negotiation status
   * - agreed amount
   * - payment status
   * - contract status
   * - completion status
   */
  const loadConversation = useCallback(
    async (
      activeRole: Role,
      options?: {
        silent?: boolean;
      }
    ) => {
      try {
        const data = await fetchHireConversation(
          requestId,
          activeRole
        );

        setRequest(data.request);
        setMessages(data.messages);
      } catch (error) {
        if (!options?.silent) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Unable to load conversation."
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [requestId]
  );

  /**
   * Authentication
   */
  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  /**
   * Initial conversation load.
   */
  useEffect(() => {
    if (!role) return;

    void loadConversation(role);
  }, [role, loadConversation]);

  /**
   * Real-time hiring socket.
   *
   * hire_message:
   *   Immediately append chat / offer / lifecycle messages.
   *
   * hire_request_updated:
   *   Refetch request state from the backend.
   *
   * This prevents React from having to reproduce the entire
   * backend hiring state machine.
   */
  useEffect(() => {
    if (!role) return;

    const socket = io(`${API_BASE_URL}/hire-chat`, {
      withCredentials: true,
      transports: ["websocket", "polling"],

      // Backend uses this to select the correct role cookie.
      auth: {
        role,
      },
    });

    const handleLiveMessage = (
      incoming: HireMessage
    ) => {
      setMessages((current) =>
        addMessageIfMissing(current, incoming)
      );

      /**
       * Fast local UI updates.
       *
       * The hire_request_updated event will still refetch
       * canonical state afterwards.
       */
      if (incoming.message_type === "offer") {
        setRequest((current) =>
          current
            ? {
                ...current,
                proposed_amount:
                  incoming.proposed_amount,
                negotiation_status: "proposed",
                negotiation_proposed_by:
                  incoming.sender_user_id,
                latest_offer_id: incoming.id,
              }
            : current
        );
      }

      if (incoming.message_type === "accept") {
        setRequest((current) =>
          current
            ? {
                ...current,
                agreed_amount:
                  incoming.proposed_amount ??
                  current.proposed_amount,
                negotiation_status: "agreed",
              }
            : current
        );
      }
    };

    const handleRequestUpdated = (payload?: {
      requestId?: string;
    }) => {
      if (
        payload?.requestId &&
        payload.requestId !== requestId
      ) {
        return;
      }

      void loadConversation(role, {
        silent: true,
      });
    };

    socket.on("connect", () => {
      socket.emit("join_request", requestId);
    });

    socket.on(
      "hire_message",
      handleLiveMessage
    );

    socket.on(
      "hire_request_updated",
      handleRequestUpdated
    );

    return () => {
      socket.emit("leave_request", requestId);

      socket.off(
        "hire_message",
        handleLiveMessage
      );

      socket.off(
        "hire_request_updated",
        handleRequestUpdated
      );

      socket.disconnect();
    };
  }, [
    role,
    requestId,
    loadConversation,
  ]);

  /**
   * Send normal chat message.
   */
  async function submitMessage(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (
      !role ||
      !request ||
      !message.trim()
    ) {
      return;
    }

    if (
      request.contract_status === "completed"
    ) {
      toast.error(
        "This contract is completed."
      );
      return;
    }

    try {
      setSending(true);

      const created =
        await sendHireMessage(
          requestId,
          role,
          message.trim()
        );

      setMessages((current) =>
        addMessageIfMissing(
          current,
          created
        )
      );

      setMessage("");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  }

  /**
   * Make / counter an offer.
   */
  async function submitOffer(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!role || !request) return;

    const numericAmount =
      Number(amount);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      toast.error(
        "Enter a valid amount."
      );
      return;
    }

    /**
     * Negotiation is only allowed while backend
     * negotiation state is open/proposed and the
     * contract has not entered payment flow.
     */
    if (
      !["open", "proposed"].includes(
        request.negotiation_status || ""
      ) ||
      request.contract_status !==
        "pending_payment"
    ) {
      toast.error(
        "The amount is already locked and cannot be changed."
      );
      return;
    }

    try {
      setSending(true);

      const created =
        await proposeHireAmount(
          requestId,
          role,
          numericAmount,
          offerNote.trim()
        );

      setMessages((current) =>
        addMessageIfMissing(
          current,
          created
        )
      );

      setRequest((current) =>
        current
          ? {
              ...current,
              proposed_amount:
                created.proposed_amount ??
                numericAmount,

              negotiation_status:
                "proposed",

              negotiation_proposed_by:
                created.sender_user_id,

              latest_offer_id:
                created.id,
            }
          : current
      );

      setAmount("");
      setOfferNote("");

      toast.success(
        "Negotiation offer sent."
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to submit offer."
      );
    } finally {
      setSending(false);
    }
  }

  /**
   * Accept the latest offer.
   */
  async function acceptOffer() {
    if (!role || !request) return;

    if (
      request.negotiation_status !==
      "proposed"
    ) {
      toast.error(
        "There is no open offer to accept."
      );
      return;
    }

    if (!request.latest_offer_id) {
      toast.error(
        "Latest offer not found. Please refresh the conversation."
      );
      return;
    }

    if (
      request.negotiation_proposed_by ===
      user?.userId
    ) {
      toast.error(
        "You cannot accept your own offer."
      );
      return;
    }

    try {
      setSending(true);

      const created =
        await acceptHireOffer(
          requestId,
          role,
          request.latest_offer_id
        );

      setMessages((current) =>
        addMessageIfMissing(
          current,
          created
        )
      );

      setRequest((current) =>
        current
          ? {
              ...current,

              agreed_amount:
                created.proposed_amount ??
                current.proposed_amount,

              negotiation_status:
                "agreed",
            }
          : current
      );

      toast.success(
        role === "client"
          ? "Offer accepted. You can now complete payment."
          : "Offer accepted. Waiting for the client to complete payment."
      );

      /**
       * Refetch so agreed_at and any other
       * server-generated fields are available.
       */
      await loadConversation(role, {
        silent: true,
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to accept offer."
      );
    } finally {
      setSending(false);
    }
  }

  /**
   * Confirm contract completion.
   */
  async function confirmCompletion() {
    if (!role || !request) return;

    if (
      request.contract_status !== "active"
    ) {
      toast.error(
        "Only an active paid contract can be completed."
      );
      return;
    }

    const alreadyConfirmed =
      role === "client"
        ? Boolean(
            request.client_completed_at
          )
        : Boolean(
            request.worker_completed_at
          );

    if (alreadyConfirmed) return;

    try {
      setSending(true);

      const updated =
        await confirmHireContractCompletion(
          requestId,
          role
        );

      setRequest((current) =>
        current
          ? {
              ...current,
              ...updated,
            }
          : current
      );

      if (
        updated.contract_status ===
        "completed"
      ) {
        toast.success(
          "Contract completed. The worker is now available for new requests."
        );
      } else {
        toast.success(
          "Completion confirmed. Waiting for the other party."
        );
      }

      await loadConversation(role, {
        silent: true,
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to confirm completion."
      );
    } finally {
      setSending(false);
    }
  }

  /**
   * Loading state
   */
  if (authLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
      </div>
    );
  }

  /**
   * Unsupported role
   */
  if (!role) {
    return (
      <p className="mx-auto max-w-md px-4 py-20 text-center text-sm text-zinc-500">
        Please sign in as a client or
        worker.
      </p>
    );
  }

  /**
   * Request unavailable
   */
  if (!request) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h2 className="text-sm font-semibold text-zinc-900">
          Hiring conversation unavailable
        </h2>

        <p className="mt-2 text-xs text-zinc-500">
          The hiring request could not be
          loaded.
        </p>
      </div>
    );
  }

  const negotiationOpen =
    request.status === "accepted" &&
    request.contract_status ===
      "pending_payment" &&
    ["open", "proposed"].includes(
      request.negotiation_status || ""
    );

  const hasIncomingOffer =
    request.negotiation_status ===
      "proposed" &&
    Boolean(request.latest_offer_id) &&
    request.negotiation_proposed_by !==
      user?.userId;

  const isAgreed =
    request.negotiation_status ===
      "agreed";

  const isPaymentPending =
    request.contract_status ===
      "payment_pending";

  const isPaid =
    request.negotiation_status ===
      "paid" ||
    request.contract_status === "active" ||
    request.contract_status ===
      "completed";

  const isActive =
    request.contract_status === "active";

  const isCompleted =
    request.contract_status ===
      "completed";

  const myCompletionConfirmed =
    role === "client"
      ? Boolean(
          request.client_completed_at
        )
      : Boolean(
          request.worker_completed_at
        );

  const otherCompletionConfirmed =
    role === "client"
      ? Boolean(
          request.worker_completed_at
        )
      : Boolean(
          request.client_completed_at
        );

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs text-zinc-500">
            Hiring conversation
          </p>

          <h1 className="mt-1 font-heading text-2xl font-semibold text-zinc-900">
            {role === "client"
              ? request.candidate_name ||
                "Worker"
              : request.client_name ||
                "Client"}
          </h1>

          <p className="mt-1 text-xs text-zinc-500">
            Discuss the work, schedule and
            contract terms here.
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Current amount
          </p>

          <p className="mt-1 text-sm font-semibold text-zinc-900">
            {request.agreed_amount
              ? `₹${Number(
                  request.agreed_amount
                ).toLocaleString(
                  "en-IN"
                )}`
              : request.proposed_amount
                ? `₹${Number(
                    request.proposed_amount
                  ).toLocaleString(
                    "en-IN"
                  )}`
                : "Not negotiated"}
          </p>
        </div>
      </div>

      {/* Canonical hiring progress */}
      <div className="mt-6">
        <HireProgress request={request} />
      </div>

      {/* Payment area */}
      {(isAgreed ||
        isPaymentPending) && (
        <section className="mt-5 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
          {role === "client" ? (
            <>
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-zinc-900">
                  Complete hiring payment
                </h2>

                <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                  The amount has been
                  agreed. Complete payment
                  to lock this worker and
                  activate the contract.
                </p>
              </div>

              <HirePaymentActions
                request={request}
                onUpdated={async () => {
                  await loadConversation(
                    role,
                    {
                      silent: true,
                    }
                  );
                }}
              />
            </>
          ) : (
            <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
              <p className="text-xs font-semibold text-amber-900">
                Waiting for client payment
              </p>

              <p className="mt-1 text-xs leading-relaxed text-amber-700">
                The amount has been agreed.
                The client must complete
                payment before the hiring
                contract becomes active.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Active contract completion */}
      {isActive && (
        <section className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-900">
                Contract completion
              </p>

              <p className="mt-1 text-[11px] leading-relaxed text-zinc-600">
                Your confirmation:{" "}
                <strong>
                  {myCompletionConfirmed
                    ? "confirmed"
                    : "not confirmed"}
                </strong>
                . Other party:{" "}
                <strong>
                  {otherCompletionConfirmed
                    ? "confirmed"
                    : "waiting"}
                </strong>
                .
              </p>
            </div>

            {!myCompletionConfirmed && (
              <button
                type="button"
                onClick={() =>
                  void confirmCompletion()
                }
                disabled={sending}
                className="shrink-0 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending
                  ? "Confirming..."
                  : "Confirm contract complete"}
              </button>
            )}
          </div>
        </section>
      )}

      {/* Completed */}
      {isCompleted && (
        <section className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-semibold text-emerald-900">
            Contract completed
          </p>

          <p className="mt-1 text-xs leading-relaxed text-emerald-700">
            Both parties confirmed
            completion. This worker is
            available for new hiring
            requests.
          </p>
        </section>
      )}

      {/* Conversation */}
      <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
        <div className="border-b border-zinc-100 pb-4">
          <h2 className="text-sm font-semibold text-zinc-900">
            Conversation
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Messages and negotiation events
            for this hiring request.
          </p>
        </div>

        {/* Messages */}
        <div className="min-h-64 space-y-3 py-5">
          {messages.length === 0 ? (
            <p className="py-16 text-center text-xs text-zinc-500">
              Conversation started. Send a
              message or make an offer.
            </p>
          ) : (
            messages.map((item) => {
              const mine =
                item.sender_role === role;

              const systemMessage = [
                "request_review",
                "payment_order",
                "payment",
                "completion_confirmation",
                "contract_completion",
              ].includes(
                item.message_type
              );

              if (systemMessage) {
                return (
                  <div
                    key={item.id}
                    className="flex justify-center"
                  >
                    <div className="max-w-xl rounded-lg bg-zinc-50 px-4 py-2.5 text-center">
                      <p className="text-[11px] font-medium text-zinc-600">
                        {item.body}
                      </p>

                      <p className="mt-1 text-[10px] text-zinc-400">
                        {new Date(
                          item.created_at
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={item.id}
                  className={`flex ${
                    mine
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-3 text-xs ${
                      mine
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-100 text-zinc-800"
                    }`}
                  >
                    {item.message_type ===
                      "offer" && (
                      <p className="mb-2 font-semibold">
                        Offer:{" "}
                        ₹
                        {Number(
                          item.proposed_amount ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    )}

                    {item.message_type ===
                      "accept" && (
                      <p className="mb-2 font-semibold">
                        Amount accepted:{" "}
                        ₹
                        {Number(
                          item.proposed_amount ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    )}

                    {item.body && (
                      <p className="whitespace-pre-wrap break-words">
                        {item.body}
                      </p>
                    )}

                    <p
                      className={`mt-2 text-[10px] ${
                        mine
                          ? "text-blue-100"
                          : "text-zinc-400"
                      }`}
                    >
                      {new Date(
                        item.created_at
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Incoming offer */}
        {hasIncomingOffer && (
          <div className="mb-4 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                Latest offer
              </p>

              <p className="mt-1 text-sm font-semibold text-amber-900">
                ₹
                {Number(
                  request.proposed_amount ||
                    0
                ).toLocaleString(
                  "en-IN"
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void acceptOffer()
              }
              disabled={sending}
              className="rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending
                ? "Accepting..."
                : "Accept offer"}
            </button>
          </div>
        )}

        {/* Waiting for other party */}
        {request.negotiation_status ===
          "proposed" &&
          request.negotiation_proposed_by ===
            user?.userId && (
            <div className="mb-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-xs text-zinc-600">
                Your offer of{" "}
                <strong>
                  ₹
                  {Number(
                    request.proposed_amount ||
                      0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>{" "}
                is waiting for the other
                party.
              </p>
            </div>
          )}

        {/* Negotiation */}
        {negotiationOpen && (
          <form
            onSubmit={submitOffer}
            className="grid gap-2 border-t border-zinc-100 pt-4 sm:grid-cols-[160px_1fr_auto]"
          >
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(event) =>
                setAmount(
                  event.target.value
                )
              }
              placeholder="Amount (₹)"
              disabled={sending}
              className="rounded-lg border border-zinc-200 px-3 py-2.5 text-xs outline-none focus:border-blue-600 disabled:bg-zinc-50"
            />

            <input
              value={offerNote}
              onChange={(event) =>
                setOfferNote(
                  event.target.value
                )
              }
              placeholder="Offer note, schedule, or terms"
              disabled={sending}
              maxLength={5000}
              className="rounded-lg border border-zinc-200 px-3 py-2.5 text-xs outline-none focus:border-blue-600 disabled:bg-zinc-50"
            />

            <button
              type="submit"
              disabled={
                sending || !amount
              }
              className="rounded-lg border border-zinc-200 px-4 py-2.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Make offer
            </button>
          </form>
        )}

        {/* Locked amount */}
        {(isAgreed ||
          isPaymentPending ||
          isPaid) && (
          <div className="border-t border-zinc-100 py-3">
            <p className="text-[11px] text-zinc-500">
              Negotiation closed. Agreed
              amount:{" "}
              <strong className="text-zinc-800">
                ₹
                {Number(
                  request.agreed_amount ||
                    request.proposed_amount ||
                    0
                ).toLocaleString(
                  "en-IN"
                )}
              </strong>
            </p>
          </div>
        )}

        {/* Normal chat */}
        {!isCompleted ? (
          <form
            onSubmit={submitMessage}
            className="mt-2 flex gap-2"
          >
            <input
              value={message}
              onChange={(event) =>
                setMessage(
                  event.target.value
                )
              }
              maxLength={5000}
              placeholder="Write a message..."
              disabled={sending}
              className="min-w-0 flex-1 rounded-lg border border-zinc-200 px-3 py-2.5 text-xs outline-none focus:border-blue-600 disabled:bg-zinc-50"
            />

            <button
              type="submit"
              disabled={
                sending ||
                !message.trim()
              }
              aria-label="Send message"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />

              {sending
                ? "Sending..."
                : "Send"}
            </button>
          </form>
        ) : (
          <div className="mt-3 rounded-lg bg-zinc-50 p-3 text-center">
            <p className="text-xs text-zinc-500">
              This contract is complete.
              The conversation is now
              read-only.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}