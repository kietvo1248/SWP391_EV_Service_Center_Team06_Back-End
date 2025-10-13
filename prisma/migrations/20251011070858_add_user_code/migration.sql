/*
  Warnings:

  - A unique constraint covering the columns `[user_code]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "user_code" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_user_code_key" ON "users"("user_code");
