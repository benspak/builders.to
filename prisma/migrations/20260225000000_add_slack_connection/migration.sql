-- CreateTable
CREATE TABLE "SlackConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slackTeamId" TEXT NOT NULL,
    "slackUserId" TEXT NOT NULL,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SlackConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SlackConnection_userId_key" ON "SlackConnection"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SlackConnection_slackTeamId_slackUserId_key" ON "SlackConnection"("slackTeamId", "slackUserId");

-- CreateIndex
CREATE INDEX "SlackConnection_userId_idx" ON "SlackConnection"("userId");

-- CreateIndex
CREATE INDEX "SlackConnection_slackTeamId_slackUserId_idx" ON "SlackConnection"("slackTeamId", "slackUserId");

-- AddForeignKey
ALTER TABLE "SlackConnection" ADD CONSTRAINT "SlackConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
