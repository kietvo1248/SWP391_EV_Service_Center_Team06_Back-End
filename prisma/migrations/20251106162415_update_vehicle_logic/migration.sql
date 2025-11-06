/*
  Warnings:

  - You are about to drop the `vehicles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."service_appointments" DROP CONSTRAINT "service_appointments_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."vehicles" DROP CONSTRAINT "vehicles_ownerId_fkey";

-- DropTable
DROP TABLE "public"."vehicles";

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "vehicleModelId" TEXT NOT NULL,
    "licensePlate" TEXT,
    "color" TEXT,
    "batteryId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleModel" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "VehicleModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatteryType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacityKwh" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "BatteryType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BatteryTypeToVehicleModel" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BatteryTypeToVehicleModel_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vin_key" ON "Vehicle"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_licensePlate_key" ON "Vehicle"("licensePlate");

-- CreateIndex
CREATE INDEX "Vehicle_ownerId_isDeleted_idx" ON "Vehicle"("ownerId", "isDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "BatteryType_name_key" ON "BatteryType"("name");

-- CreateIndex
CREATE INDEX "_BatteryTypeToVehicleModel_B_index" ON "_BatteryTypeToVehicleModel"("B");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_vehicleModelId_fkey" FOREIGN KEY ("vehicleModelId") REFERENCES "VehicleModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_batteryId_fkey" FOREIGN KEY ("batteryId") REFERENCES "BatteryType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_appointments" ADD CONSTRAINT "service_appointments_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BatteryTypeToVehicleModel" ADD CONSTRAINT "_BatteryTypeToVehicleModel_A_fkey" FOREIGN KEY ("A") REFERENCES "BatteryType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BatteryTypeToVehicleModel" ADD CONSTRAINT "_BatteryTypeToVehicleModel_B_fkey" FOREIGN KEY ("B") REFERENCES "VehicleModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
