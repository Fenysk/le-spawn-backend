/*
  Warnings:

  - A unique constraint covering the columns `[gameId,collectionId]` on the table `GameCollectionItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "GameCollectionItem" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "GameCollectionItem_gameId_collectionId_key" ON "GameCollectionItem"("gameId", "collectionId");
