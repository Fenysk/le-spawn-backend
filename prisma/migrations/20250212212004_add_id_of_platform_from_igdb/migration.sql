/*
  Warnings:

  - A unique constraint covering the columns `[igdbPlatformId]` on the table `Platform` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Platform" ADD COLUMN     "igdbPlatformId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Platform_igdbPlatformId_key" ON "Platform"("igdbPlatformId");
