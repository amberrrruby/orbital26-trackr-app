/*
  Warnings:

  - Added the required column `eventDate` to the `TimelineEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TimelineEvent" ADD COLUMN     "eventDate" TIMESTAMP(3) NOT NULL;
