-- CreateEnum
CREATE TYPE "RestockRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PartUsageStatus" AS ENUM ('REQUESTED', 'ISSUED', 'CANCELLED');

-- AlterTable
ALTER TABLE "part_usages" ADD COLUMN     "status" "PartUsageStatus" NOT NULL DEFAULT 'REQUESTED';

-- CreateTable
CREATE TABLE "restock_requests" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "notes" TEXT,
    "status" "RestockRequestStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3),
    "partId" TEXT NOT NULL,
    "inventoryManagerId" TEXT NOT NULL,
    "serviceCenterId" TEXT NOT NULL,
    "adminId" TEXT,

    CONSTRAINT "restock_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "restock_requests" ADD CONSTRAINT "restock_requests_partId_fkey" FOREIGN KEY ("partId") REFERENCES "parts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restock_requests" ADD CONSTRAINT "restock_requests_inventoryManagerId_fkey" FOREIGN KEY ("inventoryManagerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restock_requests" ADD CONSTRAINT "restock_requests_serviceCenterId_fkey" FOREIGN KEY ("serviceCenterId") REFERENCES "service_centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restock_requests" ADD CONSTRAINT "restock_requests_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
