-- CreateTable
CREATE TABLE "GameLocalization" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "coverUrl" TEXT,
    "regionId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,

    CONSTRAINT "GameLocalization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameLocalization_id_key" ON "GameLocalization"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Region_id_key" ON "Region"("id");

-- AddForeignKey
ALTER TABLE "GameLocalization" ADD CONSTRAINT "GameLocalization_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameLocalization" ADD CONSTRAINT "GameLocalization_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
