import { Building, ShieldCheck, Truck } from "lucide-react";

interface TrustBadgesProps {
  supplierCount: number;
}

export function TrustBadges({ supplierCount }: TrustBadgesProps) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="flex flex-col items-center p-3 rounded-xl border border-zinc-100 bg-zinc-50/50 text-center">
        <Building className="text-blue-600 mb-2" size={22} />
        <p className="text-xs text-zinc-500 font-medium">{supplierCount} Suppliers</p>
      </div>
      <div className="flex flex-col items-center p-3 rounded-xl border border-zinc-100 bg-zinc-50/50 text-center">
        <ShieldCheck className="text-emerald-500 mb-2" size={22} />
        <p className="text-xs text-zinc-500 font-medium">Quality Assured</p>
      </div>
      <div className="flex flex-col items-center p-3 rounded-xl border border-zinc-100 bg-zinc-50/50 text-center">
        <Truck className="text-orange-500 mb-2" size={22} />
        <p className="text-xs text-zinc-500 font-medium">Bulk Delivery</p>
      </div>
    </div>
  );
}
