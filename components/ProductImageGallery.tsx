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
    <div className="w-full h-full flex flex-col">
      {/* Main Media - Full width, larger display */}
      <div className="relative flex-1 w-full min-h-75 sm:min-h-100 lg:min-h-125 rounded-xl overflow-hidden bg-white border border-zinc-200 shadow-sm flex items-center justify-center">
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

      {/* Thumbnails - Larger size */}
      {orderedImages.length > 1 && (
        <div className="flex gap-3 mt-4 overflow-x-auto pb-2 px-1">
          {orderedImages.map((img, idx) => {
            const isActive = currentMedia?.image_url === img.image_url;
            return (
              <button
                key={`${img.image_url}-${idx}`}
                type="button"
                onClick={() => setSelectedMedia(img)}
                className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden shrink-0 cursor-pointer border-2 transition-all ${
                  isActive ? "border-blue-600 ring-2 ring-blue-200 shadow-md" : "border-zinc-200 hover:border-blue-500 hover:shadow-sm"
                }`}
                aria-label={`View ${productName} image ${idx + 1}`}
              >
                {img.media_type === "video" ? (
                  <div className="relative w-full h-full">
                    <video src={img.image_url} className="w-full h-full object-cover" muted playsInline />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white drop-shadow-md" />
                    </div>
                  </div>
                ) : (
                  <Image src={img.image_url} alt={`${productName} angle ${idx + 1}`} fill className="object-cover" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}