// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { useParams, useRouter } from "next/navigation";
// import {
//   ArrowLeft,
//   MapPin,
//   FileText,
//   Loader2,
//   X,
// } from "lucide-react";
// import { toast } from "sonner";

// import {
//   fetchCandidateDetail,
//   createHireRequest,
//   type CandidateListItem,
// } from "@/lib/api/hiring";

// import { useAuthStore } from "@/store/authStore";

// type HireRequestForm = {
//   job_title: string;
//   start_date: string;
//   duration: string;
//   location: string;
//   shift: string;
//   note: string;
// };

// const initialRequestForm: HireRequestForm = {
//   job_title: "",
//   start_date: "",
//   duration: "",
//   location: "",
//   shift: "",
//   note: "",
// };

// export default function CandidateDetailPage() {
//   const params = useParams();
//   const router = useRouter();

//   const candidateId = String(params?.id || "");

//   const [candidate, setCandidate] =
//     useState<CandidateListItem | null>(null);

//   const [loading, setLoading] = useState(true);
//   const [requestSubmitting, setRequestSubmitting] =
//     useState(false);

//   const [showHireModal, setShowHireModal] =
//     useState(false);

//   const [requestForm, setRequestForm] =
//     useState<HireRequestForm>(
//       initialRequestForm
//     );

//   const { user, fetchUser } = useAuthStore();

//   useEffect(() => {
//     void fetchUser();

//     if (candidateId) {
//       void loadDetail();
//     }
//   }, [candidateId, fetchUser]);

//   async function loadDetail() {
//     try {
//       setLoading(true);

//       const data =
//         await fetchCandidateDetail(
//           candidateId
//         );

//       setCandidate(data);

//       if (data?.city) {
//         setRequestForm((current) => ({
//           ...current,
//           location:
//             current.location ||
//             data.city ||
//             "",
//         }));
//       }
//     } catch (err) {
//       console.error(
//         "Failed to load candidate:",
//         err
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   function updateRequestField(
//     field: keyof HireRequestForm,
//     value: string
//   ) {
//     setRequestForm((current) => ({
//       ...current,
//       [field]: value,
//     }));
//   }

//   function openHireModal() {
//     if (user?.role !== "client") {
//       toast.error(
//         "Only client accounts can send hiring requests."
//       );
//       return;
//     }

//     setShowHireModal(true);
//   }

//   function closeHireModal() {
//     if (requestSubmitting) return;

//     setShowHireModal(false);
//   }

//   async function handleHireRequest(
//     event: React.FormEvent
//   ) {
//     event.preventDefault();

//     if (!candidate) return;

//     if (user?.role !== "client") {
//       toast.error(
//         "Only client accounts can send hiring requests."
//       );
//       return;
//     }

//     if (!requestForm.job_title.trim()) {
//       toast.error(
//         "Please enter a job title or work type."
//       );
//       return;
//     }

//     if (!requestForm.note.trim()) {
//       toast.error(
//         "Please add a short requirement note."
//       );
//       return;
//     }

//     try {
//       setRequestSubmitting(true);

//       await createHireRequest(
//         candidate.id,
//         {
//           job_title:
//             requestForm.job_title.trim(),

//           start_date:
//             requestForm.start_date || null,

//           duration:
//             requestForm.duration.trim() ||
//             null,

//           location:
//             requestForm.location.trim() ||
//             null,

//           shift:
//             requestForm.shift || null,

//           note:
//             requestForm.note.trim(),
//         }
//       );

//       toast.success(
//         "Hiring request sent to the worker."
//       );

//       setShowHireModal(false);

//       router.push("/hiring/requests");
//     } catch (error) {
//       toast.error(
//         error instanceof Error
//           ? error.message
//           : "Failed to send hiring request."
//       );
//     } finally {
//       setRequestSubmitting(false);
//     }
//   }

//   if (loading) {
//     return (
//       <div className="flex h-96 flex-col items-center justify-center gap-2 text-zinc-400">
//         <Loader2 className="h-5 w-5 animate-spin text-blue-600" />

//         <p className="text-xs">
//           Loading profile...
//         </p>
//       </div>
//     );
//   }

//   if (!candidate) {
//     return (
//       <div className="mx-auto my-20 max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-xs">
//         <h2 className="text-sm font-semibold text-zinc-900">
//           Candidate Not Found
//         </h2>

//         <p className="mt-1 text-xs text-zinc-500">
//           This profile may have been
//           removed or updated.
//         </p>

//         <Link
//           href="/hiring"
//           className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white"
//         >
//           <ArrowLeft className="h-3.5 w-3.5" />
//           Back to Talent Directory
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="min-h-screen bg-white pb-24 pt-8">
//         <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
//           <Link
//             href="/hiring"
//             className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900"
//           >
//             <ArrowLeft className="h-3.5 w-3.5" />
//             Back to Talent Directory
//           </Link>

//           {/* Header */}
//           <div className="mt-4 flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <div className="flex items-center gap-3">
//                 <h1 className="font-heading text-2xl font-semibold text-zinc-900">
//                   {candidate.full_name}
//                 </h1>

//                 <span className="rounded-md bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
//                   Verified Candidate
//                 </span>
//               </div>

//               <p className="mt-1 text-sm font-medium text-zinc-600">
//                 {candidate.designation ||
//                   "Industrial Specialist"}
//               </p>

//               <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
//                 {candidate.city && (
//                   <span className="flex items-center gap-1">
//                     <MapPin className="h-3.5 w-3.5 text-zinc-400" />
//                     {candidate.city}
//                   </span>
//                 )}

//                 <span>•</span>

//                 <span>
//                   {candidate.experience_years ||
//                     0}{" "}
//                   years experience
//                 </span>

//                 {candidate.metadata
//                   ?.hiring_type && (
//                   <>
//                     <span>•</span>

//                     <span className="capitalize">
//                       {
//                         candidate.metadata
//                           .hiring_type
//                       }
//                     </span>
//                   </>
//                 )}
//               </div>
//             </div>

//             <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-left sm:text-right">
//               <span className="text-[10px] font-semibold uppercase text-zinc-400">
//                 Expected Wage
//               </span>

//               <p className="font-heading text-xl font-bold text-zinc-900">
//                 {candidate.metadata
//                   ?.expected_salary
//                   ? `₹${Number(
//                       candidate.metadata
//                         .expected_salary
//                     ).toLocaleString(
//                       "en-IN"
//                     )}/mo`
//                   : "Negotiable"}
//               </p>
//             </div>
//           </div>

//           {/* Content */}
//           <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
//             <div className="space-y-6 lg:col-span-2">
//               {/* Skills */}
//               <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-6 shadow-xs">
//                 <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
//                   Technical Skills &
//                   Competencies
//                 </h2>

//                 <div className="flex flex-wrap gap-2 pt-1">
//                   {candidate.skills?.map(
//                     (skill, index) => (
//                       <span
//                         key={index}
//                         className="rounded-md border border-zinc-100 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-800"
//                       >
//                         {skill}
//                       </span>
//                     )
//                   )}
//                 </div>
//               </div>

//               {/* Bio */}
//               {candidate.metadata?.bio && (
//                 <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-6 shadow-xs">
//                   <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
//                     Professional Background
//                   </h2>

//                   <p className="whitespace-pre-line text-xs leading-relaxed text-zinc-600">
//                     {
//                       candidate.metadata
//                         .bio
//                     }
//                   </p>
//                 </div>
//               )}

//               {/* Documents */}
//               {candidate.documents &&
//                 candidate.documents
//                   .length > 0 && (
//                   <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-6 shadow-xs">
//                     <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
//                       Compliance & Verified
//                       Documents
//                     </h2>

//                     <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
//                       {candidate.documents.map(
//                         (document) => (
//                           <div
//                             key={
//                               document.id
//                             }
//                             className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/60 p-3"
//                           >
//                             <div className="flex min-w-0 items-center gap-2">
//                               <FileText className="h-4 w-4 shrink-0 text-zinc-500" />

//                               <span className="truncate text-xs font-medium capitalize text-zinc-800">
//                                 {document.doc_name ||
//                                   document.doc_type.replace(
//                                     /_/g,
//                                     " "
//                                   )}
//                               </span>
//                             </div>

//                             <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
//                               Verified
//                             </span>
//                           </div>
//                         )
//                       )}
//                     </div>
//                   </div>
//                 )}
//             </div>

//             {/* Right side */}
//             <div>
//               <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 shadow-xs">
//                 <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
//                   Contact Details Protected
//                 </h2>

//                 <p className="mt-3 text-xs leading-relaxed text-zinc-600">
//                   Worker contact details
//                   remain protected. Send a
//                   hiring request with your
//                   job requirements to begin
//                   the process.
//                 </p>

//                 {user?.role ===
//                   "client" && (
//                   <button
//                     type="button"
//                     onClick={
//                       openHireModal
//                     }
//                     className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-blue-700"
//                   >
//                     Send hiring request
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Hire request modal */}
//       {showHireModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
//           <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl">
//             <div className="flex items-start justify-between border-b border-zinc-100 px-6 py-5">
//               <div>
//                 <h2 className="font-heading text-lg font-semibold text-zinc-900">
//                   Send hiring request
//                 </h2>

//                 <p className="mt-1 text-xs text-zinc-500">
//                   Share the basic work
//                   requirement with{" "}
//                   {candidate.full_name}.
//                 </p>
//               </div>

//               <button
//                 type="button"
//                 onClick={closeHireModal}
//                 disabled={
//                   requestSubmitting
//                 }
//                 className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50"
//                 aria-label="Close"
//               >
//                 <X className="h-4 w-4" />
//               </button>
//             </div>

//             <form
//               onSubmit={
//                 handleHireRequest
//               }
//               className="space-y-5 p-6"
//             >
//               <div>
//                 <label className="text-xs font-medium text-zinc-700">
//                   Job title / work type
//                   <span className="text-red-500">
//                     {" "}
//                     *
//                   </span>
//                 </label>

//                 <input
//                   value={
//                     requestForm.job_title
//                   }
//                   onChange={(event) =>
//                     updateRequestField(
//                       "job_title",
//                       event.target.value
//                     )
//                   }
//                   placeholder="Example: CNC machine operator"
//                   className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
//                 />
//               </div>

//               <div className="grid gap-4 sm:grid-cols-2">
//                 <div>
//                   <label className="text-xs font-medium text-zinc-700">
//                     Preferred start date
//                   </label>

//                   <input
//                     type="date"
//                     value={
//                       requestForm.start_date
//                     }
//                     onChange={(event) =>
//                       updateRequestField(
//                         "start_date",
//                         event.target
//                           .value
//                       )
//                     }
//                     className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
//                   />
//                 </div>

//                 <div>
//                   <label className="text-xs font-medium text-zinc-700">
//                     Expected duration
//                   </label>

//                   <input
//                     value={
//                       requestForm.duration
//                     }
//                     onChange={(event) =>
//                       updateRequestField(
//                         "duration",
//                         event.target
//                           .value
//                       )
//                     }
//                     placeholder="Example: 3 months"
//                     className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
//                   />
//                 </div>
//               </div>

//               <div className="grid gap-4 sm:grid-cols-2">
//                 <div>
//                   <label className="text-xs font-medium text-zinc-700">
//                     Work location
//                   </label>

//                   <input
//                     value={
//                       requestForm.location
//                     }
//                     onChange={(event) =>
//                       updateRequestField(
//                         "location",
//                         event.target
//                           .value
//                       )
//                     }
//                     placeholder="City / plant location"
//                     className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
//                   />
//                 </div>

//                 <div>
//                   <label className="text-xs font-medium text-zinc-700">
//                     Shift / timing
//                   </label>

//                   <select
//                     value={
//                       requestForm.shift
//                     }
//                     onChange={(event) =>
//                       updateRequestField(
//                         "shift",
//                         event.target
//                           .value
//                       )
//                     }
//                     className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600"
//                   >
//                     <option value="">
//                       Not specified
//                     </option>
//                     <option value="day">
//                       Day shift
//                     </option>
//                     <option value="night">
//                       Night shift
//                     </option>
//                     <option value="rotational">
//                       Rotational shift
//                     </option>
//                     <option value="flexible">
//                       Flexible
//                     </option>
//                   </select>
//                 </div>
//               </div>

//               <div>
//                 <label className="text-xs font-medium text-zinc-700">
//                   Requirement note
//                   <span className="text-red-500">
//                     {" "}
//                     *
//                   </span>
//                 </label>

//                 <textarea
//                   value={
//                     requestForm.note
//                   }
//                   onChange={(event) =>
//                     updateRequestField(
//                       "note",
//                       event.target.value
//                     )
//                   }
//                   rows={5}
//                   maxLength={2000}
//                   placeholder="Briefly describe the work, machine, responsibilities, experience requirement, or any important conditions..."
//                   className="mt-1.5 w-full resize-none rounded-lg border border-zinc-200 px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-blue-600"
//                 />

//                 <p className="mt-1 text-right text-[10px] text-zinc-400">
//                   {
//                     requestForm.note
//                       .length
//                   }
//                   /2000
//                 </p>
//               </div>

//               <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 pt-4 sm:flex-row sm:justify-end">
//                 <button
//                   type="button"
//                   onClick={
//                     closeHireModal
//                   }
//                   disabled={
//                     requestSubmitting
//                   }
//                   className="rounded-lg border border-zinc-200 px-4 py-2.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   type="submit"
//                   disabled={
//                     requestSubmitting
//                   }
//                   className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
//                 >
//                   {requestSubmitting && (
//                     <Loader2 className="h-3.5 w-3.5 animate-spin" />
//                   )}

//                   {requestSubmitting
//                     ? "Sending request..."
//                     : "Send request"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

"use client";

import {
  useEffect,
  useState,
} from "react";
import Link from "next/link";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  FileText,
  Loader2,
  LockKeyhole,
  MapPin,
  X,
} from "lucide-react";

import { toast } from "sonner";

import {
  createHireRequest,
  fetchCandidateDetail,
  fetchHiringAccessStatus,
  type CandidateListItem,
} from "@/lib/api/hiring";

import HiringAccessModal from "@/components/hiring/HiringAccessModal";
import { useAuthStore } from "@/store/authStore";

type HireRequestForm = {
  job_title: string;
  start_date: string;
  duration: string;
  location: string;
  shift: string;
  note: string;
};

const initialRequestForm: HireRequestForm =
  {
    job_title: "",
    start_date: "",
    duration: "",
    location: "",
    shift: "",
    note: "",
  };

type AccessState =
  | "checking"
  | "locked"
  | "unlocked";

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();

  const candidateId =
    String(params?.id || "");

  const [
    candidate,
    setCandidate,
  ] =
    useState<CandidateListItem | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    accessState,
    setAccessState,
  ] =
    useState<AccessState>(
      "checking"
    );

  const [
    showAccessModal,
    setShowAccessModal,
  ] = useState(false);

  const [
    requestSubmitting,
    setRequestSubmitting,
  ] = useState(false);

  const [
    showHireModal,
    setShowHireModal,
  ] = useState(false);

  const [
    requestForm,
    setRequestForm,
  ] =
    useState<HireRequestForm>(
      initialRequestForm
    );

  const {
    user,
    fetchUser,
    isLoading: authLoading,
  } = useAuthStore();

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  /*
   * Check account + one-time access
   * before loading protected worker
   * details.
   */
  useEffect(() => {
    if (
      authLoading ||
      !candidateId
    ) {
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    if (
      user.role === "worker"
    ) {
      router.replace(
        "/worker/dashboard"
      );

      return;
    }

    if (
      user.role !== "client"
    ) {
      setLoading(false);
      return;
    }

    void initializeCandidate();
  }, [
    authLoading,
    user?.userId,
    user?.role,
    candidateId,
  ]);

  async function initializeCandidate() {
    try {
      setLoading(true);
      setAccessState(
        "checking"
      );

      const access =
        await fetchHiringAccessStatus();

      if (!access.hasAccess) {
        setAccessState(
          "locked"
        );

        setShowAccessModal(
          true
        );

        return;
      }

      setAccessState(
        "unlocked"
      );

      await loadDetail();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load worker profile."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadDetail() {
    const data =
      await fetchCandidateDetail(
        candidateId
      );

    setCandidate(data);

    if (data?.city) {
      setRequestForm(
        (current) => ({
          ...current,

          location:
            current.location ||
            data.city ||
            "",
        })
      );
    }
  }

  async function handleAccessUnlocked() {
    setShowAccessModal(
      false
    );

    setAccessState(
      "unlocked"
    );

    try {
      setLoading(true);

      await loadDetail();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load worker profile."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateRequestField(
    field: keyof HireRequestForm,
    value: string
  ) {
    setRequestForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  }

  function openHireModal() {
    if (
      user?.role !== "client"
    ) {
      toast.error(
        "Only client accounts can send hiring requests."
      );

      return;
    }

    if (
      accessState !==
      "unlocked"
    ) {
      setShowAccessModal(
        true
      );

      return;
    }

    setShowHireModal(true);
  }

  function closeHireModal() {
    if (
      requestSubmitting
    ) {
      return;
    }

    setShowHireModal(
      false
    );
  }

  async function handleHireRequest(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!candidate) return;

    if (
      user?.role !== "client"
    ) {
      toast.error(
        "Only client accounts can send hiring requests."
      );

      return;
    }

    if (
      accessState !==
      "unlocked"
    ) {
      setShowHireModal(
        false
      );

      setShowAccessModal(
        true
      );

      return;
    }

    if (
      !requestForm.job_title.trim()
    ) {
      toast.error(
        "Please enter a job title or work type."
      );

      return;
    }

    if (
      !requestForm.note.trim()
    ) {
      toast.error(
        "Please add a short requirement note."
      );

      return;
    }

    try {
      setRequestSubmitting(
        true
      );

      await createHireRequest(
        candidate.id,
        {
          job_title:
            requestForm.job_title.trim(),

          start_date:
            requestForm.start_date ||
            null,

          duration:
            requestForm.duration.trim() ||
            null,

          location:
            requestForm.location.trim() ||
            null,

          shift:
            requestForm.shift ||
            null,

          note:
            requestForm.note.trim(),
        }
      );

      toast.success(
        "Hiring request sent to the worker."
      );

      setShowHireModal(
        false
      );

      router.push(
        "/hiring/requests"
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send hiring request."
      );
    } finally {
      setRequestSubmitting(
        false
      );
    }
  }

  /*
   * Authentication is still being
   * resolved.
   */
  if (
    authLoading ||
    (loading &&
      accessState ===
        "checking")
  ) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-2 text-zinc-400">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />

        <p className="text-xs">
          Checking Hiring Access...
        </p>
      </div>
    );
  }

  /*
   * Direct URL while logged out.
   */
  if (!user) {
    const redirect =
      `/hiring/${candidateId}`;

    return (
      <div className="mx-auto my-20 max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-xs">
        <LockKeyhole className="mx-auto h-8 w-8 text-zinc-400" />

        <h2 className="mt-4 font-heading text-xl font-semibold text-zinc-900">
          Sign in to continue
        </h2>

        <p className="mt-2 text-xs leading-relaxed text-zinc-500">
          Worker details are
          available to client
          accounts with Hiring
          Access.
        </p>

        <Link
          href={`/login?role=client&redirect=${encodeURIComponent(
            redirect
          )}`}
          className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-medium text-white"
        >
          Client sign in
        </Link>

        <Link
          href="/hiring"
          className="mt-3 block text-xs font-medium text-zinc-500"
        >
          Back to Talent
          Directory
        </Link>
      </div>
    );
  }

  if (
    user.role !== "client"
  ) {
    return (
      <div className="mx-auto my-20 max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-xs">
        <h2 className="text-lg font-semibold text-zinc-900">
          Client account
          required
        </h2>

        <p className="mt-2 text-xs text-zinc-500">
          Worker hiring profiles
          can only be accessed by
          client accounts.
        </p>

        <Link
          href="/hiring"
          className="mt-5 inline-flex rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-700"
        >
          Back to Talent
          Directory
        </Link>
      </div>
    );
  }

  /*
   * User has not purchased
   * the one-time access yet.
   */
  if (
    accessState === "locked"
  ) {
    return (
      <>
        <div className="mx-auto my-20 max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
            <LockKeyhole className="h-5 w-5 text-blue-600" />
          </div>

          <h1 className="mt-4 font-heading text-xl font-semibold text-zinc-900">
            Worker profile locked
          </h1>

          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            Unlock complete worker
            profiles and hiring
            requests with a one-time
            ₹100 Hiring Access payment.
          </p>

          <button
            type="button"
            onClick={() =>
              setShowAccessModal(
                true
              )
            }
            className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            Unlock Hiring Access ·
            ₹100
          </button>

          <Link
            href="/hiring"
            className="mt-3 block text-xs font-medium text-zinc-500"
          >
            Back to Talent
            Directory
          </Link>
        </div>

        <HiringAccessModal
          open={
            showAccessModal
          }
          onClose={() =>
            setShowAccessModal(
              false
            )
          }
          onUnlocked={
            handleAccessUnlocked
          }
        />
      </>
    );
  }

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-2 text-zinc-400">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />

        <p className="text-xs">
          Loading profile...
        </p>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="mx-auto my-20 max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-xs">
        <h2 className="text-sm font-semibold text-zinc-900">
          Candidate Not Found
        </h2>

        <p className="mt-1 text-xs text-zinc-500">
          This profile may have
          been removed, become
          unavailable or been
          updated.
        </p>

        <Link
          href="/hiring"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />

          Back to Talent
          Directory
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white pb-24 pt-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/hiring"
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />

            Back to Talent
            Directory
          </Link>

          {/* Header */}
          <div className="mt-4 flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-heading text-2xl font-semibold text-zinc-900">
                  {
                    candidate.full_name
                  }
                </h1>

                <span className="rounded-md bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
                  Verified Candidate
                </span>

                <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700">
                  Hiring Access
                  Unlocked
                </span>
              </div>

              <p className="mt-1 text-sm font-medium text-zinc-600">
                {candidate.designation ||
                  "Industrial Specialist"}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                {candidate.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400" />

                    {
                      candidate.city
                    }
                  </span>
                )}

                <span>
                  {
                    candidate.experience_years ||
                    0
                  }{" "}
                  years experience
                </span>

                {candidate.metadata
                  ?.hiring_type && (
                  <span className="capitalize">
                    {
                      candidate.metadata
                        .hiring_type
                    }
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-left sm:text-right">
              <span className="text-[10px] font-semibold uppercase text-zinc-400">
                Expected Wage
              </span>

              <p className="font-heading text-xl font-bold text-zinc-900">
                {candidate.metadata
                  ?.expected_salary
                  ? `₹${Number(
                      candidate.metadata
                        .expected_salary
                    ).toLocaleString(
                      "en-IN"
                    )}/mo`
                  : "Negotiable"}
              </p>
            </div>
          </div>

          {/* Profile */}
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {/* Skills */}
              <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-6 shadow-xs">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                  Technical Skills &
                  Competencies
                </h2>

                <div className="flex flex-wrap gap-2 pt-1">
                  {candidate.skills
                    ?.map(
                      (
                        skill,
                        index
                      ) => (
                        <span
                          key={
                            index
                          }
                          className="rounded-md border border-zinc-100 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-800"
                        >
                          {
                            skill
                          }
                        </span>
                      )
                    )}
                </div>
              </div>

              {/* Bio */}
              {candidate.metadata
                ?.bio && (
                <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-6 shadow-xs">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                    Professional
                    Background
                  </h2>

                  <p className="whitespace-pre-line text-xs leading-relaxed text-zinc-600">
                    {
                      candidate.metadata
                        .bio
                    }
                  </p>
                </div>
              )}

              {/* Documents */}
              {candidate.documents &&
                candidate.documents
                  .length > 0 && (
                  <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-6 shadow-xs">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                      Compliance &
                      Verified Documents
                    </h2>

                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {candidate.documents.map(
                        (
                          document
                        ) => (
                          <div
                            key={
                              document.id
                            }
                            className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/60 p-3"
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              <FileText className="h-4 w-4 shrink-0 text-zinc-500" />

                              <span className="truncate text-xs font-medium capitalize text-zinc-800">
                                {document.doc_name ||
                                  document.doc_type.replace(
                                    /_/g,
                                    " "
                                  )}
                              </span>
                            </div>

                            <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                              Verified
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* Hiring CTA */}
            <div>
              <div className="sticky top-24 rounded-xl border border-zinc-200 bg-zinc-50 p-6 shadow-xs">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                  Hire this worker
                </h2>

                <p className="mt-3 text-xs leading-relaxed text-zinc-600">
                  Contact details remain
                  protected. Send your work
                  requirement to start the
                  hiring process.
                </p>

                <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                  <p className="text-[11px] font-medium text-emerald-700">
                    ✓ Your Hiring Access is
                    unlocked. No additional
                    access fee is required.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    openHireModal
                  }
                  className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-blue-700"
                >
                  Send hiring request
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hiring request modal */}
      {showHireModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-xl">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-zinc-100 bg-white px-6 py-5">
              <div>
                <h2 className="font-heading text-lg font-semibold text-zinc-900">
                  Send hiring request
                </h2>

                <p className="mt-1 text-xs text-zinc-500">
                  Share the basic
                  work requirement
                  with{" "}
                  {
                    candidate.full_name
                  }
                  .
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeHireModal
                }
                disabled={
                  requestSubmitting
                }
                className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={
                handleHireRequest
              }
              className="space-y-5 p-6"
            >
              <div>
                <label className="text-xs font-medium text-zinc-700">
                  Job title / work type
                  <span className="text-red-500">
                    {" "}
                    *
                  </span>
                </label>

                <input
                  value={
                    requestForm.job_title
                  }
                  onChange={(event) =>
                    updateRequestField(
                      "job_title",
                      event.target.value
                    )
                  }
                  placeholder="Example: CNC machine operator"
                  className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-zinc-700">
                    Preferred start
                    date
                  </label>

                  <input
                    type="date"
                    value={
                      requestForm.start_date
                    }
                    onChange={(event) =>
                      updateRequestField(
                        "start_date",
                        event.target.value
                      )
                    }
                    className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-700">
                    Expected duration
                  </label>

                  <input
                    value={
                      requestForm.duration
                    }
                    onChange={(event) =>
                      updateRequestField(
                        "duration",
                        event.target.value
                      )
                    }
                    placeholder="Example: 3 months"
                    className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-zinc-700">
                    Work location
                  </label>

                  <input
                    value={
                      requestForm.location
                    }
                    onChange={(event) =>
                      updateRequestField(
                        "location",
                        event.target.value
                      )
                    }
                    placeholder="City / plant location"
                    className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-700">
                    Shift / timing
                  </label>

                  <select
                    value={
                      requestForm.shift
                    }
                    onChange={(event) =>
                      updateRequestField(
                        "shift",
                        event.target.value
                      )
                    }
                    className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600"
                  >
                    <option value="">
                      Not specified
                    </option>

                    <option value="day">
                      Day shift
                    </option>

                    <option value="night">
                      Night shift
                    </option>

                    <option value="rotational">
                      Rotational shift
                    </option>

                    <option value="flexible">
                      Flexible
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700">
                  Requirement note
                  <span className="text-red-500">
                    {" "}
                    *
                  </span>
                </label>

                <textarea
                  value={
                    requestForm.note
                  }
                  onChange={(event) =>
                    updateRequestField(
                      "note",
                      event.target.value
                    )
                  }
                  rows={5}
                  maxLength={2000}
                  placeholder="Briefly describe the work, machine, responsibilities, experience requirement, or important conditions..."
                  className="mt-1.5 w-full resize-none rounded-lg border border-zinc-200 px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-blue-600"
                />

                <p className="mt-1 text-right text-[10px] text-zinc-400">
                  {
                    requestForm.note.length
                  }
                  /2000
                </p>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={
                    closeHireModal
                  }
                  disabled={
                    requestSubmitting
                  }
                  className="rounded-lg border border-zinc-200 px-4 py-2.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    requestSubmitting
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {requestSubmitting && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}

                  {requestSubmitting
                    ? "Sending request..."
                    : "Send request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <HiringAccessModal
        open={
          showAccessModal
        }
        onClose={() =>
          setShowAccessModal(
            false
          )
        }
        onUnlocked={
          handleAccessUnlocked
        }
      />
    </>
  );
}