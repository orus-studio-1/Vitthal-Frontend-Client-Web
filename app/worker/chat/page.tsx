"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { fetchWorkerHireRequests, type WorkerHireRequest } from "@/lib/api/worker";

export default function WorkerChatPage() {
  const { user, isLoading: authLoading, fetchUser } = useAuthStore();
  const [requests, setRequests] = useState<WorkerHireRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { void fetchUser("worker"); }, [fetchUser]);
  useEffect(() => {
    if (user?.role !== "worker") return;
    fetchWorkerHireRequests()
      .then((items) => setRequests(items.filter((item) => item.status === "accepted")))
      .catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load conversations."))
      .finally(() => setLoading(false));
  }, [user?.role]);

  if (authLoading || loading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-blue-600" /></div>;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3"><MessageSquare className="h-5 w-5 text-blue-600" /><div><h2 className="font-heading text-2xl font-semibold text-zinc-900">Messages</h2><p className="mt-1 text-xs text-zinc-500">All active conversations with clients.</p></div></div>
      <section className="mt-6 divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white px-5 shadow-xs">
        {requests.length === 0 ? <div className="p-10 text-center"><MessageSquare className="mx-auto h-8 w-8 text-zinc-300" /><h3 className="mt-3 text-sm font-semibold text-zinc-900">No conversations yet</h3><p className="mt-1 text-xs text-zinc-500">A conversation appears here after you accept a hiring request.</p></div> : requests.map((request) => (
          <div key={request.id} className="flex items-center justify-between gap-4 py-5">
            <div><p className="text-sm font-medium text-zinc-900">{request.hirer_name || "Client"}</p><p className="mt-1 text-xs text-zinc-500">{request.hirer_email || "Client contact"}</p></div>
            <Link href={`/worker/chat/${request.id}`} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white"><MessageSquare className="h-3.5 w-3.5" /> Open chat</Link>
          </div>
        ))}
      </section>
    </main>
  );
}
