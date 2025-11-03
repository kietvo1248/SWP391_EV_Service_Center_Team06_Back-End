/*
  Warnings:

  - You are about to drop the column `user_code` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `make` on the `vehicles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[employee_code]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[license_plate]` on the table `vehicles` will be added. If there are existing duplicate values, this will fail.
  - Made the column `license_plate` on table `vehicles` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "public"."users_user_code_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "user_code",
ADD COLUMN     "employee_code" TEXT;

-- AlterTable
ALTER TABLE "vehicles" DROP COLUMN "make",
ADD COLUMN     "brand" TEXT NOT NULL DEFAULT 'VinFast',
ADD COLUMN     "color" TEXT,
ALTER COLUMN "license_plate" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_employee_code_key" ON "users"("employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_license_plate_key" ON "vehicles"("license_plate");
