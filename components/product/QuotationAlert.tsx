import { Info } from "lucide-react";

interface QuotationAlertProps {
  quotationLimit: number;
}

export function QuotationAlert({ quotationLimit }: QuotationAlertProps) {
  return (
    <div className="mb-4 flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
      <Info size={18} className="text-amber-600 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-amber-900">Quotation Required for Bulk Orders</p>
        <p className="text-xs text-amber-700 mt-0.5">
          Orders of <strong>{quotationLimit}+</strong> units require a quotation. Your request will
          be sent to all eligible suppliers for competitive pricing.
        </p>
      </div>
    </div>
  );
}
