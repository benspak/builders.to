"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImageIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackgroundUploadProps {
  currentBackground: string | null;
  onBackgroundChange: (url: string | null) => void;
}

export function BackgroundUpload({
  currentBackground,
  onBackgroundChange,
}: BackgroundUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentBackground);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const uploadFile = async (file: File) => {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a JPEG, PNG, GIF, or WebP image");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "backgrounds");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload image");
      }

      const { url } = await response.json();
      setPreviewUrl(url);
      onBackgroundChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      await uploadFile(file);
    } else {
      setError("Please upload an image file");
    }
  }, []);

  const handleRemove = () => {
    setPreviewUrl(null);
    onBackgroundChange(null);
    setError(null);
  };

  return (
    <div className="space-y-3">
      {/* Preview Area - Banner style aspect ratio */}
      <div
        className={cn(
          "relative w-full rounded-xl border-2 border-dashed transition-all overflow-hidden",
          "h-24 sm:h-32", // Banner height similar to profile page
          isDragging
            ? "border-orange-500 bg-orange-500/10"
            : previewUrl
            ? "border-zinc-700/50"
            : "border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600 hover:bg-zinc-800/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <>
            <Image
              src={previewUrl}
              alt="Profile background"
              fill
              className="object-cover"
            />
            {/* Overlay with gradient to show how it will look */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950/50" />
            {/* Action buttons on hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 rounded-lg bg-white/20 hover:bg-white/30 px-4 py-2 text-sm font-medium text-white transition-colors"
              >
                <Upload className="h-4 w-4" />
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className="flex items-center gap-2 rounded-lg bg-red-500/80 hover:bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors"
              >
                <X className="h-4 w-4" />
                Remove
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <span className="text-sm">Uploading...</span>
              </>
            ) : (
              <>
                <ImageIcon className="h-8 w-8 mb-2 text-zinc-500" />
                <span className="text-sm font-medium">
                  Upload a background image
                </span>
                <span className="text-xs text-zinc-500 mt-1">
                  Recommended: 1200x400px or similar banner ratio
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Default gradient preview */}
      {!previewUrl && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
          <div className="h-10 w-20 rounded-md bg-gradient-to-r from-orange-600/20 via-orange-500/10 to-cyan-500/10 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-300">Default gradient</p>
            <p className="text-xs text-zinc-500">
              This gradient will be shown if no custom background is set
            </p>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileSelect}
        disabled={uploading}
      />

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
