/*
  Warnings:

  - You are about to drop the column `instagramLink` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `vkLink` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `youtubeLink` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "instagramLink",
DROP COLUMN "vkLink",
DROP COLUMN "youtubeLink",
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "vk" TEXT,
ADD COLUMN     "youtube" TEXT;
