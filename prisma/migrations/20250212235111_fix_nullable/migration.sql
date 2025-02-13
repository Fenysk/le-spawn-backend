/*
  Warnings:

  - Made the column `userId` on table `Collection` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gameId` on table `GameCollectionItem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `collectionId` on table `GameCollectionItem` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "GameCollectionItem" DROP CONSTRAINT "GameCollectionItem_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "GameCollectionItem" DROP CONSTRAINT "GameCollectionItem_gameId_fkey";

-- AlterTable
ALTER TABLE "Collection" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "GameCollectionItem" ALTER COLUMN "gameId" SET NOT NULL,
ALTER COLUMN "collectionId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "GameCollectionItem" ADD CONSTRAINT "GameCollectionItem_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameCollectionItem" ADD CONSTRAINT "GameCollectionItem_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
