"use client";

import { useTheme } from "./theme-provider";
import { useState, useEffect } from "react";

export function ProductHuntBadge() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className="h-[54px] w-[250px]" />;
  }

  const badgeTheme = theme === "dark" ? "dark" : "light";

  return (
    <a
      href="https://www.producthunt.com/products/builders-to?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-builders-to"
      target="_blank"
      rel="noopener noreferrer"
      className="transition-opacity hover:opacity-80"
    >
      <img
        src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1057424&theme=${badgeTheme}`}
        alt="Builders.to — A social launch pad for solo founders | Product Hunt"
        width="250"
        height="54"
      />
    </a>
  );
}
