import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface SectionCardProps {
  icon?: LucideIcon;
  iconClassName?: string;
  title: string;
  children: ReactNode;
  headerRight?: ReactNode;
  className?: string;
}

export function SectionCard({
  icon: Icon,
  iconClassName = "text-zinc-500",
  title,
  children,
  headerRight,
  className = "",
}: SectionCardProps) {
  return (
    <div
      className={`border border-zinc-200 bg-white rounded-2xl shadow-sm h-max overflow-hidden ${className}`}
    >
      <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={18} className={iconClassName} />}
          <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
        </div>
        {headerRight && <div>{headerRight}</div>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
