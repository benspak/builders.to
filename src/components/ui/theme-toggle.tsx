"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "./theme-provider";

// Dynamically import the animated component to avoid SSR issues with Motion
const AnimatedToggle = dynamic(() => import("./theme-toggle-animated"), {
  ssr: false,
  loading: () => (
    <div 
      className="h-6 w-11 rounded-full animate-pulse" 
      style={{ background: "var(--background-tertiary)" }}
    />
  ),
});

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show placeholder during SSR
  if (!mounted) {
    return (
      <div 
        className="h-6 w-11 rounded-full animate-pulse" 
        style={{ background: "var(--background-tertiary)" }}
      />
    );
  }

  return <AnimatedToggle theme={theme} toggleTheme={toggleTheme} />;
}
