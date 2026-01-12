'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Cute confused cat */}
        <div className="mb-8 animate-float">
          <svg className="w-48 h-48 mx-auto drop-shadow-2xl" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Cat body */}
            <ellipse cx="100" cy="130" rx="55" ry="45" fill="#3f3f46"/>

            {/* Cat head */}
            <circle cx="100" cy="85" r="45" fill="#52525b"/>

            {/* Left ear */}
            <path d="M60 55 L45 25 L75 45 Z" fill="#52525b"/>
            <path d="M63 52 L52 30 L72 46 Z" fill="#fca5a5"/>

            {/* Right ear */}
            <path d="M140 55 L155 25 L125 45 Z" fill="#52525b"/>
            <path d="M137 52 L148 30 L128 46 Z" fill="#fca5a5"/>

            {/* Face markings */}
            <ellipse cx="100" cy="95" rx="30" ry="25" fill="#71717a"/>

            {/* Eyes - wide/surprised look */}
            <circle cx="82" cy="78" r="10" fill="#fafafa"/>
            <circle cx="118" cy="78" r="10" fill="#fafafa"/>
            <circle cx="82" cy="78" r="5" fill="#18181b"/>
            <circle cx="118" cy="78" r="5" fill="#18181b"/>
            <circle cx="84" cy="76" r="2" fill="#fafafa"/>
            <circle cx="120" cy="76" r="2" fill="#fafafa"/>

            {/* Blush marks */}
            <ellipse cx="68" cy="90" rx="8" ry="5" fill="#fca5a5" opacity="0.6"/>
            <ellipse cx="132" cy="90" rx="8" ry="5" fill="#fca5a5" opacity="0.6"/>

            {/* Nose */}
            <ellipse cx="100" cy="95" rx="5" ry="4" fill="#fca5a5"/>

            {/* Mouth - surprised O shape */}
            <ellipse cx="100" cy="108" rx="6" ry="8" fill="#3f3f46"/>

            {/* Whiskers */}
            <line x1="65" y1="95" x2="45" y2="90" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="65" y1="100" x2="45" y2="102" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="135" y1="95" x2="155" y2="90" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="135" y1="100" x2="155" y2="102" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round"/>

            {/* Paws */}
            <ellipse cx="65" cy="160" rx="15" ry="12" fill="#52525b"/>
            <ellipse cx="135" cy="160" rx="15" ry="12" fill="#52525b"/>

            {/* Toe beans */}
            <circle cx="60" cy="165" r="4" fill="#71717a"/>
            <circle cx="70" cy="165" r="4" fill="#71717a"/>
            <circle cx="130" cy="165" r="4" fill="#71717a"/>
            <circle cx="140" cy="165" r="4" fill="#71717a"/>

            {/* Tail */}
            <path d="M45 140 Q20 130 25 160 Q30 175 45 170" stroke="#3f3f46" strokeWidth="12" strokeLinecap="round" fill="none"/>

            {/* Question marks */}
            <text x="150" y="50" fill="#f97316" fontSize="24" fontWeight="bold">?</text>
            <text x="45" y="45" fill="#f97316" fontSize="18" fontWeight="bold">?</text>
          </svg>
        </div>

        {/* Error badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full text-xs font-semibold text-rose-400 uppercase tracking-wide mb-6">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Something went wrong
        </div>

        {/* Text */}
        <h1 className="text-2xl md:text-3xl font-bold mb-3 gradient-text">
          Oops! A wild bug appeared!
        </h1>
        <p className="text-zinc-300 text-lg mb-2">Our cat is just as confused as you are 🐱</p>
        <p className="text-zinc-500 mb-8">
          Something unexpected happened. Don&apos;t worry, our team has been notified.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="btn-primary w-full sm:w-auto"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
              <path d="M16 21h5v-5"/>
            </svg>
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-800/50 border border-zinc-700/50 px-6 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all w-full sm:w-auto justify-center"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
