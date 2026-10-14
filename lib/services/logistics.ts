export const LOGISTICS_CODE = "logistics";
export const LOGISTICS_LABEL = "Logistics";

export function isLogisticsService(category?: { code?: string; label?: string } | null): boolean {
  return /logistic|freight|transport/i.test(category?.code?.trim() || "")
    || /logistic|freight|transport/i.test(category?.label?.trim() || "");
}
