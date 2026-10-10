import type { FormFieldDefinition } from "@/lib/api/serviceHub";

export const MACHINE_MAINTENANCE_CODE = "machine_maintenance";
export const MACHINE_MAINTENANCE_LABEL = "Machine Maintenance";

/** Stable workbook fields. These remain available even when DB form_schema is empty. */
export const MACHINE_MAINTENANCE_FORM_FIELDS: FormFieldDefinition[] = [
  { name: "machine_name", label: "Machine Name", type: "text", required: true },
  { name: "machine_number", label: "M/C No.", type: "text", required: true },
  { name: "manufacturer", label: "Manufacturer / Brand", type: "text", required: true },
  { name: "system_name", label: "System Name", type: "text", required: false },
  { name: "model", label: "Model", type: "text", required: true },
  { name: "machine_size_xyz", label: "Machine Size (X × Y × Z)", type: "text", placeholder: "e.g. 1200 × 800 × 600 mm", required: false },
  { name: "machine_work_type", label: "Machine Work Type", type: "text", required: true },
  { name: "problem_observed", label: "Problem Identified / Observed", type: "textarea", required: true },
  { name: "problem_details", label: "Problem Details", type: "textarea", required: true },
  { name: "machine_photos", label: "Machine Photos", type: "image", multiple: true, max_files: 6, required: false },
  { name: "machine_video", label: "Machine Video", type: "video", max_files: 1, required: false },
];

export function isMachineMaintenanceService(category?: { code?: string; label?: string } | null): boolean {
  return category?.code?.toLowerCase() === MACHINE_MAINTENANCE_CODE
    || category?.label?.trim().toLowerCase() === MACHINE_MAINTENANCE_LABEL.toLowerCase();
}
