const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

// export type WorkerHireRequest = {
//   id: string;
//   status: "pending" | "accepted" | "rejected" | string;
//   request_details?: Record<string, unknown> | null;
//   admin_notes?: string | null;
//   created_at: string;
//   reviewed_at?: string | null;
//   hirer_name?: string | null;
//   hirer_email?: string | null;
//   candidate_name?: string | null;
//   candidate_designation?: string | null;
//   contract_status?: string | null;
//   client_completed_at?: string | null;
//   worker_completed_at?: string | null;
//   completed_at?: string | null;
// };

export type WorkerHireRequest = {
  id: string;
  status: "pending" | "accepted" | "rejected" | string;

  request_details?: {
    job_title?: string | null;
    start_date?: string | null;
    duration?: string | null;
    location?: string | null;
    shift?: string | null;
    note?: string | null;
    [key: string]: unknown;
  } | null;

  admin_notes?: string | null;
  created_at: string;
  reviewed_at?: string | null;
  hirer_name?: string | null;
  hirer_email?: string | null;
  candidate_name?: string | null;
  candidate_designation?: string | null;
  contract_status?: string | null;
  client_completed_at?: string | null;
  worker_completed_at?: string | null;
  completed_at?: string | null;
};

export type WorkerProfile = {
  id: string;
  full_name: string;
  email?: string | null;
  phone: string;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  address_line?: string | null;
  designation?: string | null;
  experience_years?: number | string | null;
  skills: string[];
  metadata?: Record<string, any> | null;
  photo_url?: string | null;
  verification_status: string;
  is_available: boolean;
};

export type WorkerPayment = {
  id: string;
  amount: string | number;
  currency: string;
  status: string;
  payment_method: string;
  razorpay_payment_id?: string | null;
  client_name?: string | null;
  created_at: string;
};

async function workerRequest(path: string, init?: RequestInit) {
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-request-from": "worker",
      ...(init?.headers || {}),
    },
  });
}

export async function fetchWorkerHireRequests(): Promise<WorkerHireRequest[]> {
  const response = await workerRequest("/api/hiring/worker-requests");
  if (!response.ok) return [];
  const payload = await response.json();
  return Array.isArray(payload.data) ? payload.data : [];
}

export async function fetchWorkerProfile(): Promise<WorkerProfile | null> {
  const response = await workerRequest("/api/hiring/my-profile");
  if (!response.ok) return null;
  const payload = await response.json();
  return payload.data || null;
}

export async function updateWorkerProfile(profile: Partial<WorkerProfile>) {
  const response = await workerRequest("/api/hiring/my-profile", {
    method: "PATCH",
    body: JSON.stringify(profile),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || "Unable to update worker profile.");
  return payload.data as WorkerProfile;
}

export async function fetchWorkerPaymentHistory(): Promise<WorkerPayment[]> {
  const response = await workerRequest("/api/hiring/worker-payments");
  if (!response.ok) return [];
  const payload = await response.json();
  return Array.isArray(payload.data) ? payload.data : [];
}

export async function updateWorkerHireRequest(id: string, status: "accepted" | "rejected") {
  const response = await workerRequest(`/api/hiring/worker-requests/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || "Unable to update request.");
  return payload.data;
}
