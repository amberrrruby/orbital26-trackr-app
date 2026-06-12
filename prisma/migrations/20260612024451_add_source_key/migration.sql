/*
  Warnings:

  - Added the required column `source` to the `Reminder` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SourceKey" AS ENUM ('DATE_APPLIED', 'OA_ASSESSMENT_DATE', 'INTERVIEW_DATE', 'OFFER_EXPIRY_DATE');

-- AlterTable
ALTER TABLE "Reminder" ADD COLUMN     "source" "SourceKey" NOT NULL,
ALTER COLUMN "applicationId" DROP NOT NULL;
