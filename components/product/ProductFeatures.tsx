import {
  Layers,
  ShieldCheck,
  BadgeCheck,
  Truck,
  Info,
  Package,
} from "lucide-react";
import type { ProductDetail, ProductVariant } from "@/types";
import { isValidValue, getKeyProperties } from "@/lib/utils/product";
import type { ReactNode } from "react";

interface ProductFeaturesProps {
  product: ProductDetail;
  selectedVariant: ProductVariant | null;
  material?: string | number;
  grade?: string | number;
  application?: string | number;
  standard?: string | number;
}

interface FeatureItem {
  label: string;
  value: string;
  icon: ReactNode;
}

export function ProductFeatures({
  product,
  selectedVariant,
  material,
  grade,
  application,
  standard,
}: ProductFeaturesProps) {
  const featuresList: FeatureItem[] = [];

  if (product.product_type) {
    featuresList.push({
      label: "Type",
      value: product.product_type,
      icon: <Layers className="text-blue-600" size={16} />,
    });
  }

  const potentialProps = [
    { label: "Material", value: material !== undefined ? String(material) : undefined, icon: <ShieldCheck className="text-blue-600" size={16} /> },
    { label: "Grade", value: grade !== undefined ? String(grade) : undefined, icon: <BadgeCheck className="text-blue-600" size={16} /> },
    { label: "Application", value: application !== undefined ? String(application) : undefined, icon: <Truck className="text-blue-600" size={16} /> },
    { label: "Standard", value: standard !== undefined ? String(standard) : undefined, icon: <Info className="text-blue-600" size={16} /> },
  ];

  potentialProps.forEach((p) => {
    if (p.value) {
      featuresList.push({ label: p.label, value: p.value, icon: p.icon });
    }
  });

  if (featuresList.length < 6 && product.attributes) {
    const customAttrs = Object.entries(product.attributes).filter(
      ([key]) => !["material", "grade", "application", "standard"].includes(key.toLowerCase())
    );
    for (const [key, val] of customAttrs) {
      if (featuresList.length >= 6) break;
      if (val) {
        featuresList.push({
          label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          value: String(val),
          icon: <Package className="text-blue-600" size={16} />,
        });
      }
    }
  }

  // Also fill from key properties if still short
  if (featuresList.length < 6) {
    const keyProps = getKeyProperties(product, selectedVariant);
    for (const [key, val] of Object.entries(keyProps)) {
      if (featuresList.length >= 6) break;
      featuresList.push({
        label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        value: String(val),
        icon: <Package className="text-blue-600" size={16} />,
      });
    }
  }

  if (featuresList.length === 0) return null;

  return (
    <div className="mb-6 bg-zinc-50/70 border border-zinc-200/80 rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Product Highlights</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-sm">
        {featuresList.slice(0, 6).map((feat, idx) => (
          <div key={idx} className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-zinc-200/60 shadow-3xs">
            <div className="shrink-0 p-2 bg-blue-50 text-[#1d4ed8] rounded-lg">{feat.icon}</div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider truncate">{feat.label}</span>
              <span className="font-bold text-zinc-900 capitalize text-xs sm:text-sm truncate mt-0.5">{feat.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
