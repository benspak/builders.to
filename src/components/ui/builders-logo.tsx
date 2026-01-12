"use client";

interface BuildersLogoProps {
  size?: number;
  className?: string;
}

export function BuildersLogo({ size = 36, className = "" }: BuildersLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="builderGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>
      </defs>

      {/* Base rounded square background */}
      <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#builderGradient)" />

      {/* Stacked blocks forming building shape */}
      {/* Bottom block - widest, foundation */}
      <rect x="9" y="26" width="22" height="6" rx="1.5" fill="white" opacity="1" />

      {/* Middle block */}
      <rect x="9" y="18" width="17" height="6" rx="1.5" fill="white" opacity="0.9" />

      {/* Top block - narrowest */}
      <rect x="9" y="10" width="12" height="6" rx="1.5" fill="white" opacity="0.8" />

      {/* Accent dot - represents destination/completion */}
      <circle cx="28" cy="13" r="3" fill="white" opacity="0.95" />
    </svg>
  );
}

export function BuildersLogoIcon({ size = 32, className = "" }: BuildersLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="iconGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>
      </defs>

      {/* Circular background for compact icon */}
      <circle cx="16" cy="16" r="15" fill="url(#iconGradient)" />

      {/* Stacked blocks */}
      <rect x="7" y="20" width="18" height="4.5" rx="1" fill="white" />
      <rect x="7" y="14" width="13" height="4.5" rx="1" fill="white" opacity="0.9" />
      <rect x="7" y="8" width="8" height="4.5" rx="1" fill="white" opacity="0.8" />

      {/* Accent dot */}
      <circle cx="22" cy="10.5" r="2.5" fill="white" opacity="0.95" />
    </svg>
  );
}
