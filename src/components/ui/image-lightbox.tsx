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
  const [isLoaded, setIsLoaded] = useState(false);

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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          {/* Close button - safe area for notched phones */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white text-zinc-900 hover:bg-zinc-100 shadow-lg transition-colors safe-area-top"
            style={{ top: "max(1rem, env(safe-area-inset-top))" }}
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image container - uses img tag for natural sizing */}
          <div 
            className="relative w-full h-full flex items-center justify-center p-4 sm:p-8"
            style={{ 
              paddingTop: "max(1rem, env(safe-area-inset-top))",
              paddingBottom: "max(1rem, env(safe-area-inset-bottom))"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {!isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              </div>
            )}
            
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              onLoad={() => setIsLoaded(true)}
              onClick={() => setIsOpen(false)}
              className={cn(
                "max-w-full max-h-full w-auto h-auto object-contain cursor-zoom-out transition-opacity duration-200",
                isLoaded ? "opacity-100" : "opacity-0"
              )}
              style={{
                maxWidth: "min(100%, 95vw)",
                maxHeight: "min(100%, 90vh)",
              }}
            />
          </div>

          {/* Tap to close hint on mobile */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 text-xs text-white/50 sm:hidden pointer-events-none"
            style={{ bottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
          >
            Tap image to close
          </div>
        </div>
      )}
    </>
  );
}

