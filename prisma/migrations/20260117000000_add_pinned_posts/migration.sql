-- CreateTable
CREATE TABLE "PinnedPost" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "updateId" TEXT NOT NULL,

    CONSTRAINT "PinnedPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PinnedPost_userId_idx" ON "PinnedPost"("userId");

-- CreateIndex
CREATE INDEX "PinnedPost_updateId_idx" ON "PinnedPost"("updateId");

-- CreateIndex
CREATE UNIQUE INDEX "PinnedPost_userId_updateId_key" ON "PinnedPost"("userId", "updateId");

-- AddForeignKey
ALTER TABLE "PinnedPost" ADD CONSTRAINT "PinnedPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PinnedPost" ADD CONSTRAINT "PinnedPost_updateId_fkey" FOREIGN KEY ("updateId") REFERENCES "DailyUpdate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
