/*
  Warnings:

  - Added the required column `source` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Source" AS ENUM ('COMPANY_WEBSITE', 'JOB_SEARCH_PLATFORM', 'REFERRAL', 'SCHOOL_PORTAL', 'CAREER_FAIR', 'COMMUNITY_SOCIAL_MEDIA', 'NETWORKING', 'RECRUITER_OUTREACH', 'OTHER');

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "source",
ADD COLUMN     "source" "Source" NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "settings" SET DEFAULT '{"eventReminderDays":[3,1,0],"appliedFollowUpDays":7,"assessmentFollowUpDays":7,"interviewFollowUpDays":7}';
