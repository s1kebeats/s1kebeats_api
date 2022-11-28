/*
  Warnings:

  - A unique constraint covering the columns `[userId,beatId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_beatId_key" ON "Like"("userId", "beatId");
