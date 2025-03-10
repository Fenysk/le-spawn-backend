-- DropForeignKey
ALTER TABLE "GameCollectionItem" DROP CONSTRAINT "GameCollectionItem_gameId_fkey";

-- AlterTable
ALTER TABLE "GameCollectionItem" ALTER COLUMN "hasBox" SET DEFAULT false,
ALTER COLUMN "hasGame" SET DEFAULT false,
ALTER COLUMN "hasPaper" SET DEFAULT false,
ALTER COLUMN "gameId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "GameCollectionItem" ADD CONSTRAINT "GameCollectionItem_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
