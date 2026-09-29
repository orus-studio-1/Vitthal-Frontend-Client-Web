"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  UserPlus,
  ArrowLeft,
  Upload,
  Send,
  Loader2,
  CheckCircle2,
  Paperclip,
  Lock,
  LogIn,
  X,
} from "lucide-react";
import { registerCandidateProfile } from "@/lib/api/hiring";
import { useAuthStore } from "@/store/authStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

const COMMON_SKILLS = [
  "CNC Turning",
  "VMC Milling",
  "TIG/MIG Welding",
  "Lathe Operation",
  "Sheet Metal Fabrication",
  "PLC Programming",
  "Electrical Maintenance",
  "Quality Inspection (CMM/Vernier)",
  "Hydraulics & Pneumatics",
  "Industrial Safety",
];

export default function CandidateRegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user, fetchUser, logout } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [primaryRole, setPrimaryRole] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [currentCity, setCurrentCity] = useState("Pune");
  const [experienceYears, setExperienceYears] = useState<number>(3);
  const [expectedSalary, setExpectedSalary] = useState<number>(25000);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["CNC Turning"]);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [bio, setBio] = useState("");

  // Documents
  const [uploadedDocs, setUploadedDocs] = useState<Array<{ doc_type: string; doc_url: string; doc_name?: string }>>([]);
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  useEffect(() => {
    fetchUser("worker");
  }, [fetchUser]);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const addCustomSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && customSkillInput.trim()) {
      e.preventDefault();
      if (!selectedSkills.includes(customSkillInput.trim())) {
        setSelectedSkills([...selectedSkills, customSkillInput.trim()]);
      }
      setCustomSkillInput("");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingDocType(docType);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const uploadJson = await res.json();
      if (!uploadJson.success) {
        throw new Error(uploadJson.message || "Failed to upload file.");
      }

      const fileKey = uploadJson.fileName;

      // Also get signed URL for immediate preview
      const urlRes = await fetch(
        `${API_BASE_URL}/api/upload/file?fileName=${encodeURIComponent(fileKey)}`,
        { credentials: "include" }
      );
      const urlJson = await urlRes.json();

      setUploadedDocs((prev) => [
        ...prev.filter((d) => d.doc_type !== docType),
        {
          doc_type: docType,
          doc_name: file.name,
          doc_url: fileKey, // store S3 key
        },
      ]);
      toast.success(`${docType.replace(/_/g, " ")} uploaded successfully!`);
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "Failed to upload document.");
    } finally {
      setUploadingDocType(null);
    }
  };

  const removeDoc = (docType: string) => {
    setUploadedDocs(uploadedDocs.filter((d) => d.doc_type !== docType));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login or create an account to submit your worker profile.");
      router.push("/register?role=worker&redirect=/hiring/register");
      return;
    }

    if (user?.role !== "worker") {
      toast.error("Only a worker account can submit a worker profile.");
      return;
    }

    if (!fullName.trim() || !primaryRole.trim() || !phone.trim()) {
      toast.error("Full Name, Primary Role, and Phone are required.");
      return;
    }

    try {
      setSubmitting(true);

      await registerCandidateProfile({
        full_name: fullName.trim(),
        designation: primaryRole.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        city: currentCity.trim() || undefined,
        experience_years: experienceYears,
        skills: selectedSkills,
        metadata: {
          expected_salary: expectedSalary,
          bio: bio.trim() || undefined,
          hiring_type: "Contract / Full-time",
        },
        documents: uploadedDocs as any,
      });

      setRegisteredSuccess(true);
      toast.success("Profile & documents submitted for verification.");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit profile.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!authLoading && user?.role === "client") {
    return (
      <div className="min-h-screen bg-white pb-24 pt-16">
        <div className="mx-auto max-w-md px-4 text-center">
          <h1 className="font-heading text-2xl font-semibold text-zinc-900">Worker account required</h1>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            This registration is for a separate worker account. Log out of the client account before continuing.
          </p>
          <button
            type="button"
            onClick={() => void logout()}
            className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-medium text-white"
          >
            Log out and continue
          </button>
        </div>
      </div>
    );
  }

  // Unauthenticated Graceful Banner
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-white pb-24 pt-16">
        <div className="mx-auto max-w-md px-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-zinc-900">
            Account Required for Hiring
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            Please log in or create an account to register as an industrial worker, upload verification documents, and get hired.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/login?role=worker&redirect=/hiring/register"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-medium text-white shadow-xs transition hover:bg-blue-700"
            >
              <LogIn className="h-4 w-4" />
              Log In
            </Link>
            <Link
              href="/register?role=worker&redirect=/hiring/register"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-6 py-2.5 text-xs font-medium text-zinc-700 shadow-xs transition hover:bg-zinc-50"
            >
              <UserPlus className="h-4 w-4" />
              Create Account
            </Link>
          </div>

          <div className="mt-8 border-t border-zinc-100 pt-6">
            <Link
            href={user?.role === "worker" ? "/worker/dashboard" : "/hiring"}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition"
            >
              ← Return to Talent Directory
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
          href="/hiring"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Talent Directory
        </Link>

        {registeredSuccess ? (
          <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-10 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h1 className="mt-4 font-heading text-xl font-semibold text-zinc-900">
              Candidate Profile Submitted
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-zinc-500">
              Your profile and {uploadedDocs.length} verification document(s) have been sent to our recruitment team.
              Once verified, your profile will be featured for industrial factory hiring.
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/hiring"
                className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-medium text-white shadow-xs transition hover:bg-blue-700"
              >
                Browse Talent Directory
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-8">
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">
                Register as an Industrial Worker / Technician
              </h1>
              <p className="mt-1 text-xs text-zinc-500">
                Create your verified profile and upload documents to connect directly with manufacturing plants in Pune & MIDC belts.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4 shadow-xs">
                <div className="border-b border-zinc-100 pb-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                    1. Personal & Contact Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Shinde"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Primary Designation / Trade <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior CNC Operator / VMC Setter"
                      value={primaryRole}
                      onChange={(e) => setPrimaryRole(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Current Location / City
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chakan, Pune"
                      value={currentCity}
                      onChange={(e) => setCurrentCity(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Total Experience (Years)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(parseInt(e.target.value, 10) || 0)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Expected Monthly Salary (₹)
                    </label>
                    <input
                      type="number"
                      step="1000"
                      value={expectedSalary}
                      onChange={(e) => setExpectedSalary(parseInt(e.target.value, 10) || 0)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Skills & Bio */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4 shadow-xs">
                <div className="border-b border-zinc-100 pb-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                    2. Skills & Work Experience
                  </h2>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-2">
                    Select Your Relevant Skills
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_SKILLS.map((skill) => {
                      const isSelected = selectedSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                            isSelected
                              ? "bg-zinc-900 text-white shadow-xs"
                              : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                          }`}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Type custom skill and press Enter..."
                      value={customSkillInput}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                      onKeyDown={addCustomSkill}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Summary of Past Experience / Projects
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. 5 years operating DMG Mori and Haas CNC milling centers. Proficient in Fanuc controller and G-code editing..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Documents & Verification */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4 shadow-xs">
                <div className="border-b border-zinc-100 pb-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                    3. Document Verification (Aadhaar / Certificate)
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* Aadhaar Upload Box */}
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-800">Aadhaar Card / ID Proof</span>
                      {uploadedDocs.some((d) => d.doc_type === "aadhaar_card") && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Uploaded
                        </span>
                      )}
                    </div>

                    {uploadedDocs.some((d) => d.doc_type === "aadhaar_card") ? (
                      <div className="flex items-center justify-between bg-white rounded-lg border border-zinc-200 p-2 text-xs">
                        <div className="flex items-center gap-1.5 truncate">
                          <Paperclip className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">{uploadedDocs.find((d) => d.doc_type === "aadhaar_card")?.doc_name || "Aadhaar Card"}</span>
                        </div>
                        <button type="button" onClick={() => removeDoc("aadhaar_card")} className="text-zinc-400 hover:text-rose-600">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="block cursor-pointer rounded-lg border border-dashed border-zinc-300 bg-white p-3 text-center text-xs text-zinc-600 hover:bg-zinc-50">
                        {uploadingDocType === "aadhaar_card" ? (
                          <Loader2 className="mx-auto h-4 w-4 animate-spin text-blue-600 mb-1" />
                        ) : (
                          <Upload className="mx-auto h-4 w-4 text-zinc-400 mb-1" />
                        )}
                        Upload Aadhaar Card
                        <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, "aadhaar_card")} className="hidden" />
                      </label>
                    )}
                  </div>

                  {/* Skill Certificate Upload Box */}
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-800">ITI / Skill Certificate (Optional)</span>
                      {uploadedDocs.some((d) => d.doc_type === "skill_certificate") && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Uploaded
                        </span>
                      )}
                    </div>

                    {uploadedDocs.some((d) => d.doc_type === "skill_certificate") ? (
                      <div className="flex items-center justify-between bg-white rounded-lg border border-zinc-200 p-2 text-xs">
                        <div className="flex items-center gap-1.5 truncate">
                          <Paperclip className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">{uploadedDocs.find((d) => d.doc_type === "skill_certificate")?.doc_name || "Certificate"}</span>
                        </div>
                        <button type="button" onClick={() => removeDoc("skill_certificate")} className="text-zinc-400 hover:text-rose-600">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="block cursor-pointer rounded-lg border border-dashed border-zinc-300 bg-white p-3 text-center text-xs text-zinc-600 hover:bg-zinc-50">
                        {uploadingDocType === "skill_certificate" ? (
                          <Loader2 className="mx-auto h-4 w-4 animate-spin text-blue-600 mb-1" />
                        ) : (
                          <Upload className="mx-auto h-4 w-4 text-zinc-400 mb-1" />
                        )}
                        Upload Certificate
                        <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, "skill_certificate")} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Link
                  href="/hiring"
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
                      <Send className="h-3.5 w-3.5" /> Submit Profile for Verification
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
