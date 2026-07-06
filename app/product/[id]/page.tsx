"use client";

/* eslint-disable @next/next/no-img-element */

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ProductImageGallery from "@/components/ProductImageGallery";
import { BadgeCheck } from "lucide-react";

import { useProductDetail } from "./_hooks/useProductDetail";
import { getResolvedProperty, getActiveImages } from "@/lib/utils/product";
import { getPriceRangeLabel } from "@/lib/utils/price";

import {
  ProductBreadcrumb,
  VariantSelector,
  SpecSelector,
  QuotationAlert,
  ProductFeatures,
  ProductRating,
  TrustBadges,
  ProductActions,
  KeyProperties,
  TechnicalSpecs,
  DeliveryLocation,
  VendorList,
  AboutThisItem,
  ReviewsSection,
  RelatedProducts,
  ReviewLightbox,
} from "@/components/product";

import { PageLoadingState } from "@/components/ui";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const {
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
  } = useProductDetail(id);

  if (loading) return <PageLoadingState />;

  if (!product) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 flex flex-col">
        <main className="flex-1 flex flex-col items-center justify-center p-8">
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

  // Resolved property helpers
  const material = getResolvedProperty("Material", product, selectedVariant);
  const grade = getResolvedProperty("Grade", product, selectedVariant);
  const application = getResolvedProperty("Application", product, selectedVariant);
  const standard = getResolvedProperty("Standard", product, selectedVariant);
  const activeImages = getActiveImages(product, selectedVariant);
  const priceRange = getPriceRangeLabel(displayVendors);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col">
      <main className="flex-1">
        {/* Breadcrumb & Cart Summary */}
        <ProductBreadcrumb productName={product.product_name} />

        {/* Product Overview Section */}
        <section className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col lg:flex-row">

            {/* Left: Image Gallery */}
            <div className="lg:w-1/2 bg-zinc-50/50 p-4 lg:p-6 min-h-[400px] lg:min-h-[600px]">
              <ProductImageGallery images={activeImages} productName={product.product_name} />
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

              {/* Price Range */}
              {priceRange && (
                <div className="mb-4">
                  <p className="text-sm text-zinc-500 mb-1">Price Range (per unit)</p>
                  <p className="text-2xl font-bold text-[#1d4ed8]">{priceRange}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold uppercase tracking-wider border border-amber-200 shadow-2xs">
                      GST is excluded
                    </span>
                    <span className="text-[11px] text-zinc-400 font-medium">
                      * Prices vary by supplier. MOQ applies.
                    </span>
                  </div>
                </div>
              )}

              {/* Variant Selector */}
              <VariantSelector
                product={product}
                selectedVariant={selectedVariant}
                onSelectVariant={handleSelectVariant}
              />

              {/* Spec Selector */}
              {product.variants && product.variants.length > 0 && (
                <SpecSelector
                  variants={product.variants}
                  selectedSpecs={selectedSpecs}
                  onSpecChange={handleSpecChange}
                />
              )}

              {/* Quotation Alert */}
              {product.quotation_limit && (
                <QuotationAlert quotationLimit={product.quotation_limit} />
              )}

              {/* Product Features */}
              <ProductFeatures
                product={product}
                selectedVariant={selectedVariant}
                material={material}
                grade={grade}
                application={application}
                standard={standard}
              />

              {/* Rating */}
              <ProductRating rating={product.rating} reviewCount={product.review_count} />

              {/* Trust Badges */}
              <TrustBadges supplierCount={displayVendors.length} />

              {/* Action Buttons */}
              <ProductActions
                onSaveToWishlist={handleSaveToWishlist}
                isSaving={savingWishlist}
              />
            </div>
          </div>
        </section>

        {/* Lower Content Grid */}
        <section className="max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8">
            {/* Key Properties */}
            <KeyProperties
              product={product}
              selectedVariant={selectedVariant}
              material={material}
              grade={grade}
              application={application}
              standard={standard}
            />

            {/* Technical Specs */}
            <TechnicalSpecs product={product} />

            {/* Delivery Location + Vendor List */}
            <div className="space-y-4">
              <DeliveryLocation
                userLocation={userLocation}
                savedAddress={savedAddress}
                isLocating={isLocating}
                onUseCurrentLocation={handleUseCurrentLocation}
                onUseSavedAddress={handleUseSavedAddress}
              />
              <VendorList
                product={product}
                selectedVariant={selectedVariant}
                displayVendors={displayVendors}
                rankedVendors={rankedVendors}
                isRanking={isRanking}
                quantities={quantities}
                addingVendorId={addingVendorId}
                onAddToCart={handleAddToCart}
                onUpdateQuantity={updateQuantity}
                onQuantityChange={handleQuantityChange}
              />
            </div>
          </div>
        </section>

        {/* About This Item */}
        <section className="max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8">
          <AboutThisItem
            product={product}
            selectedVariant={selectedVariant}
            material={material}
            grade={grade}
            application={application}
            standard={standard}
          />
        </section>

        {/* Reviews Section */}
        <ReviewsSection
          productRating={product.rating}
          productReviewCount={product.review_count}
          reviews={reviews}
          stats={reviewsStats}
          isLoading={loadingReviews}
          isLoadingMore={loadingMoreReviews}
          hasMore={hasMoreReviews}
          onLoadMore={handleLoadMoreReviews}
          onViewImage={setActiveReviewImage}
        />

        {/* Related Products */}
        <RelatedProducts
          category={product.category}
          products={relatedProducts}
          isLoading={isLoadingRelated}
        />
      </main>

      {/* Review Image Lightbox */}
      <ReviewLightbox
        imageUrl={activeReviewImage}
        onClose={() => setActiveReviewImage(null)}
      />
    </div>
  );
}