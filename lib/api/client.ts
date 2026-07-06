const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

export interface ClientAddress {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
}

export async function fetchClientAddress(): Promise<ClientAddress | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/client/clientDetails`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "x-request-from": "client",
      },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json.data;
    const primaryAddr = data?.primary_address || data?.addresses?.[0] || null;
    if (primaryAddr?.latitude != null && primaryAddr?.longitude != null) {
      return {
        latitude: Number(primaryAddr.latitude),
        longitude: Number(primaryAddr.longitude),
        address: primaryAddr.address || "",
        city: primaryAddr.city || "",
      };
    }
    return null;
  } catch {
    return null;
  }
}
