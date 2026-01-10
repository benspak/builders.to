"use client";

import Link from "next/link";
import Image from "next/image";
import { Store, User, DollarSign, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ServiceCategory } from "@prisma/client";

interface FeaturedService {
  id: string;
  slug: string | null;
  title: string;
  description: string;
  category: ServiceCategory;
  priceInCents: number;
  deliveryDays: number;
  user: {
    id: string;
    name: string | null;
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
    slug: string | null;
  };
}

interface FeaturedServicesProps {
  services: FeaturedService[];
}

const categoryLabels: Record<ServiceCategory, string> = {
  MVP_BUILD: "MVP Build",
  DESIGN: "Design",
  MARKETING: "Marketing",
  AI_INTEGRATION: "AI Integration",
  DEVOPS: "DevOps",
  AUDIT: "Audit",
  OTHER: "Other",
};

const categoryColors: Record<ServiceCategory, string> = {
  MVP_BUILD: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  DESIGN: "bg-pink-500/10 text-pink-400 border-pink-500/30",
  MARKETING: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  AI_INTEGRATION: "bg-violet-500/10 text-violet-400 border-violet-500/30",
  DEVOPS: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  AUDIT: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  OTHER: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
};

export function FeaturedServices({ services }: FeaturedServicesProps) {
  if (services.length === 0) {
    return null;
  }

  const getDisplayName = (user: FeaturedService["user"]) => {
    if (user.displayName) return user.displayName;
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.name || "Builder";
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 bg-zinc-900/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
            <Store className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Services</h3>
            <p className="text-[10px] text-zinc-500">Hire verified builders</p>
          </div>
        </div>
        <Link
          href="/services"
          className="text-[10px] text-amber-400 hover:text-amber-300 transition-colors"
        >
          View all →
        </Link>
      </div>

      {/* Services List */}
      <div className="divide-y divide-zinc-800/30">
        {services.map((service) => {
          const serviceUrl = `/services/${service.slug || service.id}`;

          return (
            <Link
              key={service.id}
              href={serviceUrl}
              className="block px-4 py-3 hover:bg-zinc-800/30 transition-colors group"
            >
              {/* Category Badge */}
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border mb-2",
                  categoryColors[service.category]
                )}
              >
                {categoryLabels[service.category]}
              </span>

              {/* Title */}
              <h4 className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors line-clamp-1 mb-2">
                {service.title}
              </h4>

              {/* Builder Info */}
              <div className="flex items-center gap-2 mb-2">
                {service.user.image ? (
                  <Image
                    src={service.user.image}
                    alt={getDisplayName(service.user)}
                    width={20}
                    height={20}
                    className="rounded-full ring-1 ring-zinc-700"
                  />
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 ring-1 ring-zinc-700">
                    <User className="h-3 w-3 text-zinc-500" />
                  </div>
                )}
                <span className="text-[11px] text-zinc-500 truncate">
                  {getDisplayName(service.user)}
                </span>
              </div>

              {/* Price and Delivery */}
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <DollarSign className="h-3 w-3" />
                  {formatPrice(service.priceInCents)}
                </span>
                <span className="flex items-center gap-1 text-zinc-500">
                  <Clock className="h-3 w-3" />
                  {service.deliveryDays}d
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
