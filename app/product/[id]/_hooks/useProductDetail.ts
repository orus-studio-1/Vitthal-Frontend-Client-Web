"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { useQuotationCartStore } from "@/store/quotationCartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { fetchProduct, fetchRankedVendors, fetchRelatedProducts } from "@/lib/api/products";
import { fetchProductReviews } from "@/lib/api/reviews";
import { fetchClientAddress } from "@/lib/api/client";
import type {
  ProductDetail,
  ProductVariant,
  RankedVendor,
  RelatedProduct,
  ProductReview,
  ReviewStats,
  Vendor,
} from "@/types";

export function useProductDetail(id: string) {
  // Core product state
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Cart/wishlist actions
  const addItem = useCartStore((s) => s.addItem);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const addQuotationItem = useQuotationCartStore((s) => s.addItem);
  const fetchQuotationCart = useQuotationCartStore((s) => s.fetchCart);
  const addToWishlist = useWishlistStore((s) => s.addItem);

  // UI state
  const [addingVendorId, setAddingVendorId] = useState<string | null>(null);
  const [savingWishlist, setSavingWishlist] = useState(false);

  // Location & ranking state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [savedAddress, setSavedAddress] = useState<{ latitude: number; longitude: number; address: string; city: string } | null>(null);
  const [rankedVendors, setRankedVendors] = useState<RankedVendor[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [isRanking, setIsRanking] = useState(false);

  // Related products
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsStats, setReviewsStats] = useState<ReviewStats | null>(null);
  const [reviewsPage, setReviewsPage] = useState<number>(0);
  const [hasMoreReviews, setHasMoreReviews] = useState<boolean>(false);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState<boolean>(false);
  const [activeReviewImage, setActiveReviewImage] = useState<string | null>(null);

  // Computed: display vendors (ranked > variant > product)
  const rawDisplayVendors = product
    ? product.variants && product.variants.length > 0
      ? rankedVendors.length > 0 ? rankedVendors : (selectedVariant?.vendors || [])
      : rankedVendors.length > 0 ? rankedVendors : product.vendors || []
    : [];
  const displayVendors = Array.from(
    new Map(rawDisplayVendors.map((v: Vendor, index: number) => [v.vendor_id || `fallback-${index}`, v])).values()
  ) as (Vendor | RankedVendor)[];

  // Load product
  useEffect(() => {
    async function loadProduct() {
      const data = await fetchProduct(id);
      setProduct(data);
      if (data?.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0]);
        setSelectedSpecs(data.variants[0].properties || {});
        const initialQuantities: Record<string, number> = {};
        data.variants.forEach((variant) => {
          (variant.vendors || []).forEach((v) => {
            initialQuantities[`${variant.variant_id}-${v.vendor_id}`] = v.moq || 1;
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

  // Load saved address
  useEffect(() => {
    async function loadAddress() {
      const addr = await fetchClientAddress();
      if (addr) {
        setSavedAddress(addr);
        setUserLocation({ lat: addr.latitude, lng: addr.longitude, label: `${addr.address}, ${addr.city}` });
      }
    }
    loadAddress();
  }, []);

  // Fetch ranked vendors when location changes
  useEffect(() => {
    if (!userLocation || !id) { setRankedVendors([]); return; }
    const { lat, lng } = userLocation;
    const variantId = selectedVariant?.variant_id;
    async function loadRanking() {
      setRankedVendors([]);
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

  // Load related products
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

  // Load initial reviews
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

  // Handlers
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

  const handleSpecChange = (key: string, value: string) => {
    const updatedSpecs = { ...selectedSpecs, [key]: value };
    setSelectedSpecs(updatedSpecs);
    if (product?.variants) {
      let match = product.variants.find((v) =>
        Object.entries(updatedSpecs).every(([k, val]) => v.properties[k] === val)
      );
      if (!match) match = product.variants.find((v) => v.properties[key] === value);
      if (match) {
        setSelectedVariant(match);
        setSelectedSpecs(match.properties || {});
      }
    }
  };

  const handleSelectVariant = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setSelectedSpecs(variant.properties || {});
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) { toast.error("Geolocation is not supported by your browser"); return; }
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
        if (error.code === error.PERMISSION_DENIED) toast.error("Location permission denied.");
        else if (error.code === error.POSITION_UNAVAILABLE) toast.error("Location information unavailable.");
        else if (error.code === error.TIMEOUT) toast.error("Location request timed out.");
        else toast.error("An unknown error occurred while getting location.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleUseSavedAddress = () => {
    if (!savedAddress) return;
    setUserLocation({
      lat: savedAddress.latitude,
      lng: savedAddress.longitude,
      label: `${savedAddress.address}, ${savedAddress.city}`,
    });
    toast.success("Switched to saved delivery address");
  };

  const handleQuantityChange = (vendorId: string, newQty: number, variantId?: string) => {
    const key = `${variantId || "default"}-${vendorId}`;
    setQuantities((prev) => ({ ...prev, [key]: newQty }));
  };

  const updateQuantity = (vendorId: string, moq: number, delta: number, stock: number, variantId?: string) => {
    const key = `${variantId || "default"}-${vendorId}`;
    setQuantities((prev) => {
      const currentQty = prev[key] !== undefined ? prev[key] : moq || 1;
      const newQty = currentQty + delta;
      if (newQty < moq) { toast.error(`Minimum order quantity is ${moq}`); return prev; }
      if (stock && newQty > stock) { toast.error(`Maximum available stock is ${stock}`); return prev; }
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

    const rawPrice = typeof vendor.price === "string" ? parseFloat(vendor.price) || 0 : vendor.price || 0;
    const discountedPrice = vendor.discounted_price !== null && vendor.discounted_price !== undefined
      ? (typeof vendor.discounted_price === "string" ? parseFloat(vendor.discounted_price) : vendor.discounted_price)
      : null;
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
    const discountedPrice = preferredVendor && preferredVendor.discounted_price !== null && preferredVendor.discounted_price !== undefined
      ? (typeof preferredVendor.discounted_price === "string" ? parseFloat(preferredVendor.discounted_price) : preferredVendor.discounted_price)
      : null;
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

  return {
    // State
    product,
    selectedVariant,
    selectedSpecs,
    loading,
    quantities,
    addingVendorId,
    savingWishlist,
    userLocation,
    savedAddress,
    rankedVendors,
    displayVendors,
    isLocating,
    isRanking,
    relatedProducts,
    isLoadingRelated,
    reviews,
    reviewsStats,
    hasMoreReviews,
    loadingReviews,
    loadingMoreReviews,
    activeReviewImage,
    // Handlers
    setActiveReviewImage,
    handleSelectVariant,
    handleSpecChange,
    handleUseCurrentLocation,
    handleUseSavedAddress,
    handleQuantityChange,
    updateQuantity,
    handleAddToCart,
    handleSaveToWishlist,
    handleLoadMoreReviews,
  };
}
