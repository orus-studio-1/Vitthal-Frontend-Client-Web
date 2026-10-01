import type { HireConversation } from "./hireConversation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

export interface CandidateDocument {
  id: string;
  doc_type: string;
  doc_name?: string | null;
  doc_url: string;
  created_at: string;
}

export interface CandidateListItem {
  id: string;
  full_name: string;
  city?: string | null;
  state?: string | null;
  designation?: string | null;
  experience_years: number;
  skills: string[];
  metadata: {
    hiring_type?: string;
    expected_salary?: string | number;
    bio?: string;
    [key: string]: any;
  };
  photo_url?: string | null;
  is_available: boolean;
  created_at: string;
  documents?: CandidateDocument[];
}

export interface FetchCandidatesResult {
  candidates: CandidateListItem[];
  total: number;
}

export interface CandidateRegistrationPayload {
  full_name: string;
  email?: string;
  phone: string;
  city?: string;
  state?: string;
  pincode?: string;
  address_line?: string;
  designation?: string;
  experience_years?: number;
  skills?: string[];
  metadata?: Record<string, any>;
  photo_url?: string;
  documents?: Array<{ doc_type: string; doc_url: string; doc_name?: string; doc_number?: string }>;
}

export async function createHireRequest(candidateId: string, requestDetails: Record<string, unknown> = {}) {
  const res = await fetch(`${API_BASE_URL}/api/hiring/requests`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-request-from": "client",
    },
    body: JSON.stringify({ candidate_id: candidateId, request_details: requestDetails }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to send hiring request.");
  return json;
}

export async function fetchClientHireRequests(): Promise<HireConversation[]> {
  const res = await fetch(`${API_BASE_URL}/api/hiring/my-requests`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", "x-request-from": "client" },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to load hiring requests.");
  return Array.isArray(json.data) ? json.data : [];
}

export async function cancelHireRequest(
  requestId: string
) {
  const res = await fetch(
    `${API_BASE_URL}/api/hiring/requests/${requestId}/cancel`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "x-request-from": "client",
      },
    }
  );

  const json = await res.json();

  if (!res.ok) {
    throw new Error(
      json.message ||
        "Failed to cancel hiring request."
    );
  }

  return json.data;
}

export async function createHirePaymentOrder(requestId: string) {
  const res = await fetch(`${API_BASE_URL}/api/hiring/requests/${requestId}/payment/order`, {
    method: "POST", credentials: "include", headers: { "Content-Type": "application/json", "x-request-from": "client" },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to start payment.");
  return json;
}

export async function reconcileHirePayment(requestId: string): Promise<{ status: string; message?: string }> {
  const res = await fetch(`${API_BASE_URL}/api/hiring/requests/${requestId}/payment/reconcile`, {
    method: "POST", credentials: "include", headers: { "Content-Type": "application/json", "x-request-from": "client" },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Unable to check payment status.");
  return json;
}

export async function verifyHirePayment(requestId: string, payment: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
  const res = await fetch(`${API_BASE_URL}/api/hiring/requests/${requestId}/payment/verify`, {
    method: "POST", credentials: "include", headers: { "Content-Type": "application/json", "x-request-from": "client" }, body: JSON.stringify(payment),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Payment verification failed.");
  return json;
}

export async function fetchCandidates(params?: {
  city?: string;
  skills?: string;
  designation?: string;
  search?: string;
  experience_min?: number;
  experience_max?: number;
  page?: number;
  limit?: number;
}): Promise<FetchCandidatesResult> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.city) searchParams.set("city", params.city);
    if (params?.skills) searchParams.set("skills", params.skills);
    if (params?.designation) searchParams.set("designation", params.designation);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.experience_min) searchParams.set("experience_min", String(params.experience_min));
    if (params?.experience_max) searchParams.set("experience_max", String(params.experience_max));

    const res = await fetch(`${API_BASE_URL}/api/hiring/candidates?${searchParams.toString()}`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "x-request-from": "client",
      },
    });

    if (!res.ok) return { candidates: [], total: 0 };
    const json = await res.json();
    return {
      candidates: Array.isArray(json.data) ? json.data : [],
      total: json.pagination?.total ?? 0,
    };
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return { candidates: [], total: 0 };
  }
}

// export async function fetchCandidateDetail(id: string): Promise<CandidateListItem | null> {
//   try {
//     const res = await fetch(`${API_BASE_URL}/api/hiring/candidates/${id}`, {
//       cache: "no-store",
//       headers: {
//         "Content-Type": "application/json",
//         "x-request-from": "client",
//       },
//     });

//     if (!res.ok) return null;
//     const json = await res.json();
//     return json.data || null;
//   } catch (error) {
//     console.error("Error fetching candidate detail:", error);
//     return null;
//   }
// }

export async function fetchCandidateDetail(
  id: string
): Promise<CandidateListItem | null> {
  const res = await fetch(
    `${API_BASE_URL}/api/hiring/candidates/${id}`,
    {
      cache: "no-store",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "x-request-from": "client",
      },
    }
  );

  const json = await res.json();

  if (!res.ok) {
    throw new Error(
      json.message ||
        "Failed to load candidate."
    );
  }

  return json.data || null;
}

export async function registerCandidateProfile(
  payload: CandidateRegistrationPayload
): Promise<{ success: boolean; message?: string; data?: any }> {
  const res = await fetch(`${API_BASE_URL}/api/hiring/register`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-request-from": "worker",
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Failed to submit candidate profile.");
  }
  return json;
}

export type HiringAccessStatus = {
  hasAccess: boolean;
  amount: number;
  currency: string;
};

export async function fetchHiringAccessStatus(): Promise<HiringAccessStatus> {
  const res = await fetch(
    `${API_BASE_URL}/api/hiring/access`,
    {
      credentials: "include",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "x-request-from": "client",
      },
    }
  );

  const json = await res.json();

  if (!res.ok) {
    throw new Error(
      json.message ||
        "Unable to check hiring access."
    );
  }

  return {
    hasAccess: Boolean(json.hasAccess),
    amount: Number(json.amount || 100),
    currency: json.currency || "INR",
  };
}

export async function createHiringAccessPaymentOrder() {
  const res = await fetch(
    `${API_BASE_URL}/api/hiring/access/payment/order`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "x-request-from": "client",
      },
    }
  );

  const json = await res.json();

  if (!res.ok) {
    throw new Error(
      json.message ||
        "Unable to start hiring access payment."
    );
  }

  return json;
}

export async function verifyHiringAccessPayment(
  payment: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }
) {
  const res = await fetch(
    `${API_BASE_URL}/api/hiring/access/payment/verify`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "x-request-from": "client",
      },
      body: JSON.stringify(payment),
    }
  );

  const json = await res.json();

  if (!res.ok) {
    throw new Error(
      json.message ||
        "Hiring access payment verification failed."
    );
  }

  return json;
}