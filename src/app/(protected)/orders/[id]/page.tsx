import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Coins } from "lucide-react";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: OrderPageProps) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    notFound();
  }

  const order = await prisma.serviceOrder.findUnique({
    where: { id },
    include: {
      service: {
        include: {
          user: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
      buyer: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  if (!order) notFound();

  const isBuyer = order.buyerId === session.user.id;
  const isSeller = order.service.userId === session.user.id;
  if (!isBuyer && !isSeller) notFound();

  const service = order.service;
  const seller = service?.user;
  const statusLabels: Record<string, string> = {
    PENDING_ACCEPTANCE: "Pending acceptance",
    ACCEPTED: "Accepted",
    DELIVERED: "Delivered",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };
  const statusLabel = statusLabels[order.status] ?? order.status;

  return (
    <div className="relative min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href={isBuyer ? "/services" : "/services"}
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to services
        </Link>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Coins className="h-5 w-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">Order: {service?.title}</h1>
          </div>
          <p className="text-sm text-zinc-400 mb-4">
            Status: <span className="text-white font-medium">{statusLabel}</span>
          </p>
          <p className="text-sm text-zinc-400">
            Paid with tokens. {isBuyer ? "The seller will accept and deliver." : "Accept the order and deliver when ready."}
          </p>
          {seller?.slug && (
            <Link
              href={`/${seller.slug}`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-amber-400 hover:underline"
            >
              View {isBuyer ? "seller" : "buyer"} profile
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
