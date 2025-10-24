/*
  Warnings:

  - The `status` column on the `service_records` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `certifications` on the `technician_profiles` table. All the data in the column will be lost.
  - Added the required column `appointmentId` to the `feedback` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ServiceRecordStatus" AS ENUM ('PENDING', 'DIAGNOSING', 'WAITING_APPROVAL', 'WAITING_PARTS', 'REPAIRING', 'QUALITY_CHECK', 'COMPLETED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "AppointmentStatus" ADD VALUE 'PENDING_APPROVAL';

-- DropForeignKey
ALTER TABLE "public"."appointment_services" DROP CONSTRAINT "appointment_services_appointment_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."appointment_services" DROP CONSTRAINT "appointment_services_service_type_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."feedback" DROP CONSTRAINT "feedback_customerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."inventory_items" DROP CONSTRAINT "inventory_items_serviceCenterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_senderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."notifications" DROP CONSTRAINT "notifications_recipientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."part_usages" DROP CONSTRAINT "part_usages_serviceRecordId_fkey";

-- DropForeignKey
ALTER TABLE "public"."payments" DROP CONSTRAINT "payments_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."quotations" DROP CONSTRAINT "quotations_serviceRecordId_fkey";

-- DropForeignKey
ALTER TABLE "public"."service_packages" DROP CONSTRAINT "service_packages_customerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."service_records" DROP CONSTRAINT "service_records_appointmentId_fkey";

-- AlterTable
ALTER TABLE "feedback" ADD COLUMN     "appointmentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "quotations" ALTER COLUMN "creation_date" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "reports" ALTER COLUMN "generated_date" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "service_records" DROP COLUMN "status",
ADD COLUMN     "status" "ServiceRecordStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "technician_profiles" DROP COLUMN "certifications";

-- AddForeignKey
ALTER TABLE "appointment_services" ADD CONSTRAINT "appointment_services_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "service_appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_services" ADD CONSTRAINT "appointment_services_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "service_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_records" ADD CONSTRAINT "service_records_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "service_appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_serviceCenterId_fkey" FOREIGN KEY ("serviceCenterId") REFERENCES "service_centers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "part_usages" ADD CONSTRAINT "part_usages_serviceRecordId_fkey" FOREIGN KEY ("serviceRecordId") REFERENCES "service_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_serviceRecordId_fkey" FOREIGN KEY ("serviceRecordId") REFERENCES "service_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "service_appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_packages" ADD CONSTRAINT "service_packages_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
