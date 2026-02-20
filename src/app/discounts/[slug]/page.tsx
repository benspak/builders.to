import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { DiscountDetail } from "@/components/discounts/discount-detail";
import type { Metadata } from "next";

interface DiscountPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: DiscountPageProps): Promise<Metadata> {
  const { slug } = await params;
  const discount = await prisma.discount.findUnique({
    where: { slug },
    select: { title: true, productName: true, discountValue: true, discountType: true },
  });

  if (!discount) return { title: "Discount Not Found" };

  const valueStr =
    discount.discountType === "PERCENTAGE"
      ? `${discount.discountValue}% off`
      : discount.discountType === "FIXED_AMOUNT"
        ? `$${discount.discountValue} off`
        : discount.discountValue;

  return {
    title: `${discount.title} | Builders Discounts`,
    description: `${valueStr} ${discount.productName} - exclusive discount for Builders members.`,
  };
}

export default async function DiscountLandingPage({
  params,
}: DiscountPageProps) {
  const { slug } = await params;

  const discount = await prisma.discount.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          displayName: true,
          image: true,
          slug: true,
          headline: true,
        },
      },
      _count: { select: { claims: true } },
    },
  });

  if (!discount) {
    notFound();
  }

  const session = await auth();
  let hasClaimed = false;

  if (session?.user?.id) {
    const claim = await prisma.discountClaim.findUnique({
      where: {
        discountId_userId: {
          discountId: discount.id,
          userId: session.user.id,
        },
      },
    });
    hasClaimed = !!claim;
  }

  const isOwner = session?.user?.id === discount.userId;
  const isAuthenticated = !!session?.user?.id;

  return (
    <div className="relative min-h-screen" style={{ background: "var(--background)" }}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/discounts"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Discounts
        </Link>

        <DiscountDetail
          discount={{
            ...discount,
            couponCode:
              hasClaimed || isOwner ? discount.couponCode : null,
            discountUrl:
              hasClaimed || isOwner ? discount.discountUrl : null,
            createdAt: discount.createdAt.toISOString(),
            expiresAt: discount.expiresAt?.toISOString() || null,
          }}
          hasClaimed={hasClaimed}
          isOwner={isOwner}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </div>
  );
}
