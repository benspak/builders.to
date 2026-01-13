"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Gift, X, CheckCircle } from "lucide-react";

export function GiftSuccessToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);

  useEffect(() => {
    const gift = searchParams.get("gift");
    const tokens = searchParams.get("tokens");

    if (gift === "success" && tokens) {
      setMessage(`🎉 You gifted ${tokens} tokens successfully!`);
      setIsSuccess(true);
      setVisible(true);
    } else if (gift === "cancelled") {
      setMessage("Gift was cancelled");
      setIsSuccess(false);
      setVisible(true);
    }

    // Clear the URL params after showing the toast
    if (gift) {
      const timer = setTimeout(() => {
        router.replace(pathname, { scroll: false });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router, pathname]);

  const handleClose = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${
          isSuccess
            ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
            : "bg-zinc-800/90 border-zinc-700/50 text-zinc-300"
        }`}
      >
        {isSuccess ? (
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
        ) : (
          <Gift className="h-5 w-5 flex-shrink-0" />
        )}
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={handleClose}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
