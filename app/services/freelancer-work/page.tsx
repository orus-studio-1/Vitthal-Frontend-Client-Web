"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, FileText, Loader2, Paperclip, Send, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { createServiceTicket, fetchServiceCategories, type ServiceCategory } from "@/lib/api/serviceHub";
import { isFreelancerWorkService } from "@/lib/services/freelancerWork";
import { useAuthStore } from "@/store/authStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";
type AttachedFile = { name: string; key: string; url: string };

export default function FreelancerWorkPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [categoryId, setCategoryId] = useState("");
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [subcategoryId, setSubcategoryId] = useState("");
  const [subSubcategoryId, setSubSubcategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [requiredDateTime, setRequiredDateTime] = useState("");
  const [communicationDetails, setCommunicationDetails] = useState("");
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<{ id: string; ticket_number: string } | null>(null);

  useEffect(() => {
    fetchServiceCategories()
      .then((values) => {
        const matchedCategory = values.find(isFreelancerWorkService) || null;
        setServiceCategory(matchedCategory);
        setCategoryId(matchedCategory?.id || "");
      })
      .catch((error) => console.error("Failed to load Freelancer Work category:", error))
      .finally(() => setCategoryLoading(false));
  }, []);

  const selectedSubcategory = serviceCategory?.subcategories.find((subcategory) => subcategory.id === subcategoryId) || null;
  const selectedSubSubcategory = selectedSubcategory?.children.find((subcategory) => subcategory.id === subSubcategoryId) || null;

  async function uploadFiles(selected: FileList | null) {
    if (!selected?.length) return;
    setUploading(true);
    try {
      const attached: AttachedFile[] = [];
      for (const file of Array.from(selected)) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch(`${API_BASE_URL}/api/upload`, { method: "POST", credentials: "include", body: formData });
        const result = await response.json();
        if (!response.ok || !result.success || !result.fileName) throw new Error(result.message || `Could not upload ${file.name}.`);
        let url = result.fileName as string;
        const urlResponse = await fetch(`${API_BASE_URL}/api/upload/file?fileName=${encodeURIComponent(result.fileName)}`, { credentials: "include" });
        if (urlResponse.ok) {
          const urlResult = await urlResponse.json();
          url = urlResult.url || url;
        }
        attached.push({ name: file.name, key: result.fileName, url });
      }
      setFiles((current) => [...current, ...attached]);
      toast.success("Project files attached.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload the project files.");
    } finally {
      setUploading(false);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAuthenticated) {
      router.push("/login?redirect=/services/freelancer-work");
      return;
    }
    if (!categoryId) {
      toast.error("The Freelancer Work category is not configured yet.");
      return;
    }
    if (!subcategoryId) {
      toast.error("Select a Freelancer Work subcategory before sending the request.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await createServiceTicket({
        category_id: categoryId,
        priority: "medium",
        ticket_payload: {
          service_code: "freelancer_work",
          service_name: "Freelancer Work",
          project_description: description.trim(),
          work_type: selectedSubSubcategory?.name || selectedSubcategory?.name || "",
          required_project_datetime: requiredDateTime,
          communication_details: communicationDetails.trim(),
          job_title: `Freelancer Work — ${selectedSubSubcategory?.name || selectedSubcategory?.name || "Project"}`,
        },
        service_subcategory_id: subcategoryId,
        service_sub_subcategory_id: subSubcategoryId || undefined,
        documents: files.map((file) => ({ doc_type: "freelancer_project_file", doc_name: file.name, doc_url: file.url })),
      });
      setCreated({ id: result.id, ticket_number: result.ticket_number });
      toast.success("Freelancer Work request sent to service vendors.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit the project request.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none";

  return <main className="min-h-screen bg-white pb-20 pt-8"><div className="mx-auto max-w-3xl px-4 sm:px-6">
    <Link href="/services" className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900"><ArrowLeft className="h-3.5 w-3.5" /> Back to Service Hub</Link>
    {created ? <section className="mt-8 rounded-xl border border-zinc-200 p-10 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-blue-600" /><h1 className="mt-4 text-xl font-semibold">Freelancer Work request sent</h1><p className="mt-1 font-mono text-sm text-blue-600">{created.ticket_number}</p><Link href={`/services/tickets/${created.id}`} className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-2 text-sm text-white">Open Ticket Room</Link></section> : <>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-900">Freelancer Work</h1>
      <p className="mt-1 text-sm text-zinc-500">Describe the project, attach reference files, and receive a quote from suitable freelancers.</p>
      {categoryLoading ? <div className="mt-6 flex items-center gap-2 rounded-lg bg-zinc-50 p-4 text-sm text-zinc-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading service category…</div> : !categoryId || !serviceCategory ? <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">The Freelancer Work service category is not configured. Please contact support.</div> : <form onSubmit={submit} className="mt-6 space-y-5 rounded-xl border border-zinc-200 p-6 shadow-xs">
        <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"><p className="text-xs font-medium text-zinc-500">Main category</p><p className="mt-1 text-sm font-semibold text-zinc-900">{serviceCategory.label}</p></section>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-zinc-700">Subcategory *<select required value={subcategoryId} onChange={(event) => { setSubcategoryId(event.target.value); setSubSubcategoryId(""); }} className={inputClass}><option value="">Choose a subcategory</option>{serviceCategory.subcategories.map((subcategory) => <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>)}</select></label>
          {selectedSubcategory?.children.length ? <label className="block text-sm font-medium text-zinc-700">Sub-subcategory<select value={subSubcategoryId} onChange={(event) => setSubSubcategoryId(event.target.value)} className={inputClass}><option value="">No specific subtype</option>{selectedSubcategory.children.map((subcategory) => <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>)}</select></label> : null}
        </div>
        {!serviceCategory.subcategories.length && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">No Freelancer Work subcategories are configured yet. Ask an administrator to add them before submitting requests.</p>}
        <label className="block text-sm font-medium text-zinc-700">Project description *<textarea required rows={5} value={description} onChange={(event) => setDescription(event.target.value)} className={inputClass} placeholder="Describe the work, expected outcome, and any relevant details." /></label>
        <label className="block text-sm font-medium text-zinc-700">Required project date and time *<input required type="datetime-local" value={requiredDateTime} onChange={(event) => setRequiredDateTime(event.target.value)} className={inputClass} /></label>
        <label className="block text-sm font-medium text-zinc-700">Communication details *<textarea required rows={3} value={communicationDetails} onChange={(event) => setCommunicationDetails(event.target.value)} className={inputClass} placeholder="Preferred contact method and contact details." /></label>
        <section className="rounded-lg border border-zinc-200 p-4"><h2 className="text-sm font-semibold text-zinc-800">Attach project files</h2><p className="mt-1 text-xs text-zinc-500">Add drawings, briefs, images, or other project references.</p>
          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100">{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} {uploading ? "Uploading…" : "Choose files"}<input type="file" multiple onChange={(event) => { void uploadFiles(event.target.files); event.currentTarget.value = ""; }} className="hidden" /></label>
          {files.length > 0 && <ul className="mt-3 space-y-2">{files.map((file, index) => <li key={`${file.key}-${index}`} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-zinc-50 px-3 py-2 text-xs"><span className="flex min-w-0 items-center gap-2 truncate"><FileText className="h-4 w-4 shrink-0 text-blue-600" /><span className="truncate">{file.name}</span></span><span className="flex items-center gap-3"><a href={file.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:underline"><Paperclip className="h-3 w-3" /> Preview</a><button type="button" aria-label={`Remove ${file.name}`} onClick={() => setFiles((current) => current.filter((_, i) => i !== index))} className="text-zinc-500 hover:text-rose-600"><X className="h-4 w-4" /></button></span></li>)}</ul>}
        </section>
        <div className="flex justify-end"><button disabled={submitting || uploading} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{submitting ? "Sending request…" : "Send project request"}</button></div>
      </form>}
    </>}
  </div></main>;
}
