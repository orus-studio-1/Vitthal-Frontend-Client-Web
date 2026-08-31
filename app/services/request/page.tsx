"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Send,
  Loader2,
  CheckCircle2,
  Upload,
  Calendar,
  Layers,
  Tag,
  Paperclip,
  Wrench,
  AlertCircle,
  X,
  Lock,
  LogIn,
  UserPlus,
} from "lucide-react";
import {
  fetchServiceCategories,
  createServiceTicket,
  type ServiceCategory,
} from "@/lib/api/serviceHub";
import { useAuthStore } from "@/store/authStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

export const dynamic = "force-dynamic";

function ServiceRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCat = searchParams.get("category");
  const preselectedSubcat = searchParams.get("subcategory");

  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Category & Subcategory
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>("");

  // Dynamic Form Values
  const [dynamicValues, setDynamicValues] = useState<Record<string, any>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { fileName: string; s3Key: string }>>({});
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // General Fields
  const [jobTitle, setJobTitle] = useState("");
  const [priority, setPriority] = useState<string>("medium");
  const [targetBudget, setTargetBudget] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<any | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      const data = await fetchServiceCategories();
      setCategories(data);

      if (data.length > 0) {
        const foundCat = preselectedCat
          ? data.find((c) => c.code === preselectedCat || c.id === preselectedCat)
          : data[0];
        const activeCat = foundCat || data[0];
        setSelectedCategoryId(activeCat.id);

        if (activeCat.subcategories && activeCat.subcategories.length > 0) {
          const foundSub = preselectedSubcat
            ? activeCat.subcategories.find((s) => s.id === preselectedSubcat || s.name === preselectedSubcat)
            : activeCat.subcategories[0];
          setSelectedSubcategoryId(foundSub ? foundSub.id : activeCat.subcategories[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
      toast.error("Failed to load service categories.");
    } finally {
      setLoading(false);
    }
  }

  const currentCategory = categories.find((c) => c.id === selectedCategoryId);
  const currentSubcategory = currentCategory?.subcategories.find(
    (s) => s.id === selectedSubcategoryId
  );
  const currentFormSchema = currentSubcategory?.form_schema || [];

  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId);
    setDynamicValues({});
    setUploadedFiles({});
    const cat = categories.find((c) => c.id === catId);
    if (cat && cat.subcategories.length > 0) {
      setSelectedSubcategoryId(cat.subcategories[0].id);
    } else {
      setSelectedSubcategoryId("");
    }
  };

  const handleSubcategoryChange = (subId: string) => {
    setSelectedSubcategoryId(subId);
    setDynamicValues({});
    setUploadedFiles({});
  };

  const handleFieldChange = (key: string, value: any) => {
    setDynamicValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingField(fieldKey);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "File upload failed.");

      setUploadedFiles((prev) => ({
        ...prev,
        [fieldKey]: { fileName: file.name, s3Key: json.fileName },
      }));
      setDynamicValues((prev) => ({
        ...prev,
        [fieldKey]: json.fileName,
      }));

      toast.success(`Attached ${file.name}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to upload file.");
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login to submit a service request.");
      router.push("/login?redirect=/services/request");
      return;
    }

    if (!selectedCategoryId) {
      toast.error("Please select a service category.");
      return;
    }

    // Validate required fields in dynamic form schema
    for (const field of currentFormSchema) {
      if (field.required) {
        const val = dynamicValues[field.name];
        if (val === undefined || val === null || val === "") {
          toast.error(`Please fill in required field: "${field.label}"`);
          return;
        }
      }
    }

    try {
      setSubmitting(true);

      const ticketPayload: Record<string, any> = {
        job_title: jobTitle.trim() || `${currentSubcategory?.name || currentCategory?.label} Request`,
        target_budget: targetBudget ? parseFloat(targetBudget) : undefined,
        ...dynamicValues,
      };

      const documents = Object.entries(uploadedFiles).map(([fieldKey, fileInfo]) => ({
        doc_type: fieldKey,
        doc_url: fileInfo.s3Key,
        doc_name: fileInfo.fileName,
      }));

      const created = await createServiceTicket({
        category_id: selectedCategoryId,
        subcategory_id: selectedSubcategoryId || undefined,
        priority,
        ticket_payload: ticketPayload,
        documents: documents.length > 0 ? documents : undefined,
      });

      setSubmittedTicket(created);
      toast.success("Service request submitted successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-white pb-24 pt-16">
        <div className="mx-auto max-w-md px-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-zinc-900">
            Sign In to Raise Service Request
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            Please log in or create an account to request custom services and receive bids from verified vendors.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/login?redirect=/services/request"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-medium text-white shadow-xs transition hover:bg-blue-700"
            >
              <LogIn className="h-4 w-4" /> Log In
            </Link>
            <Link
              href="/register?redirect=/services/request"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-6 py-2.5 text-xs font-medium text-zinc-700 shadow-xs transition hover:bg-zinc-50"
            >
              <UserPlus className="h-4 w-4" /> Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24 pt-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Service Hub
        </Link>

        {submittedTicket ? (
          <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-10 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h1 className="mt-4 font-heading text-xl font-semibold text-zinc-900">
              Service Request Placed Successfully
            </h1>
            <p className="mt-1 font-mono text-xs font-semibold text-zinc-600">
              Ticket #{submittedTicket.ticket_number}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-zinc-500">
              Your service request has been broadcasted to verified service vendors. You will receive itemized quotes in your Ticket Room.
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <Link
                href={`/services/tickets/${submittedTicket.id}`}
                className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-medium text-white shadow-xs transition hover:bg-blue-700"
              >
                Open Ticket Room & Track Bids
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-8">
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">
                Raise Custom Service Request
              </h1>
              <p className="mt-1 text-xs text-zinc-500">
                Select your service category and subcategory. All dynamic fields configured by administration will be rendered below.
              </p>
            </div>

            {loading ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2 text-zinc-400">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <p className="text-xs">Loading service categories...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="rounded-xl border border-zinc-200 p-8 text-center text-xs text-zinc-400">
                No service categories available at the moment.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Category & Subcategory Selection */}
                <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4 shadow-xs">
                  <div className="border-b border-zinc-100 pb-3">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                      1. Select Service Vertical & Subcategory
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">
                        Service Category <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={selectedCategoryId}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 focus:border-blue-600 focus:outline-none"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">
                        Subcategory / Process <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={selectedSubcategoryId}
                        onChange={(e) => handleSubcategoryChange(e.target.value)}
                        disabled={!currentCategory || currentCategory.subcategories.length === 0}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 focus:border-blue-600 focus:outline-none disabled:bg-zinc-50"
                      >
                        {currentCategory && currentCategory.subcategories.length > 0 ? (
                          currentCategory.subcategories.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                              {sub.name}
                            </option>
                          ))
                        ) : (
                          <option value="">No subcategories</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">
                        Request Title / Summary (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 5-Axis Milling for Impeller Blades"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">
                        Priority Level
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none"
                      >
                        <option value="low">Standard / Routine</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                        <option value="emergency_breakdown">🚨 Emergency Breakdown</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Dynamic Form Schema (Configured by Admin) */}
                <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4 shadow-xs">
                  <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                        2. Technical Specifications ({currentSubcategory?.name || "Subcategory"})
                      </h2>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        These fields are dynamically defined by the administration for this specialized service.
                      </p>
                    </div>
                    <span className="rounded bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-700">
                      {currentFormSchema.length} Field(s)
                    </span>
                  </div>

                  {currentFormSchema.length === 0 ? (
                    <div className="py-4 space-y-3">
                      <p className="text-xs text-zinc-500">
                        No custom fields configured for this subcategory. Please provide general notes:
                      </p>
                      <textarea
                        rows={3}
                        placeholder="Describe the required service, scope of work, material specs, or operational issues..."
                        value={dynamicValues["general_notes"] || ""}
                        onChange={(e) => handleFieldChange("general_notes", e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {currentFormSchema.map((field: any, idx: number) => {
                        const isFullWidth = field.type === "textarea" || field.type === "file";

                        return (
                          <div key={idx} className={isFullWidth ? "sm:col-span-2 space-y-1" : "space-y-1"}>
                            <label className="block text-xs font-medium text-zinc-700">
                              {field.label} {field.required && <span className="text-rose-500">*</span>}
                            </label>

                            {field.type === "textarea" ? (
                              <textarea
                                rows={3}
                                required={field.required}
                                placeholder={field.placeholder || `Enter ${field.label}...`}
                                value={dynamicValues[field.name] || ""}
                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none"
                              />
                            ) : field.type === "select" ? (
                              <select
                                required={field.required}
                                value={dynamicValues[field.name] || ""}
                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none"
                              >
                                <option value="">Select {field.label}...</option>
                                {field.options?.map((opt: string, oi: number) => (
                                  <option key={oi} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            ) : field.type === "file" || field.type === "image" ? (
                              <div>
                                {uploadedFiles[field.name] ? (
                                  <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-xs">
                                    <div className="flex items-center gap-2 truncate">
                                      {field.type === "image" ? (
                                        <div className="h-6 w-6 rounded bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                          <Paperclip className="h-3.5 w-3.5" />
                                        </div>
                                      ) : (
                                        <Paperclip className="h-4 w-4 text-blue-600 shrink-0" />
                                      )}
                                      <span className="truncate font-medium text-zinc-800">
                                        {uploadedFiles[field.name].fileName}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newFiles = { ...uploadedFiles };
                                        delete newFiles[field.name];
                                        setUploadedFiles(newFiles);
                                        handleFieldChange(field.name, "");
                                      }}
                                      className="text-zinc-400 hover:text-rose-600"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50/50 p-4 text-center text-xs text-zinc-600 hover:bg-zinc-50 transition">
                                    {uploadingField === field.name ? (
                                      <Loader2 className="h-4 w-4 animate-spin text-blue-600 mb-1" />
                                    ) : (
                                      <Upload className="h-4 w-4 text-zinc-400 mb-1" />
                                    )}
                                    <span className="font-medium">
                                      {field.placeholder || (field.type === "image" ? `Upload photo for ${field.label}` : `Attach file for ${field.label}`)}
                                    </span>
                                    <span className="text-[10px] text-zinc-400 mt-0.5">
                                      {field.type === "image" ? "JPG, PNG, WEBP (Max 10MB)" : "CAD, PDF, STEP, ZIP (Max 25MB)"}
                                    </span>
                                    <input
                                      type="file"
                                      accept={field.type === "image" ? "image/png,image/jpeg,image/jpg,image/webp" : "*"}
                                      onChange={(e) => handleFileUpload(e, field.name)}
                                      className="hidden"
                                    />
                                  </label>
                                )}
                              </div>
                            ) : field.type === "checkbox" ? (
                              <label className="flex items-center gap-2 cursor-pointer pt-2 text-xs font-medium text-zinc-700">
                                <input
                                  type="checkbox"
                                  checked={Boolean(dynamicValues[field.name])}
                                  onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                                  className="h-4 w-4 rounded border-zinc-300 text-blue-600"
                                />
                                {field.placeholder || `Yes / Enabled`}
                              </label>
                            ) : (
                              <input
                                type={field.type}
                                required={field.required}
                                placeholder={field.placeholder || `Enter ${field.label}...`}
                                value={dynamicValues[field.name] || ""}
                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Link
                    href="/services"
                    className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-medium text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" /> Broadcast Service Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DynamicServiceRequestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-2 text-zinc-400">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <p className="text-xs">Loading service intake form...</p>
          </div>
        </div>
      }
    >
      <ServiceRequestForm />
    </Suspense>
  );
}

