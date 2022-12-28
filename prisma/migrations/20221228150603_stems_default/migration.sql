/*
  Warnings:

  - Made the column `stems` on table `Beat` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Beat" ALTER COLUMN "stems" SET NOT NULL,
ALTER COLUMN "stems" SET DEFAULT '';
