/*
  Warnings:

  - Added the required column `unit_price` to the `restock_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "restock_requests" ADD COLUMN     "unit_price" DECIMAL(12,2) NOT NULL;
