-- CreateTable
CREATE TABLE "LifetimeMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LifetimeMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LifetimeMember_userId_key" ON "LifetimeMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LifetimeMember_stripeSessionId_key" ON "LifetimeMember"("stripeSessionId");

-- CreateIndex
CREATE INDEX "LifetimeMember_userId_idx" ON "LifetimeMember"("userId");

-- AddForeignKey
ALTER TABLE "LifetimeMember" ADD CONSTRAINT "LifetimeMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
