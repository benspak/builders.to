"use client";

import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";

interface TokensClientProps {
  code?: string;
  link?: string;
  /** Pre-fill apply code from URL (e.g. ?ref=xxx) */
  initialApplyCode?: string | null;
}

export function TokensClient({ code: initialCode, link: initialLink, initialApplyCode }: TokensClientProps) {
  const [code, setCode] = useState(initialCode ?? null);
  const [link, setLink] = useState(initialLink ?? null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(!initialCode && !initialLink);
  const [applyCode, setApplyCode] = useState(initialApplyCode ?? "");
  const [applyStatus, setApplyStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [applyMessage, setApplyMessage] = useState("");

  useEffect(() => {
    if (initialCode && initialLink) return;
    let cancelled = false;
    fetch("/api/referral")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (!cancelled && data) {
          setCode(data.code ?? null);
          setLink(data.link ?? null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [initialCode, initialLink]);

  const handleCopy = async () => {
    const base = typeof window !== "undefined" ? window.location.origin : "https://builders.to";
    const toCopy = link || (code ? `${base}/signin?ref=${code}` : "");
    if (!toCopy) return;
    try {
      await navigator.clipboard.writeText(toCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  if (loading) {
    return <div className="h-10 rounded-lg bg-zinc-800 animate-pulse" />;
  }

  if (!link && !code) {
    return <p className="text-sm text-zinc-500">Unable to load referral link.</p>;
  }

  const handleApply = async () => {
    const trimmed = applyCode.trim();
    if (!trimmed) return;
    setApplyStatus("loading");
    setApplyMessage("");
    try {
      const res = await fetch("/api/referral/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await res.json();
      if (res.ok) {
        setApplyStatus("success");
        setApplyMessage(`You and your referrer earned tokens!`);
        setApplyCode("");
      } else {
        setApplyStatus("error");
        setApplyMessage(data.error || "Failed to apply code");
      }
    } catch {
      setApplyStatus("error");
      setApplyMessage("Failed to apply code");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          readOnly
          value={link || `https://builders.to/signin?ref=${code}`}
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-300"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy link
            </>
          )}
        </button>
      </div>

      <div className="pt-3 border-t border-white/5">
        <p className="text-sm text-zinc-400 mb-2">Have a referral code? Apply it to earn tokens.</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={applyCode}
            onChange={(e) => setApplyCode(e.target.value)}
            placeholder="Enter code"
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-white placeholder:text-zinc-500"
          />
          <button
            type="button"
            onClick={handleApply}
            disabled={applyStatus === "loading" || !applyCode.trim()}
            className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/20 disabled:opacity-50"
          >
            {applyStatus === "loading" ? "Applying..." : "Apply"}
          </button>
        </div>
        {applyStatus === "success" && <p className="text-sm text-emerald-400 mt-2">{applyMessage}</p>}
        {applyStatus === "error" && <p className="text-sm text-red-400 mt-2">{applyMessage}</p>}
      </div>
    </div>
  );
}
