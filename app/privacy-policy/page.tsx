"use client";

import { useState } from "react";
import { Shield, Lock, Eye, MapPin, FileText, Mail, Info, RefreshCw, ClipboardList, HelpCircle } from "lucide-react";

type Tab = "privacy" | "returns";

export default function PrivacyPolicyPage() {
  const [activeTab, setActiveTab] = useState<Tab>("privacy");
  const lastUpdated = "July 8, 2026";

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-4xl mx-auto bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Banner */}
        <div className="bg-[#1d4ed8] text-white px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-100">
            <Shield size={12} />
            Mtwo Sales and Eservices India Pvt Ltd
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Legal & Policy Center
          </h1>
          <p className="mt-2 text-blue-100 font-light max-w-xl mx-auto text-sm sm:text-base">
            Review our Privacy Policy, location permission disclosures, and custom manufacturing Return & Refund guidelines.
          </p>
          <div className="mt-4 text-xs text-blue-200">
            Last Updated: {lastUpdated}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-200 bg-zinc-50/50 p-2 gap-2">
          <button
            onClick={() => setActiveTab("privacy")}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === "privacy"
                ? "bg-white text-[#1d4ed8] shadow-xs border border-zinc-200/50"
                : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100/50"
            }`}
          >
            <Shield size={16} />
            Privacy & Permissions
          </button>
          <button
            onClick={() => setActiveTab("returns")}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === "returns"
                ? "bg-white text-[#1d4ed8] shadow-xs border border-zinc-200/50"
                : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100/50"
            }`}
          >
            <RefreshCw size={16} />
            Return, Refund & Remake
          </button>
        </div>

        {/* Content Section */}
        <div className="p-8 sm:p-12">
          {activeTab === "privacy" && (
            <div className="space-y-10 animate-in fade-in duration-200">
              {/* Section 1: Intro */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-[#1d4ed8]">
                    <Info size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-950">1. Introduction</h2>
                </div>
                <p className="text-zinc-600 leading-relaxed text-sm sm:text-base">
                  Welcome to <strong>Mtwo Sales and Eservices India Pvt Ltd</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). We operate <strong>mtwo.in</strong> (the &ldquo;Platform&rdquo;) and are committed to protecting your personal data and respecting your privacy. 
                  This Privacy Policy explains how we collect, use, process, share, and protect your information when you use our website, services, and associated mobile applications.
                </p>
              </section>

              {/* Section 2: Prominent Geolocation Disclosure */}
              <section className="space-y-4 bg-blue-50/50 border border-blue-100/70 p-6 rounded-xl">
                <div className="flex items-center gap-3 border-b border-blue-100 pb-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-[#1d4ed8]">
                    <MapPin size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-950">2. Geolocation & Permissions</h2>
                </div>
                <div className="space-y-3 text-zinc-700 leading-relaxed text-sm sm:text-base">
                  <p>
                    To provide a seamless, localized industrial procurement experience, our Platform and associated applications request location permissions:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-zinc-600">
                    <li>
                      <strong className="text-zinc-900">Foreground Location:</strong> We collect precise or approximate location coordinates when the app/platform is in use. This allows us to display verified local vendors, calculate precise shipping/freight charges, provide local service bookings, and show matching search filters.
                    </li>
                    <li>
                      <strong className="text-zinc-900">Background Location:</strong> For our delivery services (specifically in the rider app), we track device location in the background (even when the app is minimized or closed) to provide customers and logistics dispatchers with real-time tracking of active orders. Background location tracking is only active when a delivery agent is toggled &ldquo;On Duty.&rdquo;
                    </li>
                  </ul>
                  <p className="text-xs text-zinc-500 mt-2">
                    You can manage, revoke, or restrict location permissions at any time through your device settings.
                  </p>
                </div>
              </section>

              {/* Section 3: Information We Collect */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-[#1d4ed8]">
                    <FileText size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-950">3. Information We Collect</h2>
                </div>
                <div className="space-y-3 text-zinc-600 leading-relaxed text-sm sm:text-base">
                  <p>
                    We collect personal information to provide, improve, and secure our services, including:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong className="text-zinc-900">Account Details:</strong> Name, business email, phone number, password, and profile preferences when you register.</li>
                    <li><strong className="text-zinc-900">Delivery Addresses:</strong> Street address, city, state, country, and pincode used for order fulfillment.</li>
                    <li><strong className="text-zinc-900">Transaction Info:</strong> Order items, price, quotation history, billing logs, and payment status.</li>
                    <li><strong className="text-zinc-900">Device & Usage Data:</strong> IP address, device type, operating system version, browser type, and interaction metrics.</li>
                  </ul>
                </div>
              </section>

              {/* Section 4: How We Use Information */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-[#1d4ed8]">
                    <Eye size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-950">4. How We Use Your Information</h2>
                </div>
                <div className="space-y-3 text-zinc-600 leading-relaxed text-sm sm:text-base">
                  <p>
                    We use the gathered information to:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Create and manage user accounts, verify buyers, and authorize purchases.</li>
                    <li>Connect buyers with verified local vendors for quotation requests and order fulfillment.</li>
                    <li>Assign and track delivery agents using live GPS tracking.</li>
                    <li>Send transactional alerts, booking confirmations, and notification updates.</li>
                    <li>Detect and prevent fraud, security breaches, or compliance violations.</li>
                  </ul>
                </div>
              </section>

              {/* Section 5: Data Security */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-[#1d4ed8]">
                    <Lock size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-950">5. Data Security</h2>
                </div>
                <p className="text-zinc-600 leading-relaxed text-sm sm:text-base">
                  We employ industry-standard technical and organizational security measures, including SSL encryption and secure server environments, to protect your data against unauthorized access, loss, alteration, or misuse.
                </p>
              </section>

              {/* Section 6: Contact Us */}
              <section className="space-y-4 bg-zinc-50 border border-zinc-200 p-6 rounded-xl">
                <div className="flex items-center gap-3 border-b border-zinc-200 pb-3">
                  <div className="p-2 rounded-lg bg-zinc-200 text-zinc-800">
                    <Mail size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-950">6. Contact Us</h2>
                </div>
                <p className="text-zinc-600 leading-relaxed text-sm sm:text-base">
                  If you have any questions, feedback, or concerns regarding this Privacy Policy, please reach out to us at:
                </p>
                <div className="mt-4 p-4 bg-white border border-zinc-200 rounded-lg inline-flex items-center gap-3 shadow-xs">
                  <Mail className="text-[#1d4ed8]" size={18} />
                  <span className="font-semibold text-zinc-900 text-sm sm:text-base">support@mtwo.in</span>
                </div>
              </section>
            </div>
          )}

          {activeTab === "returns" && (
            <div className="space-y-10 animate-in fade-in duration-200">
              
              {/* Policy Intro */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-[#1d4ed8]">
                    <ClipboardList size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-950">B2B Return, Refund, and Remake Policy</h2>
                </div>
                <p className="text-zinc-600 leading-relaxed text-sm sm:text-base">
                  At <strong>Mtwo Sales and Eservices India Pvt Ltd</strong>, we deliver high-quality, customized manufacturing services tailored exactly to your unique technical configurations and specifications. Because our items are made-to-order, our policies differ from standard retail e-commerce stores.
                </p>
              </section>

              {/* Rule 1 */}
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-zinc-900">1. Custom Orders Policy (Final Sale)</h3>
                <div className="space-y-2 text-zinc-600 text-sm sm:text-base leading-relaxed">
                  <p>
                    <strong className="text-zinc-950">No Change of Mind Returns:</strong> Once an order moves into the production stage, it cannot be canceled, modified, or returned due to a change of mind.
                  </p>
                  <p>
                    <strong className="text-zinc-950">Customer File Responsibility:</strong> The user is solely responsible for verifying the accuracy of all uploaded manufacturing designs, 3D files, blueprints, dimensions, and material selections before checkout. Defects resulting from original file geometry errors or incorrect input data are completely non-refundable.
                  </p>
                </div>
              </section>

              {/* Rule 2 */}
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-zinc-900">2. Scope of Eligible Claims (Manufacturing Faults)</h3>
                <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
                  We accept responsibility and will offer remedies only if the delivered goods fail to meet the approved order criteria due to a manufacturing defect:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-zinc-600 text-sm sm:text-base">
                  <li>
                    <strong className="text-zinc-900">Out-of-Specification:</strong> The delivered product significantly deviates from the technical dimensions or tolerances defined during order placement (excluding standard material variances).
                  </li>
                  <li>
                    <strong className="text-zinc-900">Material/Design Error:</strong> The wrong material type, colorway, or base file variant was used during production.
                  </li>
                  <li>
                    <strong className="text-zinc-900">Logistics/Transit Damage:</strong> The product arrives broken or structurally compromised by our third-party fulfillment partner.
                  </li>
                </ul>
              </section>

              {/* Rule 3 */}
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-zinc-900">3. Claim Window and Process</h3>
                <div className="space-y-2 text-zinc-600 text-sm sm:text-base leading-relaxed">
                  <p>
                    <strong className="text-zinc-950">7-Day Inspection Period:</strong> Any manufacturing issue or shipping damage must be reported within 7 calendar days from the date of verified delivery.
                  </p>
                  <p>
                    <strong className="text-zinc-950">Evidence Submission:</strong> To file a claim, users must open a ticket via the Mtwo Sales and Eservices India Pvt Ltd mobile app or web portal, providing high-resolution photographs or video proof detailing the dimensional or material error.
                  </p>
                  <p>
                    <strong className="text-zinc-950">Evaluation:</strong> Our quality engineering team will review the submitted data against your design files within 3 business days.
                  </p>
                </div>
              </section>

              {/* Rule 4 */}
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-zinc-900">4. Resolution Protocol: Remake First</h3>
                <div className="space-y-2 text-zinc-600 text-sm sm:text-base leading-relaxed">
                  <p>
                    <strong className="text-zinc-950">Free Remakes:</strong> If a structural or production defect is verified to be our error, our primary remedy is a priority reproduction and replacement at zero cost to the customer.
                  </p>
                  <p>
                    <strong className="text-zinc-950">Refund Exceptions:</strong> A monetary refund is only processed if replication is technically impossible or if the required raw materials are completely out of stock. Approved refunds will be credited back to the original source payment method within 5–7 business days.
                  </p>
                </div>
              </section>

              {/* Rule 5 */}
              <section className="space-y-3 bg-zinc-50 border border-zinc-200 p-5 rounded-xl">
                <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  <HelpCircle className="text-[#1d4ed8]" size={20} />
                  5. Legal Compliance (Consumer Protection Act, India)
                </h3>
                <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
                  According to the Indian Consumer Protection (E-Commerce) Rules, while Indian consumers have a general right to return defective goods, made-to-order and highly personalized custom products are legally exempt from standard cooling-off and unconditional return mandates, provided the business explicitly displays these rules. By explicitly defining what qualifies as a defect (e.g., specific engineering tolerances), Mtwo Sales and Eservices India Pvt Ltd maintains a clear and legally sound protective barrier against unfair return disputes.
                </p>
              </section>

              {/* Rule 6 */}
              <section className="space-y-3 bg-blue-50/50 border border-blue-100 p-5 rounded-xl">
                <h3 className="text-lg font-bold text-zinc-900">6. Implementation & Guidelines</h3>
                <div className="space-y-2 text-zinc-700 text-sm sm:text-base leading-relaxed">
                  <p>
                    <strong className="text-zinc-950">Checkout Acceptance Gate:</strong> Require users to tick an active checkbox confirming: <em>&ldquo;I understand that because this item is custom manufactured, it is final sale unless a factory defect occurs.&rdquo;</em> before they can process payment.
                  </p>
                  <p>
                    <strong className="text-zinc-950">Production Lock:</strong> Freeze the cancellation window on both the web dashboard and app the exact moment the order status shifts to &ldquo;In Production&rdquo;.
                  </p>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
