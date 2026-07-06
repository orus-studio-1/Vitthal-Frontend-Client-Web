import { Package } from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  icon: Icon = Package,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="py-20 text-center flex flex-col items-center">
      <Icon size={48} className="text-zinc-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-zinc-900 mb-2">{title}</h3>
      {description && <p className="text-zinc-500 text-sm max-w-sm">{description}</p>}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#1d4ed8] text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
