import type { ServiceCategory } from "@/lib/api/serviceHub";

export const JOB_INQUIRY_CODE = "job_inquiry";
export const JOB_INQUIRY_LABEL = "Job Inquiry";

export type JobWorkItem = {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  notes?: string;
  materialGrade?: string;
  lastAcceptedDeliveryDate?: string;
  preferredDeliveryDate?: string;
};

export function isJobInquiryService(category?: { code?: string; label?: string } | null): boolean {
  return category?.code?.trim().toLowerCase() === JOB_INQUIRY_CODE
    || category?.label?.trim().toLowerCase() === JOB_INQUIRY_LABEL.toLowerCase();
}

export function getJobInquiryCategory(categories: ServiceCategory[]): ServiceCategory | undefined {
  return categories.find(isJobInquiryService);
}
