"use client";

import { ServiceCard } from "@/components/services/ServiceCard";
import { SectionHeading } from "./SectionHeading";
import type { ServiceListItem } from "@/store/serviceStore";

interface ServiceSectionProps {
  id?: string;
  title: string;
  subtitle?: string;
  services: ServiceListItem[];
  showViewAll?: boolean;
  viewAllHref?: string;
  bg?: "white" | "zinc";
}

export function ServiceSection({
  id,
  title,
  subtitle,
  services,
  showViewAll = false,
  viewAllHref,
  bg = "white",
}: ServiceSectionProps) {
  if (services.length === 0) return null;

  return (
    <section
      id={id}
      className={`border-t border-zinc-200 ${bg === "zinc" ? "bg-zinc-50" : "bg-white"}`}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading
          title={title}
          subtitle={subtitle}
          action={
            showViewAll ? (
              <a href={viewAllHref || "/services"} className="text-sm font-medium text-[#1d4ed8] hover:text-[#1e40af]">
                View All
              </a>
            ) : null
          }
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <ServiceCard key={service.id} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
}
