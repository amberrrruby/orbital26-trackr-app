/*
  Warnings:

  - You are about to drop the column `resumeUrl` on the `Application` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('EVENT', 'FOLLOW_UP');

-- CreateEnum
CREATE TYPE "TimelineEventType" AS ENUM ('StatusUpdate', 'CustomEvent');

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "resumeUrl",
ADD COLUMN     "interviewRound" INTEGER,
ADD COLUMN     "resumeId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "settings" JSONB;

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tags" TEXT[],
    "notes" TEXT,
    "resumeUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "type" "ReminderType" NOT NULL,
    "remindAt" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL,
    "type" "TimelineEventType" NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "applicationId" TEXT NOT NULL,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
