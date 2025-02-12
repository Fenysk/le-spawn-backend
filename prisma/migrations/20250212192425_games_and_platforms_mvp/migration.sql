/*
  Warnings:

  - The primary key for the `Game` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `Game` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[igdbGameId]` on the table `Game` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstReleaseDate` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storyline` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `summary` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GameCategoryEnum" AS ENUM ('mainGame', 'dlcAddon', 'expansion', 'bundle', 'standaloneExpansion', 'mod', 'episode', 'season', 'remake', 'remaster', 'expandedGame', 'port', 'fork', 'pack', 'update');

-- AlterTable
ALTER TABLE "Game" DROP CONSTRAINT "Game_pkey",
ADD COLUMN     "category" "GameCategoryEnum" NOT NULL,
ADD COLUMN     "coverUrl" TEXT,
ADD COLUMN     "firstReleaseDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "franchises" TEXT[],
ADD COLUMN     "genres" TEXT[],
ADD COLUMN     "igdbGameId" INTEGER,
ADD COLUMN     "screenshotsUrl" TEXT[],
ADD COLUMN     "storyline" TEXT NOT NULL,
ADD COLUMN     "summary" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Game_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Game_id_seq";

-- CreateTable
CREATE TABLE "Platform" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "generation" INTEGER,

    CONSTRAINT "Platform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManyGamePlatform" (
    "gameId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,

    CONSTRAINT "ManyGamePlatform_pkey" PRIMARY KEY ("gameId","platformId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Platform_id_key" ON "Platform"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ManyGamePlatform_gameId_platformId_key" ON "ManyGamePlatform"("gameId", "platformId");

-- CreateIndex
CREATE UNIQUE INDEX "Game_id_key" ON "Game"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Game_igdbGameId_key" ON "Game"("igdbGameId");

-- AddForeignKey
ALTER TABLE "ManyGamePlatform" ADD CONSTRAINT "ManyGamePlatform_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManyGamePlatform" ADD CONSTRAINT "ManyGamePlatform_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
