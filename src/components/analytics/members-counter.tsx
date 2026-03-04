import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";

function formatCount(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toLocaleString();
}

export async function MembersCounter() {
  const total = await prisma.user.count();

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-4">
      <div className="flex items-center gap-2 mb-2">
        <Users className="h-4 w-4 text-amber-400 shrink-0" />
        <span className="text-sm font-semibold text-white">
          {formatCount(total)} members
        </span>
      </div>
      <p className="text-xs text-zinc-400">
        Our goal: 1 million members by 2050
      </p>
    </div>
  );
}
