"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Briefcase,
  ArrowLeft,
  MapPin,
  CheckCircle2,
  FileText,
  Send,
  Loader2,
  Check,
} from "lucide-react";
import { fetchCandidateDetail, submitHireRequest, type CandidateListItem } from "@/lib/api/hiring";
import { useAuthStore } from "@/store/authStore";

export default function CandidateDetailPage() {
  const params = useParams();
  const candidateId = String(params?.id || "");
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [candidate, setCandidate] = useState<CandidateListItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Hire Form
  const [companyName, setCompanyName] = useState("");
  const [hiringType, setHiringType] = useState("Contract Staffing");
  const [duration, setDuration] = useState("3 Months");
  const [salaryOffered, setSalaryOffered] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  useEffect(() => {
    if (candidateId) {
      loadDetail();
    }
  }, [candidateId]);

  async function loadDetail() {
    try {
      setLoading(true);
      const data = await fetchCandidateDetail(candidateId);
      setCandidate(data);
    } catch (err) {
      console.error("Failed to load candidate:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleHireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please login to submit a hire request.");
      router.push(`/login?redirect=/hiring/${candidateId}`);
      return;
    }

    try {
      setSubmitting(true);
      await submitHireRequest(candidateId, {
        hiring_type: hiringType,
        duration,
        salary_offered: salaryOffered ? Number(salaryOffered) || salaryOffered : undefined,
        company_name: companyName.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      setRequestSuccess(true);
      toast.success("Hire request submitted successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-2 text-zinc-400">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        <p className="text-xs">Loading profile...</p>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="mx-auto my-20 max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-xs">
        <h2 className="text-sm font-semibold text-zinc-900">Candidate Not Found</h2>
        <p className="mt-1 text-xs text-zinc-500">This profile may have been removed or updated.</p>
        <Link
          href="/hiring"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Talent Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24 pt-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/hiring"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Talent Directory
        </Link>

        {/* Top Header Card */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl font-semibold text-zinc-900">
                {candidate.full_name}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
                <Check className="h-3.5 w-3.5 text-blue-600" /> Verified Candidate
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-zinc-600">{candidate.designation || "Industrial Specialist"}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
              {candidate.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400" /> {candidate.city}
                </span>
              )}
              <span>•</span>
              <span>{candidate.experience_years || 0} years experience</span>
              {candidate.metadata?.hiring_type && (
                <>
                  <span>•</span>
                  <span className="capitalize">{candidate.metadata.hiring_type}</span>
                </>
              )}
            </div>
          </div>

          <div className="text-left sm:text-right rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <span className="text-[10px] uppercase font-semibold text-zinc-400">Expected Wage</span>
            <p className="font-heading text-xl font-bold text-zinc-900">
              {candidate.metadata?.expected_salary
                ? `₹${Number(candidate.metadata.expected_salary).toLocaleString("en-IN")}/mo`
                : "Negotiable"}
            </p>
          </div>
        </div>

        {/* 2-Column Content */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left 2 Cols: Profile info */}
          <div className="space-y-6 lg:col-span-2">
            {/* Skills */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-3 shadow-xs">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                Technical Skills & Competencies
              </h2>
              <div className="flex flex-wrap gap-2 pt-1">
                {candidate.skills?.map((s, idx) => (
                  <span
                    key={idx}
                    className="rounded-md border border-zinc-100 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-800"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Work History / Bio */}
            {candidate.metadata?.bio && (
              <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-3 shadow-xs">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                  Professional Background
                </h2>
                <p className="text-xs leading-relaxed text-zinc-600 whitespace-pre-line">
                  {candidate.metadata.bio}
                </p>
              </div>
            )}

            {/* Verified Documents */}
            {candidate.documents && candidate.documents.length > 0 && (
              <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-3 shadow-xs">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                  Compliance & Verified Documents
                </h2>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {candidate.documents.map((d) => (
                    <div key={d.id} className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/60 p-3">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="h-4 w-4 text-zinc-500 shrink-0" />
                        <span className="text-xs font-medium text-zinc-800 capitalize truncate">
                          {d.doc_name || d.doc_type.replace(/_/g, " ")}
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Verified
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Col: Hire Request Form */}
          <div>
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                Request to Hire
              </h2>

              {requestSuccess ? (
                <div className="rounded-lg bg-zinc-50 p-6 text-center space-y-2">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-blue-600" />
                  <p className="text-xs font-semibold text-zinc-900">Request Submitted</p>
                  <p className="text-[11px] text-zinc-500">
                    Our staffing team has received your engagement request and will contact you.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleHireSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">Company / Plant Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Apex Precision Works"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">Engagement Type</label>
                    <select
                      value={hiringType}
                      onChange={(e) => setHiringType(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none"
                    >
                      <option value="Contract Staffing">Contract Staffing</option>
                      <option value="Direct Full-Time Hire">Direct Full-Time Hire</option>
                      <option value="Project-Based Freelance">Project-Based Freelance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">Duration / Shift</label>
                    <input
                      type="text"
                      placeholder="e.g. 3 Months, 2 Shifts"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">Proposed Monthly Wage (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 25000"
                      value={salaryOffered}
                      onChange={(e) => setSalaryOffered(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">Requirement Notes</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Immediate joining required for Chakan plant night shift..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-xs font-medium text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    Submit Hire Request
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
