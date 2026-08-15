"use client";

import { Shield, MapPin, Camera, Lock, UserCheck, Trash2, Mail, Phone, Clock, AlertCircle, FileCheck, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function DeliveryAppPrivacyPolicyPage() {
  const lastUpdated = "August 15, 2026";

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-4xl mx-auto bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Banner Header */}
        <div className="bg-[#1d4ed8] text-white px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600/40 border border-blue-400/30 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-blue-100">
            <Shield size={13} />
            Mtwo Sales and Eservices India Pvt Ltd
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Privacy Policy & Permissions
          </h1>
          <p className="mt-2 text-blue-100 font-light max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Privacy Policy and Mandatory Permission Disclosures for the <strong>MTWO Partner (Delivery &amp; Fulfillment)</strong> Mobile Application (Package: <code className="bg-blue-900/40 px-1.5 py-0.5 rounded text-xs">com.orus_studio.MTWO_Delivery_app</code>).
          </p>
          <div className="mt-4 text-xs text-blue-200">
            Effective &amp; Last Updated: {lastUpdated}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-12 space-y-10">

          {/* Section 1: Introduction */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
              <div className="p-2 rounded-lg bg-blue-50 text-[#1d4ed8]">
                <Shield size={20} />
              </div>
              <h2 className="text-xl font-bold text-zinc-950">1. Introduction &amp; Scope</h2>
            </div>
            <p className="text-zinc-600 leading-relaxed text-sm sm:text-base">
              This Privacy Policy applies to the <strong>MTWO Partner</strong> mobile application (also referred to as &ldquo;MTWO Delivery App&rdquo;, &ldquo;the App&rdquo;), operated by <strong>Mtwo Sales and Eservices India Pvt Ltd</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). This policy outlines how we collect, use, process, and protect information obtained from delivery executives, fleet partners, and fulfillment center staff.
            </p>
          </section>

          {/* Section 2: Prominent Geolocation Disclosure */}
          <section className="space-y-4 bg-blue-50/60 border border-blue-200/70 p-6 rounded-2xl">
            <div className="flex items-center gap-3 border-b border-blue-200/60 pb-3">
              <div className="p-2 rounded-lg bg-blue-100 text-[#1d4ed8]">
                <MapPin size={20} />
              </div>
              <h2 className="text-xl font-bold text-zinc-950">2. Prominent Disclosure: Location Data Access</h2>
            </div>
            <p className="text-zinc-700 text-sm sm:text-base leading-relaxed">
              The MTWO Partner app requires access to your device&apos;s location data to enable core logistics, dispatch, and order tracking services:
            </p>
            <div className="space-y-3 text-sm text-zinc-700">
              <div className="rounded-xl bg-white p-4 border border-blue-100 shadow-2xs space-y-1.5">
                <div className="font-semibold text-zinc-900 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                  Foreground Location (While Using the App)
                </div>
                <p className="text-zinc-600 text-xs sm:text-sm pl-6">
                  Used to identify your current position relative to nearby fulfillment centers, calculate turn-by-turn navigation to pickup and customer delivery points, and verify on-site arrival.
                </p>
              </div>

              <div className="rounded-xl bg-white p-4 border border-blue-100 shadow-2xs space-y-1.5">
                <div className="font-semibold text-zinc-900 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                  Background Location (Even When the App is Closed or Minimized)
                </div>
                <p className="text-zinc-600 text-xs sm:text-sm pl-6">
                  When you set your status to <strong>&ldquo;On Duty&rdquo;</strong> or have an active delivery trip assigned, the app collects continuous background location data. This enables customers and operations dispatchers to track the live progress of orders, ensures safety on the road, and accurately logs completed route distances for earnings computation.
                </p>
                <div className="mt-2 text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200/60">
                  <strong>Notice:</strong> Background location tracking is automatically deactivated when you toggle your status to &ldquo;Off Duty&rdquo; or log out of the application.
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Camera & File Storage Permissions */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
              <div className="p-2 rounded-lg bg-blue-50 text-[#1d4ed8]">
                <Camera size={20} />
              </div>
              <h2 className="text-xl font-bold text-zinc-950">3. Camera &amp; Storage / Media Permissions</h2>
            </div>
            <p className="text-zinc-600 leading-relaxed text-sm sm:text-base">
              The App may request access to your device camera and storage for specific operational workflows:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-zinc-600">
              <li>
                <strong className="text-zinc-900">Proof of Delivery (POD):</strong> Capturing parcel condition images and customer digital signature confirmations at the doorstep.
              </li>
              <li>
                <strong className="text-zinc-900">Partner KYC &amp; Onboarding:</strong> Uploading driving license, vehicle registration certificate, identity documents, and profile photos.
              </li>
              <li>
                <strong className="text-zinc-900">Barcode / QR Scanning:</strong> Scanning order labels and package waybills during fulfillment intake and dispatch.
              </li>
            </ul>
          </section>

          {/* Section 4: Data We Collect */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
              <div className="p-2 rounded-lg bg-blue-50 text-[#1d4ed8]">
                <UserCheck size={20} />
              </div>
              <h2 className="text-xl font-bold text-zinc-950">4. Information We Collect</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-1">
                <div className="font-semibold text-zinc-900">Personal &amp; Contact Data</div>
                <p className="text-zinc-600 text-xs sm:text-sm">Name, phone number, email address, emergency contact, and profile credentials.</p>
              </div>
              <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-1">
                <div className="font-semibold text-zinc-900">Vehicle &amp; License Data</div>
                <p className="text-zinc-600 text-xs sm:text-sm">Driving license details, vehicle type, registration number, and insurance status.</p>
              </div>
              <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-1">
                <div className="font-semibold text-zinc-900">Financial &amp; Payout Data</div>
                <p className="text-zinc-600 text-xs sm:text-sm">Bank account number, IFSC code, or UPI ID strictly for weekly/monthly earnings payouts.</p>
              </div>
              <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-1">
                <div className="font-semibold text-zinc-900">Performance &amp; Trip Logs</div>
                <p className="text-zinc-600 text-xs sm:text-sm">Orders delivered, delivery timestamps, customer ratings, tips, and distance travelled.</p>
              </div>
            </div>
          </section>

          {/* Section 5: Data Security & Retention */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
              <div className="p-2 rounded-lg bg-blue-50 text-[#1d4ed8]">
                <Lock size={20} />
              </div>
              <h2 className="text-xl font-bold text-zinc-950">5. Data Security &amp; Retention</h2>
            </div>
            <p className="text-zinc-600 leading-relaxed text-sm sm:text-base">
              All communications between the App and our backend servers are encrypted using standard TLS/HTTPS protocols. Stored credentials and tokens are secured via hardened database structures. We retain personal and operational records only as long as necessary to fulfill business requirements, dispute resolution, statutory taxation, and regulatory compliance.
            </p>
          </section>

          {/* Section 6: Account Deletion & User Rights */}
          <section className="space-y-4 bg-red-50/50 border border-red-200/60 p-6 rounded-2xl">
            <div className="flex items-center gap-3 border-b border-red-200/60 pb-3">
              <div className="p-2 rounded-lg bg-red-100 text-red-600">
                <Trash2 size={20} />
              </div>
              <h2 className="text-xl font-bold text-zinc-950">6. Account Deletion &amp; Data Erasure</h2>
            </div>
            <div className="space-y-3 text-zinc-700 text-sm sm:text-base leading-relaxed">
              <p>
                Delivery partners and fulfillment associates have the right to request the permanent deletion of their account and associated personal data at any time.
              </p>
              <div className="bg-white border border-red-200 p-4 rounded-xl space-y-2">
                <div className="font-semibold text-red-950">How to request account deletion:</div>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  You can submit a formal account deletion request through our online portal:
                </p>
                <div className="pt-1">
                  <Link
                    href="/delivery_app/delete-your-account"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={14} />
                    Go to Account Deletion Request Page
                  </Link>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  <strong>Important Notice:</strong> Once your request is verified and processed, your account, KYC records, and profile will be permanently deleted. A confirmation email will be sent to your registered email address before the deletion is finalized.
                </p>
              </div>
            </div>
          </section>

          {/* Section 7: Contact & Grievance Officer */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
              <div className="p-2 rounded-lg bg-blue-50 text-[#1d4ed8]">
                <Mail size={20} />
              </div>
              <h2 className="text-xl font-bold text-zinc-950">7. Grievance Officer &amp; Contact Information</h2>
            </div>
            <p className="text-zinc-600 leading-relaxed text-sm sm:text-base">
              If you have any questions, grievances, or concerns regarding this Privacy Policy or your data, please contact our Grievance Officer:
            </p>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 space-y-2 text-sm text-zinc-800">
              <div className="font-bold text-zinc-950">Mtwo Sales and Eservices India Pvt Ltd</div>
              <div className="flex items-center gap-2 text-zinc-600">
                <Mail size={16} className="text-[#1d4ed8]" />
                <span>Email: <a href="mailto:support@mtwo.in" className="text-[#1d4ed8] underline">support@mtwo.in</a></span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600">
                <Phone size={16} className="text-[#1d4ed8]" />
                <span>Website: <a href="https://mtwo.in" target="_blank" rel="noreferrer" className="text-[#1d4ed8] underline">https://mtwo.in</a></span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
