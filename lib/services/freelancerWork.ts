import type { ServiceCategory } from "@/lib/api/serviceHub";

export const FREELANCER_WORK_CODE = "freelancer_work";

export const FREELANCER_WORK_TYPES = [
  "On Side Work",
  "Design",
  "CAD modeling",
  "Packaging design",
  "Process / Manufacturing",
  "CNC Programming",
  "CAM Operations / program",
  "Tool & Die Design",
  "(QA) Advisory",
] as const;

export function isFreelancerWorkService(category: Pick<ServiceCategory, "code" | "label">) {
  return /freelancer[_\s-]*work/i.test(`${category.code} ${category.label}`);
}
