"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Send,
  Loader2,
  CheckCircle2,
  Check,
  Upload,
  X,
} from "lucide-react";
import { createServiceTicket, fetchAvailableLogisticsVehicleClasses, fetchServiceCategories, type LogisticsVehicleClass } from "@/lib/api/serviceHub";
import { useAuthStore } from "@/store/authStore";
import { isLogisticsService } from "@/lib/services/logistics";
import MapPicker, { type MapLocationData } from "@/components/shared/MapPicker";

function approximateDistanceKm(a: { lat: number; lng: number } | null, b: { lat: number; lng: number } | null) {
  if (!a || !b) return null;
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const dLat = radians(b.lat - a.lat);
  const dLng = radians(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function googleMapsLocationUrl(coordinates: { lat: number; lng: number } | null) {
  return coordinates
    ? `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`
    : "";
}

export default function LogisticsBookingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [categoryId, setCategoryId] = useState<string>("");
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [vehicleClasses, setVehicleClasses] = useState<LogisticsVehicleClass[]>([]);
  const [vehicleClassesLoading, setVehicleClassesLoading] = useState(true);
  const [selectedVehicleClassKey, setSelectedVehicleClassKey] = useState("");
  const selectedVehicle = vehicleClasses.find((vehicle) => vehicle.vehicle_class_key === selectedVehicleClassKey);

  // Addresses
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupCoordinates, setPickupCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [pickupContactName, setPickupContactName] = useState("");
  const [pickupContactPhone, setPickupContactPhone] = useState("");

  const [dropAddress, setDropAddress] = useState("");
  const [dropCoordinates, setDropCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [dropContactName, setDropContactName] = useState("");
  const [dropContactPhone, setDropContactPhone] = useState("");

  // Cargo & Fare
  const [cargoType, setCargoType] = useState("");
  const [estimatedWeight, setEstimatedWeight] = useState("");
  const [cargoSize, setCargoSize] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [loadImage, setLoadImage] = useState<{ fileName: string; s3Key: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<{ id: string; ticket_number: string } | null>(null);
  const approximateDistance = approximateDistanceKm(pickupCoordinates, dropCoordinates);
  const previewLoadImage = async () => {
    if (!loadImage) return;
    const previewWindow = window.open("about:blank", "_blank");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";
      const response = await fetch(`${apiUrl}/api/upload/file?fileName=${encodeURIComponent(loadImage.s3Key)}`, { credentials: "include" });
      const result = await response.json();
      const url = result.url || result.fileUrl || result.file_url || result.data?.url;
      if (!response.ok || !url) throw new Error(result.message || "Preview is unavailable.");
      if (previewWindow) previewWindow.location.href = url;
      else throw new Error("Allow pop-ups to preview the uploaded image.");
    } catch (error: any) {
      previewWindow?.close();
      toast.error(error.message || "Could not open image preview.");
    }
  };

  useEffect(() => {
    loadCategories();
    loadVehicleClasses();
  }, []);

  async function loadVehicleClasses() {
    try {
      const available = await fetchAvailableLogisticsVehicleClasses();
      setVehicleClasses(available);
      setSelectedVehicleClassKey(available[0]?.vehicle_class_key || "");
    } catch (error: any) {
      toast.error(error.message || "Failed to load available vehicles.");
    } finally {
      setVehicleClassesLoading(false);
    }
  }

  async function loadCategories() {
    try {
      setCategoryLoading(true);
      const catsData = await fetchServiceCategories();
      const logCat = catsData.find(isLogisticsService);

      if (logCat) setCategoryId(logCat.id);
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setCategoryLoading(false);
    }
  }

  const handleLoadImage = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      toast.error("Choose an image no larger than 5 MB.");
      return;
    }
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";
      const response = await fetch(`${apiUrl}/api/upload`, { method: "POST", credentials: "include", body: formData });
      const json = await response.json();
      if (!response.ok || !json.success || !json.fileName) throw new Error(json.message || "Could not upload image.");
      setLoadImage({ fileName: file.name, s3Key: json.fileName });
      toast.success("Load image attached.");
    } catch (error: any) {
      toast.error(error.message || "Could not upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login to book a freight vehicle.");
      router.push("/login?redirect=/services/logistics");
      return;
    }

    if (!categoryId) {
      toast.error("The Logistics service category is not available. Please contact support.");
      return;
    }
    if (!pickupAddress.trim() || !dropAddress.trim() || !pickupCoordinates || !dropCoordinates || !pickupContactPhone.trim() || !dropContactPhone.trim() || !estimatedWeight.trim() || !cargoSize.trim()) {
      toast.error("Choose pickup and delivery points on the map, and complete the contact and load details.");
      return;
    }
    if (!deliveryDate) {
      toast.error("Select your requested delivery date.");
      return;
    }
    if (!selectedVehicle) {
      toast.error("Select a vehicle class offered by an approved logistics vendor.");
      return;
    }

    try {
      setSubmitting(true);

      const ticketPayload = {
        service_name: "Logistics",
        service_code: "logistics",
        web_vehicle_selection: true,
        job_title: `Transport request: ${selectedVehicle.vehicle_class}`,
        vehicle_type: selectedVehicle.vehicle_class,
        vehicle_class_key: selectedVehicle.vehicle_class_key,
        pickup_address: pickupAddress.trim(),
        pickup_google_maps_url: googleMapsLocationUrl(pickupCoordinates),
        pickup_latitude: pickupCoordinates?.lat,
        pickup_longitude: pickupCoordinates?.lng,
        pickup_contact_name: pickupContactName.trim() || undefined,
        pickup_contact_phone: pickupContactPhone.trim(),
        delivery_date: deliveryDate,
        drop_address: dropAddress.trim(),
        delivery_google_maps_url: googleMapsLocationUrl(dropCoordinates),
        delivery_latitude: dropCoordinates?.lat,
        delivery_longitude: dropCoordinates?.lng,
        approximate_distance_km: approximateDistance ? Number(approximateDistance.toFixed(1)) : undefined,
        drop_contact_name: dropContactName.trim() || undefined,
        drop_contact_phone: dropContactPhone.trim() || undefined,
        cargo_type: cargoType,
        estimated_weight: estimatedWeight,
        cargo_size: cargoSize,
        booking_kind: "On-Demand Freight Logistics",
      };

      const res = await createServiceTicket({
        category_id: categoryId,
        priority: "high",
        ticket_payload: ticketPayload,
        documents: loadImage ? [{ doc_type: "load_image", doc_name: loadImage.fileName, doc_url: loadImage.s3Key }] : undefined,
      });

      setCreatedTicket({ id: res.id, ticket_number: res.ticket_number });
      toast.success("Logistics request submitted. Vendors can now quote the trip.");
    } catch (err: any) {
      toast.error(err.message || "Failed to book freight.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24 pt-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Service Hub
        </Link>

        {createdTicket ? (
          <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-10 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h1 className="mt-4 font-heading text-xl font-semibold text-zinc-900">
              Logistics Request Submitted
            </h1>
            <p className="mt-1 font-mono text-sm font-semibold text-blue-600">
              {createdTicket.ticket_number}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-zinc-500">
              Your request for <strong>{selectedVehicle?.vehicle_class || "the selected vehicle class"}</strong> has been sent to vendors offering that class. Review their quotations in your Ticket Room.
            </p>
            {approximateDistance !== null && <p className="mt-2 text-xs font-medium text-zinc-700">Approximate straight-line route: {approximateDistance.toFixed(1)} km</p>}

            <div className="mt-6 flex justify-center gap-3">
              <Link
                href={`/services/tickets/${createdTicket.id}`}
                className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-medium text-white shadow-xs transition hover:bg-blue-700"
              >
                Open Ticket Room
              </Link>
              <Link
                href="/services"
                className="rounded-lg border border-zinc-200 bg-white px-5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Return to Services
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-8">
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">
                Commercial Freight & Material Transport
              </h1>
              <p className="mt-1 text-xs text-zinc-500">
                Request transport and compare trip quotations from verified logistics vendors.
              </p>
            </div>

            {categoryLoading ? <div className="flex items-center gap-2 rounded-lg bg-zinc-50 p-4 text-xs text-zinc-500"><Loader2 className="h-4 w-4 animate-spin" />Loading Logistics service...</div> : !categoryId ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">The Logistics service category is not configured yet. Please contact support.</div> : <form onSubmit={handleSubmit} className="space-y-6">
              {/* Vehicle Selector */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-3 shadow-xs">
                <div className="border-b border-zinc-100 pb-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                    1. Select Vehicle Class
                  </h2>
                </div>

                {vehicleClassesLoading ? <p className="text-xs text-zinc-500">Loading vendor vehicles…</p> : vehicleClasses.length === 0 ? <p className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4 text-xs text-zinc-600">No approved vendor has added a logistics vehicle yet.</p> : <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {vehicleClasses.map((vehicle) => {
                    const isSelected = selectedVehicleClassKey === vehicle.vehicle_class_key;
                    return <button key={vehicle.vehicle_class_key} type="button" onClick={() => setSelectedVehicleClassKey(vehicle.vehicle_class_key)} className={`overflow-hidden rounded-lg border text-left transition ${isSelected ? "border-zinc-900 bg-zinc-900 text-white shadow-xs" : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300"}`}>
                      <div className="flex h-32 items-center justify-center bg-zinc-100"><img src={vehicle.image_url} alt={vehicle.vehicle_name} className="h-full w-full object-contain" /></div>
                      <div className="p-3.5"><div className="flex items-center justify-between gap-2"><span className="font-heading text-xs font-semibold">{vehicle.vehicle_class}</span><Check className={`h-4 w-4 shrink-0 ${isSelected ? "text-white" : "text-blue-600"}`} /></div>
                        <p className={`mt-1 text-[11px] ${isSelected ? "text-zinc-300" : "text-zinc-500"}`}>{vehicle.vehicle_name}</p>
                        <p className={`mt-2 text-[11px] ${isSelected ? "text-zinc-300" : "text-zinc-500"}`}>Payload: {vehicle.payload}</p>
                        <p className={`mt-1 text-[10px] ${isSelected ? "text-zinc-400" : "text-zinc-400"}`}>Dimensions: {vehicle.dimensions}</p>
                        <p className={`mt-2 text-[10px] ${isSelected ? "text-zinc-400" : "text-zinc-500"}`}>Offered by {vehicle.vendor_count} vendor{vehicle.vendor_count === 1 ? "" : "s"}</p>
                      </div>
                    </button>;
                  })}
                </div>}
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4 shadow-xs">
                <div className="border-b border-zinc-100 pb-3"><h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">2. Delivery Schedule</h2></div>
                <label className="block max-w-sm text-xs font-medium text-zinc-700">Requested delivery date *<input type="date" required min={new Date().toISOString().slice(0, 10)} value={deliveryDate} onChange={(event) => setDeliveryDate(event.target.value)} className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2" /></label>
              </div>

              {/* Pickup & Drop Points */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-5 shadow-xs">
                <div className="border-b border-zinc-100 pb-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                    3. Route & Contact Information
                  </h2>
                </div>

                {/* Pickup Block */}
                <div className="space-y-3 rounded-lg border border-zinc-100 bg-zinc-50/60 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900"><span className="h-2 w-2 rounded-full bg-blue-600" />Pickup Location (Origin Factory / Warehouse) *</div>
                  <div className="space-y-2 rounded-lg border border-zinc-200 bg-white p-3">
                    <p className="text-xs font-medium text-zinc-700">Search, pin, or use GPS to choose the pickup point</p>
                    <MapPicker
                      latitude={pickupCoordinates?.lat ?? null}
                      longitude={pickupCoordinates?.lng ?? null}
                      height="260px"
                      onChange={(lat: number, lng: number, locationData?: MapLocationData) => {
                        setPickupCoordinates({ lat, lng });
                        setPickupAddress(locationData?.displayName || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
                      }}
                    />
                    {pickupCoordinates && <p className="break-words text-[11px] text-zinc-600">Selected: {pickupAddress}</p>}
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Contact Name"
                      value={pickupContactName}
                      onChange={(e) => setPickupContactName(e.target.value)}
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:outline-none"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Contact Phone (+91)*"
                      value={pickupContactPhone}
                      onChange={(e) => setPickupContactPhone(e.target.value)}
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Drop Block */}
                <div className="space-y-3 rounded-lg border border-zinc-100 bg-zinc-50/60 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900"><span className="h-2 w-2 rounded-full bg-zinc-900" />Delivery Destination (Recipient Facility) *</div>
                  <div className="space-y-2 rounded-lg border border-zinc-200 bg-white p-3">
                    <p className="text-xs font-medium text-zinc-700">Search, pin, or use GPS to choose the delivery point</p>
                    <MapPicker
                      latitude={dropCoordinates?.lat ?? null}
                      longitude={dropCoordinates?.lng ?? null}
                      height="260px"
                      onChange={(lat: number, lng: number, locationData?: MapLocationData) => {
                        setDropCoordinates({ lat, lng });
                        setDropAddress(locationData?.displayName || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
                      }}
                    />
                    {dropCoordinates && <p className="break-words text-[11px] text-zinc-600">Selected: {dropAddress}</p>}
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Receiver Contact Name"
                      value={dropContactName}
                      onChange={(e) => setDropContactName(e.target.value)}
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:outline-none"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Receiver Phone (+91)*"
                      value={dropContactPhone}
                      onChange={(e) => setDropContactPhone(e.target.value)}
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                {approximateDistance !== null && <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800">Approximate straight-line distance: <strong>{approximateDistance.toFixed(1)} km</strong>. Actual road distance may be longer.</p>}

                {/* Additional Specs */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">Cargo Description *</label>
                    <input required type="text" value={cargoType} onChange={(e) => setCargoType(e.target.value)} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">Approximate load weight *</label>
                    <input required type="text" value={estimatedWeight} onChange={(e) => setEstimatedWeight(e.target.value)} placeholder="e.g. 500 kg" className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">Load size / dimensions *</label>
                    <input required type="text" value={cargoSize} onChange={(e) => setCargoSize(e.target.value)} placeholder="Length × width × height" className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-zinc-700">Load image (optional, max 5 MB)</label>
                  {loadImage ? <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs"><span className="truncate">{loadImage.fileName}</span><div className="ml-3 flex shrink-0 gap-3"><button type="button" onClick={() => void previewLoadImage()} className="font-medium text-blue-700">Preview</button><button type="button" aria-label="Remove load image" onClick={() => setLoadImage(null)} className="rounded p-1 text-zinc-500 hover:bg-white hover:text-rose-600"><X className="h-4 w-4" /></button></div></div> : <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-zinc-300 p-3 text-xs text-zinc-600 hover:border-blue-400"><Upload className="h-4 w-4" />{uploadingImage ? "Uploading image..." : "Attach load image"}<input type="file" accept="image/*" disabled={uploadingImage} className="hidden" onChange={(event) => { void handleLoadImage(event.currentTarget.files?.[0]); event.currentTarget.value = ""; }} /></label>}
                </div>
              </div>

              {/* Booking Action */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-6">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Transport quotation
                  </span>
                  <p className="mt-1 max-w-md text-xs text-zinc-600">Vendors will provide the route distance and trip rate. Review their quotation and pay in your Ticket Room.</p>
                </div>

                <button
                  type="submit"
                  disabled={submitting || uploadingImage || vehicleClassesLoading || !selectedVehicle}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-7 py-3 text-xs font-medium text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" /> Request Transport Quote
                    </>
                  )}
                </button>
              </div>
            </form>}
          </div>
        )}
      </div>
    </div>
  );
}
