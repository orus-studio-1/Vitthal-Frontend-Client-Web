"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import {
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Package,
  Star,
  Camera,
  X,
  Image as ImageIcon,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

type ReviewItem = {
  order_item_id: string;
  product_id: string;
  vendor_id: string;
  quantity: number;
  price: number;
  product_name: string;
  product_description: string | null;
  image_url: string | null;
  vendor_name: string;
  product_review_id: string | null;
  product_rating: number | null;
  product_review_title: string | null;
  product_review_text: string | null;
  product_review_images: string[] | null;
  vendor_review_id: string | null;
  vendor_rating: number | null;
  vendor_review_title: string | null;
  vendor_review_text: string | null;
};

type ReviewOrder = {
  order_id: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  address_line: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  customer_name: string;
  customer_email: string;
  item_count: number;
  vendor_count: number;
};

type ReviewResponse = {
  order: ReviewOrder;
  items: ReviewItem[];
  canReview: boolean;
  reviewLockReason: string | null;
};

type DraftState = {
  rating: number;
  reviewTitle: string;
  reviewText: string;
  images: string[];
};

function StarRating({
  value,
  onChange,
  disabled,
  label,
}: {
  value: number;
  onChange: (nextValue: number) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label={label}>
      {Array.from({ length: 5 }, (_, index) => index + 1).map((starValue) => {
        const active = value >= starValue;

        return (
          <button
            key={starValue}
            type="button"
            disabled={disabled}
            onClick={() => onChange(starValue)}
            className={`rounded-full p-1.5 transition-all ${disabled ? "cursor-not-allowed opacity-50" : "hover:scale-110 active:scale-95"
              }`}
            aria-label={`${label}: ${starValue} star${starValue > 1 ? "s" : ""}`}
          >
            <Star
              className={`h-5 w-5 ${active ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
            />
          </button>
        );
      })}
      <span className="ml-2 text-sm font-semibold text-gray-700">
        {value > 0 ? `${value}/5` : "Select rating"}
      </span>
    </div>
  );
}

export default function Page() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { isAuthenticated, isLoading: authLoading, fetchUser } = useAuthStore();
  const orderId = params?.id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviewData, setReviewData] = useState<ReviewResponse | null>(null);
  const [productDrafts, setProductDrafts] = useState<Record<string, DraftState>>({});
  const [vendorDrafts, setVendorDrafts] = useState<Record<string, DraftState>>({});
  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});
  const [imgPreviewCache, setImgPreviewCache] = useState<Record<string, string>>({});

  const handleImageUpload = async (orderItemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingState((prev) => ({ ...prev, [orderItemId]: true }));
    const currentImages = productDrafts[orderItemId]?.images ?? [];
    const newImages = [...currentImages];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.startsWith("image/")) {
          toast.error("Please upload images only.");
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error("Images must be 5MB or smaller.");
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`${API_BASE}/api/upload`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Upload failed");
        }

        const data = await res.json();
        if (data.fileName) {
          const signedUrlRes = await fetch(`${API_BASE}/api/upload/file?fileName=${encodeURIComponent(data.fileName)}`);
          if (signedUrlRes.ok) {
             const signedUrlData = await signedUrlRes.json();
             setImgPreviewCache((prev) => ({ ...prev, [data.fileName]: signedUrlData.url }));
          }
          newImages.push(data.fileName);
        }
      }

      handleProductDraftChange(orderItemId, "images", newImages);
      toast.success("Images uploaded successfully");
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error("Failed to upload one or more images");
    } finally {
      setUploadingState((prev) => ({ ...prev, [orderItemId]: false }));
      e.target.value = "";
    }
  };

  const handleRemoveImage = (orderItemId: string, imgKeyToRemove: string) => {
    const currentImages = productDrafts[orderItemId]?.images ?? [];
    const nextImages = currentImages.filter((img) => img !== imgKeyToRemove);
    handleProductDraftChange(orderItemId, "images", nextImages);
  };

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/orders/review/${orderId ?? ""}`);
    }
  }, [authLoading, isAuthenticated, orderId, router]);

  useEffect(() => {
    if (!orderId || !isAuthenticated) {
      return;
    }

    let mounted = true;

    async function fetchReviewData() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/reviews/orders/${orderId}`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "x-request-from": "client",
          },
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "Failed to load review details");
        }

        if (!mounted) {
          return;
        }

        const response = data.data as ReviewResponse;
        setReviewData(response);

        const nextProductDrafts: Record<string, DraftState> = {};
        const nextVendorDrafts: Record<string, DraftState> = {};
        const initialCache: Record<string, string> = {};

        for (const item of response.items) {
          const productReviewImages = item.product_review_images ?? [];
          nextProductDrafts[item.order_item_id] = {
            rating: item.product_rating ?? 0,
            reviewTitle: item.product_review_title ?? "",
            reviewText: item.product_review_text ?? "",
            images: productReviewImages,
          };

          if (Array.isArray(productReviewImages)) {
            for (const img of productReviewImages) {
              initialCache[img] = img;
            }
          }

          if (!nextVendorDrafts[item.vendor_id]) {
            nextVendorDrafts[item.vendor_id] = {
              rating: item.vendor_rating ?? 0,
              reviewTitle: item.vendor_review_title ?? "",
              reviewText: item.vendor_review_text ?? "",
              images: [],
            };
          }
        }

        setProductDrafts(nextProductDrafts);
        setVendorDrafts(nextVendorDrafts);
        setImgPreviewCache((prev) => ({ ...prev, ...initialCache }));
      } catch (error) {
        console.error("Failed to fetch review data:", error);
        toast.error(error instanceof Error ? error.message : "Failed to load review page");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void fetchReviewData();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, orderId]);

  const vendorGroups = useMemo(() => {
    if (!reviewData) {
      return [] as Array<{
        vendorId: string;
        vendorName: string;
        items: ReviewItem[];
        reviewId: string | null;
        rating: number | null;
        title: string | null;
        text: string | null;
      }>;
    }

    const map = new Map<
      string,
      {
        vendorId: string;
        vendorName: string;
        items: ReviewItem[];
        reviewId: string | null;
        rating: number | null;
        title: string | null;
        text: string | null;
      }
    >();

    for (const item of reviewData.items) {
      const existing = map.get(item.vendor_id);
      const vendorSummary = {
        vendorId: item.vendor_id,
        vendorName: item.vendor_name || `Vendor #${item.vendor_id?.slice(0, 8)}`,
        items: [item],
        reviewId: item.vendor_review_id,
        rating: item.vendor_rating,
        title: item.vendor_review_title,
        text: item.vendor_review_text,
      };

      if (existing) {
        existing.items.push(item);
      } else {
        map.set(item.vendor_id, vendorSummary);
      }
    }

    return Array.from(map.values());
  }, [reviewData]);

  const reviewProgress = useMemo(() => {
    if (!reviewData) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    const productCompleted = reviewData.items.filter((item) => item.product_review_id).length;
    const vendorCompleted = vendorGroups.filter((group) => group.reviewId).length;
    const completed = productCompleted + vendorCompleted;
    const total = reviewData.items.length + vendorGroups.length;

    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [reviewData, vendorGroups]);

  const handleProductDraftChange = (
    orderItemId: string,
    field: keyof DraftState,
    value: string | number | string[],
  ) => {
    setProductDrafts((current) => ({
      ...current,
      [orderItemId]: {
        rating: current[orderItemId]?.rating ?? 0,
        reviewTitle: current[orderItemId]?.reviewTitle ?? "",
        reviewText: current[orderItemId]?.reviewText ?? "",
        images: current[orderItemId]?.images ?? [],
        [field]: value,
      } as DraftState,
    }));
  };

  const handleVendorDraftChange = (
    vendorId: string,
    field: keyof DraftState,
    value: string | number,
  ) => {
    setVendorDrafts((current) => ({
      ...current,
      [vendorId]: {
        rating: current[vendorId]?.rating ?? 0,
        reviewTitle: current[vendorId]?.reviewTitle ?? "",
        reviewText: current[vendorId]?.reviewText ?? "",
        images: current[vendorId]?.images ?? [],
        [field]: value,
      } as DraftState,
    }));
  };

  const handleSubmit = async () => {
    if (!reviewData?.canReview) {
      toast.error(reviewData?.reviewLockReason || "Reviews are not available yet");
      return;
    }

    const productReviews = reviewData.items
      .filter((item) => !item.product_review_id)
      .map((item) => ({
        orderItemId: item.order_item_id,
        rating: productDrafts[item.order_item_id]?.rating ?? 0,
        reviewTitle: productDrafts[item.order_item_id]?.reviewTitle ?? "",
        reviewText: productDrafts[item.order_item_id]?.reviewText ?? "",
        images: productDrafts[item.order_item_id]?.images ?? [],
      }));

    const vendorReviews = vendorGroups
      .filter((group) => !group.reviewId)
      .map((group) => ({
        vendorId: group.vendorId,
        rating: vendorDrafts[group.vendorId]?.rating ?? 0,
        reviewTitle: vendorDrafts[group.vendorId]?.reviewTitle ?? "",
        reviewText: vendorDrafts[group.vendorId]?.reviewText ?? "",
      }));

    const invalidProduct = productReviews.find((item) => item.rating < 1);
    if (invalidProduct) {
      toast.error("Please rate every product before submitting.");
      return;
    }

    const invalidVendor = vendorReviews.find((item) => item.rating < 1);
    if (invalidVendor) {
      toast.error("Please rate every vendor before submitting.");
      return;
    }

    if (productReviews.length === 0 && vendorReviews.length === 0) {
      toast.message("Everything is already reviewed.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/reviews/orders/${orderId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-request-from": "client",
        },
        body: JSON.stringify({ productReviews, vendorReviews }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to submit reviews");
      }

      toast.success("Reviews submitted successfully");
      router.push("/orders");
    } catch (error) {
      console.error("Submit review error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit reviews");
    } finally {
      setSubmitting(false);
    }
  };

  const allProductReviewed = reviewData ? reviewData.items.every((item) => item.product_review_id) : false;
  const allVendorReviewed = reviewData ? vendorGroups.every((group) => group.reviewId) : false;
  const allDone = allProductReviewed && allVendorReviewed;

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-600" />
          <p className="mt-3 text-sm font-medium text-gray-700">Loading review details...</p>
        </div>
      </div>
    );
  }

  if (!reviewData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
          <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-amber-500" />
          <h1 className="text-xl font-bold text-gray-900">Review details unavailable</h1>
          <p className="mt-2 text-sm text-gray-600">We could not load the order review screen. Please try again later.</p>
          <Link
            href="/orders"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12 pt-6 text-gray-900">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/orders")}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </button>
          <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-800">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Delivered • {reviewData.order.item_count} items
          </div>
        </div>

        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Order Review</h1>
          <p className="mt-1 text-sm text-gray-600">Rate your products and vendor experience for this delivered order.</p>
        </header>

        {!reviewData.canReview ? (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-semibold">Review locked</p>
                <p className="mt-1 text-xs text-amber-800">{reviewData.reviewLockReason}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {vendorGroups.map((group) => {
              const vendorDraft = vendorDrafts[group.vendorId] ?? {
                rating: 0,
                reviewTitle: "",
                reviewText: "",
              };

              return (
                <section key={group.vendorId} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Vendor</p>
                      <h2 className="mt-0.5 text-lg font-bold text-gray-900">{group.vendorName}</h2>
                      <p className="mt-0.5 text-xs text-gray-600">
                        {group.items.length} item{group.items.length > 1 ? "s" : ""} in this order
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-xs font-medium text-gray-600">Rate vendor service</p>
                      <StarRating
                        value={vendorDraft.rating}
                        onChange={(nextValue) => handleVendorDraftChange(group.vendorId, "rating", nextValue)}
                        disabled={!reviewData.canReview || Boolean(group.reviewId)}
                        label={`${group.vendorName} vendor rating`}
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">Review title</label>
                      <input
                        type="text"
                        value={vendorDraft.reviewTitle}
                        onChange={(event) => handleVendorDraftChange(group.vendorId, "reviewTitle", event.target.value)}
                        disabled={!reviewData.canReview || Boolean(group.reviewId)}
                        placeholder="Summarize your experience"
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">Detailed feedback</label>
                      <textarea
                        rows={3}
                        value={vendorDraft.reviewText}
                        onChange={(event) => handleVendorDraftChange(group.vendorId, "reviewText", event.target.value)}
                        disabled={!reviewData.canReview || Boolean(group.reviewId)}
                        placeholder="Share more details about your experience with this vendor..."
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60 resize-none"
                      />
                    </div>
                  </div>

                  <div className="mt-5 border-t border-gray-100 pt-5">
                    <p className="text-sm font-semibold text-gray-900">Products from this vendor</p>
                    <div className="mt-3 space-y-3">
                      {group.items.map((item) => {
                        const productDraft = productDrafts[item.order_item_id] ?? {
                          rating: 0,
                          reviewTitle: "",
                          reviewText: "",
                        };

                        return (
                          <article key={item.order_item_id} className="flex flex-col sm:flex-row sm:items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-200">
                              {item.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.image_url} alt={item.product_name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-gray-400">
                                  <Package className="h-5 w-5" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                <div className="flex-1">
                                  <h3 className="text-sm font-semibold text-gray-900">{item.product_name}</h3>
                                  <p className="mt-0.5 text-xs text-gray-600">
                                    Qty {item.quantity} • ₹{Number(item.price).toLocaleString()}
                                  </p>
                                </div>

                                <div className="sm:text-right">
                                  <p className="text-xs font-medium text-gray-600 mb-1">Rate this product</p>
                                  <StarRating
                                    value={productDraft.rating}
                                    onChange={(nextValue) =>
                                      handleProductDraftChange(item.order_item_id, "rating", nextValue)
                                    }
                                    disabled={!reviewData.canReview || Boolean(item.product_review_id)}
                                    label={`${item.product_name} product rating`}
                                  />
                                </div>
                              </div>

                              <div className="mt-3 space-y-2">
                                <input
                                  type="text"
                                  value={productDraft.reviewTitle}
                                  onChange={(event) =>
                                    handleProductDraftChange(item.order_item_id, "reviewTitle", event.target.value)
                                  }
                                  disabled={!reviewData.canReview || Boolean(item.product_review_id)}
                                  placeholder="Review title (optional)"
                                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60"
                                />

                                <textarea
                                  rows={2}
                                  value={productDraft.reviewText}
                                  onChange={(event) =>
                                    handleProductDraftChange(item.order_item_id, "reviewText", event.target.value)
                                  }
                                  disabled={!reviewData.canReview || Boolean(item.product_review_id)}
                                  placeholder="Share your thoughts about this product (optional)"
                                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60 resize-none"
                                />

                                <div className="mt-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                      <Camera className="h-3.5 w-3.5 text-gray-500" />
                                      Add photos (optional)
                                    </label>
                                    {uploadingState[item.order_item_id] && (
                                      <span className="text-xs text-blue-600 flex items-center gap-1 animate-pulse font-medium">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Uploading...
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap gap-2 items-center">
                                    {(!reviewData.canReview || item.product_review_id) ? null : (
                                      <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white hover:bg-gray-50 hover:border-blue-400 transition-colors">
                                        <ImageIcon className="h-5 w-5 text-gray-400" />
                                        <span className="text-[10px] text-gray-500 font-medium mt-1">Upload</span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          multiple
                                          disabled={uploadingState[item.order_item_id]}
                                          onChange={(e) => handleImageUpload(item.order_item_id, e)}
                                          className="hidden"
                                        />
                                      </label>
                                    )}

                                    {productDraft.images?.map((imgKey) => {
                                      const displayUrl = imgKey.startsWith("http")
                                        ? imgKey
                                        : imgPreviewCache[imgKey] || imgKey;

                                      return (
                                        <div key={imgKey} className="relative h-16 w-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 group shadow-sm">
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img
                                            src={displayUrl}
                                            alt="Review Attachment"
                                            className="h-full w-full object-cover"
                                          />
                                          {(!reviewData.canReview || item.product_review_id) ? null : (
                                            <button
                                              type="button"
                                              onClick={() => handleRemoveImage(item.order_item_id, imgKey)}
                                              className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                                            >
                                              <X className="h-3 w-3" />
                                            </button>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Progress</p>
              <h3 className="mt-2 text-xl font-bold text-gray-900">
                {reviewProgress.percentage}% complete
              </h3>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <span className="text-sm font-medium text-gray-700">Products</span>
                  <span className="text-sm font-bold text-gray-900">{reviewData.items.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <span className="text-sm font-medium text-gray-700">Vendors</span>
                  <span className="text-sm font-bold text-gray-900">{vendorGroups.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2">
                  <span className="text-sm font-medium text-green-800">Completed</span>
                  <span className="text-sm font-bold text-green-900">{reviewProgress.completed}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!reviewData.canReview || submitting || allDone}
                className="mt-4 w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Saving..." : allDone ? "All reviews submitted ✓" : "Submit all reviews"}
              </button>

              <Link href="/orders" className="mt-3 block text-center text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
                Back to orders
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
