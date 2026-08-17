"use client";

import { MapPin, Navigation, Crosshair, Loader2 } from "lucide-react";
import type { ClientAddress } from "@/lib/api/client";

interface UserLocation {
  lat: number;
  lng: number;
  label: string;
}

interface DeliveryLocationProps {
  userLocation: UserLocation | null;
  savedAddress: ClientAddress | null;
  isLocating: boolean;
  onUseCurrentLocation: () => void;
  onUseSavedAddress: () => void;
}

export function DeliveryLocation({
  userLocation,
  savedAddress,
  isLocating,
  onUseCurrentLocation,
  onUseSavedAddress,
}: DeliveryLocationProps) {
  return (
    <div className="border border-zinc-200/80 bg-white rounded-2xl shadow-2xs overflow-hidden">
      <div className="px-5 sm:px-6 py-3.5 border-b border-zinc-100 bg-zinc-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-[#1d4ed8]" />
          <h3 className="text-sm sm:text-base font-bold text-zinc-900">Delivery &amp; Supplier Proximity</h3>
        </div>
        {userLocation && (
          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Location Active
          </span>
        )}
      </div>

      <div className="p-4 sm:p-5">
        {userLocation ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="mt-0.5 p-2 bg-blue-50 text-[#1d4ed8] rounded-xl shrink-0">
                <Navigation size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-zinc-900">
                  {savedAddress &&
                  userLocation.lat === savedAddress.latitude &&
                  userLocation.lng === savedAddress.longitude
                    ? "Deliver to Profile Address"
                    : "Deliver to Current Location"}
                </p>
                <p className="text-xs text-zinc-600 truncate mt-0.5">{userLocation.label}</p>
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                  {userLocation.lat.toFixed(4)}° N, {userLocation.lng.toFixed(4)}° E
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-0 border-zinc-100">
              {savedAddress &&
                (userLocation.lat !== savedAddress.latitude ||
                  userLocation.lng !== savedAddress.longitude) && (
                  <button
                    type="button"
                    onClick={onUseSavedAddress}
                    className="text-xs font-bold text-[#1d4ed8] hover:underline transition-colors px-2 py-1 cursor-pointer"
                  >
                    Use Profile Address
                  </button>
                )}
              <button
                type="button"
                onClick={onUseCurrentLocation}
                disabled={isLocating}
                className="flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors disabled:opacity-60 bg-white shadow-2xs text-zinc-700 cursor-pointer w-full sm:w-auto"
              >
                {isLocating ? <Loader2 size={13} className="animate-spin" /> : <Crosshair size={13} />}
                {isLocating ? "Detecting..." : "Update Location"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center py-3">
            <MapPin size={28} className="text-zinc-300 mb-2" />
            <p className="text-sm font-bold text-zinc-900 mb-0.5">Set Your Delivery Location</p>
            <p className="text-xs text-zinc-500 mb-3 max-w-sm">
              We rank suppliers by distance and real-time inventory to get you fastest dispatch and lowest transport costs.
            </p>
            <button
              type="button"
              onClick={onUseCurrentLocation}
              disabled={isLocating}
              className="flex items-center gap-2 px-4 py-2 bg-[#1d4ed8] text-white text-xs font-bold rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-60 shadow-sm cursor-pointer"
            >
              {isLocating ? <Loader2 size={14} className="animate-spin" /> : <Crosshair size={14} />}
              {isLocating ? "Detecting Location..." : "Detect Current Location"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
