"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Company {
  id: string;
  name: string;
  slug?: string | null;
  logo?: string | null;
}

interface UserNameWithCompanyProps {
  /** The display name to show */
  name: string;
  /** User's profile slug for linking */
  slug?: string | null;
  /** User's first company (if they have one with a logo) */
  company?: Company | null;
  /** Additional CSS classes */
  className?: string;
  /** Whether the name should be a link to the user's profile */
  linkToProfile?: boolean;
  /** Size of the company logo in pixels (default: 16) */
  logoSize?: number;
}

/**
 * Displays a username with an optional company logo beside it.
 * The logo links to the company page, while the name links to the user's profile.
 */
export function UserNameWithCompany({
  name,
  slug,
  company,
  className,
  linkToProfile = true,
  logoSize = 16,
}: UserNameWithCompanyProps) {
  const showCompanyLogo = company?.logo;

  const nameElement = (
    <span className={cn("font-medium text-white transition-colors", className)}>
      {name}
    </span>
  );

  return (
    <span className="inline-flex items-center gap-1.5">
      {linkToProfile && slug ? (
        <Link
          href={`/${slug}`}
          className="font-medium text-white hover:text-orange-400 transition-colors"
        >
          {name}
        </Link>
      ) : (
        nameElement
      )}
      {showCompanyLogo && (
        <Link
          href={`/companies/${company.slug || company.id}`}
          className="flex-shrink-0 hover:opacity-80 transition-opacity"
          title={company.name}
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={company.logo!}
            alt={company.name}
            width={logoSize}
            height={logoSize}
            className="rounded-sm object-cover"
            style={{ width: logoSize, height: logoSize }}
          />
        </Link>
      )}
    </span>
  );
}
