/*
  Warnings:

  - The values [StatusUpdate,CustomEvent] on the enum `TimelineEventType` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `updatedAt` to the `TimelineEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TimelineEventType_new" AS ENUM ('APPLICATION_CREATED', 'STATUS_CHANGED', 'IMPORTANT_DATE', 'REMINDER_COMPLETED', 'MANUAL');
ALTER TABLE "TimelineEvent" ALTER COLUMN "type" TYPE "TimelineEventType_new" USING ("type"::text::"TimelineEventType_new");
ALTER TYPE "TimelineEventType" RENAME TO "TimelineEventType_old";
ALTER TYPE "TimelineEventType_new" RENAME TO "TimelineEventType";
DROP TYPE "public"."TimelineEventType_old";
COMMIT;

-- AlterTable
ALTER TABLE "TimelineEvent" ADD COLUMN     "sourceKey" "SourceKey",
ADD COLUMN     "status" "Status",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;
