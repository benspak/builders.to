"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImageIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  placeholder?: string;
  aspectRatio?: "video" | "square" | "auto";
  disabled?: boolean;
  uploadType?: "projects" | "companies";
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  placeholder = "Drag and drop or click to upload",
  aspectRatio = "video",
  disabled = false,
  uploadType = "projects",
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const uploadFile = async (file: File) => {
    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", uploadType);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setError(null);
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", uploadType);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Upload failed");
        }

        const data = await response.json();
        onChange(data.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setIsUploading(false);
      }
    } else {
      setError("Please upload an image file");
    }
  }, [disabled, uploadType, onChange]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    } else {
      onChange("");
    }
    setError(null);
  };

  const aspectClasses = {
    video: "aspect-video",
    square: "aspect-square",
    auto: "min-h-[200px]",
  };

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "relative rounded-xl border-2 border-dashed transition-all overflow-hidden",
          aspectClasses[aspectRatio],
          isDragging
            ? "border-orange-500 bg-orange-500/10"
            : value
            ? "border-zinc-700/50 bg-zinc-800/30"
            : "border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600 hover:bg-zinc-800/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {value ? (
          <>
            <Image
              src={value}
              alt="Uploaded image"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                disabled={disabled || isUploading}
              >
                <Upload className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                disabled={disabled || isUploading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 hover:text-zinc-300 transition-colors"
            disabled={disabled || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin mb-3" />
                <span className="text-sm">Uploading...</span>
              </>
            ) : (
              <>
                <ImageIcon className="h-10 w-10 mb-3 text-zinc-500" />
                <span className="text-sm font-medium">{placeholder}</span>
                <span className="text-xs text-zinc-500 mt-1">
                  JPEG, PNG, GIF, WebP (max 5MB)
                </span>
              </>
            )}
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}

// Gallery uploader for multiple images
interface GalleryImage {
  id?: string;
  url: string;
  caption?: string | null;
}

interface GalleryUploadProps {
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
  maxImages?: number;
  disabled?: boolean;
  uploadType?: "projects" | "companies";
}

export function GalleryUpload({
  images,
  onChange,
  maxImages = 10,
  disabled = false,
  uploadType = "projects",
}: GalleryUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const uploadFiles = async (files: File[]) => {
    const remainingSlots = maxImages - images.length;
    const filesToUpload = files.slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    setError(null);
    setIsUploading(true);

    const newImages: GalleryImage[] = [];

    try {
      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", uploadType);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Upload failed");
        }

        const data = await response.json();
        newImages.push({ url: data.url });
      }

      onChange([...images, ...newImages]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length === 0) {
      setError("Please upload image files");
      return;
    }

    const remainingSlots = maxImages - images.length;
    const filesToUpload = files.slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    setError(null);
    setIsUploading(true);

    const newImages: GalleryImage[] = [];

    try {
      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", uploadType);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Upload failed");
        }

        const data = await response.json();
        newImages.push({ url: data.url });
      }

      onChange([...images, ...newImages]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }, [disabled, images, maxImages, uploadType, onChange]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await uploadFiles(files);
    }
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-4">
      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <div
              key={image.id || index}
              className="relative aspect-video rounded-lg overflow-hidden group bg-zinc-800"
            >
              <Image
                src={image.url}
                alt={`Gallery image ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canAddMore && (
        <div
          className={cn(
            "relative rounded-xl border-2 border-dashed p-8 transition-all",
            isDragging
              ? "border-orange-500 bg-orange-500/10"
              : "border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600 hover:bg-zinc-800/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center text-zinc-400 hover:text-zinc-300 transition-colors"
            disabled={disabled || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <span className="text-sm">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 mb-2 text-zinc-500" />
                <span className="text-sm font-medium">
                  Add more images ({images.length}/{maxImages})
                </span>
                <span className="text-xs text-zinc-500 mt-1">
                  Drag & drop or click to select multiple files
                </span>
              </>
            )}
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
          />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
