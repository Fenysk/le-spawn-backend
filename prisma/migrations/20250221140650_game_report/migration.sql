-- CreateEnum
CREATE TYPE "GameReportStatus" AS ENUM ('pending', 'inProgress', 'resolved', 'rejected');

-- CreateTable
CREATE TABLE "GameReport" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "GameReportStatus" NOT NULL DEFAULT 'pending',
    "explication" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,

    CONSTRAINT "GameReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameReport_id_key" ON "GameReport"("id");

-- AddForeignKey
ALTER TABLE "GameReport" ADD CONSTRAINT "GameReport_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameReport" ADD CONSTRAINT "GameReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
