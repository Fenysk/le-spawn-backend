-- CreateTable
CREATE TABLE "GameCollectionItem" (
    "id" TEXT NOT NULL,
    "hasBox" BOOLEAN NOT NULL,
    "hasGame" BOOLEAN NOT NULL,
    "hasPaper" BOOLEAN NOT NULL,
    "stateBox" TEXT,
    "stateGame" TEXT,
    "statePaper" TEXT,
    "gameId" TEXT,

    CONSTRAINT "GameCollectionItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameCollectionItem_id_key" ON "GameCollectionItem"("id");

-- AddForeignKey
ALTER TABLE "GameCollectionItem" ADD CONSTRAINT "GameCollectionItem_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
