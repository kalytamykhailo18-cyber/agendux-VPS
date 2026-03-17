-- AlterTable
ALTER TABLE "scheduled_reminders" ADD COLUMN "twilioMessageSid" TEXT;

-- CreateIndex
CREATE INDEX "scheduled_reminders_twilioMessageSid_idx" ON "scheduled_reminders"("twilioMessageSid");
