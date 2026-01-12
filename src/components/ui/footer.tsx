"use client";

import Link from "next/link";
import { Rocket } from "lucide-react";
import { ProductHuntBadge } from "./product-hunt-badge";

export function Footer() {
  return (
    <footer
      className="transition-colors duration-300"
      style={{
        background: "var(--background-secondary)",
        borderTop: "1px solid var(--card-border)"
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
              <Rocket className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
              Builders<span className="text-orange-500">.to</span>
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm" style={{ color: "var(--foreground-subtle)" }}>
            <a
              href="https://github.com/benspak/builders.to"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:opacity-80"
            >
              GitHub
            </a>
            <a
              href="https://x.com/i/communities/1943895831322439993"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:opacity-80"
            >
              X Community
            </a>
            <a
              href="https://discord.com/invite/G7nmswWkbn"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:opacity-80"
            >
              Discord
            </a>
            <Link href="/privacy" className="transition-colors hover:opacity-80">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:opacity-80">
              Terms
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <ProductHuntBadge />
          <a href="https://startupfa.me/s/buildersto?utm_source=builders.to" target="_blank" rel="noopener noreferrer">
            <img
              src="https://startupfa.me/badges/featured-badge-small.webp"
              alt="Builders.to - Featured on Startup Fame"
              width={224}
              height={36}
              className="opacity-80 hover:opacity-100 transition-opacity"
            />
          </a>
          <a href="https://turbo0.com/item/buildersto" target="_blank" rel="noopener noreferrer">
            <img
              src="https://img.turbo0.com/badge-listed-light.svg"
              alt="Listed on Turbo0"
              style={{ height: 54, width: "auto" }}
              className="opacity-80 hover:opacity-100 transition-opacity"
            />
          </a>
        </div>

        <div className="mt-6 text-center text-sm" style={{ color: "var(--foreground-subtle)" }}>
          © {new Date().getFullYear()} Builders.to — Built with ❤️ by{" "}
          <Link href="https://popvia.com" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-400">PopVia</Link>
        </div>
      </div>
    </footer>
  );
}
