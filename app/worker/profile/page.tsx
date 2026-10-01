"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Pencil, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { fetchWorkerProfile, updateWorkerProfile, type WorkerProfile } from "@/lib/api/worker";

export default function WorkerProfilePage() {
  const { user, isLoading: authLoading, fetchUser } = useAuthStore();
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => { void fetchUser("worker"); }, [fetchUser]);
  useEffect(() => { setEditing(new URLSearchParams(window.location.search).get("edit") === "1"); }, []);
  useEffect(() => {
    if (user?.role !== "worker") return;
    fetchWorkerProfile().then(setProfile).finally(() => setLoading(false));
  }, [user?.role]);

  function updateField(field: keyof WorkerProfile, value: string | number) {
    setProfile((current) => current ? { ...current, [field]: value } : current);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!profile) return;
    try {
      setSaving(true);
      const updated = await updateWorkerProfile({
        full_name: profile.full_name,
        email: profile.email || "",
        phone: profile.phone,
        city: profile.city || "",
        state: profile.state || "",
        pincode: profile.pincode || "",
        address_line: profile.address_line || "",
        designation: profile.designation || "",
        experience_years: Number(profile.experience_years || 0),
        skills: profile.skills || [],
        metadata: profile.metadata || {},
        photo_url: profile.photo_url || "",
      });
      setProfile(updated);
      toast.success("Worker profile updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-blue-600" /></div>;
  if (!profile) return <div className="mx-auto max-w-md px-4 py-20 text-center"><h1 className="font-heading text-xl font-semibold text-zinc-900">Worker profile not found</h1><Link href="/hiring/register" className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white">Create profile</Link></div>;

  if (!editing) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/worker/dashboard" className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-900"><ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard</Link>
        <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs text-zinc-500">Worker profile</p><h1 className="mt-1 font-heading text-2xl font-semibold text-zinc-900">{profile.full_name}</h1><p className="mt-1 text-sm text-zinc-600">{profile.designation || "Industrial worker"}</p></div><button type="button" onClick={() => setEditing(true)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-medium text-white"><Pencil className="h-3.5 w-3.5" /> Edit profile</button></div>
        <section className="mt-6 grid gap-5 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs sm:grid-cols-2"><div><p className="text-[10px] font-semibold uppercase text-zinc-400">Contact</p><p className="mt-1 text-sm text-zinc-800">{profile.phone}</p><p className="text-sm text-zinc-600">{profile.email || "No email added"}</p></div><div><p className="text-[10px] font-semibold uppercase text-zinc-400">Location</p><p className="mt-1 text-sm text-zinc-800">{[profile.city, profile.state].filter(Boolean).join(", ") || "Not added"}</p><p className="text-sm text-zinc-600">{profile.pincode || ""}</p></div><div><p className="text-[10px] font-semibold uppercase text-zinc-400">Experience</p><p className="mt-1 text-sm text-zinc-800">{profile.experience_years || 0} years</p></div><div><p className="text-[10px] font-semibold uppercase text-zinc-400">Verification</p><p className="mt-1 text-sm capitalize text-emerald-700">{profile.verification_status}</p></div><div className="sm:col-span-2"><p className="text-[10px] font-semibold uppercase text-zinc-400">Skills</p><div className="mt-2 flex flex-wrap gap-2">{(profile.skills || []).map((skill) => <span key={skill} className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700">{skill}</span>)}</div></div>{profile.metadata?.bio && <div className="sm:col-span-2"><p className="text-[10px] font-semibold uppercase text-zinc-400">Professional summary</p><p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-600">{profile.metadata.bio}</p></div>}</section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/worker/dashboard" className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-900"><ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard</Link>
      <div className="mt-6"><h1 className="font-heading text-2xl font-semibold text-zinc-900">Edit worker profile</h1><p className="mt-1 text-xs text-zinc-500">Keep your skills, experience, and contact details current for clients.</p></div>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <section className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs sm:grid-cols-2">
          {([
            ["full_name", "Full name"], ["designation", "Designation / trade"], ["phone", "Phone"], ["email", "Email"], ["city", "City"], ["state", "State"], ["pincode", "Pincode"], ["experience_years", "Experience (years)"],
          ] as const).map(([field, label]) => <label key={field} className="text-xs font-medium text-zinc-700">{label}<input type={field === "experience_years" ? "number" : field === "email" ? "email" : "text"} value={String(profile[field] ?? "")} onChange={(event) => updateField(field, field === "experience_years" ? Number(event.target.value) : event.target.value)} className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm font-normal text-zinc-900 outline-none focus:border-blue-600" /></label>)}
          <label className="text-xs font-medium text-zinc-700 sm:col-span-2">Address<input value={profile.address_line || ""} onChange={(event) => updateField("address_line", event.target.value)} className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm font-normal text-zinc-900 outline-none focus:border-blue-600" /></label>
        </section>
        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs"><label className="text-xs font-medium text-zinc-700">Skills<span className="mt-1 block text-[11px] font-normal text-zinc-400">Separate skills with commas</span><input value={(profile.skills || []).join(", ")} onChange={(event) => setProfile((current) => current ? { ...current, skills: event.target.value.split(",").map((skill) => skill.trim()).filter(Boolean) } : current)} className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm font-normal text-zinc-900 outline-none focus:border-blue-600" /></label><label className="mt-4 block text-xs font-medium text-zinc-700">Professional summary<textarea value={profile.metadata?.bio || ""} onChange={(event) => setProfile((current) => current ? { ...current, metadata: { ...(current.metadata || {}), bio: event.target.value } } : current)} rows={5} className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm font-normal text-zinc-900 outline-none focus:border-blue-600" /></label></section>
        <div className="flex justify-end"><button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-medium text-white disabled:opacity-50">{saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save changes</button></div>
      </form>
    </main>
  );
}
