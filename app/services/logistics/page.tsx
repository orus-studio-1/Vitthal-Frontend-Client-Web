"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Truck,
  ArrowLeft,
  MapPin,
  Send,
  Loader2,
  CheckCircle2,
  Check,
} from "lucide-react";
import { createServiceTicket, fetchServiceCategories } from "@/lib/api/serviceHub";
import { useAuthStore } from "@/store/authStore";

const VEHICLES = [
  {
    id: "three_wheeler",
    name: "3-Wheeler Mini",
    capacity: "500 kg",
    dimensions: "5.5ft x 4.5ft",
    baseFare: 350,
    perKm: 22,
  },
  {
    id: "tata_ace",
    name: "Tata Ace (8ft)",
    capacity: "1,000 kg (1 Ton)",
    dimensions: "7ft x 4.5ft",
    baseFare: 550,
    perKm: 28,
  },
  {
    id: "bolero_pickup",
    name: "Bolero Pickup (9ft)",
    capacity: "1,500 kg (1.5 Ton)",
    dimensions: "9ft x 5.5ft",
    baseFare: 850,
    perKm: 34,
  },
  {
    id: "truck_14ft",
    name: "14ft Commercial Truck",
    capacity: "4,000 kg (4 Ton)",
    dimensions: "14ft x 6ft",
    baseFare: 1600,
    perKm: 48,
  },
  {
    id: "flatbed_trailer",
    name: "Heavy Machinery Flatbed",
    capacity: "15,000 kg (15 Ton)",
    dimensions: "20ft - 40ft",
    baseFare: 4500,
    perKm: 95,
  },
];

export default function LogisticsBookingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [categoryId, setCategoryId] = useState<string>("");
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLES[1]);

  // Addresses
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupContactName, setPickupContactName] = useState("");
  const [pickupContactPhone, setPickupContactPhone] = useState("");
  const [pickupTime, setPickupTime] = useState("Immediate Dispatch");

  const [dropAddress, setDropAddress] = useState("");
  const [dropContactName, setDropContactName] = useState("");
  const [dropContactPhone, setDropContactPhone] = useState("");

  // Cargo & Fare
  const [cargoType, setCargoType] = useState("Machined Industrial Parts / Pallets");
  const [estimatedWeight, setEstimatedWeight] = useState("500 kg");
  const [loadingAssistance, setLoadingAssistance] = useState(false);
  const [estimatedDistanceKm, setEstimatedDistanceKm] = useState(25);

  const [submitting, setSubmitting] = useState(false);
  const [createdTicketNumber, setCreatedTicketNumber] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const catsData = await fetchServiceCategories();
      const logCat = catsData.find(
        (c) => c.code.toLowerCase().includes("log") || c.label.toLowerCase().includes("log")
      ) || catsData[0];

      if (logCat) setCategoryId(logCat.id);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }

  const calculatedFare =
    selectedVehicle.baseFare + estimatedDistanceKm * selectedVehicle.perKm + (loadingAssistance ? 250 : 0);
  const gstAmount = Math.round(calculatedFare * 0.05);
  const totalAmount = calculatedFare + gstAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login to book a freight vehicle.");
      router.push("/login?redirect=/services/logistics");
      return;
    }

    if (!pickupAddress.trim() || !dropAddress.trim() || !pickupContactPhone.trim()) {
      toast.error("Pickup, Drop addresses and Contact Phone are required.");
      return;
    }

    try {
      setSubmitting(true);

      const ticketPayload = {
        vehicle_type: selectedVehicle.name,
        vehicle_id: selectedVehicle.id,
        pickup_address: pickupAddress.trim(),
        pickup_contact_name: pickupContactName.trim() || undefined,
        pickup_contact_phone: pickupContactPhone.trim(),
        pickup_time: pickupTime,
        drop_address: dropAddress.trim(),
        drop_contact_name: dropContactName.trim() || undefined,
        drop_contact_phone: dropContactPhone.trim() || undefined,
        cargo_type: cargoType,
        estimated_weight: estimatedWeight,
        loading_assistance: loadingAssistance,
        estimated_distance_km: estimatedDistanceKm,
        estimated_fare: totalAmount,
        booking_kind: "On-Demand Freight Logistics",
      };

      const res = await createServiceTicket({
        category_id: categoryId,
        priority: "high",
        ticket_payload: ticketPayload,
      });

      setCreatedTicketNumber(res.ticket_number);
      toast.success("Freight transport booked successfully.");
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

        {createdTicketNumber ? (
          <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-10 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h1 className="mt-4 font-heading text-xl font-semibold text-zinc-900">
              Transport Vehicle Booked
            </h1>
            <p className="mt-1 font-mono text-sm font-semibold text-blue-600">
              {createdTicketNumber}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-zinc-500">
              Your booking for <strong>{selectedVehicle.name}</strong> is confirmed. A driver is being assigned to your pickup point.
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/services/tickets"
                className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-medium text-white shadow-xs transition hover:bg-blue-700"
              >
                Track Live Trip
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
                On-demand industrial logistics with transparent per-km rates and verified commercial drivers.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Vehicle Selector */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-3 shadow-xs">
                <div className="border-b border-zinc-100 pb-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                    1. Select Vehicle Class
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {VEHICLES.map((v) => {
                    const isSelected = selectedVehicle.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVehicle(v)}
                        className={`flex flex-col justify-between rounded-lg border p-3.5 text-left transition ${
                          isSelected
                            ? "border-zinc-900 bg-zinc-900 text-white shadow-xs"
                            : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-heading text-xs font-semibold">{v.name}</span>
                            <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-blue-600"}`}>
                              ₹{v.baseFare}
                            </span>
                          </div>
                          <p className={`mt-1 text-[11px] ${isSelected ? "text-zinc-300" : "text-zinc-500"}`}>
                            Payload: {v.capacity}
                          </p>
                        </div>
                        <p className={`mt-2 text-[10px] ${isSelected ? "text-zinc-400" : "text-zinc-400"}`}>
                          Dimensions: {v.dimensions}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pickup & Drop Points */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-5 shadow-xs">
                <div className="border-b border-zinc-100 pb-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                    2. Route & Contact Information
                  </h2>
                </div>

                {/* Pickup Block */}
                <div className="space-y-3 rounded-lg border border-zinc-100 bg-zinc-50/60 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    Pickup Location (Origin Factory / Warehouse)
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Full pickup address, gate number, MIDC area..."
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
                    <input
                      type="text"
                      placeholder="Pickup Time (e.g. Now, 4 PM)"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Drop Block */}
                <div className="space-y-3 rounded-lg border border-zinc-100 bg-zinc-50/60 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
                    <span className="h-2 w-2 rounded-full bg-zinc-900" />
                    Delivery Destination (Recipient Facility)
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Full drop address with recipient plant / warehouse..."
                    value={dropAddress}
                    onChange={(e) => setDropAddress(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
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
                      placeholder="Receiver Phone (+91)"
                      value={dropContactPhone}
                      onChange={(e) => setDropContactPhone(e.target.value)}
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Additional Specs */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Distance (km approx)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={estimatedDistanceKm}
                      onChange={(e) => setEstimatedDistanceKm(parseInt(e.target.value, 10) || 1)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Cargo Description
                    </label>
                    <input
                      type="text"
                      value={cargoType}
                      onChange={(e) => setCargoType(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Total Weight
                    </label>
                    <input
                      type="text"
                      value={estimatedWeight}
                      onChange={(e) => setEstimatedWeight(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="loadingAssist"
                    checked={loadingAssistance}
                    onChange={(e) => setLoadingAssistance(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="loadingAssist" className="text-xs text-zinc-700 font-medium">
                    Include Driver Loading / Unloading Assistance (+₹250)
                  </label>
                </div>
              </div>

              {/* Fare Summary & Booking Action */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-6">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Estimated Freight Fare
                  </span>
                  <div className="mt-0.5 flex items-baseline gap-2">
                    <span className="font-heading text-2xl font-bold text-zinc-900">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-zinc-500">(Incl. ₹{gstAmount} GST)</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    {selectedVehicle.name} • {estimatedDistanceKm} km trip
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-7 py-3 text-xs font-medium text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Confirming...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" /> Confirm Freight Booking
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
