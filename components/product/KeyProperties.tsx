import { ShieldCheck } from "lucide-react";
import { SectionCard } from "@/components/ui";
import { isValidValue } from "@/lib/utils/product";
import type { ProductDetail, ProductVariant } from "@/types";
import { getKeyProperties } from "@/lib/utils/product";

interface KeyPropertiesProps {
  product: ProductDetail;
  selectedVariant: ProductVariant | null;
  material?: string | number;
  grade?: string | number;
  application?: string | number;
  standard?: string | number;
}

export function KeyProperties({
  product,
  selectedVariant,
  material,
  grade,
  application,
  standard,
}: KeyPropertiesProps) {
  const keyProps = getKeyProperties(product, selectedVariant);
  const hasAny =
    isValidValue(grade) ||
    isValidValue(material) ||
    isValidValue(application) ||
    isValidValue(standard) ||
    Object.keys(keyProps).length > 0;

  if (!hasAny) return null;

  return (
    <SectionCard icon={ShieldCheck} iconClassName="text-blue-600" title="Key Properties">
      <ul className="space-y-3">
        {isValidValue(grade) && (
          <li className="flex items-start gap-4 py-2 border-b border-zinc-50">
            <span className="text-sm text-zinc-500 min-w-[120px] shrink-0">Grade</span>
            <span className="text-sm font-semibold text-zinc-900 whitespace-pre-wrap">{grade}</span>
          </li>
        )}
        {isValidValue(material) && (
          <li className="flex items-start gap-4 py-2 border-b border-zinc-50">
            <span className="text-sm text-zinc-500 min-w-[120px] shrink-0">Material</span>
            <span className="text-sm font-semibold text-zinc-900 whitespace-pre-wrap">{material}</span>
          </li>
        )}
        {isValidValue(application) && (
          <li className="flex items-start gap-4 py-2 border-b border-zinc-50">
            <span className="text-sm text-zinc-500 min-w-[120px] shrink-0">Application</span>
            <span className="text-sm font-semibold text-zinc-900 whitespace-pre-wrap">{application}</span>
          </li>
        )}
        {isValidValue(standard) && (
          <li className="flex items-start gap-4 py-2 border-b border-zinc-50">
            <span className="text-sm text-zinc-500 min-w-[120px] shrink-0">Standard</span>
            <span className="text-sm font-semibold text-zinc-900 whitespace-pre-wrap">{standard}</span>
          </li>
        )}
        {Object.entries(keyProps).map(([key, value]) => (
          <li key={key} className="flex items-start gap-4 py-2 border-b border-zinc-50 last:border-0">
            <span className="text-sm text-zinc-500 capitalize min-w-[120px] shrink-0">
              {key.replace(/_/g, " ")}
            </span>
            <span className="text-sm font-semibold text-zinc-900 whitespace-pre-wrap">{String(value)}</span>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
