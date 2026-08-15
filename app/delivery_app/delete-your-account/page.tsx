"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Mail, Phone, Trash2, ShieldAlert, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function DeliveryAppDeleteAccountPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.mtwo.in";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !phone) {
      toast.error("Email and phone number are required.");
      return;
    }
    if (!confirm) {
      toast.error("Please check the confirmation box before submitting.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/request-deletion-public`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-request-from": "delivery",
        },
        body: JSON.stringify({ email, phone, reason }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
        toast.success("Account deletion request submitted successfully!");
      } else {
        toast.error(data.message || "Failed to submit request. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-12 md:py-20 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-10">
          
          {submitted ? (
            <div className="flex flex-col items-center text-center py-8 animate-in fade-in">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-6">
                <CheckCircle2 size={36} strokeWidth={1.5} />
              </div>
              <h1 className="font-heading text-2xl font-bold text-zinc-900 sm:text-3xl">
                Deletion Request Submitted
              </h1>
              <div className="mt-4 text-zinc-600 leading-relaxed text-sm sm:text-base space-y-3 max-w-md">
                <p>
                  Your request to delete the MTWO Partner / Delivery account for <strong className="text-zinc-900">{email}</strong> has been received.
                </p>
                <div className="bg-blue-50 border border-blue-200/80 rounded-xl p-4 text-left text-xs sm:text-sm text-blue-900 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <Mail size={16} className="text-blue-600" />
                    Confirmation Email Sent
                  </div>
                  <p className="text-blue-800">
                    A confirmation email has been dispatched to your email address. Please open the email and confirm the request to finalize the deletion process.
                  </p>
                </div>
                <p className="text-xs text-zinc-500">
                  Please note: Once your request is verified and processed, your account will be permanently deleted and all KYC/trip records erased.
                </p>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link
                  href="/delivery_app/privacy_policy"
                  className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  View Privacy Policy
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-zinc-100 pb-5 mb-6">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <Trash2 size={22} />
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded">
                    MTWO Partner / Delivery App
                  </span>
                  <h1 className="font-heading text-xl font-bold text-zinc-900 sm:text-2xl mt-1">
                    Delete Your Account
                  </h1>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Submit a request to permanently delete your delivery &amp; fulfillment partner account
                  </p>
                </div>
              </div>

              {/* Warning box */}
              <div className="rounded-xl bg-amber-50/80 border border-amber-200/80 p-4 mb-6 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                  <span>Important Notice — Please Take Your Decision Wisely</span>
                </div>
                <div className="text-xs sm:text-sm text-amber-800 space-y-1.5 leading-relaxed">
                  <p>
                    Your account will be <strong>permanently deleted</strong> after your request is processed. Once deleted, your profile, active shift history, earnings statements, and registered KYC documents cannot be recovered.
                  </p>
                  <p className="font-medium text-amber-950">
                    ✉️ A confirmation email will be sent to your registered email address to verify this action before permanent deletion is completed.
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                    Registered Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400">
                      <Mail size={16} />
                    </span>
                    <input
                      required
                      type="email"
                      placeholder="e.g. partner@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                    Registered Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400">
                      <Phone size={16} />
                    </span>
                    <input
                      required
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                    Reason for Account Deletion <span className="text-zinc-400 font-normal lowercase">(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Let us know your feedback or why you want to delete your partner account..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all resize-none"
                  />
                </div>

                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3.5">
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        id="confirm"
                        name="confirm"
                        type="checkbox"
                        checked={confirm}
                        onChange={(e) => setConfirm(e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-red-500 cursor-pointer"
                      />
                    </div>
                    <div className="ml-3 text-xs sm:text-sm text-zinc-700">
                      <label htmlFor="confirm" className="font-medium cursor-pointer select-none">
                        I understand that my MTWO Partner account will be <strong>permanently deleted</strong>, and I agree to confirm the deletion via the verification email sent to my registered address.
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting request...
                      </>
                    ) : (
                      "Submit Account Deletion Request"
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 border-t border-zinc-100 pt-4 text-center">
                <Link
                  href="/delivery_app/privacy_policy"
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 transition-colors"
                >
                  <ShieldAlert size={14} />
                  Read MTWO Partner Privacy Policy
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
