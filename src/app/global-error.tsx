'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Oops! | Builders.to</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>{`
          :root {
            --background: #09090b;
            --background-secondary: #18181b;
            --foreground: #fafafa;
            --foreground-muted: #a1a1aa;
            --accent-orange: #f97316;
            --card-bg: rgba(24, 24, 27, 0.7);
            --card-border: rgba(255, 255, 255, 0.1);
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Outfit', system-ui, sans-serif;
            background: var(--background);
            color: var(--foreground);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 24px;
            overflow: hidden;
            position: relative;
          }

          .bg-grid {
            position: fixed;
            inset: 0;
            background-image:
              linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
            background-size: 64px 64px;
            pointer-events: none;
          }

          .glow-orb {
            position: fixed;
            border-radius: 50%;
            filter: blur(100px);
            opacity: 0.4;
            pointer-events: none;
            animation: float 8s ease-in-out infinite;
          }

          .glow-orb-1 {
            width: 400px;
            height: 400px;
            background: var(--accent-orange);
            top: -200px;
            right: -100px;
          }

          .glow-orb-2 {
            width: 300px;
            height: 300px;
            background: #06b6d4;
            bottom: -150px;
            left: -100px;
            animation-delay: 2s;
          }

          @keyframes float {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-30px) scale(1.05); }
          }

          .container {
            position: relative;
            z-index: 10;
            text-align: center;
            max-width: 480px;
            animation: fadeSlideUp 0.8s ease-out;
          }

          @keyframes fadeSlideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .cat-container {
            margin-bottom: 32px;
            animation: catBounce 3s ease-in-out infinite;
          }

          @keyframes catBounce {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-8px) rotate(-2deg); }
            75% { transform: translateY(-8px) rotate(2deg); }
          }

          .cat-svg {
            width: 180px;
            height: 180px;
            filter: drop-shadow(0 20px 40px rgba(249, 115, 22, 0.3));
          }

          h1 {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 12px;
            background: linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fbbf24 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .subtitle {
            font-size: 1.125rem;
            color: var(--foreground);
            margin-bottom: 8px;
            font-weight: 500;
          }

          .description {
            color: var(--foreground-muted);
            font-size: 1rem;
            line-height: 1.6;
            margin-bottom: 32px;
          }

          .btn-group {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          @media (min-width: 400px) {
            .btn-group {
              flex-direction: row;
              justify-content: center;
            }
          }

          .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 14px 28px;
            font-size: 1rem;
            font-weight: 600;
            border-radius: 12px;
            text-decoration: none;
            transition: all 0.2s ease;
            cursor: pointer;
            border: none;
            font-family: inherit;
          }

          .btn-primary {
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
            color: white;
            box-shadow: 0 10px 30px -10px rgba(249, 115, 22, 0.5);
          }

          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 40px -10px rgba(249, 115, 22, 0.6);
          }

          .btn-secondary {
            background: var(--card-bg);
            color: var(--foreground-muted);
            border: 1px solid var(--card-border);
            backdrop-filter: blur(8px);
          }

          .btn-secondary:hover {
            color: var(--foreground);
            border-color: rgba(255, 255, 255, 0.2);
            background: var(--background-secondary);
          }

          .error-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background: rgba(244, 63, 94, 0.1);
            border: 1px solid rgba(244, 63, 94, 0.2);
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            color: #f43f5e;
            margin-bottom: 24px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
        `}</style>
      </head>
      <body>
        <div className="bg-grid"></div>
        <div className="glow-orb glow-orb-1"></div>
        <div className="glow-orb glow-orb-2"></div>

        <div className="container">
          <div className="cat-container">
            {/* Confused/surprised cat */}
            <svg className="cat-svg" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
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

          <span className="error-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Something went wrong
          </span>

          <h1>Oops! A wild bug appeared!</h1>
          <p className="subtitle">Our cat is just as confused as you are 🐱</p>
          <p className="description">
            Something unexpected happened. Don&apos;t worry, our team has been notified and is working on it.
          </p>

          <div className="btn-group">
            <button className="btn btn-primary" onClick={() => reset()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                <path d="M16 21h5v-5"/>
              </svg>
              Try Again
            </button>
            <a href="/" className="btn btn-secondary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
