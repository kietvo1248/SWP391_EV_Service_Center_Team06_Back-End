/*
  Warnings:

  - The values [QUALITY_CHECK] on the enum `ServiceRecordStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ServiceRecordStatus_new" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."service_records" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "service_records" ALTER COLUMN "status" TYPE "ServiceRecordStatus_new" USING ("status"::text::"ServiceRecordStatus_new");
ALTER TYPE "ServiceRecordStatus" RENAME TO "ServiceRecordStatus_old";
ALTER TYPE "ServiceRecordStatus_new" RENAME TO "ServiceRecordStatus";
DROP TYPE "public"."ServiceRecordStatus_old";
ALTER TABLE "service_records" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
