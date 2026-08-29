"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Wrench,
  ArrowLeft,
  Package,
  Upload,
  Send,
  Loader2,
  CheckCircle2,
  Paperclip,
  X,
} from "lucide-react";
import { fetchMyAssets, createServiceTicket, fetchServiceCategories, type ClientAsset } from "@/lib/api/serviceHub";
import { useAuthStore } from "@/store/authStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

export default function MaintenanceBookingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [assets, setAssets] = useState<ClientAsset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>("new");
  const [categoryId, setCategoryId] = useState<string>("");

  // Fields
  const [machineName, setMachineName] = useState("");
  const [brand, setBrand] = useState("");
  const [modelNumber, setModelNumber] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [isEmergency, setIsEmergency] = useState(true);
  const [isMachineStopped, setIsMachineStopped] = useState(true);
  const [errorCodes, setErrorCodes] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [plantLocation, setPlantLocation] = useState("");

  // Media
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ doc_type: string; doc_url: string; doc_name: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdTicketNumber, setCreatedTicketNumber] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      const [assetsData, catsData] = await Promise.all([
        isAuthenticated ? fetchMyAssets() : Promise.resolve([]),
        fetchServiceCategories(),
      ]);
      setAssets(assetsData);

      const maintenanceCat = catsData.find(
        (c) => c.code.toLowerCase().includes("maint") || c.label.toLowerCase().includes("maint")
      ) || catsData[0];

      if (maintenanceCat) setCategoryId(maintenanceCat.id);
    } catch (err) {
      console.error("Failed to load initial data:", err);
    }
  }

  const handleAssetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedAssetId(val);

    if (val !== "new") {
      const asset = assets.find((a) => a.id === val);
      if (asset) {
        setMachineName(asset.asset_name);
        setBrand(asset.brand || "");
        setModelNumber(asset.model_number || "");
        setSerialNumber(asset.serial_number || "");
      }
    } else {
      setMachineName("");
      setBrand("");
      setModelNumber("");
      setSerialNumber("");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const uploadJson = await res.json();
      const fileKey = uploadJson.fileName;

      const urlRes = await fetch(
        `${API_BASE_URL}/api/upload/file?fileName=${encodeURIComponent(fileKey)}`,
        { credentials: "include" }
      );
      const urlJson = await urlRes.json();

      setUploadedFiles((prev) => [
        ...prev,
        {
          doc_type: "fault_photo",
          doc_name: file.name,
          doc_url: urlJson.url || fileKey,
        },
      ]);
      toast.success("Attachment added.");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login to raise a service ticket.");
      router.push("/login?redirect=/services/maintenance");
      return;
    }

    if (!machineName.trim() || !symptoms.trim()) {
      toast.error("Machine Name and Symptoms are required.");
      return;
    }

    try {
      setSubmitting(true);

      const ticketPayload = {
        machine_name: machineName.trim(),
        brand: brand.trim() || undefined,
        model_number: modelNumber.trim() || undefined,
        serial_number: serialNumber.trim() || undefined,
        is_machine_stopped: isMachineStopped,
        error_codes: errorCodes.trim() || undefined,
        symptoms: symptoms.trim(),
        plant_location: plantLocation.trim() || undefined,
        service_kind: isEmergency ? "Emergency Breakdown" : "Preventive AMC",
      };

      const res = await createServiceTicket({
        category_id: categoryId,
        asset_id: selectedAssetId !== "new" ? selectedAssetId : undefined,
        priority: isEmergency ? "emergency_breakdown" : "medium",
        ticket_payload: ticketPayload,
        documents: uploadedFiles,
      });

      setCreatedTicketNumber(res.ticket_number);
      toast.success("Service ticket created successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to raise ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24 pt-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Service Hub
        </Link>

        {createdTicketNumber ? (
          <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-10 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h1 className="mt-4 font-heading text-xl font-semibold text-zinc-900">
              Maintenance Ticket Logged
            </h1>
            <p className="mt-1 font-mono text-sm font-semibold text-blue-600">
              {createdTicketNumber}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-zinc-500">
              Your service ticket has been routed to our technical dispatch unit. Certified service engineers will contact you shortly.
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/services/tickets"
                className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-medium text-white shadow-xs transition hover:bg-blue-700"
              >
                Track in Tickets
              </Link>
              <Link
                href="/services"
                className="rounded-lg border border-zinc-200 bg-white px-5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Return to Services
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-8">
            {/* Header */}
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">
                Machinery Maintenance & Breakdown
              </h1>
              <p className="mt-1 text-xs text-zinc-500">
                Submit machine details and symptoms for urgent diagnostics or scheduled preventive maintenance.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Equipment */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                    1. Equipment Identification
                  </h2>
                  {assets.length > 0 && (
                    <span className="text-[11px] text-zinc-500">
                      {assets.length} saved machine{assets.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {assets.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Choose from Registered Assets
                    </label>
                    <select
                      value={selectedAssetId}
                      onChange={handleAssetSelect}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="new">+ Enter New Equipment</option>
                      {assets.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.asset_name} ({a.brand || "Machine"} {a.model_number || ""})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Machine Name / Type <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 5-Axis VMC Milling Center"
                      value={machineName}
                      onChange={(e) => setMachineName(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Make / Manufacturer
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. DMG Mori, Haas, Mazak"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Model Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. VF-2SS"
                      value={modelNumber}
                      onChange={(e) => setModelNumber(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Serial Number / Plant Tag
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SN-99201"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Fault Details */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4 shadow-xs">
                <div className="border-b border-zinc-100 pb-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                    2. Issue Description & Severity
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                      Service Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEmergency(true)}
                        className={`rounded-lg py-2 text-xs font-medium transition ${
                          isEmergency
                            ? "bg-zinc-900 text-white shadow-xs"
                            : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                        }`}
                      >
                        Breakdown (Urgent)
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEmergency(false)}
                        className={`rounded-lg py-2 text-xs font-medium transition ${
                          !isEmergency
                            ? "bg-zinc-900 text-white shadow-xs"
                            : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                        }`}
                      >
                        Preventive / AMC
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                      Machine Operating Status
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setIsMachineStopped(true)}
                        className={`rounded-lg py-2 text-xs font-medium transition ${
                          isMachineStopped
                            ? "border border-zinc-300 bg-zinc-100 text-zinc-900 font-semibold"
                            : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                        }`}
                      >
                        Stopped / Inoperable
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsMachineStopped(false)}
                        className={`rounded-lg py-2 text-xs font-medium transition ${
                          !isMachineStopped
                            ? "border border-zinc-300 bg-zinc-100 text-zinc-900 font-semibold"
                            : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                        }`}
                      >
                        Running with Error
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Error Code / Controller Alarm
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Alarm 2041 Spindle Servo Error"
                      value={errorCodes}
                      onChange={(e) => setErrorCodes(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Plant Address / Bay Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chakan MIDC Phase 2, Bay B"
                      value={plantLocation}
                      onChange={(e) => setPlantLocation(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Fault Symptoms & Recent Operating History <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe the noise, vibration, hydraulic pressure drop, or electrical fault in detail..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                {/* File Attachment */}
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Attach Fault Photo / Controller Screen
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition">
                      {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" /> : <Paperclip className="h-3.5 w-3.5 text-zinc-500" />}
                      Choose File
                      <input type="file" accept="image/*,video/*,.pdf" onChange={handleFileUpload} className="hidden" />
                    </label>
                    <span className="text-[11px] text-zinc-400">JPG, PNG, MP4, PDF up to 10MB</span>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {uploadedFiles.map((f, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-700"
                        >
                          <Paperclip className="h-3 w-3 text-zinc-400" />
                          <span className="truncate max-w-[180px]">{f.doc_name}</span>
                          <button type="button" onClick={() => removeFile(idx)} className="text-zinc-400 hover:text-zinc-600">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Form Action */}
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
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting Request...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" /> Submit Service Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
