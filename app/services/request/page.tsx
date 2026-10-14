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
  Paperclip,
  X,
  Lock,
  LogIn,
  UserPlus,
  History,
} from "lucide-react";

import {
  fetchServiceCategories,
  fetchMyAssets,
  createClientAsset,
  createServiceTicket,
  fetchMyServiceTickets,
  type ServiceCategory,
  type ClientAsset,
  type ServiceTicket,
} from "@/lib/api/serviceHub";
import { useAuthStore } from "@/store/authStore";
import { isMachineMaintenanceService, MACHINE_MAINTENANCE_FORM_FIELDS } from "@/lib/services/machineMaintenance";
import { isJobInquiryService, type JobWorkItem } from "@/lib/services/jobInquiry";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";
const JOB_ITEM_UNITS = ["pcs", "kg", "litre", "numbers", "set"];

export const dynamic = "force-dynamic";

function ServiceRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCat = searchParams.get("category");
  const preselectedSubcat = searchParams.get("subcategory");
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [machineAssets, setMachineAssets] = useState<ClientAsset[]>([]);
  const [machineRequestHistory, setMachineRequestHistory] = useState<ServiceTicket[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Category & Subcategory
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>("");
  const [selectedSubSubcategoryId, setSelectedSubSubcategoryId] = useState<string>("");

  // Dynamic Form Values
  const [dynamicValues, setDynamicValues] = useState<Record<string, any>>({});
  const [jobWorkItems, setJobWorkItems] = useState<JobWorkItem[]>([{ id: crypto.randomUUID(), name: "", quantity: "1", unit: "" }]);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, Array<{ fileName: string; s3Key: string }>>>({});
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // General Fields
  const [jobTitle, setJobTitle] = useState("");
  const [priority, setPriority] = useState<string>("medium");
  const [targetBudget, setTargetBudget] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<any | null>(null);

  useEffect(() => {
    loadCategories();
  }, [isAuthenticated]);

  async function loadCategories() {
    try {
      setLoading(true);
      const [data, assets] = await Promise.all([
        fetchServiceCategories(),
        isAuthenticated ? fetchMyAssets() : Promise.resolve([] as ClientAsset[]),
      ]);
      setCategories(data);
      setMachineAssets(assets);
      const machineCategory = data.find((category) => isMachineMaintenanceService(category));
      if (isAuthenticated && machineCategory) {
        try {
          const history = await fetchMyServiceTickets({ category_id: machineCategory.id, limit: 50 });
          setMachineRequestHistory(history.data);
        } catch (historyError) {
          console.error("Failed to load machine maintenance history:", historyError);
          setMachineRequestHistory([]);
        }
      } else {
        setMachineRequestHistory([]);
      }
      if (data.length > 0) {
        const foundCat = preselectedCat
          ? data.find((c) => c.code === preselectedCat || c.id === preselectedCat)
          : data[0];
        const activeCat = foundCat || data[0];
        setSelectedCategoryId(activeCat.id);
        if (activeCat.subcategories && activeCat.subcategories.length > 0 && preselectedSubcat) {
          const foundSub = preselectedSubcat
            ? activeCat.subcategories.find((s) => s.id === preselectedSubcat || s.name === preselectedSubcat || s.children.some((child) => child.id === preselectedSubcat || child.name === preselectedSubcat))
            : undefined;
          if (foundSub) {
            setSelectedSubcategoryId(foundSub.id);
            const child = foundSub.children.find((item) => item.id === preselectedSubcat || item.name === preselectedSubcat);
            setSelectedSubSubcategoryId(child?.id || "");
          }
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
  const isMachineMaintenance = searchParams.get("service") === "machine-maintenance"
    || isMachineMaintenanceService(currentCategory);
  const isJobInquiry = searchParams.get("service") === "job-inquiry" || isJobInquiryService(currentCategory);
  const currentSubcategory = currentCategory?.subcategories.find(
    (s) => s.id === selectedSubcategoryId
  );
  const currentSubSubcategory = currentSubcategory?.children.find((s) => s.id === selectedSubSubcategoryId);
  const configuredFormSchema = currentSubSubcategory?.form_schema?.length
    ? currentSubSubcategory.form_schema
    : currentSubcategory?.form_schema || [];
  const currentFormSchema = isMachineMaintenance
    ? [...MACHINE_MAINTENANCE_FORM_FIELDS, ...configuredFormSchema.filter((field: any) => !MACHINE_MAINTENANCE_FORM_FIELDS.some((base) => base.name === field.name))]
    : configuredFormSchema;
  const categoryIsLocked = Boolean(preselectedCat && currentCategory);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId);
    setDynamicValues({});
    setJobWorkItems([{ id: crypto.randomUUID(), name: "", quantity: "1", unit: "" }]);
    setUploadedFiles({});
    const cat = categories.find((c) => c.id === catId);
    if (cat && cat.subcategories.length > 0) {
      setSelectedSubcategoryId("");
    } else {
      setSelectedSubcategoryId("");
    }
    setSelectedSubSubcategoryId("");
  };

  const handleSubcategoryChange = (subId: string) => {
    setSelectedSubcategoryId(subId);
    setSelectedSubSubcategoryId("");
    setDynamicValues({});
    setJobWorkItems([{ id: crypto.randomUUID(), name: "", quantity: "1", unit: "" }]);
    setUploadedFiles({});
  };

  const handleSubSubcategoryChange = (subId: string) => {
    setSelectedSubSubcategoryId(subId);
    setDynamicValues({});
    setJobWorkItems([{ id: crypto.randomUUID(), name: "", quantity: "1", unit: "" }]);
    setUploadedFiles({});
  };

  const handleFieldChange = (key: string, value: any) => {
    setDynamicValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyMachineRequestHistory = (ticket: ServiceTicket) => {
    const category = categories.find((item) => item.id === ticket.category_id);
    const subcategoryId = ticket.service_subcategory_id || ticket.subcategory_id || "";
    const subcategory = category?.subcategories.find((item) => item.id === subcategoryId);
    const subSubcategoryId = ticket.service_sub_subcategory_id || "";
    const payload = ticket.ticket_payload || {};
    const fileFields = new Set(
      [...MACHINE_MAINTENANCE_FORM_FIELDS, ...(subcategory?.form_schema || [])]
        .filter((field) => ["file", "image", "video"].includes(field.type))
        .map((field) => field.name),
    );
    const restoredFiles: Record<string, Array<{ fileName: string; s3Key: string }>> = {};
    for (const fieldName of fileFields) {
      const value = payload[fieldName];
      const keys = Array.isArray(value) ? value : typeof value === "string" && value ? [value] : [];
      if (keys.length) {
        restoredFiles[fieldName] = keys.map((key: string) => ({
          fileName: String(key).split("/").pop() || "Previously uploaded file",
          s3Key: key,
        }));
      }
    }
    setSelectedCategoryId(ticket.category_id);
    setSelectedSubcategoryId(subcategoryId);
    setSelectedSubSubcategoryId(subSubcategoryId);
    setDynamicValues(payload);
    setUploadedFiles(restoredFiles);
    setPriority(ticket.priority || "medium");
    setJobTitle(payload.job_title || "");
    setTargetBudget(payload.target_budget ? String(payload.target_budget) : "");
    toast.success("Previous machine request loaded. Review the details before submitting.");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const files = Array.from(e.currentTarget.files || []);
    if (!files.length) return;
    const maxBytes = 5 * 1024 * 1024;
    const invalidFile = files.find((file) => file.size > maxBytes || (field.type === "image" && !file.type.startsWith("image/")) || (field.type === "video" && !file.type.startsWith("video/")));
    if (invalidFile) {
      toast.error(`${invalidFile.name} must be a valid ${field.type} file no larger than 5 MB.`);
      e.currentTarget.value = "";
      return;
    }
    const existingFiles = uploadedFiles[field.name] || [];
    const maxFiles = Number(field.max_files || 1);
    if (existingFiles.length + files.length > maxFiles) {
      toast.error(`You can attach up to ${maxFiles} file${maxFiles === 1 ? "" : "s"} for ${field.label}.`);
      e.currentTarget.value = "";
      return;
    }
    try {
      setUploadingField(field.name);
      const newFiles = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`${API_BASE_URL}/api/upload`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        const json = await res.json();
        if (!res.ok || !json.success || !json.fileName) throw new Error(json.message || `Could not upload ${file.name}.`);
        newFiles.push({ fileName: file.name, s3Key: json.fileName });
      }
      const allFiles = [...existingFiles, ...newFiles];
      setUploadedFiles((prev) => ({ ...prev, [field.name]: allFiles }));
      setDynamicValues((prev) => ({ ...prev, [field.name]: field.multiple ? allFiles.map((file) => file.s3Key) : allFiles[0].s3Key }));
      toast.success(`Attached ${newFiles.length} file${newFiles.length === 1 ? "" : "s"}.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to upload file.");
    } finally {
      setUploadingField(null);
    }
  };

  const previewUpload = async (s3Key: string) => {
    const previewWindow = window.open("about:blank", "_blank");
    try {
      const response = await fetch(`${API_BASE_URL}/api/upload/file?fileName=${encodeURIComponent(s3Key)}`, { credentials: "include" });
      const result = await response.json();
      const url = result.url || result.fileUrl || result.file_url || result.data?.url;
      if (!response.ok || !url) throw new Error(result.message || "Preview is unavailable for this file.");
      if (previewWindow) previewWindow.location.href = url;
      else throw new Error("Allow pop-ups to preview the uploaded file.");
    } catch (error: any) {
      previewWindow?.close();
      toast.error(error.message || "Could not open file preview.");
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
    for (const field of isJobInquiry ? [] : currentFormSchema) {
      if (field.required) {
        const val = dynamicValues[field.name];
      if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
          toast.error(`Please fill in required field: "${field.label}"`);
          return;
        }
      }
    }
    if (isJobInquiry) {
      if (jobWorkItems.some((item) => !item.name.trim() || !item.unit.trim() || Number(item.quantity) <= 0)) {
        toast.error("Add a name, quantity, and unit for every job item.");
        return;
      }
      if (!dynamicValues.supply_location?.trim() || jobWorkItems.some((item) => !item.materialGrade?.trim())) {
        toast.error("Enter the supply location and material grade for every item.");
        return;
      }
      if (!dynamicValues.declaration_accepted) {
        toast.error("Please accept the declaration before submitting.");
        return;
      }
    }
    try {
      setSubmitting(true);
      const ticketPayload: Record<string, any> = {
        service_name: isMachineMaintenance ? "Machine Maintenance" : isJobInquiry ? "Job Inquiry" : undefined,
        service_code: isMachineMaintenance ? "machine_maintenance" : isJobInquiry ? "job_inquiry" : undefined,
        job_title: jobTitle.trim() || `${isMachineMaintenance ? "Machine Maintenance" : isJobInquiry ? "Job Inquiry" : currentSubcategory?.name || currentCategory?.label} Request`,
        target_budget: targetBudget ? parseFloat(targetBudget) : undefined,
        ...dynamicValues,
      };
      if (isJobInquiry) {
        ticketPayload.job_work_items = jobWorkItems.map((item) => ({
          item_name: item.name.trim(),
          quantity: Number(item.quantity),
          unit: item.unit.trim(),
          notes: item.notes?.trim() || "",
          material_grade: item.materialGrade?.trim() || "",
          last_accepted_delivery_date: item.lastAcceptedDeliveryDate || "",
          preferred_delivery_date: item.preferredDeliveryDate || "",
          drawings: dynamicValues[`job_drawings_${item.id}`] || [],
        }));
        ticketPayload.penalty_terms = "0.5% per week, subject to client and vendor agreement";
      }
      const documents = Object.entries(uploadedFiles).flatMap(([fieldKey, files]) => files.map((fileInfo) => ({
        doc_type: fieldKey,
        doc_url: fileInfo.s3Key,
        doc_name: fileInfo.fileName,
      })));
      let machineAssetId: string | undefined;
      if (isMachineMaintenance) {
        const machineNumber = String(dynamicValues.machine_number || "").trim();
        const existingAsset = machineAssets.find((asset) => asset.asset_code?.trim().toLowerCase() === machineNumber.toLowerCase());
        if (existingAsset) {
          machineAssetId = existingAsset.id;
        } else {
          const savedAsset = await createClientAsset({
            asset_name: String(dynamicValues.machine_name || "").trim(),
            asset_code: machineNumber,
            brand: String(dynamicValues.manufacturer || "").trim(),
            model_number: String(dynamicValues.model || "").trim(),
            service_category_id: selectedCategoryId,
            specs: {
              system_name: dynamicValues.system_name || "",
              machine_size_xyz: dynamicValues.machine_size_xyz || "",
              machine_work_type: dynamicValues.machine_work_type || "",
              machine_category_id: selectedSubcategoryId,
              machine_subcategory_id: selectedSubSubcategoryId || null,
            },
            documents,
          });
          machineAssetId = savedAsset.id;
          setMachineAssets((assets) => [...assets, savedAsset]);
        }
      }
      const created = await createServiceTicket({
        category_id: selectedCategoryId,
        service_subcategory_id: selectedSubcategoryId || undefined,
        service_sub_subcategory_id: selectedSubSubcategoryId || undefined,
        asset_id: machineAssetId,
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
              {isJobInquiry ? "Job Inquiry Submitted Successfully" : "Service Request Placed Successfully"}
            </h1>
            <p className="mt-1 font-mono text-xs font-semibold text-zinc-600">
              Ticket #{submittedTicket.ticket_number}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-zinc-500">
              {isJobInquiry ? "Your job inquiry and drawings have been sent to eligible service vendors. Review their item rates and delivery commitments in your Ticket Room." : "Your service request has been broadcasted to verified service vendors. You will receive itemized quotes in your Ticket Room."}
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
          <div className="mt-6 space-y-5">
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">
                {isMachineMaintenance ? "Machine Maintenance Request" : isJobInquiry ? "Job Inquiry Request" : "Raise Custom Service Request"}
              </h1>
              <p className="mt-1 text-xs text-zinc-500">
                {isMachineMaintenance ? "Add your machine specifications and work requirements. Vendors will use these details to prepare a quotation." : isJobInquiry ? "List the items you need manufactured, attach drawings, and provide material and delivery requirements for vendor quotations." : "Select your service category and subcategory. All dynamic fields configured by administration will be rendered below."}
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
              <div className={isMachineMaintenance ? "grid items-start gap-6 lg:grid-cols-[270px_minmax(0,1fr)]" : "space-y-4"}>

              {isMachineMaintenance && (
                <aside className="min-w-0 rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 lg:sticky lg:top-6" aria-label="Machine maintenance request history">
                  <div className="mb-3 flex items-center justify-between gap-2 border-b border-zinc-200 pb-3">
                    <div>
                      <h2 className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900"><History className="h-3.5 w-3.5 text-blue-600" />Request history</h2>
                      <p className="mt-1 text-[11px] text-zinc-500">Select one to fill the form</p>
                    </div>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-zinc-600">{machineRequestHistory.length}</span>
                  </div>
                  {machineRequestHistory.length ? (
                    <div className="max-h-[calc(100vh-220px)] min-h-0 space-y-2 overflow-y-auto pr-1">
                      {machineRequestHistory.map((ticket) => {
                        const payload = ticket.ticket_payload || {};
                        const title = payload.machine_name || ticket.asset_name || payload.job_title || "Machine request";
                        return (
                          <button
                            key={ticket.id}
                            type="button"
                            onClick={() => applyMachineRequestHistory(ticket)}
                            className="block w-full min-w-0 rounded-lg border border-zinc-200 bg-white p-2.5 text-left transition hover:border-blue-300 hover:bg-blue-50/60 focus:outline-none focus:ring-2 focus:ring-blue-200"
                          >
                            <span className="block truncate text-xs font-semibold text-zinc-800">{title}</span>
                            <span className="mt-0.5 block truncate text-[10px] text-zinc-500">
                              {[payload.machine_number && `M/C No. ${payload.machine_number}`, ticket.service_subcategory_name || ticket.subcategory_name]
                                .filter(Boolean).join(" · ") || ticket.ticket_number}
                            </span>
                            <span className="mt-1 block text-[10px] text-zinc-400">{new Date(ticket.created_at).toLocaleDateString()} · {ticket.status.replace(/_/g, " ")}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="rounded-lg border border-dashed border-zinc-300 bg-white p-3 text-[11px] leading-relaxed text-zinc-500">Your previous Machine Maintenance requests will appear here.</p>
                  )}
                </aside>
              )}
              <form onSubmit={handleSubmit} className="min-w-0 space-y-4">

                {/* 1. Category & Subcategory Selection */}
                <div className="min-w-0 rounded-xl border border-zinc-200 bg-white p-5 space-y-4 shadow-xs sm:p-6">
                  <div className="border-b border-zinc-100 pb-3">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                      1. Choose Service Type
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {categoryIsLocked && currentCategory && (
                      <div>
                        <span className="mb-1 block text-xs font-medium text-zinc-700">Selected Service Category</span>
                        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-700">
                          {currentCategory.label}
                        </div>
                      </div>
                    )}
                    {!categoryIsLocked && <div>
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
                    </div>}
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">
                        Subcategory {currentCategory?.subcategories.length ? <span className="text-rose-500">*</span> : null}
                      </label>
                      <select
                        value={selectedSubcategoryId}
                        onChange={(e) => handleSubcategoryChange(e.target.value)}
                        required={Boolean(currentCategory?.subcategories.length)}
                        disabled={!currentCategory || currentCategory.subcategories.length === 0}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 focus:border-blue-600 focus:outline-none disabled:bg-zinc-50"
                      >
                        {currentCategory && currentCategory.subcategories.length > 0 ? (
                          <>
                          <option value="">Choose a subcategory...</option>
                          {currentCategory.subcategories.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                              {sub.name}
                            </option>
                          ))}
                          </>
                        ) : (
                          <option value="">No subcategories</option>
                        )}
                      </select>
                    </div>
                    {Boolean(currentSubcategory?.children.length) && <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">
                        Sub-subcategory <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={selectedSubSubcategoryId}
                        onChange={(e) => handleSubSubcategoryChange(e.target.value)}
                        required
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 focus:border-blue-600 focus:outline-none"
                      >
                        <option value="">Choose a sub-subcategory...</option>
                        {currentSubcategory?.children.map((sub) => (
                          <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                      </select>
                    </div>}
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

                {isJobInquiry ? (
                <div className="min-w-0 rounded-xl border border-zinc-200 bg-white p-5 space-y-4 shadow-xs sm:p-6">
                  <div className="border-b border-zinc-100 pb-3">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">2. Jobwork Inquiry</h2>
                    <p className="mt-1 text-[11px] text-zinc-500">Add each item separately and attach its drawing. Vendors will quote each item with delivery commitments.</p>
                  </div>
                  <div className="space-y-3">
                    {jobWorkItems.map((item, index) => {
                      const drawingKey = `job_drawings_${item.id}`;
                      const drawingField = { name: drawingKey, label: `Drawings for item ${index + 1}`, type: "file", multiple: true, max_files: 8 };
                      return <div key={item.id} className="rounded-lg border border-zinc-200 bg-zinc-50/60 p-3 space-y-3">
                        <div className="flex items-center justify-between"><h3 className="text-xs font-semibold text-zinc-800">Item {index + 1}</h3>
                          {jobWorkItems.length > 1 && <button type="button" onClick={() => setJobWorkItems((items) => items.filter((row) => row.id !== item.id))} className="text-xs font-medium text-rose-600">Remove item</button>}
                        </div>
                        <div className="grid gap-2 sm:grid-cols-[2fr_1fr_1fr]">
                          <label className="text-[11px] font-medium text-zinc-600">Item name *<input required value={item.name} onChange={(event) => setJobWorkItems((items) => items.map((row) => row.id === item.id ? { ...row, name: event.target.value } : row))} className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs" placeholder="Part or jobwork item" /></label>
                          <label className="text-[11px] font-medium text-zinc-600">Quantity *<input required type="number" min="0.01" step="any" value={item.quantity} onChange={(event) => setJobWorkItems((items) => items.map((row) => row.id === item.id ? { ...row, quantity: event.target.value } : row))} className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs" /></label>
                          <label className="text-[11px] font-medium text-zinc-600">Unit *<select required value={item.unit} onChange={(event) => setJobWorkItems((items) => items.map((row) => row.id === item.id ? { ...row, unit: event.target.value } : row))} className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs"><option value="">Select unit</option>{JOB_ITEM_UNITS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}</select></label>
                        </div>
                        <label className="block text-[11px] font-medium text-zinc-600">Important points / item notes<textarea rows={2} value={item.notes || ""} onChange={(event) => setJobWorkItems((items) => items.map((row) => row.id === item.id ? { ...row, notes: event.target.value } : row))} className="mt-1 w-full rounded-lg border border-zinc-200 bg-white p-3 text-xs" placeholder="Critical dimensions, tolerance, finish, or other requirements" /></label>
                        <div className="grid gap-2 sm:grid-cols-3">
                          <label className="text-[11px] font-medium text-zinc-600">Material grade *<input required value={item.materialGrade || ""} onChange={(event) => setJobWorkItems((items) => items.map((row) => row.id === item.id ? { ...row, materialGrade: event.target.value } : row))} className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs" placeholder="Grade / specification" /></label>
                          <label className="text-[11px] font-medium text-zinc-600">Last accepted delivery date<input type="date" value={item.lastAcceptedDeliveryDate || ""} onChange={(event) => setJobWorkItems((items) => items.map((row) => row.id === item.id ? { ...row, lastAcceptedDeliveryDate: event.target.value } : row))} className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs" /></label>
                          <label className="text-[11px] font-medium text-zinc-600">Preferred delivery date<input type="date" value={item.preferredDeliveryDate || ""} onChange={(event) => setJobWorkItems((items) => items.map((row) => row.id === item.id ? { ...row, preferredDeliveryDate: event.target.value } : row))} className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs" /></label>
                        </div>
                        <div className="space-y-2"><label className="block text-[11px] font-medium text-zinc-600">Drawing attachments (PDF, image, CAD) · up to 8 files</label>
                          {(uploadedFiles[drawingKey] || []).map((file, fileIndex) => <div key={`${file.s3Key}-${fileIndex}`} className="flex items-center justify-between rounded border bg-white p-2 text-xs"><span className="truncate">{file.fileName}</span><div className="ml-2 flex shrink-0 gap-3"><button type="button" onClick={() => void previewUpload(file.s3Key)} className="font-medium text-blue-700">Preview</button><button type="button" onClick={() => { const next = uploadedFiles[drawingKey].filter((_, i) => i !== fileIndex); setUploadedFiles((prev) => ({ ...prev, [drawingKey]: next })); handleFieldChange(drawingKey, next.map((row) => row.s3Key)); }} className="text-rose-600">Remove</button></div></div>)}
                          {(uploadedFiles[drawingKey] || []).length < 8 && <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-zinc-300 bg-white p-3 text-xs text-zinc-600"><Upload className="h-4 w-4" />{uploadingField === drawingKey ? "Uploading…" : "Attach drawings"}<input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.dwg,.dxf,.step,.stp,.iges,.igs" multiple className="hidden" onChange={(event) => handleFileUpload(event, drawingField)} /></label>}
                        </div>
                      </div>;
                    })}
                  </div>
                  <button type="button" onClick={() => setJobWorkItems((items) => [...items, { id: crypto.randomUUID(), name: "", quantity: "1", unit: "" }])} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">+ Add another item</button>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-medium text-zinc-700">Supply location *<input required value={dynamicValues.supply_location || ""} onChange={(event) => handleFieldChange("supply_location", event.target.value)} className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2" placeholder="City / delivery address" /></label>
                    <label className="text-xs font-medium text-zinc-700">Delivery type<select value={dynamicValues.delivery_type || ""} onChange={(event) => handleFieldChange("delivery_type", event.target.value)} className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2"><option value="">Select delivery type</option><option value="single">All items together</option><option value="staggered">Staggered / partial deliveries</option></select></label>
                    <label className="text-xs font-medium text-zinc-700">Overall inquiry notes<textarea rows={2} value={dynamicValues.inquiry_notes || ""} onChange={(event) => handleFieldChange("inquiry_notes", event.target.value)} className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2" placeholder="Additional jobwork requirements" /></label>
                  </div>
                  <label className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-900"><input type="checkbox" checked={Boolean(dynamicValues.declaration_accepted)} onChange={(event) => handleFieldChange("declaration_accepted", event.target.checked)} className="mt-0.5" /><span>I confirm the item details and drawings are accurate. The workbook notes a late-delivery penalty of 0.5% per week; final terms must be agreed in the quotation.</span></label>
                </div>
                ) : <>

                {/* 2. Dynamic Form Schema (Configured by Admin) */}
                <div className="min-w-0 rounded-xl border border-zinc-200 bg-white p-5 space-y-4 shadow-xs sm:p-6">
                  <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                        2. Technical Specifications ({currentSubSubcategory?.name || currentSubcategory?.name || "Service"})
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
                        const isUpload = field.type === "file" || field.type === "image" || field.type === "video";
                        const isFullWidth = field.type === "textarea" || isUpload;
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
                            ) : isUpload ? (
                              <div>
                                {(uploadedFiles[field.name] || []).map((file, fileIndex) => (
                                  <div key={`${file.s3Key}-${fileIndex}`} className="mb-2 flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-xs">
                                    <div className="flex items-center gap-2 truncate">
                                      <Paperclip className="h-4 w-4 text-blue-600 shrink-0" />
                                      <span className="truncate font-medium text-zinc-800">{file.fileName}</span>
                                    </div>
                                    <div className="ml-2 flex shrink-0 items-center gap-3">
                                    <button type="button" onClick={() => void previewUpload(file.s3Key)} className="font-medium text-blue-700">Preview</button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextFiles = (uploadedFiles[field.name] || []).filter((_, index) => index !== fileIndex);
                                        setUploadedFiles((prev) => ({ ...prev, [field.name]: nextFiles }));
                                        handleFieldChange(field.name, field.multiple ? nextFiles.map((item) => item.s3Key) : nextFiles[0]?.s3Key || "");
                                      }}
                                      className="text-zinc-400 hover:text-rose-600"
                                      aria-label={`Remove ${file.fileName}`}
                                    ><X className="h-4 w-4" /></button>
                                    </div>
                                  </div>
                                ))}
                                {(!uploadedFiles[field.name] || uploadedFiles[field.name].length < Number(field.max_files || 1)) && (
                                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50/50 p-3 text-center text-xs text-zinc-600 hover:bg-zinc-50 transition">
                                    {uploadingField === field.name ? (
                                      <Loader2 className="h-4 w-4 animate-spin text-blue-600 mb-1" />
                                    ) : (
                                      <Upload className="h-4 w-4 text-zinc-400 mb-1" />
                                    )}
                                    <span className="font-medium">
                                      {field.placeholder || (field.type === "image" ? `Upload photo for ${field.label}` : field.type === "video" ? `Upload video for ${field.label}` : `Attach file for ${field.label}`)}
                                    </span>
                                    <span className="text-[10px] text-zinc-400 mt-0.5">
                                      {field.multiple ? `Up to ${field.max_files || 1} files · 5 MB each` : field.type === "video" ? "One video · 5 MB max" : field.type === "image" ? "JPG, PNG, WEBP · 5 MB max" : "CAD, PDF, STEP, ZIP · 5 MB max"}
                                    </span>
                                    <input
                                      type="file"
                                      accept={field.type === "image" ? "image/png,image/jpeg,image/jpg,image/webp" : field.type === "video" ? "video/*" : "*"}
                                      multiple={Boolean(field.multiple)}
                                      onChange={(e) => handleFileUpload(e, field)}
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
                </>}

                {/* Submit Action */}
                <div className="flex items-center justify-end gap-3 border-t border-zinc-100 pt-4">
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
              </div>
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
