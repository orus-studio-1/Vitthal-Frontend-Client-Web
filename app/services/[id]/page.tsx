"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Star,
  ChevronRight,
  Building2,
  Clock,
  Loader2,
  Users,
  Tag,
  ShoppingBag,
  MessageSquare,
  Wrench,
  Heart,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Navigation,
  Crosshair,
  BadgeCheck,
  Layers,
} from "lucide-react";
import { ServiceMediaGallery } from "@/components/services/ServiceMediaGallery";
import { BookServiceModal } from "@/components/services/BookServiceModal";
import { ServiceCard } from "@/components/services/ServiceCard";
import { useAuthStore } from "@/store/authStore";
import { useWishlistStore } from "@/store/wishlistStore";
import type { ServiceDetail, VendorOffering } from "@/store/serviceStore";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";
const FALLBACK_IMAGE = "/placeholder-product.png";

const PRICING_LABELS: Record<string, string> = {
  hourly: "/ hr",
  flat: "flat",
  project: "/ project",
  milestone: "milestone",
};

function StarDisplay({ rating, count }: { rating: string | null; count: number }) {
  const value = rating ? parseFloat(rating) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= Math.round(value) ? "fill-amber-400 text-amber-400" : "fill-zinc-200 text-zinc-200"}
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-zinc-950">{value > 0 ? value.toFixed(1) : "N/A"}</span>
      {count > 0 && <span className="text-sm text-zinc-500">({count} reviews)</span>}
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-zinc-50/50 animate-pulse">
      <div className="h-14 bg-white border-b border-zinc-200" />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-4 w-48 bg-zinc-200 rounded mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="h-80 bg-zinc-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-zinc-200 rounded" />
            <div className="h-4 w-full bg-zinc-200 rounded" />
            <div className="h-4 w-5/6 bg-zinc-200 rounded" />
            <div className="h-16 w-full bg-zinc-200 rounded-xl mt-6" />
            <div className="h-12 w-1/3 bg-zinc-200 rounded mt-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { isAuthenticated, user, isLoading: authLoading } = useAuthStore();

  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [selectedOffering, setSelectedOffering] = useState<VendorOffering | null>(null);

  // User location and saved address states
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [savedAddress, setSavedAddress] = useState<{ latitude: number; longitude: number; address: string; city: string } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Related services state
  const [relatedServices, setRelatedServices] = useState<any[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // Wishlist state
  const wishlistItems = useWishlistStore((state) => state.items);
  const addItem = useWishlistStore((state) => state.addItem);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);
  const isSaved = wishlistItems.some((item) => item.itemType === "service" && item.serviceId === id);
  const [savingWishlist, setSavingWishlist] = useState(false);

  // Load user profile saved address
  useEffect(() => {
    if (!user) return;
    async function loadAddress() {
      try {
        const res = await fetch(`${API_BASE}/api/users/profile`, {
          headers: { "Content-Type": "application/json", "x-request-from": "client" },
          credentials: "include"
        });
        if (res.ok) {
          const json = await res.json();
          const addr = json.data?.address;
          if (addr && addr.latitude && addr.longitude) {
            const parsedLat = parseFloat(addr.latitude);
            const parsedLng = parseFloat(addr.longitude);
            if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
              const addressInfo = {
                latitude: parsedLat,
                longitude: parsedLng,
                address: addr.address || "",
                city: addr.city || ""
              };
              setSavedAddress(addressInfo);
              setUserLocation({
                lat: parsedLat,
                lng: parsedLng,
                label: `${addr.address || ""}, ${addr.city || ""}`
              });
            }
          }
        }
      } catch (err) {
        console.error("Error loading profile address:", err);
      }
    }
    loadAddress();
  }, [user]);

  // Load service details (re-fetches when location changes to rank offerings)
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        let url = `${API_BASE}/api/services/${id}`;
        if (userLocation) {
          url += `?userLat=${userLocation.lat}&userLng=${userLocation.lng}`;
        }
        const res = await fetch(url, {
          cache: "no-store",
          headers: { "Content-Type": "application/json", "x-request-from": "client" },
        });
        if (!res.ok) {
          setService(null);
          setLoading(false);
          return;
        }
        const json = await res.json();
        const data = json.data ?? null;
        if (data && Array.isArray(data.vendor_offerings)) {
          data.vendor_offerings = Array.from(new Map(data.vendor_offerings.map((o: any) => [o.vendor_service_id || o.vendor_id, o])).values());
        }
        setService(data);
      } catch {
        setService(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, userLocation]);

  useEffect(() => {
    if (user) {
      fetchWishlist(true);
    }
  }, [user, fetchWishlist]);

  // Load related services
  useEffect(() => {
    if (!service) return;
    const categoryId = service.category_id;
    const serviceId = service.id;
    if (!categoryId) return;

    async function loadRelated() {
      setLoadingRelated(true);
      try {
        const res = await fetch(`${API_BASE}/api/services?category=${categoryId}&limit=5`, {
          headers: { "Content-Type": "application/json", "x-request-from": "client" },
        });
        if (res.ok) {
          const json = await res.json();
          const list = (json.data || []).filter((item: any) => item.id !== serviceId).slice(0, 4);
          setRelatedServices(list);
        }
      } catch (err) {
        console.error("Error loading related services:", err);
      } finally {
        setLoadingRelated(false);
      }
    }
    loadRelated();
  }, [service]);

  function handleBookClick(offering: VendorOffering) {
    if (!isAuthenticated) {
      toast.error("Please sign in to book a service");
      router.push("/login");
      return;
    }
    setSelectedOffering(offering);
    setBookModalOpen(true);
  }

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude, label: "Your current detected location" });
        setIsLocating(false);
        toast.success("Location detected successfully");
      },
      (error) => {
        setIsLocating(false);
        toast.error("Failed to detect location. Please permit GPS permissions.");
        console.error("Geolocation error:", error);
      }
    );
  }

  const handleSaveToWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to save services to your wishlist");
      router.push("/login");
      return;
    }
    setSavingWishlist(true);
    try {
      if (isSaved) {
        const success = await removeItem(`service:${id}`);
        if (success) {
          toast.success("Removed from wishlist");
        } else {
          toast.error("Failed to remove from wishlist");
        }
      } else {
        const lowestPriceOffering = service?.vendor_offerings?.[0];
        const startingPrice = lowestPriceOffering ? parseFloat(lowestPriceOffering.price) : 0;
        const success = await addItem({
          itemType: "service",
          productId: `service:${id}`,
          serviceId: id,
          productName: service?.name || "",
          description: service?.description || "",
          image: service?.category_image || FALLBACK_IMAGE,
          vendorId: lowestPriceOffering?.vendor_id || null,
          vendorName: lowestPriceOffering?.company_name || "",
          price: startingPrice,
          moq: lowestPriceOffering?.moq || 1,
          stockQuantity: 1,
        });
        if (success) {
          toast.success("Saved to wishlist");
        } else {
          toast.error("Failed to save to wishlist");
        }
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSavingWishlist(false);
    }
  };

  if (loading || authLoading) return <SkeletonLoader />;

  if (!service) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-100">
          <Wrench size={36} className="text-zinc-400" strokeWidth={1.5} />
        </div>
        <h1 className="text-xl font-semibold text-zinc-900">Service Not Found</h1>
        <p className="text-sm text-zinc-500 max-w-sm">
          This service is no longer available or has been removed.
        </p>
        <Link
          href="/services"
          className="mt-2 rounded-lg bg-[#1d4ed8] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1e40af] transition-colors"
        >
          Browse All Services
        </Link>
      </div>
    );
  }

  // Calculate rating distributions
  const reviews = service.reviews || [];
  const totalReviews = reviews.length;
  const ratingDistribution = [0, 0, 0, 0, 0]; // index 0=5star, 1=4star, etc.
  if (totalReviews > 0) {
    reviews.forEach((r) => {
      const rounded = Math.round(r.rating);
      const idx = Math.min(Math.max(5 - rounded, 0), 4);
      ratingDistribution[idx]++;
    });
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 text-zinc-900">
      <main>
        {/* Breadcrumbs */}
        <section className="border-b border-zinc-200 bg-white">
          <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <nav className="text-xs text-zinc-500" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 flex-wrap">
                <li><Link href="/" className="hover:text-[#1d4ed8] transition-colors">Home</Link></li>
                <li className="text-zinc-300"><ChevronRight size={12} /></li>
                <li><Link href="/services" className="hover:text-[#1d4ed8] transition-colors">Services</Link></li>
                <li className="text-zinc-300"><ChevronRight size={12} /></li>
                <li className="text-zinc-800 font-semibold line-clamp-1 max-w-xs">{service.name}</li>
              </ol>
            </nav>
          </div>
        </section>

        {/* Hero Section */}
        <section className="bg-white border-b border-zinc-200">
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Media Gallery */}
              <div className="rounded-2xl border border-zinc-200 p-2 bg-zinc-50/50">
                <ServiceMediaGallery media={service.media} fallbackImage={service.category_image} />
              </div>

              {/* Service Info */}
              <div className="flex flex-col">
                <div className="space-y-4">
                  {service.category_label && (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#1d4ed8]">
                      <Tag size={12} />
                      {service.category_label}
                    </div>
                  )}

                  <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 leading-tight">
                    {service.name}
                  </h1>

                  <StarDisplay rating={service.rating} count={service.review_count} />

                  {service.description && (
                    <p className="text-sm text-zinc-600 leading-relaxed pt-2 border-t border-zinc-100">{service.description}</p>
                  )}

                  {/* Highlight Specs Card */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center gap-3 rounded-2xl border border-zinc-150 bg-white p-4 shadow-sm">
                      <div className="rounded-xl bg-blue-50 p-2.5 text-[#1d4ed8]">
                        <Users size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 font-medium">Verified Vendors</p>
                        <p className="text-base font-bold text-zinc-950">{service.vendor_offerings.length}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-zinc-150 bg-white p-4 shadow-sm">
                      <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                        <ShoppingBag size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 font-medium">Total Reviews</p>
                        <p className="text-base font-bold text-zinc-950">{service.review_count}</p>
                      </div>
                    </div>
                  </div>

                  {service.vendor_offerings.length > 0 && (
                    <div className="rounded-2xl border border-[#b3c5f2] bg-blue-50/30 p-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          Starting Price
                        </p>
                        <p className="text-3xl font-extrabold text-[#1d4ed8] mt-1">
                          ₹{parseFloat(service.vendor_offerings[0].price).toLocaleString("en-IN")}
                          <span className="text-sm font-normal text-zinc-500 ml-1.5">
                            {PRICING_LABELS[service.vendor_offerings[0].pricing_type] ?? service.vendor_offerings[0].pricing_type}
                          </span>
                        </p>
                      </div>
                      <div className="hidden sm:block">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                          <CheckCircle2 size={12} />
                          Best Rate
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Panel */}
                <div className="mt-8 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row gap-3">
                  {service.vendor_offerings.length > 0 ? (
                    <button
                      onClick={() => handleBookClick(service.vendor_offerings[0])}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1d4ed8] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#1e40af] hover:shadow-md transition-all"
                    >
                      <ShoppingBag size={18} />
                      Book Now
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-100 px-5 py-3.5 text-sm font-semibold text-zinc-400 border border-zinc-200 cursor-not-allowed"
                    >
                      No Providers Yet
                    </button>
                  )}

                  <button
                    onClick={handleSaveToWishlist}
                    disabled={savingWishlist}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold transition-all border ${
                      isSaved
                        ? "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 hover:shadow-sm sm:w-auto"
                        : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 hover:shadow-sm sm:w-auto"
                    } disabled:opacity-75 flex-1 sm:flex-none`}
                  >
                    {savingWishlist ? (
                      <Loader2 size={18} className="animate-spin text-zinc-500" />
                    ) : (
                      <Heart size={18} className={isSaved ? "fill-rose-600 text-rose-600" : ""} />
                    )}
                    {isSaved ? "Saved" : "Save to Wishlist"}
                  </button>

                  <Link
                    href="/services/bookings"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-3.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 hover:shadow-sm transition-all flex-1 sm:flex-none"
                  >
                    My Bookings
                    <ArrowRight size={16} />
                  </Link>
                </div>

                {/* MTWO service guarantee section */}
                <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 space-y-3 shadow-inner">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                    <ShieldCheck size={12} className="text-[#1d4ed8]" />
                    MTWO Service Guarantee
                  </h4>
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-zinc-900">Vetted Providers</p>
                      <p className="text-[10px] text-zinc-500 leading-relaxed">Fully registered business credentials verified.</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-zinc-900">Milestone Escrow</p>
                      <p className="text-[10px] text-zinc-500 leading-relaxed">Payments protected until service completion.</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-zinc-900">Quality Assured</p>
                      <p className="text-[10px] text-zinc-500 leading-relaxed">Dispute resolution and dedicated support team.</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Specifications Grid */}
        {service.specifications && Object.keys(service.specifications).length > 0 && (
          <section className="bg-white border-b border-zinc-200">
            <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <h3 className="text-lg font-bold tracking-tight text-zinc-950 mb-6">
                Technical Specifications & Capabilities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 rounded-2xl border border-zinc-200 bg-zinc-50/40 p-6 sm:p-8">
                {Object.entries(service.specifications).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center py-3 border-b border-zinc-200/60 text-sm">
                    <span className="font-semibold text-zinc-500 text-xs uppercase tracking-wider">{key}</span>
                    <span className="font-bold text-zinc-900 text-right pl-4">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Service Availability & Providers comparing */}
        <section className="bg-white border-b border-zinc-200">
          <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            
            {/* Service Availability Card */}
            <div className="border border-zinc-200 bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
                <MapPin size={18} className="text-blue-600" />
                <h3 className="text-lg font-semibold text-zinc-900">Service Availability</h3>
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
                          {savedAddress && userLocation.lat === savedAddress.latitude && userLocation.lng === savedAddress.longitude
                            ? "Providing service at your profile address"
                            : "Providing service at selected location"
                          }
                        </p>
                        <p className="text-sm text-zinc-500 mt-0.5">{userLocation.label}</p>
                        <p className="text-xs text-zinc-400 mt-1">
                          GPS: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
                      {savedAddress && (userLocation.lat !== savedAddress.latitude || userLocation.lng !== savedAddress.longitude) && (
                        <button
                          onClick={() => {
                            setUserLocation({
                              lat: savedAddress.latitude,
                              lng: savedAddress.longitude,
                              label: `${savedAddress.address}, ${savedAddress.city}`
                            });
                            toast.success("Switched to saved delivery address");
                          }}
                          className="text-xs font-bold text-blue-600 hover:underline transition-colors mr-2"
                        >
                          Use Saved Address
                        </button>
                      )}
                      <button
                        onClick={handleUseCurrentLocation}
                        disabled={isLocating}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors disabled:opacity-60 bg-white shadow-sm"
                      >
                        {isLocating ? <Loader2 size={14} className="animate-spin" /> : <Crosshair size={14} />}
                        {isLocating ? "Detecting..." : "Detect Location"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center py-4">
                    <MapPin size={32} className="text-zinc-300 mb-3" />
                    <p className="text-sm font-semibold text-zinc-900 mb-1">Check service availability at your site</p>
                    <p className="text-xs text-zinc-500 mb-4 max-w-sm">
                      Enter coordinates or detect location to verify local vendor availability and see ranked transport distance rates.
                    </p>
                    <button
                      onClick={handleUseCurrentLocation}
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

            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-950">
                  Compare Verified Service Providers
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Bookings are protected under the milestone escrow agreement. Rates are ranked by price and distance.
                </p>
              </div>
              <span className="hidden sm:inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-800">
                {service.vendor_offerings.length} supply options
              </span>
            </div>

            {service.vendor_offerings.length > 0 ? (
              <div className="bg-white rounded-2xl border-2 border-[#1d4ed8] shadow-sm overflow-hidden ring-4 ring-blue-50 mb-12">
                <div className="px-6 py-4 flex items-center justify-between bg-blue-50/30 border-b border-zinc-150">
                  <div className="flex items-center gap-2.5">
                    <Layers size={16} className="text-[#1d4ed8]" />
                    <span className="text-sm sm:text-base font-bold text-[#1d4ed8]">
                      {service.name} — ACTIVE SERVICE SELECT
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                      {service.vendor_offerings.length} suppliers
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-zinc-100">
                  {service.vendor_offerings.map((offering, idx) => (
                    <div key={`${offering.vendor_service_id || offering.vendor_id || idx}-${idx}`} className="p-6 hover:bg-zinc-50/50 transition-colors">
                      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                              {idx + 1}
                            </span>
                            <h4 className="font-bold text-zinc-900 text-base">
                              {offering.company_name || `Vendor #${offering.vendor_id.slice(0, 8)}`}
                            </h4>
                            {(offering.city || offering.state) && (
                              <div className="flex items-center gap-1 text-xs text-zinc-500">
                                <MapPin size={12} />
                                <span>{[offering.city, offering.state].filter(Boolean).join(', ')}</span>
                              </div>
                            )}
                            {Number(offering.vendor_rating) > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200/60">
                                <Star size={10} className="fill-amber-400 text-amber-400" />
                                {Number(offering.vendor_rating).toFixed(1)}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
                              <BadgeCheck size={12} className="text-emerald-600" />
                              Verified
                            </span>
                            {idx === 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                                Best Rate
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 rounded-xl">
                              <p className="text-xs text-zinc-500 font-medium">Service Rate</p>
                              <p className="text-base font-bold text-[#1d4ed8] mt-0.5">
                                ₹{parseFloat(offering.price).toLocaleString("en-IN")}
                                <span className="text-xs font-normal text-zinc-500 ml-1">
                                  {PRICING_LABELS[offering.pricing_type] ?? offering.pricing_type}
                                </span>
                              </p>
                            </div>
                            <div className="bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 rounded-xl">
                              <p className="text-xs text-zinc-500 font-medium">Minimum Order (MOQ)</p>
                              <p className="text-base font-semibold text-zinc-800 mt-0.5">{offering.moq || 1} unit(s)</p>
                            </div>
                            <div className="bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 rounded-xl">
                              <p className="text-xs text-zinc-500 font-medium">Site Distance</p>
                              <p className="text-base font-semibold text-zinc-800 mt-0.5">
                                {offering.distance !== null && offering.distance !== undefined
                                  ? `${offering.distance.toFixed(1)} km away`
                                  : "Regional Provider"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 lg:w-auto self-stretch lg:self-center justify-end pt-4 lg:pt-0 border-t border-zinc-100 lg:border-0">
                          <div className="text-left sm:text-right">
                            <p className="text-xs text-zinc-400 font-medium">Estimated Total</p>
                            <p className="text-xl font-extrabold text-zinc-900 mt-0.5">
                              ₹{parseFloat(offering.price).toLocaleString("en-IN")}
                            </p>
                          </div>
                          <button
                            onClick={() => handleBookClick(offering)}
                            className="px-6 py-3 bg-[#1d4ed8] hover:bg-blue-800 text-white font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                          >
                            <ShoppingBag size={16} />
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-10 text-center max-w-xl mx-auto shadow-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                  <Building2 size={24} />
                </div>
                <h3 className="text-base font-bold text-zinc-900">No active providers found</h3>
                <p className="mt-1 text-sm text-zinc-500 max-w-sm mx-auto leading-normal">
                  No verified vendors are currently offering this service in your region. Check back soon or set another location.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section className="border-b border-zinc-200 bg-zinc-50/50">
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-2">Customer Reviews</h2>
                <p className="text-zinc-600 text-sm">Feedback from verified buyers and suppliers</p>
              </div>
              <Link
                href="/services/bookings"
                className="text-sm font-semibold text-[#1d4ed8] hover:underline flex items-center gap-1.5"
              >
                Write a Review
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left Column: Ratings Summary & Distribution */}
              <div className="lg:col-span-1 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-zinc-900 mb-4">Rating Breakdown</h3>

                <div className="flex items-center gap-4 mb-6">
                  <div className="text-center p-3 bg-blue-50/50 rounded-2xl border border-blue-100/30 min-w-[90px]">
                    <span className="text-4xl font-extrabold text-zinc-900">
                      {parseFloat(service.rating || "0.0").toFixed(1)}
                    </span>
                    <p className="text-[11px] text-zinc-500 font-bold mt-0.5">out of 5</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={star <= Math.round(parseFloat(service.rating || "0")) ? "fill-amber-400 text-amber-400" : "fill-zinc-100 text-zinc-200"}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-zinc-500 font-medium">
                      {totalReviews} customer reviews
                    </p>
                  </div>
                </div>

                {/* Bar Chart Breakdown */}
                <div className="space-y-3 pt-4 border-t border-zinc-100">
                  {[5, 4, 3, 2, 1].map((stars, idx) => {
                    const count = ratingDistribution[idx];
                    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                    return (
                      <div key={stars} className="flex items-center gap-3 text-sm">
                        <span className="w-3 text-zinc-600 font-semibold text-xs">{stars}</span>
                        <Star className="fill-amber-400 text-amber-400 shrink-0" size={13} />
                        <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="w-8 text-right text-zinc-400 text-xs font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Reviews List */}
              <div className="lg:col-span-2">
                {reviews.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-zinc-200 rounded-2xl bg-white text-center">
                    <div className="p-4 bg-zinc-50 rounded-full text-zinc-400 mb-4">
                      <MessageSquare size={32} />
                    </div>
                    <h4 className="text-lg font-semibold text-zinc-900 mb-1">No reviews yet</h4>
                    <p className="text-zinc-500 text-sm max-w-sm mb-6">
                      Be the first to share your thoughts on this service! Submit reviews for your recent bookings to help other buyers.
                    </p>
                    <Link
                      href="/services/bookings"
                      className="px-5 py-2.5 bg-[#1d4ed8] text-white text-sm font-semibold rounded-lg hover:bg-blue-800 shadow-md transition-colors"
                    >
                      View My Bookings
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="p-6 border border-zinc-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-zinc-900">{rev.reviewer_name}</span>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
                                <BadgeCheck size={12} className="text-emerald-600" />
                                Verified Booking
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={14}
                                  className={star <= rev.rating ? "fill-amber-400 text-amber-400" : "fill-zinc-100 text-zinc-200"}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-zinc-400 font-medium">
                              {new Date(rev.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          </div>
                        </div>
                        {rev.review_title && <p className="font-bold text-zinc-900 text-sm mb-1">{rev.review_title}</p>}
                        {rev.review_text && <p className="text-zinc-600 text-sm leading-relaxed">{rev.review_text}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Related Services */}
        <section className="bg-white">
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h3 className="text-xl font-bold tracking-tight text-zinc-950">Related Services</h3>
              <p className="text-xs text-zinc-500 mt-1">Check out similar professional industrial services in the MTWO marketplace.</p>
            </div>

            {loadingRelated ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="h-64 rounded-xl border border-zinc-200 bg-white p-4 animate-pulse space-y-4">
                    <div className="h-32 bg-zinc-200 rounded-lg w-full" />
                    <div className="h-4 bg-zinc-200 rounded w-2/3" />
                    <div className="h-4 bg-zinc-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : relatedServices.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {relatedServices.map((item) => (
                  <ServiceCard key={item.id} {...item} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-zinc-50 p-6 text-center text-xs text-zinc-500">
                No related services found in this category.
              </div>
            )}
          </div>
        </section>
      </main>

      {selectedOffering && (
        <BookServiceModal
          isOpen={bookModalOpen}
          onClose={() => { setBookModalOpen(false); setSelectedOffering(null); }}
          offering={selectedOffering}
          serviceName={service.name}
        />
      )}
    </div>
  );
}
