"use client";

import { X } from "lucide-react";

interface ReviewLightboxProps {
  imageUrl: string | null;
  onClose: () => void;
}

export function ReviewLightbox({ imageUrl, onClose }: ReviewLightboxProps) {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Review attachment"
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
        />
        <button
          className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/85 text-white rounded-full transition-colors focus:outline-none"
          onClick={onClose}
          aria-label="Close image"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
