-- AlterTable
ALTER TABLE "EmailPreferences" ADD COLUMN "accountabilityReminders" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "EmailPreferences" ADD COLUMN "lastAccountabilityReminderSentAt" TIMESTAMP(3);
