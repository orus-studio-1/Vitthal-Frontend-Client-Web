const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

export interface ServiceCategory {
  id: string;
  code: string;
  label: string;
  description?: string;
  image?: string;
  category_type: string;
  sort_order: number;
  subcategories: Array<{
    id: string;
    name: string;
    description?: string;
    form_schema: any[];
  }>;
}

export interface ClientAsset {
  id: string;
  user_id: string;
  category_id?: string | null;
  subcategory_id?: string | null;
  category_name?: string;
  subcategory_name?: string;
  asset_name: string;
  asset_code?: string | null;
  brand?: string | null;
  model_number?: string | null;
  serial_number?: string | null;
  installation_year?: number | null;
  specs: Record<string, any>;
  location_details: Record<string, any>;
  documents: any[];
  is_active: boolean;
  created_at: string;
}

export interface ServiceTicket {
  id: string;
  ticket_number: string;
  category_id: string;
  subcategory_id?: string | null;
  category_name?: string;
  subcategory_name?: string;
  client_user_id: string;
  vendor_id?: string | null;
  vendor_name?: string | null;
  vendor_phone?: string | null;
  assigned_agent_id?: string | null;
  agent_name?: string | null;
  asset_id?: string | null;
  asset_name?: string | null;
  asset_brand?: string | null;
  asset_model?: string | null;
  asset_serial?: string | null;
  asset_specs?: Record<string, any>;
  status: string;
  priority: string;
  ticket_payload: Record<string, any>;
  quotation_breakdown: Record<string, any>;
  total_amount?: number | string | null;
  advance_paid?: number | string | null;
  completion_otp?: string | null;
  otp_verified_at?: string | null;
  quotes_count?: number;
  timeline_logs: Array<{ status: string; note: string; timestamp: string; by_user_id?: string }>;
  created_at: string;
  quotations?: Array<{
    id: string;
    ticket_id: string;
    vendor_id: string;
    vendor_name: string;
    vendor_rating?: number;
    status: string;
    total_price: number | string;
    quote_breakdown: Record<string, any>;
    created_at: string;
  }>;
  documents?: Array<{
    id: string;
    doc_type: string;
    doc_name?: string;
    doc_url: string;
    uploader_name?: string;
    created_at: string;
  }>;
}

// ────────────────────────────────────────────────────────────────────
// API HELPERS
// ────────────────────────────────────────────────────────────────────
export async function fetchServiceCategories(): Promise<ServiceCategory[]> {
  const res = await fetch(`${API_BASE_URL}/api/service-hub/categories`, {
    credentials: "include",
    headers: { "x-request-from": "client" },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to load service categories.");
  return json.data || [];
}

export async function fetchMyAssets(): Promise<ClientAsset[]> {
  const res = await fetch(`${API_BASE_URL}/api/service-hub/assets`, {
    credentials: "include",
    headers: { "x-request-from": "client" },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to load assets.");
  return json.data || [];
}

export async function createClientAsset(data: {
  asset_name: string;
  asset_code?: string;
  brand?: string;
  model_number?: string;
  serial_number?: string;
  installation_year?: number;
  category_id?: string;
  subcategory_id?: string;
  specs?: Record<string, any>;
  location_details?: Record<string, any>;
  documents?: any[];
}): Promise<ClientAsset> {
  const res = await fetch(`${API_BASE_URL}/api/service-hub/assets`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-request-from": "client",
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to register asset.");
  return json.data;
}

export async function createServiceTicket(data: {
  category_id: string;
  subcategory_id?: string;
  vendor_id?: string;
  asset_id?: string;
  priority?: string;
  ticket_payload: Record<string, any>;
  documents?: Array<{ doc_type: string; doc_url: string; doc_name?: string; metadata?: any }>;
}): Promise<ServiceTicket> {
  const res = await fetch(`${API_BASE_URL}/api/service-hub/tickets`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-request-from": "client",
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to raise service ticket.");
  return json.data;
}

export async function fetchMyServiceTickets(params?: {
  status?: string;
  category_id?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: ServiceTicket[]; pagination: { page: number; limit: number; total: number } }> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.category_id) query.set("category_id", params.category_id);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const res = await fetch(`${API_BASE_URL}/api/service-hub/tickets?${query.toString()}`, {
    credentials: "include",
    headers: { "x-request-from": "client" },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to load tickets.");
  return { data: json.data || [], pagination: json.pagination };
}

export async function fetchMyTickets(status?: string): Promise<ServiceTicket[]> {
  const result = await fetchMyServiceTickets({ status, limit: 50 });
  return result.data || [];
}

export async function fetchServiceTicketDetail(id: string): Promise<ServiceTicket> {
  const res = await fetch(`${API_BASE_URL}/api/service-hub/tickets/${id}`, {
    credentials: "include",
    headers: { "x-request-from": "client" },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to load ticket details.");
  return json.data;
}

export async function acceptTicketQuote(ticketId: string, quoteId: string): Promise<ServiceTicket> {
  const res = await fetch(`${API_BASE_URL}/api/service-hub/tickets/${ticketId}/quotes/${quoteId}/accept`, {
    method: "POST",
    credentials: "include",
    headers: { "x-request-from": "client" },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to accept quotation.");
  return json.data;
}

export async function verifyTicketOtp(ticketId: string, otp: string, notes?: string): Promise<ServiceTicket> {
  const res = await fetch(`${API_BASE_URL}/api/service-hub/tickets/${ticketId}/complete-otp`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-request-from": "client",
    },
    body: JSON.stringify({ otp, notes }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to verify completion OTP.");
  return json.data;
}
