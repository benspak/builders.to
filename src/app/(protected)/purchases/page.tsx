import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Loader2, User, ArrowRight, Store } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { ServiceOrderStatus } from "@prisma/client";
import { OrderActions } from "@/components/services/order-actions";

export const metadata = {
  title: "My Purchases - Builders.to",
  description: "View and manage your service purchases",
};

export const dynamic = "force-dynamic";

const statusLabels: Record<ServiceOrderStatus, string> = {
  PENDING_ACCEPTANCE: "Pending Seller",
  ACCEPTED: "Accepted",
  IN_PROGRESS: "In Progress",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  DISPUTED: "Disputed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

const statusColors: Record<ServiceOrderStatus, string> = {
  PENDING_ACCEPTANCE: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  ACCEPTED: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  IN_PROGRESS: "bg-violet-500/10 text-violet-400 border-violet-500/30",
  DELIVERED: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  DISPUTED: "bg-red-500/10 text-red-400 border-red-500/30",
  CANCELLED: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
  REFUNDED: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
};

async function PurchasesList() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const orders = await prisma.serviceOrder.findMany({
    where: { buyerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      service: {
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          user: {
            select: {
              id: true,
              name: true,
              displayName: true,
              firstName: true,
              lastName: true,
              image: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-violet-500/10 flex items-center justify-center">
          <ShoppingBag className="h-8 w-8 text-violet-500/60" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No Purchases Yet</h3>
        <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
          Browse the marketplace to find services from verified builders.
        </p>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-zinc-900 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 transition-all"
        >
          <Store className="h-4 w-4" />
          Browse Services
        </Link>
      </div>
    );
  }

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const sellerName =
          order.service.user.displayName ||
          (order.service.user.firstName && order.service.user.lastName
            ? `${order.service.user.firstName} ${order.service.user.lastName}`
            : null) ||
          order.service.user.name ||
          "Seller";

        return (
          <div
            key={order.id}
            className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
                        statusColors[order.status]
                      )}
                    >
                      {statusLabels[order.status]}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <Link
                    href={`/services/${order.service.slug || order.service.id}`}
                    className="font-medium text-white hover:text-amber-400 transition-colors"
                  >
                    {order.service.title}
                  </Link>
                </div>
                <span className="text-lg font-bold text-emerald-400">
                  {formatPrice(order.priceInCents)}
                </span>
              </div>

              {/* Seller Info */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 mb-4">
                {order.service.user.image ? (
                  <Image
                    src={order.service.user.image}
                    alt={sellerName}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-500 mb-0.5">Seller</p>
                  <Link
                    href={`/${order.service.user.slug}`}
                    className="font-medium text-white hover:text-amber-400 transition-colors"
                  >
                    {sellerName}
                  </Link>
                </div>
                <Link
                  href={`/${order.service.user.slug}`}
                  className="text-xs text-amber-400 hover:text-amber-300"
                >
                  View Profile
                </Link>
              </div>

              {/* Requirements (what you submitted) */}
              {order.requirements && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-zinc-500 uppercase mb-2">
                    Your Requirements
                  </h4>
                  <p className="text-sm text-zinc-300 bg-zinc-800/50 p-3 rounded-lg">
                    {order.requirements}
                  </p>
                </div>
              )}

              {/* Actions */}
              <OrderActions
                orderId={order.id}
                status={order.status}
                isSeller={false}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function PurchasesPage() {
  return (
    <div className="relative min-h-screen bg-zinc-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">My Purchases</h1>
              <p className="text-zinc-400 text-sm">
                Track your service orders
              </p>
            </div>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-zinc-900 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 transition-all"
          >
            <Store className="h-4 w-4" />
            Browse Services
          </Link>
        </div>

        {/* Purchases List */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
          }
        >
          <PurchasesList />
        </Suspense>
      </div>
    </div>
  );
}
