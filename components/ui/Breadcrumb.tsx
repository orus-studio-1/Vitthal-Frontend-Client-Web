import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="text-sm flex items-center gap-2 text-zinc-500" aria-label="Breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <ChevronRight size={14} className="text-zinc-400" />}
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-zinc-800 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-zinc-800 font-medium truncate max-w-xs" : ""}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
