/*
  Warnings:

  - Added the required column `thumbnailPath` to the `Resume` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnailStatus` to the `Resume` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "thumbnailPath" TEXT NOT NULL,
ADD COLUMN     "thumbnailStatus" TEXT NOT NULL;
