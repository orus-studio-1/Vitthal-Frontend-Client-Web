"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

type ProductImage = {
  image_url: string;
  is_primary: boolean;
  display_order: number;
  media_type?: 'image' | 'video' | null;
};

type ProductImageGalleryProps = {
  images?: ProductImage[];
  productName: string;
};

const FALLBACK_IMAGE =
  "https://www.shutterstock.com/image-photo/neatly-stacked-light-green-gypsum-600nw-2690641841.jpg";

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const orderedImages = useMemo(() => {
    const safeImages = (images ?? []).filter((img) => Boolean(img?.image_url));
    // Remove duplicates based on image_url
    const uniqueImages = safeImages.filter((img, index, self) =>
      index === self.findIndex((i) => i.image_url === img.image_url)
    );
    return [...uniqueImages].sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return (a.display_order ?? 0) - (b.display_order ?? 0);
    });
  }, [images]);

  const [selectedMedia, setSelectedMedia] = useState<ProductImage | null>(null);

  const currentMedia = selectedMedia || orderedImages[0] || null;

  return (
    <div className="w-full flex flex-col">
      {/* Main Media - Fixed aspect ratio preventing vertical stretching */}
      <div className="relative w-full aspect-square max-h-[460px] sm:max-h-[500px] rounded-xl overflow-hidden bg-white border border-zinc-200/80 shadow-2xs flex items-center justify-center">
        {currentMedia?.media_type === "video" ? (
          <video
            src={currentMedia.image_url}
            className="w-full h-full object-contain p-2 sm:p-4"
            controls
            autoPlay
            muted
            loop
          />
        ) : (
          <Image
            src={currentMedia?.image_url || FALLBACK_IMAGE}
            alt={productName}
            fill
            className="object-contain p-2 sm:p-4 hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
            priority
          />
        )}
      </div>

      {/* Thumbnails - Clean, compact responsive row */}
      {orderedImages.length > 1 && (
        <div className="flex gap-2.5 mt-3.5 overflow-x-auto pb-2 px-0.5 scrollbar-thin scrollbar-thumb-zinc-200">
          {orderedImages.map((img, idx) => {
            const isActive = currentMedia?.image_url === img.image_url;
            return (
              <button
                key={`${img.image_url}-${idx}`}
                type="button"
                onClick={() => setSelectedMedia(img)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 cursor-pointer border-2 transition-all ${
                  isActive
                    ? "border-[#1d4ed8] ring-2 ring-blue-100 shadow-sm scale-[1.02]"
                    : "border-zinc-200 hover:border-zinc-300 opacity-80 hover:opacity-100"
                }`}
                aria-label={`View ${productName} image ${idx + 1}`}
              >
                {img.media_type === "video" ? (
                  <div className="relative w-full h-full bg-zinc-900">
                    <video src={img.image_url} className="w-full h-full object-cover" muted playsInline />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play className="w-5 h-5 text-white drop-shadow" />
                    </div>
                  </div>
                ) : (
                  <Image
                    src={img.image_url}
                    alt={`${productName} angle ${idx + 1}`}
                    fill
                    className="object-contain p-1"
                    sizes="80px"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}