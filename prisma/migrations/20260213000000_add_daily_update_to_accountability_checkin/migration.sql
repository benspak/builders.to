-- AlterTable
ALTER TABLE "AccountabilityCheckIn" ADD COLUMN "dailyUpdateId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AccountabilityCheckIn_dailyUpdateId_key" ON "AccountabilityCheckIn"("dailyUpdateId");

-- AddForeignKey
ALTER TABLE "AccountabilityCheckIn" ADD CONSTRAINT "AccountabilityCheckIn_dailyUpdateId_fkey" FOREIGN KEY ("dailyUpdateId") REFERENCES "DailyUpdate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
