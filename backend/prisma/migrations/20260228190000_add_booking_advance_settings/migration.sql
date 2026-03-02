-- AlterTable
ALTER TABLE "professional_settings" ADD COLUMN "minBookingAdvanceHours" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "professional_settings" ADD COLUMN "maxBookingAdvanceDays" INTEGER NOT NULL DEFAULT 60;
