"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageLightboxProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
}

export function ImageLightbox({ src, alt, className, containerClassName }: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);

  // Load image dimensions
  useEffect(() => {
    if (isOpen && !imageSize) {
      const img = new window.Image();
      img.onload = () => {
        setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = src;
    }
  }, [isOpen, src, imageSize]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const isPortrait = imageSize ? imageSize.height > imageSize.width : false;
  const aspectRatio = imageSize ? imageSize.width / imageSize.height : 16 / 9;

  return (
    <>
      {/* Thumbnail - clickable */}
      <div 
        className={cn("cursor-zoom-in", containerClassName)}
        onClick={() => setIsOpen(true)}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className={className}
        />
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white text-zinc-900 hover:bg-zinc-100 shadow-lg transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image container */}
          <div 
            className={cn(
              "relative flex items-center justify-center p-4 sm:p-8",
              "w-full h-full"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {imageSize ? (
              <div
                className={cn(
                  "relative",
                  isPortrait 
                    ? "h-[90vh] sm:h-[85vh]" 
                    : "w-full sm:w-auto sm:max-w-[90vw]"
                )}
                style={{
                  aspectRatio: aspectRatio,
                  maxHeight: "90vh",
                  maxWidth: "95vw",
                }}
              >
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 90vw"
                  priority
                />
              </div>
            ) : (
              // Loading state
              <div className="flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              </div>
            )}
          </div>

          {/* Tap to close hint on mobile */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/50 sm:hidden">
            Tap anywhere to close
          </div>
        </div>
      )}
    </>
  );
}

