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
  ShieldCheck,
  Truck,
  Building,
  ShoppingCart,
  Plus,
  Minus,
  Info,
  Layers,
  BadgeCheck,
  Star,
  ArrowRight,
  Loader2,
  Heart,
  MapPin,
  Navigation,
  Crosshair,
  ThumbsUp,
  MessageSquare,
  Calendar,
  X,
} from "lucide-react";

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
  media_type?: 'image' | 'video' | null;
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

async function fetchRankedVendors(productId: string, lat: number, lng: number, variantId?: string): Promise<RankedVendor[]> {
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

async function fetchProductReviews(productId: string, page: number = 0, limit: number = 5): Promise<{ reviews: ProductReview[]; stats: ReviewStats | null; pagination: { has_more: boolean } } | null> {
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

async function fetchClientAddress(): Promise<{ latitude: number; longitude: number; address: string; city: string } | null> {
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
        city: primaryAddr.city || ""
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
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [savedAddress, setSavedAddress] = useState<{ latitude: number; longitude: number; address: string; city: string } | null>(null);
  const [rankedVendors, setRankedVendors] = useState<RankedVendor[]>([]);
  const rawDisplayVendors = product
    ? ((product.variants && product.variants.length > 0)
      ? (rankedVendors.length > 0 ? rankedVendors : (selectedVariant?.vendors || []))
      : (rankedVendors.length > 0 ? rankedVendors : (product.vendors || [])))
    : [];
  const displayVendors = Array.from(
    new Map(rawDisplayVendors.map((v: any) => [v.vendor_id || v.id || Math.random(), v])).values()
  );
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
          label: `${addr.address}, ${addr.city}`
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

  // Helper to find the cheapest vendor price for a given variant.
  const getVariantMinPrice = (variant: any) => {
    const vendors = variant?.vendors || [];
    if (!vendors.length) return null;
    const prices = vendors
      .map((v: any) => {
        const rawPrice = typeof v.price === "string" ? parseFloat(v.price) : v.price;
        const discountedPrice = v.discounted_price !== null && v.discounted_price !== undefined ? (typeof v.discounted_price === "string" ? parseFloat(v.discounted_price) : v.discounted_price) : null;
        return (discountedPrice !== null && discountedPrice < rawPrice) ? discountedPrice : rawPrice;
      })
      .filter((p: number | undefined | null): p is number => !!p && !isNaN(p));
    if (!prices.length) return null;
    return Math.min(...prices);
  };

  // Helper to filter product.images by product_variant_id === selectedVariant.variant_id
  // (falling back to global images where product_variant_id is null/undefined if there are no variant specific images).
  const getActiveImages = () => {
    if (!product) return [];
    if (!selectedVariant) return product.images || [];
    
    const variantImages = (product.images || []).filter(
      (img: any) => img.product_variant_id === selectedVariant.variant_id
    );
    
    if (variantImages.length > 0) {
      return variantImages;
    }
    
    const globalImages = (product.images || []).filter(
      (img: any) => !img.product_variant_id
    );

    if (globalImages.length > 0) {
      return globalImages;
    }

    return product.images || [];
  };

  // Helper to get thumbnail image url for a variant
  const getVariantThumbnail = (variant: any) => {
    if (!product || !product.images) return null;
    const variantImg = product.images.find(
      (img: any) => img.product_variant_id === variant.variant_id
    );
    if (variantImg) return variantImg.image_url;
    
    const primaryImg = product.images.find((img: any) => img.is_primary && !img.product_variant_id);
    if (primaryImg) return primaryImg.image_url;
    
    const firstGlobal = product.images.find((img: any) => !img.product_variant_id);
    if (firstGlobal) return firstGlobal.image_url;
    
    return product.images[0]?.image_url || null;
  };

  // Helper to get price range string for a variant
  const getVariantPriceRange = (variant: any) => {
    const vendors = variant?.vendors || [];
    if (!vendors.length) return "No suppliers";
    const prices = vendors
      .map((v: any) => {
        const rawPrice = typeof v.price === "string" ? parseFloat(v.price) : v.price;
        const discountedPrice = v.discounted_price !== null && v.discounted_price !== undefined ? (typeof v.discounted_price === "string" ? parseFloat(v.discounted_price) : v.discounted_price) : null;
        return (discountedPrice !== null && discountedPrice < rawPrice) ? discountedPrice : rawPrice;
      })
      .filter((p: number | undefined | null): p is number => !!p && !isNaN(p));
    if (!prices.length) return "No suppliers";
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? `₹${min.toLocaleString()}` : `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
  };

  // Check if a value is defined and not null/undefined/empty string/string representation of null
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
        ...(product.attributes || {})
      };
      const foundKey = Object.keys(globalSpecs).find(
        (k) => k.toLowerCase() === key.toLowerCase()
      );
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
    
    // We start with global product attributes
    const attrs = { ...(product.attributes || {}) };
    
    // If a variant is selected, merge variant properties on top of global attributes
    if (selectedVariant && selectedVariant.properties) {
      Object.entries(selectedVariant.properties).forEach(([key, val]) => {
        attrs[key] = val as string | number;
      });
    }

    // Filter out any attributes that are empty or invalid
    const result: Record<string, string | number> = {};
    Object.entries(attrs).forEach(([key, val]) => {
      // Exclude main columns like material/grade/application/standard because they are rendered explicitly at the top
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

  // Helper to get merged specifications/attributes dynamically from global or variant properties
  const getMergedSpecifications = () => {
    if (!product) return {};
    const globalSpecs = {
      ...(product.specifications || {}),
      ...(product.attributes || {})
    };
    if (selectedVariant && selectedVariant.properties) {
      return {
        ...globalSpecs,
        ...selectedVariant.properties
      };
    }
    return globalSpecs;
  };

  const getVariantAttributes = (variantsList: Array<{ properties: Record<string, string> }>) => {
    const attributes: Record<string, Set<string>> = {};
    variantsList.forEach((v) => {
      if (v.properties) {
        Object.entries(v.properties).forEach(([key, val]) => {
          if (!attributes[key]) {
            attributes[key] = new Set<string>();
          }
          attributes[key].add(val);
        });
      }
    });

    const result: Record<string, string[]> = {};
    Object.entries(attributes).forEach(([key, valSet]) => {
      result[key] = Array.from(valSet).sort();
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
            toast.error("Location permission denied. Please enable it in your browser settings.");
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

  const updateQuantity = (vendorId: string, moq: number, delta: number, stock: number, variantId?: string) => {
    const key = `${variantId || 'default'}-${vendorId}`;
    setQuantities((prev) => {
      const currentQty = prev[key] !== undefined ? prev[key] : (moq || 1);
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
    const qtyKey = `${resolvedVariantId || 'default'}-${vendor.vendor_id}`;
    const quantity = quantities[qtyKey] || vendor.moq || 1;
    const quotationLimit = product.quotation_limit ? Number(product.quotation_limit) : null;
    const requiresQuotation = quotationLimit !== null && quantity >= quotationLimit;

    const rawPrice = typeof vendor.price === "string" ? parseFloat(vendor.price) || 0 : vendor.price || 0;
    const discountedPrice = vendor.discounted_price !== null && vendor.discounted_price !== undefined ? (typeof vendor.discounted_price === "string" ? parseFloat(vendor.discounted_price) : vendor.discounted_price) : null;
    const activePrice = (discountedPrice !== null && discountedPrice < rawPrice) ? discountedPrice : rawPrice;

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
      image: product.images?.find((img) => img.is_primary)?.image_url || product.images?.[0]?.image_url || "",
      price: activePrice,
      moq: vendor.moq || 1,
      quantity,
      vendorId: vendor.vendor_id,
      vendorName: `Vendor #${vendor.vendor_id.slice(0, 8)}`,
    });

    setAddingVendorId(null);

    if (success) {
      toast.success(`Added ${quantity} units to cart from Vendor #${vendor.vendor_id.slice(0, 8)}`);
      await fetchCart();
    } else {
      toast.error("Failed to add item. Please login.");
    }
  };

  const handleSaveToWishlist = async () => {
    if (!product) return;

    const preferredVendor = displayVendors[0];
    setSavingWishlist(true);

    const rawPrice = preferredVendor ? (typeof preferredVendor.price === "string" ? parseFloat(preferredVendor.price) || 0 : preferredVendor.price || 0) : 0;
    const discountedPrice = preferredVendor && preferredVendor.discounted_price !== null && preferredVendor.discounted_price !== undefined ? (typeof preferredVendor.discounted_price === "string" ? parseFloat(preferredVendor.discounted_price) : preferredVendor.discounted_price) : null;
    const activePrice = (discountedPrice !== null && discountedPrice < rawPrice) ? discountedPrice : rawPrice;

    const success = await addToWishlist({
      productId: product.product_id,
      productVariantId: selectedVariant?.variant_id,
      productName: product.product_name,
      description: product.description,
      image: product.images?.find((img) => img.is_primary)?.image_url || product.images?.[0]?.image_url || "",
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
        const discountedPrice = v.discounted_price !== null && v.discounted_price !== undefined ? (typeof v.discounted_price === "string" ? parseFloat(v.discounted_price) : v.discounted_price) : null;
        return (discountedPrice !== null && discountedPrice < rawPrice) ? discountedPrice : rawPrice;
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
            className="px-6 py-3 bg-[#1d4ed8] text-white rounded-lg font-medium hover:bg-blue-800 transition"
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
        {/* Breadcrumbs & Cart Summary */}
        <div className="bg-white border-b border-zinc-200">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <nav className="text-sm flex items-center gap-2 text-zinc-500">
                <Link href="/" className="hover:text-zinc-800 transition-colors">Home</Link>
                <ChevronRight size={14} className="text-zinc-400" />
                <Link href="/products" className="hover:text-zinc-800 transition-colors">Products</Link>
                <ChevronRight size={14} className="text-zinc-400" />
                <span className="text-zinc-800 font-medium truncate max-w-xs">{product.product_name}</span>
              </nav>
            </div>
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
                  <p className="text-2xl font-bold text-[#1d4ed8]">{priceRange}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold uppercase tracking-wider border border-amber-200 shadow-2xs">
                      GST is excluded
                    </span>
                    <span className="text-[11px] text-zinc-400 font-medium">* Prices vary by supplier. MOQ applies.</span>
                  </div>
                </div>
              )}

              {/* Product Variant Selector Dropdown */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6 p-5 bg-white rounded-2xl border border-zinc-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                    <label className="text-sm font-bold text-zinc-800 flex items-center gap-2">
                      <Layers size={16} className="text-[#1d4ed8]" />
                      Select Variant
                    </label>
                    <span className="text-[11px] text-zinc-400 font-medium bg-zinc-50 px-2 py-0.5 rounded border border-zinc-150">Swipe / Scroll</span>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-3 pt-1 -mx-2 px-2 snap-x scroll-smooth scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
                    {product.variants.map((v) => {
                      const isSelected = selectedVariant?.variant_id === v.variant_id;
                      const thumbnail = getVariantThumbnail(v);
                      const name = v.variant_name || Object.entries(v.properties || {})
                        .map(([_, val]) => val)
                        .join(" - ") || `Variant ${v.sku || v.variant_id.slice(0, 8)}`;
                      const priceStr = getVariantPriceRange(v);
                      
                      return (
                        <button
                          key={v.variant_id}
                          onClick={() => handleSelectVariant(v)}
                          className={`flex-none w-48 p-3 rounded-xl border-2 text-left transition-all snap-start flex gap-3 ${
                            isSelected
                              ? "border-[#1d4ed8] bg-blue-50/20 shadow-md ring-2 ring-blue-50/50"
                              : "border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50/50"
                          }`}
                        >
                          {/* Thumbnail */}
                          <div className="w-12 h-12 rounded-lg bg-zinc-100 border border-zinc-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {thumbnail ? (
                              <img
                                src={thumbnail}
                                alt={name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="text-zinc-400" size={20} />
                            )}
                          </div>
                          {/* Details */}
                          <div className="min-w-0 flex-1 flex flex-col justify-between">
                            <span className={`text-xs font-bold truncate block ${
                              isSelected ? "text-blue-900" : "text-zinc-800"
                            }`}>
                              {name}
                            </span>
                            <div>
                              <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider block">
                                {priceStr.startsWith("₹") ? "Starting At" : ""}
                              </span>
                              <span className={`text-[11px] font-bold block truncate ${
                                isSelected ? "text-[#1d4ed8]" : "text-zinc-650"
                              }`}>
                                {priceStr}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Flipkart-Style Grouped Product Variations */}
              {product.variants && product.variants.length > 0 && Object.keys(getVariantAttributes(product.variants)).length > 0 && (
                <div className="mb-6 p-5 bg-white rounded-2xl border border-zinc-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2 pb-2 border-b border-zinc-100">
                    <Layers size={16} className="text-[#1d4ed8]" />
                    Select Specifications
                  </h3>
                  {Object.entries(getVariantAttributes(product.variants)).map(([specKey, values]) => {
                    const activeValue = selectedSpecs[specKey];
                    return (
                      <div key={specKey} className="space-y-2">
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                          {specKey}: <span className="text-zinc-800 font-bold capitalize">{activeValue || "None"}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {values.map((val) => {
                            const isSelected = activeValue === val;
                            return (
                              <button
                                key={val}
                                onClick={() => handleSpecChange(specKey, val)}
                                className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${isSelected
                                  ? "bg-[#1d4ed8] text-white border-[#1d4ed8] shadow-md"
                                  : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                                  }`}
                              >
                                {val}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quotation Limit Info */}
              {product.quotation_limit && (
                <div className="mb-4 flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <Info size={18} className="text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Quotation Required for Bulk Orders</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Orders of <strong>{product.quotation_limit}+</strong> units require a quotation. Your request will be sent to all eligible suppliers for competitive pricing.
                    </p>
                  </div>
                </div>
              )}

              {/* Detailed Product Information */}
              {(() => {
                const featuresList: { label: string; value: string; icon: React.ReactNode }[] = [];

                if (product.product_type) {
                  featuresList.push({
                    label: "Type",
                    value: product.product_type,
                    icon: <Layers className="text-blue-600" size={16} />
                  });
                }

                const potentialProps = [
                  { label: "Material", value: material !== undefined ? String(material) : undefined, icon: <ShieldCheck className="text-blue-600" size={16} /> },
                  { label: "Grade", value: grade !== undefined ? String(grade) : undefined, icon: <BadgeCheck className="text-blue-600" size={16} /> },
                  { label: "Application", value: application !== undefined ? String(application) : undefined, icon: <Truck className="text-blue-600" size={16} /> },
                  { label: "Standard", value: standard !== undefined ? String(standard) : undefined, icon: <Info className="text-blue-600" size={16} /> }
                ];

                potentialProps.forEach(p => {
                  if (p.value) {
                    featuresList.push({
                      label: p.label,
                      value: p.value,
                      icon: p.icon
                    });
                  }
                });

                if (featuresList.length < 6 && product.attributes) {
                  const customAttrs = Object.entries(product.attributes)
                    .filter(([key]) => !["material", "grade", "application", "standard"].includes(key.toLowerCase()));

                  for (const [key, val] of customAttrs) {
                    if (featuresList.length >= 6) break;
                    if (val) {
                      featuresList.push({
                        label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                        value: String(val),
                        icon: <Package className="text-blue-600" size={16} />
                      });
                    }
                  }
                }

                if (featuresList.length === 0) return null;

                return (
                  <div className="mb-6 bg-zinc-50 border border-zinc-200/80 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Product Features</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6 text-sm">
                      {featuresList.slice(0, 6).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 py-1 border-b border-zinc-100 last:border-0 sm:border-0">
                          <div className="shrink-0 p-1.5 bg-blue-50/50 text-blue-600 rounded-lg">
                            {feat.icon}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">{feat.label}</span>
                            <span className="font-bold text-zinc-800 capitalize mt-0.5">{feat.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Product Rating */}
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-1">
                  <Star className="fill-amber-400 text-amber-400" size={16} />
                  <span className="font-bold text-amber-900">{product.rating || 0}</span>
                </div>
                <span className="text-sm text-amber-700">
                  {product.review_count || 0} {product.review_count === 1 ? 'review' : 'reviews'}
                </span>
                <span className="text-xs text-amber-600">• Verified by our quality team</span>
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
                  className="flex-1 px-6 py-3.5 bg-[#1d4ed8] text-white text-sm font-semibold rounded-xl hover:bg-blue-800 hover:shadow-lg transition-all text-center flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} />
                  View Suppliers & Add to Cart
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

        {/* Lower Content Grid */}
        <section className="max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8">
            {/* Product Properties (Attributes) */}
            {(isValidValue(grade) || isValidValue(material) || isValidValue(application) || isValidValue(standard) || Object.keys(getKeyProperties()).length > 0) && (
              <div className="border border-zinc-200 bg-white rounded-2xl shadow-sm h-max overflow-hidden">
                <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-blue-600" />
                  <h3 className="text-lg font-semibold text-zinc-900">Key Properties</h3>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {isValidValue(grade) && (
                      <li className="flex items-start gap-4 py-2 border-b border-zinc-50">
                        <span className="text-sm text-zinc-500 min-w-[120px] shrink-0">Grade</span>
                        <span className="text-sm font-semibold text-zinc-900 whitespace-pre-wrap">{grade}</span>
                      </li>
                    )}
                    {isValidValue(material) && (
                      <li className="flex items-start gap-4 py-2 border-b border-zinc-50">
                        <span className="text-sm text-zinc-500 min-w-[120px] shrink-0">Material</span>
                        <span className="text-sm font-semibold text-zinc-900 whitespace-pre-wrap">{material}</span>
                      </li>
                    )}
                    {isValidValue(application) && (
                      <li className="flex items-start gap-4 py-2 border-b border-zinc-50">
                        <span className="text-sm text-zinc-500 min-w-[120px] shrink-0">Application</span>
                        <span className="text-sm font-semibold text-zinc-900 whitespace-pre-wrap">{application}</span>
                      </li>
                    )}
                    {isValidValue(standard) && (
                      <li className="flex items-start gap-4 py-2 border-b border-zinc-50">
                        <span className="text-sm text-zinc-500 min-w-[120px] shrink-0">Standard</span>
                        <span className="text-sm font-semibold text-zinc-900 whitespace-pre-wrap">{standard}</span>
                      </li>
                    )}
                    {Object.entries(getKeyProperties())
                      .map(([key, value]) => (
                        <li key={key} className="flex items-start gap-4 py-2 border-b border-zinc-50 last:border-0">
                          <span className="text-sm text-zinc-500 capitalize min-w-[120px] shrink-0">{key.replace(/_/g, ' ')}</span>
                          <span className="text-sm font-semibold text-zinc-900 whitespace-pre-wrap">{String(value)}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Technical Specifications */}
            <div className="border border-zinc-200 bg-white rounded-2xl shadow-sm h-max overflow-hidden">
              <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
                <Layers size={18} className="text-zinc-500" />
                <h3 className="text-lg font-semibold text-zinc-900">Technical Specifications</h3>
              </div>
              <div className="p-6">
                {Object.keys(getTechnicalSpecifications()).length > 0 ? (
                  <ul className="space-y-3">
                    {Object.entries(getTechnicalSpecifications()).map(([key, value]) => (
                      <li key={key} className="flex items-start gap-4 py-2 border-b border-zinc-50 last:border-0">
                        <span className="text-sm text-zinc-500 capitalize min-w-[120px] shrink-0">{key.replace(/_/g, ' ')}</span>
                        <span className="text-sm font-semibold text-zinc-900 whitespace-pre-wrap">{String(value)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="py-8 text-center text-zinc-500 flex flex-col items-center">
                    <Info size={24} className="mb-2 opacity-20" />
                    <p className="text-sm">Specifications available on request</p>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Location & Vendors */}
            <div id="vendors-list" className="space-y-4">
              {/* Delivery Location Card */}
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
                            {savedAddress && userLocation.lat === savedAddress.latitude && userLocation.lng === savedAddress.longitude
                              ? "Deliver to your saved profile address"
                              : "Deliver to captured location"
                            }
                          </p>
                          <p className="text-sm text-zinc-500 mt-0.5">{userLocation.label}</p>
                          <p className="text-xs text-zinc-400 mt-1">
                            {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
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
                          {isLocating ? "Detecting..." : "Use Current Location"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center py-4">
                      <MapPin size={32} className="text-zinc-300 mb-3" />
                      <p className="text-sm font-semibold text-zinc-900 mb-1">Set your delivery location</p>
                      <p className="text-xs text-zinc-500 mb-4 max-w-sm">
                        We&apos;ll rank suppliers based on your location to find the best prices, closest distances, and top-rated vendors.
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
                {/* Grouped Vendors Compare by Variation */}
                {/* Grouped Vendors Compare by Variation */}
                {product.variants && product.variants.length > 0 ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                      <div className="flex items-center gap-2">
                        <Building size={20} className="text-zinc-600" />
                        <h3 className="text-xl font-bold text-zinc-900">Compare Suppliers for Selected Variant</h3>
                      </div>
                      {isRanking && (
                        <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium bg-blue-50 px-2.5 py-1 rounded-full">
                          <Loader2 size={12} className="animate-spin" />
                          Updating Ranking...
                        </div>
                      )}
                    </div>

                    {(() => {
                      const v = selectedVariant || product.variants[0];
                      if (!v) return null;

                      const variantLabel = v.variant_name || Object.entries(v.properties || {})
                        .map(([key, val]) => `${key}: ${val}`)
                        .join(", ") || "Standard";

                      // displayVendors resolves to either variant ranked vendors, variant default vendors, or product vendors.
                      const variantVendors = displayVendors;

                      return (
                        <div
                          key={v.variant_id}
                          className="bg-white rounded-2xl border-2 border-[#1d4ed8] shadow-sm overflow-hidden ring-4 ring-blue-50"
                        >
                          {/* Variant Sub-header */}
                          <div className="px-6 py-4 flex items-center justify-between bg-blue-50/30 border-b border-zinc-150">
                            <div className="flex items-center gap-2.5">
                              <Layers size={16} className="text-[#1d4ed8]" />
                              <span className="text-md font-bold text-[#1d4ed8]">
                                {variantLabel}
                              </span>
                              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider rounded-full border border-blue-200 shadow-2xs">
                                Active Selection
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-zinc-500 bg-white px-2.5 py-1 rounded-full border border-zinc-250 shadow-3xs">
                                {variantVendors.length} {variantVendors.length === 1 ? "Supplier" : "Suppliers"}
                              </span>
                            </div>
                          </div>

                          <div className="divide-y divide-zinc-100">
                            {variantVendors.length > 0 ? (
                              variantVendors.map((vendor: any, idx: number) => {
                                const qtyKey = `${v.variant_id}-${vendor.vendor_id}`;
                                const qty = quantities[qtyKey] || vendor.moq || 1;
                                const rawPrice = typeof vendor.price === "string" ? parseFloat(vendor.price) || 0 : vendor.price || 0;
                                const discountedPrice = vendor.discounted_price !== null && vendor.discounted_price !== undefined ? (typeof vendor.discounted_price === "string" ? parseFloat(vendor.discounted_price) : vendor.discounted_price) : null;
                                const activePrice = (discountedPrice !== null && discountedPrice < rawPrice) ? discountedPrice : rawPrice;
                                const hasDiscount = discountedPrice !== null && discountedPrice < rawPrice;
                                const totalPrice = activePrice * qty;
                                const quotationLimit = product.quotation_limit ? Number(product.quotation_limit) : null;
                                const requiresQuotation = quotationLimit !== null && qty >= quotationLimit;
                                const isRanked = rankedVendors.length > 0 && "rank" in vendor;
                                const ranked = vendor as RankedVendor;

                                return (
                                  <div key={`${vendor.vendor_id || idx}-${idx}`} className="p-5 hover:bg-zinc-50/30 transition-colors">
                                    <div className="flex flex-col lg:flex-row gap-4">
                                      {/* Supplier Info */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                          {isRanked && (
                                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${ranked.rank === 1 ? "bg-amber-100 text-amber-700" :
                                              ranked.rank === 2 ? "bg-zinc-200 text-zinc-700" :
                                                ranked.rank === 3 ? "bg-orange-100 text-orange-700" :
                                                  "bg-zinc-100 text-zinc-500"
                                              }`}>
                                              {ranked.rank}
                                            </span>
                                          )}
                                          <h4 className="font-semibold text-zinc-900">Vendor #{vendor.vendor_id.slice(0, 8)}</h4>
                                          {(vendor.city || vendor.state) && (
                                            <div className="flex items-center gap-1 text-xs text-zinc-500">
                                              <MapPin size={12} />
                                              <span>{[vendor.city, vendor.state].filter(Boolean).join(', ')}</span>
                                            </div>
                                          )}
                                          {vendor.rating > 0 && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-full">
                                              <Star size={10} fill="currentColor" />
                                              {Number(vendor.rating).toFixed(1)}
                                            </span>
                                          )}
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs rounded-full">
                                            <BadgeCheck size={10} />
                                            Verified
                                          </span>
                                        </div>

                                        <div className={`grid gap-3 mb-3 ${isRanked ? 'grid-cols-4' : 'grid-cols-3'}`}>
                                          <div className="bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg flex flex-col justify-between">
                                            <p className="text-xs text-zinc-500">Unit Price</p>
                                            <div className="flex flex-wrap items-baseline gap-1">
                                              <span className="text-sm font-bold text-[#1d4ed8]">₹{activePrice.toLocaleString()}</span>
                                              {hasDiscount && (
                                                <span className="text-[10px] text-zinc-400 line-through font-medium">₹{rawPrice.toLocaleString()}</span>
                                              )}
                                            </div>
                                            <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">
                                              {vendor.gst_percentage && Number(vendor.gst_percentage) > 0
                                                ? `+ ${vendor.gst_percentage}% GST`
                                                : "GST Excl."}
                                            </p>
                                          </div>
                                          <div className="bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg">
                                            <p className="text-xs text-zinc-500">MOQ</p>
                                            <p className="text-sm font-semibold text-zinc-800">{vendor.moq || 1} units</p>
                                          </div>
                                          <div className="bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg">
                                            <p className="text-xs text-zinc-500">Stock</p>
                                            <p className="text-sm font-semibold text-zinc-800">{vendor.stock_quantity || "N/A"}</p>
                                          </div>
                                          {isRanked && ranked.distance !== null && (
                                            <div className="bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg">
                                              <p className="text-xs text-zinc-500">Distance</p>
                                              <p className="text-sm font-semibold text-zinc-800">
                                                {ranked.distance < 1 ? `${Math.round(ranked.distance * 1000)} m` : `${ranked.distance.toFixed(1)} km`}
                                              </p>
                                            </div>
                                          )}
                                        </div>

                                        {product.quotation_limit && qty >= product.quotation_limit && (
                                          <div className="mb-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                                            ⚡ Quotation mode — your request will be sent to all eligible suppliers
                                          </div>
                                        )}
                                      </div>

                                      {/* Quantity & Add to Cart */}
                                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:w-auto">
                                        <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-lg px-2 py-1.5">
                                          <button
                                            onClick={() => updateQuantity(vendor.vendor_id, vendor.moq || 1, -1, vendor.stock_quantity, v.variant_id)}
                                            className="p-1.5 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors disabled:opacity-40"
                                            disabled={qty <= (vendor.moq || 1)}
                                          >
                                            <Minus size={16} />
                                          </button>
                                          <div className="flex flex-col items-center min-w-[60px]">
                                            <input
                                              type="number"
                                              min={vendor.moq || 1}
                                              max={vendor.stock_quantity || undefined}
                                              value={qty}
                                              onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                if (!isNaN(val) && val >= (vendor.moq || 1)) {
                                                  if (!vendor.stock_quantity || val <= vendor.stock_quantity) {
                                                    setQuantities((prev) => ({ ...prev, [`${v.variant_id}-${vendor.vendor_id}`]: val }));
                                                  } else {
                                                    toast.error(`Maximum available stock is ${vendor.stock_quantity}`);
                                                  }
                                                }
                                              }}
                                              onBlur={(e) => {
                                                const val = parseInt(e.target.value);
                                                if (isNaN(val) || val < (vendor.moq || 1)) {
                                                  setQuantities((prev) => ({ ...prev, [`${v.variant_id}-${vendor.vendor_id}`]: vendor.moq || 1 }));
                                                  toast.error(`Minimum order quantity is ${vendor.moq || 1}`);
                                                }
                                              }}
                                              className="w-[60px] text-center text-sm font-semibold text-zinc-900 bg-transparent outline-none border-b border-zinc-300 focus:border-[#1d4ed8] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <span className="text-[10px] text-zinc-400">units</span>
                                          </div>
                                          <button
                                            onClick={() => updateQuantity(vendor.vendor_id, vendor.moq || 1, 1, vendor.stock_quantity, v.variant_id)}
                                            className="p-1.5 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors"
                                          >
                                            <Plus size={16} />
                                          </button>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                          {activePrice > 0 && (
                                            <p className="text-sm font-semibold text-zinc-900">
                                              Total: ₹{totalPrice.toLocaleString()}
                                            </p>
                                          )}
                                          <button
                                            onClick={() => handleAddToCart(vendor, v.variant_id)}
                                            disabled={addingVendorId === vendor.vendor_id}
                                            className={`px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed ${requiresQuotation ? "bg-amber-600 hover:bg-amber-700" : "bg-[#1d4ed8] hover:bg-blue-800"
                                              }`}
                                          >
                                            {addingVendorId === vendor.vendor_id ? (
                                              <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                              <ShoppingCart size={16} />
                                            )}
                                            {addingVendorId === vendor.vendor_id
                                              ? "Adding..."
                                              : requiresQuotation
                                                ? "Request Quote"
                                                : "Add to Cart"}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="p-8 text-center flex flex-col items-center justify-center">
                                <Truck size={36} className="text-zinc-200 mb-2" />
                                <p className="text-sm font-medium text-zinc-500">No suppliers offering this variation</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Global Cart CTA Footer below grouped lists */}
                    {totalItems > 0 && (
                      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-between shadow-xs">
                        <p className="text-sm text-zinc-600 font-medium">
                          You have <strong className="text-zinc-900">{totalItems}</strong> {totalItems === 1 ? "item" : "items"} in your cart.
                        </p>
                        <Link
                          href="/cart"
                          className="px-5 py-2 bg-zinc-900 text-white text-sm font-bold rounded-lg hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-xs"
                        >
                          View Cart & Checkout
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Flat list fallback */
                  <div className="border border-zinc-200 bg-white rounded-2xl shadow-sm">
                    <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building size={18} className="text-zinc-500" />
                        <h3 className="text-lg font-semibold text-zinc-900">
                          {rankedVendors.length > 0 ? "Ranked Suppliers" : "Compare Suppliers & Order"}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {isRanking && <Loader2 size={14} className="animate-spin text-blue-600" />}
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                          {displayVendors.length} suppliers
                        </span>
                      </div>
                    </div>

                    <div className="divide-y divide-zinc-100">
                      {displayVendors.length > 0 ? (
                        displayVendors.map((v: any, idx: number) => {
                          const qty = quantities[`default-${v.vendor_id}`] || v.moq || 1;
                          const rawPrice = typeof v.price === "string" ? parseFloat(v.price) || 0 : v.price || 0;
                          const discountedPrice = v.discounted_price !== null && v.discounted_price !== undefined ? (typeof v.discounted_price === "string" ? parseFloat(v.discounted_price) : v.discounted_price) : null;
                          const activePrice = (discountedPrice !== null && discountedPrice < rawPrice) ? discountedPrice : rawPrice;
                          const hasDiscount = discountedPrice !== null && discountedPrice < rawPrice;
                          const totalPrice = activePrice * qty;
                          const quotationLimit = product.quotation_limit ? Number(product.quotation_limit) : null;
                          const requiresQuotation = quotationLimit !== null && qty >= quotationLimit;

                          return (
                            <div key={`${v.vendor_id || idx}-${idx}`} className="p-5 hover:bg-zinc-50/50 transition-colors">
                              <div className="flex flex-col lg:flex-row gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold text-zinc-900">Vendor #{v.vendor_id.slice(0, 8)}</h4>
                                    {(v.city || v.state) && (
                                      <div className="flex items-center gap-1 text-xs text-zinc-500">
                                        <MapPin size={12} />
                                        <span>{[v.city, v.state].filter(Boolean).join(', ')}</span>
                                      </div>
                                    )}
                                    {v.rating > 0 && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-full">
                                        <Star size={10} fill="currentColor" />
                                        {Number(v.rating).toFixed(1)}
                                      </span>
                                    )}
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs rounded-full">
                                      <BadgeCheck size={10} />
                                      Verified
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-3 gap-3 mb-3">
                                    <div className="bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg flex flex-col justify-between">
                                      <p className="text-xs text-zinc-500">Unit Price</p>
                                      <div className="flex flex-wrap items-baseline gap-1">
                                        <span className="text-sm font-bold text-[#1d4ed8]">₹{activePrice.toLocaleString()}</span>
                                        {hasDiscount && (
                                          <span className="text-[10px] text-zinc-400 line-through font-medium">₹{rawPrice.toLocaleString()}</span>
                                        )}
                                      </div>
                                      <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">
                                        {v.gst_percentage && Number(v.gst_percentage) > 0
                                          ? `+ ${v.gst_percentage}% GST`
                                          : "GST Excl."}
                                      </p>
                                    </div>
                                    <div className="bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg">
                                      <p className="text-xs text-zinc-500">MOQ</p>
                                      <p className="text-sm font-semibold text-zinc-800">{v.moq || 1} units</p>
                                    </div>
                                    <div className="bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg">
                                      <p className="text-xs text-zinc-500">Stock</p>
                                      <p className="text-sm font-semibold text-zinc-800">{v.stock_quantity || "N/A"}</p>
                                    </div>
                                  </div>

                                  {product.quotation_limit && qty >= product.quotation_limit && (
                                    <div className="mb-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                                      ⚡ Quotation mode — your request will be sent to all eligible suppliers
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:w-auto">
                                  <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-lg px-2 py-1.5">
                                    <button
                                      onClick={() => updateQuantity(v.vendor_id, v.moq || 1, -1, v.stock_quantity)}
                                      className="p-1.5 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors disabled:opacity-40"
                                      disabled={qty <= (v.moq || 1)}
                                    >
                                      <Minus size={16} />
                                    </button>
                                    <div className="flex flex-col items-center min-w-[60px]">
                                      <input
                                        type="number"
                                        min={v.moq || 1}
                                        max={v.stock_quantity || undefined}
                                        value={qty}
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value);
                                          if (!isNaN(val) && val >= (v.moq || 1)) {
                                            if (!v.stock_quantity || val <= v.stock_quantity) {
                                              setQuantities((prev) => ({ ...prev, [`default-${v.vendor_id}`]: val }));
                                            } else {
                                              toast.error(`Maximum available stock is ${v.stock_quantity}`);
                                            }
                                          }
                                        }}
                                        onBlur={(e) => {
                                          const val = parseInt(e.target.value);
                                          if (isNaN(val) || val < (v.moq || 1)) {
                                            setQuantities((prev) => ({ ...prev, [`default-${v.vendor_id}`]: v.moq || 1 }));
                                            toast.error(`Minimum order quantity is ${v.moq || 1}`);
                                          }
                                        }}
                                        className="w-[60px] text-center text-sm font-semibold text-zinc-900 bg-transparent outline-none border-b border-zinc-300 focus:border-[#1d4ed8] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                      />
                                      <span className="text-[10px] text-zinc-400">units</span>
                                    </div>
                                    <button
                                      onClick={() => updateQuantity(v.vendor_id, v.moq || 1, 1, v.stock_quantity)}
                                      className="p-1.5 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors"
                                    >
                                      <Plus size={16} />
                                    </button>
                                  </div>

                                  <div className="flex flex-col items-end gap-2">
                                    {activePrice > 0 && (
                                      <p className="text-sm font-semibold text-zinc-900">
                                        Total: ₹{totalPrice.toLocaleString()}
                                      </p>
                                    )}
                                    <button
                                      onClick={() => handleAddToCart(v)}
                                      disabled={addingVendorId === v.vendor_id}
                                      className={`px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed ${requiresQuotation ? "bg-amber-600 hover:bg-amber-700" : "bg-[#1d4ed8] hover:bg-blue-800"
                                        }`}
                                    >
                                      {addingVendorId === v.vendor_id ? (
                                        <Loader2 size={16} className="animate-spin" />
                                      ) : (
                                        <ShoppingCart size={16} />
                                      )}
                                      {addingVendorId === v.vendor_id
                                        ? "Adding..."
                                        : requiresQuotation
                                          ? "Request Quote"
                                          : "Add to Cart"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-12 text-center flex flex-col items-center justify-center">
                          <Truck size={48} className="text-zinc-200 mb-4" />
                          <h4 className="text-lg font-medium text-zinc-900 mb-1">No suppliers available</h4>
                          <p className="text-zinc-500 text-sm max-w-sm">We&apos;re actively sourcing verified suppliers for this product. Check back soon or contact our team.</p>
                        </div>
                      )}
                    </div>
                    {/* Cart CTA Footer */}
                    {displayVendors.length > 0 && (
                      <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                        <p className="text-sm text-zinc-500">
                          {totalItems > 0 ? `${totalItems} items in your cart` : "Add items to proceed"}
                        </p>
                        <Link
                          href="/cart"
                          className="px-5 py-2 bg-zinc-900 text-white text-sm font-semibold rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-2"
                        >
                          View Cart & Checkout
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    )}
                  </div>
                )}          </div>
            </div>

          </div>
        </section>

        {/* About This Item Section */}
        <section className="max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
              <Info size={18} className="text-zinc-500" />
              <h3 className="text-lg font-semibold text-zinc-900">About This Item</h3>
            </div>
            <div className="p-6">
              <div className="prose prose-zinc max-w-none">
                <p className="text-zinc-700 leading-relaxed text-base">
                  {product.description || "This industrial-grade product meets stringent quality standards and is suitable for various commercial and industrial applications. Sourced from verified suppliers with competitive pricing and reliable delivery options."}
                </p>

                {/* Additional details if available */}
                {(isValidValue(grade) || isValidValue(material) || isValidValue(application) || isValidValue(standard) || Object.keys(getKeyProperties()).length > 0) && (
                  <div className="mt-6 p-4 bg-zinc-50 rounded-lg">
                    <h4 className="font-semibold text-zinc-900 mb-3">Product Properties</h4>
                    <ul className="space-y-2 text-sm">
                      {isValidValue(grade) && (
                        <li className="flex items-start gap-2">
                          <ChevronRight size={14} className="text-zinc-400 mt-0.5" />
                          <span><strong>Grade:</strong> {grade}</span>
                        </li>
                      )}
                      {isValidValue(material) && (
                        <li className="flex items-start gap-2">
                          <ChevronRight size={14} className="text-zinc-400 mt-0.5" />
                          <span><strong>Material:</strong> {material}</span>
                        </li>
                      )}
                      {isValidValue(application) && (
                        <li className="flex items-start gap-2">
                          <ChevronRight size={14} className="text-zinc-400 mt-0.5" />
                          <span><strong>Application:</strong> {application}</span>
                        </li>
                      )}
                      {isValidValue(standard) && (
                        <li className="flex items-start gap-2">
                          <ChevronRight size={14} className="text-zinc-400 mt-0.5" />
                          <span><strong>Standard:</strong> {standard}</span>
                        </li>
                      )}
                      {Object.entries(getKeyProperties())
                        .map(([key, value]) => (
                          <li key={key} className="flex items-start gap-2">
                            <ChevronRight size={14} className="text-zinc-400 mt-0.5" />
                            <span className="whitespace-pre-wrap"><strong>{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:</strong> {String(value)}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section id="reviews" className="max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-2">Customer Reviews</h2>
              <p className="text-zinc-600">Feedback from verified buyers and suppliers</p>
            </div>
            <Link
              href="/orders"
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
                    {reviewsStats ? Number(reviewsStats.avg_rating).toFixed(1) : Number(product.rating || 0).toFixed(1)}
                  </span>
                  <p className="text-[11px] text-zinc-500 font-medium mt-1">out of 5</p>
                </div>
                <div>
                  <div className="flex items-center gap-0.5 mb-1.5">
                    {[...Array(5)].map((_, i) => {
                      const avgVal = reviewsStats ? Number(reviewsStats.avg_rating) : Number(product.rating || 0);
                      return (
                        <Star
                          key={i}
                          className={`${i < Math.round(avgVal) ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'} shrink-0`}
                          size={18}
                        />
                      );
                    })}
                  </div>
                  <p className="text-sm text-zinc-500 font-medium">
                    {reviewsStats ? reviewsStats.total_reviews : (product.review_count || 0)} customer reviews
                  </p>
                </div>
              </div>

              {/* Bar Chart Breakdown */}
              <div className="space-y-3 pt-4 border-t border-zinc-100">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = reviewsStats?.rating_distribution?.[stars] || 0;
                  const totalReviews = reviewsStats?.total_reviews || 0;
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
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
              {loadingReviews && reviews.length === 0 ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-6 border border-zinc-200 rounded-2xl bg-white animate-pulse space-y-3">
                      <div className="h-4 bg-zinc-200 rounded w-1/4"></div>
                      <div className="h-4 bg-zinc-200 rounded w-1/2"></div>
                      <div className="h-16 bg-zinc-100 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-zinc-200 rounded-2xl bg-white text-center">
                  <div className="p-4 bg-zinc-50 rounded-full text-zinc-400 mb-4">
                    <MessageSquare size={32} />
                  </div>
                  <h4 className="text-lg font-semibold text-zinc-900 mb-1">No reviews yet</h4>
                  <p className="text-zinc-500 text-sm max-w-sm mb-6">
                    Be the first to share your thoughts on this product! Submit reviews for your recent purchases to help other buyers.
                  </p>
                  <Link
                    href="/orders"
                    className="px-5 py-2.5 bg-[#1d4ed8] text-white text-sm font-semibold rounded-lg hover:bg-blue-800 shadow-md transition-colors"
                  >
                    View My Orders
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((rev) => (
                    <div key={rev.review_id} className="p-6 border border-zinc-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        {/* Customer Name & Verified Badge */}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-zinc-900">{rev.customer_name}</span>
                            {rev.verified_purchase && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
                                <BadgeCheck size={12} className="text-emerald-600" />
                                Verified Buyer
                              </span>
                            )}
                          </div>
                          {rev.vendor_id && (
                            <p className="text-[11px] text-zinc-400 mt-0.5">Purchased from Supplier #{rev.vendor_id.slice(0, 8)}</p>
                          )}
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400 sm:self-start">
                          <Calendar size={12} />
                          <span>{new Date(rev.review_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                      </div>

                      {/* Rating Stars & Title */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'} shrink-0`}
                              size={16}
                            />
                          ))}
                        </div>
                        {rev.review_title && (
                          <h4 className="font-bold text-zinc-900 text-sm leading-snug">{rev.review_title}</h4>
                        )}
                      </div>

                      {/* Review Text */}
                      {rev.review_text && (
                        <p className="text-zinc-700 text-sm leading-relaxed mb-4 whitespace-pre-wrap">{rev.review_text}</p>
                      )}

                      {/* Attached photo gallery */}
                      {rev.images && rev.images.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {rev.images.map((imgUrl, idx) => (
                              <button
                                key={idx}
                                onClick={() => setActiveReviewImage(imgUrl)}
                                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50 hover:opacity-90 hover:border-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Review Photo ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Helpful CTA */}
                      <div className="flex items-center justify-between pt-3 border-t border-zinc-50 text-xs text-zinc-400">
                        <div className="flex items-center gap-2">
                          <span>Was this review helpful?</span>
                          <button
                            onClick={() => {
                              toast.success("Thanks for your feedback!");
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-800 transition-colors"
                          >
                            <ThumbsUp size={12} />
                            <span>Helpful</span>
                          </button>
                        </div>
                        <span>Rating: {rev.rating_label || "Verified"}</span>
                      </div>
                    </div>
                  ))}

                  {/* Load More Button */}
                  {hasMoreReviews && (
                    <div className="pt-4 flex justify-center">
                      <button
                        onClick={handleLoadMoreReviews}
                        disabled={loadingMoreReviews}
                        className="flex items-center gap-2 px-6 py-3 border border-zinc-200 bg-white text-zinc-700 text-sm font-semibold rounded-xl hover:bg-zinc-50 shadow-sm transition-all disabled:opacity-60"
                      >
                        {loadingMoreReviews && <Loader2 size={16} className="animate-spin text-blue-600" />}
                        {loadingMoreReviews ? "Loading reviews..." : "Load More Reviews"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Related Products Section */}
        <section className="max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">Related Products</h2>
            <p className="text-zinc-600">Similar products in the {product.category} category</p>
          </div>

          {isLoadingRelated ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-zinc-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-zinc-200 rounded mb-2"></div>
                  <div className="h-4 bg-zinc-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((related) => {
                const priceLabel = related.min_price === related.max_price
                  ? `₹${related.min_price?.toLocaleString() || "Contact"}`
                  : `₹${related.min_price?.toLocaleString() || 0} – ₹${related.max_price?.toLocaleString() || 0}`;

                return (
                  <div key={related.product_id} className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:border-zinc-300 hover:shadow-md h-full">
                    <Link href={`/product/${related.product_id}`} className="flex h-full flex-col">
                      {/* Image */}
                      <div className="relative h-48 w-full overflow-hidden bg-zinc-100">
                        {related.primary_image ? (
                          <img
                            src={related.primary_image}
                            alt={related.product_name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-zinc-100">
                            <Package size={32} className="text-zinc-300" />
                          </div>
                        )}
                        {related.seller_count > 0 ? (
                          <span className="absolute top-2.5 left-2.5 rounded bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-zinc-600 shadow-sm">
                            {related.seller_count} {related.seller_count === 1 ? "Supplier" : "Suppliers"}
                          </span>
                        ) : (
                          <span className="absolute top-2.5 left-2.5 rounded bg-amber-100/95 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-amber-700 shadow-sm">
                            Coming Soon
                          </span>
                        )}
                      </div>

                      {/* Body */}
                      <div className="flex flex-1 flex-col gap-3 p-4">
                        {/* Product Name */}
                        <div>
                          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900">
                            {related.product_name}
                          </h3>
                        </div>

                        {/* Rating */}
                        {related.rating > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Star className="fill-amber-400 text-amber-400" size={12} />
                              <span className="text-sm font-medium text-zinc-900">{related.rating}</span>
                            </div>
                            <span className="text-xs text-zinc-500">({related.review_count || 0})</span>
                          </div>
                        )}

                        {/* Price Section */}
                        <div className="pt-2 border-t border-zinc-100">
                          <p className="text-sm text-zinc-500">Price Range</p>
                          <p className="text-lg font-bold text-zinc-900">{priceLabel}</p>
                        </div>

                        {/* Order Details */}
                        <div className="pt-2 border-t border-zinc-100 space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-500">Minimum Order</span>
                            <span className="font-medium text-zinc-700">{related.min_moq || 1} pieces</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-500">Suppliers</span>
                            {related.seller_count > 0 ? (
                              <span className="font-medium text-emerald-600">
                                {related.seller_count === 1 ? "1 Verified" : `${related.seller_count} Verified`}
                              </span>
                            ) : (
                              <span className="font-medium text-amber-600">
                                Coming Soon
                              </span>
                            )}
                          </div>
                        </div>

                        {/* CTA */}
                        <div className={`mt-auto pt-2 w-full rounded-lg px-3 py-2.5 text-center text-xs font-semibold transition-colors ${related.seller_count > 0
                          ? "border border-[#1d4ed8] text-[#1d4ed8] group-hover:bg-[#1d4ed8] group-hover:text-white"
                          : "border border-zinc-300 text-zinc-400 bg-zinc-50 cursor-not-allowed"
                          }`}>
                          {related.seller_count > 0 ? "Order Now" : "No Vendors Yet"}
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package size={48} className="text-zinc-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-zinc-900 mb-2">No related products found</h3>
              <p className="text-zinc-500">Check out our other products in different categories</p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#1d4ed8] text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors"
              >
                Browse All Products
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </section>
      </main>

      {/* Lightbox dialog modal */}
      {activeReviewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          onClick={() => setActiveReviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img src={activeReviewImage} alt="Review attachment" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200" />
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