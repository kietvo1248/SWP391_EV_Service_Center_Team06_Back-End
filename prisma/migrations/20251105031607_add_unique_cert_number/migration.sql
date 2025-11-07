/*
  Warnings:

  - A unique constraint covering the columns `[certificate_number]` on the table `staff_certifications` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `certificate_number` to the `staff_certifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "staff_certifications" ADD COLUMN     "certificate_number" TEXT NOT NULL,
ADD COLUMN     "issue_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "staff_certifications_certificate_number_key" ON "staff_certifications"("certificate_number");
