"use client";

import { useState } from "react";
import { Code, Copy, Check, ExternalLink } from "lucide-react";

interface EmbedBadgeProps {
  projectSlug: string;
  projectTitle: string;
  isPreview?: boolean;
}

type BadgeSize = "default" | "small";

const badgeSizes = {
  default: { width: 171, height: 54 },
  small: { width: 130, height: 40 },
};

export function EmbedBadge({ projectSlug, projectTitle, isPreview = false }: EmbedBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [size, setSize] = useState<BadgeSize>("default");

  const baseUrl = "https://builders.to";
  const projectUrl = `${baseUrl}/projects/${projectSlug}`;

  const getBadgeUrl = () => {
    const sizeSuffix = size === "small" ? "-small" : "";
    const themeSuffix = theme === "light" ? "-light" : "";
    return `${baseUrl}/badges/featured-on-builders${sizeSuffix}${themeSuffix}.svg`;
  };

  const badgeUrl = getBadgeUrl();
  const { width, height } = badgeSizes[size];

  const embedCode = `<a href="${projectUrl}?utm_source=badge" target="_blank" rel="noopener noreferrer"><img src="${badgeUrl}" alt="${projectTitle} - Featured on Builders.to" width="${width}" height="${height}" /></a>`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
        title="Get embed badge for your website"
      >
        <Code className="h-4 w-4" />
        Embed Badge
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute left-0 top-full mt-2 z-50 w-[420px] rounded-xl bg-zinc-900 border border-zinc-700/50 shadow-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Embed Badge on Your Website</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Add this badge to your website to link back to your project on Builders.to
            </p>

            {isPreview && (
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
                <p className="text-xs text-amber-400">
                  Preview only — save your project first to use this embed code
                </p>
              </div>
            )}

            {/* Size & Theme Toggles */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Size:</span>
                <button
                  onClick={() => setSize("default")}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    size === "default"
                      ? "bg-orange-500 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  Default
                </button>
                <button
                  onClick={() => setSize("small")}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    size === "small"
                      ? "bg-orange-500 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  Small
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Theme:</span>
                <button
                  onClick={() => setTheme("dark")}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    theme === "dark"
                      ? "bg-orange-500 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  Dark
                </button>
                <button
                  onClick={() => setTheme("light")}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    theme === "light"
                      ? "bg-orange-500 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  Light
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="flex flex-col gap-2">
              <span className="text-xs text-zinc-500">Preview:</span>
              <div className={`p-4 rounded-lg flex items-center justify-center ${
                theme === "dark" ? "bg-zinc-950" : "bg-white"
              }`}>
                <a
                  href={projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-80"
                >
                  <img
                    src={badgeUrl}
                    alt={`${projectTitle} - Featured on Builders.to`}
                    width={width}
                    height={height}
                  />
                </a>
              </div>
            </div>

            {/* Code */}
            <div className="flex flex-col gap-2">
              <span className="text-xs text-zinc-500">HTML Code:</span>
              <div className="relative">
                <pre className="bg-zinc-950 rounded-lg p-3 text-xs text-zinc-300 overflow-x-auto whitespace-pre-wrap break-all font-mono">
                  {embedCode}
                </pre>
                <button
                  onClick={copyToClipboard}
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  title={copied ? "Copied!" : "Copy to clipboard"}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-zinc-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Link to project - only show if not preview */}
            {!isPreview && (
              <a
                href={projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-orange-400 hover:text-orange-300 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                View your project page
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );
}
