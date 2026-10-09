type CatalogSummaryProps = {
  size?: string | null;
  brand?: string | null;
  grade?: string | null;
  colour?: string | null;
  warranty?: string | null;
  manufacturer?: string | null;
  unit?: string | null;
  attributes?: Record<string, string | number>;
  compact?: boolean;
};

const catalogFields = [
  ["Size", "size"],
  ["Brand", "brand"],
  ["Grade", "grade"],
  ["Colour", "colour"],
  ["Warranty / Guarantee", "warranty"],
  ["Manufacturer", "manufacturer"],
] as const;

export function ProductCatalogSummary({ compact = false, attributes = {}, ...product }: CatalogSummaryProps) {
  const attrs = Object.fromEntries(Object.entries(attributes).map(([key, value]) => [key.toLowerCase().replace(/[ _-]/g, ""), value]));
  return (
    <dl className={`grid grid-cols-2 ${compact ? "gap-x-3 gap-y-1.5 text-[10px]" : "gap-2 sm:grid-cols-3 text-xs"}`}>
      {catalogFields.map(([label, key]) => {
        const value = product[key] ?? attrs[key] ?? (key === "colour" ? attrs.color : key === "warranty" ? attrs.guarantee : undefined);
        return (
          <div key={key} className={`${compact ? "min-w-0" : "rounded-lg border border-zinc-100 bg-white px-3 py-2"}`}>
            <dt className="text-zinc-500">{label}</dt>
            <dd className="truncate font-semibold text-zinc-800" title={value == null ? "Not specified" : String(value)}>{value == null || String(value).trim() === "" ? "—" : String(value)}</dd>
          </div>
        );
      })}
      <div className={`${compact ? "min-w-0" : "rounded-lg border border-zinc-100 bg-white px-3 py-2"}`}>
        <dt className="text-zinc-500">Unit</dt>
        <dd className="font-semibold text-zinc-800">{product.unit || attrs.unit || attrs.uom || "nos"}</dd>
      </div>
    </dl>
  );
}
