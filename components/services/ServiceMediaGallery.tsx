"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, X, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import type { ServiceMedia } from "@/store/serviceStore";

type Props = {
  media: ServiceMedia[];
  fallbackImage?: string | null;
};

export function ServiceMediaGallery({ media, fallbackImage }: Props) {
  const video = media.find((m) => m.media_type === "video");
  let images = media.filter((m) => m.media_type === "image");

  if (images.length === 0 && fallbackImage) {
    images = [
      {
        id: "fallback",
        media_url: fallbackImage,
        media_type: "image",
        is_primary: true,
        display_order: 0,
      },
    ];
  }

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const allMedia = [...images];
  const activeMedia = allMedia[activeIndex];

  if (images.length === 0 && !video) {
    return (
      <div className="flex flex-col items-center justify-center h-72 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-400 gap-3">
        <ImageIcon size={40} strokeWidth={1.5} />
        <p className="text-sm">No media available</p>
      </div>
    );
  }

  function openLightbox(index: number) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  function closeLightbox() {
    setLightboxOpen(false);
  }

  function prevLightbox() {
    setLightboxIndex((i) => (i - 1 + images.length) % images.length);
  }

  function nextLightbox() {
    setLightboxIndex((i) => (i + 1) % images.length);
  }

  return (
    <div className="flex flex-col gap-3">
      {video && (
        <div className="rounded-xl overflow-hidden border border-zinc-200 bg-zinc-900">
          <div className="relative">
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm">
              <Play size={11} className="fill-zinc-700" />
              Video
            </div>
            <video
              src={video.media_url}
              controls
              className="w-full max-h-80 object-contain"
              preload="metadata"
            />
          </div>
        </div>
      )}

      {images.length > 0 && (
        <>
          <div
            className="relative h-72 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 cursor-zoom-in"
            onClick={() => openLightbox(activeIndex)}
          >
            {activeMedia && (
              <Image
                src={activeMedia.media_url}
                alt="Service image"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveIndex((i) => (i - 1 + images.length) % images.length); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveIndex((i) => (i + 1) % images.length); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`relative flex-shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    idx === activeIndex ? "border-[#1d4ed8]" : "border-zinc-200 hover:border-zinc-400"
                  }`}
                  aria-label={`View image ${idx + 1}`}
                >
                  <Image
                    src={img.media_url}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {lightboxOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Close lightbox"
          >
            <X size={20} />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevLightbox(); }}
                className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextLightbox(); }}
                className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          <div
            className="relative max-w-4xl max-h-[85vh] w-full mx-8"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex].media_url}
              alt="Service media full view"
              width={1200}
              height={800}
              className="w-full h-full object-contain rounded-xl"
            />
            <p className="mt-2 text-center text-xs text-white/60">
              {lightboxIndex + 1} / {images.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
