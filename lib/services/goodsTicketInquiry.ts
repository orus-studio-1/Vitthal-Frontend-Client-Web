export function isGoodsTicketInquiryService(category?: {
  code?: string;
  label?: string;
} | null): boolean {
  if (!category) return false;
  return /goods[_\s-]*ticket|goods[_\s-]*inquiry|good[_\s-]*ticket/i.test(
    `${category.code || ""} ${category.label || ""}`,
  );
}
