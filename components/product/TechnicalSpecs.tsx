import { Layers, Info } from "lucide-react";
import { SectionCard } from "@/components/ui";
import { getTechnicalSpecifications } from "@/lib/utils/product";
import type { ProductDetail } from "@/types";

interface TechnicalSpecsProps {
  product: ProductDetail;
}

export function TechnicalSpecs({ product }: TechnicalSpecsProps) {
  const specs = getTechnicalSpecifications(product);

  return (
    <SectionCard icon={Layers} iconClassName="text-zinc-500" title="Technical Specifications">
      {Object.keys(specs).length > 0 ? (
        <ul className="space-y-3">
          {Object.entries(specs).map(([key, value]) => (
            <li key={key} className="flex items-start gap-4 py-2 border-b border-zinc-50 last:border-0">
              <span className="text-sm text-zinc-500 capitalize min-w-[120px] shrink-0">
                {key.replace(/_/g, " ")}
              </span>
              <span className="text-sm font-semibold text-zinc-900 whitespace-pre-wrap">{String(value)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-8 text-center text-zinc-500 flex flex-col items-center">
          <Info size={24} className="mb-2 opacity-20" />
          <p className="text-sm">Specifications available on request</p>
        </div>
      )}
    </SectionCard>
  );
}
