"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface GalleryImage {
  id: string;
  url: string;
  caption?: string | null;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  className?: string;
}

export function ImageGallery({ images, className }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (images.length === 0) {
    return null;
  }

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
    document.body.style.overflow = "";
  };

  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") goToPrevious();
    if (e.key === "ArrowRight") goToNext();
  };

  return (
    <>
      {/* Gallery Grid */}
      <div className={cn("grid gap-3", className)}>
        {images.length === 1 ? (
          // Single image - full width
          <button
            onClick={() => openLightbox(0)}
            className="relative aspect-video rounded-xl overflow-hidden group cursor-zoom-in"
          >
            <Image
              src={images[0].url}
              alt={images[0].caption || "Project screenshot"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ) : images.length === 2 ? (
          // Two images - side by side
          <div className="grid grid-cols-2 gap-3">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => openLightbox(index)}
                className="relative aspect-video rounded-xl overflow-hidden group cursor-zoom-in"
              >
                <Image
                  src={image.url}
                  alt={image.caption || `Screenshot ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          // 3+ images - grid layout with first image larger
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.slice(0, 6).map((image, index) => (
              <button
                key={image.id}
                onClick={() => openLightbox(index)}
                className={cn(
                  "relative rounded-xl overflow-hidden group cursor-zoom-in",
                  index === 0 ? "col-span-2 row-span-2 aspect-video sm:aspect-auto sm:h-full" : "aspect-video"
                )}
              >
                <Image
                  src={image.url}
                  alt={image.caption || `Screenshot ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {/* Show count overlay on last visible image if there are more */}
                {index === 5 && images.length > 6 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      +{images.length - 6}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          {/* Image */}
          <div
            className="relative w-full h-full max-w-7xl max-h-[90vh] m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[selectedIndex].url}
              alt={images[selectedIndex].caption || "Project screenshot"}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Caption and counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-white">
            {images[selectedIndex].caption && (
              <p className="mb-2 text-sm text-zinc-300">
                {images[selectedIndex].caption}
              </p>
            )}
            <p className="text-xs text-zinc-500">
              {selectedIndex + 1} / {images.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
