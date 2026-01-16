-- CreateEnum
CREATE TYPE "LocalListingOrderStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED', 'REFUNDED');

-- CreateTable
CREATE TABLE "LocalListingOrder" (
    "id" TEXT NOT NULL,
    "status" "LocalListingOrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "notes" TEXT,
    "priceInCents" INTEGER NOT NULL,
    "platformFeeInCents" INTEGER,
    "stripePaymentIntent" TEXT,
    "listingId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3),
    "shippedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalListingOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LocalListingOrder_stripePaymentIntent_key" ON "LocalListingOrder"("stripePaymentIntent");

-- CreateIndex
CREATE INDEX "LocalListingOrder_listingId_idx" ON "LocalListingOrder"("listingId");

-- CreateIndex
CREATE INDEX "LocalListingOrder_buyerId_idx" ON "LocalListingOrder"("buyerId");

-- CreateIndex
CREATE INDEX "LocalListingOrder_status_idx" ON "LocalListingOrder"("status");

-- AddForeignKey
ALTER TABLE "LocalListingOrder" ADD CONSTRAINT "LocalListingOrder_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "LocalListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalListingOrder" ADD CONSTRAINT "LocalListingOrder_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
