"use client";

import { Layers } from "lucide-react";
import type { ProductVariant } from "@/types";
import { getVariantAttributes } from "@/lib/utils/product";

interface SpecSelectorProps {
  variants: ProductVariant[];
  selectedSpecs: Record<string, string>;
  onSpecChange: (key: string, value: string) => void;
}

export function SpecSelector({ variants, selectedSpecs, onSpecChange }: SpecSelectorProps) {
  const variantAttributes = getVariantAttributes(variants);

  if (Object.keys(variantAttributes).length === 0) return null;

  return (
    <div className="mb-6 p-5 bg-white rounded-2xl border border-zinc-200 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2 pb-2 border-b border-zinc-100">
        <Layers size={16} className="text-[#1d4ed8]" />
        Select Specifications
      </h3>

      {Object.entries(variantAttributes).map(([specKey, values]) => {
        const activeValue = selectedSpecs[specKey];
        return (
          <div key={specKey} className="space-y-2">
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              {specKey}:{" "}
              <span className="text-zinc-800 font-bold capitalize">{activeValue || "None"}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {values.map((val) => {
                const isSelected = activeValue === val;
                return (
                  <button
                    key={val}
                    onClick={() => onSpecChange(specKey, val)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                      isSelected
                        ? "bg-[#1d4ed8] text-white border-[#1d4ed8] shadow-md"
                        : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                    }`}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
