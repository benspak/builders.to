import Link from "next/link";
import { Rocket } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
              <Rocket className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Builders<span className="text-orange-500">.to</span>
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <a
              href="https://x.com/i/communities/1943895831322439993"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              X Community
            </a>
            <a
              href="https://discord.com/invite/G7nmswWkbn"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Discord
            </a>
            <Link href="#" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-zinc-600">
          © {new Date().getFullYear()} Builders.to — Built with ❤️ by the {""}
          <Link href="https://popvia.com" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-400">PopVia</Link>
        </div>
      </div>
    </footer>
  );
}
