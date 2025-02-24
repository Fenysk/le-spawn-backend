/*
  Warnings:

  - A unique constraint covering the columns `[name,abbreviation]` on the table `Region` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Region_name_abbreviation_key" ON "Region"("name", "abbreviation");
