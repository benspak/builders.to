-- CreateTable
CREATE TABLE "ProjectView" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "visitorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectClick" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "visitorId" TEXT,
    "clickType" TEXT NOT NULL DEFAULT 'url',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UpdateView" (
    "id" TEXT NOT NULL,
    "updateId" TEXT NOT NULL,
    "visitorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UpdateView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalListingView" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "visitorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocalListingView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalListingClick" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "visitorId" TEXT,
    "clickType" TEXT NOT NULL DEFAULT 'contact',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocalListingClick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectView_projectId_idx" ON "ProjectView"("projectId");
CREATE INDEX "ProjectView_createdAt_idx" ON "ProjectView"("createdAt");
CREATE INDEX "ProjectView_projectId_visitorId_idx" ON "ProjectView"("projectId", "visitorId");

-- CreateIndex
CREATE INDEX "ProjectClick_projectId_idx" ON "ProjectClick"("projectId");
CREATE INDEX "ProjectClick_createdAt_idx" ON "ProjectClick"("createdAt");

-- CreateIndex
CREATE INDEX "UpdateView_updateId_idx" ON "UpdateView"("updateId");
CREATE INDEX "UpdateView_createdAt_idx" ON "UpdateView"("createdAt");
CREATE INDEX "UpdateView_updateId_visitorId_idx" ON "UpdateView"("updateId", "visitorId");

-- CreateIndex
CREATE INDEX "LocalListingView_listingId_idx" ON "LocalListingView"("listingId");
CREATE INDEX "LocalListingView_createdAt_idx" ON "LocalListingView"("createdAt");
CREATE INDEX "LocalListingView_listingId_visitorId_idx" ON "LocalListingView"("listingId", "visitorId");

-- CreateIndex
CREATE INDEX "LocalListingClick_listingId_idx" ON "LocalListingClick"("listingId");
CREATE INDEX "LocalListingClick_createdAt_idx" ON "LocalListingClick"("createdAt");

-- AddForeignKey
ALTER TABLE "ProjectView" ADD CONSTRAINT "ProjectView_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectClick" ADD CONSTRAINT "ProjectClick_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpdateView" ADD CONSTRAINT "UpdateView_updateId_fkey" FOREIGN KEY ("updateId") REFERENCES "DailyUpdate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalListingView" ADD CONSTRAINT "LocalListingView_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "LocalListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalListingClick" ADD CONSTRAINT "LocalListingClick_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "LocalListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
