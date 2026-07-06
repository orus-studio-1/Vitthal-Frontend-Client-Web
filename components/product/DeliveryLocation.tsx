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
    <div className="border border-zinc-200 bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
        <MapPin size={18} className="text-blue-600" />
        <h3 className="text-lg font-semibold text-zinc-900">Delivery Location</h3>
      </div>

      <div className="p-5">
        {userLocation ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Navigation size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  {savedAddress &&
                  userLocation.lat === savedAddress.latitude &&
                  userLocation.lng === savedAddress.longitude
                    ? "Deliver to your saved profile address"
                    : "Deliver to captured location"}
                </p>
                <p className="text-sm text-zinc-500 mt-0.5">{userLocation.label}</p>
                <p className="text-xs text-zinc-400 mt-1">
                  {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
              {savedAddress &&
                (userLocation.lat !== savedAddress.latitude ||
                  userLocation.lng !== savedAddress.longitude) && (
                  <button
                    onClick={onUseSavedAddress}
                    className="text-xs font-bold text-blue-600 hover:underline transition-colors mr-2"
                  >
                    Use Saved Address
                  </button>
                )}
              <button
                onClick={onUseCurrentLocation}
                disabled={isLocating}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors disabled:opacity-60 bg-white shadow-sm"
              >
                {isLocating ? <Loader2 size={14} className="animate-spin" /> : <Crosshair size={14} />}
                {isLocating ? "Detecting..." : "Use Current Location"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center py-4">
            <MapPin size={32} className="text-zinc-300 mb-3" />
            <p className="text-sm font-semibold text-zinc-900 mb-1">Set your delivery location</p>
            <p className="text-xs text-zinc-500 mb-4 max-w-sm">
              We&apos;ll rank suppliers based on your location to find the best prices, closest
              distances, and top-rated vendors.
            </p>
            <button
              onClick={onUseCurrentLocation}
              disabled={isLocating}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1d4ed8] text-white text-sm font-semibold rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-60 shadow-md shadow-blue-100"
            >
              {isLocating ? <Loader2 size={16} className="animate-spin" /> : <Crosshair size={16} />}
              {isLocating ? "Detecting Location..." : "Use Current Location"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
