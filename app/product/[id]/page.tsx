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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left: Sticky Image Gallery */}
            <div className="lg:col-span-6 lg:sticky lg:top-24 self-start bg-white rounded-2xl shadow-sm border border-zinc-200 p-4 sm:p-6">
              <ProductImageGallery images={activeImages} productName={product.product_name} />
            </div>

            {/* Right: Core Details */}
            <div className="lg:col-span-6 bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 sm:p-8 flex flex-col">
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

              {/* Variant Selector & Attribute Configurator */}
              <VariantSelector
                product={product}
                selectedVariant={selectedVariant}
                selectedSpecs={selectedSpecs}
                onSelectVariant={handleSelectVariant}
                onSpecChange={handleSpecChange}
              />

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

        {/* Primary Action Section: Delivery Location + Verified Suppliers Comparison */}
        <section className="max-w-7xl mx-auto px-4 pb-12 sm:px-6 lg:px-8">
          <div className="space-y-6">
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
        </section>

        {/* Specifications & Properties Grid */}
        <section className="max-w-7xl mx-auto px-4 pb-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          </div>
        </section>

        {/* About This Item */}
        <section className="max-w-7xl mx-auto px-4 pb-12 sm:px-6 lg:px-8">
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
          relatedProducts={relatedProducts}
          isLoadingRelated={isLoadingRelated}
        />
      </main>

      {/* Mobile Sticky Floating Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 px-4 py-3 shadow-2xl flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Unit Price</p>
          <p className="text-base font-bold text-[#1d4ed8] truncate">
            {priceRange || "Contact for Price"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveToWishlist}
            disabled={savingWishlist}
            className="p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600 hover:text-rose-600 hover:border-rose-200 active:scale-95 transition-all"
            aria-label="Wishlist"
          >
            <span className="text-base">❤️</span>
          </button>
          <a
            href="#vendors-list"
            className="px-4 py-2.5 bg-[#1d4ed8] text-white text-xs font-bold rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            Compare Suppliers
          </a>
        </div>
      </div>

      {/* Review Image Lightbox */}
      <ReviewLightbox
        imageUrl={activeReviewImage}
        onClose={() => setActiveReviewImage(null)}
      />
    </div>
  );
}