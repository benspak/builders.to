-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'CUSTOM');

-- CreateTable
CREATE TABLE "Discount" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productUrl" TEXT NOT NULL,
    "discountType" "DiscountType" NOT NULL,
    "discountValue" TEXT NOT NULL,
    "couponCode" TEXT,
    "discountUrl" TEXT,
    "maxUses" INTEGER,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "claimCount" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountClaim" (
    "id" TEXT NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "DiscountClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountReport" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "DiscountReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Discount_slug_key" ON "Discount"("slug");

-- CreateIndex
CREATE INDEX "Discount_slug_idx" ON "Discount"("slug");

-- CreateIndex
CREATE INDEX "Discount_userId_idx" ON "Discount"("userId");

-- CreateIndex
CREATE INDEX "Discount_isActive_idx" ON "Discount"("isActive");

-- CreateIndex
CREATE INDEX "Discount_expiresAt_idx" ON "Discount"("expiresAt");

-- CreateIndex
CREATE INDEX "Discount_createdAt_idx" ON "Discount"("createdAt");

-- CreateIndex
CREATE INDEX "DiscountClaim_discountId_idx" ON "DiscountClaim"("discountId");

-- CreateIndex
CREATE INDEX "DiscountClaim_userId_idx" ON "DiscountClaim"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountClaim_discountId_userId_key" ON "DiscountClaim"("discountId", "userId");

-- CreateIndex
CREATE INDEX "DiscountReport_discountId_idx" ON "DiscountReport"("discountId");

-- CreateIndex
CREATE INDEX "DiscountReport_userId_idx" ON "DiscountReport"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountReport_discountId_userId_key" ON "DiscountReport"("discountId", "userId");

-- AddForeignKey
ALTER TABLE "Discount" ADD CONSTRAINT "Discount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountClaim" ADD CONSTRAINT "DiscountClaim_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountClaim" ADD CONSTRAINT "DiscountClaim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountReport" ADD CONSTRAINT "DiscountReport_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountReport" ADD CONSTRAINT "DiscountReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
