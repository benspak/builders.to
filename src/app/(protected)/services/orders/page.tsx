import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, Loader2, User, Clock, DollarSign, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { ServiceOrderStatus } from "@prisma/client";
import { OrderActions } from "@/components/services/order-actions";

export const metadata = {
  title: "Service Orders - Builders.to",
  description: "Manage orders for your services",
};

export const dynamic = "force-dynamic";

const statusLabels: Record<ServiceOrderStatus, string> = {
  PENDING_ACCEPTANCE: "Pending",
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

async function OrdersList() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const orders = await prisma.serviceOrder.findMany({
    where: {
      service: { userId: session.user.id },
    },
    orderBy: { createdAt: "desc" },
    include: {
      service: {
        select: {
          id: true,
          title: true,
          slug: true,
          priceInCents: true,
        },
      },
      buyer: {
        select: {
          id: true,
          name: true,
          displayName: true,
          firstName: true,
          lastName: true,
          image: true,
          slug: true,
          email: true,
        },
      },
    },
  });

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <Package className="h-8 w-8 text-amber-500/60" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No Orders Yet</h3>
        <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
          Once buyers purchase your services, orders will appear here.
        </p>
        <Link
          href="/services/seller"
          className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300"
        >
          View your listings
          <ArrowRight className="h-4 w-4" />
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
        const buyerName =
          order.buyer.displayName ||
          (order.buyer.firstName && order.buyer.lastName
            ? `${order.buyer.firstName} ${order.buyer.lastName}`
            : null) ||
          order.buyer.name ||
          "Buyer";

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

              {/* Buyer Info */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 mb-4">
                {order.buyer.image ? (
                  <Image
                    src={order.buyer.image}
                    alt={buyerName}
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
                  <Link
                    href={`/${order.buyer.slug}`}
                    className="font-medium text-white hover:text-amber-400 transition-colors"
                  >
                    {buyerName}
                  </Link>
                  {order.buyer.email && (
                    <p className="text-xs text-zinc-500">{order.buyer.email}</p>
                  )}
                </div>
              </div>

              {/* Requirements */}
              {order.requirements && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-zinc-500 uppercase mb-2">
                    Requirements
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
                isSeller={true}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function SellerOrdersPage() {
  return (
    <div className="relative min-h-screen bg-zinc-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Service Orders</h1>
              <p className="text-zinc-400 text-sm">
                Manage orders from buyers
              </p>
            </div>
          </div>

          <Link
            href="/services/seller"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-300 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors"
          >
            Seller Dashboard
          </Link>
        </div>

        {/* Orders List */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          }
        >
          <OrdersList />
        </Suspense>
      </div>
    </div>
  );
}
