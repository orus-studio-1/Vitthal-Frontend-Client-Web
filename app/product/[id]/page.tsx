"use client";

/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ProductImageGallery from "@/components/ProductImageGallery";
import { useCartStore } from "@/store/cartStore";
import { useQuotationCartStore } from "@/store/quotationCartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { toast } from "sonner";
import {
  ChevronRight,
  Package,
  Heart,
  ShoppingCart,
  ArrowRight,
  Loader2,
  Star,
  BadgeCheck,
  X,
  Building,
  ShieldCheck,
  Truck,
} from "lucide-react";

// Reusable components
import VariantSelector from "@/components/Product/VariantSelector";
import KeyPropertiesAndSpecs from "@/components/Product/KeyPropertiesAndSpecs";
import SupplierComparison from "@/components/Product/SupplierComparison";
import ProductReviews from "@/components/Product/ProductReviews";
import RelatedProducts from "@/components/Product/RelatedProducts";
import LatestOrOrderedProducts from "@/components/Product/LatestOrOrderedProducts";

type Vendor = {
  vendor_id: string;
  price: number | string;
  discounted_price?: number | string | null;
  moq: number;
  stock_quantity: number;
  quotation_enabled?: boolean;
  rating: number;
  review_count: number;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  state: string | null;
  gst_percentage?: number | string;
};

type RankedVendor = Vendor & {
  distance: number | null;
  price_score: number;
  distance_score: number;
  review_score: number;
  total_score: number;
  rank: number;
};

type ProductReview = {
  review_id: string;
  rating: number;
  review_title: string;
  review_text: string;
  images: string[];
  verified_purchase: boolean;
  helpful_count: number;
  review_date: string;
  customer_name: string;
  vendor_id: string;
  rating_label: string;
};

type ReviewStats = {
  total_reviews: number;
  avg_rating: string;
  rating_distribution: Record<number, number>;
};

type ProductImage = {
  image_url: string;
  is_primary: boolean;
  display_order: number;
  media_type?: "image" | "video" | null;
  product_variant_id?: string | null;
};

type ProductDetail = {
  product_id: string;
  product_name: string;
  description: string;
  category: string;
  product_type: string;
  grade?: string;
  material?: string;
  application?: string;
  standard?: string;
  rating: number;
  review_count: number;
  quotation_limit?: number | null;
  specifications: Record<string, string | number>;
  attributes?: Record<string, string | number>;
  images: ProductImage[];
  vendors: Vendor[];
  variants?: Array<{
    variant_id: string;
    sku: string | null;
    variant_name?: string | null;
    properties: Record<string, string>;
    approval_status: string;
    vendors: Vendor[];
  }>;
};

type RelatedProduct = {
  product_id: string;
  product_name: string;
  primary_image?: string | null;
  seller_count: number;
  rating: number;
  review_count?: number;
  min_price?: number;
  max_price?: number;
  min_moq?: number;
};

const PRODUCTS_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/products`
  : "http://localhost:9000/api/products";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

async function fetchProduct(id: string): Promise<ProductDetail | null> {
  const url = `${PRODUCTS_BASE_URL}/getProductById/${id}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.error("Error fetching individual product:", err);
    return null;
  }
}

async function fetchRankedVendors(
  productId: string,
  lat: number,
  lng: number,
  variantId?: string
): Promise<RankedVendor[]> {
  let url = `${PRODUCTS_BASE_URL}/getRankedVendors/${productId}?userLat=${lat}&userLng=${lng}`;
  if (variantId) {
    url += `&variantId=${variantId}`;
  }
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error("Error fetching ranked vendors:", err);
    return [];
  }
}

async function fetchRelatedProducts(productId: string): Promise<RelatedProduct[]> {
  const url = `${PRODUCTS_BASE_URL}/getRelatedProducts/${productId}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error("Error fetching related products:", err);
    return [];
  }
}

async function fetchProductReviews(
  productId: string,
  page: number = 0,
  limit: number = 5
): Promise<{
  reviews: ProductReview[];
  stats: ReviewStats | null;
  pagination: { has_more: boolean };
} | null> {
  const url = `${PRODUCTS_BASE_URL}/getProductReviews/${productId}?page=${page}&limit=${limit}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.error("Error fetching product reviews:", err);
    return null;
  }
}

async function fetchClientAddress(): Promise<{
  latitude: number;
  longitude: number;
  address: string;
  city: string;
} | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/client/clientDetails`, {
      credentials: "include",
      headers: { "Content-Type": "application/json", "x-request-from": "client" },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json.data;
    const primaryAddr = data?.primary_address || data?.addresses?.[0] || null;
    if (primaryAddr?.latitude != null && primaryAddr?.longitude != null) {
      return {
        latitude: Number(primaryAddr.latitude),
        longitude: Number(primaryAddr.longitude),
        address: primaryAddr.address || "",
        city: primaryAddr.city || "",
      };
    }
    return null;
  } catch {
    return null;
  }
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const addItem = useCartStore((s) => s.addItem);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const addQuotationItem = useQuotationCartStore((s) => s.addItem);
  const fetchQuotationCart = useQuotationCartStore((s) => s.fetchCart);
  const addToWishlist = useWishlistStore((s) => s.addItem);
  const totalItems = useCartStore((s) => s.items.length);
  const [addingVendorId, setAddingVendorId] = useState<string | null>(null);
  const [savingWishlist, setSavingWishlist] = useState(false);

  // Location & Ranking state
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    label: string;
  } | null>(null);
  const [savedAddress, setSavedAddress] = useState<{
    latitude: number;
    longitude: number;
    address: string;
    city: string;
  } | null>(null);
  const [rankedVendors, setRankedVendors] = useState<RankedVendor[]>([]);
  const rawDisplayVendors = product
    ? ((product.variants && product.variants.length > 0)
      ? (rankedVendors.length > 0 ? rankedVendors : (selectedVariant?.vendors || []))
      : (rankedVendors.length > 0 ? rankedVendors : (product.vendors || [])))
    : [];
  const displayVendors = Array.from(
    new Map(rawDisplayVendors.map((v: any, index: number) => [v.vendor_id || v.id || `fallback-${index}`, v])).values()
  ) as any[];
  const [isLocating, setIsLocating] = useState(false);
  const [isRanking, setIsRanking] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsStats, setReviewsStats] = useState<ReviewStats | null>(null);
  const [reviewsPage, setReviewsPage] = useState<number>(0);
  const [hasMoreReviews, setHasMoreReviews] = useState<boolean>(false);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState<boolean>(false);
  const [activeReviewImage, setActiveReviewImage] = useState<string | null>(null);

  // Fetch reviews (page 0)
  useEffect(() => {
    if (!id) return;
    async function loadReviews() {
      setLoadingReviews(true);
      const data = await fetchProductReviews(id, 0, 5);
      if (data) {
        setReviews(data.reviews || []);
        setReviewsStats(data.stats || null);
        setHasMoreReviews(data.pagination?.has_more || false);
      } else {
        setReviews([]);
        setReviewsStats(null);
        setHasMoreReviews(false);
      }
      setReviewsPage(0);
      setLoadingReviews(false);
    }
    loadReviews();
  }, [id]);

  const handleLoadMoreReviews = async () => {
    if (loadingMoreReviews || !hasMoreReviews) return;
    setLoadingMoreReviews(true);
    const nextPage = reviewsPage + 1;
    const data = await fetchProductReviews(id, nextPage, 5);
    if (data) {
      setReviews((prev) => [...prev, ...(data.reviews || [])]);
      setHasMoreReviews(data.pagination?.has_more || false);
      setReviewsPage(nextPage);
    }
    setLoadingMoreReviews(false);
  };

  useEffect(() => {
    async function loadProduct() {
      const data = await fetchProduct(id);
      setProduct(data);
      if (data?.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0]);
        setSelectedSpecs(data.variants[0].properties || {});
        const initialQuantities: Record<string, number> = {};
        data.variants.forEach((variant: any) => {
          (variant.vendors || []).forEach((v: any) => {
            const key = `${variant.variant_id}-${v.vendor_id}`;
            initialQuantities[key] = v.moq || 1;
          });
        });
        setQuantities(initialQuantities);
      } else if (data?.vendors) {
        const initialQuantities: Record<string, number> = {};
        data.vendors.forEach((v) => {
          initialQuantities[`default-${v.vendor_id}`] = v.moq || 1;
        });
        setQuantities(initialQuantities);
      }
      setLoading(false);
    }
    loadProduct();
  }, [id]);

  // Try to get user's saved address on mount
  useEffect(() => {
    async function loadAddress() {
      const addr = await fetchClientAddress();
      if (addr) {
        setSavedAddress(addr);
        setUserLocation({
          lat: addr.latitude,
          lng: addr.longitude,
          label: `${addr.address}, ${addr.city}`,
        });
      }
    }
    loadAddress();
  }, []);

  // When user location or selected variant is available, fetch ranked vendors
  useEffect(() => {
    if (!userLocation || !id) {
      setRankedVendors([]);
      return;
    }
    const { lat, lng } = userLocation;
    const variantId = selectedVariant?.variant_id;
    async function loadRanking() {
      setRankedVendors([]); // Clear stale ranked vendors immediately
      setIsRanking(true);
      try {
        const ranked = await fetchRankedVendors(id, lat, lng, variantId);
        setRankedVendors(ranked);
      } catch (err) {
        console.error("Error setting ranked vendors:", err);
      } finally {
        setIsRanking(false);
      }
    }
    loadRanking();
  }, [userLocation, id, selectedVariant]);

  // Fetch related products
  useEffect(() => {
    if (!id) return;
    async function loadRelated() {
      setIsLoadingRelated(true);
      const related = await fetchRelatedProducts(id);
      setRelatedProducts(related);
      setIsLoadingRelated(false);
    }
    loadRelated();
  }, [id]);

  // Helper to filter product.images by product_variant_id === selectedVariant.variant_id
  const getActiveImages = () => {
    if (!product) return [];
    if (!selectedVariant) return product.images || [];

    const variantImages = (product.images || []).filter(
      (img: any) => img.product_variant_id === selectedVariant.variant_id
    );

    if (variantImages.length > 0) {
      return variantImages;
    }

    const globalImages = (product.images || []).filter((img: any) => !img.product_variant_id);

    if (globalImages.length > 0) {
      return globalImages;
    }

    return product.images || [];
  };

  // Check if a value is defined and not null/undefined/empty string
  const isValidValue = (val: any) => {
    if (val === null || val === undefined) return false;
    const str = String(val).trim();
    return str !== "" && str.toLowerCase() !== "null" && str.toLowerCase() !== "undefined";
  };

  // Helper to get resolved specifications/attributes dynamically from global or variant properties
  const getResolvedProperty = (key: string) => {
    let val: any = undefined;
    if (selectedVariant && selectedVariant.properties) {
      const foundKey = Object.keys(selectedVariant.properties).find(
        (k) => k.toLowerCase() === key.toLowerCase()
      );
      if (foundKey) val = selectedVariant.properties[foundKey];
    }
    if (!isValidValue(val) && product) {
      const globalSpecs = {
        ...(product.specifications || {}),
        ...(product.attributes || {}),
      };
      const foundKey = Object.keys(globalSpecs).find((k) => k.toLowerCase() === key.toLowerCase());
      if (foundKey) {
        val = globalSpecs[foundKey];
      } else if (key.toLowerCase() === "material") {
        val = product.material;
      } else if (key.toLowerCase() === "grade") {
        val = product.grade;
      } else if (key.toLowerCase() === "application") {
        val = product.application;
      } else if (key.toLowerCase() === "standard") {
        val = product.standard;
      }
    }
    return isValidValue(val) ? val : undefined;
  };

  // Helper to get key properties (attributes & variant properties)
  const getKeyProperties = () => {
    if (!product) return {};

    const attrs = { ...(product.attributes || {}) };

    if (selectedVariant && selectedVariant.properties) {
      Object.entries(selectedVariant.properties).forEach(([key, val]) => {
        attrs[key] = val as string | number;
      });
    }

    const result: Record<string, string | number> = {};
    Object.entries(attrs).forEach(([key, val]) => {
      if (["material", "grade", "application", "standard"].includes(key.toLowerCase())) {
        return;
      }
      if (isValidValue(val)) {
        result[key] = val;
      }
    });

    return result;
  };

  // Helper to get technical specifications
  const getTechnicalSpecifications = () => {
    if (!product) return {};
    const specs = product.specifications || {};
    const result: Record<string, string | number> = {};
    Object.entries(specs).forEach(([key, val]) => {
      if (isValidValue(val)) {
        result[key] = val;
      }
    });
    return result;
  };

  const handleSpecChange = (key: string, value: string) => {
    const updatedSpecs = { ...selectedSpecs, [key]: value };
    setSelectedSpecs(updatedSpecs);

    if (product?.variants) {
      let match = product.variants.find((v) =>
        Object.entries(updatedSpecs).every(([k, val]) => v.properties[k] === val)
      );

      if (!match) {
        match = product.variants.find((v) => v.properties[key] === value);
      }

      if (match) {
        setSelectedVariant(match);
        setSelectedSpecs(match.properties || {});
      }
    }
  };

  const handleSelectVariant = (variant: any) => {
    setSelectedVariant(variant);
    setSelectedSpecs(variant.properties || {});
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude, label: "Current Location" });
        setIsLocating(false);
        toast.success("Location detected successfully");
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Location permission denied. Please enable it in browser settings.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information unavailable.");
            break;
          case error.TIMEOUT:
            toast.error("Location request timed out.");
            break;
          default:
            toast.error("An unknown error occurred while getting location.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const updateQuantity = (
    vendorId: string,
    moq: number,
    delta: number,
    stock: number,
    variantId?: string
  ) => {
    const key = `${variantId || "default"}-${vendorId}`;
    setQuantities((prev) => {
      const currentQty = prev[key] !== undefined ? prev[key] : moq || 1;
      const newQty = currentQty + delta;
      if (newQty < moq) {
        toast.error(`Minimum order quantity is ${moq}`);
        return prev;
      }
      if (stock && newQty > stock) {
        toast.error(`Maximum available stock is ${stock}`);
        return prev;
      }
      return { ...prev, [key]: newQty };
    });
  };

  const handleAddToCart = async (vendor: Vendor, variantId?: string) => {
    if (!product) return;
    const resolvedVariantId = variantId || selectedVariant?.variant_id;
    const qtyKey = `${resolvedVariantId || "default"}-${vendor.vendor_id}`;
    const quantity = quantities[qtyKey] || vendor.moq || 1;
    const quotationLimit = product.quotation_limit ? Number(product.quotation_limit) : null;
    const requiresQuotation = quotationLimit !== null && quantity >= quotationLimit;

    const rawPrice =
      typeof vendor.price === "string" ? parseFloat(vendor.price) || 0 : vendor.price || 0;
    const discountedPrice =
      vendor.discounted_price !== null && vendor.discounted_price !== undefined
        ? typeof vendor.discounted_price === "string"
          ? parseFloat(vendor.discounted_price)
          : vendor.discounted_price
        : null;
    const activePrice =
      discountedPrice !== null && discountedPrice < rawPrice ? discountedPrice : rawPrice;

    setAddingVendorId(vendor.vendor_id);

    if (requiresQuotation) {
      const quoteSuccess = await addQuotationItem({
        productId: product.product_id,
        productVariantId: resolvedVariantId,
        productName: product.product_name,
        image: product.images?.[0]?.image_url || "",
        price: activePrice,
        moq: vendor.moq,
        quotationMinQty: quotationLimit,
        quotationEnabled: true,
        quantity,
        vendorId: vendor.vendor_id,
        vendorName: "",
      });
      if (quoteSuccess) {
        toast.success("Added to quotation cart");
        await fetchQuotationCart(true);
      } else {
        toast.error("Failed to add to quotation cart");
      }
      setAddingVendorId(null);
      return;
    }

    const success = await addItem({
      productId: product.product_id,
      productVariantId: resolvedVariantId,
      productName: product.product_name,
      image:
        product.images?.find((img) => img.is_primary)?.image_url ||
        product.images?.[0]?.image_url ||
        "",
      price: activePrice,
      moq: vendor.moq || 1,
      quantity,
      vendorId: vendor.vendor_id,
      vendorName: `Vendor #${vendor.vendor_id.slice(0, 8)}`,
    });

    setAddingVendorId(null);

    if (success) {
      toast.success(
        `Added ${quantity} units to cart from Vendor #${vendor.vendor_id.slice(0, 8)}`
      );
      await fetchCart();
    } else {
      toast.error("Failed to add item. Please login.");
    }
  };

  const handleSaveToWishlist = async () => {
    if (!product) return;

    const preferredVendor = displayVendors[0];
    setSavingWishlist(true);

    const rawPrice = preferredVendor
      ? typeof preferredVendor.price === "string"
        ? parseFloat(preferredVendor.price) || 0
        : preferredVendor.price || 0
      : 0;
    const discountedPrice =
      preferredVendor &&
      preferredVendor.discounted_price !== null &&
      preferredVendor.discounted_price !== undefined
        ? typeof preferredVendor.discounted_price === "string"
          ? parseFloat(preferredVendor.discounted_price)
          : preferredVendor.discounted_price
        : null;
    const activePrice =
      discountedPrice !== null && discountedPrice < rawPrice ? discountedPrice : rawPrice;

    const success = await addToWishlist({
      productId: product.product_id,
      productVariantId: selectedVariant?.variant_id,
      productName: product.product_name,
      description: product.description,
      image:
        product.images?.find((img) => img.is_primary)?.image_url ||
        product.images?.[0]?.image_url ||
        "",
      vendorId: preferredVendor?.vendor_id || null,
      vendorName: preferredVendor ? `Vendor #${preferredVendor.vendor_id.slice(0, 8)}` : "",
      price: activePrice,
      moq: preferredVendor?.moq || 1,
      stockQuantity: preferredVendor?.stock_quantity || 0,
    });

    setSavingWishlist(false);

    if (success) {
      toast.success(`${product.product_name} saved to wishlist`);
    } else {
      toast.error("Failed to save item to wishlist");
    }
  };

  const getPriceRange = () => {
    const vendors = displayVendors;
    if (!vendors?.length) return null;
    const prices = vendors
      .map((v: any) => {
        const rawPrice = typeof v.price === "string" ? parseFloat(v.price) : v.price;
        const discountedPrice =
          v.discounted_price !== null && v.discounted_price !== undefined
            ? typeof v.discounted_price === "string"
              ? parseFloat(v.discounted_price)
              : v.discounted_price
            : null;
        return discountedPrice !== null && discountedPrice < rawPrice ? discountedPrice : rawPrice;
      })
      .filter((p: number | undefined | null): p is number => !!p && !isNaN(p));
    if (!prices.length) return null;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? `₹${min.toLocaleString()}` : `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-32 w-32 bg-zinc-200 rounded-lg mb-4"></div>
          <div className="h-6 w-48 bg-zinc-200 rounded mb-2"></div>
          <div className="h-4 w-32 bg-zinc-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 flex flex-col">
        <main className="flex-1 flex flex-col items-center justify-center p-8">
          <Package size={64} className="text-zinc-200 mb-4" />
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="text-zinc-500 mb-8">
            The product you are looking for might have been removed or is temporarily unavailable.
          </p>
          <Link
            href="/products"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Browse Products
          </Link>
        </main>
      </div>
    );
  }

  const priceRange = getPriceRange();
  const material = getResolvedProperty("Material");
  const grade = getResolvedProperty("Grade");
  const application = getResolvedProperty("Application");
  const standard = getResolvedProperty("Standard");

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col">
      <main className="flex-1">
        {/* Breadcrumbs */}
        <div className="bg-white border-b border-zinc-200">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <nav className="text-sm flex items-center gap-2 text-zinc-500">
              <Link href="/" className="hover:text-zinc-800 transition-colors">Home</Link>
              <ChevronRight size={14} className="text-zinc-400" />
              <Link href="/products" className="hover:text-zinc-800 transition-colors">Products</Link>
              <ChevronRight size={14} className="text-zinc-400" />
              <span className="text-zinc-800 font-medium truncate max-w-xs">{product.product_name}</span>
            </nav>
          </div>
        </div>

        {/* Product Overview Section */}
        <section className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col lg:flex-row">
            {/* Left: Images Array */}
            <div className="lg:w-1/2 bg-zinc-50/50 p-4 lg:p-6 min-h-[400px] lg:min-h-[600px]">
              <ProductImageGallery images={getActiveImages()} productName={product.product_name} />
            </div>

            {/* Right: Core Details */}
            <div className="lg:w-1/2 p-6 lg:p-8 flex flex-col">
              {/* Category & Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider rounded-full">
                  {product.category}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
                  <BadgeCheck size={12} />
                  Verified Product
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900 mb-3">
                {product.product_name}
              </h1>

              {/* Price Range Display */}
              {priceRange && (
                <div className="mb-4">
                  <p className="text-sm text-zinc-500 mb-1">Price Range (per unit)</p>
                  <p className="text-2xl font-bold text-blue-600">{priceRange}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold uppercase tracking-wider border border-amber-200 shadow-2xs">
                      GST is excluded
                    </span>
                    <span className="text-[11px] text-zinc-400 font-medium">* Prices vary by supplier. MOQ applies.</span>
                  </div>
                </div>
              )}

              {/* Flipkart-Style Grouped Product Variations / Scroller */}
              <VariantSelector
                product={product}
                selectedVariant={selectedVariant}
                selectedSpecs={selectedSpecs}
                onSelectVariant={handleSelectVariant}
                onSpecChange={handleSpecChange}
              />

              {/* Quotation Limit Info */}
              {product.quotation_limit && (
                <div className="mb-4 mt-6 flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <Package size={18} className="text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Quotation Required for Bulk Orders</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Orders of <strong>{product.quotation_limit}+</strong> units require a quotation.
                    </p>
                  </div>
                </div>
              )}

              {/* Product Rating */}
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200 mt-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="fill-amber-400 text-amber-400" size={16} />
                  <span className="font-bold text-amber-900">{product.rating || 0}</span>
                </div>
                <span className="text-sm text-amber-700">
                  {product.review_count || 0} {product.review_count === 1 ? "review" : "reviews"}
                </span>
              </div>

              {/* B2B Trust Indicators */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="flex flex-col items-center p-3 rounded-xl border border-zinc-100 bg-zinc-50/50 text-center">
                  <Building className="text-blue-600 mb-2" size={22} />
                  <p className="text-xs text-zinc-500 font-medium">{displayVendors.length} Suppliers</p>
                </div>
                <div className="flex flex-col items-center p-3 rounded-xl border border-zinc-100 bg-zinc-50/50 text-center">
                  <ShieldCheck className="text-emerald-500 mb-2" size={22} />
                  <p className="text-xs text-zinc-500 font-medium">Quality Assured</p>
                </div>
                <div className="flex flex-col items-center p-3 rounded-xl border border-zinc-100 bg-zinc-50/50 text-center">
                  <Truck className="text-orange-500 mb-2" size={22} />
                  <p className="text-xs text-zinc-500 font-medium">Bulk Delivery</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col lg:flex-row items-stretch gap-3 pt-4 border-t border-zinc-100 mt-auto">
                <button
                  onClick={handleSaveToWishlist}
                  disabled={savingWishlist}
                  className="flex-1 px-6 py-3.5 border border-rose-200 bg-rose-50 text-rose-700 text-sm font-semibold rounded-xl hover:bg-rose-100 hover:shadow-md transition-all text-center flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {savingWishlist ? <Loader2 size={18} className="animate-spin" /> : <Heart size={18} />}
                  {savingWishlist ? "Saving..." : "Save to Wishlist"}
                </button>
                <a
                  href="#vendors-list"
                  className="flex-1 px-6 py-3.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 hover:shadow-lg transition-all text-center flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} />
                  View Suppliers & Order
                </a>
                  <Link
                    href="/cart"
                    className="flex-1 px-6 py-3.5 border-2 border-zinc-200 text-zinc-700 text-sm font-semibold rounded-xl hover:border-zinc-300 hover:bg-zinc-50 transition-all text-center flex items-center justify-center gap-2"
                  >
                  Go to Cart
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Unified Key Properties & Technical Specifications Section */}
        <section className="max-w-7xl mx-auto px-4 pb-12 sm:px-6 lg:px-8">
          <KeyPropertiesAndSpecs
            grade={grade}
            material={material}
            application={application}
            standard={standard}
            keyProperties={getKeyProperties()}
            technicalSpecs={getTechnicalSpecifications()}
          />
        </section>

        {/* Delivery Location & Compare Suppliers Section */}
        <section className="max-w-7xl mx-auto px-4 pb-12 sm:px-6 lg:px-8">
          <SupplierComparison
            product={product}
            selectedVariant={selectedVariant}
            quantities={quantities}
            setQuantities={setQuantities}
            userLocation={userLocation}
            setUserLocation={setUserLocation}
            savedAddress={savedAddress}
            isLocating={isLocating}
            isRanking={isRanking}
            rankedVendors={rankedVendors}
            displayVendors={displayVendors}
            addingVendorId={addingVendorId}
            totalItems={totalItems}
            handleUseCurrentLocation={handleUseCurrentLocation}
            updateQuantity={updateQuantity}
            handleAddToCart={handleAddToCart}
          />
        </section>

        {/* About This Item Description */}
        <section className="max-w-7xl mx-auto px-4 pb-12 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
              <Package size={18} className="text-zinc-500" />
              <h3 className="text-lg font-semibold text-zinc-900">About This Item</h3>
            </div>
            <div className="p-6">
              <p className="text-zinc-750 leading-relaxed text-base">
                {product.description || "No description available for this item."}
              </p>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="max-w-7xl mx-auto px-4 pb-12 sm:px-6 lg:px-8">
          <ProductReviews
            reviews={reviews}
            reviewsStats={reviewsStats}
            rating={product.rating}
            reviewCount={product.review_count}
            hasMoreReviews={hasMoreReviews}
            loadingReviews={loadingReviews}
            loadingMoreReviews={loadingMoreReviews}
            handleLoadMoreReviews={handleLoadMoreReviews}
            activeReviewImage={activeReviewImage}
            setActiveReviewImage={setActiveReviewImage}
          />
        </section>

        {/* Related Products Section */}
        <section className="max-w-7xl mx-auto px-4 pb-12 sm:px-6 lg:px-8">
          <RelatedProducts
            relatedProducts={relatedProducts}
            isLoadingRelated={isLoadingRelated}
            category={product.category}
          />
        </section>

        {/* Latest & Ordered Products Section */}
        <section className="max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8">
          <LatestOrOrderedProducts productsApiUrl={PRODUCTS_BASE_URL} />
        </section>
      </main>

      {/* Lightbox dialog modal */}
      {activeReviewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          onClick={() => setActiveReviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img
              src={activeReviewImage}
              alt="Review attachment"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
            />
            <button
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/85 text-white rounded-full transition-colors focus:outline-none"
              onClick={() => setActiveReviewImage(null)}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}