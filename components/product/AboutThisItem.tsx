import { Info, ChevronRight } from "lucide-react";
import type { ProductDetail, ProductVariant } from "@/types";
import { isValidValue, getKeyProperties } from "@/lib/utils/product";

interface AboutThisItemProps {
  product: ProductDetail;
  selectedVariant: ProductVariant | null;
  material?: string | number;
  grade?: string | number;
  application?: string | number;
  standard?: string | number;
}

export function AboutThisItem({
  product,
  selectedVariant,
  material,
  grade,
  application,
  standard,
}: AboutThisItemProps) {
  const keyProps = getKeyProperties(product, selectedVariant);
  const hasProperties =
    isValidValue(grade) ||
    isValidValue(material) ||
    isValidValue(application) ||
    isValidValue(standard) ||
    Object.keys(keyProps).length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
        <Info size={18} className="text-zinc-500" />
        <h3 className="text-lg font-semibold text-zinc-900">About This Item</h3>
      </div>
      <div className="p-6">
        <div className="prose prose-zinc max-w-none">
          <p className="text-zinc-700 leading-relaxed text-base">
            {product.description ||
              "This industrial-grade product meets stringent quality standards and is suitable for various commercial and industrial applications. Sourced from verified suppliers with competitive pricing and reliable delivery options."}
          </p>

          {hasProperties && (
            <div className="mt-6 p-4 bg-zinc-50 rounded-lg">
              <h4 className="font-semibold text-zinc-900 mb-3">Product Properties</h4>
              <ul className="space-y-2 text-sm">
                {isValidValue(grade) && (
                  <li className="flex items-start gap-2">
                    <ChevronRight size={14} className="text-zinc-400 mt-0.5" />
                    <span>
                      <strong>Grade:</strong> {grade}
                    </span>
                  </li>
                )}
                {isValidValue(material) && (
                  <li className="flex items-start gap-2">
                    <ChevronRight size={14} className="text-zinc-400 mt-0.5" />
                    <span>
                      <strong>Material:</strong> {material}
                    </span>
                  </li>
                )}
                {isValidValue(application) && (
                  <li className="flex items-start gap-2">
                    <ChevronRight size={14} className="text-zinc-400 mt-0.5" />
                    <span>
                      <strong>Application:</strong> {application}
                    </span>
                  </li>
                )}
                {isValidValue(standard) && (
                  <li className="flex items-start gap-2">
                    <ChevronRight size={14} className="text-zinc-400 mt-0.5" />
                    <span>
                      <strong>Standard:</strong> {standard}
                    </span>
                  </li>
                )}
                {Object.entries(keyProps).map(([key, value]) => (
                  <li key={key} className="flex items-start gap-2">
                    <ChevronRight size={14} className="text-zinc-400 mt-0.5" />
                    <span className="whitespace-pre-wrap">
                      <strong>
                        {key
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                        :
                      </strong>{" "}
                      {String(value)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
