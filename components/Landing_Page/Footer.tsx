"use client";

import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-800 bg-zinc-900">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-base font-semibold text-white">MTWO Groups</h3>
            <p className="mt-4 text-sm text-zinc-400 leading-relaxed">
              B2B industrial sourcing and procurement marketplace connecting manufacturers with verified suppliers.
            </p>
            <div className="mt-5">
              <a
                href="https://play.google.com/store/apps/details?id=com.mtwo.buy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-xl border border-zinc-700 bg-zinc-800/90 px-3.5 py-2 text-white hover:border-zinc-500 hover:bg-zinc-700/80 transition shadow-sm group"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" className="fill-current text-zinc-300 group-hover:text-white transition shrink-0">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a2.38 2.38 0 0 1-.61-.986V2.8c0-.369.227-.723.609-.986zm11.238 11.24L17.7 15.908l-12.02 6.87 9.167-9.724zm0-2.108L5.68 1.222l12.02 6.87-2.853 2.852zm1.055 1.054l2.766-1.58c1.173-.67 1.173-1.769 0-2.439l-2.766-1.58-1.503 1.503 1.503 1.503z" />
                </svg>
                <div className="text-left">
                  <p className="text-[9px] uppercase tracking-wider text-zinc-400 font-semibold leading-none">GET IT ON</p>
                  <p className="text-xs font-bold text-white leading-tight mt-0.5">Google Play</p>
                </div>
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-white">Product</h4>
            <ul className="mt-4 space-y-3 text-sm text-zinc-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Browse Categories
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Featured Products
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Bulk Orders
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white">Company</h4>
            <ul className="mt-4 space-y-3 text-sm text-zinc-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Buyer Protection
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-white">Support</h4>
            <ul className="mt-4 space-y-3 text-sm text-zinc-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Vendor Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Report Dispute
                </a>
              </li>
            </ul>
          </div>

          {/* Get in Touch */}
          <div>
            <h4 className="text-sm font-semibold text-white">Get in Touch</h4>
            <ul className="mt-4 space-y-3 text-sm text-zinc-400">
              <li>
                <a href="mailto:support@mtwo.in" className="hover:text-white transition-colors break-all">
                  support@mtwo.in
                </a>
              </li>
              <li>
                <a href="tel:+918530090303" className="hover:text-white transition-colors">
                  +91 85300 90303
                </a>
              </li>
              <li>
                <p className="text-xs text-zinc-500">Available 24/7 for support</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-zinc-800 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-zinc-500">&copy; {currentYear} MTWO. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-zinc-500">
              <Link href="/privacy-policy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
