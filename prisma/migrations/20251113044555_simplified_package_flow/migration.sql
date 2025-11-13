/*
  Warnings:

  - The values [PENDING_APPROVAL] on the enum `AppointmentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [REQUESTED,CANCELLED] on the enum `PartUsageStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [DIAGNOSING,WAITING_APPROVAL,WAITING_PARTS,REPAIRING] on the enum `ServiceRecordStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `maintenance_recommendations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quotations` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `service_types` will be added. If there are existing duplicate values, this will fail.
  - Made the column `price` on table `service_types` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AppointmentStatus_new" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."service_appointments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "service_appointments" ALTER COLUMN "status" TYPE "AppointmentStatus_new" USING ("status"::text::"AppointmentStatus_new");
ALTER TYPE "AppointmentStatus" RENAME TO "AppointmentStatus_old";
ALTER TYPE "AppointmentStatus_new" RENAME TO "AppointmentStatus";
DROP TYPE "public"."AppointmentStatus_old";
ALTER TABLE "service_appointments" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PartUsageStatus_new" AS ENUM ('ISSUED');
ALTER TABLE "public"."part_usages" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "part_usages" ALTER COLUMN "status" TYPE "PartUsageStatus_new" USING ("status"::text::"PartUsageStatus_new");
ALTER TYPE "PartUsageStatus" RENAME TO "PartUsageStatus_old";
ALTER TYPE "PartUsageStatus_new" RENAME TO "PartUsageStatus";
DROP TYPE "public"."PartUsageStatus_old";
ALTER TABLE "part_usages" ALTER COLUMN "status" SET DEFAULT 'ISSUED';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ServiceRecordStatus_new" AS ENUM ('PENDING', 'QUALITY_CHECK', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."service_records" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "service_records" ALTER COLUMN "status" TYPE "ServiceRecordStatus_new" USING ("status"::text::"ServiceRecordStatus_new");
ALTER TYPE "ServiceRecordStatus" RENAME TO "ServiceRecordStatus_old";
ALTER TYPE "ServiceRecordStatus_new" RENAME TO "ServiceRecordStatus";
DROP TYPE "public"."ServiceRecordStatus_old";
ALTER TABLE "service_records" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."maintenance_recommendations" DROP CONSTRAINT "maintenance_recommendations_service_type_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."quotations" DROP CONSTRAINT "quotations_serviceRecordId_fkey";

-- AlterTable
ALTER TABLE "part_usages" ALTER COLUMN "status" SET DEFAULT 'ISSUED';

-- AlterTable
ALTER TABLE "service_types" ALTER COLUMN "price" SET NOT NULL;

-- DropTable
DROP TABLE "public"."maintenance_recommendations";

-- DropTable
DROP TABLE "public"."quotations";

-- CreateIndex
CREATE UNIQUE INDEX "service_types_name_key" ON "service_types"("name");
