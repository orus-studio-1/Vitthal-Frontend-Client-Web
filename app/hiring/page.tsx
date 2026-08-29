"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  MapPin,
  UserPlus,
  RefreshCw,
  ArrowRight,
  Check,
} from "lucide-react";
import { fetchCandidates, type CandidateListItem } from "@/lib/api/hiring";

const POPULAR_SKILLS = [
  "All Skills",
  "CNC Machine",
  "VMC",
  "Welding",
  "Lathe",
  "Fabrication",
  "PLC",
  "Electrical",
  "Quality QC",
];

const POPULAR_CITIES = ["All Cities", "Pune", "Chakan", "Bhosari", "Pimpri", "Mumbai", "Aurangabad"];

export default function TalentDirectoryPage() {
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All Skills");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [experienceMin, setExperienceMin] = useState<number | undefined>(undefined);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadCandidates();
  }, [selectedSkill, selectedCity, experienceMin]);

  async function loadCandidates() {
    try {
      setLoading(true);
      const res = await fetchCandidates({
        search: search || undefined,
        city: selectedCity !== "All Cities" ? selectedCity : undefined,
        skills: selectedSkill !== "All Skills" ? selectedSkill : undefined,
        experience_min: experienceMin,
        limit: 50,
      });
      setCandidates(res.candidates);
      setTotalCount(res.total);
    } catch (err) {
      console.error("Failed to load candidates:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCandidates();
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Hero Header */}
      <section className="border-b border-zinc-200/80 bg-zinc-50/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                Vetted Industrial Staffing
              </div>
              <h1 className="font-heading text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                Industrial Talent & Machine Operators
              </h1>
              <p className="text-sm leading-relaxed text-zinc-600 sm:text-base">
                Directly connect with certified CNC operators, welders, lathe turners, and maintenance technicians.
                All candidates are document-verified and background-audited.
              </p>
            </div>

            {/* Candidate CTA */}
            <div className="flex shrink-0 items-center gap-3">
              <Link
                href="/hiring/register"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-xs transition hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4" />
                Register as Worker / Candidate
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Search & Filters */}
        <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
          <form onSubmit={handleSearchSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by job title, skill (CNC, TIG Welding, Siemens PLC), or candidate name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-4 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-5 py-2 text-xs font-medium text-white hover:bg-zinc-800 transition"
            >
              Search
            </button>
          </form>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-100 pt-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-zinc-400 mr-1">Skills:</span>
              {POPULAR_SKILLS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => setSelectedSkill(skill)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                    selectedSkill === skill
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-700 focus:border-blue-600 focus:outline-none"
              >
                {POPULAR_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={experienceMin ?? ""}
                onChange={(e) => setExperienceMin(e.target.value ? Number(e.target.value) : undefined)}
                className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-700 focus:border-blue-600 focus:outline-none"
              >
                <option value="">Any Experience</option>
                <option value="1">1+ Years</option>
                <option value="3">3+ Years</option>
                <option value="5">5+ Years</option>
              </select>
            </div>
          </div>
        </div>

        {/* Candidate Cards Grid */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs text-zinc-500">
              Showing <span className="font-medium text-zinc-900">{candidates.length}</span> verified profiles
            </p>
          </div>

          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-zinc-400">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
              <p className="text-xs">Loading talent profiles...</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-12 text-center">
              <Briefcase className="mx-auto h-8 w-8 text-zinc-400" />
              <h3 className="mt-3 text-sm font-semibold text-zinc-800">No candidates match your criteria</h3>
              <p className="mt-1 text-xs text-zinc-500">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {candidates.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-xs transition hover:border-zinc-300"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-heading text-base font-semibold text-zinc-900">
                          {c.full_name}
                        </h3>
                        <p className="text-xs font-medium text-zinc-600">{c.designation || "Industrial Worker"}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-700">
                        <Check className="h-3 w-3 text-blue-600" /> Verified
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      {c.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-zinc-400" /> {c.city}
                        </span>
                      )}
                      <span>•</span>
                      <span>{c.experience_years || 0} yrs exp</span>
                      {c.metadata?.hiring_type && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{c.metadata.hiring_type}</span>
                        </>
                      )}
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {c.skills?.slice(0, 4).map((s, idx) => (
                        <span
                          key={idx}
                          className="rounded-md border border-zinc-100 bg-zinc-50 px-2 py-0.5 text-[11px] text-zinc-700"
                        >
                          {s}
                        </span>
                      ))}
                      {(c.skills?.length || 0) > 4 && (
                        <span className="text-[10px] text-zinc-400 self-center">
                          +{(c.skills?.length || 0) - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold">Expected Wage</span>
                      <p className="font-heading text-xs font-semibold text-zinc-900">
                        {c.metadata?.expected_salary
                          ? `₹${Number(c.metadata.expected_salary).toLocaleString("en-IN")}/mo`
                          : "Negotiable"}
                      </p>
                    </div>

                    <Link
                      href={`/hiring/${c.id}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-blue-600"
                    >
                      View Profile <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
