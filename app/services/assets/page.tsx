"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Package,
  Plus,
  ArrowLeft,
  Wrench,
  RefreshCw,
  X,
  Loader2,
} from "lucide-react";
import { fetchMyAssets, createClientAsset, type ClientAsset } from "@/lib/api/serviceHub";
import { useAuthStore } from "@/store/authStore";

export const dynamic = "force-dynamic";

export default function ClientAssetsRegistryPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [assets, setAssets] = useState<ClientAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form Fields
  const [assetName, setAssetName] = useState("");
  const [assetCode, setAssetCode] = useState("");
  const [brand, setBrand] = useState("");
  const [modelNumber, setModelNumber] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [installationYear, setInstallationYear] = useState<number | undefined>(2023);
  const [controllerType, setControllerType] = useState("Fanuc");
  const [plantLocation, setPlantLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/services/assets");
      return;
    }
    if (isAuthenticated) {
      loadAssets();
    }
  }, [isAuthenticated, authLoading]);

  async function loadAssets() {
    try {
      setLoading(true);
      const data = await fetchMyAssets();
      setAssets(data);
    } catch (err) {
      console.error("Failed to load assets:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim()) {
      toast.error("Machine Name is required.");
      return;
    }

    try {
      setSubmitting(true);
      await createClientAsset({
        asset_name: assetName.trim(),
        asset_code: assetCode.trim() || undefined,
        brand: brand.trim() || undefined,
        model_number: modelNumber.trim() || undefined,
        serial_number: serialNumber.trim() || undefined,
        installation_year: installationYear,
        specs: { controller: controllerType },
        location_details: { plant: plantLocation },
      });

      toast.success("Equipment registered.");
      setModalOpen(false);
      setAssetName("");
      setAssetCode("");
      setBrand("");
      setModelNumber("");
      setSerialNumber("");
      loadAssets();
    } catch (err: any) {
      toast.error(err.message || "Failed to register asset.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-white pb-24 pt-16">
        <div className="mx-auto max-w-md px-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Package className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-zinc-900">
            Sign In to View Machinery Registry
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            Please log in or create an account to manage your factory equipment, CNC machines, and plant assets.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/login?redirect=/services/assets"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-medium text-white shadow-xs transition hover:bg-blue-700"
            >
              Log In
            </Link>
            <Link
              href="/register?redirect=/services/assets"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-6 py-2.5 text-xs font-medium text-zinc-700 shadow-xs transition hover:bg-zinc-50"
            >
              Create Account
            </Link>
          </div>

          <div className="mt-8 border-t border-zinc-100 pt-6">
            <Link
              href="/services"
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition"
            >
              ← Return to Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24 pt-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Service Hub
            </Link>
            <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-zinc-900">
              Plant Machinery & Asset Registry
            </h1>
            <p className="text-xs text-zinc-500">
              Saved equipment profiles for fast 1-click breakdown reporting and service history.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-blue-700 transition"
          >
            <Plus className="h-3.5 w-3.5" /> Register Equipment
          </button>
        </div>

        {/* Machinery Grid */}
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-zinc-400">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
            <p className="text-xs">Loading machinery profiles...</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="my-12 rounded-xl border border-zinc-200 bg-zinc-50/50 p-12 text-center">
            <Package className="mx-auto h-8 w-8 text-zinc-400" />
            <h3 className="mt-3 text-sm font-semibold text-zinc-800">No machinery registered</h3>
            <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
              Save your CNC centers, lathes, presses, and compressors once for rapid breakdown dispatch.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-3.5 w-3.5" /> Add Equipment
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-xs transition hover:border-zinc-300"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-medium text-zinc-500">
                      {asset.asset_code || "ASSET"}
                    </span>
                    {asset.installation_year && (
                      <span className="text-[11px] text-zinc-400">{asset.installation_year}</span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-heading text-sm font-semibold text-zinc-900 truncate">
                      {asset.asset_name}
                    </h3>
                    <p className="text-xs text-zinc-500">
                      {asset.brand || "Industrial"} {asset.model_number ? `• ${asset.model_number}` : ""}
                    </p>
                  </div>

                  <div className="rounded-lg border border-zinc-100 bg-zinc-50/60 p-2.5 text-xs text-zinc-600 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[11px] text-zinc-400">Serial #</span>
                      <span className="font-mono text-[11px] text-zinc-800">{asset.serial_number || "—"}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-zinc-100 pt-3">
                  <Link
                    href="/services/maintenance"
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white py-2 text-xs font-medium text-zinc-800 transition hover:bg-zinc-50 hover:border-zinc-300"
                  >
                    <Wrench className="h-3.5 w-3.5 text-zinc-500" /> Book Service
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Add Machine */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <h2 className="font-heading text-sm font-semibold text-zinc-900">Register Plant Equipment</h2>
                <button onClick={() => setModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateAsset} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Equipment / Machine Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5-Axis CNC Milling Center"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Make / Brand
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Haas, Mazak"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Model Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. VF-2"
                      value={modelNumber}
                      onChange={(e) => setModelNumber(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Serial Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SN-88910"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Plant Tag Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CNC-01"
                      value={assetCode}
                      onChange={(e) => setAssetCode(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Controller System
                    </label>
                    <select
                      value={controllerType}
                      onChange={(e) => setControllerType(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none"
                    >
                      <option value="Fanuc">Fanuc</option>
                      <option value="Siemens Sinumerik">Siemens Sinumerik</option>
                      <option value="Mitsubishi">Mitsubishi</option>
                      <option value="Heidenhain">Heidenhain</option>
                      <option value="PLC / Relay Logic">PLC / Relay Logic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Installation Year
                    </label>
                    <input
                      type="number"
                      value={installationYear || ""}
                      onChange={(e) => setInstallationYear(parseInt(e.target.value, 10) || undefined)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                    Save Equipment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
