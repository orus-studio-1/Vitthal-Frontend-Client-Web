"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Cog,
  ArrowLeft,
  Upload,
  Send,
  Loader2,
  CheckCircle2,
  Paperclip,
  X,
  FileCode2,
} from "lucide-react";
import { createServiceTicket, fetchServiceCategories } from "@/lib/api/serviceHub";
import { useAuthStore } from "@/store/authStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

const PROCESSES = [
  "CNC Turning & Lathe Machining",
  "VMC Milling (3 / 4 / 5 Axis)",
  "Laser Cutting (Fiber / CO2)",
  "Sheet Metal Bending & Fabrication",
  "Wire EDM & Spark Erosion",
  "Surface Grinding & Honing",
  "Powder Coating & Anodizing",
  "Heat Treatment & Nitriding",
];

const RAW_MATERIALS = [
  "Stainless Steel (SS 304 / SS 316 / SS 410)",
  "Mild Steel (MS / IS 2062 / En Series)",
  "Aluminum (6061-T6 / 7075 / 5052)",
  "Alloy Steel (EN8 / EN19 / EN24 / EN31)",
  "Brass & Copper Alloy",
  "Engineering Plastic (Delrin / POM / Nylon)",
  "Cast Iron (CI / SG Iron)",
  "Client Provided Raw Stock",
];

export default function JobWorkRFQPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [categoryId, setCategoryId] = useState<string>("");
  const [jobTitle, setJobTitle] = useState("");
  const [selectedProcess, setSelectedProcess] = useState(PROCESSES[0]);
  const [materialGrade, setMaterialGrade] = useState(RAW_MATERIALS[0]);
  const [quantity, setQuantity] = useState(50);
  const [tolerance, setTolerance] = useState("±0.05 mm (Standard Precision)");
  const [targetDeliveryDays, setTargetDeliveryDays] = useState("7 Days");
  const [scopeDetails, setScopeDetails] = useState("");

  // CAD uploads
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ doc_type: string; doc_url: string; doc_name: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdTicketNumber, setCreatedTicketNumber] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const catsData = await fetchServiceCategories();
      const jobWorkCat = catsData.find(
        (c) => c.code.toLowerCase().includes("job") || c.label.toLowerCase().includes("job")
      ) || catsData[0];

      if (jobWorkCat) setCategoryId(jobWorkCat.id);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }

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
          doc_type: "cad_drawing",
          doc_name: file.name,
          doc_url: urlJson.url || fileKey,
        },
      ]);
      toast.success("Drawing file attached.");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload drawing.");
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
      toast.error("Please login to submit a Job Work RFQ.");
      router.push("/login?redirect=/services/jobwork");
      return;
    }

    if (!jobTitle.trim() || !quantity) {
      toast.error("Part Name and Batch Quantity are required.");
      return;
    }

    try {
      setSubmitting(true);

      const ticketPayload = {
        job_title: jobTitle.trim(),
        process_type: selectedProcess,
        material_grade: materialGrade,
        batch_quantity: Number(quantity),
        tolerance,
        target_delivery_days: targetDeliveryDays,
        technical_notes: scopeDetails.trim() || undefined,
        rfq_type: "Industrial Job Work & Machining",
      };

      const res = await createServiceTicket({
        category_id: categoryId,
        priority: "medium",
        ticket_payload: ticketPayload,
        documents: uploadedFiles,
      });

      setCreatedTicketNumber(res.ticket_number);
      toast.success("Job Work RFQ broadcasted to machining centers.");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit RFQ.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24 pt-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
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
              Machining RFQ Broadcasted
            </h1>
            <p className="mt-1 font-mono text-sm font-semibold text-blue-600">
              {createdTicketNumber}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-zinc-500">
              Your technical drawings have been routed to certified machining facilities. You will receive competitive line-item quotations in your dashboard.
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/services/tickets"
                className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-medium text-white shadow-xs transition hover:bg-blue-700"
              >
                View Quotations
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
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">
                Industrial Job Work & Machining RFQ
              </h1>
              <p className="mt-1 text-xs text-zinc-500">
                Post custom manufacturing specifications, CAD drawings, and batch requirements to receive competitive bids.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Specifications */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4 shadow-xs">
                <div className="border-b border-zinc-100 pb-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                    1. Manufacturing Specifications
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Part / Component Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flange Bushing, Spline Shaft, Die Insert"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Primary Machining Process
                    </label>
                    <select
                      value={selectedProcess}
                      onChange={(e) => setSelectedProcess(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    >
                      {PROCESSES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Material Specification
                    </label>
                    <select
                      value={materialGrade}
                      onChange={(e) => setMaterialGrade(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    >
                      {RAW_MATERIALS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Batch Quantity (Pieces) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Tolerance Level
                    </label>
                    <select
                      value={tolerance}
                      onChange={(e) => setTolerance(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="±0.01 mm (Ultra High Precision)">±0.01 mm (Ultra High Precision)</option>
                      <option value="±0.05 mm (Standard Precision)">±0.05 mm (Standard Precision)</option>
                      <option value="±0.1 mm (General Machining)">±0.1 mm (General Machining)</option>
                      <option value="±0.5 mm (Fabrication Grade)">±0.5 mm (Fabrication Grade)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Target Delivery Timeline
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 7 Days, Urgent 48 Hours"
                      value={targetDeliveryDays}
                      onChange={(e) => setTargetDeliveryDays(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Technical Scope, Finishing & Quality QC Requirements
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide additional details regarding surface roughness (Ra), plating, heat treatment hardness (HRC), or inspection criteria..."
                    value={scopeDetails}
                    onChange={(e) => setScopeDetails(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Section 2: Technical Drawings */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4 shadow-xs">
                <div className="border-b border-zinc-100 pb-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                    2. Technical Drawings & CAD Files
                  </h2>
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition">
                      {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" /> : <FileCode2 className="h-3.5 w-3.5 text-zinc-500" />}
                      Attach Drawing
                      <input type="file" accept=".pdf,.step,.stp,.iges,.igs,.dxf,.dwg,.zip,.png,.jpg" onChange={handleFileUpload} className="hidden" />
                    </label>
                    <span className="text-[11px] text-zinc-400">Supported formats: STEP, IGES, DXF, DWG, 2D PDF</span>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {uploadedFiles.map((f, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-700 font-medium"
                        >
                          <FileCode2 className="h-3.5 w-3.5 text-blue-600" />
                          <span className="truncate max-w-[200px]">{f.doc_name}</span>
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
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Broadcasting RFQ...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" /> Broadcast Machining RFQ
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
