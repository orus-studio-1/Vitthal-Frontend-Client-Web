"use client";

import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  HeadphonesIcon,
  MessageSquare,
  Building2,
  Send,
  CheckCircle,
} from "lucide-react";

const contactMethods = [
  {
    icon: Phone,
    title: "Phone Support",
    detail: "+91 1800-123-4567",
    subtext: "Mon-Sat, 9 AM - 7 PM IST",
    action: "Call Now",
    href: "tel:+9118001234567",
  },
  {
    icon: Mail,
    title: "Email Us",
    detail: "support@mtwo.in",
    subtext: "We reply within 24 hours",
    action: "Send Email",
    href: "mailto:support@mtwo.in",
  },
  {
    icon: HeadphonesIcon,
    title: "Live Chat",
    detail: "Chat with Support",
    subtext: "Available 24/7",
    action: "Start Chat",
    href: "#",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp",
    detail: "+91 98765-43210",
    subtext: "Quick responses on WhatsApp",
    action: "Message",
    href: "https://wa.me/919876543210",
  },
];

const offices = [
  {
    city: "Mumbai",
    address: "123 Business Park, Andheri East, Mumbai 400069",
    phone: "+91 22-1234-5678",
    type: "Headquarters",
  },
  {
    city: "Delhi",
    address: "456 Trade Center, Connaught Place, New Delhi 110001",
    phone: "+91 11-8765-4321",
    type: "Regional Office",
  },
  {
    city: "Bangalore",
    address: "789 Tech Hub, Whitefield, Bangalore 560066",
    phone: "+91 80-2345-6789",
    type: "Regional Office",
  },
];

const faqs = [
  {
    q: "How do I register as a vendor?",
    a: "Visit our vendor portal and complete the registration form with your GST and business details. Verification takes 24-48 hours.",
  },
  {
    q: "What are the payment terms?",
    a: "Buyers can pay via Net Banking, UPI, or Credit Terms. Vendors receive payment within 7 days of order delivery.",
  },
  {
    q: "How can I track my order?",
    a: "Log into your dashboard and navigate to the Orders section for real-time tracking updates.",
  },
  {
    q: "Do you offer bulk pricing?",
    a: "Yes! Create an RFQ for bulk requirements and receive competitive quotes from multiple vendors.",
  },
];

export default function ContactsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Hero Section */}
      <section className="relative bg-zinc-50 border-b border-zinc-200">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#1d4ed8]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1d4ed8]" />
              Get in Touch
            </span>
            <h1 className="font-heading mt-5 text-4xl font-bold leading-[1.2] tracking-tight text-zinc-900 sm:text-5xl">
              We&apos;d Love to Hear From <span className="text-[#1d4ed8]">You</span>
            </h1>
            <p className="mt-5 text-base font-light leading-relaxed text-zinc-600 sm:text-lg">
              Have questions about our platform? Need help with procurement? Our team is here to assist you every step of the way.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods Grid */}
      <section className="bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {contactMethods.map((method) => (
              <a
                key={method.title}
                href={method.href}
                className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-[#1d4ed8]/30 hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-[#1d4ed8] transition-colors group-hover:bg-[#1d4ed8] group-hover:text-white">
                  <method.icon size={22} strokeWidth={1.75} />
                </div>
                <h3 className="font-heading text-base font-semibold text-zinc-900">{method.title}</h3>
                <p className="mt-1 text-sm font-medium text-[#1d4ed8]">{method.detail}</p>
                <p className="mt-1 text-xs text-zinc-500">{method.subtext}</p>
                <span className="mt-auto pt-4 text-xs font-semibold text-zinc-700 group-hover:text-[#1d4ed8]">
                  {method.action} →
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form + Office Info */}
      <section className="bg-zinc-50 border-t border-zinc-200">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="font-heading text-xl font-bold text-zinc-900 sm:text-2xl">Send us a Message</h2>
              <p className="mt-2 text-sm text-zinc-600">
                Fill out the form below and we&apos;ll get back to you within 24 hours.
              </p>

              {submitted ? (
                <div className="mt-8 flex flex-col items-center justify-center rounded-lg bg-emerald-50 p-8 text-center">
                  <CheckCircle size={48} className="text-emerald-600" strokeWidth={1.75} />
                  <h3 className="mt-4 font-heading text-lg font-semibold text-emerald-900">Message Sent!</h3>
                  <p className="mt-1 text-sm text-emerald-700">We&apos;ll get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700">Full Name</label>
                      <input
                        required
                        type="text"
                        placeholder="John Doe"
                        className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/20"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700">Email</label>
                      <input
                        required
                        type="email"
                        placeholder="john@company.com"
                        className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/20"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700">Company</label>
                      <input
                        type="text"
                        placeholder="Company Name"
                        className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/20"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700">Phone</label>
                      <input
                        type="tel"
                        placeholder="+91 98765-43210"
                        className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/20"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">Subject</label>
                    <select
                      required
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/20"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    >
                      <option value="">Select a subject</option>
                      <option value="sales">Sales Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="vendor">Vendor Registration</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">Message</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="How can we help you?"
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/20"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1d4ed8] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1e40af]"
                  >
                    <Send size={18} strokeWidth={1.75} />
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Office Locations */}
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-xl font-bold text-zinc-900 sm:text-2xl">Our Offices</h2>
                <p className="mt-2 text-sm text-zinc-600">
                  Visit us at any of our locations across India.
                </p>
              </div>
              <div className="space-y-4">
                {offices.map((office) => (
                  <div
                    key={office.city}
                    className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-[#1d4ed8]">
                          <Building2 size={20} strokeWidth={1.75} />
                        </div>
                        <div>
                          <h3 className="font-heading text-base font-semibold text-zinc-900">{office.city}</h3>
                          <span className="text-xs text-zinc-500">{office.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-start gap-2 text-sm text-zinc-600">
                        <MapPin size={16} className="mt-0.5 text-zinc-400" strokeWidth={1.75} />
                        <span>{office.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-600">
                        <Phone size={16} className="text-zinc-400" strokeWidth={1.75} />
                        <span>{office.phone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Working Hours Card */}
              <div className="rounded-xl border border-zinc-200 bg-[#1d4ed8] p-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                    <Clock size={20} strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-semibold">Working Hours</h3>
                    <p className="text-xs text-blue-100">When to reach us</p>
                  </div>
                </div>
                <div className="mt-4 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-100">Monday - Saturday</span>
                    <span>9:00 AM - 7:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-100">Sunday</span>
                    <span>Closed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-100">Support</span>
                    <span>24/7 Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white border-t border-zinc-200">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-zinc-900 sm:text-4xl">Frequently Asked Questions</h2>
            <p className="mt-3 text-base text-zinc-600 max-w-2xl mx-auto">
              Quick answers to common questions. Can&apos;t find what you&apos;re looking for? Contact us directly.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 transition-all hover:border-[#1d4ed8]/30"
              >
                <h3 className="font-heading text-sm font-semibold text-zinc-900">{faq.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#1d4ed8]">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-6 px-4 py-14 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div>
            <h3 className="font-heading text-xl font-semibold text-white sm:text-2xl">
              Still have questions?
            </h3>
            <p className="mt-2 max-w-lg text-sm text-blue-100">
              Our support team is available 24/7 to help you with any queries.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <a
              href="tel:+9118001234567"
              className="whitespace-nowrap rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-[#1d4ed8] transition-colors hover:bg-blue-50"
            >
              Call Support
            </a>
            <a
              href="mailto:support@mtwo.in"
              className="whitespace-nowrap rounded-lg border border-white/40 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Email Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}