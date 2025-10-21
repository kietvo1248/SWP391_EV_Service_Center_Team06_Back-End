-- AlterTable
ALTER TABLE "service_centers" ADD COLUMN     "capacity_per_slot" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "closing_time" TEXT NOT NULL DEFAULT '17:00',
ADD COLUMN     "opening_time" TEXT NOT NULL DEFAULT '08:00',
ADD COLUMN     "slot_duration_minutes" INTEGER NOT NULL DEFAULT 60;
