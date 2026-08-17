"use client";

import Link from "next/link";
import { Smartphone } from "lucide-react";

export function CTASection() {
  return (
    <section className="bg-[#1d4ed8]">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-6 px-4 py-14 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <div>
          <h3 className="text-xl font-semibold text-white sm:text-2xl">
            Experience Seamless B2B Procurement on Mobile & Web
          </h3>
          <p className="mt-2 max-w-lg text-sm text-blue-100 leading-relaxed">
            Create RFQs, track live orders, and source industrial materials anytime. Download our official Android app today!
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-wrap items-center gap-3">
          <a
            href="https://play.google.com/store/apps/details?id=com.mtwo.buy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#1d4ed8] shadow-md transition hover:bg-blue-50"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" className="fill-current">
              <path d="M3.609 1.814L13.792 12 3.61 22.186a2.38 2.38 0 0 1-.61-.986V2.8c0-.369.227-.723.609-.986zm11.238 11.24L17.7 15.908l-12.02 6.87 9.167-9.724zm0-2.108L5.68 1.222l12.02 6.87-2.853 2.852zm1.055 1.054l2.766-1.58c1.173-.67 1.173-1.769 0-2.439l-2.766-1.58-1.503 1.503 1.503 1.503z" />
            </svg>
            <span>Get on Google Play</span>
          </a>
          <Link
            href="/products"
            className="inline-flex items-center whitespace-nowrap rounded-xl border border-white/40 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </section>
  );
}

