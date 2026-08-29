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
  email?: string | null;
  phone: string;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  address_line?: string | null;
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

export async function fetchCandidateDetail(id: string): Promise<CandidateListItem | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/hiring/candidates/${id}`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "x-request-from": "client",
      },
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.error("Error fetching candidate detail:", error);
    return null;
  }
}

export async function submitHireRequest(
  candidateId: string,
  requestDetails: {
    hiring_type?: string;
    duration?: string;
    salary_offered?: string | number;
    company_name?: string;
    notes?: string;
  }
): Promise<{ success: boolean; message?: string; data?: any }> {
  const res = await fetch(`${API_BASE_URL}/api/hiring/requests`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-request-from": "client",
    },
    body: JSON.stringify({
      candidate_id: candidateId,
      request_details: requestDetails,
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Failed to submit hire request.");
  }
  return json;
}

export async function registerCandidateProfile(
  payload: Partial<CandidateListItem> & {
    documents?: Array<{ doc_type: string; doc_url: string; doc_name?: string; doc_number?: string }>;
  }
): Promise<{ success: boolean; message?: string; data?: any }> {
  const res = await fetch(`${API_BASE_URL}/api/hiring/register`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-request-from": "client",
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Failed to submit candidate profile.");
  }
  return json;
}
