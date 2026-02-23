"use client";

import Link from "next/link";
import Image from "next/image";
import { User, Clock } from "lucide-react";
import { cn, getServiceCategoryLabel, getServiceCategoryColor } from "@/lib/utils";

export interface ServiceListingCard {
  id: string;
  slug: string | null;
  title: string;
  description: string;
  category: string;
  priceInCents: number;
  deliveryDays: number;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    slug: string | null;
  };
  portfolioProjects?: {
    project: {
      id: string;
      slug: string | null;
      title: string;
      imageUrl: string | null;
    };
  }[];
  _count?: { orders: number };
}

interface ServiceCardProps {
  service: ServiceListingCard;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function ServiceCard({ service }: ServiceCardProps) {
  const href = `/services/${service.slug || service.id}`;
  const firstProjectImage = service.portfolioProjects?.[0]?.project?.imageUrl;

  return (
    <Link href={href} className="block h-full">
      <div className="card card-hover group relative flex flex-col overflow-hidden min-h-[320px] w-full max-w-full h-full">
        {/* Optional project image from portfolio */}
        {firstProjectImage && (
          <div className="relative w-full aspect-video overflow-hidden">
            <Image
              src={firstProjectImage}
              alt=""
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}

        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-start justify-between gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border shrink-0",
                getServiceCategoryColor(service.category)
              )}
            >
              {getServiceCategoryLabel(service.category)}
            </span>
          </div>

          <Link href={href} className="block mt-3 group/title">
            <h3 className="text-lg font-semibold text-white truncate group-hover/title:text-violet-400 transition-colors">
              {service.title}
            </h3>
          </Link>
          <p className="mt-2 text-sm text-zinc-400 line-clamp-2">
            {service.description}
          </p>

          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="font-semibold text-white">
              {formatPrice(service.priceInCents)}
            </span>
            <span className="flex items-center gap-1 text-zinc-500">
              <Clock className="h-3.5 w-3.5" />
              {service.deliveryDays} day{service.deliveryDays !== 1 ? "s" : ""} delivery
            </span>
          </div>

          <div className="mt-auto pt-6 flex items-center justify-between border-t border-white/5">
            <div className="flex items-center gap-2 min-w-0">
              {service.user.image ? (
                <Image
                  src={service.user.image}
                  alt={service.user.name || "Builder"}
                  width={24}
                  height={24}
                  className="rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-700 shrink-0">
                  <User className="h-3 w-3 text-zinc-400" />
                </div>
              )}
              <span className="text-sm text-zinc-400 truncate">
                {service.user.name || "Builder"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
