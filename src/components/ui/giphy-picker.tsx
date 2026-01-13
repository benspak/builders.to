"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Grid } from "@giphy/react-components";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { IGif } from "@giphy/js-types";
import { Search, X, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Initialize Giphy with the SDK key
// Using the public beta key - replace with your own API key in production
const gf = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API_KEY || "sXpGFDGZs0Dv1mmNFvYaGUvYwKX0PWIh");

interface GiphyPickerProps {
  onSelect: (gif: { url: string; width: number; height: number }) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function GiphyPicker({ onSelect, onClose, isOpen }: GiphyPickerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Track if component is mounted (for portal SSR safety)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Lock body scroll when modal is open
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

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch GIFs based on search term
  const fetchGifs = useCallback(
    (offset: number) => {
      if (debouncedSearch) {
        return gf.search(debouncedSearch, { offset, limit: 20 });
      }
      return gf.trending({ offset, limit: 20 });
    },
    [debouncedSearch]
  );

  // Handle GIF selection
  const handleGifClick = (gif: IGif, e: React.SyntheticEvent<HTMLElement>) => {
    e.preventDefault();

    // Get the fixed height version for consistent display
    const gifUrl = gif.images.fixed_height.url;
    const width = parseInt(gif.images.fixed_height.width);
    const height = parseInt(gif.images.fixed_height.height);

    onSelect({ url: gifUrl, width, height });
    onClose();
    setSearchTerm("");
    setDebouncedSearch("");
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-xl max-h-[80vh] flex flex-col rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-pink-500/10">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-fuchsia-400" />
            <h2 className="text-lg font-semibold text-white">Choose a GIF</h2>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-4 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for GIFs..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-zinc-800/50 text-white placeholder:text-zinc-500 focus:border-fuchsia-500/50 focus:outline-none focus:ring-1 focus:ring-fuchsia-500/50"
            />
          </div>
        </div>

        {/* GIF Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <Grid
            key={debouncedSearch}
            width={480}
            columns={3}
            fetchGifs={fetchGifs}
            onGifClick={handleGifClick}
            noLink
            hideAttribution
            className="giphy-grid"
          />
        </div>

        {/* Footer with Giphy attribution */}
        <div className="px-4 py-2 border-t border-white/5 bg-zinc-900/95">
          <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
            <span>Powered by</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 28 35"
              className="h-4 w-auto"
            >
              <g fillRule="evenodd" clipRule="evenodd">
                <path fill="#00ff99" d="M0 3h4v29H0z" />
                <path fill="#9933ff" d="M24 11h4v21h-4z" />
                <path fill="#00ccff" d="M0 31h28v4H0z" />
                <path fill="#fff35c" d="M0 0h16v4H0z" />
                <path fill="#ff6666" d="M24 8V4h-4V0h-4v12h12V8z" />
                <path fill="#121212" d="M24 16v-4h4v4z" />
              </g>
            </svg>
            <span className="font-semibold text-zinc-400">GIPHY</span>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// GIF icon button component to trigger the picker
interface GifButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function GifButton({ onClick, disabled, className }: GifButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-fuchsia-400 hover:bg-fuchsia-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      title="Add a GIF"
    >
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <text x="6" y="15" fontSize="8" fontWeight="bold" fill="currentColor" stroke="none">
          GIF
        </text>
      </svg>
      <span className="hidden sm:inline">GIF</span>
    </button>
  );
}

// Preview component for selected GIF
interface GifPreviewProps {
  gifUrl: string;
  onRemove: () => void;
  className?: string;
}

export function GifPreview({ gifUrl, onRemove, className }: GifPreviewProps) {
  return (
    <div className={cn("relative rounded-xl overflow-hidden border border-white/10 bg-zinc-800/30", className)}>
      <div className="relative max-h-48">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={gifUrl}
          alt="Selected GIF"
          className="w-full h-auto max-h-48 object-contain"
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-red-500 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 text-xs text-fuchsia-300 font-medium">
        GIF
      </div>
    </div>
  );
}
