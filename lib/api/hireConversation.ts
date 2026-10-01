const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

export type HireMessage = {
  id: string;
  sender_user_id: string;
  sender_role: "client" | "worker" | string;
  message_type:
    | "message"
    | "offer"
    | "accept"
    | "payment"
    | "payment_order"
    | "completion_confirmation"
    | "contract_completion"
    | "request_review"
    | string;

  body: string;
  proposed_amount?: string | number | null;
  created_at: string;

  contract_status?: string | null;
  client_completed_at?: string | null;
  worker_completed_at?: string | null;
  completed_at?: string | null;
};

export type HirePayment = {
  status: string;
  amount: string | number;
  currency: string;
  razorpay_payment_id?: string | null;
  paid_at?: string | null;
};

export type HireConversation = {
  id: string;
  status: string;
  created_at?: string;
  reviewed_at?: string | null;
  agreed_at?: string | null;
  paid_at?: string | null;
  latest_offer_id?: string | null;
  request_details?: Record<string, unknown> | null;
  proposed_amount?: string | number | null;
  agreed_amount?: string | number | null;
  negotiation_status?: string | null;
  negotiation_proposed_by?: string | null;
  contract_status?: "pending_payment" | "payment_pending" | "active" | "completed" | string | null;
  client_completed_at?: string | null;
  worker_completed_at?: string | null;
  completed_at?: string | null;
  candidate_name?: string | null;
  client_name?: string | null;
  client_email?: string | null;
  candidate_designation?: string | null;
  candidate_city?: string | null;
  admin_notes?: string | null;
  payment?: HirePayment | null;
};

async function conversationRequest(path: string, role: "client" | "worker", init?: RequestInit) {
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-request-from": role,
      ...(init?.headers || {}),
    },
  });
}

export async function fetchHireConversation(id: string, role: "client" | "worker") {
  const response = await conversationRequest(`/api/hiring/requests/${id}/conversation`, role);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || "Unable to load conversation.");
  return payload.data as { request: HireConversation; messages: HireMessage[] };
}

export async function sendHireMessage(id: string, role: "client" | "worker", body: string) {
  const response = await conversationRequest(`/api/hiring/requests/${id}/messages`, role, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || "Unable to send message.");
  return payload.data as HireMessage;
}

export async function proposeHireAmount(id: string, role: "client" | "worker", amount: number, note: string) {
  const response = await conversationRequest(`/api/hiring/requests/${id}/negotiate`, role, {
    method: "POST",
    body: JSON.stringify({ amount, note }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || "Unable to submit offer.");
  return payload.data as HireMessage;
}

export async function acceptHireOffer(id: string, role: "client" | "worker", offerId: string) {
  const response = await conversationRequest(`/api/hiring/requests/${id}/negotiate/accept`, role, {
    method: "POST",
    body: JSON.stringify({ offer_id: offerId }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || "Unable to accept offer.");
  return payload.data as HireMessage;
}

export async function confirmHireContractCompletion(id: string, role: "client" | "worker") {
  const response = await conversationRequest(`/api/hiring/requests/${id}/complete`, role, { method: "POST" });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || "Unable to confirm completion.");
  return payload.data as Pick<HireConversation, "contract_status" | "client_completed_at" | "worker_completed_at" | "completed_at">;
}
