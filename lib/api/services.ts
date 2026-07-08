import type { ServiceListItem } from "@/store/serviceStore";

const SERVICES_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/services`
  : "http://localhost:9000/api/services";

export interface FetchServicesResult {
  services: ServiceListItem[];
  total: number;
}

export async function fetchServices(
  page: number = 1,
  limit: number = 4,
  search?: string,
  category?: string
): Promise<FetchServicesResult> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.set("search", search);
    if (category) params.set("category", category);

    const res = await fetch(`${SERVICES_BASE_URL}?${params.toString()}`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "x-request-from": "client",
      },
    });

    if (!res.ok) return { services: [], total: 0 };

    const json = await res.json();
    return {
      services: Array.isArray(json.data) ? json.data : [],
      total: json.pagination?.total ?? 0,
    };
  } catch (error) {
    console.error("Error fetching services:", error);
    return { services: [], total: 0 };
  }
}
